import { Container, BitmapText, Rectangle, Sprite, Texture } from "pixi.js";
import { gsap } from "gsap";
import { Animation, SpriteSheet } from "/tools.js";
import Button from "/button.js";
import Menu from "/menu.js";
import { GRAY_3, GRAY_8, GRAY_9, ACCENT_COLOR } from "/palette.js";

const SPRITE_SHEET_FRAME = "frame.png";
const SAMPLE_START = "restart.mp3";
const SAMPLE_MENU = "menu.mp3";

class Select extends Container {
  static assets = [
    ...Menu.assets,
    "font-a.fnt",
    "font-b.fnt",
    SPRITE_SHEET_FRAME,
    SAMPLE_START,
    SAMPLE_MENU,
  ];

  constructor(app) {
    super();
    const { screen, state, events, playSample } = app;

    const backdrop = Sprite.from(Texture.WHITE);
    backdrop.tint = GRAY_3;
    backdrop.alpha = 0.6;
    backdrop.anchor.x = 0.5;
    backdrop.x = screen.width / 2;
    backdrop.width = 192;
    backdrop.height = screen.height;

    const title = new BitmapText("Level Select", {
      fontName: "fontB",
      fontSize: 12,
      tint: GRAY_9,
    });
    title.anchor.set(0.5);
    title.x = screen.width / 2;
    title.y = 28;

    const menu = new Menu(app);
    this.on("dismount", menu.reset);

    const spriteSheet = new SpriteSheet(SPRITE_SHEET_FRAME, {
      frameWidth: 8,
      frameHeight: 8,
      border: 2,
      shape: 2,
    });

    const selectButtons = new Container();
    const buttonSelectTexture = spriteSheet.TiledTexture(2, [0, 3, 4, 7]);
    const buttonSelectTextureDisabled = spriteSheet.TiledTexture(
      2,
      [8, 11, 12, 15]
    );
    let n = 0;
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 5; x++) {
        const level = ++n;
        const button = new Button(
          {
            texture: buttonSelectTexture,
            textureDisabled: buttonSelectTextureDisabled,
            labelText: level,
            color: ACCENT_COLOR,
            downScale: 1.15,
          },
          () => events.emit("start", level)
        );
        button.on("pointerdown", () => playSample(SAMPLE_START));
        button.x = x * 21;
        button.y = y * 21;
        selectButtons.addChild(button);
      }
    }
    selectButtons.scale.set(1.4);
    selectButtons.x = screen.width / 2 - 58.8;
    selectButtons.y = 60;
    this.on("mount", () => {
      for (let i = 0; i < 20; i++) {
        selectButtons.children[i].disabled = i > state.cleared;
      }
    });

    const interactive = new Container();

    const modalReset = new ModalReset(app, this, interactive);
    this.on("dismount", modalReset.hide);

    const buttonReset = new Button(
      {
        width: 32,
        height: 16,
        labelText: "Reset",
        colorOver: GRAY_8,
      },
      modalReset.show
    );
    buttonReset.on("pointerdown", () => playSample(SAMPLE_MENU));
    buttonReset.x = 32;
    buttonReset.y = screen.height - 16;

    const buttonCredits = new Button(
      {
        texture: spriteSheet.TiledTexture(
          6,
          [0, 1, 2, 1, 2, 3, 4, 5, 6, 5, 6, 7]
        ),
        labelText: "Credits",
        color: ACCENT_COLOR,
        downScale: 1.1,
      },
      () => events.emit("credits")
    );
    buttonCredits.on("pointerdown", () => playSample(SAMPLE_START));
    buttonCredits.x = screen.width - 32;
    buttonCredits.y = screen.height - 16;

    interactive.addChild(menu, selectButtons, buttonReset, buttonCredits);
    this.addChild(backdrop, title, interactive);
  }
}

export default Select;

class ModalReset extends Container {
  constructor(
    { screen, playSample, state, events },
    parent,
    siblingsInteractive
  ) {
    super();

    const backdrop = Sprite.from(Texture.WHITE);
    backdrop.tint = 0;
    backdrop.alpha = 0.9;
    backdrop.width = screen.width;
    backdrop.height = screen.height;

    const label = new BitmapText("Are you sure you want to reset everything?", {
      fontName: "fontA",
      fontSize: 6,
      tint: GRAY_9,
    });
    label.anchor.set(0.5);
    label.x = screen.width / 2;
    label.y = screen.height / 2 - 16;

    const buttonOk = new Button(
      {
        width: 32,
        height: 16,
        labelText: "Yes",
        color: ACCENT_COLOR,
      },
      () => {
        state.cleared = 0;
        events.emit("home");
      }
    );
    buttonOk.x = screen.width / 2 - 32;
    buttonOk.y = screen.height / 2 + 8;
    buttonOk.on("pointerdown", () => playSample(SAMPLE_MENU));

    const buttonCancel = new Button(
      {
        width: 32,
        height: 16,
        labelText: "No",
        color: ACCENT_COLOR,
      },
      () => this.hide()
    );
    buttonCancel.x = screen.width / 2 + 32;
    buttonCancel.y = screen.height / 2 + 8;
    buttonCancel.on("pointerdown", () => playSample(SAMPLE_MENU));

    this.addChild(backdrop, label, buttonOk, buttonCancel);

    this.show = () => {
      siblingsInteractive.eventMode = "none";
      parent.addChild(this);
    };

    this.hide = () => {
      siblingsInteractive.eventMode = "auto";
      parent.removeChild(this);
    };
  }
}
