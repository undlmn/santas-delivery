import {
  Application,
  Assets,
  BaseTexture,
  extensions,
  ExtensionType,
  LoaderParserPriority,
  SCALE_MODES,
  settings,
  Sprite,
  Texture,
  utils,
} from "pixi.js";
import { gsap } from "gsap";

class App extends Application {
  constructor({
    fitIn,
    pixelated,
    assetsBasePath,
    audioVolume = 0.4,
    ...opts
  }) {
    super(opts);

    fitIn && fit(fitIn, this.view);

    if (pixelated) {
      BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;
      this.view.style.imageRendering = "pixelated";
    }

    if (assetsBasePath) {
      Assets.resolver.basePath = assetsBasePath;
    }
    settings.STRICT_TEXTURE_CACHE = true; // preload required

    this.scene = new SceneManager(this);
    this.events = new utils.EventEmitter();
    this.keyboard = new Keyboard();
    this.state = {};

    const audioContext = (this.audioContext = new AudioContext());
    const audioOut = (this.audioOut = audioContext.createGain());
    audioOut.connect(audioContext.destination);
    audioOut.gain.value = audioVolume;
    connectMute(this.state, audioOut.gain);
    registerSoundLoader(audioContext);
    this.playSample = audioPlayer(audioContext, audioOut);

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState == "hidden") {
        audioContext.suspend();
      } else {
        audioContext.resume();
      }
    });
  }
}

function fit(target, { width, height, style }) {
  style.display = "block";
  const ratio = height / width;
  const resize = () => {
    width = target.clientWidth ?? target.innerWidth;
    height = target.clientHeight ?? target.innerHeight;
    if (height / width > ratio) {
      style.width = `${width}px`;
      style.height = "auto";
      style.margin = `${Math.floor((height - width * ratio) / 2)}px 0 0 0`;
    } else {
      style.width = "auto";
      style.height = `${height}px`;
      style.margin = `0 0 0 ${Math.floor((width - height / ratio) / 2)}px`;
    }
  };
  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("orientationchange", resize);
}

class SceneManager {
  constructor({ screen, stage }) {
    const blackFrame = Sprite.from(Texture.WHITE);
    blackFrame.tint = 0;
    blackFrame.width = screen.width;
    blackFrame.height = screen.height;

    let currentBackground;
    let currentScene;
    let nextScene;

    const change = (scene) => {
      if (nextScene) {
        nextScene = scene;
      } else {
        if (currentScene) {
          nextScene = scene;
          if (!stage.children.includes(blackFrame)) {
            blackFrame.alpha = 0;
            stage.addChild(blackFrame);
          }
          gsap.killTweensOf(blackFrame);
          gsap.to(blackFrame, {
            alpha: 1,
            duration: 0.15 * (1 - blackFrame.alpha),
            onComplete: () => {
              stage.removeChild(currentScene);
              currentScene.emit("dismount");
              currentScene = null;
              scene = nextScene;
              nextScene = null;
              change(scene);
            },
          });
        } else {
          currentScene = scene;
          scene.emit("mount");
          blackFrame.alpha = 1;
          stage.addChild(scene, blackFrame);
          gsap.killTweensOf(blackFrame);
          gsap.to(blackFrame, {
            alpha: 0,
            duration: 1,
            onComplete: () => stage.removeChild(blackFrame),
          });
        }
      }
    };

    this.change = change;

    Object.defineProperties(this, {
      current: { get: () => currentScene },

      background: {
        get: () => currentBackground,
        set: (background) => {
          if (currentBackground != background) {
            if (currentBackground) {
              stage.removeChild(currentBackground);
              currentBackground.emit("dismount");
            }
            if (background) {
              background.emit("mount");
              stage.addChildAt(background, 0);
            }
            currentBackground = background;
          }
        },
      },
    });
  }
}

class Keyboard extends utils.EventEmitter {
  constructor() {
    super();
    const state = new Set();

    document.addEventListener("keydown", (event) => {
      const { code, repeat } = event;
      if (!repeat) {
        state.add(code);
        this.emit(code, event);
        this.emit("any", event);
      }
    });
    document.addEventListener("keyup", ({ code }) => state.delete(code));

    this.isPressed = (key) => state.has(key);
  }
}

function connectMute(state, gain) {
  let mute = localStorage.getItem("mute") != null;
  let lastVolume = gain.value;
  if (mute) {
    gain.value = 0;
  }
  Object.defineProperties(state, {
    mute: {
      get: () => mute,
      set: (value) => {
        if (mute == !value) {
          if (value) {
            localStorage.setItem("mute", "");
            lastVolume = gain.value;
            gain.value = 0;
            mute = true;
          } else {
            localStorage.removeItem("mute");
            gain.value = lastVolume;
            mute = false;
          }
        }
      },
    },
  });
}

function registerSoundLoader(audioContext) {
  const exts = "ogg oga opus m4a mp3 mpeg wav aiff wma mid caf".split(" ");
  const supported = {};
  const audioNode = document.createElement("audio");
  exts.forEach((ext) => {
    supported[ext] = !!audioNode
      .canPlayType(`audio/${ext}`)
      .replace(/^no$/, "");
  });

  extensions.add({
    extension: ExtensionType.Asset,
    detection: {
      test: async () => true,
      add: async (formats) => [
        ...formats,
        ...exts.filter((ext) => supported[ext]),
      ],
    },
    loader: {
      extension: {
        type: [ExtensionType.LoadParser],
        priority: LoaderParserPriority.High,
      },
      test(url) {
        const ext = utils.path.extname(url).slice(1);
        return supported[ext];
      },
      async load(url) {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`error on load ${url}`);
        }
        return await audioContext.decodeAudioData(await response.arrayBuffer());
      },
    },
  });
}

function audioPlayer(audioContext, destination) {
  return async (url) => {
    if (audioContext.state != "running") {
      await Promise.race([
        audioContext.resume(),
        new Promise((resolve) => setTimeout(resolve, 300)),
      ]);
    }
    const source = audioContext.createBufferSource();
    source.buffer = Assets.cache.get(url);
    source.connect(destination);
    source.start();
  };
}

export default App;
