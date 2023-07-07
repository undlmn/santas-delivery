import {
  BaseTexture,
  Rectangle,
  settings,
  Sprite,
  Texture,
  Ticker,
  UPDATE_PRIORITY,
  utils,
} from "pixi.js";

/**
 * const animation = new Animation(
 *   {
 *     name: [frameId, durationMS, frameId, durationMS, ...],
 *     ...
 *   },
 *   (frameId) => {...}
 * );
 * animation.start(name)
 *
 * * durationMS = 0 (or nullish/false) -> stop with event "complete",
 * * otherwise loop with events "repeat"
 */
export class Animation extends utils.EventEmitter {
  constructor(animations, onFrame) {
    super();

    let currentName;
    let currentFrame;
    let completed;
    let index;
    let duration;
    let timer;
    let resolver;

    const update = () => {
      timer += Ticker.shared.elapsedMS;
      let frame = currentFrame;
      while (timer > duration) {
        timer -= duration;
        index = (index + 2) % animations[currentName].length;
        index || this.emit("repeat", currentName);
        frame = animations[currentName][index];
        duration = animations[currentName][index + 1];
        if (!duration) {
          Ticker.shared.remove(update);
          completed = true;
          break;
        }
      }
      if (currentFrame != frame) {
        currentFrame = frame;
        onFrame && onFrame(currentFrame, currentName);
        this.emit("frame", currentFrame, currentName);
      }
      completed && this.emit("complete", currentName);
    };

    this.start = (name) => {
      stop();

      currentName = name;
      completed = false;
      resolver = null;
      index = 0;
      let frame = animations[currentName][index];
      duration = animations[currentName][index + 1];
      if (duration) {
        timer = 0;
        Ticker.shared.add(update);
      } else {
        completed = true;
      }
      if (currentFrame != frame) {
        currentFrame = frame;
        onFrame && onFrame(currentFrame, currentName);
        this.emit("frame", currentFrame, currentName);
      }
      completed && this.emit("complete", currentName);

      return this;
    };

    const stop = (this.stop = () => {
      duration && Ticker.shared.remove(update);
      duration = 0;
      if (resolver) {
        this.off("complete", resolver);
        this.off("repeat", resolver);
      }
    });

    this.resume = () => {
      if (!duration) {
        duration = animations[currentName][index + 1];
        if (duration) {
          timer = 0;
          Ticker.shared.add(update);
          if (resolver) {
            this.on("complete", resolver);
            this.on("repeat", resolver);
          }
        }
      }
    };

    this.then = (fn) =>
      completed
        ? Promise.resolve(fn(currentName))
        : new Promise((resolve) => {
            resolver = (name) => {
              this.off("complete", resolver);
              this.off("repeat", resolver);
              resolver = null;
              resolve(fn(name));
            };
            this.on("complete", resolver);
            this.on("repeat", resolver);
          });

    this.destroy = () => {
      stop();
      this.removeAllListeners();
      animations = currentName = null;
      completed = true;
    };

    Object.defineProperties(this, {
      current: { get: () => currentName },
    });
  }
}

export class SpriteSheet {
  constructor(
    url,
    {
      frameWidth,
      frameHeight,
      cols,
      rows,
      offsetX = 0,
      offsetY = 0,
      border = 0,
      shape = 0,
      inner = 0,
      byColumns,
      firstId = 0,
    }
  ) {
    const baseTexture = BaseTexture.from(url);

    offsetX += border + inner;
    offsetY += border + inner;
    shape += 2 * inner;
    const colWidth = frameWidth + shape;
    const rowHeight = frameHeight + shape;
    if (!cols) {
      cols = Math.floor(
        (baseTexture.width - offsetX - inner - border + shape) / colWidth
      );
    }
    if (!rows) {
      rows = Math.floor(
        (baseTexture.height - offsetY - inner - border + shape) / rowHeight
      );
    }

    const moveFrame = (frame, frameId) => {
      const frameNumber = frameId - firstId;
      if (byColumns) {
        frame.x = offsetX + Math.floor(frameNumber / rows) * colWidth;
        frame.y = offsetY + (frameNumber % rows) * rowHeight;
      } else {
        frame.x = offsetX + (frameNumber % cols) * colWidth;
        frame.y = offsetY + Math.floor(frameNumber / cols) * rowHeight;
      }
    };

    this.Texture = (frameId = firstId) => {
      const frame = new Rectangle(offsetX, offsetY, frameWidth, frameHeight);
      moveFrame(frame, frameId);

      const texture = new Texture(baseTexture, frame);

      Object.defineProperty(texture, "frameId", {
        get() {
          return frameId;
        },
        set(value) {
          if (frameId != value) {
            moveFrame(frame, (frameId = value));
            texture.frame = frame;
          }
        },
      });

      return texture;
    };

    this.TiledTexture = (cols, data) => {
      const canvas = settings.ADAPTER.createCanvas(
        frameWidth * cols,
        frameHeight * Math.ceil(data.length / cols)
      );
      const context = canvas.getContext("2d");

      const frame = new Rectangle(offsetX, offsetY, frameWidth, frameHeight);

      data.forEach((frameId, i) => {
        if (frameId >= firstId) {
          moveFrame(frame, frameId);
          context.drawImage(
            baseTexture.resource.source,
            frame.x,
            frame.y,
            frameWidth,
            frameHeight,
            (i % cols) * frameWidth,
            Math.floor(i / cols) * frameHeight,
            frameWidth,
            frameHeight
          );
        }
      });

      return new Texture(BaseTexture.from(canvas));
    };
  }
}
