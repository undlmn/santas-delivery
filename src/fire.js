import { Sprite } from "pixi.js";
import { gsap } from "gsap";
import { Animation } from "/tools.js";

class Fire extends Sprite {
  constructor(app, playground, spriteSheet) {
    const texture = spriteSheet.Texture(49);
    super(texture);

    this.anchor.set(0.5);
    this.scale.set(1 / 16);

    const animation = new Animation(
      {
        flame: [49, 100, 50, 100, 51, 100, 52, 100],
      },
      (frameId) => (texture.frameId = frameId)
    );

    this.set = (x, y) => {
      this.active = true;
      gsap.killTweensOf(this.scale);
      this.scale.set(1 / 16);
      this.x = x;
      this.y = y;
      animation.start("flame");
      playground.addChild(this);
    };

    this.off = async () => {
      this.active = false;
      await gsap.to(this.scale, {
        x: 1 / 12,
        y: 1 / 12,
        duration: 0.1,
      });
      this.remove();
    };

    this.remove = () => {
      this.active = false;
      animation.stop();
      playground.removeChild(this);
    };
  }
}

export default Fire;
