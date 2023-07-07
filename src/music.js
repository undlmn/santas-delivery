import { Assets } from "pixi.js";
import { gsap } from "gsap";

const TRACK = "napping_on_a_cloud.{ogg,mp3}";
const LOOP = [11.86, 236.522];

class Music {
  static assets = [TRACK];

  constructor({ audioContext, audioOut }) {
    let delay;
    let source;
    let waiting;

    this.play = async () => {
      if (waiting) {
        return;
      }

      delay?.kill();
      source?.stop();

      if (audioContext.state != "running") {
        waiting = true;
        await audioContext.resume();
      }
      waiting = false;

      delay = gsap.delayedCall(1, () => {
        source = audioContext.createBufferSource();
        source.buffer = Assets.cache.get(TRACK);
        source.loop = true;
        [source.loopStart, source.loopEnd] = LOOP;
        source.connect(audioOut);
        source.start();
      });
    };
  }
}

export default Music;
