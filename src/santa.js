import { Sprite } from "pixi.js";
import { gsap } from "gsap";
import { Animation } from "/tools.js";

const SAMPLE_COLLISION = "santa-collision.mp3";
const SAMPLE_OUT = "out.mp3";
const SAMPLE_BURN = "burn.mp3";

const axis = (direction) => (direction % 2 ? "x" : "y");
const sign = (direction) => (direction == 1 || direction == 2 ? "+" : "-");

class Santa extends Sprite {
  static assets = [SAMPLE_COLLISION, SAMPLE_OUT, SAMPLE_BURN];

  constructor({ screen, playSample }, playground, spriteSheet) {
    const texture = spriteSheet.Texture(11);
    super(texture);

    this.anchor.set(0.5);
    this.scale.set(1 / 16);

    let turnedLeft;
    const animation = new Animation(
      {
        idle: [11, 200, 12, 100, 13, 100],
        run: [14, 100, 11, 100, 15, 100, 11, 100],
        burn: [
          16, 50, 17, 50, 16, 50, 18, 100, 19, 100, 20, 100, 21, 100, 22, 100,
          1,
        ],
      },
      (frameId) =>
        (texture.frameId = turnedLeft && frameId > 1 ? frameId + 12 : frameId)
    );

    this.set = (x, y, l) => {
      gsap.killTweensOf(this);
      this.angle = 0;
      this.x = x;
      this.y = y;
      turnedLeft = l;
      texture.frameId = turnedLeft ? 23 : 11;
      animation.start("idle");
      playground.addChild(this);
    };

    this.go = async (direction, steps) => {
      turnedLeft = direction == 1 ? false : direction == 3 ? true : turnedLeft;
      animation.start("run");
      await gsap.to(this, {
        [axis(direction)]: sign(direction) + "=" + steps,
        ease: "none",
        duration: steps * 0.1,
      });
      animation.start("idle");
    };

    this.collision = () => {
      playSample(SAMPLE_COLLISION);
    };

    this.out = async (direction) => {
      playSample(SAMPLE_OUT);
      animation.stop();
      texture.frameId = turnedLeft ? 23 : 11;
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
        duration: Math.abs(this[axis(direction)] - to) * 0.1,
      });
    };

    this.sit = async (left) => {
      turnedLeft = left;
      animation.stop();
      texture.frameId = turnedLeft ? 23 : 11;
      gsap.to(this, {
        startAt: { x: `${left ? "+" : "-"}=.1` },
        x: `${left ? "-" : "+"}=2.1`,
        ease: "none",
        duration: 0.6,
      });
      await gsap.to(this, {
        y: "-=1.25",
        ease: "circ.out",
        yoyo: true,
        repeat: 1,
        duration: 0.3,
      });
    };

    this.burn = async () => {
      playSample(SAMPLE_BURN);
      await animation.start("burn");
    };

    this.remove = () => {
      gsap.killTweensOf(this);
      animation.stop();
      playground.removeChild(this);
    };
  }
}

export default Santa;
