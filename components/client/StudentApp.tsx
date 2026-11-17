"use client";

import { useCallback, useEffect, useState } from "react";
import Intro from "./Intro";
import Hero from "./Hero";
import Particles from "./Particles";
import WriteSheet, { type WritePayload } from "./WriteSheet";
import SendAnimation from "./SendAnimation";
import TrackPanel from "./TrackPanel";
import Toast from "./Toast";

type Stage = "intro" | "hero";
type Panel = "write" | "track" | null;
type ToastState = { kode: string } | { error: string } | null;

const SEND_MIN_MS = 2500;
const INTRO_KEY = "sv_intro_seen";

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default function StudentApp() {
  const [stage, setStage] = useState<Stage>("intro");
  const [panel, setPanel] = useState<Panel>(null);
  const [sending, setSending] = useState<{ done: boolean } | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    if (window.sessionStorage.getItem(INTRO_KEY) === "1") {
      setStage("hero");
    }
  }, []);

  const finishIntro = useCallback(() => {
    window.sessionStorage.setItem(INTRO_KEY, "1");
    setStage("hero");
  }, []);

  async function handleSubmit(payload: WritePayload) {
    setPanel(null);
    setSending({ done: false });
    const startedAt = Date.now();

    try {
      const res = await fetch("/api/aspirasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      const remaining = SEND_MIN_MS - (Date.now() - startedAt);
      if (remaining > 0) await sleep(remaining);

      if (!res.ok) {
        setSending(null);
        setToast({
          error: data.error ?? "Pesan gagal dikirim. Coba lagi ya.",
        });
        return;
      }

      setSending({ done: true });
      await sleep(400);
      setSending(null);
      setToast({ kode: data.kode });
    } catch {
      setSending(null);
      setToast({ error: "Koneksi bermasalah. Coba lagi ya." });
    }
  }

  return (
    <div className="site">
      <Particles />

      <main className="site-main">
        {stage === "hero" && (
          <Hero
            onWrite={() => setPanel("write")}
            onTrack={() => setPanel("track")}
          />
        )}
      </main>

      <footer className="site-footer">
        SpensaVoice · OSIS SMPN 1 Dander, Bojonegoro
      </footer>

      {stage === "intro" && <Intro onDone={finishIntro} />}

      {panel === "write" && (
        <WriteSheet onClose={() => setPanel(null)} onSubmit={handleSubmit} />
      )}

      {panel === "track" && <TrackPanel onClose={() => setPanel(null)} />}

      {sending && <SendAnimation done={sending.done} />}

      {toast && (
        <Toast
          {...("kode" in toast ? { kode: toast.kode } : { error: toast.error })}
          onClose={() => setToast(null)}
          onTrack={
            "kode" in toast
              ? () => {
                  setToast(null);
                  setPanel("track");
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
