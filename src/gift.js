import { Sprite } from "pixi.js";
import { gsap } from "gsap";
import { Animation } from "/tools.js";

const SAMPLE_COLLISION = "gift-collision.mp3";
const SAMPLE_PUT = "put.mp3";
const SAMPLE_OUT = "out.mp3";
const SAMPLE_BURN = "burn.mp3";

const axis = (direction) => (direction % 2 ? "x" : "y");
const sign = (direction) => (direction == 1 || direction == 2 ? "+" : "-");

class Gift extends Sprite {
  static assets = [SAMPLE_COLLISION, SAMPLE_PUT, SAMPLE_OUT, SAMPLE_BURN];

  constructor({ screen, playSample }, playground, spriteSheet, index = 0) {
    const texture = spriteSheet.Texture(35 + (index % 7));
    super(texture);

    this.anchor.set(0.5);
    this.scale.set(1 / 16);

    const animation = new Animation(
      {
        burn: [
          42, 50, 43, 50, 42, 50, 18, 100, 19, 100, 20, 100, 21, 100, 22, 100,
          1,
        ],
      },
      (frameId) => (texture.frameId = frameId)
    );

    this.set = (x, y, i = index) => {
      this.active = true;
      gsap.killTweensOf(this);
      gsap.killTweensOf(this.scale);
      animation.stop();
      texture.frameId = 35 + (i % 7);
      this.scale.set(1 / 16);
      this.angle = 0;
      this.x = x;
      this.y = y;
      playground.addChild(this);
    };

    this.move = async (direction, steps) => {
      await gsap.to(this, {
        [axis(direction)]: sign(direction) + "=" + steps,
        ease: "none",
        duration: steps * 0.075,
      });
    };

    this.collision = () => {
      playSample(SAMPLE_COLLISION);
    };

    this.put = async (direction) => {
      this.active = false;
      playSample(SAMPLE_PUT);
      gsap.to(this.scale, {
        x: 1 / 12,
        y: 1 / 12,
        yoyo: true,
        repeat: 1,
        ease: "sine.inOut",
        duration: 0.1,
      });
      gsap.to(this, {
        [axis(direction)]: sign(direction) + "=" + 1,
        ease: "none",
        duration: 0.2,
        onComplete: this.remove,
      });
      await gsap.to(this, { duration: 0.1 });
    };

    this.out = async (direction) => {
      this.active = false;
      playSample(SAMPLE_OUT);
      gsap.to(this, {
        angle: "+=360",
        ease: "none",
        repeat: -1,
        duration: 1.2,
      });
      const to = [
        -playground.y / playground.scale.y - 1,
        (screen.width - playground.x) / playground.scale.x + 1,
        (screen.height - playground.y) / playground.scale.y + 1,
        -playground.x / playground.scale.x - 1,
      ][direction];
      await gsap.to(this, {
        [axis(direction)]: to,
        ease: "none",
        duration: Math.abs(this[axis(direction)] - to) * 0.075,
      });
      this.remove();
    };

    this.burn = async () => {
      this.active = false;
      playSample(SAMPLE_BURN);
      await animation.start("burn");
      this.remove();
    };

    this.remove = () => {
      this.active = false;
      animation.stop();
      gsap.killTweensOf(this);
      gsap.killTweensOf(this.scale);
      playground.removeChild(this);
    };
  }
}

export default Gift;
