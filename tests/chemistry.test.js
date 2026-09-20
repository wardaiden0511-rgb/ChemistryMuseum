import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ASPIRIN,
  ATOMS,
  burns,
  waterPhase,
  dissolvedCO2,
  reactionProgress,
  SAMPLES,
} from '../src/chemistry.js';

test('aspirin has all 21 atoms, formula C9H8O4, and chemically valid bond valences', () => {
  const counts = { C: 0, H: 0, O: 0 },
    valence = Array(ASPIRIN.atoms.length).fill(0);
  for (const [element] of ASPIRIN.atoms) counts[element]++;
  assert.deepEqual(counts, { C: 9, H: 8, O: 4 });
  for (const [i, j, order] of ASPIRIN.bonds) {
    assert.ok(i !== j);
    valence[i] += order;
    valence[j] += order;
  }
  ASPIRIN.atoms.forEach(([element], i) =>
    assert.equal(valence[i], { C: 4, H: 1, O: 2 }[element], `Atom ${i} (${element})`),
  );
  for (const [element, count] of Object.entries(counts)) assert.equal(ATOMS[element].count, count);
});
test('combustion requires every part of the fire triangle, for all eight combinations', () => {
  for (let bits = 0; bits < 8; bits++)
    assert.equal(
      burns({ fuel: !!(bits & 1), oxygen: !!(bits & 2), heat: !!(bits & 4) }),
      bits === 7,
    );
});
test('water phase boundaries explicitly include phase coexistence', () => {
  assert.equal(waterPhase(-30), 'solid');
  assert.equal(waterPhase(-1), 'solid');
  assert.equal(waterPhase(0), 'melting / freezing');
  assert.equal(waterPhase(1), 'liquid');
  assert.equal(waterPhase(99), 'liquid');
  assert.equal(waterPhase(100), 'boiling / condensing');
  assert.equal(waterPhase(120), 'gas');
});
test('opened soda loses CO2 monotonically and stops bubbling', () => {
  assert.equal(dissolvedCO2(0), 1);
  let previous = 1;
  for (let t = 1; t <= 60; t++) {
    const value = dissolvedCO2(t);
    assert.ok(value >= 0 && value <= previous);
    previous = value;
  }
  assert.equal(previous, 0);
});
test('food sample positions are plausible and reaction has a finite endpoint', () => {
  assert.ok(SAMPLES.lemon.ph >= 2 && SAMPLES.lemon.ph <= 3);
  assert.equal(SAMPLES.water.ph, 7);
  assert.ok(SAMPLES.soda.ph > 8 && SAMPLES.soda.ph < 9);
  assert.equal(reactionProgress(0), 0);
  assert.equal(reactionProgress(9), 1);
  assert.equal(reactionProgress(90), 1);
});
