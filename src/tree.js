import { BitmapText, Sprite } from "pixi.js";
import { gsap } from "gsap";
import { Animation } from "/tools.js";
import { ACCENT_COLOR } from "/palette.js";

const { random } = gsap.utils;

class Tree extends Sprite {
  constructor(app, playground, spriteSheet) {
    const texture = spriteSheet.Texture(44);
    super(texture);

    this.anchor.set(0.5);
    this.scale.set(1 / 16);

    const overlay = new Sprite();
    overlay.anchor.set(0.5);
    overlay.scale.set(1 / 16);

    const starTexture = spriteSheet.Texture(1);
    const starAnimation = new Animation(
      {
        blink: [45, 100, 46, 100, 47, 100, 48, 100, 1],
      },
      (frameId) => (starTexture.frameId = frameId)
    );
    const star = new Sprite(starTexture);
    star.anchor.set(0.5);
    star.y = -8;
    let starBlinkDelay;
    const scheduleStarBlink = () => {
      starBlinkDelay = gsap.delayedCall(random(2, 5), () => {
        starAnimation.start("blink");
        scheduleStarBlink();
      });
    };
    overlay.addChild(star);

    const label = new BitmapText(0, {
      fontName: "fontA",
      fontSize: 6.5,
      tint: ACCENT_COLOR,
    });
    label.anchor.set(0.5);
    const animateLabel = () => {
      gsap.killTweensOf(label);
      gsap.to(label, {
        startAt: { y: -12 },
        y: -11,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        duration: random(0.5, 0.6),
      });
      gsap.to(label, {
        startAt: { x: -0.5 },
        x: 0.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        duration: random(0.6, 0.7),
        delay: random(0.4),
      });
    };
    overlay.addChild(label);

    let number = 0;

    this.set = (x, y, n) => {
      this.active = true;
      gsap.killTweensOf([overlay.scale, this.scale]);
      overlay.scale.set(1 / 16);
      this.scale.set(1 / 16);
      overlay.x = this.x = x;
      overlay.y = this.y = y;
      label.text = number = n;
      starBlinkDelay || scheduleStarBlink();
      starAnimation.stop();
      starTexture.frameId = 1;
      animateLabel();
      playground.addChild(this);
      setTimeout(() => playground.addChild(overlay));
    };

    this.cut = async () => {
      label.text = number -= 1;
      await gsap.to([overlay.scale, this.scale], {
        x: 1 / 12,
        y: 1 / 12,
        repeat: 1,
        yoyo: true,
        ease: "sine.out",
        duration: 0.1,
      });
      number < 1 && this.remove();
    };

    this.remove = () => {
      this.active = false;
      starBlinkDelay?.kill();
      starBlinkDelay = null;
      gsap.killTweensOf([overlay.scale, this.scale]);
      gsap.killTweensOf(label);
      starAnimation.stop();
      playground.removeChild(overlay, this);
    };
  }
}

export default Tree;
