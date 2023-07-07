import { Container, BitmapText, Sprite, Texture } from "pixi.js";
import Menu from "/menu.js";
import { GRAY_3, GRAY_9 } from "/palette.js";

class Credits extends Container {
  static assets = [...Menu.assets, "font-a.fnt", "font-b.fnt"];

  constructor(app) {
    super();
    const { screen } = app;

    const backdrop = Sprite.from(Texture.WHITE);
    backdrop.tint = GRAY_3;
    backdrop.alpha = 0.6;
    backdrop.anchor.x = 0.5;
    backdrop.x = screen.width / 2;
    backdrop.width = 200;
    backdrop.height = screen.height;

    const text = new Text(
      screen.width / 2,
      { fontName: "fontA", fontSize: 6, tint: GRAY_9 },
      [
        [26, "Credits", { fontName: "fontB", fontSize: 12 }],
        [26, "Original game by"],
        [10, "Marcus Fernandes"],
        [16, "Remake by"],
        [10, "undlmn", { tint: 0xffffff }],
        [16, "Music"],
        [10, '"Napping on a cloud" by'],
        [8, "congusbongus"],
        [16, "Graphics"],
        [10, '"holiday-expansion-set" by'],
        [8, "ZomBCool"],
      ]
    );

    const menu = new Menu(app, { select: true });
    this.on("dismount", menu.reset);

    this.addChild(backdrop, text, menu);
  }
}

class Text extends Container {
  constructor(x, defaultStyle, lines) {
    super();
    let y = 0;
    lines.forEach(([yAdvance, text, style = defaultStyle]) => {
      const label = new BitmapText(text, { ...defaultStyle, ...style });
      label.anchor.set(0.5);
      label.x = x;
      label.y = y += yAdvance;
      this.addChild(label);
    });
  }
}

export default Credits;
