# Mapa de infraestructura

Mapa isométrico de una red en SVG, con luces que viajan por los cables, ficha por equipo, resaltado por zona, zoom y tema claro/oscuro. No necesita servidor ni compilar nada: abre `index.html` con doble clic.

![Mapa con la plantilla](captura.png)

**Es un mapa documental, no un monitor.** Dibuja lo que pongas en `datos.js`; no comprueba si los equipos están encendidos. El estado de cada equipo lo marcas tú.

## Cómo está hecho

| Archivo | Qué hace |
|---|---|
| `datos.js` | Zonas, equipos y enlaces. **Es el único que hay que tocar.** |
| `datos-plantilla.js` | Red pequeña de ejemplo para empezar |
| `app.js` | Motor: proyección, dibujo, cables, zoom, ficha, simulaciones y tour |
| `estilo.css` | Aspecto y temas |
| `vendor/gsap.min.js` | Animaciones (GSAP 3.15, [licencia estándar](https://gsap.com/standard-license)) |

Cada equipo se coloca en un plano (`X`, `Y`) y `iso()` lo proyecta en isométrico. Los cables siguen los ejes del suelo y sus luces son `animateMotion` de SVG. Las fuentes vienen de Google Fonts; sin Internet se usan las del sistema.

## Dibujar tu red

1. Copia la plantilla: `cp datos-plantilla.js datos.js`
2. Cambia los equipos y recarga la página.

Si un enlace apunta a un equipo que no existe o un equipo a una zona que no existe, el mapa muestra el error en lugar de dibujarse.

Con `simulaciones: false` se ocultan las simulaciones y el tour, porque solo funcionan con los equipos de la demo. Para volver a la demo: `git checkout datos.js`.

### Zona

```js
{ id: 'cpd', n: 'Servidores', s: 'subtítulo', x: [5, 11], y: [-3.4, .4], c: '#a855f7' }
```

`x` e `y` son el rectángulo en el plano y `c` el color.

### Equipo

```js
{ id: 'srv', t: 'servidor', X: 6.4, Y: -2.2, n: 'Servidor 1', ip: '10.0.1.10', z: 'cpd', c: '#8b5cf6', tipo: 'Hipervisor', d: 'Descripción de la ficha.' }
```

- `t`, dibujo: `nube` `router` `firewall` `core` `switch` `wlc` `servidor` `almacen` `ap` `pc` `portatil` `movil` `telefono` `impresora` `camara`
- `z`: id de su zona. `c`: color (opcional).
- `e`: estado, `ok` por defecto, `standby` o `caido` (opcional).
- `grande: true`: switch más grande (opcional).

### Enlace

```js
['sw', 'nas', 'cobre', 'activo', { r: 'my', my: -.6, et: 'Etiqueta' }]
```

Orden: origen, destino, tipo de cable, modo y opciones.

- Tipo: `wan` `fibra` `cobre` `ha` `vpn` `wifi` `dmz`
- Modo: `activo` o `standby`
- `r`, ruta del cable: `'m'` codo a mitad de X (fíjalo con `mx`), `'my'` codo a mitad de Y (fíjalo con `my`), `'x'` o `'y'` eje primero, o una lista de puntos `[[x, y], [x, y]]`
- `et`: etiqueta sobre el cable

## Cómo funciona el diseño

Para cambiar el aspecto, busca estos nombres en `app.js` y `estilo.css`.

### Dispositivos

- **`iso(X, Y, Z)`** pasa un punto del plano a la pantalla. `S` fija los píxeles por unidad: súbelo para separar todo el mapa.
- **`caja(F, sx, sy, sz, col, extra)`** dibuja una caja con tres caras: la superior más clara y las laterales más oscuras, sacadas de un solo color con `tono()`. `cajaC()` hace lo mismo centrada en un punto del suelo.
- **`{top}`, `{der}` e `{izq}`** se usan dentro de `extra` y colocan un dibujo plano sobre esa cara de la caja. Así se ponen puertos, rejillas y LEDs.
- **`arte(e, cx, cy)`** tiene un bloque `if (t === '...')` por tipo de equipo. Para crear uno nuevo, añade su bloque y su altura en `ALTO`, que coloca la etiqueta encima.
- **El orden de dibujo** va del fondo hacia delante, según `X + Y`, para que los equipos se tapen bien entre sí.

### Cables

- **`rutaPlano(l)`** decide por dónde va el cable en el plano, con codos que siguen los ejes del suelo.
- **`trazo(pts)`** lo proyecta y redondea las esquinas (radio máximo 12 px).
- **Cada cable son dos capas**: `.cab` es la línea y `.cab-halo` el brillo. Los colores y discontinuos están en `.t-wan`, `.t-fibra`, `.t-cobre`, etc.

### Luces que viajan

- Se crean en `pintar()`, en el bloque `// cables`. Son círculos SVG con `animateMotion` y `mpath`, que siguen el `path` del cable sin JavaScript por fotograma.
- Cada luz lleva dos estelas (`.estela` y `.estela2`) y otra luz vuelve en sentido contrario, salvo en WiFi.
- **Velocidad:** `vel = 95 * carga(l)`, en píxeles por segundo. `carga()` devuelve 1 si no hay simulación; súbelo para una luz más rápida.
- **Solo se mueven los cables `activo`**: los `standby` y caídos no llevan luz. Un `begin` negativo hace que las luces no se reinicien a la vez al repintar.
- No uses `feGaussianBlur` sobre las luces porque hunde los fps. El brillo se consigue con círculos semitransparentes.

### Estados

`.disp.standby` atenúa el equipo y `.disp.caido` lo pone en gris con una alarma parpadeante. `.cab.standby` y `.cab.caido` hacen lo mismo con los cables. Si el sistema pide menos movimiento (`prefers-reduced-motion`), las luces se apagan.

## Seguridad

Un mapa con IPs y equipos reales describe tu red a quien lo lea. Mantén este repositorio **privado** y no pongas contraseñas ni claves en `datos.js`.
