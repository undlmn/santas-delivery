import { BitmapText, Container, Rectangle, Sprite } from "pixi.js";
import { SpriteSheet } from "/tools.js";
import { GRAY_7, GRAY_8 } from "/palette.js";
import Arrow from "/arrow.js";
import Barrier from "/barrier.js";
import Chimney from "/chimney.js";
import Fire from "/fire.js";
import Gift from "/gift.js";
import MAP from "/map.js";
import Menu from "/menu.js";
import Santa from "/santa.js";
import Sleigh from "/sleigh.js";
import Snowball from "/snowball.js";
import Tree from "/tree.js";

const SPRITE_SHEET = "tileset.png";
const SPRITE_SHEET_MENU = "menu.png";
const SAMPLE_RESTART = "restart.mp3";
const SAMPLE_COMPLETE = "complete.mp3";
const PLAYGROUND_SCALE = 12;

class Level extends Container {
  static assets = [
    Arrow.assets,
    Chimney.assets,
    Gift.assets,
    Menu.assets,
    Santa.assets,
    Sleigh.assets,
    Snowball.assets,
    "font-a.fnt",
    SPRITE_SHEET,
    SPRITE_SHEET_MENU,
    SAMPLE_RESTART,
    SAMPLE_COMPLETE,
  ].flat();

