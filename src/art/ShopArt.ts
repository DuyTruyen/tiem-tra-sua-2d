import Phaser from "phaser";
import { Painter, random } from "./Painter";
export const STATION_X = [140, 364, 588, 812, 1036, 1260];
function plant(p: Painter, x: number, y: number, size = 1) {
  p.poly(
    [
      [x - 8 * size, y],
      [x + 8 * size, y],
      [x + 6 * size, y + 12 * size],
      [x - 6 * size, y + 12 * size],
    ],
    "#aa674b",
  );
  p.rect(x - 8 * size, y, 16 * size, 3 * size, "#dc9f6b");
  for (let i = 0; i < 7; i++) {
    const a = i * 2.4,
      dx = Math.cos(a) * 14 * size,
      dy = -9 * size - i * 3 * size;
    p.line(x, y, x + dx, y + dy, "#426b4c", 2 * size);
    p.ellipse(
      x + dx,
      y + dy,
      7 * size,
      3 * size,
      i % 2 ? "#73a675" : "#4b8860",
    );
  }
}
function lamp(p: Painter, x: number, y: number) {
  p.line(x, 59, x, y - 12, "#333b32", 2);
  p.poly(
    [
      [x - 12, y],
      [x - 7, y - 12],
      [x + 7, y - 12],
      [x + 12, y],
    ],
    "#b57440",
  );
  p.rect(x - 9, y, 18, 4, "#ffde8d");
  p.ellipse(x, y + 4, 5, 4, "#fff4b7");
  const grad = p.c.createRadialGradient(x, y + 5, 0, x, y + 5, 65);
  grad.addColorStop(0, "#ffca5c45");
  grad.addColorStop(1, "#ffca5c00");
  p.c.fillStyle = grad;
  p.c.fillRect(x - 65, y - 50, 130, 130);
}
export function makeShopArt(scene: Phaser.Scene) {
  const tex = scene.textures.createCanvas("shop", 720, 425)!;
  const p = new Painter(tex.context),
    r = random(483);
  p.rect(0, 0, 720, 425, "#172f31");
  const grad = p.c.createLinearGradient(0, 60, 0, 290);
  grad.addColorStop(0, "#243f4b");
  grad.addColorStop(1, "#487265");
  p.c.fillStyle = grad;
  p.c.fillRect(0, 58, 720, 260);
  // Original Vietnamese streetscape, viewed through the open shop windows.
  for (let i = 0; i < 30; i++) {
    const x = i * 29 - 20,
      h = 35 + r() * 85;
    p.rect(x, 145 - h, 23, h + 72, i % 3 ? "#294a4e" : "#325859");
    p.rect(x - 2, 144 - h, 27, 4, "#315a58");
    for (let yy = 155 - h; yy < 200; yy += 14)
      for (let xx = x + 4; xx < x + 23; xx += 9)
        p.rect(xx, yy, 4, 6, r() > 0.5 ? "#caad7266" : "#5e8174");
  }
  p.rect(0, 209, 720, 63, "#254443");
  p.rect(0, 241, 720, 11, "#36574f");
  p.rect(0, 252, 720, 18, "#2c4745");
  for (let x = 0; x < 720; x += 50) p.rect(x, 260, 25, 2, "#7b917355");
  // Shophouses and awnings.
  for (const [x, w, col] of [
    [20, 95, "#ad8264"],
    [124, 62, "#737565"],
    [487, 89, "#af956d"],
    [588, 100, "#a17459"],
  ] as [number, number, string][]) {
    p.rect(x, 135, w, 108, col);
    p.rect(x + 6, 148, w - 12, 52, "#344e48");
    for (let a = x + 10; a < x + w - 6; a += 18) {
      p.rect(a, 153, 12, 18, "#b9bb8477");
      p.rect(a, 178, 12, 16, "#6b886c");
    }
    p.rect(x, 202, w, 33, "#31473e");
    p.poly(
      [
        [x - 6, 194],
        [x + w + 6, 194],
        [x + w + 11, 207],
        [x - 10, 207],
      ],
      "#54766b",
    );
    for (let a = x; a < x + w; a += 12) p.rect(a, 194, 6, 13, "#b4b185");
    p.rect(x + 10, 212, 23, 30, "#153935");
    p.rect(x + 40, 212, 31, 16, "#c7a45f");
  }
  p.text("TẠP HÓA", 61, 221, 6, "#ffe7a9", "sans-serif");
  p.text("HẺM 28", 631, 190, 8, "#edc891", "sans-serif");
  p.line(0, 142, 720, 117, "#173237", 1);
  p.line(0, 155, 720, 135, "#1c3535", 1);
  for (let x = 30; x < 720; x += 58) {
    p.line(x, 130 + (x / 720) * -8, x, 143 + (x / 720) * -8, "#203b36");
    p.ellipse(x, 146 - (x / 720) * 8, 2, 3, "#eec179");
  }
  p.rect(56, 156, 3, 90, "#34554b");
  p.rect(42, 155, 31, 3, "#284a42");
  p.ellipse(58, 158, 6, 3, "#e9c476");
  for (let i = 0; i < 70; i++)
    p.rect(8 + r() * 704, 73 + r() * 57, 1, 1, "#bcd9bc55");
  // Tree outside, with mottled leaves.
  p.poly(
    [
      [664, 238],
      [661, 139],
      [635, 111],
      [641, 110],
      [666, 133],
      [684, 103],
      [690, 104],
      [672, 145],
      [672, 240],
    ],
    "#344839",
  );
  for (let i = 0; i < 110; i++) {
    const x = 635 + r() * 88,
      y = 74 + r() * 78;
    p.rect(x, y, 8 + r() * 12, 3 + r() * 6, i % 3 ? "#557358" : "#78916c");
  }
  // Ceiling, warm timber, columns, window sill.
  p.rect(0, 59, 720, 17, "#4b3b2d");
  p.rect(0, 76, 720, 4, "#a98556");
  p.rect(0, 58, 720, 2, "#ba9157");
  for (let x = 12; x < 720; x += 46) {
    p.rect(x, 61, 3, 14, "#2f3328");
    p.rect(x + 3, 61, 2, 14, "#715437");
  }
  for (const x of [20, 201, 503, 684]) {
    p.rect(x, 78, 13, 218, "#a28860");
    p.rect(x, 78, 3, 218, "#e3c797");
    p.rect(x + 10, 78, 3, 218, "#665f43");
    p.rect(x - 3, 83, 19, 7, "#d8b281");
    p.rect(x - 3, 280, 19, 11, "#d1af79");
  }
  p.rect(0, 275, 720, 22, "#403e2e");
  p.rect(0, 275, 720, 4, "#b69865");
  p.rect(0, 290, 720, 7, "#2c3e30");
  // Main hand-painted store sign.
  p.rect(220, 86, 280, 57, "#142f2b");
  p.rect(223, 89, 274, 51, "#34594a");
  p.rect(227, 93, 266, 43, "#1e4137");
  p.line(230, 95, 490, 95, "#a68f58");
  p.line(230, 134, 490, 134, "#a68f58");
  p.text("tiệm trà mơ", 360, 118, 27, "#f6ddb0", "Georgia");
  p.text(
    "MỘT CHÚT TRÀ · MỘT CHÚT THƯƠNG",
    360,
    130,
    5.5,
    "#b9c79c",
    "sans-serif",
  );
  lamp(p, 157, 118);
  lamp(p, 562, 118);
  lamp(p, 359, 156);
  // Wall details: circular fan, menu board, neon, plants.
  p.rect(45, 97, 63, 69, "#d7bd88");
  p.rect(48, 100, 57, 63, "#2b493d");
  p.text("HÔM NAY", 76, 111, 7, "#eddaa8", "sans-serif");
  p.line(55, 115, 99, 115, "#abb887");
  ["Trà sữa   32k", "Trà đào   28k", "Trà tắc   22k"].forEach((s, i) =>
    p.text(s, 76, 128 + i * 10, 5.5, "#c4ccb0", "sans-serif"),
  );
  p.ellipse(632, 113, 18, 18, "#b9bea0");
  p.ellipse(632, 113, 15, 15, "#344f48");
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    p.line(
      632 + Math.cos(a) * 2,
      113 + Math.sin(a) * 2,
      632 + Math.cos(a) * 14,
      113 + Math.sin(a) * 14,
      "#8aa38b",
    );
  }
  p.ellipse(632, 113, 3, 3, "#d0c5a1");
  p.rect(631, 132, 3, 11, "#838d6c");
  p.text("TRÀ NGON", 615, 171, 11, "#dea878", "sans-serif");
  p.text("CHUYỆN VUI", 615, 183, 9, "#bad2a7", "sans-serif");
  plant(p, 47, 270, 1.5);
  plant(p, 677, 271, 1.5);
  plant(p, 249, 273, 0.85);
  plant(p, 479, 273, 0.85);
  // Behind-counter floor and rear cabinet.
  p.rect(0, 299, 720, 112, "#625846");
  for (let y = 307; y < 425; y += 21) {
    p.line(0, y, 720, y, "#3d4439");
    for (let x = (y % 2) * 30; x < 720; x += 60) {
      p.line(x, y, x - 8, y + 21, "#474a3b");
      p.line(x + 8, y + 8, x + 33, y + 8, "#73624b");
    }
  }
  p.rect(63, 228, 599, 25, "#796949");
  p.rect(60, 227, 605, 4, "#d7bd83");
  p.rect(63, 249, 599, 4, "#3d4935");
  for (let x = 65; x < 657; x += 56) {
    p.rect(x, 233, 51, 14, "#a18b5c");
    p.rect(x + 2, 234, 47, 12, "#887349");
    p.rect(x + 23, 235, 7, 2, "#cfb97c");
  }
  // Six distinct equipment stations with props.
  STATION_X.forEach((wx, i) => {
    const x = wx / 2;
    p.rect(x - 24, 203, 49, 23, "#a78d60");
    p.rect(x - 24, 223, 49, 3, "#e4c18a");
    if (i === 0) {
      for (let c = 0; c < 3; c++) {
        for (let j = 0; j < 5; j++) {
          p.poly(
            [
              [x - 18 + c * 12, 202 - j * 3],
              [x - 9 + c * 12, 202 - j * 3],
              [x - 10 + c * 12, 209 - j * 3],
              [x - 17 + c * 12, 209 - j * 3],
            ],
            "#e7dbb8",
          );
          p.rect(x - 18 + c * 12, 202 - j * 3, 9, 1, "#9fae91");
        }
      }
      p.rect(x - 23, 177, 46, 4, "#846c48");
      p.rect(x - 20, 167, 8, 10, "#dfae77");
      p.rect(x + 11, 167, 8, 10, "#bcc79f");
    }
    if (i === 1) {
      p.rect(x - 17, 177, 35, 37, "#739084");
      p.rect(x - 19, 177, 39, 5, "#c3cab0");
      p.rect(x - 15, 186, 31, 23, "#a7b5a0");
      p.rect(x - 10, 189, 20, 16, "#654d32");
      p.rect(x - 8, 190, 16, 7, "#ad7e42");
      p.rect(x - 11, 184, 22, 3, "#dad7b7");
      p.rect(x - 2, 209, 5, 7, "#c9c8a5");
      p.rect(x - 7, 216, 15, 2, "#375549");
      p.ellipse(x + 14, 187, 2, 2, "#efd084");
    }
    if (i === 2) {
      for (let b = 0; b < 3; b++) {
        const bx = x - 19 + b * 14;
        p.rect(bx, 177, 10, 31, ["#e9d4aa", "#c58845", "#aec77f"][b]);
        p.rect(bx + 2, 172, 6, 6, "#e4e3c2");
        p.rect(bx + 1, 188, 8, 11, "#f1e6c7");
        p.rect(bx + 2, 191, 6, 5, ["#b4956b", "#dcaa69", "#8dad62"][b]);
        p.rect(bx + 1, 204, 8, 3, "#ffffff33");
      }
    }
    if (i === 3) {
      p.rect(x - 23, 192, 47, 22, "#50685d");
      for (let a = 0; a < 3; a++) {
        p.rect(x - 21 + a * 15, 194, 13, 17, "#bdc2a4");
        p.rect(
          x - 20 + a * 15,
          196,
          11,
          12,
          ["#544033", "#ebc179", "#ce9075"][a],
        );
        for (let z = 0; z < 6; z++)
          p.rect(
            x - 19 + a * 15 + r() * 8,
            198 + r() * 7,
            2,
            2,
            ["#312b22", "#f2d594", "#e9b091"][a],
          );
      }
      p.line(x - 20, 189, x + 21, 184, "#a9bdab", 2);
      p.line(x - 20, 189, x - 20, 194, "#bdd1bd", 2);
    }
    if (i === 4) {
      p.rect(x - 19, 179, 38, 35, "#7faeaa");
      p.rect(x - 21, 177, 42, 6, "#c4d8c7");
      p.rect(x - 15, 187, 30, 16, "#3e6c6c");
      for (let a = 0; a < 7; a++)
        p.rect(x - 12 + r() * 22, 190 + r() * 9, 5, 4, "#bddbd2");
      p.rect(x - 12, 207, 24, 3, "#466e67");
      p.rect(x + 10, 180, 4, 3, "#efbb6c");
    }
    if (i === 5) {
      p.rect(x - 19, 174, 38, 42, "#d2b18a");
      p.rect(x - 16, 177, 32, 16, "#56826d");
      p.rect(x - 11, 180, 22, 6, "#375e4f");
      p.rect(x - 13, 197, 27, 17, "#364f46");
      p.rect(x - 17, 211, 35, 5, "#d8c9a5");
      p.rect(x + 10, 189, 4, 3, "#e9ab6e");
      p.rect(x - 8, 204, 16, 6, "#f2dbc0");
      p.rect(x - 11, 173, 21, 3, "#c6cbae");
    }
  });
  // Shelves full of ingredients at both edges.
  for (let i = 0; i < 3; i++) {
    p.rect(280 + i * 18, 178, 10, 21, "#ba9460");
    p.rect(282 + i * 18, 174, 6, 5, "#7a8558");
    p.rect(281 + i * 18, 185, 8, 8, "#dfc895");
  }
  p.rect(275, 200, 58, 3, "#8f7850");
  p.rect(405, 196, 49, 5, "#b4976a");
  for (let i = 0; i < 4; i++)
    p.rect(409 + i * 11, 177, 7, 19, i % 2 ? "#bad0a8" : "#d3b579");
  tex.refresh();
  const counter = scene.textures.createCanvas("counter", 720, 425)!;
  const q = new Painter(counter.context);
  // Foreground counter masks character legs naturally.
  q.rect(30, 289, 660, 51, "#493c2f");
  q.rect(30, 289, 660, 5, "#d5b17b");
  q.rect(25, 293, 670, 6, "#ad8755");
  q.rect(25, 299, 670, 4, "#e0bd82");
  q.rect(30, 303, 660, 4, "#705033");
  q.rect(33, 309, 654, 27, "#685335");
  for (let x = 35; x < 688; x += 7) {
    q.rect(x, 310, 2, 25, "#846740");
    q.rect(x + 2, 310, 1, 25, "#3d3c2b");
  }
  q.rect(29, 336, 662, 4, "#a38553");
  q.rect(32, 340, 655, 8, "#333c2b");
  // Warm brass inlay and mark in front of the counter.
  q.rect(321, 314, 80, 18, "#274b3b");
  q.rect(323, 316, 76, 14, "#315541");
  q.text("trà & thương", 361, 327, 9, "#ddc48a", "Georgia");
  for (const x of [112, 227, 342, 457, 572]) {
    q.ellipse(x, 376, 16, 5, "#2a342966");
    q.rect(x - 10, 348, 3, 27, "#9c774d");
    q.rect(x + 7, 348, 3, 27, "#9c774d");
    q.line(x - 9, 365, x + 9, 365, "#bc9761", 2);
    q.ellipse(x, 349, 14, 5, "#e2b275");
    q.ellipse(x, 347, 14, 4, "#bb8552");
  }
  plant(q, 14, 359, 2.3);
  plant(q, 704, 359, 2.2);
  q.rect(4, 402, 712, 3, "#9b8260");
  q.rect(4, 405, 712, 20, "#253b31");
  counter.refresh();
  const cup = scene.textures.createCanvas("cup", 24, 32)!;
  const cp = new Painter(cup.context);
  cp.poly(
    [
      [3, 6],
      [21, 6],
      [18, 29],
      [6, 29],
    ],
    "#f1e2c3",
  );
  cp.poly(
    [
      [5, 11],
      [19, 11],
      [17, 27],
      [7, 27],
    ],
    "#be925a",
  );
  cp.rect(2, 5, 20, 3, "#9ab19d");
  cp.rect(13, 0, 2, 7, "#e9c799");
  for (let i = 0; i < 4; i++)
    cp.ellipse(8 + i * 3, 24 - (i % 2), 1.5, 1.5, "#48382a");
  cp.rect(7, 12, 2, 9, "#fff0ce77");
  cup.refresh();
}
