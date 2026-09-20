export const ATOMS = {
  C: {
    name: 'Carbon',
    color: '#83aeb9',
    count: 9,
    detail:
      'Carbon makes the central framework: a six-carbon ring and three carbons in the attached groups.',
  },
  H: {
    name: 'Hydrogen',
    color: '#f2eedc',
    count: 8,
    detail: 'Eight hydrogen atoms complete the structure. Each hydrogen forms one bond.',
  },
  O: {
    name: 'Oxygen',
    color: '#ff796b',
    count: 4,
    detail:
      'Four oxygen atoms are part of the carboxylic acid and ester groups. These groups affect how aspirin behaves.',
  },
};

// Explicit atoms and bond orders, including every hydrogen in C9H8O4.
// Ring substitution follows PubChem CID 2244. Layout is a teaching model, not measured geometry.
export const ASPIRIN = {
  atoms: [
    ['C', -45, -78, 0],
    ['C', 45, -78, 0],
    ['C', 90, 0, 0],
    ['C', 45, 78, 0],
    ['C', -45, 78, 0],
    ['C', -90, 0, 0],
    ['O', -106, -142, 0],
    ['C', -188, -119, 0],
    ['O', -212, -35, 0],
    ['C', -250, -185, 0],
    ['C', 112, -151, 0],
    ['O', 88, -235, 0],
    ['O', 201, -134, 0],
    ['H', 155, 0, 0],
    ['H', 78, 136, 0],
    ['H', -78, 136, 0],
    ['H', -155, 0, 0],
    ['H', -305, -158, 30],
    ['H', -225, -240, 25],
    ['H', -281, -213, -45],
    ['H', 237, -186, 0],
  ],
  bonds: [
    [0, 1, 2],
    [1, 2, 1],
    [2, 3, 2],
    [3, 4, 1],
    [4, 5, 2],
    [5, 0, 1],
    [0, 6, 1],
    [6, 7, 1],
    [7, 8, 2],
    [7, 9, 1],
    [1, 10, 1],
    [10, 11, 2],
    [10, 12, 1],
    [2, 13, 1],
    [3, 14, 1],
    [4, 15, 1],
    [5, 16, 1],
    [9, 17, 1],
    [9, 18, 1],
    [9, 19, 1],
    [12, 20, 1],
  ],
};

export const burns = (state) => state.fuel && state.oxygen && state.heat;
export function waterPhase(t) {
  return t < 0
    ? 'solid'
    : t === 0
      ? 'melting / freezing'
      : t < 100
        ? 'liquid'
        : t === 100
          ? 'boiling / condensing'
          : 'gas';
}
export function dissolvedCO2(seconds) {
  return Math.max(0, Math.exp(-seconds / 9) - 0.035) / 0.965;
}
export function reactionProgress(seconds) {
  return Math.min(1, Math.max(0, seconds / 9));
}
export const SAMPLES = {
  lemon: {
    name: 'Lemon juice',
    ph: 2.2,
    color: '#e9cf71',
    kind: 'Acidic',
    description: 'Citric acid makes lemon juice acidic. Its pH is usually around 2–3.',
  },
  water: {
    name: 'Pure water',
    ph: 7,
    color: '#87d7e6',
    kind: 'Neutral',
    description: 'Pure water is neutral at about 25°C. Tap water can have a different pH.',
  },
  soda: {
    name: 'Baking soda solution',
    ph: 8.3,
    color: '#b2a6ef',
    kind: 'Basic',
    description: 'Dissolved sodium bicarbonate makes a mildly basic solution, roughly pH 8–9.',
  },
};

export function newState(id) {
  return {
    id,
    elapsed: 0,
    opened: false,
    soap: false,
    fuel: true,
    oxygen: true,
    heat: true,
    temperature: -15,
    sample: 'lemon',
    mixed: false,
    selected: null,
    angle: -0.15,
    tilt: 0.18,
    docked: false,
  };
}
