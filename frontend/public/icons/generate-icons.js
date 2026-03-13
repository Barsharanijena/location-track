/**
 * Run once: node generate-icons.js
 * Generates simple blue circle placeholder icons for PWA manifest.
 * Replace with real branded icons before production.
 */
const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

function generateIcon(size, outPath) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#2563eb";
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${Math.round(size * 0.35)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("D", size / 2, size / 2);

  fs.writeFileSync(outPath, canvas.toBuffer("image/png"));
  console.log(`Generated ${outPath}`);
}

generateIcon(192, path.join(__dirname, "icon-192.png"));
generateIcon(512, path.join(__dirname, "icon-512.png"));
