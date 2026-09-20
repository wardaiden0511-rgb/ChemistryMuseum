export const logo = `<svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="m12 10 17 8-8 15L7 23Z" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="10" r="4" fill="currentColor"/><circle cx="29" cy="18" r="5" fill="currentColor"/><circle cx="21" cy="33" r="3" fill="currentColor"/><circle cx="7" cy="23" r="3" fill="currentColor"/></svg>`;
export const arrow =
  '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.5"/></svg>';
export const resetIcon =
  '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 8a8 8 0 1 1-1 8M5 3v5h5" stroke="currentColor" stroke-width="1.5"/></svg>';

export function thumbnail(id, color) {
  const art = {
    soda: `<path d="M102 23h35v35q0 10 14 24t13 30v64q0 9-12 9H88q-12 0-12-9v-64q0-16 13-30t13-24Z" fill="url(#${id}glass)" stroke="${color}" stroke-opacity=".5"/><path d="M78 111h84v61q0 10-12 10H90q-12 0-12-10Z" fill="${color}" opacity=".15"/><rect x="99" y="18" width="41" height="11" rx="3" fill="${color}"/><g fill="none" stroke="${color}" opacity=".75"><circle cx="96" cy="146" r="7"/><circle cx="136" cy="122" r="5"/><circle cx="121" cy="164" r="4"/><circle cx="112" cy="107" r="3"/><circle cx="127" cy="74" r="2"/></g><path d="M88 114v51" stroke="white" stroke-opacity=".3" stroke-linecap="round"/>`,
    soap: `<circle cx="120" cy="108" r="39" fill="url(#${id}orb)"/>${Array.from(
      { length: 16 },
      (_, i) => {
        let a = (i * Math.PI) / 8;
        return `<path d="M${120 + Math.cos(a) * 44} ${108 + Math.sin(a) * 44}l${Math.cos(a) * 18} ${Math.sin(a) * 18}" stroke="#e0c387" stroke-width="2"/><circle cx="${120 + Math.cos(a) * 68}" cy="${108 + Math.sin(a) * 68}" r="6" fill="${color}"/>`;
      },
    ).join(
      '',
    )}<circle cx="52" cy="40" r="8" fill="none" stroke="${color}" opacity=".3"/><circle cx="193" cy="153" r="13" fill="none" stroke="${color}" opacity=".3"/>`,
    fire: `<path d="M116 24c22 53 54 53 55 100 0 35-24 57-51 57-38 0-61-25-59-55 2-26 23-43 32-73 3 25 16 28 17 38 9-22 9-41 6-67Z" fill="url(#${id}flame)"/><path d="M123 96c-1 30 29 29 25 57-3 16-15 25-28 25-24 0-38-26-18-49 12-13 16-20 21-33Z" fill="#ffe8a8" opacity=".9"/>`,
    ice: `<path d="m119 36 68 37v75l-68 39-67-39V73Z" fill="${color}" fill-opacity=".08" stroke="${color}" stroke-opacity=".5"/><path d="m52 73 67 39 68-39m-68 39v75m-33-96 67-38m-100 58 67 38 68-38M86 92v75m68-75v76" fill="none" stroke="${color}" stroke-opacity=".3"/>${[
      [119, 36],
      [187, 73],
      [187, 148],
      [119, 187],
      [52, 148],
      [52, 73],
      [119, 112],
      [86, 92],
      [154, 92],
      [119, 150],
    ]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="url(#${id}orb)"/>`)
      .join('')}`,
    medicine: `<g stroke="#76949d" stroke-width="5"><path d="m92 60 54 4 27 48-26 45-55-3-26-48Z"/><path d="m92 60-28-30m82 34 36-35m-90 125-28 26m109-68 29 9"/></g>${[
      [92, 60, '#83aeb9'],
      [146, 64, '#83aeb9'],
      [173, 112, '#83aeb9'],
      [147, 157, '#83aeb9'],
      [92, 154, '#83aeb9'],
      [66, 106, '#83aeb9'],
      [64, 30, '#ff796b'],
      [182, 29, '#ff796b'],
      [64, 180, '#f2eedc'],
      [202, 121, '#f2eedc'],
    ]
      .map(
        ([x, y, c]) =>
          `<circle cx="${x}" cy="${y}" r="13" fill="${c}"/><circle cx="${x - 4}" cy="${y - 5}" r="4" fill="white" opacity=".3"/>`,
      )
      .join('')}`,
    food: `<path d="M61 115c0-39 36-76 80-70 30 4 57 32 52 65-5 42-41 70-80 65-29-4-52-31-52-60Z" fill="#c3a850"/><path d="m119 54 64 84c-30 34-87 26-110-14Z" fill="#f2dc8f"/><path d="m118 62 54 73c-23 26-68 22-89-10Z" fill="#d0ae49"/><path d="m119 72-6 75m6-75 36 67m-36-67-26 54m26-54 4 75" stroke="#f8e6a3" stroke-width="3"/><path d="M142 44q6-30 30-27-4 28-30 27" fill="#809b60"/>`,
  };
  return `<svg viewBox="0 0 240 210" class="card-art" aria-hidden="true"><defs><radialGradient id="${id}orb" cx="30%" cy="25%"><stop stop-color="${color}"/><stop offset="1" stop-color="${id === 'soap' ? '#8f6534' : '#2e626e'}"/></radialGradient><linearGradient id="${id}glass"><stop stop-color="${color}" stop-opacity=".18"/><stop offset=".5" stop-color="${color}" stop-opacity=".03"/><stop offset="1" stop-color="${color}" stop-opacity=".22"/></linearGradient><linearGradient id="${id}flame" x2="0" y2="1"><stop stop-color="#f1c477"/><stop offset=".6" stop-color="#ed8b49"/><stop offset="1" stop-color="#b84532"/></linearGradient></defs>${art[id]}</svg>`;
}
