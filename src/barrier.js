import { Sprite } from "pixi.js";
import { gsap } from "gsap";

class Barrier extends Sprite {
  constructor(app, playground, spriteSheet) {
    super(spriteSheet.Texture(61));

    this.anchor.set(0.5);
    this.scale.set(1 / 16);

    this.set = (x, y) => {
      gsap.killTweensOf(this);
      gsap.killTweensOf(this.scale);
      this.x = x;
      this.y = y;
      this.scale.set(1 / 16);
      this.angle = 0;
      this.alpha = 1;
      playground.addChild(this);
    };

    this.open = async () => {
      gsap.to(this, { angle: 180, alpha: 0 });
      await gsap.to(this.scale, { x: 1 / 12, y: 1 / 12 });
      this.remove();
    };

    this.remove = () => {
      gsap.killTweensOf(this);
      gsap.killTweensOf(this.scale);
      playground.removeChild(this);
    };
  }
}

export default Barrier;
