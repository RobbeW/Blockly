/*  turtlelib.js — minimale Turtle-API voor AI in de Klas (Blockly Turtle)
    Auteur: Robbe Wulgaert / aiindeklas.be — Vrij voor educatie met bronvermelding
*/

(function () {
  // ──────────────────────────────────────────────────────────
  // 0) Interne status
  // ──────────────────────────────────────────────────────────
  const S = {
    ready: false,
    dpr: 1,
    cssW: 1000,
    cssH: 1000,
    // View: scherm = (originX + scale*x, originY - scale*y)
    view: { scale: 1, originX: 500, originY: 500 },
    // Turtle staat
    t: {
      x: 0,          // wereld-X
      y: 0,          // wereld-Y
      deg: 0,        // 0 = oost, 90 = noord
      pen: true,
      color: 'rgb(82,0,255)', // #5200FF
      width: 2,
      show: true
    },
    grid: { visible: false, step: 50 },
    // Opgeslagen tekening
    segs: [],  // {x1,y1,x2,y2,color,width}
    texts: [], // {x,y,text,color,font}
    // Canvas & contexten
    img: null, // imagecanvas
    can: null, // turtlecanvas
    ictx: null,
    tctx: null
  };

  // ──────────────────────────────────────────────────────────
  // 1) Helpers
  // ──────────────────────────────────────────────────────────
  function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }
  function toRad(deg){ return (deg * Math.PI) / 180; }

  function ensureInit() {
    if (S.ready) return true;
    S.img = document.getElementById('imagecanvas');
    S.can = document.getElementById('turtlecanvas');
    if (!S.img || !S.can) return false;

    // Canvas-resolutie: teken in CSS-pixels, maar render scherp met DPR
    S.dpr = window.devicePixelRatio || 1;
    // CSS-grootte uit DOM (fallback 1000)
    S.cssW = S.img.clientWidth  || 1000;
    S.cssH = S.img.clientHeight || 1000;

    // Fysieke pixels
    [S.img, S.can].forEach(c => {
      c.width  = Math.round(S.cssW * S.dpr);
      c.height = Math.round(S.cssH * S.dpr);
      // Teken in CSS-coördinaten
      const ctx = c.getContext('2d');
      ctx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);
    });

    S.ictx = S.img.getContext('2d');
    S.tctx = S.can.getContext('2d');

    // Startview: (0,0) in het midden
    S.view.originX = S.cssW / 2;
    S.view.originY = S.cssH / 2;
    S.view.scale = 1;

    S.ready = true;
    redrawAll(true);
    return true;
  }

  // Wereld → scherm
  function W2S(x, y) {
    return {
      x: S.view.originX + S.view.scale * x,
      y: S.view.originY - S.view.scale * y
    };
  }

  // Scherm → wereld (voor grid-bereik)
  function S2W(px, py) {
    return {
      x: (px - S.view.originX) / S.view.scale,
      y: (S.view.originY - py) / S.view.scale
    };
  }

  // Lijnen & tekst opnieuw tekenen
  function redrawAll(redrawGridToo=false) {
    if (!ensureInit()) return;

    // Lijnen/tekst-canvas
    const ctx = S.tctx;
    ctx.clearRect(0, 0, S.cssW, S.cssH);

    // Segments
    for (const s of S.segs) {
      const a = W2S(s.x1, s.y1);
      const b = W2S(s.x2, s.y2);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    // Teksten
    for (const t of S.texts) {
      const p = W2S(t.x, t.y);
      ctx.fillStyle = t.color || '#1A224C';
      ctx.font = t.font || '16px Inter, Roboto, Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(t.text, p.x, p.y);
    }

    // Turtle-pijl
    if (S.t.show) drawTurtle();
    // Raster eventueel opnieuw
    if (redrawGridToo && S.grid.visible) drawGrid(S.grid.step);
  }

  function drawTurtle() {
    const ctx = S.tctx;
    const p = W2S(S.t.x, S.t.y);
    const size = Math.max(8, 8 + S.t.width * 0.8); // pijlgrootte

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(-toRad(S.t.deg)); // wereld 0° oost → canvas +X; canvas Y naar beneden, dus negatief
    ctx.beginPath();
    ctx.moveTo(size, 0);
    ctx.lineTo(-size * 0.6, size * 0.6);
    ctx.lineTo(-size * 0.6, -size * 0.6);
    ctx.closePath();
    ctx.fillStyle = '#5200FF';
    ctx.shadowColor = 'rgba(55,0,179,.35)';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.restore();
  }

  // Raster tekenen op imagecanvas
  function drawGrid(stepWorld) {
    if (!ensureInit()) return;
    const ctx = S.ictx;
    ctx.clearRect(0, 0, S.cssW, S.cssH);

    // zichtbaar wereldbereik
    const w0 = S2W(0, S.cssH);
    const w1 = S2W(S.cssW, 0);
    const xMin = Math.floor(w0.x / stepWorld) * stepWorld;
    const xMax = Math.ceil(w1.x / stepWorld) * stepWorld;
    const yMin = Math.floor(w0.y / stepWorld) * stepWorld;
    const yMax = Math.ceil(w1.y / stepWorld) * stepWorld;

    ctx.lineWidth = 1;
    // dun raster
    ctx.strokeStyle = 'rgba(26,34,76,0.08)';

    ctx.beginPath();
    for (let x = xMin; x <= xMax; x += stepWorld) {
      const a = W2S(x, yMin);
      const b = W2S(x, yMax);
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
    }
    for (let y = yMin; y <= yMax; y += stepWorld) {
      const a = W2S(xMin, y);
      const b = W2S(xMax, y);
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
    }
    ctx.stroke();

    // assen
    ctx.strokeStyle = 'rgba(26,34,76,0.25)';
    ctx.beginPath();
    const xAxisA = W2S(xMin, 0), xAxisB = W2S(xMax, 0);
    ctx.moveTo(xAxisA.x, xAxisA.y);
    ctx.lineTo(xAxisB.x, xAxisB.y);
    const yAxisA = W2S(0, yMin), yAxisB = W2S(0, yMax);
    ctx.moveTo(yAxisA.x, yAxisA.y);
    ctx.lineTo(yAxisB.x, yAxisB.y);
    ctx.stroke();
  }

  // Voeg segment toe + redraw
  function addSegment(x1, y1, x2, y2) {
    S.segs.push({ x1, y1, x2, y2, color: S.t.color, width: S.t.width });
    redrawAll(false);
  }

  // Bepaal bounding box van de tekening (minimale omhullende)
  function getDrawingBBox(includeTurtle=true) {
    const xs = [], ys = [];
    for (const s of S.segs) {
      xs.push(s.x1, s.x2);
      ys.push(s.y1, s.y2);
    }
    for (const t of S.texts) {
      xs.push(t.x);
      ys.push(t.y);
    }
    if (includeTurtle) {
      xs.push(S.t.x); ys.push(S.t.y);
    }
    if (!xs.length) return null;
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    return { minX, maxX, minY, maxY };
  }

  // ──────────────────────────────────────────────────────────
  // 2) Publieke API — functies die Blockly aanroept
  // ──────────────────────────────────────────────────────────

  // Beweging
  window.moveForward = function (dist) {
    if (!ensureInit()) return;
    dist = Number(dist) || 0;
    const rad = toRad(S.t.deg);
    const dx = Math.cos(rad) * dist;
    const dy = Math.sin(rad) * dist; // +Y omhoog in onze wereld
    const nx = S.t.x + dx;
    const ny = S.t.y + dy;
    if (S.t.pen) addSegment(S.t.x, S.t.y, nx, ny);
    S.t.x = nx; S.t.y = ny;
    redrawAll(false);
  };

  window.moveBackward = function (dist) {
    window.moveForward(-(Number(dist) || 0));
  };

  window.turnLeft = function (angle) {
    if (!ensureInit()) return;
    angle = Number(angle) || 0;
    S.t.deg = (S.t.deg + angle) % 360;
    redrawAll(false);
  };

  window.turnRight = function (angle) {
    if (!ensureInit()) return;
    angle = Number(angle) || 0;
    S.t.deg = (S.t.deg - angle) % 360;
    redrawAll(false);
  };

  // Pen & stijl
  window.penUp = function () {
    if (!ensureInit()) return;
    S.t.pen = false;
  };

  window.penDown = function () {
    if (!ensureInit()) return;
    S.t.pen = true;
  };

  window.setPenColour = function (r, g, b) {
    if (!ensureInit()) return;
    r = clamp(Math.round(Number(r)||0), 0, 255);
    g = clamp(Math.round(Number(g)||0), 0, 255);
    b = clamp(Math.round(Number(b)||0), 0, 255);
    S.t.color = `rgb(${r},${g},${b})`;
  };

  window.setLineWidth = function (w) {
    if (!ensureInit()) return;
    w = Number(w);
    S.t.width = isFinite(w) && w > 0 ? w : 2;
    redrawAll(false);
  };

  // Absoluut gaan naar (x,y)
  window.goTo = function (x, y) {
    if (!ensureInit()) return;
    x = Number(x)||0; y = Number(y)||0;
    if (S.t.pen) addSegment(S.t.x, S.t.y, x, y);
    S.t.x = x; S.t.y = y;
    redrawAll(false);
  };

  // Tekst
  window.writeText = function (txt) {
    if (!ensureInit()) return;
    txt = String(txt ?? '');
    S.texts.push({ x: S.t.x, y: S.t.y, text: txt, color: S.t.color, font: '16px Inter, Roboto, Arial, sans-serif' });
    redrawAll(false);
  };

  // Raster (overschrijft tekening — conform jouw UI-tekst)
  window.showGrid = function (step) {
    if (!ensureInit()) return;
    S.grid.visible = true;
    S.grid.step = Math.max(5, Number(step)||50);
    // Verwijder bestaande tekening (expliciet: overschrijft tekening)
    S.segs = [];
    S.texts = [];
    S.t.x = 0; S.t.y = 0; S.t.deg = 0;
    // Teken raster
    drawGrid(S.grid.step);
    redrawAll(false);
  };

  // Turtle verbergen/tonen
  window.hideTurtle = function () {
    if (!ensureInit()) return;
    S.t.show = false; redrawAll(false);
  };
  window.showTurtle = function () {
    if (!ensureInit()) return;
    S.t.show = true; redrawAll(false);
  };

  // Past tekening in beeld
  window.fitToDrawing = function () {
    if (!ensureInit()) return;
    const bb = getDrawingBBox(true);
    if (!bb) return;
    const pad = 20; // pixels marge
    const w = Math.max(1, bb.maxX - bb.minX);
    const h = Math.max(1, bb.maxY - bb.minY);
    const scaleX = (S.cssW - 2*pad) / w;
    const scaleY = (S.cssH - 2*pad) / h;
    S.view.scale = Math.max(0.1, Math.min(scaleX, scaleY));
    // Centeren
    const cx = (bb.minX + bb.maxX) / 2;
    const cy = (bb.minY + bb.maxY) / 2;
    S.view.originX = S.cssW / 2 - S.view.scale * cx;
    S.view.originY = S.cssH / 2 + S.view.scale * cy;

    redrawAll(true); // grid mee herschilderen
  };

  // Reset & wissen
  window.resetTurtle = function () {
    if (!ensureInit()) return;
    S.segs = [];
    S.texts = [];
    S.t = { x: 0, y: 0, deg: 0, pen: true, color: 'rgb(82,0,255)', width: 2, show: true };
    // View terug naar standaard
    S.view.originX = S.cssW / 2;
    S.view.originY = S.cssH / 2;
    S.view.scale = 1;
    // Raster behouden als het aan stond
    if (S.grid.visible) drawGrid(S.grid.step); else S.ictx.clearRect(0,0,S.cssW,S.cssH);
    redrawAll(false);
  };

  window.clearCanvas = function () {
    if (!ensureInit()) return;
    S.segs = [];
    S.texts = [];
    redrawAll(false); // grid blijft staan
  };

  // Synchronous ask (fallback naar prompt); je HTML bevat ook een modal — dit blijft compatibel
  window.ask = function (message, defaultValue='') {
    // ↪ Wil je de modal gebruiken? Koppel hier eenvoudig aan je #ask-modal als je later async wilt.
    return window.prompt(String(message ?? 'Geef een waarde in:'), String(defaultValue ?? '')) ?? '';
  };

  // Init bij DOM ready (veiligheid)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureInit, { once: true });
  } else {
    ensureInit();
  }
})();