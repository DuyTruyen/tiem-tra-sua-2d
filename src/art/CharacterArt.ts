import Phaser from "phaser";
import { Painter } from "./Painter";
export function makeCharacterArt(scene: Phaser.Scene) {
  const styles = [
    {
      name: "player",
      shirt: "#edd1a1",
      apron: "#578c72",
      hair: "#3c2e2a",
      skin: "#e5af7b",
    },
    {
      name: "student",
      shirt: "#c8d4ba",
      apron: null,
      hair: "#352c2b",
      skin: "#e7bb8a",
    },
    {
      name: "office",
      shirt: "#96b2b1",
      apron: null,
      hair: "#302e2b",
      skin: "#d9a67d",
    },
    {
      name: "shipper",
      shirt: "#ce8c5f",
      apron: null,
      hair: "#586e57",
      skin: "#d7a373",
    },
    {
      name: "neighbor",
      shirt: "#bdaa88",
      apron: null,
      hair: "#535047",
      skin: "#c59470",
    },
    {
      name: "artist",
      shirt: "#ac8c9a",
      apron: null,
      hair: "#543b2c",
      skin: "#ebba90",
    },
  ];
  for (const s of styles)
    for (let frame = 0; frame < 4; frame++) {
      const tex = scene.textures.createCanvas(`${s.name}-${frame}`, 48, 70)!;
      const p = new Painter(tex.context);
      const bob = frame % 2;
      p.ellipse(24, 67, 17, 2, "#132c2855");
      // Sneakers and trousers, independently moving feet.
      const stride = frame === 1 ? 4 : frame === 3 ? -4 : 0;
      p.rect(15 + stride, 51, 7, 12, "#354849");
      p.rect(27 - stride, 51, 7, 12, "#2e3f40");
      p.rect(13 + stride, 62, 10, 4, "#e4d1ab");
      p.rect(26 - stride, 62, 10, 4, "#e4d1ab");
      p.rect(13 + stride, 65, 10, 1, "#6b7365");
      p.rect(26 - stride, 65, 10, 1, "#6b7365");
      p.poly(
        [
          [16, 28 + bob],
          [32, 28 + bob],
          [36, 51],
          [13, 51],
        ],
        s.shirt,
      );
      p.rect(13, 31 + bob, 5, 12, s.shirt);
      p.rect(31, 31 + bob, 5, 12, s.shirt);
      p.rect(13, 42 + bob, 5, 7, s.skin);
      p.rect(31, 42 + bob, 5, 7, s.skin);
      p.rect(18, 27 + bob, 12, 4, "#d1966e");
      p.rect(14, 10 + bob, 21, 17, s.skin);
      p.rect(17, 25 + bob, 15, 4, s.skin);
      p.rect(12, 16 + bob, 3, 7, s.skin);
      p.rect(34, 16 + bob, 3, 7, s.skin);
      p.rect(14, 6 + bob, 20, 7, s.hair);
      p.rect(12, 10 + bob, 5, 10, s.hair);
      p.rect(31, 10 + bob, 5, 8, s.hair);
      p.rect(17, 7 + bob, 10, 7, s.hair);
      p.rect(17, 18 + bob, 3, 3, "#352c27");
      p.rect(28, 18 + bob, 3, 3, "#352c27");
      p.rect(18, 18 + bob, 1, 1, "#fff1d4");
      p.rect(29, 18 + bob, 1, 1, "#fff1d4");
      p.rect(22, 24 + bob, 5, 1, "#9e5f47");
      p.rect(15, 23 + bob, 4, 1, "#d89670");
      p.rect(29, 23 + bob, 4, 1, "#d89670");
      if (s.apron) {
        p.rect(18, 32 + bob, 13, 19, s.apron);
        p.rect(16, 42 + bob, 17, 11, s.apron);
        p.rect(19, 43 + bob, 10, 6, "#447861");
        p.rect(19, 31 + bob, 2, 8, "#82aa82");
        p.rect(29, 31 + bob, 2, 8, "#82aa82");
        p.rect(23, 35 + bob, 5, 4, "#efdbad");
        p.rect(15, 7 + bob, 19, 3, "#efc384");
        p.rect(10, 10 + bob, 26, 3, "#edc081");
      }
      if (s.name === "shipper") {
        p.rect(12, 6 + bob, 25, 9, "#628763");
        p.rect(11, 13 + bob, 27, 3, "#abc398");
        p.rect(17, 6 + bob, 4, 7, "#85a777");
      }
      if (s.name === "office") {
        p.line(17, 18 + bob, 22, 18 + bob, "#404843");
        p.line(27, 18 + bob, 32, 18 + bob, "#404843");
        p.rect(24, 32 + bob, 2, 13, "#527474");
      }
      if (s.name === "artist") {
        p.rect(11, 5 + bob, 25, 4, "#c1a380");
        p.rect(8, 9 + bob, 31, 3, "#d7bb96");
        p.rect(34, 14 + bob, 3, 14, s.hair);
      }
      tex.refresh();
    }
}
