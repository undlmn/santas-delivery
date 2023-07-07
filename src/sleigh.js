import { Sprite } from "pixi.js";
import { gsap } from "gsap";
import { SpriteSheet } from "/tools.js";
import { Animation } from "/tools.js";

const SPRITE_SHEET = "sleigh.png";

class Sleigh extends Sprite {
  static assets = [SPRITE_SHEET];

  constructor({ screen }, playground) {
    const spriteSheet = new SpriteSheet(SPRITE_SHEET, {
      frameWidth: 48,
      frameHeight: 24,
      border: 2,
      shape: 2,
    });
    const texture = spriteSheet.Texture(0);
    super(texture);

    this.anchor.set(0.5, 2 / 3);
    this.scale.set(1 / 16);

    let turnedLeft;
    const animation = new Animation(
      {
        run: [1, 100, 2, 100, 3, 100, 4, 100, 5, 100, 6, 100, 7, 100],
      },
      (frameId) => (texture.frameId = turnedLeft ? frameId + 8 : frameId)
    );

    this.set = (x, y, l, a = 0) => {
      gsap.killTweensOf(this);
      animation.stop();
      this.x = x;
      this.y = y;
      this.alpha = a;
      turnedLeft = l;
      texture.frameId = turnedLeft ? 8 : 0;
      playground.addChild(this);
    };

    this.show = () => {
      gsap.to(this, {
        alpha: 1,
        duration: 0.3,
      });
    };

    this.ready = () => {
      texture.frameId = turnedLeft ? 15 : 7;
    };

    this.go = async (speed = 1) => {
      animation.start("run");
      const to = [
        (screen.width - playground.x) / playground.scale.x + 2,
        -playground.x / playground.scale.x - 2,
      ][+turnedLeft];
      await gsap.to(this, {
        x: to,
        ease: "sine.in",
        duration: (Math.abs(this.x - to) * 0.1) / speed,
      });
      this.remove();
    };

    this.remove = () => {
      gsap.killTweensOf(this);
      animation.stop();
      playground.removeChild(this);
    };

    Object.defineProperties(this, {
      turnedLeft: { get: () => turnedLeft },
    });
  }
}

export default Sleigh;
