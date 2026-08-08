/**
 * Reproductor del sonido de notificaciones.
 *
 * Los navegadores bloquean el audio hasta que hay un gesto del usuario. El
 * desbloqueo se hace reproduciendo con volumen 0 y restaurándolo después: si
 * se desbloquea con el volumen real, el propio desbloqueo suena, que es
 * justo lo que no se quiere en el primer click de la sesión.
 */

/** Un aviso viejo no debe sonar al volver a la pestaña horas después. */
const PENDING_TTL_MS = 30_000;

const UNLOCK_EVENTS = ['pointerdown', 'keydown', 'touchstart'] as const;

export type NotificationPlayer = {
  /** Suena ya, o queda encolado si aún no hubo gesto del usuario. */
  play: () => void;
  dispose: () => void;
};

export function createNotificationPlayer(src: string): NotificationPlayer {
  if (typeof window === 'undefined') {
    return { play: () => {}, dispose: () => {} };
  }

  const audio = new Audio(src);
  audio.preload = 'auto';

  let unlocked = false;
  let disposed = false;
  let pendingAt = 0;
  let listening = false;

  const play = () => {
    if (disposed) return;

    // Reiniciar el elemento cortaría el sonido anterior a media reproducción;
    // un clon deja que los avisos encimados suenen completos.
    const voice = audio.cloneNode() as HTMLAudioElement;
    voice.volume = 1;

    voice.play().catch(() => {
      // El navegador volvió a bloquear: re-armar el desbloqueo.
      unlocked = false;
      arm();
    });
  };

  const flushPending = () => {
    const fresh = pendingAt > 0 && Date.now() - pendingAt < PENDING_TTL_MS;
    pendingAt = 0;
    if (fresh) play();
  };

  const onGesture = () => {
    if (disposed || unlocked) return;

    // Volumen 0: el desbloqueo tiene que ser inaudible.
    const previous = audio.volume;
    audio.volume = 0;

    audio
      .play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = previous;

        unlocked = true;
        disarm();
        flushPending();
      })
      .catch(() => {
        audio.volume = previous;
        // Sigue bloqueado: se reintenta en el próximo gesto.
      });
  };

  function arm() {
    if (listening || disposed) return;
    listening = true;
    UNLOCK_EVENTS.forEach(evt =>
      window.addEventListener(evt, onGesture, { passive: true })
    );
  }

  function disarm() {
    if (!listening) return;
    listening = false;
    UNLOCK_EVENTS.forEach(evt => window.removeEventListener(evt, onGesture));
  }

  arm();

  const queue = () => {
    pendingAt = Date.now();
  };

  return {
    play: () => (unlocked ? play() : queue()),
    dispose: () => {
      disposed = true;
      disarm();
      audio.pause();
    },
  };
}
