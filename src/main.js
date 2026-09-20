import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import './style.css';
import { exhibits } from './content.js';
import {
  ATOMS,
  SAMPLES,
  newState,
  burns,
  waterPhase,
  dissolvedCO2,
  reactionProgress,
} from './chemistry.js';
import { Scene } from './scenes.js';
import { logo, arrow, resetIcon, thumbnail } from './art.js';

const app = document.querySelector('#app');
let scene,
  state,
  exhibit,
  routeIndex = -1;
const atomKey = `<span class="atom-key"><i style="--atom:#83aeb9"></i>Carbon <i style="--atom:#f2eedc"></i>Hydrogen <i style="--atom:#ff796b"></i>Oxygen</span>`;
const footer = () =>
  `<footer class="footer"><span>A little curiosity changes how you see everything.</span>${atomKey}</footer>`;
const header = (inside) =>
  `<header class="topbar"><a href="#museum" class="brand" aria-label="Return to the museum">${logo}<span>THE CHEMISTRY BEHIND<br><strong>EVERYDAY LIFE</strong></span></a>${inside ? `<a href="#museum" class="museum-link">${arrow}<span>Back to museum</span></a>` : '<span class="header-note"><i></i> An interactive museum</span>'}</header>`;

function home() {
  app.innerHTML = `${header(false)}<main id="main" class="home" tabindex="-1">
    <section class="hero"><div class="hero-copy"><div class="eyebrow"><span class="small-line"></span> THE EXTRAORDINARY IN THE ORDINARY</div>
      <h1>The Chemistry<br>Behind<br><em>Everyday Life</em></h1>
      <p>Discover the invisible chemistry happening<br class="wide-only"> around you every day.</p>
      <a class="primary-button" href="#soda">Explore the museum ${arrow}</a>
      <div class="hero-footnote"><span>06</span> everyday things. A whole new perspective.</div>
    </div><div class="hero-art"><canvas id="hero-canvas" role="img" aria-label="A slowly rotating ball-and-stick model of aspirin, showing atoms joined by chemical bonds"></canvas><span class="specimen-label">SPECIMEN 001 <span>ACETYLSALICYLIC ACID</span></span></div></section>
    <section class="gallery" aria-labelledby="gallery-title"><div class="gallery-heading"><div><div class="eyebrow">FOLLOW YOUR CURIOSITY</div><h2 id="gallery-title">Everyday objects. Unexpected stories.</h2></div><span class="gallery-hint">Choose an exhibit ${arrow}</span></div>
    <div class="exhibit-grid">${exhibits.map((e) => `<a href="#${e.id}" class="exhibit-card" style="--accent:${e.accent}" aria-label="Explore ${e.name}: ${e.topic}"><div class="card-top"><span>${e.number} / EXHIBIT</span><span class="card-arrow">↗</span></div><div class="art-wrap">${thumbnail(e.id, e.accent)}</div><h3>${e.name}</h3><p>${e.topic}</p></a>`).join('')}</div></section>
    ${footer()}</main>`;
  state = newState('home');
  scene = new Scene(document.querySelector('#hero-canvas'), state);
}

