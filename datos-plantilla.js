/* Plantilla para tu red: cópiala sobre datos.js y cambia los equipos (ver README.md).
   Los datos de abajo son ficticios. */
window.MAPA = {
  titulo: 'Infraestructura de mi empresa',
  subtitulo: 'Oficina principal',
  pie: 'Actualizado a mano',
  simulaciones: false,

  ZONAS: [
    { id: 'borde', n: 'Perímetro', s: 'salida a Internet', x: [-.8, 4.6], y: [.8, 3.4], c: '#ef4444' },
    { id: 'cpd', n: 'Servidores', s: 'virtualización y copias', x: [5, 11], y: [-3.4, .4], c: '#a855f7' },
    { id: 'lan', n: 'Oficina', s: 'puestos y WiFi', x: [5, 11], y: [1, 6], c: '#14b8a6' },
  ],

  EQ: [
    { id: 'inet', t: 'nube', X: .2, Y: 2, n: 'Internet', ip: 'Operador', z: 'borde', tipo: 'Red externa', d: 'Salida a Internet.' },
    { id: 'fw', t: 'firewall', X: 3.2, Y: 2, n: 'Firewall', ip: '10.0.0.1', z: 'borde', tipo: 'Firewall', d: 'Protege la red interna.' },
    { id: 'sw', t: 'core', X: 6.2, Y: 2, n: 'Switch principal', ip: '10.0.0.2', z: 'lan', c: '#3b82f6', tipo: 'Switch', d: 'Une servidores y oficina.' },
    { id: 'srv', t: 'servidor', X: 6.4, Y: -2.2, n: 'Servidor 1', ip: '10.0.1.10', z: 'cpd', c: '#8b5cf6', tipo: 'Hipervisor', d: 'Máquinas virtuales.' },
    { id: 'nas', t: 'almacen', X: 9, Y: -2.2, n: 'NAS', ip: '10.0.1.20', z: 'cpd', c: '#22c55e', tipo: 'Copias', d: 'Copias de seguridad.' },
    { id: 'pc', t: 'pc', X: 9.4, Y: 2, n: 'Puestos', ip: 'VLAN 10', z: 'lan', tipo: 'Usuarios', d: 'Equipos de la oficina.' },
    { id: 'ap', t: 'ap', X: 9.4, Y: 4.6, n: 'WiFi', ip: 'VLAN 20', z: 'lan', tipo: 'Punto de acceso', d: 'WiFi de la oficina.' },
  ],

  EN: [
    ['inet', 'fw', 'wan', 'activo', { et: 'Fibra' }],
    ['fw', 'sw', 'fibra', 'activo'],
    ['sw', 'srv', 'fibra', 'activo', { r: 'y' }],
    ['sw', 'nas', 'cobre', 'activo', { r: 'my', my: -.6 }],
    ['sw', 'pc', 'cobre', 'activo', { et: 'VLAN 10' }],
    ['sw', 'ap', 'cobre', 'activo', { r: 'y', et: 'PoE' }],
  ],
};
