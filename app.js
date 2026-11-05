/* Infraestructura en 3 capas — demo nd2tech.
   Diagrama isométrico en SVG: los equipos se colocan en un plano (X, Y) y se proyectan en isométrico.
   Los cables siguen los ejes del suelo y llevan luces que viajan (más rápidas cuanto más carga).
   Empresa, IPs y equipos ficticios (rangos de documentación). */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const suave = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const S = 58;                                   // píxeles por unidad del plano
  const iso = (X, Y, Z = 0) => [(X - Y) * .866 * S, (X + Y) * .5 * S - Z];
  const pt = p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function tono(hex, f) {   // f > 0 aclara, f < 0 oscurece
    const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255];
    const r = c.map(v => Math.round(f >= 0 ? v + (255 - v) * f : v * (1 + f)));
    return '#' + r.map(v => v.toString(16).padStart(2, '0')).join('');
  }

  /* ================== DATOS (datos.js) ================== */
  const MAPA = window.MAPA, { ZONAS, EQ } = MAPA;
  const zonaColor = Object.fromEntries(ZONAS.map(z => [z.id, z.c]));
  const porId = Object.fromEntries(EQ.map(e => [e.id, e]));
  const EN = MAPA.EN.map(([a, b, tipo, modo, o = {}], i) => ({ id: 'e' + i, a, b, tipo, modo, ...o }));

  /* ================== DIBUJO DE EQUIPOS ================== */
  // Caja isométrica con la esquina delantera inferior en F (como en la topología del infra-panel)
  function caja(F, sx, sy, sz, col, extra = '') {
    const R = [.866, -.5], L = [-.866, -.5];
    const Rb = [F[0] + R[0] * sx, F[1] + R[1] * sx], Lb = [F[0] + L[0] * sy, F[1] + L[1] * sy];
    const Bk = [Rb[0] + Lb[0] - F[0], Rb[1] + Lb[1] - F[1]], up = p => [p[0], p[1] - sz];
    const Ft = up(F), Rt = up(Rb), Lt = up(Lb), Bt = up(Bk);
    return `<polygon points="${pt(F)} ${pt(Lb)} ${pt(Lt)} ${pt(Ft)}" fill="${tono(col, -.12)}"/>
      <polygon points="${pt(F)} ${pt(Rb)} ${pt(Rt)} ${pt(Ft)}" fill="${tono(col, -.38)}"/>
      <polygon points="${pt(Ft)} ${pt(Rt)} ${pt(Bt)} ${pt(Lt)}" fill="${tono(col, .22)}"/>
      <polyline points="${pt(Lt)} ${pt(Ft)} ${pt(Rt)}" fill="none" stroke="${tono(col, .55)}" stroke-width=".9" opacity=".8"/>
      ${extra.replace(/\{top\}/g, `matrix(.866,-.5,-.866,-.5,${pt(Ft)})`).replace(/\{der\}/g, `matrix(.866,-.5,0,-1,${pt(F)})`).replace(/\{izq\}/g, `matrix(-.866,-.5,0,-1,${pt(F)})`)}`;
  }
  // caja centrada en el punto del suelo (cx, cy)
  const cajaC = (cx, cy, sx, sy, sz, col, extra) => caja([cx - .433 * (sx - sy), cy + .25 * (sx + sy)], sx, sy, sz, col, extra);
  const flechas = (sx, sy) => {
    const cx = sx / 2, cy = sy / 2, a = Math.min(sx, sy) * .3;
    return `<g transform="{top}" stroke="#fff" stroke-width="2" fill="none" opacity=".9"><path d="M${cx - a},${cy}H${cx + a}M${cx + a - 3.5},${cy - 3.5}L${cx + a},${cy}L${cx + a - 3.5},${cy + 3.5}M${cx - a + 3.5},${cy - 3.5}L${cx - a},${cy}L${cx - a + 3.5},${cy + 3.5}"/></g>`;
  };
  const ALTO = { nube: 64, router: 34, firewall: 58, core: 92, switch: 26, servidor: 66, almacen: 62, wlc: 26, ap: 34, pc: 52, portatil: 34, telefono: 24, impresora: 34, camara: 34, movil: 34 };

  function arte(e, cx, cy) {
    const t = e.t;
    if (t === 'nube') {
      const col = e.c || '#38bdf8', y = cy - 22;
      return `<path d="M${cx - 44},${y + 10} a17,17 0 0 1 8,-31 a22,22 0 0 1 40,-8 a17,17 0 0 1 27,16 a14,14 0 0 1 -5,23 z" fill="${tono(col, .82)}" stroke="${col}" stroke-width="2"/>
        <path d="M${cx - 18},${y - 6}h36M${cx - 10},${y + 1}h20" stroke="${col}" stroke-width="2.4" opacity=".7"/>`;
    }
    if (t === 'router') {
      const col = '#ef4444', rx = 25, ry = 12.5, h = 17, top = cy - h;
      return `<path d="M${cx - rx},${top} v${h} a${rx},${ry} 0 0 0 ${2 * rx},0 v${-h}" fill="${tono(col, -.3)}"/>
        <path d="M${cx},${top + ry} v${h}" stroke="${tono(col, -.5)}" stroke-width="${rx}" opacity=".3"/>
        <ellipse cx="${cx}" cy="${top}" rx="${rx}" ry="${ry}" fill="${tono(col, .2)}" stroke="${tono(col, .55)}"/>
        <g stroke="#fff" stroke-width="2" fill="none" opacity=".92"><path d="M${cx - 14},${top}h28M${cx + 10},${top - 3}l4,3l-4,3M${cx - 10},${top - 3}l-4,3l4,3"/><path d="M${cx - 5},${top - 6}l10,12" opacity=".7"/></g>`;
    }
    if (t === 'firewall') {
      const col = '#dc2626', sx = 46, sy = 30, sz = 46;
      const ladrillos = (w) => Array.from({ length: 5 }, (_, f) => Array.from({ length: Math.ceil(w / 12) + 1 }, (_, k) => {
        const x = k * 12 - (f % 2 ? 6 : 0); return x < w && x + 11 > 0 ? `<rect x="${Math.max(x, 0) + .8}" y="${f * 9.2 + .8}" width="${Math.min(11, w - x, x + 11) - 1.6}" height="7.6" rx="1"/>` : '';
      }).join('')).join('');
      return cajaC(cx, cy, sx, sy, sz, col, `<g transform="{der}" fill="${tono(col, -.55)}" opacity=".55">${ladrillos(sx)}</g><g transform="{izq}" fill="${tono(col, -.35)}" opacity=".45">${ladrillos(sy)}</g>
        <g transform="{top}"><path d="M${sx / 2},${sy * .2}c5,6 6,10 0,${sy * .6}c-6,-4 -6,-10 0,-${sy * .6}z" fill="#fde68a" opacity=".95"/></g>`);
    }
    if (t === 'core') {
      const col = '#334155', sx = 42, sy = 42, sz = 86;
      const ranuras = Array.from({ length: 9 }, (_, i) => `<rect x="4" y="${8 + i * 8.4}" width="${sx - 8}" height="5" rx="1" fill="${tono(col, -.6)}"/><rect x="${sx - 12}" y="${9.5 + i * 8.4}" width="5" height="2" fill="#38bdf8" class="led" style="animation-delay:${(i * .17).toFixed(2)}s"/>`).join('');
      return cajaC(cx, cy, sx, sy, sz, col, `<g transform="{der}">${ranuras}</g><g transform="{izq}"><rect x="6" y="${sz - 18}" width="${sy - 12}" height="10" rx="2" fill="#1e3a8a"/><rect x="9" y="${sz - 15}" width="${sy - 18}" height="4" fill="#60a5fa" opacity=".8"/></g>` + flechas(sx, sy));
    }
    if (t === 'switch' || t === 'wlc') {
      const col = e.c || (t === 'wlc' ? '#f59e0b' : '#3b82f6'), sx = e.grande ? 70 : 60, sy = 34, sz = e.grande ? 18 : 13;
      const p = Array.from({ length: 10 }, (_, i) => `<rect x="${5 + i * 5.4}" y="${sz * .3}" width="3.6" height="${sz * .4}" fill="${tono(col, -.75)}"/>`).join('');
      return cajaC(cx, cy, sx, sy, sz, col, flechas(sx, sy) + `<g transform="{der}">${p}<circle cx="${sx - 5}" cy="${sz * .5}" r="1.8" fill="#4ade80" class="led"/></g>`);
    }
    if (t === 'servidor') {
      const col = e.c || '#8b5cf6', sx = 30, sy = 38, sz = 58;
      const r = [10, 19, 28, 37, 46].map(y => `<rect x="4" y="${y}" width="${sy - 14}" height="4" rx="1" fill="${tono(col, -.65)}"/>`).join('');
      return cajaC(cx, cy, sx, sy, sz, col, `<g transform="{izq}">${r}<circle cx="${sy - 6}" cy="${sz - 8}" r="2" fill="#4ade80" class="led"/></g><g transform="{der}"><rect x="5" y="8" width="${sx - 10}" height="${sz - 16}" rx="2" fill="${tono(col, -.5)}" opacity=".35"/></g>`);
    }
    if (t === 'almacen') {
      const col = e.c || '#0d9488', sx = 50, sy = 36, sz = 34;
      const discos = Array.from({ length: 3 }, (_, f) => Array.from({ length: 6 }, (_, k) => `<rect x="${4 + k * 7.5}" y="${5 + f * 9.5}" width="6" height="7.5" rx="1" fill="${tono(col, -.6)}"/><circle cx="${7 + k * 7.5}" cy="${7 + f * 9.5}" r=".9" fill="#86efac" class="led" style="animation-delay:${((f * 6 + k) * .11).toFixed(2)}s"/>`).join('')).join('');
      return cajaC(cx, cy, sx, sy, sz, col, `<g transform="{der}">${discos}</g>`);
    }
    if (t === 'ap') {
      const col = '#f59e0b';
      return `<ellipse cx="${cx}" cy="${cy}" rx="17" ry="8.5" fill="${tono(col, -.35)}"/><rect x="${cx - 17}" y="${cy - 6}" width="34" height="6" fill="${tono(col, -.35)}"/>
        <ellipse cx="${cx}" cy="${cy - 6}" rx="17" ry="8.5" fill="${tono(col, .25)}" stroke="${tono(col, .55)}"/><circle cx="${cx}" cy="${cy - 6}" r="2.4" fill="#fff"/>
        <g class="ondas">${[12, 19, 26].map(r => `<path d="M${cx - r * .75},${cy - 16 - r * .35} a${r},${r * .55} 0 0 1 ${r * 1.5},0"/>`).join('')}</g>`;
    }
    if (t === 'pc') {
      const col = '#64748b';
      return cajaC(cx, cy, 24, 18, 4, col) + cajaC(cx + 2, cy - 3, 6, 4, 10, col) +
        caja([cx - 18, cy - 4], 40, 5, 30, col, `<g transform="{der}"><rect x="3" y="3" width="34" height="24" rx="1" fill="${tono(col, -.75)}"/><rect x="5" y="5" width="30" height="20" fill="#38bdf8" opacity=".45"/></g>`);
    }
    if (t === 'portatil') {
      const col = '#475569';
      return cajaC(cx, cy, 34, 24, 3, col, `<g transform="{top}"><rect x="4" y="4" width="22" height="12" rx="1" fill="${tono(col, -.4)}"/></g>`) +
        caja([cx - 4, cy - 14], 34, 2, 22, col, `<g transform="{der}"><rect x="2" y="2" width="30" height="18" fill="#93c5fd" opacity=".5"/></g>`);
    }
    if (t === 'movil') {
      const col = '#ec4899';
      return caja([cx - 6, cy + 4], 16, 4, 30, col, `<g transform="{der}"><rect x="1.5" y="2" width="13" height="26" rx="1.5" fill="#fbcfe8" opacity=".6"/></g>`) + caja([cx + 14, cy + 2], 16, 4, 24, '#475569', `<g transform="{der}"><rect x="1.5" y="2" width="13" height="20" rx="1.5" fill="#93c5fd" opacity=".55"/></g>`);
    }
    if (t === 'telefono') {
      const col = '#0f766e';
      return cajaC(cx, cy, 26, 20, 8, col, `<g transform="{top}"><rect x="3" y="4" width="10" height="12" rx="1" fill="#99f6e4" opacity=".7"/>${[0, 1, 2].map(i => `<rect x="15" y="${4 + i * 4.2}" width="7" height="3" rx="1" fill="${tono(col, -.5)}"/>`).join('')}</g>`) +
        caja([cx - 14, cy - 5], 6, 22, 6, tono(col, -.2));
    }
    if (t === 'impresora') {
      const col = '#94a3b8';
      return cajaC(cx, cy, 38, 30, 22, col, `<g transform="{der}"><rect x="6" y="12" width="26" height="4" rx="1" fill="${tono(col, -.6)}"/><circle cx="33" cy="6" r="1.8" fill="#4ade80" class="led"/></g><g transform="{top}"><rect x="8" y="8" width="20" height="14" fill="#fff" opacity=".9"/></g>`);
    }
    if (t === 'camara') {
      const col = '#334155';
      return cajaC(cx, cy, 6, 6, 18, col) + cajaC(cx - 2, cy - 18, 26, 14, 12, '#e2e8f0', `<g transform="{izq}"><circle cx="7" cy="6" r="4.5" fill="#0f172a"/><circle cx="7" cy="6" r="2" fill="#38bdf8"/></g><g transform="{der}"><circle cx="22" cy="9" r="1.5" fill="#ef4444" class="led"/></g>`);
    }
    return cajaC(cx, cy, 30, 30, 20, '#64748b');
  }

  /* ================== RUTAS DE CABLE ================== */
  function rutaPlano(l) {
    const A = porId[l.a], B = porId[l.b], a = [A.X, A.Y], b = [B.X, B.Y];
    if (Array.isArray(l.r)) return [a, ...l.r, b];
    if (A.X === B.X || A.Y === B.Y) return [a, b];
    const r = l.r || 'm';
    if (r === 'x') return [a, [B.X, A.Y], b];
    if (r === 'y') return [a, [A.X, B.Y], b];
    if (r === 'my') { const my = l.my ?? (A.Y + B.Y) / 2; return [a, [A.X, my], [B.X, my], b]; }
    const mx = l.mx ?? (A.X + B.X) / 2; return [a, [mx, A.Y], [mx, B.Y], b];
  }
  function trazo(pts) {   // polilínea con esquinas redondeadas; devuelve d, largo y punto medio del tramo más largo
    const P = pts.map(p => iso(p[0], p[1], 2));
    let d = `M${pt(P[0])}`, largo = 0, mejor = { l: 0, p: P[0] };
    for (let i = 1; i < P.length; i++) {
      const A = P[i - 1], B = P[i], seg = Math.hypot(B[0] - A[0], B[1] - A[1]);
      largo += seg;
      if (seg > mejor.l) mejor = { l: seg, p: [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2] };
      const C = P[i + 1];
      if (!C) { d += ` L${pt(B)}`; break; }
      const s2 = Math.hypot(C[0] - B[0], C[1] - B[1]), r = Math.min(12, seg / 2, s2 / 2);
      const u1 = [(B[0] - A[0]) / seg, (B[1] - A[1]) / seg], u2 = [(C[0] - B[0]) / s2, (C[1] - B[1]) / s2];
      d += ` L${pt([B[0] - u1[0] * r, B[1] - u1[1] * r])} Q${pt(B)} ${pt([B[0] + u2[0] * r, B[1] + u2[1] * r])}`;
    }
    return { d, largo, medio: mejor.p };
  }

  /* ================== ESTADO Y SIMULACIONES ================== */
  let sim = null;            // 'isp' | 'fw1' | 'core1' | 'ataque' | 'backup' | null
  const caidos = () => sim === 'fw1' ? ['fw1'] : sim === 'core1' ? ['c1'] : [];
  function estadoEquipo(e) {
    if (caidos().includes(e.id)) return 'caido';
    if (e.id === 'fw2' && sim === 'fw1') return 'ok';
    if (e.id === 'r2' && sim === 'isp') return 'ok';
    return e.e || 'ok';
  }
  const RUTA_BACKUP = new Set(['tor-h1', 'tor-h2', 'tor-h3', 'tor-san', 'tor-bk', 'tor-nas', 'c1-tor', 'fw1-c1', 'fw1-bkn']);
  function estadoEnlace(l) {
    const cd = caidos();
    if (cd.includes(l.a) || cd.includes(l.b)) return 'caido';
    if (sim === 'isp' && l.a === 'inet' && l.b === 'r1') return 'caido';
    if (sim === 'isp' && l.a === 'r1' && l.b === 'fw1') return 'standby';
    if (l.si && l.si === sim) return 'activo';
    return l.modo;
  }
  function carga(l) {   // velocidad de las luces: más carga cuando un gemelo ha caído
    if (sim === 'core1' && (l.a === 'c2' || l.b === 'c2')) return 1.9;
    if (sim === 'fw1' && (l.a === 'fw2' || l.b === 'fw2')) return 1.4;
    if (sim === 'backup' && RUTA_BACKUP.has(`${l.a}-${l.b}`)) return 2.2;
    return 1;
  }

  /* ================== PINTAR ================== */
  const svg = $('#mapa');
  let selec = null, resalteZona = null;
  function pintar() {
    const t0 = performance.now() / 1000;
    // zonas pintadas en el suelo
    const zonas = ZONAS.map(z => {
      const p = [iso(z.x[0], z.y[0]), iso(z.x[1], z.y[0]), iso(z.x[1], z.y[1]), iso(z.x[0], z.y[1])];
      const o = iso(z.x[0] + .25, z.y[0] + .45);
      return `<g class="zona-g ${resalteZona === z.id ? 'vivo' : ''}" data-z="${z.id}" style="--c:${z.c}">
        <polygon class="zona-p" points="${p.map(pt).join(' ')}"/>
        <g transform="matrix(.866,.5,-.866,.5,${pt(o)})"><text class="zona-t" x="0" y="0">${esc(z.n)}</text><text class="zona-s" x="0" y="15">${esc(z.s)}</text></g></g>`;
    }).join('');
    // cables
    let halos = '', cabs = '', luces = '', etqC = '', conect = '';
    EN.forEach(l => {
      const est = estadoEnlace(l), { d, largo, medio } = trazo(rutaPlano(l));
      const verde = sim === 'backup' && RUTA_BACKUP.has(`${l.a}-${l.b}`) ? ' verde realce' : '';
      const cls = `t-${l.tipo} ${est}${verde}`, cE = `data-a="${l.a}" data-b="${l.b}"`;
      halos += `<path class="cab-halo ${cls}" ${cE} d="${d}"/>`;
      cabs += `<path id="${l.id}" class="cab ${cls}" ${cE} d="${d}"/>`;
      const A = iso(porId[l.a].X, porId[l.a].Y, 2), B = iso(porId[l.b].X, porId[l.b].Y, 2);
      if (l.et) {
        const w = l.et.length * 5.9 + 12;
        etqC += `<g class="etq-cab" ${cE} transform="translate(${pt(medio)})"><rect x="${-w / 2}" y="-8" width="${w}" height="16" rx="8"/><text x="0" y="3.3" text-anchor="middle">${esc(l.et)}</text></g>`;
      }
      if (est !== 'activo' || !suave) return;
      const vel = 95 * carga(l), dur = Math.max(1.4, largo / vel), f = -((t0 + l.id.length) % dur);
      const luz = (r, cl, ini, inv) => `<circle r="${r}" class="${cl}"><animateMotion dur="${dur.toFixed(2)}s" begin="${ini.toFixed(2)}s" repeatCount="indefinite"${inv ? ' keyPoints="1;0" keyTimes="0;1" calcMode="linear"' : ''}><mpath href="#${l.id}"/></animateMotion></circle>`;
      luces += `<g class="luz t-${l.tipo}${verde}" ${cE}>${luz(7.5, 'estela', f + .06)}${luz(4.2, 'estela2', f + .03)}${luz(2.5, '', f)}${l.tipo !== 'wifi' ? luz(2.1, '', f - dur / 2, true) : ''}${carga(l) > 1.3 ? luz(2.4, '', f - dur / 4) : ''}</g>`;
    });
    // equipos, del fondo hacia delante
    const orden = [...EQ].sort((a, b) => (a.X + a.Y) - (b.X + b.Y));
    let equipos = '', etqs = '';
    orden.forEach(e => {
      const [cx, cy] = iso(e.X, e.Y), est = estadoEquipo(e), col = e.c || zonaColor[e.z];
      conect += '';
      equipos += `<g class="disp ${est} ${selec === e.id ? 'sel' : ''}" data-id="${e.id}" data-z="${e.z}">
        <ellipse class="halo" cx="${cx}" cy="${cy}" rx="44" ry="22" fill="url(#halo)" opacity=".55" style="color:${col}"/>
        <ellipse class="anillo-sel" cx="${cx}" cy="${cy}" rx="48" ry="24"/>
        <ellipse class="alarma" cx="${cx}" cy="${cy}" rx="40" ry="20"/>
        <g class="cuerpo">${arte(e, cx, cy)}</g></g>`;
      const h = ALTO[e.t] || 40, ty = cy - h - 18, w = Math.max(e.n.length * 6.6, e.ip.length * 5.8) + 22;
      const chip = est === 'standby' ? ['EN ESPERA', '#64748b'] : est === 'caido' ? ['CAÍDO', '#dc2626'] : (e.id === 'fw2' && sim === 'fw1') || (e.id === 'r2' && sim === 'isp') ? ['ACTIVO', '#16a34a'] : null;
      etqs += `<g class="etq" data-id="${e.id}" data-z="${e.z}" transform="translate(${cx.toFixed(1)},${ty.toFixed(1)})" style="--c:${col}">
        <rect x="${-w / 2}" y="-15" width="${w}" height="31" rx="7"/><rect class="barra-c" x="${-w / 2}" y="-15" width="4" height="31" rx="2"/>
        <text class="nom" x="${-w / 2 + 11}" y="-2">${esc(e.n)}</text><text class="ip" x="${-w / 2 + 11}" y="10">${esc(e.ip)}</text>
        ${chip ? `<g transform="translate(${w / 2 - 4},-15)"><rect x="${-chip[0].length * 5.6 - 10}" y="-9" width="${chip[0].length * 5.6 + 10}" height="15" rx="7.5" fill="${chip[1]}" stroke="none"/><text class="chip-e" x="${-chip[0].length * 2.8 - 5}" y="1.5" text-anchor="middle" fill="#fff">${chip[0]}</text></g>` : ''}</g>`;
    });
    svg.innerHTML = `<defs>
        <radialGradient id="halo"><stop offset="0" stop-color="currentColor" stop-opacity=".5"/><stop offset=".6" stop-color="currentColor" stop-opacity=".14"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></radialGradient>
        <filter id="brillo" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <g id="mundo">${zonas}<g class="halos">${halos}</g><g class="cables">${cabs}</g><g id="luces">${luces}</g>${etqC}${equipos}<g id="efectos"></g>${etqs}</g>`;
    aplicarVista();
    aplicarFoco();
  }

  /* ================== FOCO (hover, zona, selección) ================== */
  let hover = null;
  function aplicarFoco() {
    const ids = new Set();
    let zona = resalteZona;
    const foco = hover || selec;
    if (foco) { ids.add(foco); EN.forEach(l => { if (l.a === foco) ids.add(l.b); if (l.b === foco) ids.add(l.a); }); }
    if (zona) EQ.filter(e => e.z === zona).forEach(e => ids.add(e.id));
    const activo = !!(foco || zona);
    svg.classList.toggle('foco', activo);
    if (!activo) return;
    $$('.disp, .etq', svg).forEach(g => g.classList.toggle('vivo', ids.has(g.dataset.id)));
    $$('[data-a]', svg).forEach(p => {
      const a = p.dataset.a, b = p.dataset.b;
      const vivo = foco ? (a === foco || b === foco) : (ids.has(a) && ids.has(b)) || (ids.has(a) || ids.has(b));
      p.classList.toggle('vivo', vivo);
    });
    $$('.zona-g', svg).forEach(z => z.classList.toggle('vivo', z.dataset.z === zona || (foco && porId[foco].z === z.dataset.z)));
  }

  /* ================== CÁMARA: zoom y desplazamiento ================== */
  const lienzo = $('#lienzo');
  let vista = null, base = null;
  function aplicarVista() { if (vista) svg.setAttribute('viewBox', `${vista.x} ${vista.y} ${vista.w} ${vista.h}`); }
  function ajustar(anim = true) {
    const m = $('#mundo', svg).getBBox(), pad = 40;
    const r = lienzo.getBoundingClientRect(), asp = r.width / r.height;
    let w = m.width + pad * 2, h = m.height + pad * 2;
    if (w / h < asp) w = h * asp; else h = w / asp;
    base = { x: m.x + m.width / 2 - w / 2, y: m.y + m.height / 2 - h / 2, w, h };
    irA(base, anim);
  }
  function irA(dest, anim = true) {
    if (!vista) vista = { ...dest };
    if (!anim || !suave) { Object.assign(vista, dest); aplicarVista(); return; }
    gsap.to(vista, { ...dest, duration: 1.1, ease: 'power3.inOut', onUpdate: aplicarVista });
  }
  function enfocar(ids, margen = 1.25) {   // encuadra un grupo de equipos
    const P = ids.map(id => iso(porId[id].X, porId[id].Y)).concat(ids.map(id => iso(porId[id].X, porId[id].Y, ALTO[porId[id].t] + 40)));
    const xs = P.map(p => p[0]), ys = P.map(p => p[1]);
    const r = lienzo.getBoundingClientRect(), asp = r.width / r.height;
    let w = (Math.max(...xs) - Math.min(...xs) + 220) * margen, h = (Math.max(...ys) - Math.min(...ys) + 160) * margen;
    if (w / h < asp) w = h * asp; else h = w / asp;
    irA({ x: (Math.max(...xs) + Math.min(...xs)) / 2 - w / 2, y: (Math.max(...ys) + Math.min(...ys)) / 2 - h / 2 + 20, w, h });
  }
  function zoom(f, cx = .5, cy = .5) {
    gsap.killTweensOf(vista);
    const nw = Math.min(Math.max(vista.w * f, base.w * .18), base.w * 2.5), k = nw / vista.w;
    vista.x += (vista.w - nw) * cx; vista.y += (vista.h - vista.h * k) * cy; vista.w = nw; vista.h *= k;
    aplicarVista();
  }
  lienzo.addEventListener('wheel', e => {
    if (e.target.closest('.vidrio')) return;
    e.preventDefault();
    const r = svg.getBoundingClientRect();
    zoom(e.deltaY > 0 ? 1.12 : 1 / 1.12, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
  }, { passive: false });
  const punteros = new Map();
  let arrastre = null, movido = false, pinza = null;
  lienzo.addEventListener('pointerdown', e => {
    if (e.target.closest('.vidrio')) return;
    punteros.set(e.pointerId, [e.clientX, e.clientY]);
    lienzo.setPointerCapture(e.pointerId);
    movido = false;
    if (punteros.size === 1) arrastre = { x: e.clientX, y: e.clientY, vx: vista.x, vy: vista.y };
    if (punteros.size === 2) { const [p, q] = [...punteros.values()]; pinza = { d: Math.hypot(p[0] - q[0], p[1] - q[1]), w: vista.w }; }
  });
  lienzo.addEventListener('pointermove', e => {
    if (!punteros.has(e.pointerId)) return mostrarTip(e);
    punteros.set(e.pointerId, [e.clientX, e.clientY]);
    const r = svg.getBoundingClientRect(), k = vista.w / r.width;
    if (punteros.size === 2 && pinza) {
      const [p, q] = [...punteros.values()], d = Math.hypot(p[0] - q[0], p[1] - q[1]);
      zoom((pinza.w * pinza.d / d) / vista.w, ((p[0] + q[0]) / 2 - r.left) / r.width, ((p[1] + q[1]) / 2 - r.top) / r.height);
      movido = true; return;
    }
    if (!arrastre) return;
    const dx = e.clientX - arrastre.x, dy = e.clientY - arrastre.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) { movido = true; lienzo.classList.add('arrastrando'); ocultarTip(); }
    gsap.killTweensOf(vista);
    vista.x = arrastre.vx - dx * k; vista.y = arrastre.vy - dy * k; aplicarVista();
  });
  const soltar = e => {
    punteros.delete(e.pointerId); if (punteros.size < 2) pinza = null;
    if (!punteros.size) { arrastre = null; lienzo.classList.remove('arrastrando'); }
  };
  lienzo.addEventListener('pointerup', e => {
    const fueClick = !movido && punteros.size === 1;
    soltar(e);
    if (!fueClick) return;
    const d = document.elementFromPoint(e.clientX, e.clientY)?.closest('.disp, .etq');
    if (d) abrirFicha(d.dataset.id); else if (!e.target.closest('.vidrio')) cerrarFicha();
  });
  lienzo.addEventListener('pointercancel', soltar);
  $('#zMas').addEventListener('click', () => zoom(1 / 1.3));
  $('#zMenos').addEventListener('click', () => zoom(1.3));
  $('#zAjustar').addEventListener('click', () => ajustar());
  addEventListener('resize', () => ajustar(false));

  /* ================== TOOLTIP Y HOVER ================== */
  const tip = $('#tip');
  function mostrarTip(e) {
    const d = e.target.closest?.('.disp, .etq');
    const id = d ? d.dataset.id : null;
    if (id !== hover) { hover = id; aplicarFoco(); }
    if (!d || e.pointerType !== 'mouse') return ocultarTip();
    const eq = porId[id], r = lienzo.getBoundingClientRect();
    tip.innerHTML = `<b>${esc(eq.n)}</b><span>${esc(eq.tipo)} · ${esc(eq.ip)}</span>`;
    tip.style.left = Math.min(e.clientX - r.left + 14, r.width - tip.offsetWidth - 8) + 'px';
    tip.style.top = (e.clientY - r.top + 16) + 'px';
    tip.style.opacity = 1;
  }
  function ocultarTip() { tip.style.opacity = 0; }
  lienzo.addEventListener('pointerleave', () => { hover = null; aplicarFoco(); ocultarTip(); });

  /* ================== FICHA ================== */
  const ficha = $('#ficha');
  function abrirFicha(id) {
    selec = id;
    const e = porId[id], est = estadoEquipo(e), col = e.c || zonaColor[e.z];
    const estTxt = { ok: ['Operativo', '#16a34a'], standby: ['En espera (respaldo)', '#64748b'], caido: ['Caído', '#dc2626'] }[est];
    const con = EN.filter(l => l.a === id || l.b === id).map(l => {
      const otro = porId[l.a === id ? l.b : l.a], st = estadoEnlace(l);
      return `<li><button data-ir="${otro.id}"><span>${esc(otro.n)}</span><small>${l.tipo}${st !== 'activo' ? ' · ' + st : ''}</small></button></li>`;
    }).join('');
    $('#fichaIn').innerHTML = `<p class="f-tipo" style="--c:${col}">${esc(e.tipo)}</p><h3>${esc(e.n)}</h3>
      <span class="f-estado" style="--e:${estTxt[1]}">${estTxt[0]}</span><p>${esc(e.d)}</p>
      <dl><dt>Dirección</dt><dd>${esc(e.ip)}</dd><dt>Zona</dt><dd>${esc(ZONAS.find(z => z.id === e.z).n)}</dd></dl>
      <h4>Conexiones (${EN.filter(l => l.a === id || l.b === id).length})</h4><ul>${con}</ul>`;
    ficha.hidden = false;
    if (suave) gsap.fromTo(ficha, { x: 20, opacity: 0 }, { x: 0, opacity: 1, duration: .35, ease: 'power3.out' });
    $$('.disp', svg).forEach(g => g.classList.toggle('sel', g.dataset.id === id));
    aplicarFoco();
  }
  function cerrarFicha() { selec = null; ficha.hidden = true; $$('.disp.sel', svg).forEach(g => g.classList.remove('sel')); aplicarFoco(); }
  $('#fichaX').addEventListener('click', cerrarFicha);
  ficha.addEventListener('click', e => { const b = e.target.closest('[data-ir]'); if (b) { abrirFicha(b.dataset.ir); enfocar([b.dataset.ir], 2.2); } });

  /* ================== CHIPS DE ZONA ================== */
  const capas = $('#capas');
  capas.innerHTML = `<button class="on" data-z="">Todo</button>` + ZONAS.map(z => `<button data-z="${z.id}" style="--c:${z.c}"><i></i>${z.n}</button>`).join('');
  capas.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', capas).forEach(x => x.classList.toggle('on', x === b));
    resalteZona = b.dataset.z || null;
    pintar();
    if (resalteZona) enfocar(EQ.filter(x => x.z === resalteZona).map(x => x.id)); else ajustar();
  });

  /* ================== BANNER ================== */
  const banner = $('#banner');
  let relojes = [];
  function limpiarRelojes() { relojes.forEach(t => t.kill ? t.kill() : clearTimeout(t)); relojes = []; }
  function mostrarBanner(tit, pasos, pie = '') {
    $('#banTit').textContent = tit;
    $('#banPasos').innerHTML = pasos.map(([t, txt]) => `<li><time>${t}</time><span>${txt}</span></li>`).join('');
    $('#banPie').innerHTML = pie;
    banner.hidden = false;
    if (suave) gsap.fromTo(banner, { y: -12, opacity: 0 }, { y: 0, opacity: 1, duration: .35 });
    $$('#banPasos li').forEach((li, i) => relojes.push(setTimeout(() => li.classList.add('on'), suave ? i * 1300 : 0)));
  }
  $('#banCerrar').addEventListener('click', () => { if (tour.activo) terminarTour(); else simular(null); });

  function ponerEstado(nivel, txt) {
    const e = $('#estado'); e.className = 'estado ' + nivel; $('span', e).textContent = txt;
  }

  /* ================== SIMULACIONES ================== */
  const GUION = {
    isp: ['Cae la fibra del operador principal', [['00:00', 'Se corta la fibra (obra en la calle).'], ['00:01', 'El firewall deja de recibir respuesta del operador 1.'], ['00:03', 'SD-WAN conmuta solo al router 5G del operador 2.'], ['00:04', 'La empresa sigue trabajando. Aviso al técnico por Telegram.']], 'aviso', 'Funcionando por 5G de respaldo'],
    fw1: ['Falla el firewall principal', [['00:00', 'FW1 se apaga por una avería de hardware.'], ['00:00,8', 'FW2 deja de recibir el latido de alta disponibilidad.'], ['00:01', 'FW2 asume la IP y las sesiones abiertas: nadie nota el corte.'], ['+4 h', 'Se sustituye FW1 en garantía y vuelve a ser el principal.']], 'aviso', 'FW2 activo · redundancia degradada'],
    core1: ['Falla un switch del núcleo', [['00:00', 'CORE-1 se reinicia de forma inesperada.'], ['00:00,2', 'Los enlaces hacia CORE-1 caen; el protocolo de enrutamiento lo detecta.'], ['00:01', 'Todo el tráfico pasa por CORE-2 (más luces en sus cables).'], ['00:02', 'Usuarios, servidores y teléfonos siguen funcionando.']], 'aviso', 'Núcleo funcionando con un solo equipo'],
    ataque: ['Ataque desde Internet', [['00:00', 'Llegan miles de intentos de acceso desde una botnet.'], ['00:00', 'El IPS del firewall reconoce el patrón y los bloquea.'], ['00:01', 'El SIEM correlaciona los eventos y abre una alerta.'], ['00:02', 'La IP atacante queda bloqueada 24 h. Ningún paquete entra.']], 'ok', 'Ataque bloqueado en el perímetro'],
    backup: ['Copia de seguridad 3-2-1', [['02:00', 'El servidor de backup copia las máquinas virtuales.'], ['02:40', '1.ª copia: producción. 2.ª copia: NAS local inmutable.'], ['03:10', '3.ª copia: cifrada y enviada fuera, a la nube.'], ['03:15', 'Verificación automática de que las copias se pueden restaurar.']], 'ok', 'Copia nocturna en curso'],
  };
  const sims = $('#sims');
  function simular(nombre) {
    limpiarRelojes();
    $('#efectos', svg) && ($('#efectos', svg).innerHTML = '');
    sim = nombre && nombre !== 'nada' ? nombre : null;
    $$('button', sims).forEach(b => b.classList.toggle('on', b.dataset.sim === sim));
    pintar();
    if (!sim) { banner.hidden = true; ponerEstado('', 'Todo operativo'); actualizarResumen(); return; }
    const [tit, pasos, nivel, estado] = GUION[sim];
    let pie = '';
    if (sim === 'ataque') pie = `Amenazas bloqueadas hoy: <strong id="contador">1.204</strong>`;
    if (sim === 'backup') pie = `Progreso: <strong id="pct">0 %</strong><div class="prog"><span id="progBk"></span></div>`;
    mostrarBanner(tit, pasos, pie);
    ponerEstado(nivel, estado);
    actualizarResumen();
    const zonasSim = { isp: ['inet', 'r1', 'r2', 'fw1', 'fw2'], fw1: ['r1', 'fw1', 'fw2', 'c1', 'c2', 'dmzsw'], core1: ['c1', 'c2', 'd1', 'd2', 'tor', 'fw1'], ataque: ['inet', 'r1', 'fw1', 'fw2', 'c1'], backup: ['tor', 'h1', 'h3', 'bk', 'nas', 'fw1', 'bkn', 'c1'] };
    enfocar(zonasSim[sim], 1.15);
    if (sim === 'ataque') ataque();
    if (sim === 'backup' && suave) {
      const o = { v: 0 };
      relojes.push(gsap.to(o, { v: 100, duration: 9, ease: 'none', onUpdate: () => { const p = $('#pct'), b = $('#progBk'); if (p) p.textContent = Math.round(o.v) + ' %'; if (b) b.style.width = o.v + '%'; } }));
    }
  }
  sims.addEventListener('click', e => { const b = e.target.closest('[data-sim]'); if (!b) return; if (tour.activo) terminarTour(); simular(b.dataset.sim === sim ? null : b.dataset.sim); });

  // Paquetes rojos que llegan desde Internet y revientan contra el firewall
  function ataque() {
    if (!suave) return;
    const capa = $('#efectos', svg), ruta1 = $(`#${EN.find(l => l.a === 'inet' && l.b === 'r1').id}`, svg), ruta2 = $(`#${EN.find(l => l.a === 'r1' && l.b === 'fw1').id}`, svg);
    const [fx, fy] = iso(porId.fw1.X, porId.fw1.Y, 30);
    let n = 1204;
    const lanzar = () => {
      if (sim !== 'ataque') return;
      const c = document.createElementNS(NS, 'circle'); c.setAttribute('r', 4.5); c.setAttribute('class', 'paquete-malo'); capa.appendChild(c);
      const L1 = ruta1.getTotalLength(), L2 = ruta2.getTotalLength(), o = { t: 0 };
      gsap.to(o, { t: 1, duration: 1.6, ease: 'none', onUpdate: () => {
        const p = o.t < .55 ? ruta1.getPointAtLength(o.t / .55 * L1) : ruta2.getPointAtLength((o.t - .55) / .45 * L2);
        c.setAttribute('cx', p.x); c.setAttribute('cy', p.y);
      }, onComplete: () => {
        c.remove();
        const b = document.createElementNS(NS, 'circle'); b.setAttribute('class', 'estallido'); b.setAttribute('cx', fx); b.setAttribute('cy', fy); b.setAttribute('r', 6); capa.appendChild(b);
        gsap.to(b, { attr: { r: 34 }, opacity: 0, duration: .6, ease: 'power2.out', onComplete: () => b.remove() });
        const k = $('#contador'); if (k) k.textContent = (++n).toLocaleString('es-ES');
      } });
    };
    lanzar();
    const iv = setInterval(lanzar, 380);
    relojes.push({ kill: () => clearInterval(iv) });
  }

  /* ================== TOUR GUIADO ================== */
  const PARADAS = [
    ['Una red en 3 capas', 'Separamos la red en <b>acceso</b> (donde se conectan las personas), <b>distribución</b> (una por edificio) y <b>núcleo</b> (el corazón). Así crece sin rehacerla y un fallo queda contenido.', null],
    ['1 · Perímetro', 'Dos operadores distintos (fibra + 5G) y dos firewalls en alta disponibilidad. Si cualquiera de ellos falla, otro toma el relevo solo.', 'perimetro'],
    ['2 · DMZ', 'Lo que se publica en Internet (web, correo) vive en una red aparte. Si alguien lo ataca, no puede saltar a la red interna.', 'dmz'],
    ['3 · Núcleo', 'Dos switches de 40 Gbps que funcionan como uno solo. Cada switch de distribución y el CPD se conectan a los dos.', 'nucleo'],
    ['4 · CPD', 'Tres hipervisores en clúster, almacenamiento compartido, directorio, monitorización con SIEM y un servidor de backup.', 'cpd'],
    ['5 · Distribución', 'Un switch L3 por edificio, con doble subida al núcleo. Aplica políticas entre VLAN cerca de los usuarios.', 'dist'],
    ['6 · Acceso', 'Switches PoE que alimentan teléfonos, cámaras y WiFi. Cada servicio en su VLAN: la WiFi de invitados y las cámaras, aisladas.', 'accesoA'],
    ['7 · Nube y backups', 'Ofimática en la nube, servidores en una VPC unida por VPN y copias 3-2-1 con una copia inmutable fuera de la oficina.', 'nube'],
  ];
  const tour = { activo: false, i: 0 };
  function parada(i) {
    tour.i = i;
    const [t, txt, z] = PARADAS[i];
    resalteZona = z; pintar();
    $$('button', capas).forEach(b => b.classList.toggle('on', (b.dataset.z || null) === z));
    $('#banTit').textContent = t;
    $('#banPasos').innerHTML = '';
    $('#banPie').innerHTML = `<p class="tour-txt">${txt}</p><div class="tour-nav"><button id="tAnt" ${i === 0 ? 'disabled' : ''}>← Anterior</button><span>${i + 1} / ${PARADAS.length}</span><button class="prim" id="tSig">${i === PARADAS.length - 1 ? 'Terminar' : 'Siguiente →'}</button></div>`;
    banner.hidden = false;
    $('#tAnt').onclick = () => i > 0 && parada(i - 1);
    $('#tSig').onclick = () => i < PARADAS.length - 1 ? parada(i + 1) : terminarTour();
    if (z) enfocar(EQ.filter(x => x.z === z || (z === 'accesoA' && x.z === 'accesoB')).map(x => x.id)); else ajustar();
  }
  function terminarTour() { tour.activo = false; $('#btnTour').classList.remove('on'); resalteZona = null; banner.hidden = true; $$('button', capas).forEach((b, k) => b.classList.toggle('on', k === 0)); pintar(); ajustar(); }
  $('#btnTour').addEventListener('click', () => {
    if (tour.activo) return terminarTour();
    simular(null); tour.activo = true; $('#btnTour').classList.add('on'); parada(0);
  });

  /* ================== VARIOS ================== */
  $('#btnTema').addEventListener('click', () => {
    const r = document.documentElement; r.dataset.tema = r.dataset.tema === 'oscuro' ? 'claro' : 'oscuro';
    try { localStorage.setItem('infra-tema', r.dataset.tema); } catch (_) {}
  });
  try { const t = localStorage.getItem('infra-tema'); if (t) document.documentElement.dataset.tema = t; } catch (_) {}
  $('#leyTit').addEventListener('click', () => { const l = $('#leyenda'); l.classList.toggle('cerrada'); $('#leyTit').setAttribute('aria-expanded', !l.classList.contains('cerrada')); });
  if (matchMedia('(max-width: 760px)').matches) $('#leyenda').classList.add('cerrada');
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (!ficha.hidden) cerrarFicha(); else if (tour.activo) terminarTour(); else if (sim) simular(null); } });

  function actualizarResumen() {
    const activos = EN.filter(l => estadoEnlace(l) === 'activo').length, resp = EN.filter(l => estadoEnlace(l) === 'standby').length;
    $('#resumen').textContent = `${EQ.length} equipos · ${EN.length} enlaces (${activos} activos, ${resp} de respaldo)${MAPA.simulaciones ? ' · sin puntos únicos de fallo en perímetro, núcleo y CPD' : ''}`;
  }

  // Con datos propios: sin simulaciones ni tour, que usan los equipos de la demo
  if (!MAPA.simulaciones) { $('#sims').hidden = true; $('#btnTour').hidden = true; ponerEstado('', 'Mapa documental'); }
  $('#titulo').textContent = MAPA.titulo; $('#subtitulo').textContent = MAPA.subtitulo; $('#pieTexto').textContent = MAPA.pie;
  document.title = MAPA.titulo;
  const errores = [...EN.flatMap(l => [l.a, l.b].filter(id => !porId[id]).map(id => `Enlace ${l.a} → ${l.b}: no existe el equipo «${id}»`)),
    ...EQ.filter(e => !ZONAS.some(z => z.id === e.z)).map(e => `Equipo ${e.id}: no existe la zona «${e.z}»`)];
  if (errores.length) { mostrarBanner('Revisa datos.js', errores.map(t => ['!', esc(t)])); return; }

  pintar();
  actualizarResumen();
  ajustar(false);
  if (suave) {
    gsap.from('#mundo .zona-g', { opacity: 0, duration: .8, stagger: .06 });
    gsap.from('#mundo .disp', { opacity: 0, y: -30, duration: .6, stagger: .02, ease: 'back.out(1.6)', delay: .2 });
    gsap.from('#mundo .etq', { opacity: 0, duration: .5, stagger: .015, delay: .6 });
    gsap.from('.sims, .leyenda, .zoom', { opacity: 0, y: 14, duration: .6, stagger: .1, delay: .4 });
  }
})();
