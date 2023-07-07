import { Sprite, Texture } from "pixi.js";
import { gsap } from "gsap";

const IMAGE_ARROW = "arrow.png";

const axis = (direction) => (direction % 2 ? "x" : "y");
const sign = (direction) => (direction == 1 || direction == 2 ? "+" : "-");

class Arrow extends Sprite {
  static assets = [IMAGE_ARROW];

  constructor(app, playground) {
    super(Texture.from(IMAGE_ARROW));

    this.anchor.set(0.4, 0.5);
    this.scale.set(1 / 48);

    let tween;
    const startTween = (x, y, direction, delay) => {
      this.x = x;
      this.y = y;
      this.alpha = 0;
      this.angle = -90 + 90 * direction;
      tween = gsap.to(this, {
        [axis(direction)]: `${sign(direction)}=1.75`,
        startAt: { alpha: 0.8 },
        alpha: 0,
        duration: 1.4,
        repeat: -1,
        repeatDelay: 1.8,
        delay,
      });
    };

    this.set = (x, y, direction) => {
      if (tween) {
        tween.eventCallback("onRepeat", () => {
          tween.kill();
          startTween(x, y, direction, 0);
        });
      } else {
        startTween(x, y, direction, 1.9);
      }
      ~playground.children.indexOf(this) || playground.addChild(this);
    };

    this.remove = () => {
      tween?.kill();
      tween = null;
      playground.removeChild(this);
    };
  }
}

export default Arrow;