function controlMarkup(id) {
  switch (id) {
    case 'soda':
      return `<div class="control-heading"><span>CHANGE THE PRESSURE</span><span class="control-number">01</span></div><button id="open-bottle" class="primary-button full">Open the bottle ${arrow}</button><div class="meter-label"><span>Dissolved CO₂</span><strong id="co2-value">High</strong></div><div class="meter"><span id="co2-meter"></span></div><p class="control-note">Watch the dissolved gas leave the liquid. This process is sped up.</p>`;
    case 'soap':
      return `<div class="control-heading"><span>BRING THEM TOGETHER</span><span class="control-number">02</span></div><button id="add-soap" class="primary-button full">Add soap ${arrow}</button><div class="soap-key"><span><i class="head-dot"></i> Hydrophilic head</span><span><i class="tail-line"></i> Hydrophobic tail</span></div><p class="control-note">Heads face the water; tails gather around the grease. The model shows a cross-section.</p>`;
    case 'fire':
      return `<div class="control-heading"><span>CONTROL THE FIRE TRIANGLE</span><span class="control-number">03</span></div><div class="fire-switches">${[
        ['fuel', 'Fuel', 'Methane · CH₄'],
        ['oxygen', 'Oxygen', 'From the air · O₂'],
        ['heat', 'Heat', 'Enough to sustain burning'],
      ]
        .map(
          ([key, name, note]) =>
            `<button class="switch-row" role="switch" aria-checked="true" aria-label="${name}" data-toggle="${key}"><span><strong>${name}</strong><small>${note}</small></span><span class="switch-track"><i></i></span></button>`,
        )
        .join(
          '',
        )}</div><p class="control-note">Switch off any ingredient to break the triangle. Restoring heat represents supplying ignition again.</p>`;
    case 'ice':
      return `<div class="control-heading"><span>CHANGE THE TEMPERATURE</span><span class="control-number">04</span></div><div class="temperature-readout"><output id="temp-output" for="temperature">−15<span>°C</span></output><span id="phase-badge" class="state-badge">Solid</span></div><label class="sr-only" for="temperature">Temperature in degrees Celsius</label><input id="temperature" type="range" min="-30" max="120" step="1" value="-15"><div class="range-ticks"><span>−30°C</span><span>120°C</span></div><div class="phase-presets"><button data-temperature="-15">Solid</button><button data-temperature="25">Liquid</button><button data-temperature="115">Gas</button></div><div class="threshold"><strong>0°C</strong><span>Melting / freezing</span></div><div class="threshold"><strong>100°C</strong><span>Boiling at normal<br>atmospheric pressure</span></div><p class="control-note">A simplified equilibrium model at 1 atm. At a transition temperature, two phases may coexist while heat is added or removed.</p>`;
    case 'medicine':
      return `<div class="control-heading"><span>INSPECT THE ATOMS</span><span class="control-number">05</span></div><div class="element-buttons">${Object.entries(
        ATOMS,
      )
        .map(
          ([symbol, a]) =>
            `<button data-element="${symbol}" aria-pressed="false" style="--element:${a.color}"><strong>${symbol}</strong><span>${a.name}</span><small>${a.count} atoms</small></button>`,
        )
        .join(
          '',
        )}</div><div id="atom-info" class="atom-info" role="status">Select an element above or click an atom. Drag the molecule to rotate it.</div><button id="interact-target" class="secondary-button full">See a target interaction ${arrow}</button><p class="control-note">A generic teaching model of molecular recognition—not a simulation of aspirin in the body.</p>`;
    case 'food':
      return `<div class="control-heading"><span>EXPLORE THE pH SCALE</span><span class="control-number">06</span></div><div class="sample-buttons">${Object.entries(
        SAMPLES,
      )
        .map(
          ([id, sample]) =>
            `<button data-sample="${id}" aria-pressed="${id === 'lemon'}">${sample.name}</button>`,
        )
        .join(
          '',
        )}</div><div class="ph-readout"><strong id="ph-value">pH ≈ 2.2</strong><span id="ph-kind">Acidic</span></div><div class="ph-scale" aria-label="pH scale from 0 to 14"><div class="ph-marker" id="ph-marker"></div></div><div class="ph-numbers">${Array.from({ length: 15 }, (_, i) => `<span>${i}</span>`).join('')}</div><div class="ph-zones"><span>Acidic &lt; 7</span><span>Neutral 7</span><span>Basic &gt; 7</span></div><p class="control-note" id="sample-description">${SAMPLES.lemon.description}</p><button id="mix-food" class="primary-button full">Combine acid + baking soda ${arrow}</button><p class="control-note">A separate reaction: lemon juice + baking soda. Neutralization does not always leave a mixture at pH 7.</p>`;
  }
}

