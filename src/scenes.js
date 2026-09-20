import { ATOMS, ASPIRIN, burns, dissolvedCO2, reactionProgress, SAMPLES } from './chemistry.js';

const TAU = Math.PI * 2;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));
const rand = (n) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};
const ease = (t) => {
  t = clamp(t);
  return t * t * (3 - 2 * t);
};

export class Scene {
  constructor(canvas, state, onTick = () => {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = state;
    this.onTick = onTick;
    this.time = 0;
    this.last = 0;
    this.lastTick = 0;
    this.points = [];
    this.atomPositions = [];
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.resize = new ResizeObserver(() => this.fit());
    this.resize.observe(canvas);
    this.fit();
    this.pointerDown = (e) => {
      if (state.id !== 'medicine') return;
      this.drag = { x: e.clientX, y: e.clientY, moved: false };
      canvas.setPointerCapture(e.pointerId);
    };
    this.pointerMove = (e) => {
      if (!this.drag) return;
      const dx = e.clientX - this.drag.x,
        dy = e.clientY - this.drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 2) this.drag.moved = true;
      state.angle += dx * 0.006;
      state.tilt = clamp(state.tilt + dy * 0.005, -1, 1);
      this.drag.x = e.clientX;
      this.drag.y = e.clientY;
    };
    this.pointerUp = (e) => {
      if (!this.drag) return;
      if (!this.drag.moved) {
        const r = canvas.getBoundingClientRect(),
          px = ((e.clientX - r.left) * canvas.width) / r.width,
          py = ((e.clientY - r.top) * canvas.height) / r.height,
          x = (px - this.offsetX) / this.scale,
          y = (py - this.offsetY) / this.scale;
        const p = this.atomPositions
          .filter((a) => Math.hypot(a.x - x, a.y - y) < a.r + 8)
          .sort((a, b) => b.z - a.z)[0];
        if (p) {
          state.selected = p.el;
          this.onTick();
        }
      }
      this.drag = null;
    };
    this.key = (e) => {
      if (state.id !== 'medicine') return;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        state.angle += e.key === 'ArrowLeft' ? -0.12 : e.key === 'ArrowRight' ? 0.12 : 0;
        state.tilt = clamp(
          state.tilt + (e.key === 'ArrowUp' ? -0.08 : e.key === 'ArrowDown' ? 0.08 : 0),
          -1,
          1,
        );
      }
    };
    canvas.addEventListener('pointerdown', this.pointerDown);
    canvas.addEventListener('pointermove', this.pointerMove);
    canvas.addEventListener('pointerup', this.pointerUp);
    canvas.addEventListener('pointercancel', this.pointerUp);
    canvas.addEventListener('keydown', this.key);
    this.frame = this.frame.bind(this);
    this.frameId = requestAnimationFrame(this.frame);
  }
  fit() {
    const r = this.canvas.getBoundingClientRect(),
      dpr = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(r.width * dpr);
    this.canvas.height = Math.round(r.height * dpr);
  }
  dispose() {
    cancelAnimationFrame(this.frameId);
    this.resize.disconnect();
    this.canvas.removeEventListener('pointerdown', this.pointerDown);
    this.canvas.removeEventListener('pointermove', this.pointerMove);
    this.canvas.removeEventListener('pointerup', this.pointerUp);
    this.canvas.removeEventListener('pointercancel', this.pointerUp);
    this.canvas.removeEventListener('keydown', this.key);
  }
  frame(now) {
    const dt = this.last ? Math.min((now - this.last) / 1000, 0.05) : 0;
    this.last = now;
    if (!document.hidden) {
      this.time += dt;
      this.state.elapsed += dt;
      this.draw();
      if (now - this.lastTick > 150) {
        this.onTick();
        this.lastTick = now;
      }
    }
    this.frameId = requestAnimationFrame(this.frame);
  }
  draw() {
    const c = this.ctx;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.scale = Math.min(this.canvas.width / 840, this.canvas.height / 530);
    this.offsetX = (this.canvas.width - 840 * this.scale) / 2;
    this.offsetY = (this.canvas.height - 530 * this.scale) / 2;
    c.setTransform(this.scale, 0, 0, this.scale, this.offsetX, this.offsetY);
    this.background();
    if (this.state.id === 'home') this.home();
    else this[this.state.id]();
  }
  background() {
    const c = this.ctx,
      accent = {
        home: '#96b86a',
        soda: '#79a96c',
        soap: '#668ece',
        fire: '#ad602f',
        ice: '#62aec2',
        medicine: '#9072b8',
        food: '#b9a15f',
      }[this.state.id];
    const g = c.createRadialGradient(420, 255, 10, 420, 255, 370);
    g.addColorStop(0, accent + '21');
    g.addColorStop(1, accent + '00');
    c.fillStyle = g;
    c.fillRect(0, 0, 840, 530);
    for (let i = 0; i < 62; i++) {
      const x = rand(i) * 840,
        y = (rand(i + 99) * 530 + (this.reduced ? 0 : this.time * (1 + rand(i) * 3))) % 530;
      c.fillStyle = '#d9ebdd' + (i % 4 === 0 ? '32' : '12');
      c.beginPath();
      c.arc(x, y, i % 5 === 0 ? 1.3 : 0.7, 0, TAU);
      c.fill();
    }
  }
  line(x1, y1, x2, y2, color = '#799392', width = 1, dash = []) {
    const c = this.ctx;
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.strokeStyle = color;
    c.lineWidth = width;
    c.setLineDash(dash);
    c.stroke();
    c.setLineDash([]);
  }
  text(t, x, y, size = 14, color = '#a6b6b2', align = 'left') {
    const c = this.ctx;
    c.font = `${size >= 18 ? '500' : '400'} ${size}px "DM Sans", sans-serif`;
    c.fillStyle = color;
    c.textAlign = align;
    c.fillText(t, x, y);
  }
  circle(x, y, r, color, stroke) {
    const c = this.ctx;
    c.beginPath();
    c.arc(x, y, Math.max(0.1, r), 0, TAU);
    if (color) {
      c.fillStyle = color;
      c.fill();
    }
    if (stroke) {
      c.strokeStyle = stroke;
      c.lineWidth = 1;
      c.stroke();
    }
  }
  ball(x, y, r, el, label = false, alpha = 1) {
    const c = this.ctx;
    c.save();
    c.globalAlpha = alpha;
    const color = ATOMS[el]?.color || el;
    const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.05, x, y, r);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.2, color);
    g.addColorStop(0.72, color);
    g.addColorStop(1, '#15252d');
    this.circle(x, y, r, g);
    this.circle(x - r * 0.3, y - r * 0.34, r * 0.17, '#ffffff50');
    if (label) this.text(el, x, y + r * 0.23, r * 0.78, '#0c1b21', 'center');
    c.restore();
  }
  water(x, y, s = 1, angle = 0, alpha = 1) {
    const c = this.ctx;
    c.save();
    c.translate(x, y);
    c.rotate(angle);
    c.globalAlpha = alpha;
    this.line(0, 0, -11 * s, 9 * s, '#a0afab', 3 * s);
    this.line(0, 0, 11 * s, 9 * s, '#a0afab', 3 * s);
    this.ball(-11 * s, 9 * s, 5 * s, 'H');
    this.ball(11 * s, 9 * s, 5 * s, 'H');
    this.ball(0, 0, 7 * s, 'O');
    c.restore();
  }
  co2(x, y, s = 1, angle = 0, alpha = 1) {
    const c = this.ctx;
    c.save();
    c.translate(x, y);
    c.rotate(angle);
    c.globalAlpha = alpha;
    this.line(-18 * s, -2 * s, 18 * s, -2 * s, '#b0bdb9', 2 * s);
    this.line(-18 * s, 2 * s, 18 * s, 2 * s, '#b0bdb9', 2 * s);
    this.ball(-18 * s, 0, 8 * s, 'O');
    this.ball(0, 0, 8 * s, 'C');
    this.ball(18 * s, 0, 8 * s, 'O');
    c.restore();
  }
  methane(x, y, s = 1) {
    for (let i = 0; i < 4; i++) {
      const a = (i * TAU) / 4 + 0.6;
      this.line(x, y, x + Math.cos(a) * 18 * s, y + Math.sin(a) * 18 * s, '#899d9c', 3 * s);
      this.ball(x + Math.cos(a) * 18 * s, y + Math.sin(a) * 18 * s, 5 * s, 'H');
    }
    this.ball(x, y, 10 * s, 'C');
  }
  leader(label, x, y, tx, ty, color = '#a6b6b2') {
    const mid = x < tx ? x + 70 : x - 20;
    this.line(x, y + 10, mid, y + 10, color + '55');
    this.line(mid, y + 10, tx, ty, color + '55');
    this.circle(tx, ty, 2, color);
    this.text(label, x, y, 14, color);
  }
  home() {
    const c = this.ctx;
    c.save();
    c.translate(50, 10);
    this.molecule(
      450,
      253,
      1.08,
      { angle: -0.38 + (this.reduced ? 0 : Math.sin(this.time * 0.13) * 0.13), tilt: 0.55 },
      false,
    );
    c.restore();
    c.save();
    c.translate(465, 265);
    c.rotate(-0.32);
    c.scale(1, 0.6);
    c.strokeStyle = '#bdcf9326';
    c.lineWidth = 1;
    c.setLineDash([4, 8]);
    c.beginPath();
    c.ellipse(0, 0, 305, 255, 0, 0, TAU);
    c.stroke();
    c.restore();
    this.text('THE BEAUTY IS IN THE BONDS', 447, 494, 11, '#90a589', 'center');
    this.leader('A world beneath the surface', 440, 51, 500, 100, '#a4b995');
    this.text('C₉H₈O₄', 116, 361, 25, '#d9e6ce');
    this.text('ASPIRIN · 21 ATOMS', 116, 384, 10, '#8fa291');
  }
  bottlePath() {
    const c = this.ctx;
    c.beginPath();
    c.moveTo(383, 74);
    c.lineTo(457, 74);
    c.lineTo(457, 147);
    c.bezierCurveTo(457, 177, 518, 186, 518, 240);
    c.lineTo(518, 442);
    c.quadraticCurveTo(518, 465, 493, 465);
    c.lineTo(347, 465);
    c.quadraticCurveTo(322, 465, 322, 442);
    c.lineTo(322, 240);
    c.bezierCurveTo(322, 186, 383, 177, 383, 147);
    c.closePath();
  }
  soda() {
    const c = this.ctx,
      s = this.state,
      t = s.elapsed,
      open = s.opened,
      f = open ? dissolvedCO2(t) : 1;
    const g = c.createLinearGradient(322, 0, 518, 0);
    g.addColorStop(0, '#c7eab329');
    g.addColorStop(0.3, '#bddcad05');
    g.addColorStop(1, '#bcd9a322');
    this.bottlePath();
    c.fillStyle = g;
    c.fill();
    c.strokeStyle = '#c9e9bc88';
    c.lineWidth = 1.5;
    c.stroke();
    c.save();
    this.bottlePath();
    c.clip();
    const liquid = c.createLinearGradient(0, 215, 0, 465);
    liquid.addColorStop(0, '#8bba6645');
    liquid.addColorStop(1, '#4b6d3633');
    c.fillStyle = liquid;
    c.fillRect(322, 236, 196, 232);
    this.line(322, 236, 518, 236, '#b8dc9277');
    for (let i = 0; i < 32 * f; i++) {
      let x = 341 + rand(i) * 158 + Math.sin(this.time * 0.4 + i) * 3,
        y = 258 + rand(i + 70) * 181;
      this.co2(x, y, 0.23, rand(i + 20) * 2, 0.8);
    }
    if (open && f > 0) {
      for (let i = 0; i < 35 * f + 1; i++) {
        let p = (this.time * (0.13 + rand(i) * 0.17) + rand(i + 40)) % 1,
          x = 345 + rand(i + 1) * 150 + Math.sin(p * 9 + i) * 5,
          y = 450 - p * 216;
        this.circle(x, y, 2 + p * 6, null, '#d4f0bca0');
        this.circle(x - 1, y - 1, 1, '#e6f9cc80');
      }
    }
    c.restore();
    this.line(335, 260, 335, 426, '#e6f0d838', 3);
    this.line(506, 270, 506, 414, '#d9efcc21', 2);
    c.save();
    const cap = ease(open ? t / 1.2 : 0);
    c.translate(420 + cap * 130, 64 - cap * 30);
    c.rotate(cap * 0.5);
    c.fillStyle = '#badb86';
    c.beginPath();
    c.roundRect(-43, -9, 86, 21, 5);
    c.fill();
    for (let i = 0; i < 10; i++) this.line(-36 + i * 8, -6, -36 + i * 8, 8, '#537547', 1);
    c.restore();
    if (open && f > 0) {
      for (let i = 0; i < 8; i++) {
        const p = (t * 0.28 + i / 8) % 1;
        this.co2(
          420 + Math.sin(i + p * 4) * p * 46,
          147 - p * 140,
          0.27 + p * 0.22,
          p,
          clamp(f * 2) * (1 - p),
        );
      }
    }
    this.leader('Liquid', 96, 320, 322, 337);
    this.leader('Dissolved CO₂', 75, 412, 376, 393);
    this.leader(open ? 'Escaping CO₂' : 'Sealed cap', 64, 101, 383, 87);
    this.leader('Gas bubbles', 580, 284, 466, 284);
    this.text('PRESSURE', 607, 99, 11, '#92a38f');
    this.text(open ? 'Atmospheric' : 'High', 607, 129, 24, '#daeccb');
    this.text(open ? 'Gas can escape' : 'Gas stays dissolved', 607, 153, 12);
    for (let i = 0; i < 16; i++) {
      c.fillStyle = i < (open ? 4 + 12 * Math.exp(-t * 2) : 16) ? '#c5e889' : '#c5e88915';
      c.fillRect(608 + i * 7, 170, 4, 26);
    }
    this.text('CO₂', 414, 211, 12, '#9db986', 'center');
  }
  soap() {
    const c = this.ctx,
      s = this.state,
      p = ease(s.soap ? s.elapsed / 3 : 0),
      cx = 390,
      cy = 270,
      r = lerp(94, 73, p);
    for (let i = 0; i < 27; i++) {
      const x = 70 + rand(i) * 680,
        y = 68 + rand(i + 45) * 390;
      if (Math.hypot(x - cx, y - cy) < 170) continue;
      if ((x > 570 && y > 125 && y < 365) || (x < 250 && (y < 140 || y > 390))) continue;
      this.water(x, y, 0.65, rand(i + 6) * 6, 0.48);
    }
    const g = c.createRadialGradient(cx - 25, cy - 30, 2, cx, cy, r);
    g.addColorStop(0, '#dac58c');
    g.addColorStop(0.5, '#ac8d4d');
    g.addColorStop(1, '#594927');
    this.circle(cx, cy, r, g);
    this.text('GREASE', cx, cy + 5, 14, '#f0e4bd', 'center');
    if (s.soap)
      for (let i = 0; i < 24; i++) {
        const a = (i * TAU) / 24 + (this.reduced ? 0 : Math.sin(this.time * 0.4) * 0.025),
          hx = cx + Math.cos(a) * 137,
          hy = cy + Math.sin(a) * 137,
          ox = rand(i + 56) * 740 + 50,
          oy = rand(i + 12) * 400 + 50,
          x = lerp(ox, hx, p),
          y = lerp(oy, hy, p);
        c.save();
        c.translate(x, y);
        c.rotate(a + Math.PI);
        c.beginPath();
        c.moveTo(6, 0);
        for (let j = 1; j <= 6; j++) c.lineTo(j * 9, j % 2 ? 3 : -3);
        c.strokeStyle = '#d3bb7a';
        c.lineWidth = 2.5;
        c.stroke();
        this.ball(0, 0, 7.5, '#a1b9fb');
        c.restore();
      }
    this.leader('Water · polar', 62, 76, 156, 146, '#b4c6ef');
    this.leader('Grease · nonpolar', 70, 432, 334, 316, '#dbc18a');
    if (s.soap) {
      this.leader('Hydrophilic head', 590, 153, 505, 197, '#c4d3ff');
      this.text('Attracted to water', 590, 175, 12);
      this.leader('Hydrophobic tail', 590, 310, 483, 292, '#e0c78b');
      this.text('Points into grease', 590, 332, 12);
      this.text('MICELLE', 390, 460, 20, '#d6e0fa', 'center');
      this.text('A cross-section of a tiny cluster', 390, 483, 12, '#95a4b2', 'center');
    } else {
      this.text('SEPARATE PHASES', 390, 443, 15, '#d3d9da', 'center');
      this.text(
        'Water cannot carry this grease away on its own.',
        390,
        466,
        12,
        '#95a4b2',
        'center',
      );
    }
  }
  fire() {
    const c = this.ctx,
      s = this.state,
      on = burns(s),
      t = this.time;
    const vertices = [
      [420, 62, 'HEAT', s.heat],
      [236, 360, 'FUEL', s.fuel],
      [604, 360, 'OXYGEN', s.oxygen],
    ];
    for (let i = 0; i < 3; i++) {
      let a = vertices[i],
        b = vertices[(i + 1) % 3];
      this.line(a[0], a[1], b[0], b[1], on ? '#e9a36a60' : '#64747538', 1.5, [4, 5]);
    }
    for (const [x, y, name, active] of vertices) {
      this.circle(x, y, 7, active ? '#f6a66c' : '#445251');
      this.circle(x, y, 14, null, active ? '#f6a66c50' : '#44525140');
      this.text(name, x, y + (y < 100 ? -25 : 34), 12, active ? '#ecc8a9' : '#788781', 'center');
    }
    c.fillStyle = '#172322';
    c.beginPath();
    c.roundRect(373, 324, 94, 26, 7);
    c.fill();
    this.line(381, 323, 459, 323, '#839991', 3);
    c.fillStyle = '#283934';
    c.fillRect(405, 350, 30, 22);
    if (on) {
      const glow = c.createRadialGradient(420, 252, 10, 420, 252, 150);
      glow.addColorStop(0, '#eaa44b37');
      glow.addColorStop(1, '#eaa44b00');
      c.fillStyle = glow;
      c.fillRect(250, 60, 340, 335);
      for (let i = 0; i < 5; i++) {
        const wobble = this.reduced ? 0 : Math.sin(t * (3 + i * 0.7) + i) * 12;
        c.beginPath();
        c.moveTo(420, 329);
        c.bezierCurveTo(330 + i * 10, 314, 397 - i * 5, 236, 409 + wobble, 138 + i * 15);
        c.bezierCurveTo(447 - wobble, 198 + i * 13, 510 - i * 12, 300, 420, 329);
        c.fillStyle = ['#dc632833', '#e57b3550', '#eea14990', '#f5c067dd', '#fff0b0'][i];
        c.fill();
      }
      for (let i = 0; i < 14; i++) {
        const p = (t * 0.35 + i / 14) % 1;
        this.circle(
          420 + Math.sin(i * 9) * p * 60,
          303 - p * 180,
          1.6 * (1 - p),
          '#ffd790' +
            Math.round((1 - p) * 180)
              .toString(16)
              .padStart(2, '0'),
        );
      }
      for (let i = 0; i < 3; i++) {
        const p = (t * 0.16 + i / 3) % 1;
        this.co2(lerp(460, 656, p), lerp(240, 116, p), 0.35, 0, 1 - p);
        this.water(lerp(392, 232, p), lerp(190, 90, p), 0.55, 0, 1 - p);
        this.water(lerp(439, 574, p), lerp(177, 65, p), 0.55, 0, 1 - p);
      }
      // One methane and two oxygen molecules approach the reaction zone together.
      const incoming = (t * 0.22) % 1;
      const mx = lerp(110, 408, incoming),
        my = lerp(260, 284, incoming);
      c.save();
      c.globalAlpha = 1 - incoming * 0.7;
      this.methane(mx, my, 0.65);
      for (const offset of [-33, 33]) {
        const ox = lerp(160, 407, incoming),
          oy = lerp(266 + offset, 276 + offset * 0.25, incoming);
        this.line(ox - 7, oy - 2, ox + 7, oy - 2, '#b5aca2', 1.5);
        this.line(ox - 7, oy + 2, ox + 7, oy + 2, '#b5aca2', 1.5);
        this.ball(ox - 7, oy, 6, 'O');
        this.ball(ox + 7, oy, 6, 'O');
      }
      c.restore();
      this.text('Reactants in', 92, 331, 12, '#bfa98f');
      this.leader('Heat + light', 617, 247, 458, 231, '#f4c282');
    } else {
      this.text('No combustion', 420, 231, 24, '#aab7b0', 'center');
      this.text('All three ingredients are needed.', 420, 258, 13, '#7d8e85', 'center');
    }
    // The lower strip accounts for every atom in the balanced equation.
    this.line(60, 418, 780, 418, '#b2b7a025');
    this.methane(113, 465, 0.8);
    this.text('+', 160, 472, 20);
    for (const x of [203, 244]) {
      this.line(x - 7, 465, x + 7, 465, '#b5aca2', 3);
      this.ball(x - 7, 465, 7, 'O');
      this.ball(x + 7, 465, 7, 'O');
    }
    this.text('→', 332, 476, 32, on ? '#e3bb85' : '#52605b');
    this.co2(443, 465, 0.65);
    this.text('+', 499, 472, 20);
    this.water(547, 459, 0.85);
    this.water(595, 459, 0.85);
    this.text('+ energy', 665, 472, 17, on ? '#edc086' : '#61706a');
    this.text('CH₄ + 2O₂', 183, 510, 12, '#9aa99e', 'center');
    this.text('CO₂ + 2H₂O', 524, 510, 12, '#9aa99e', 'center');
  }
  ice() {
    const c = this.ctx,
      temp = this.state.temperature,
      t = this.time;
    const solid = temp <= 0,
      gas = temp >= 100,
      blend = temp === 0 || temp === 100;
    const target = gas ? 2 : solid ? 0 : 1;
    const x0 = 112,
      y0 = 66,
      w = 616,
      h = 388;
    c.beginPath();
    c.roundRect(x0, y0, w, h, 18);
    c.fillStyle = gas ? '#6c9eae05' : solid ? '#87d2e710' : '#70b6cf12';
    c.fill();
    c.strokeStyle = '#94d7e838';
    c.lineWidth = 1;
    c.stroke();
    const nodes = [];
    for (let i = 0; i < 36; i++) {
      const row = Math.floor(i / 6),
        col = i % 6;
      let x, y;
      if (target === 0) {
        x = 234 + col * 70 + (row % 2) * 23;
        y = 119 + row * 53;
        const vibration = this.reduced ? 0 : 1.1 + (temp + 30) / 30;
        x += Math.sin(t * 5 + i * 3) * vibration;
        y += Math.cos(t * 5 + i) * vibration;
      } else if (target === 1) {
        x = 420 + Math.sin(t * (0.18 + rand(i) * 0.22) + i * 2.4) * 154;
        y = 310 + Math.cos(t * (0.2 + rand(i + 9) * 0.2) + i * 3.1) * 93;
      } else {
        const speed = this.reduced ? 8 : 65 + (temp - 100) * 2;
        x = x0 + 25 + Math.abs(((rand(i) * 1132 + t * speed * (0.5 + rand(i + 7))) % 1132) - 566);
        y =
          y0 + 24 + Math.abs(((rand(i + 22) * 680 + t * speed * (0.4 + rand(i + 17))) % 680) - 340);
      }
      if (blend && i % 2 === 0) {
        if (temp === 0) {
          x += Math.sin(t + i) * 13;
          y += Math.cos(t + i) * 10;
        } else {
          y = 237 + (i % 6) * 27;
          x = 235 + Math.floor(i / 6) * 67 + Math.sin(t + i) * 12;
        }
      }
      let old = this.points[i] || { x, y };
      old.x = lerp(old.x, x, 0.075);
      old.y = lerp(old.y, y, 0.075);
      this.points[i] = old;
      nodes.push(old);
    }
    if (solid) {
      for (let i = 0; i < 36; i++) {
        if (i % 6 < 5)
          this.line(nodes[i].x, nodes[i].y, nodes[i + 1].x, nodes[i + 1].y, '#9fd9e436', 1, [3, 5]);
        if (i < 30)
          this.line(nodes[i].x, nodes[i].y, nodes[i + 6].x, nodes[i + 6].y, '#9fd9e436', 1, [3, 5]);
      }
    }
    for (let i = 0; i < nodes.length; i++)
      this.water(
        nodes[i].x,
        nodes[i].y,
        0.88,
        solid ? (i % 2 ? Math.PI : 0) : t * (gas ? 0.8 : 0.3) + i,
      );
    this.text('H₂O', 143, 101, 15, '#b5e3ec');
    this.text(`${temp}°C`, 697, 103, 23, '#d7f0f3', 'right');
    this.text(
      solid
        ? 'Ordered network · small vibrations'
        : gas
          ? 'Far apart · fast motion'
          : 'Close together · constantly rearranging',
      420,
      493,
      15,
      '#b2d5da',
      'center',
    );
    if (solid)
      this.text(
        'Dashed lines: attractions between molecules (schematic)',
        420,
        516,
        11,
        '#7f9da2',
        'center',
      );
  }
  molecule(cx, cy, scale, view, inspect = true) {
    const c = this.ctx,
      a = view.angle,
      tilt = view.tilt;
    const positions = ASPIRIN.atoms.map(([el, x, y, z]) => {
      y += 48;
      x += 32;
      const xx = x * Math.cos(a) - y * Math.sin(a),
        yy = x * Math.sin(a) + y * Math.cos(a),
        zz = yy * Math.sin(tilt) + z * Math.cos(tilt),
        perspective = 700 / (700 - zz);
      return {
        el,
        x: cx + xx * scale * perspective,
        y: cy + (yy * Math.cos(tilt) - z * Math.sin(tilt)) * scale * perspective,
        z: zz,
        r: (el === 'H' ? 9 : 17) * scale * perspective,
      };
    });
    if (inspect && !this.state.docked) {
      // Keep every atom visible at every rotation, including the outer hydrogens.
      const left = Math.min(...positions.map((p) => p.x - p.r));
      const right = Math.max(...positions.map((p) => p.x + p.r));
      const top = Math.min(...positions.map((p) => p.y - p.r));
      const bottom = Math.max(...positions.map((p) => p.y + p.r));
      const fit = Math.min(1, 710 / (right - left), 390 / (bottom - top));
      for (const p of positions) {
        p.x = cx + (p.x - (left + right) / 2) * fit;
        p.y = cy + (p.y - (top + bottom) / 2) * fit;
        p.r *= fit;
      }
    }
    for (const [i, j, order] of ASPIRIN.bonds) {
      const p = positions[i],
        q = positions[j],
        dx = q.x - p.x,
        dy = q.y - p.y,
        len = Math.hypot(dx, dy),
        ox = (-dy / len) * 3.5 * scale,
        oy = (dx / len) * 3.5 * scale;
      const g = c.createLinearGradient(p.x, p.y, q.x, q.y);
      g.addColorStop(0, '#658388');
      g.addColorStop(0.4, '#b7c8c1');
      g.addColorStop(1, '#607d80');
      for (let k = 0; k < order; k++) {
        const sign = order === 1 ? 0 : k === 0 ? -1 : 1;
        this.line(
          p.x + ox * sign,
          p.y + oy * sign,
          q.x + ox * sign,
          q.y + oy * sign,
          g,
          order === 1 ? 6 * scale : 3 * scale,
        );
      }
    }
    for (const p of [...positions].sort((a, b) => a.z - b.z)) {
      const match = !view.selected || view.selected === p.el;
      if (view.selected === p.el) this.circle(p.x, p.y, p.r + 5, null, ATOMS[p.el].color + 'b0');
      this.ball(p.x, p.y, p.r, p.el, inspect, match ? 1 : 0.26);
    }
    if (inspect) this.atomPositions = positions;
    return positions;
  }
  medicine() {
    const s = this.state;
    if (!s.docked) {
      this.molecule(424, 250, 1.05, s);
      this.text('Drag to rotate · arrow keys also work', 420, 484, 13, '#9ea6b4', 'center');
      this.text(
        'Ball-and-stick model · bond geometry simplified',
        420,
        509,
        11,
        '#78838e',
        'center',
      );
    } else {
      const p = ease(s.elapsed / 3),
        c = this.ctx;
      c.save();
      c.translate(565, 271);
      const glow = c.createRadialGradient(0, 0, 10, 0, 0, 165);
      glow.addColorStop(0, '#b89feb22');
      glow.addColorStop(1, '#b89feb00');
      c.fillStyle = glow;
      c.fillRect(-180, -180, 360, 360);
      c.beginPath();
      c.moveTo(30, -140);
      c.bezierCurveTo(156, -133, 177, 32, 102, 120);
      c.bezierCurveTo(35, 200, -128, 122, -132, 44);
      c.lineTo(-87, 18);
      c.lineTo(-57, 49);
      c.lineTo(-6, 24);
      c.lineTo(10, -25);
      c.lineTo(-28, -63);
      c.lineTo(-55, -93);
      c.bezierCurveTo(-29, -123, -4, -137, 30, -140);
      c.closePath();
      c.fillStyle = '#8d76b033';
      c.fill();
      c.strokeStyle = '#bca0e696';
      c.lineWidth = 2;
      c.stroke();
      c.restore();
      this.molecule(lerp(214, 521, p), lerp(244, 260, p), 0.43, {
        angle: -0.3,
        tilt: 0.15,
        selected: s.selected,
      });
      this.text('Medicine molecule', 108, 106, 16, '#d0bdf0');
      this.text('Generic biological target', 507, 465, 15, '#c4acd9');
      this.text(
        p < 1 ? 'Approaching a compatible site' : 'A compatible shape can interact',
        420,
        64,
        17,
        '#dfd1ee',
        'center',
      );
      this.text(
        'Simplified recognition model · not aspirin’s actual mechanism',
        420,
        510,
        12,
        '#9a8ea8',
        'center',
      );
    }
  }
  food() {
    const c = this.ctx,
      s = this.state,
      sample = SAMPLES[s.sample],
      p = s.mixed ? reactionProgress(s.elapsed) : 0;
    this.text(
      s.mixed ? 'ACID + BAKING SODA' : sample.name.toUpperCase(),
      420,
      80,
      13,
      '#ded0a4',
      'center',
    );
    const liquid = c.createLinearGradient(0, 230, 0, 416);
    liquid.addColorStop(0, sample.color + '35');
    liquid.addColorStop(1, sample.color + '13');
    c.beginPath();
    c.moveTo(315, 135);
    c.lineTo(336, 418);
    c.quadraticCurveTo(420, 444, 504, 418);
    c.lineTo(525, 135);
    c.strokeStyle = '#e4e1ca80';
    c.lineWidth = 2;
    c.stroke();
    c.beginPath();
    c.moveTo(324, 235);
    c.lineTo(337, 417);
    c.quadraticCurveTo(420, 441, 503, 417);
    c.lineTo(517, 235);
    c.closePath();
    c.fillStyle = liquid;
    c.fill();
    c.beginPath();
    c.ellipse(420, 235, 96, 13, 0, 0, TAU);
    c.fillStyle = sample.color + '30';
    c.fill();
    c.strokeStyle = sample.color + '60';
    c.stroke();
    c.beginPath();
    c.ellipse(420, 135, 105, 15, 0, 0, TAU);
    c.strokeStyle = '#f0e5cc60';
    c.stroke();
    this.line(336, 162, 351, 389, '#f5eacf30', 3);
    for (let i = 0; i < 6; i++) this.line(485, 190 + i * 34, 501, 190 + i * 34, '#c6c3ae44');
    if (s.mixed) {
      if (p < 1) {
        for (let i = 0; i < 35; i++) {
          const a = (s.elapsed * (0.17 + rand(i) * 0.15) + rand(i + 12)) % 1,
            x = 350 + rand(i) * 140,
            y = 409 - a * 184;
          this.circle(x, y, 2 + a * 7, null, '#f0dc9bc0');
        }
        for (let i = 0; i < 7; i++) {
          const a = (s.elapsed * 0.4 + i / 7) % 1;
          this.co2(383 + rand(i) * 80, 216 - a * 110, 0.3 + a * 0.2, 0, 1 - a);
        }
      }
      this.leader('CO₂ gas', 585, 185, 458, 173, '#ebd394');
      this.leader('New substances', 75, 367, 360, 335);
      this.text(
        p >= 1 ? 'Reaction complete' : 'Bubbles are being produced',
        420,
        481,
        19,
        '#e9d5a3',
        'center',
      );
      this.text(
        p >= 1
          ? 'A reactant has run out; the bubbling stops.'
          : 'The gas is carbon dioxide, not boiling water.',
        420,
        507,
        12,
        '#9eaa99',
        'center',
      );
    } else {
      this.text(`pH ≈ ${sample.ph}`, 420, 331, 44, sample.color, 'center');
      this.text(sample.kind, 420, 361, 16, '#d4d8c3', 'center');
      this.leader('Water-based sample', 64, 232, 325, 253);
      this.text('Approximate pH · varies with concentration', 420, 494, 13, '#b5b497', 'center');
    }
  }
}
