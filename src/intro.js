import { Container, Rectangle, BitmapText } from "pixi.js";
import { gsap } from "gsap";
import { Animation } from "/tools.js";
import { GRAY_9, ACCENT_COLOR } from "/palette.js";

const SAMPLE_START = "start.mp3";

class Intro extends Container {
  static assets = ["font-a.fnt", "font-b.fnt", SAMPLE_START];

  constructor({ screen, scene, events, keyboard, playSample }) {
    super();

    this.eventMode = "static";
    this.hitArea = new Rectangle(0, 0, screen.width, screen.height);

    const title = new BitmapText("Santa's Delivery", {
      fontName: "fontB",
      fontSize: 18.5,
      tint: GRAY_9,
    });
    title.anchor.set(0.5);
    const titleTween = gsap.fromTo(
      title,
      { x: screen.width / 2, y: 131, alpha: 0.1 },
      {
        paused: true,
        delay: 1,
        y: 48,
        alpha: 1,
        ease: "elastic.out(1, 0.4)",
        duration: 0.6,
      }
    );

    const startLabel = new BitmapText('Press "Enter" or "Touch" to Start', {
      fontName: "fontA",
      fontSize: 5.5,
      tint: ACCENT_COLOR,
      letterSpacing: 3,
    });
    startLabel.anchor.set(0.5);
    startLabel.position.set(screen.width / 2, screen.height - 34);
    const startLabelAnimation = new Animation(
      {
        blink: [0, 75, 1, 75, 0, 75, 1, 150, 1],
      },
      (visible) => (startLabel.visible = visible)
    );

    this.addChild(title, startLabel);

    let starting;
    const start = async () => {
      if (!starting) {
        starting = true;
        await playSample(SAMPLE_START);
        await startLabelAnimation.start("blink");
        events.emit("start", 0);
      }
    };

    this.on("mount", async () => {
      scene.background?.addChildAt(title, 2); // move title behind the roofs
      titleTween.restart(true);
      starting = false;
      this.on("pointertap", start);
      keyboard.on("Enter", start);
    });

    this.on("dismount", () => {
      titleTween.pause(0);
      this.addChild(title); // return back
      this.off("pointertap", start);
      keyboard.off("Enter", start);
    });
  }
}

export default Intro;
