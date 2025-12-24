import sharp from "sharp";
import puppeteer from "puppeteer";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

/**
 * Use Puppeteer to render SVG with proper font support
 * This is needed for complex SVGs with external fonts
 */
async function renderSvgWithPuppeteer(svgPath, outputPath, width, height) {
  const svgContent = readFileSync(svgPath, "utf-8");

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Set viewport to exact size (no deviceScaleFactor to avoid distortion)
  await page.setViewport({ width, height });

  // Create HTML page with the SVG and Google Fonts
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { 
          width: ${width}px; 
          height: ${height}px; 
          overflow: hidden;
          background: #09090B;
        }
        svg { 
          display: block;
          width: ${width}px; 
          height: ${height}px;
        }
      </style>
    </head>
    <body>
      ${svgContent}
    </body>
    </html>
  `;

  await page.setContent(html, { waitUntil: "networkidle0" });

  // Wait a bit for fonts to fully load
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Take full page screenshot
  const buffer = await page.screenshot({
    type: "png",
  });

  writeFileSync(outputPath, buffer);
  await browser.close();
}

async function generateIcons() {
  console.log("Generating PNG icons from SVGs...\n");

  // Read the favicon SVG
  const faviconSvg = readFileSync(join(publicDir, "favicon.svg"));
  const appleSvg = readFileSync(join(publicDir, "apple-touch-icon.svg"));

  // Generate icon-192.png
  await sharp(faviconSvg)
    .resize(192, 192)
    .png()
    .toFile(join(publicDir, "icon-192.png"));
  console.log("✓ Generated icon-192.png");

  // Generate icon-512.png
  await sharp(faviconSvg)
    .resize(512, 512)
    .png()
    .toFile(join(publicDir, "icon-512.png"));
  console.log("✓ Generated icon-512.png");

  // Generate apple-touch-icon.png (180x180)
  await sharp(appleSvg)
    .resize(180, 180)
    .png()
    .toFile(join(publicDir, "apple-touch-icon.png"));
  console.log("✓ Generated apple-touch-icon.png");

  // Generate og-image.png using Puppeteer for proper font rendering
  // SVG is already 1200x630 (standard OG size), no resizing needed
  await renderSvgWithPuppeteer(
    join(publicDir, "og-image.svg"),
    join(publicDir, "og-image.png"),
    1200,
    630
  );
  console.log("✓ Generated og-image.png (with Puppeteer)");

  console.log("\n✅ All icons generated successfully!");
}

generateIcons().catch(console.error);
