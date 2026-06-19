import { useRef, useState, useCallback, useEffect } from "react";
import Peer, { type MediaConnection } from "peerjs";

export type CameraStatus = "idle" | "connecting" | "connected" | "error";

const STREAM_PEER_ID = "secguard-garita-01";

export function usePeerCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer | null>(null);
  const callRef = useRef<MediaConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [isSender, setIsSender] = useState(false);
  const autoConnectTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  function destroyPeer() {
    if (autoConnectTimer.current) { clearInterval(autoConnectTimer.current); autoConnectTimer.current = null; }
    if (callRef.current) { callRef.current.close(); callRef.current = null; }
    if (peerRef.current) { peerRef.current.destroy(); peerRef.current = null; }
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  useEffect(() => {
    const p = new Peer({ debug: 0 });
    peerRef.current = p;

    p.on("open", () => {});
    p.on("error", () => setStatus("error"));

    p.on("call", (call) => {
      if (isSender && localStreamRef.current) {
        call.answer(localStreamRef.current);
        call.on("close", () => {});
        callRef.current = call;
      } else {
        call.answer();
        call.on("stream", (stream) => {
          if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(() => {}); }
          setStatus("connected");
        });
        call.on("close", () => setStatus("idle"));
        callRef.current = call;
      }
    });

    return () => { p.destroy(); };
  }, [isSender]);

  const startSender = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      localStreamRef.current = stream;

      destroyPeer();

      const p = new Peer(STREAM_PEER_ID, { debug: 0 });
      peerRef.current = p;

      p.on("open", () => {});
      p.on("error", () => setStatus("error"));

      p.on("call", (call) => {
        call.answer(localStreamRef.current!);
        callRef.current = call;
      });

      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(() => {}); }
      setIsSender(true);
      setStatus("connected");
    } catch { setStatus("error"); }
  }, []);

  const stopSender = useCallback(() => {
    if (localStreamRef.current) { localStreamRef.current.getTracks().forEach((t) => t.stop()); localStreamRef.current = null; }
    destroyPeer();
    setIsSender(false);
    setStatus("idle");
  }, []);

  const connectFixed = useCallback(() => {
    if (isSender) return;
    if (!peerRef.current) return;
    if (callRef.current) { callRef.current.close(); callRef.current = null; }
    setStatus("connecting");
    const call = peerRef.current.call(STREAM_PEER_ID, createDummyStream());
    callRef.current = call;
    call.on("stream", (stream) => {
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(() => {}); }
      setStatus("connected");
    });
    call.on("close", () => setStatus("idle"));
    call.on("error", () => {
      setStatus("error");
    });
  }, [isSender]);

  const startAutoConnect = useCallback(() => {
    if (autoConnectTimer.current) return;
    connectFixed();
    autoConnectTimer.current = setInterval(() => {
      connectFixed();
    }, 5000);
  }, [connectFixed]);

  const stopAutoConnect = useCallback(() => {
    if (autoConnectTimer.current) { clearInterval(autoConnectTimer.current); autoConnectTimer.current = null; }
  }, []);

  const disconnect = useCallback(() => {
    stopAutoConnect();
    if (callRef.current) { callRef.current.close(); callRef.current = null; }
    if (!isSender && videoRef.current) videoRef.current.srcObject = null;
    if (!isSender) setStatus("idle");
  }, [stopAutoConnect, isSender]);

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 360;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.8);
  }, []);

  return {
    videoRef, status, isSender,
    startSender, stopSender,
    connectFixed, disconnect, captureFrame,
    startAutoConnect, stopAutoConnect,
  };
}

function createDummyStream() {
  const canvas = document.createElement("canvas");
  canvas.width = 1; canvas.height = 1;
  return canvas.captureStream(1);
}
