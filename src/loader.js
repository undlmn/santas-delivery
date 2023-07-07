import { Assets, Container, Graphics } from "pixi.js";
import { gsap } from "gsap";

class Loader extends Container {
  constructor({ screen, scene, events }) {
    super();

    const { width, height } = screen;

    const background = new Graphics()
      .beginFill(0)
      .drawRect(0, 0, width, height)
      .endFill()
      .lineStyle(1, 0xc0cbdc)
      .drawRect(width / 4, height * 0.48, width / 2, height * 0.08);

    const bar = new Graphics()
      .beginFill(0xc0cbdc)
      .drawRect(0, 0, width / 2 - 4, height * 0.08 - 4)
      .endFill();
    bar.position.set(width / 4 + 2, height * 0.48 + 2);

    this.addChild(background, bar);

    this.load = (urls) => {
      bar.scale.x = 0;
      scene.change(this);

      Assets.load(urls, (progress) => {
        gsap.killTweensOf(bar.scale);
        gsap.to(bar.scale, {
          x: progress,
          ease: "none",
          duration: 0.15 * (progress - bar.scale.x),
        });
      }).then(() => {
        gsap.killTweensOf(bar.scale);
        gsap.to(bar.scale, {
          x: 1,
          ease: "none",
          duration: 0.15 * (1 - bar.scale.x),
          onComplete: () => events.emit("ready"),
        });
      });
    };
  }
}

export default Loader;
