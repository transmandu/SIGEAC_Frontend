/**
 * Efecto "cenizas" (Infinity War / Telegram): clona el elemento en varias
 * capas, cada una con una máscara de partículas aleatorias, y las anima
 * volando hacia arriba a la derecha mientras se desvanecen. Los clones se
 * montan en un contenedor fijo sobre el body, así que el efecto no queda
 * recortado por contenedores con overflow.
 *
 * No toca el elemento original: el llamador debe ocultarlo justo después
 * de invocar esta función. Devuelve una promesa que se resuelve al terminar.
 */
export function disintegrate(
  element: HTMLElement,
  {
    layers = 24,
    duration = 1400,
    stagger = 60,
  }: { layers?: number; duration?: number; stagger?: number } = {}
): Promise<void> {
  const rect = element.getBoundingClientRect();
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (rect.width === 0 || rect.height === 0 || reducedMotion) {
    return Promise.resolve();
  }

  // Cada "grano" de ceniza mide ~1px en pantalla: polvo fino y denso.
  const grain = 1;
  const w = Math.max(1, Math.ceil(rect.width / grain));
  const h = Math.max(1, Math.ceil(rect.height / grain));

  // Cada píxel se asigna a una sola capa. El índice crece con x (más algo de
  // ruido) para que la desintegración barra la card de izquierda a derecha.
  const masks = Array.from({ length: layers }, () => new ImageData(w, h));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const layer = Math.min(
        layers - 1,
        Math.floor(((x / w) * 0.8 + Math.random() * 0.35) * layers)
      );
      masks[layer].data[(y * w + x) * 4 + 3] = 255; // solo importa el alfa
    }
  }

  const container = document.createElement("div");
  container.style.cssText = [
    "position:fixed",
    `left:${rect.left}px`,
    `top:${rect.top}px`,
    `width:${rect.width}px`,
    `height:${rect.height}px`,
    "pointer-events:none",
    "z-index:1004",
  ].join(";");

  const animations: Promise<unknown>[] = [];

  masks.forEach((mask, layerIndex) => {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")!.putImageData(mask, 0, 0);
    const maskUrl = `url(${canvas.toDataURL()})`;

    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.position = "absolute";
    clone.style.inset = "0";
    clone.style.margin = "0";
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    for (const prefix of ["-webkit-mask", "mask"]) {
      clone.style.setProperty(`${prefix}-image`, maskUrl);
      clone.style.setProperty(`${prefix}-size`, "100% 100%");
    }
    container.appendChild(clone);

    // Las capas tardías (las que salen al final del barrido) viajan más lejos.
    const drift = 1 + (layerIndex / layers) * 1.4;
    const dx = (70 + Math.random() * 90) * drift;
    const dy = -(50 + Math.random() * 80) * drift;
    // Pequeño desvío lateral a mitad de camino para que la trayectoria ondule
    // en vez de ser una línea recta (el viento no sopla parejo).
    const midWobble = (Math.random() - 0.5) * 30;
    const rotate = (Math.random() - 0.5) * 24;

    animations.push(
      clone
        .animate(
          [
            {
              offset: 0,
              transform: "translate(0, 0) rotate(0deg) scale(1)",
              opacity: 1,
              filter: "blur(0px)",
            },
            {
              // Se levanta despacio y aún visible: la ceniza "despega".
              offset: 0.3,
              transform: `translate(${dx * 0.18 + midWobble}px, ${dy * 0.25}px) rotate(${rotate * 0.4}deg) scale(1.02)`,
              opacity: 0.95,
              filter: "blur(0.5px)",
            },
            {
              offset: 1,
              transform: `translate(${dx}px, ${dy}px) rotate(${rotate}deg) scale(1.1)`,
              opacity: 0,
              filter: "blur(3px)",
            },
          ],
          {
            duration,
            delay: layerIndex * stagger,
            easing: "cubic-bezier(0.3, 0.2, 0.4, 1)",
            fill: "forwards",
          }
        )
        .finished.catch(() => {})
    );
  });

  document.body.appendChild(container);

  return Promise.allSettled(animations).then(() => container.remove());
}
