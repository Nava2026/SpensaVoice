const CONFETTI = Array.from({ length: 22 }, (_, index) => {
  const angle = (index / 22) * Math.PI * 2 + Math.random() * 0.5;
  const distance = 60 + Math.random() * 120;
  return {
    id: index,
    color: ["#5B9DFF", "#9cc3ff", "#e8eefc", "#8fe3b8"][index % 4],
    dx: `${Math.cos(angle) * distance}px`,
    dy: `${Math.sin(angle) * distance - 60}px`,
    delay: `${Math.random() * 0.12}s`,
  };
});

export default function SendAnimation({ done }: { done: boolean }) {
  return (
    <section
      className={`screen send-screen${done ? " is-done" : ""}`}
      aria-label="Mengirim pesan"
      role="status"
      aria-live="polite"
    >
      <div className="send-stage">
        <div className="send-box">
          <div className="send-box-back" />
          <div className="send-flyer" />
          <div className="send-box-front">SV</div>
          <div className="send-box-lid" />
        </div>

        {CONFETTI.map((piece) => (
          <span
            key={piece.id}
            className="send-confetti"
            style={
              {
                background: piece.color,
                "--dx": piece.dx,
                "--dy": piece.dy,
                "--delay": piece.delay,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <p className="send-label">
        {done ? "Masuk" : "Lagi dikirim"}
        {!done && <span className="send-dots" aria-hidden="true" />}
      </p>
    </section>
  );
}
