import { Graphics, ParticleContainer, Sprite } from "pixi.js";
import { gsap } from "gsap";
import { GRAY_9 } from "/palette.js";

const AMOUNT = 200;
const { random } = gsap.utils;

class Snowfall extends ParticleContainer {
  constructor({ screen, renderer }) {
    super(AMOUNT, {
      position: true,
      alpha: true,
    });

    const texture = renderer.generateTexture(
      new Graphics().beginFill(GRAY_9).drawRect(0, 0, 1, 1).endFill()
    );

    const snowflakes = Array(AMOUNT)
      .fill()
      .map(() => {
        const snowflake = new Sprite(texture);
        snowflake.anchor.set(0.5);
        snowflake.scale.set(random(0.4, 1));
        snowflake.y = -1;
        this.addChild(snowflake);
        return snowflake;
      });

    this.start = () => {
      gsap.killTweensOf(snowflakes);

      snowflakes.forEach((snowflake) => {
        snowflake.x = random(0, screen.width);
        snowflake.y = -1;
        snowflake.alpha = random(0.1, 0.6);
      });

      gsap.to(snowflakes, {
        x: "+=random(0,10)",
        ease: "sine.inOut",
        duration: "random(1,2)",
        stagger: {
          each: 0.01,
          yoyo: true,
          repeat: -1,
        },
      });

      gsap.to(snowflakes, {
        alpha: "random(.8,1)",
        ease: "none",
        duration: "random(.1,1)",
        stagger: {
          each: 0.01,
          yoyo: true,
          repeat: -1,
        },
      });

      gsap.to(snowflakes, {
        y: screen.height + 1,
        ease: "none",
        duration: "random(9,11)",
        stagger: {
          each: 0.1,
          repeat: -1,
        },
        delay: 3,
      });
    };
  }
}

export default Snowfall;
