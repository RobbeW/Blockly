#!/usr/bin/env node

const viewports = [
  { name: "desktop 1440x900", width: 1440, height: 900 },
  { name: "student laptop 1366x768", width: 1366, height: 768 },
  { name: "small laptop 1280x720", width: 1280, height: 720 },
  { name: "tablet landscape 1024x768", width: 1024, height: 768 },
  { name: "tablet portrait 768x1024", width: 768, height: 1024 },
  { name: "phone 390x844", width: 390, height: 844 }
];

function estimateMazeFit({ width, height }) {
  const stacked = width <= 1100;
  const compact = width <= 560;

  // Conservative estimates based on platform.html CSS and the real topbar wrapping.
  const header = width <= 560 ? 154 : width <= 900 ? 116 : 64;
  const wrapPad = compact ? 8 : 12;
  const gap = compact ? 8 : 12;
  const panelTitle = 42;
  const controls = width <= 560 ? 104 : 58;
  const note = 38;
  const canvasPad = compact ? 16 : 24;

  const wrapInnerWidth = width - wrapPad * 2;
  const panelWidth = stacked ? wrapInnerWidth : (wrapInnerWidth - gap) / 2;
  const wrapHeight = Math.max(0, height - header);
  const panelHeight = stacked
    ? Math.min(680, Math.max(420, height - header - wrapPad * 2))
    : Math.max(0, wrapHeight - wrapPad * 2);

  const availableWidth = Math.max(0, panelWidth - canvasPad);
  const availableHeight = Math.max(0, panelHeight - panelTitle - controls - note - canvasPad);
  const fittedSize = Math.max(160, Math.floor(Math.min(640, availableWidth, availableHeight || availableWidth)));

  return {
    stacked,
    availableWidth: Math.round(availableWidth),
    availableHeight: Math.round(availableHeight),
    oldFixedCanvasFits: 640 <= availableWidth && 640 <= availableHeight,
    fittedSize,
    fittedCanvasFits: fittedSize <= availableWidth && fittedSize <= availableHeight
  };
}

let failed = false;

for (const viewport of viewports) {
  const result = estimateMazeFit(viewport);
  if (!result.fittedCanvasFits) failed = true;

  const line = [
    viewport.name.padEnd(27),
    result.stacked ? "stacked" : "2-col ",
    `available ${String(result.availableWidth).padStart(4)}x${String(result.availableHeight).padStart(4)}`,
    `old 640 fits: ${result.oldFixedCanvasFits ? "yes" : "NO "}`,
    `new size: ${String(result.fittedSize).padStart(3)}`,
    `new fits: ${result.fittedCanvasFits ? "yes" : "NO"}`
  ].join(" | ");

  console.log(line);
}

if (failed) {
  console.error("\nResponsiveness check failed: at least one viewport still clips the fitted Maze canvas.");
  process.exit(1);
}

console.log("\nResponsiveness check passed: fitted Maze canvas stays inside the preview area.");
