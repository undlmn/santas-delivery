/*
Original game
https://plays.org/game/santas-delivery/

Graphics
https://opengameart.org/content/holiday-expansion-set

Music
https://opengameart.org/content/napping-on-a-cloud
*/

// 20: oql52k

import App from "/app.js";
import Loader from "/loader.js";
import Music from "/music.js";
import Background from "/background.js";
import Intro from "/intro.js";
import Level from "/level.js";
import Select from "/select.js";
import Credits from "/credits.js";
import End from "/end.js";
import MAP from "/map.js";

const app = new App({
  width: 320,
  height: 180,
  resolution: 6,
  fitIn: window,
  pixelated: true,
  assetsBasePath: "media",
});
document.body.appendChild(app.view);

const { events, scene, state } = app;

connectCleared(state);

const getInstance = singletons(app);

const loader = getInstance(Loader);
loader.load(
  [Music, Background, Intro, Level, Select, Credits, End]
    .map((m) => m.assets)
    .flat()
);

events.on("ready", () => {
  scene.background = getInstance(Background);
  events.emit("home");
});

events.on("home", () => {
  getInstance(Music).play();
  getInstance(Background).start();
  scene.change(getInstance(Intro));
});

events.on("start", (level) => {
  if (level == null) {
    level = state.current;
  }
  if (level && level > state.cleared + 1) {
    level = 0;
  }
  if (!level && !state.cleared) {
    level = 1;
  }
  if (level) {
    if (level > MAP.length) {
      scene.change(getInstance(End));
    } else {
      state.current = level;
      scene.change(getInstance(Level));
    }
  } else {
    scene.change(getInstance(Select));
  }
});

events.on("select", () => scene.change(getInstance(Select)));

events.on("credits", () => scene.change(getInstance(Credits)));

function connectCleared(state) {
  const hash = (str) => {
    str = "Santa's Delivery" + str;
    let n = 5381;
    for (let i = str.length; i--; n = (n * 33) ^ str.charCodeAt(i));
    return (16796160 + (((n % 43670016) + 43670016) % 43670016)).toString(36);
  };
  Object.defineProperties(state, {
    cleared: {
      get: () => {
        const data = localStorage.getItem("cleared");
        if (data) {
          const level = parseInt(data.slice(5), 36);
          if (hash(level) == data.slice(0, 5)) {
            return level;
          }
        }
        return 0;
      },
      set: (level) => {
        if (level) {
          localStorage.setItem("cleared", hash(level) + level.toString(36));
        } else {
          localStorage.removeItem("cleared");
        }
      },
    },
  });
}

function singletons(...args) {
  const instances = new Map();
  return (Class) => {
    if (instances.has(Class)) {
      return instances.get(Class);
    } else {
      const instance = new Class(...args);
      instances.set(Class, instance);
      return instance;
    }
  };
}
