import { Sprite } from "pixi.js";
import { gsap } from "gsap";
import { Animation } from "/tools.js";

const SAMPLE_COLLISION = "snowball-collision.mp3";
const SAMPLE_OUT = "out.mp3";
const SAMPLE_MELT = "melt.mp3";

const axis = (direction) => (direction % 2 ? "x" : "y");
const sign = (direction) => (direction == 1 || direction == 2 ? "+" : "-");

class Snowball extends Sprite {
  static assets = [SAMPLE_COLLISION, SAMPLE_OUT, SAMPLE_MELT];

  constructor({ screen, playSample }, playground, spriteSheet) {
    const texture = spriteSheet.Texture(53);
    super(texture);

    this.anchor.set(0.5);
    this.scale.set(1 / 16);

    const animation = new Animation(
      {
        idle: [53],
        melt: [
          54, 100, 55, 100, 56, 100, 57, 100, 58, 100, 59, 100, 60, 100, 1,
        ],
      },
      (frameId) => (texture.frameId = frameId)
    );

    this.set = (x, y) => {
      this.active = true;
      gsap.killTweensOf(this);
      this.angle = 0;
      this.x = x;
      this.y = y;
      animation.start("idle");
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

    this.melt = async () => {
      this.active = false;
      playSample(SAMPLE_MELT);
      await animation.start("melt");
      this.remove();
    };

    this.remove = () => {
      this.active = false;
      gsap.killTweensOf(this);
      playground.removeChild(this);
    };
  }
}

export default Snowball;
