"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface CameraDevice {
  deviceId: string;
  label: string;
}

/**
 * Acceso a las cámaras conectadas al equipo, para capturar una foto sin salir
 * de la aplicación.
 *
 * El stream se libera SIEMPRE al cerrar o desmontar: una pista de vídeo que
 * queda viva mantiene el led de la cámara encendido y bloquea el dispositivo
 * para cualquier otra aplicación.
 */
export function useCameraCapture() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsActive(false);
  }, []);

  /** Vuelca el stream vivo al <video>, si ambos existen ya. */
  const attachStream = useCallback(() => {
    const video = videoRef.current;
    const stream = streamRef.current;

    if (!video || !stream || video.srcObject === stream) {
      return;
    }

    video.srcObject = stream;
    video.play().catch(() => {
      // Autoplay bloqueado: el stream sigue vivo y el usuario puede
      // reintentar; no es motivo para tumbar la captura.
    });
  }, []);

  /**
   * Ref del <video> como callback: se ejecuta en el momento en que el elemento
   * entra en el DOM, que es cuando hay que engancharle el stream si `start()`
   * corrió antes de que el diálogo montara su contenido.
   */
  const setVideoNode = useCallback(
    (node: HTMLVideoElement | null) => {
      videoRef.current = node;

      if (node) attachStream();
    },
    [attachStream]
  );

  const start = useCallback(
    async (requestedDeviceId?: string) => {
      // getUserMedia solo existe en contexto seguro (https o localhost). En una
      // IP plana el navegador no expone la API: hay que decirlo, no fallar en
      // silencio dejando el botón muerto.
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setError(
          "El navegador no permite usar la cámara aquí. Requiere una conexión segura (HTTPS)."
        );
        return;
      }

      setIsStarting(true);
      setError(null);

      try {
        stop();

        const stream = await navigator.mediaDevices.getUserMedia({
          video: requestedDeviceId
            ? { deviceId: { exact: requestedDeviceId } }
            : { facingMode: "environment" },
        });

        streamRef.current = stream;

        // El <video> puede no existir todavía: si `start()` se llama al abrir
        // el diálogo, Radix aún no montó su contenido. attachStream vuelve a
        // intentarlo cuando el elemento aparece; sin eso la cámara quedaba
        // encendida pero sin imagen, y parecía que había fallado.
        attachStream();

        // Las etiquetas de los dispositivos solo llegan con permiso ya
        // concedido, así que se enumeran DESPUÉS de abrir el stream.
        const all = await navigator.mediaDevices.enumerateDevices();
        const cameras = all
          .filter((device) => device.kind === "videoinput")
          .map((device, index) => ({
            deviceId: device.deviceId,
            label: device.label || `Cámara ${index + 1}`,
          }));

        setDevices(cameras);
        setDeviceId(
          requestedDeviceId ??
            stream.getVideoTracks()[0]?.getSettings().deviceId ??
            cameras[0]?.deviceId ??
            null
        );
        setIsActive(true);
      } catch (err) {
        const name = (err as DOMException)?.name;

        setError(
          name === "NotAllowedError"
            ? "Permiso denegado. Habilite la cámara para este sitio en su navegador."
            : name === "NotFoundError"
              ? "No se detectó ninguna cámara conectada al equipo."
              : name === "NotReadableError"
                ? "La cámara está siendo usada por otra aplicación."
                : "No se pudo iniciar la cámara."
        );
        setIsActive(false);
      } finally {
        setIsStarting(false);
      }
    },
    [stop, attachStream]
  );

  /** Toma el fotograma actual como archivo JPEG listo para subir. */
  const capture = useCallback(async (): Promise<File | null> => {
    const video = videoRef.current;

    if (!video || !video.videoWidth) {
      return null;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) return null;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      // 0.92: la compresión definitiva la hace el servidor; aquí solo se evita
      // mandar un PNG sin comprimir de varios MB por la red.
      canvas.toBlob(resolve, "image/jpeg", 0.92)
    );

    if (!blob) return null;

    return new File([blob], `captura_${Date.now()}.jpg`, { type: "image/jpeg" });
  }, []);

  // La cámara no puede sobrevivir al componente que la abrió.
  useEffect(() => stop, [stop]);

  return {
    /** Va en el atributo `ref` del <video>; ver setVideoNode. */
    videoRef: setVideoNode,
    devices,
    deviceId,
    isActive,
    isStarting,
    error,
    start,
    stop,
    capture,
  };
}
