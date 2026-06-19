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
  const autoConnectRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isSenderRef = useRef(false);

  useEffect(() => { isSenderRef.current = isSender; }, [isSender]);

  function stopInterval() {
    if (autoConnectRef.current) { clearInterval(autoConnectRef.current); autoConnectRef.current = null; }
  }

  function cleanupPeer() {
    stopInterval();
    if (callRef.current) { callRef.current.close(); callRef.current = null; }
    if (peerRef.current) { peerRef.current.destroy(); peerRef.current = null; }
  }

  const tryCall = useCallback(() => {
    if (isSenderRef.current) return;
    if (!peerRef.current) return;
    if (callRef.current) { callRef.current.close(); callRef.current = null; }
    setStatus("connecting");

    const call = peerRef.current.call(STREAM_PEER_ID, createDummyStream());
    callRef.current = call;

    call.on("stream", (stream) => {
      const v = videoRef.current;
      if (v) { v.srcObject = stream; v.play().catch(() => {}); }
      setStatus("connected");
    });
    call.on("close", () => { callRef.current = null; setStatus("idle"); });
    call.on("error", () => { callRef.current = null; setStatus("error"); });
  }, []);

  function startPolling() {
    stopInterval();
    if (isSenderRef.current) return;
    tryCall();
    autoConnectRef.current = setInterval(() => {
      if (isSenderRef.current) { stopInterval(); return; }
      if (videoRef.current?.srcObject) return;
      tryCall();
    }, 5000);
  }

  useEffect(() => {
    const p = new Peer({ debug: 0 });
    peerRef.current = p;
    p.on("open", () => {});

    p.on("call", (call) => {
      if (isSenderRef.current && localStreamRef.current) {
        call.answer(localStreamRef.current);
        callRef.current = call;
      } else {
        call.answer();
        call.on("stream", (stream) => {
          const v = videoRef.current;
          if (v) { v.srcObject = stream; v.play().catch(() => {}); }
          setStatus("connected");
        });
        call.on("close", () => { callRef.current = null; setStatus("idle"); });
        callRef.current = call;
      }
    });

    p.on("error", () => setStatus("error"));

    startPolling();

    return () => {
      cleanupPeer();
    };
  }, []);

  const startSender = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      localStreamRef.current = stream;

      cleanupPeer();

      const p = new Peer(STREAM_PEER_ID, { debug: 0 });
      peerRef.current = p;
      p.on("open", () => {});
      p.on("error", () => setStatus("error"));
      p.on("call", (call) => {
        call.answer(localStreamRef.current!);
        callRef.current = call;
      });

      const v = videoRef.current;
      if (v) { v.srcObject = stream; v.play().catch(() => {}); }

      setIsSender(true);
      setStatus("connected");
    } catch {
      setStatus("error");
      setIsSender(false);
    }
  }, []);

  const stopSender = useCallback(() => {
    if (localStreamRef.current) { localStreamRef.current.getTracks().forEach((t) => t.stop()); localStreamRef.current = null; }
    cleanupPeer();
    setIsSender(false);
    setStatus("idle");

    const p = new Peer({ debug: 0 });
    peerRef.current = p;
    p.on("open", () => {});
    p.on("error", () => setStatus("error"));
    p.on("call", (call) => {
      if (isSenderRef.current && localStreamRef.current) {
        call.answer(localStreamRef.current);
        callRef.current = call;
      } else {
        call.answer();
        call.on("stream", (stream) => {
          const v = videoRef.current;
          if (v) { v.srcObject = stream; v.play().catch(() => {}); }
          setStatus("connected");
        });
        call.on("close", () => { callRef.current = null; setStatus("idle"); });
        callRef.current = call;
      }
    });
    startPolling();
  }, []);

  const disconnect = useCallback(() => {
    cleanupPeer();
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus("idle");

    const p = new Peer({ debug: 0 });
    peerRef.current = p;
    p.on("open", () => {});
    p.on("error", () => setStatus("error"));
    p.on("call", (call) => {
      if (isSenderRef.current && localStreamRef.current) {
        call.answer(localStreamRef.current);
        callRef.current = call;
      } else {
        call.answer();
        call.on("stream", (stream) => {
          const v = videoRef.current;
          if (v) { v.srcObject = stream; v.play().catch(() => {}); }
          setStatus("connected");
        });
        call.on("close", () => { callRef.current = null; setStatus("idle"); });
        callRef.current = call;
      }
    });
    startPolling();
  }, []);

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

  return { videoRef, status, isSender, startSender, stopSender, disconnect, captureFrame };
}

function createDummyStream() {
  const canvas = document.createElement("canvas");
  canvas.width = 1; canvas.height = 1;
  return canvas.captureStream(1);
}