function exhibitPage(index) {
  exhibit = exhibits[index];
  state = newState(exhibit.id);
  const e = exhibit;
  const previous = exhibits[(index + 5) % 6],
    next = exhibits[(index + 1) % 6];
  app.innerHTML = `${header(true)}<main id="main" class="exhibit-page" tabindex="-1" style="--accent:${e.accent}">
    <div class="exhibit-heading"><div><div class="eyebrow"><span class="exhibit-index">${e.number} / 06</span> ${e.name.toUpperCase()} <span class="eyebrow-divider">/</span> ${e.topic.toUpperCase()}</div><h1>${e.title.replace('\n', '<br>')}</h1><p>${e.intro}</p></div><div class="exhibit-mark" aria-hidden="true">${e.number}</div></div>
    <div class="exhibit-layout"><div class="visual-column"><section class="visual-panel" aria-label="${e.name} interactive visualization"><div class="visual-top"><span><i class="live-dot"></i> LOOK A LITTLE CLOSER</span><span id="scene-status">${e.name === 'Fire' ? 'BURNING' : 'INTERACTIVE MODEL'}</span></div><canvas id="exhibit-canvas" role="img" ${e.id === 'medicine' ? 'tabindex="0"' : ''} aria-label="${e.topic} visualization" aria-describedby="observation"></canvas><div class="visual-bottom">${atomKey}<button class="reset-button" id="reset-exhibit" aria-label="Reset exhibit">${resetIcon} Reset</button></div></section>
      <div class="observation"><span class="observation-icon">↳</span><div><div class="eyebrow">WHAT YOU’RE SEEING</div><p id="observation" role="status">${e.observation}</p></div></div>
      <div class="equation-panel"><span class="eyebrow">${e.id === 'soap' ? 'THE MOLECULE’S TWO SIDES' : 'THE CHEMISTRY'}</span><div class="equation">${e.equation}</div><p>${e.equationNote}</p></div>
    </div><aside class="information-panel"><section class="concept"><span class="eyebrow">THE IDEA</span><h2>${e.concept}</h2><p>${e.explanation}</p></section><section class="controls">${controlMarkup(e.id)}</section><section class="takeaway"><span class="takeaway-star">✳</span><p>${e.takeaway}</p></section></aside></div>
    <nav class="exhibit-navigation" aria-label="Exhibit navigation"><a class="previous" href="#${previous.id}">${arrow}<span><small>PREVIOUS EXHIBIT</small>${previous.name}</span></a><a class="all-exhibits" href="#museum"><span class="grid-icon" aria-hidden="true">⊞</span> All exhibits</a><a class="next" href="#${next.id}"><span><small>NEXT EXHIBIT</small>${next.name}</span>${arrow}</a></nav>${footer()}</main>`;
  bindControls();
  scene = new Scene(document.querySelector('#exhibit-canvas'), state, update);
  update();
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el && el.textContent !== text) el.textContent = text;
}
function update() {
  if (routeIndex < 0) return;
  let status = 'INTERACTIVE MODEL',
    observation = exhibit.observation;
  switch (state.id) {
    case 'soda': {
      const f = state.opened ? dissolvedCO2(state.elapsed) : 1;
      document.querySelector('#co2-meter').style.width = `${f * 100}%`;
      setText(
        'co2-value',
        f > 0.7 ? 'High' : f > 0.25 ? 'Decreasing' : f > 0.01 ? 'Low' : 'Nearly gone',
      );
      status = state.opened ? (f > 0.01 ? 'PRESSURE RELEASED' : 'GOING FLAT') : 'BOTTLE SEALED';
      if (state.opened)
        observation =
          f > 0.01
            ? 'The pressure has dropped. Dissolved CO₂ forms gas bubbles and escapes into the air. Watch the CO₂ level fall.'
            : 'Most dissolved CO₂ has escaped. The drink is now much less carbonated, so the bubbling slows to a stop.';
      break;
    }
    case 'soap':
      status = state.soap
        ? state.elapsed < 3
          ? 'MOLECULES ASSEMBLING'
          : 'MICELLE FORMED'
        : 'OIL + WATER';
      if (state.soap)
        observation =
          'Soap surrounds the grease: hydrophobic tails point inward, while polar, hydrophilic heads face the surrounding water. This micelle helps carry grease away.';
      break;
    case 'fire': {
      const on = burns(state);
      status = on ? 'BURNING' : 'EXTINGUISHED';
      if (!on) {
        const missing = ['fuel', 'oxygen', 'heat'].filter((k) => !state[k]).join(', ');
        observation = `Without ${missing}, the reaction cannot continue. Restore all three parts of the fire triangle to relight the flame.`;
      }
      break;
    }
    case 'ice': {
      const t = state.temperature,
        phase = waterPhase(t);
      status = phase.toUpperCase();
      setText('phase-badge', phase);
      document.getElementById('temp-output').innerHTML =
        `${t < 0 ? '−' + Math.abs(t) : t}<span>°C</span>`;
      document
        .querySelectorAll('[data-temperature]')
        .forEach((b) =>
          b.setAttribute(
            'aria-pressed',
            String(
              (t < 0 && b.dataset.temperature === '-15') ||
                (t > 0 && t < 100 && b.dataset.temperature === '25') ||
                (t > 100 && b.dataset.temperature === '115'),
            ),
          ),
        );
      observation =
        t < 0
          ? 'Solid ice: molecules vibrate around fixed positions. Dashed lines represent attractions between separate water molecules.'
          : t === 0
            ? 'At 0°C and normal pressure, ice melts as it absorbs heat; water freezes as it loses heat. Solid and liquid can coexist.'
            : t < 100
              ? 'Liquid water: molecules stay close together but move past one another. Some can escape from the surface by evaporation, even below 100°C.'
              : t === 100
                ? 'At 100°C and normal pressure, added heat boils liquid into gas. Removing heat lets vapor condense. Both phases can coexist.'
                : 'Water vapor: the same H₂O molecules move rapidly and spread far apart. Cooling can condense the gas back into liquid.';
      break;
    }
    case 'medicine':
      status = state.docked
        ? state.elapsed < 3
          ? 'APPROACHING TARGET'
          : 'MOLECULAR RECOGNITION'
        : 'ASPIRIN · 21 ATOMS';
      document
        .querySelectorAll('[data-element]')
        .forEach((b) =>
          b.setAttribute('aria-pressed', String(state.selected === b.dataset.element)),
        );
      setText(
        'atom-info',
        state.selected
          ? ATOMS[state.selected].detail
          : 'Select an element above or click an atom. Drag the molecule to rotate it.',
      );
      if (state.docked)
        observation =
          'A molecule approaches a compatible site on a generic biological target. Shape and chemical properties influence interactions. This does not depict aspirin’s actual mechanism.';
      else if (state.selected)
        observation = `${ATOMS[state.selected].count} ${ATOMS[state.selected].name.toLowerCase()} atoms are highlighted. Letters identify the elements; sticks show bonds and parallel sticks show double bonds.`;
      break;
    case 'food': {
      const sample = SAMPLES[state.sample];
      status = state.mixed
        ? reactionProgress(state.elapsed) < 1
          ? 'CO₂ IS FORMING'
          : 'REACTION COMPLETE'
        : sample.kind.toUpperCase();
      setText('ph-value', `pH ≈ ${sample.ph}`);
      setText('ph-kind', sample.kind);
      document.getElementById('ph-marker').style.left = `${(sample.ph / 14) * 100}%`;
      setText(
        'sample-description',
        state.mixed
          ? 'Scale above: lemon juice before mixing. The final pH depends on the amounts combined.'
          : sample.description,
      );
      document
        .querySelectorAll('[data-sample]')
        .forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.sample === state.sample)));
      if (state.mixed)
        observation =
          reactionProgress(state.elapsed) < 1
            ? 'The acid reacts with bicarbonate, making water and CO₂ gas. Bubbles are evidence of a new substance being produced.'
            : 'The bubbling has stopped because one reactant has been used up. This chemical change produced new substances, including CO₂.';
      else observation = sample.description;
      break;
    }
  }
  setText('scene-status', status);
  setText('observation', observation);
}

