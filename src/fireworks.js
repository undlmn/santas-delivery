import { Graphics, Container, ParticleContainer, Sprite } from "pixi.js";
import { gsap } from "gsap";

const AMOUNT = 400;
const COLORS = [
  "rgb(255,255,255)",
  "rgb(128,255,255)",
  "rgb(255,0,255)",
  "rgb(255,128,128)",
  "rgb(0,255,0)",
];

const SAMPLE_BOOM = "boom.mp3";
const SAMPLE_BANG = "bang.mp3";

const { random } = gsap.utils;

class Fireworks extends Container {
  static assets = [SAMPLE_BOOM, SAMPLE_BANG];

  constructor(app) {
    super();

    const fireworks = Array(4)
      .fill()
      .map(() => new Firework(app));
    this.addChild(...fireworks);

    const fire = () => {
      gsap.delayedCall(random(0, 3), fire);
      fireworks.find((f) => !f.busy)?.fire();
    };

    this.start = () => fire();

    this.stop = () => gsap.killTweensOf(fire);

    this.reset = () => {
      this.stop();
      fireworks.forEach((firework) => firework.reset());
    };
  }
}

export default Fireworks;

class Firework extends ParticleContainer {
  constructor({ screen, renderer, playSample }) {
    super(AMOUNT, {
      position: true,
      alpha: true,
    });

    const texture = renderer.generateTexture(
      new Graphics().beginFill(0xffffff).drawRect(0, 0, 1, 1).endFill()
    );

    const sparks = Array(AMOUNT)
      .fill()
      .map(() => {
        const spark = new Sprite(texture);
        spark.anchor.set(0.5);
        spark.scale.set(random(0.4, 1));
        spark.alpha = 0;
        this.addChild(spark);
        return spark;
      });

    let busy;
    let tween;
    this.fire = async () => {
      busy = true;
      tween?.kill();

      const r = random(20, 50);
      const y = random(100, screen.height / 2) - r;
      const color = random(COLORS);

      this.x = random(50, screen.width - 50);
      this.y = 0;

      tween = gsap.timeline();
      tween.to(this, { y: 15, duration: 4 });

      sparks.forEach((spark, i) => {
        spark.x = 0;
        spark.y = screen.height * 0.75;
        spark.alpha = 1;
        spark.tint = "rgb(255,255,255)";
        const a = random(0, 2 * Math.PI);
        tween.to(
          spark,
          {
            y,
            duration: 0.5,
            ease: "power2.out",
          },
          i * 0.0001
        );
        tween.to(
          spark,
          {
            x: "+=" + Math.cos(a) * random(0, r),
            y: "+=" + Math.sin(a) * random(0, r),
            tint: color,
            ease: "power3.out",
            duration: 0.5,
          },
          0.5 + i * 0.0001
        );
        tween.to(
          spark,
          {
            y: `+=random(0,${r})`,
            alpha: 0,
            ease: "sine.inOut",
            duration: 3,
          },
          1 + i * 0.0001
        );
      });
      tween.call(playSample, [SAMPLE_BOOM], 0.3);
      tween.call(playSample, [SAMPLE_BANG], 0.8);
      await tween;
      busy = false;
    };

    this.reset = () => {
      tween?.kill();
      sparks.forEach((spark) => (spark.alpha = 0));
      busy = false;
    };

    Object.defineProperties(this, {
      busy: { get: () => busy },
    });
  }
}
