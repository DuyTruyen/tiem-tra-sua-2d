export class Painter {
  constructor(public c: CanvasRenderingContext2D) {
    c.imageSmoothingEnabled = false;
  }
  rect(x: number, y: number, w: number, h: number, color: string) {
    this.c.fillStyle = color;
    this.c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }
  ellipse(x: number, y: number, rx: number, ry: number, color: string) {
    this.c.fillStyle = color;
    this.c.beginPath();
    this.c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    this.c.fill();
  }
  poly(points: number[][], color: string) {
    this.c.fillStyle = color;
    this.c.beginPath();
    points.forEach(([x, y], i) =>
      i ? this.c.lineTo(x, y) : this.c.moveTo(x, y),
    );
    this.c.closePath();
    this.c.fill();
  }
  line(x: number, y: number, x2: number, y2: number, color: string, width = 1) {
    this.c.strokeStyle = color;
    this.c.lineWidth = width;
    this.c.beginPath();
    this.c.moveTo(x, y);
    this.c.lineTo(x2, y2);
    this.c.stroke();
  }
  text(
    text: string,
    x: number,
    y: number,
    size: number,
    color: string,
    font = "serif",
  ) {
    this.c.fillStyle = color;
    this.c.font = `${size}px ${font}`;
    this.c.textAlign = "center";
    this.c.fillText(text, x, y);
  }
}
export function random(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
