import { Container, Texture, TilingSprite } from "pixi.js";
import { gsap } from "gsap";
import Snowfall from "/snowfall.js";

const LAYERS = [
  "sky-background.png",
  "city-midground.png",
  "houses-foreground.png",
];

class Background extends Container {
  static assets = LAYERS;

  constructor(app) {
    super();

    const [skyBackground, cityMidground, housesForeground] = LAYERS.map(
      (url) =>
        new TilingSprite(Texture.from(url), app.screen.width, app.screen.height)
    );

    const snowfall = new Snowfall(app);

    this.addChild(skyBackground, cityMidground, housesForeground, snowfall);

    this.start = () => {
      snowfall.start();

      gsap.killTweensOf(skyBackground.tilePosition);
      gsap.killTweensOf(cityMidground.tilePosition);
      gsap.killTweensOf(housesForeground.tilePosition);

      skyBackground.tilePosition.x = 0;
      cityMidground.tilePosition.x = 0;
      housesForeground.tilePosition.x = 0;

      gsap.to(skyBackground.tilePosition, {
        x: skyBackground.texture.width,
        ease: "none",
        duration: 3600,
        repeat: -1,
      });

      gsap.to(cityMidground.tilePosition, {
        x: cityMidground.texture.width,
        ease: "none",
        duration: 120,
        repeat: -1,
      });

      gsap.to(housesForeground.tilePosition, {
        x: housesForeground.texture.width,
        ease: "none",
        duration: 60,
        repeat: -1,
      });
    };
  }
}

export default Background;
