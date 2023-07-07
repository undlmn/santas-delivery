import { BitmapText, Rectangle, Sprite } from "pixi.js";
import { gsap } from "gsap";
import { Animation } from "/tools.js";
import { GRAY_7 } from "/palette.js";

class Button extends Sprite {
  constructor(
    {
      texture = null,
      textureDisabled = texture,
      width = 0,
      height = 0,
      labelText,
      labelSize,
      color,
      colorOver,
      downScale = 1.2,
    },
    action
  ) {
    super(texture);
    const button = this;

    button.cursor = "pointer";
    button.eventMode = "dynamic";

    if (width && height) {
      button.hitArea = new Rectangle(-width / 2, -height / 2, width, height);
    }

    button.anchor.set(0.5);

    let label;
    let labelAnimation;
    if (labelText) {
      label = new BitmapText(labelText, {
        fontName: "fontA",
        fontSize: labelSize || 5,
        tint: color ?? GRAY_7,
        letterSpacing: 1,
      });
      label.anchor.set(0.5);
      label.y = 1;
      button.addChild(label);
      labelAnimation = new Animation(
        { blink: [0, 100, 1] },
        (visible) => (label.visible = visible)
      );
    } else if (color) {
      button.tint = color;
    }

    let tweenScale;
    const tweenScaleTo = (scale) => {
      tweenScale?.kill();
      tweenScale = gsap.to(button.scale, {
        x: scale,
        y: scale,
        duration: Math.abs(button.scale.x - scale) * 0.375,
      });
    };

    button.on("pointerenter", () => {
      if (colorOver != null) {
        if (label) {
          label.tint = colorOver;
        } else {
          button.tint = colorOver;
        }
      }
    });

    button.on("pointerleave", async () => {
      if (label) {
        label.tint = color ?? GRAY_7;
      } else if (color) {
        button.tint = color;
      }

      if (button.scale.x > 1) {
        tweenScale && (await tweenScale);
        tweenScaleTo(1);
      }
    });

    button.on("pointerdown", () => tweenScaleTo(downScale));

    button.on("pointerup", async () => {
      tweenScale && (await tweenScale);
      tweenScaleTo(1);
    });

    button.on("touchend", () => {
      if (label) {
        label.tint = color ?? GRAY_7;
      } else if (color) {
        button.tint = color;
      }
    });

    button.on("pointertap", async () => {
      labelAnimation?.start("blink");
      gsap.killTweensOf(action);
      gsap.delayedCall(0.225, action);
    });

    button.reset = () => {
      tweenScale?.kill();
      gsap.killTweensOf(action);
      button.scale.set(1);
      if (label) {
        label.tint = color ?? GRAY_7;
      } else if (color) {
        button.tint = color;
      }
    };

    let disabled = false;
    Object.defineProperties(button, {
      disabled: {
        get: () => disabled,
        set: (value) => {
          if (disabled == !value) {
            if (value) {
              disabled = true;
              button.texture = textureDisabled;
              if (label) {
                label.tint = GRAY_7;
              }
              button.alpha = 0.6;
              button.cursor = null;
              button.eventMode = "none";
            } else {
              disabled = false;
              button.texture = texture;
              if (label) {
                label.tint = color ?? GRAY_7;
              }
              button.alpha = 1;
              button.cursor = "pointer";
              button.eventMode = "dynamic";
            }
          }
        },
      },
    });
  }

  destroy(...args) {
    this.reset();
    super.destroy(...args);
  }
}

export default Button;
