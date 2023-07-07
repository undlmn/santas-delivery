import { Container, Rectangle, Sprite, Texture } from "pixi.js";
import { gsap } from "gsap";
import { SpriteSheet } from "/tools.js";
import Button from "/button.js";
import { GRAY_7, GRAY_8 } from "/palette.js";

const SPRITE_SHEET_MENU = "menu.png";
const SAMPLE_RESTART = "restart.mp3";
const SAMPLE_MENU = "menu.mp3";
const SAMPLE_UNMUTE = "select.mp3";

class Menu extends Container {
  static assets = [
    SPRITE_SHEET_MENU,
    SAMPLE_RESTART,
    SAMPLE_MENU,
    SAMPLE_UNMUTE,
  ];

  constructor(
    { screen, events, keyboard, state, playSample },
    { restart, select } = {}
  ) {
    super();

    this.eventMode = "static";
    this.hitArea = new Rectangle(0, 0, screen.width, screen.height);

    const menu = new Container();
    menu.scale.set(0.5);
    menu.x = screen.width - 48;
    menu.y = 8;
    this.addChild(menu);

    const spriteSheet = new SpriteSheet(SPRITE_SHEET_MENU, {
      frameWidth: 32,
      frameHeight: 32,
      border: 2,
      shape: 2,
    });

    if (restart) {
      const buttonRestart = new Button(
        {
          texture: spriteSheet.Texture(0),
          color: GRAY_7,
          colorOver: GRAY_8,
        },
        () => events.emit("start", state.current)
      );
      buttonRestart.on("pointerdown", () => playSample(SAMPLE_RESTART));
      buttonRestart.x = 16;
      buttonRestart.y = 16;
      menu.addChild(buttonRestart);
    }

    let tween;
    let opened;

    const open = () => {
      if (!opened) {
        opened = true;
        buttonSound.texture.frameId = 5 - !state.mute;
        tween?.kill();
        tween = gsap.timeline();
        tween.to(buttonMenu, {
          x: 128,
          duration: 0.15,
        });
        tween.to(menuButtons, {
          x: 64,
          duration: 0.15,
          stagger: 0.1,
        });
        keyboard.on("any", close);
      }
    };

    const close = () => {
      if (opened) {
        opened = false;
        tween?.kill();
        tween = gsap.timeline();
        tween.to(menuButtons, {
          x: 128,
          duration: 0.15,
          stagger: -0.1,
        });
        tween.to(buttonMenu, {
          x: 64,
          duration: 0.15,
        });
        keyboard.off("any", close);
      }
    };

    const buttonMenu = new Button(
      {
        texture: spriteSheet.Texture(1),
        color: GRAY_7,
        colorOver: GRAY_8,
      },
      open
    );
    buttonMenu.on("pointerdown", () => playSample(SAMPLE_MENU));
    menu.addChild(buttonMenu);
    buttonMenu.x = 64;
    buttonMenu.y = 16;

    const menuButtons = [];
    const buttonSound = new Button(
      {
        texture: spriteSheet.Texture(5 - !state.mute),
        color: GRAY_7,
        colorOver: GRAY_8,
      },
      () => {
        state.mute = !state.mute;
        buttonSound.texture.frameId = 5 - !state.mute;
        playSample(SAMPLE_UNMUTE);
      }
    );
    menuButtons.push(buttonSound);
    menu.addChild(buttonSound);
    if (select) {
      const buttonSelect = new Button(
        {
          texture: spriteSheet.Texture(3),
          color: GRAY_7,
          colorOver: GRAY_8,
        },
        () => events.emit("select")
      );
      buttonSelect.on("pointerdown", () => playSample(SAMPLE_MENU));
      menuButtons.push(buttonSelect);
      menu.addChild(buttonSelect);
    }
    const buttonHome = new Button(
      {
        texture: spriteSheet.Texture(2),
        color: GRAY_7,
        colorOver: GRAY_8,
      },
      () => events.emit("home")
    );
    buttonHome.on("pointerdown", () => playSample(SAMPLE_MENU));

    menuButtons.push(buttonHome);
    menu.addChild(buttonHome);
    menuButtons.forEach((button, i) => {
      button.x = 128;
      button.y = 16 + i * 40;
    });

    this.on("pointertap", (event) => {
      if (!menuButtons.some((button) => button.containsPoint(event.screen))) {
        close();
      }
    });

    this.reset = () => {
      tween?.kill();
      menuButtons.forEach((button) => (button.x = 128));
      buttonMenu.x = 64;
      menu.children.forEach((button) => button.reset());
      keyboard.off("any", close);
    };
  }

  destroy() {
    this.reset();
    super.destroy({ children: true, texture: true });
  }
}

export default Menu;
