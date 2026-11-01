const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export type GlassLensMap = {
  url: string;
  width: number;
  height: number;
  radius: number;
  bevel: number;
  scale: number;
};

export function createGlassLensMap(width: number, height: number, radius: number): GlassLensMap {
  const resolution = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width * resolution);
  canvas.height = Math.ceil(height * resolution);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable for glass refraction");

  const image = context.createImageData(canvas.width, canvas.height);
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const corner = clamp(radius, 0, Math.min(halfWidth, halfHeight));
  const bevel = clamp(Math.min(width, height) * 0.3, 8, 18);
  const displacement = bevel * 1.05;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const px = ((x + 0.5) / canvas.width) * width - halfWidth;
      const py = ((y + 0.5) / canvas.height) * height - halfHeight;
      const qx = Math.abs(px) - (halfWidth - corner);
      const qy = Math.abs(py) - (halfHeight - corner);
      const ox = Math.max(qx, 0);
      const oy = Math.max(qy, 0);
      const length = Math.hypot(ox, oy);
      const depth = -(length + Math.min(Math.max(qx, qy), 0) - corner);
      const pixel = (y * canvas.width + x) * 4;

      // Opaque neutral gray leaves the center in place. Transparent maps break
      // displacement because their channels are premultiplied by alpha.
      image.data[pixel] = 128;
      image.data[pixel + 1] = 128;
      image.data[pixel + 2] = 128;
      image.data[pixel + 3] = 255;
      if (depth < 0 || depth >= bevel) continue;

      let nx = 0;
      let ny = 0;
      if (length > 0) {
        nx = (Math.sign(px) * ox) / length;
        ny = (Math.sign(py) * oy) / length;
      } else if (qx > qy) {
        nx = Math.sign(px);
      } else {
        ny = Math.sign(py);
      }

      // A rounded-rectangle distance field supplies the actual surface normal.
      // Opposite edges pull inward symmetrically; corners bend radially.
      const t = clamp(1 - depth / bevel, 0, 1);
      const bend = t * t * (3 - 2 * t);
      image.data[pixel] = Math.round(128 - nx * bend * 127);
      image.data[pixel + 1] = Math.round(128 - ny * bend * 127);
    }
  }

  context.putImageData(image, 0, 0);
  return { url: canvas.toDataURL("image/png"), width, height, radius: corner, bevel, scale: displacement * 2 };
}