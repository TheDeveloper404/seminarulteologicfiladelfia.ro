import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { processImage } from "./storage";

async function makeJpeg(width: number, height: number): Promise<Buffer> {
  return sharp({
    create: { width, height, channels: 3, background: { r: 100, g: 120, b: 140 } },
  })
    .jpeg({ quality: 100 })
    .toBuffer();
}

async function makePng(width: number, height: number): Promise<Buffer> {
  return sharp({
    create: { width, height, channels: 4, background: { r: 10, g: 200, b: 30, alpha: 1 } },
  })
    .png()
    .toBuffer();
}

describe("processImage — resize + reencode at upload (performance-review 2026-08-20)", () => {
  it("downscales an oversized JPEG to the 2000px cap and shrinks the file", async () => {
    const original = await makeJpeg(4000, 3000);

    const result = await processImage(original, ".jpg");
    const meta = await sharp(result).metadata();

    expect(meta.width).toBeLessThanOrEqual(2000);
    expect(meta.height).toBeLessThanOrEqual(2000);
    expect(result.length).toBeLessThan(original.length);
  });

  it("does not upscale an image already smaller than the cap", async () => {
    const original = await makeJpeg(800, 600);

    const result = await processImage(original, ".jpg");
    const meta = await sharp(result).metadata();

    expect(meta.width).toBe(800);
    expect(meta.height).toBe(600);
  });

  it("keeps PNG output as PNG (format-preserving, no forced conversion)", async () => {
    const original = await makePng(3000, 2000);

    const result = await processImage(original, ".png");
    const meta = await sharp(result).metadata();

    expect(meta.format).toBe("png");
    expect(meta.width).toBeLessThanOrEqual(2000);
  });

  it("keeps WEBP output as WEBP", async () => {
    const original = await sharp({
      create: { width: 3000, height: 1500, channels: 3, background: { r: 1, g: 2, b: 3 } },
    })
      .webp({ quality: 100 })
      .toBuffer();

    const result = await processImage(original, ".webp");
    const meta = await sharp(result).metadata();

    expect(meta.format).toBe("webp");
    expect(meta.width).toBeLessThanOrEqual(2000);
  });
});
