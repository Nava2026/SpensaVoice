const CONFETTI = [
  { cx: "-64px", cy: "-58px", color: "#60a5fa" },
  { cx: "-30px", cy: "-80px", color: "#4ade80" },
  { cx: "12px", cy: "-72px", color: "#fbbf24" },
  { cx: "50px", cy: "-58px", color: "#f472b6" },
  { cx: "74px", cy: "-26px", color: "#60a5fa" },
  { cx: "-78px", cy: "-18px", color: "#38bdf8" },
];

export default function SendAnimation({ done }: { done: boolean }) {
  return (
    <div className="sending" role="status" aria-live="polite">
      <div className="sending-box" aria-hidden="true">
        <div className="sending-lid" />
        <div className="sending-body" />
        <div className="sending-slot" />
        <div className="sending-flash" />
        <div className="sending-paper" />
        {CONFETTI.map((piece) => (
          <span
            key={piece.cx + piece.cy}
            className="confetti"
            style={{
              background: piece.color,
              ["--cx" as string]: piece.cx,
              ["--cy" as string]: piece.cy,
            }}
          />
        ))}
      </div>
      <div className={`sending-label${done ? " done" : ""}`}>
        {done ? "MASUK ✓" : "LAGI DIKIRIM..."}
      </div>
    </div>
  );
}
