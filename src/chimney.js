import { Sprite } from "pixi.js";
import { Animation } from "/tools.js";

const SAMPLE_PUFF = "puff.mp3";

class Chimney extends Sprite {
  static assets = [SAMPLE_PUFF];

  constructor({ playSample }, playground, spriteSheet) {
    super(spriteSheet.Texture(7));

    this.anchor.set(0.5);
    this.scale.set(1 / 16);

    const sootTexture = spriteSheet.Texture(1);
    const sootAnimation = new Animation(
      {
        puff: [56, 100, 57, 100, 58, 100, 59, 100, 60, 100, 1],
      },
      (frameId) => (sootTexture.frameId = frameId)
    );
    const soot = new Sprite(sootTexture);
    soot.anchor.set(0.5);
    soot.y = -16;
    this.addChild(soot);

    this.set = (x, y) => {
      this.x = x;
      this.y = y;
      sootAnimation.stop();
      sootTexture.frameId = 1;
      playground.addChild(this);
    };

    this.puff = () => {
      playSample(SAMPLE_PUFF);
      sootAnimation.start("puff");
    };

    this.remove = () => {
      sootAnimation.stop();
      playground.removeChild(this);
    };
  }
}

export default Chimney;