function bindControls() {
  document.querySelector('#reset-exhibit').addEventListener('click', () => {
    scene.dispose();
    exhibitPage(routeIndex);
    document.querySelector('#reset-exhibit').focus();
  });
  document.querySelector('#open-bottle')?.addEventListener('click', (e) => {
    state.opened = true;
    state.elapsed = 0;
    e.currentTarget.disabled = true;
    e.currentTarget.textContent = 'Bottle opened ✓';
    update();
  });
  document.querySelector('#add-soap')?.addEventListener('click', (e) => {
    state.soap = true;
    state.elapsed = 0;
    e.currentTarget.disabled = true;
    e.currentTarget.textContent = 'Soap added ✓';
    update();
  });
  document.querySelectorAll('[data-toggle]').forEach((button) =>
    button.addEventListener('click', () => {
      const k = button.dataset.toggle;
      state[k] = !state[k];
      button.setAttribute('aria-checked', String(state[k]));
      update();
    }),
  );
  document.querySelector('#temperature')?.addEventListener('input', (e) => {
    state.temperature = Number(e.target.value);
    update();
  });
  document.querySelectorAll('[data-temperature]').forEach((b) =>
    b.addEventListener('click', () => {
      state.temperature = Number(b.dataset.temperature);
      document.querySelector('#temperature').value = state.temperature;
      update();
    }),
  );
  document.querySelectorAll('[data-element]').forEach((b) =>
    b.addEventListener('click', () => {
      state.selected = state.selected === b.dataset.element ? null : b.dataset.element;
      update();
    }),
  );
  document.querySelector('#interact-target')?.addEventListener('click', (e) => {
    state.docked = !state.docked;
    state.elapsed = 0;
    e.currentTarget.innerHTML = state.docked
      ? `Back to molecule ${arrow}`
      : `See a target interaction ${arrow}`;
    update();
  });
  document.querySelectorAll('[data-sample]').forEach((b) =>
    b.addEventListener('click', () => {
      state.sample = b.dataset.sample;
      state.mixed = false;
      state.elapsed = 0;
      const mix = document.querySelector('#mix-food');
      mix.disabled = false;
      mix.innerHTML = `Combine acid + baking soda ${arrow}`;
      update();
    }),
  );
  document.querySelector('#mix-food')?.addEventListener('click', (e) => {
    state.sample = 'lemon';
    state.mixed = true;
    state.elapsed = 0;
    e.currentTarget.disabled = true;
    e.currentTarget.textContent = 'Reactants combined ✓';
    update();
  });
}

function route() {
  const id = location.hash.slice(1),
    index = exhibits.findIndex((e) => e.id === id);
  scene?.dispose();
  routeIndex = index;
  if (index < 0) home();
  else exhibitPage(index);
  window.scrollTo(0, 0);
  document.title =
    index < 0
      ? 'The Chemistry Behind Everyday Life'
      : `${exhibits[index].name} · The Chemistry Behind Everyday Life`;
  document.querySelector('#main').focus({ preventScroll: true });
}
window.addEventListener('hashchange', route);
route();
