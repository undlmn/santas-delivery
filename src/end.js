import { BitmapText, Container, Rectangle } from "pixi.js";
import { gsap } from "gsap";
import Fireworks from "/fireworks.js";
import Menu from "/menu.js";
import Sleigh from "/sleigh.js";
import { GRAY_9 } from "/palette.js";

const SANTA_SCALE = 16;

class End extends Container {
  static assets = [
    Menu.assets,
    Fireworks.assets,
    Sleigh.assets,
    "font-b.fnt",
  ].flat();

  constructor(app) {
    super();

    const { screen, keyboard } = app;

    this.eventMode = "static";
    this.hitArea = new Rectangle(0, 0, screen.width, screen.height);

    const fireworks = new Fireworks(app);

    const menu = new Menu(app, { select: true });
    this.on("dismount", menu.reset);

    const sky = new Container();
    sky.scale.set(SANTA_SCALE);

    const sleigh = new Sleigh(app, sky);

    const labels = [
      "All Levels Cleared!",
      "Congratulations",
      "And Thank You For\nPlaying!",
    ].map((text, i) => {
      const label = new BitmapText(text, {
        fontName: "fontB",
        fontSize: 14,
        align: "center",
        tint: GRAY_9,
      });
      label.anchor.set(0.5, 0);
      label.x = screen.width / 2;
      label.y = screen.height / 2 - 41 + 26 * i;
      return label;
    });

    this.addChild(fireworks, sky, ...labels, menu);

    let clear;
    const clearScreen = () => {
      if (!clear) {
        clear = true;
        gsap.to(labels, {
          x: screen.width * 1.5,
          duration: 1,
          ease: "sine.in",
          stagger: 0.1,
        });
      }
    };

    this.on("mount", async () => {
      fireworks.start();
      app.scene.background?.addChildAt(fireworks, 2); // move fireworks behind the roofs

      sleigh.set(-2, screen.height / SANTA_SCALE / 2, 0, 1);
      sleigh.go(0.5);

      labels.forEach((label) => (label.x = screen.width / 2));
      await gsap.from(labels, {
        x: -screen.width / 2,
        delay: 0.5,
        duration: 4,
        ease: "sine.in",
        stagger: 0.2,
      });

      clear = false;
      this.on("pointertap", clearScreen);
      keyboard.on("any", clearScreen);
    });

    this.on("dismount", () => {
      this.off("pointertap", clearScreen);
      keyboard.off("any", clearScreen);

      fireworks.reset();
      this.addChildAt(fireworks, 0); // return back
      sleigh.remove();
      gsap.killTweensOf(labels);
    });
  }
}

export default End;
