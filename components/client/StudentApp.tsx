"use client";

import { useCallback, useEffect, useState } from "react";
import Backdrop from "./Backdrop";
import Hero from "./Hero";
import Intro from "./Intro";
import OsisScreen from "./OsisScreen";
import SendAnimation from "./SendAnimation";
import Toast from "./Toast";
import TrackPanel from "./TrackPanel";
import WriteSheet, { type WritePayload } from "./WriteSheet";
import {
  addHistory,
  clearHistory,
  readHistory,
  type HistoryItem,
} from "@/lib/history";
import { DEFAULT_OSIS, type OsisSection } from "@/lib/osis";

type Screen = "intro" | "hero" | "write" | "send" | "status" | "osis";
type ToastState = { kode: string } | { error: string } | null;

const INTRO_KEY = "sv_intro_seen";
const SEND_MIN_MS = 2600;

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default function StudentApp() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [iris, setIris] = useState(false);
  const [sending, setSending] = useState<{ done: boolean } | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [osis, setOsis] = useState<OsisSection[]>(DEFAULT_OSIS);
  const [draft, setDraft] = useState<WritePayload | null>(null);
  const [statusKode, setStatusKode] = useState<string | null>(null);

  const go = useCallback((next: Screen, options?: { iris?: boolean }) => {
    setScreen(next);
    if (options?.iris) {
      setIris(true);
      window.setTimeout(() => setIris(false), 1400);
    }
  }, []);

  useEffect(() => {
    setHistory(readHistory());
    if (window.sessionStorage.getItem(INTRO_KEY) === "1") {
      setScreen("hero");
    }
  }, []);

  useEffect(() => {
    let alive = true;
    fetch("/api/osis", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { sections?: OsisSection[] }) => {
        if (alive && Array.isArray(data.sections) && data.sections.length) {
          setOsis(data.sections);
        }
      })
      .catch(() => {
        // Data default sudah tampil; struktur dari sheet opsional.
      });
    return () => {
      alive = false;
    };
  }, []);

  const finishIntro = useCallback(() => {
    window.sessionStorage.setItem(INTRO_KEY, "1");
    go("hero", { iris: true });
  }, [go]);

  async function handleSubmit(payload: WritePayload) {
    go("send");
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
        setDraft(payload);
        go("write");
        setToast({ error: data.error ?? "Pesan gagal dikirim. Coba lagi ya." });
        return;
      }

      setSending({ done: true });
      await sleep(900);
      setSending(null);
      setDraft(null);
      go("hero");
      setHistory(
        addHistory({
          kode: data.kode,
          created_at: new Date().toISOString(),
          topik: payload.topik,
        }),
      );
      setToast({ kode: data.kode });
    } catch {
      setSending(null);
      setDraft(payload);
      go("write");
      setToast({ error: "Koneksi bermasalah. Coba lagi ya." });
    }
  }

  function openCode(kode: string) {
    setToast(null);
    setStatusKode(kode);
    go("status");
  }

  function wipeHistory() {
    setHistory(clearHistory());
  }

  return (
    <div className="site">
      <Backdrop />

      <main className="site-main">
        {screen === "hero" && (
          <Hero
            onWrite={() => go("write")}
            onTrack={() => {
              setStatusKode(null);
              go("status");
            }}
            onOsis={() => go("osis")}
            history={history}
            onOpenCode={openCode}
            onClearHistory={wipeHistory}
          />
        )}

        {screen === "write" && (
          <WriteSheet
            initial={draft ?? undefined}
            onClose={() => {
              setDraft(null);
              go("hero");
            }}
            onSubmit={handleSubmit}
          />
        )}

        {screen === "status" && (
          <TrackPanel
            key={statusKode ?? "status"}
            initialKode={statusKode ?? undefined}
            history={history}
            onClearHistory={wipeHistory}
            onClose={() => {
              setStatusKode(null);
              go("hero");
            }}
          />
        )}

        {screen === "osis" && (
          <OsisScreen sections={osis} onBack={() => go("hero")} />
        )}

        {screen === "intro" && <Intro onDone={finishIntro} />}

        {sending && <SendAnimation done={sending.done} />}
      </main>

      {iris && <div className="iris-ring" aria-hidden="true" />}

      {toast && (
        <Toast
          {...("kode" in toast ? { kode: toast.kode } : { error: toast.error })}
          onClose={() => setToast(null)}
          onTrack={
            "kode" in toast ? () => openCode(toast.kode) : undefined
          }
        />
      )}
    </div>
  );
}
