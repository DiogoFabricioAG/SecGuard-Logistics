import { useRef, useState, useCallback, useEffect } from "react";
import Peer, { type MediaConnection, type DataConnection } from "peerjs";

export type CameraStatus = "idle" | "connecting" | "connected" | "error";

const STREAM_PEER_ID = "secguard-garita-01";

export interface BroadcastMessage {
  type: "plate-detected";
  plate: string;
  confidence: number;
  timestamp: string;
}

export function usePeerCamera(onData?: (msg: BroadcastMessage) => void) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer | null>(null);
  const callRef = useRef<MediaConnection | null>(null);
  const dataConnRef = useRef<DataConnection | null>(null);
  const senderConnsRef = useRef<DataConnection[]>([]);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [isSender, setIsSender] = useState(false);
  const autoConnectRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isSenderRef = useRef(false);
  const onDataRef = useRef(onData);

  useEffect(() => { onDataRef.current = onData; }, [onData]);
  useEffect(() => { isSenderRef.current = isSender; }, [isSender]);

  function stopInterval() {
    if (autoConnectRef.current) { clearInterval(autoConnectRef.current); autoConnectRef.current = null; }
  }

  function cleanupPeer() {
    stopInterval();
    senderConnsRef.current = [];
    if (dataConnRef.current) { dataConnRef.current.close(); dataConnRef.current = null; }
    if (callRef.current) { callRef.current.close(); callRef.current = null; }
    if (peerRef.current) { peerRef.current.destroy(); peerRef.current = null; }
  }

  function setupReceiverDataChannel(conn: DataConnection) {
    dataConnRef.current = conn;
    conn.on("open", () => {});
    conn.on("data", (data) => {
      onDataRef.current?.(data as BroadcastMessage);
    });
    conn.on("close", () => { dataConnRef.current = null; });
  }

  function setupSenderDataChannel(conn: DataConnection) {
    conn.on("open", () => {});
    conn.on("close", () => {
      senderConnsRef.current = senderConnsRef.current.filter((c) => c !== conn);
    });
    senderConnsRef.current.push(conn);
  }

  const setupReceiverMedia = useCallback((call: MediaConnection) => {
    callRef.current = call;
    call.answer();
    call.on("stream", (stream) => {
      const v = videoRef.current;
      if (v) { v.srcObject = stream; v.play().catch(() => {}); }
      setStatus("connected");
    });
    call.on("close", () => { callRef.current = null; setStatus("idle"); });
    call.on("error", () => { callRef.current = null; });
  }, []);

  const tryCall = useCallback(() => {
    if (isSenderRef.current) return;
    if (!peerRef.current) return;
    if (callRef.current) { callRef.current.close(); callRef.current = null; }
    if (dataConnRef.current) { dataConnRef.current.close(); dataConnRef.current = null; }
    setStatus("connecting");

    const call = peerRef.current.call(STREAM_PEER_ID, createDummyStream());
    setupReceiverMedia(call);

    const conn = peerRef.current.connect(STREAM_PEER_ID, { reliable: true });
    setupReceiverDataChannel(conn);
  }, [setupReceiverMedia]);

  function startPolling() {
    stopInterval();
    if (isSenderRef.current) return;
    tryCall();
    autoConnectRef.current = setInterval(() => {
      if (isSenderRef.current) { stopInterval(); return; }
      if (videoRef.current?.srcObject && dataConnRef.current) return;
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
        call.on("close", () => {});
      } else {
        setupReceiverMedia(call);
      }
    });

    p.on("connection", (conn) => {
      if (isSenderRef.current) {
        setupSenderDataChannel(conn);
      } else {
        setupReceiverDataChannel(conn);
      }
    });

    p.on("error", () => setStatus("error"));

    startPolling();

    return () => { cleanupPeer(); };
  }, [setupReceiverMedia]);

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
        call.on("close", () => {});
      });
      p.on("connection", (conn) => {
        setupSenderDataChannel(conn);
      });

      const v = videoRef.current;
      if (v) { v.srcObject = stream; v.play().catch(() => {}); }

      setIsSender(true);
      setStatus("connected");

      requestAnimationFrame(() => {
        const v2 = videoRef.current;
        if (v2 && v2 !== v && localStreamRef.current) {
          v2.srcObject = localStreamRef.current;
          v2.play().catch(() => {});
        }
      });
    } catch {
      setStatus("error");
      setIsSender(false);
    }
  }, []);

  const broadcast = useCallback((msg: BroadcastMessage) => {
    senderConnsRef.current.forEach((conn) => {
      try { conn.send(msg); } catch { /* ignore */ }
    });
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
    p.on("call", (call) => setupReceiverMedia(call));
    p.on("connection", (conn) => setupReceiverDataChannel(conn));
    startPolling();
  }, [setupReceiverMedia]);

  const disconnect = useCallback(() => {
    cleanupPeer();
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus("idle");

    const p = new Peer({ debug: 0 });
    peerRef.current = p;
    p.on("open", () => {});
    p.on("error", () => setStatus("error"));
    p.on("call", (call) => setupReceiverMedia(call));
    p.on("connection", (conn) => setupReceiverDataChannel(conn));
    startPolling();
  }, [setupReceiverMedia]);

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

  return { videoRef, status, isSender, startSender, stopSender, disconnect, captureFrame, broadcast };
}

function createDummyStream() {
  const canvas = document.createElement("canvas");
  canvas.width = 1; canvas.height = 1;
  return canvas.captureStream(1);
}