  constructor(app) {
    super();
    const { screen, events, state, keyboard, playSample } = app;

    this.eventMode = "static";
    this.hitArea = new Rectangle(0, 0, screen.width, screen.height);

    const spriteSheet = new SpriteSheet(SPRITE_SHEET, {
      frameWidth: 16,
      frameHeight: 16,
      border: 2,
      shape: 2,
      firstId: 1,
    });

    const title = new BitmapText("", {
      fontName: "fontA",
      fontSize: 8,
      tint: GRAY_7,
    });
    title.x = 8;
    title.y = 12;

    const tips = new Container();
    const tipsLabel1 = new BitmapText("Move\n\nRestart", {
      fontName: "fontA",
      fontSize: 4,
      tint: GRAY_7,
    });
    const tipsLabel2 = new BitmapText(
      "WASD / Arrows / Swipe Up, Down, Left, Right\n\nR /",
      {
        fontName: "fontA",
        fontSize: 4,
        tint: GRAY_8,
      }
    );
    tipsLabel2.x = 36;
    const spriteSheetMenu = new SpriteSheet(SPRITE_SHEET_MENU, {
      frameWidth: 32,
      frameHeight: 32,
      border: 2,
      shape: 2,
    });
    const tipsButtonReset = new Sprite(spriteSheetMenu.Texture(0));
    tipsButtonReset.tint = GRAY_8;
    tipsButtonReset.scale.set(0.16);
    tipsButtonReset.anchor.set(0.5);
    tipsButtonReset.x = 48;
    tipsButtonReset.y = 11;
    tips.addChild(tipsLabel1, tipsLabel2, tipsButtonReset);
    tips.x = 64;
    tips.y = screen.height - 48;

    const menu = new Menu(app, { restart: true, select: true });
    this.on("dismount", menu.reset);

    const playground = new Container();
    playground.scale.set(PLAYGROUND_SCALE);

    this.addChild(title, playground, menu);

    let level;
    let map;
    let house;
    let treesCount;
    let showArrow;
    const houses = [];
    const barriers = [];
    const fires = [];
    const trees = [];
    const gifts = [];
    const snowballs = [];
    const arrow = new Arrow(app, playground);
    const santa = new Santa(app, playground, spriteSheet);
    const chimney = new Chimney(app, playground, spriteSheet);
    const chimneyBarrier = new Barrier(app, playground, spriteSheet);
    const sleigh = new Sleigh(app, playground);

    this.on("mount", () => {
      level = state.current || 1;
      title.text = `Level - ${level}`;
      map = MAP[level - 1];
      treesCount = map.trees?.reduce((n, tree) => n + tree[2] || n, 0) || 0;

      house =
        houses[level] ||
        (houses[level] = new Sprite(spriteSheet.TiledTexture(...map.house)));
      house.scale.set(1 / 16);
      house.x = -0.5;
      house.y = -0.5;
      playground.addChild(house);

      if (level == 1) {
        this.addChild(tips);
        arrow.set(map.santa[0] + 1, map.santa[1], map.santa[2] ? 3 : 1);
        showArrow = true;
      }

      treesCount && chimneyBarrier.set(map.chimney[0], map.chimney[1] + 1);

      Object.entries({
        barriers: [barriers, Barrier],
        fires: [fires, Fire],
        trees: [trees, Tree],
        gifts: [gifts, Gift],
        snowballs: [snowballs, Snowball],
      }).forEach(([key, [arr, Obj]]) =>
        map[key]?.forEach((data, i) =>
          (arr[i] || (arr[i] = new Obj(app, playground, spriteSheet, i))).set(
            ...data
          )
        )
      );

      santa.set(...map.santa);
      chimney.set(...map.chimney);
      sleigh.set(
        map.chimney[0] + (map.sleighToLeft ? -3 : 3),
        map.chimney[1],
        map.sleighToLeft
      );

      const cols = map.house[0];
      const rows = Math.ceil(map.house[1].length / cols);
      playground.x = (screen.width - (cols - 1) * PLAYGROUND_SCALE) / 2;
      playground.y =
        (screen.height -
          (rows - (rows < 9 ? 2 : map.chimney[1] < 0 ? 4.25 : 3.25)) *
            PLAYGROUND_SCALE) /
        2;

      ready = true;

      keyboard.on("ArrowUp", keyUp);
      keyboard.on("ArrowRight", keyRight);
      keyboard.on("ArrowDown", keyDown);
      keyboard.on("ArrowLeft", keyLeft);
      keyboard.on("KeyW", keyUp);
      keyboard.on("KeyD", keyRight);
      keyboard.on("KeyS", keyDown);
      keyboard.on("KeyA", keyLeft);
      keyboard.on("KeyR", keyRestart);

      this.on("touchstart", touch);
      this.on("touchmove", touch);
    });

    this.on("dismount", () => {
      this.removeChild(tips);

      playground.removeChild(house);

      [
        arrow,
        barriers,
        chimney,
        chimneyBarrier,
        fires,
        gifts,
        santa,
        sleigh,
        snowballs,
        trees,
      ]
        .flat()
        .forEach((item) => item.remove());

      keyboard.off("ArrowUp", keyUp);
      keyboard.off("ArrowRight", keyRight);
      keyboard.off("ArrowDown", keyDown);
      keyboard.off("ArrowLeft", keyLeft);
      keyboard.off("KeyW", keyUp);
      keyboard.off("KeyD", keyRight);
      keyboard.off("KeyS", keyDown);
      keyboard.off("KeyA", keyLeft);
      keyboard.off("KeyR", keyRestart);

      this.off("touchstart", touch);
      this.off("touchmove", touch);
    });

    const keyUp = () => go(0);
    const keyRight = () => go(1);
    const keyDown = () => go(2);
    const keyLeft = () => go(3);
    const keyRestart = () => {
      playSample(SAMPLE_RESTART);
      events.emit("start");
    };

    let touchStartX = 0;
    let touchStartY = 0;
    const touch = ({ type, screen: { x, y } }) => {
      if (type == "pointerdown") {
        touchStartX = x;
        touchStartY = y;
      }
      if (type == "pointermove") {
        const dx = touchStartX - x;
        const dy = touchStartY - y;
        const abs_dx = Math.abs(dx);
        const abs_dy = Math.abs(dy);
        if (abs_dx > 16 || abs_dy > 16) {
          const direction = abs_dx > abs_dy ? (dx > 0 ? 3 : 1) : dy > 0 ? 0 : 2;
          touchStartX = x;
          touchStartY = y;
          go(direction);
        }
      }
    };

    const look = (direction, x, y) => {
      let steps = -1;
      let fire;
      let tree;
      let gift;
      let snowball;
      let out;
      const [cols, tiles] = map.house;
      const rows = Math.ceil(tiles.length / cols);
      let tileId;
      do {
        steps++;
        x += [0, 1, 0, -1][direction];
        y += [-1, 0, 1, 0][direction];

        const intersect = (item) => item.active && item.x == x && item.y == y;
        fire = fires.find(intersect);
        tree = trees.find(intersect);
        gift = gifts.find(intersect);
        snowball = snowballs.find(intersect);
        if (fire || tree || gift || snowball) {
          fire && steps++;
          break;
        }

        if (
          x < 0 ||
          y < 0 ||
          x >= cols ||
          y >= rows ||
          (tileId = tiles[cols * y + x]) < 3
        ) {
          out = true;
          steps++;
          break;
        }
      } while (tileId > 7);

      return { steps, fire, tree, gift, snowball, out };
    };

    let ready;
    const go = async (direction) => {
      if (ready) {
        ready = false;

        await (async () => {
          const { steps, fire, out, gift, snowball } = look(
            direction,
            santa.x,
            santa.y
          );

          if (!steps) {
            return;
          }

          await santa.go(direction, steps);

          if (showArrow) {
            arrow.set(map.chimney[0], map.chimney[1] + 2, 0);
            showArrow = false;
          }

          if (fire) {
            await santa.burn();
            events.emit("start");
            return;
          }

          if (out) {
            if (santa.x == chimney.x && santa.y == chimney.y) {
              chimney.puff();
              arrow.remove();

              if (!treesCount) {
                if (state.cleared < level) {
                  state.cleared = level;
                }
                sleigh.show();
                await santa.sit(sleigh.turnedLeft);
                sleigh.ready();
                santa.remove();
                playSample(SAMPLE_COMPLETE);
                await sleigh.go();
                events.emit("start", level + 1);
                return;
              }
            }

            await santa.out(direction);
            events.emit("start");
            return;
          }

          santa.collision();

          if (gift) {
            const { steps, fire, out, tree } = look(direction, gift.x, gift.y);

            if (!steps) {
              return;
            }

            await gift.move(direction, steps);

            if (fire) {
              await gift.burn();
              events.emit("start");
              return;
            }

            if (out) {
              await gift.out(direction);
              events.emit("start");
              return;
            }

            if (tree) {
              await gift.put(direction);
              await tree.cut();
              --treesCount || chimneyBarrier.open();
              return;
            }

            gift.collision();
            return;
          }

          if (snowball) {
            const { steps, fire, out } = look(
              direction,
              snowball.x,
              snowball.y
            );

            if (!steps) {
              return;
            }

            await snowball.move(direction, steps);

            if (fire) {
              snowball.melt();
              await fire.off();
              return;
            }

            if (out) {
              await snowball.out(direction);
              return;
            }

            snowball.collision();
          }
        })();

        ready = true;
      }
    };
  }
}

export default Level;
