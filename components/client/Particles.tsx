const PARTICLES = Array.from({ length: 14 }, (_, i) => {
  const seed = (i * 37) % 100;
  return {
    id: i,
    left: `${(seed * 1.7) % 100}%`,
    top: `${(seed * 2.3) % 100}%`,
    size: `${2 + (i % 3)}px`,
    dur: `${12 + (i % 5) * 2}s`,
    delay: `${(i * 0.7) % 6}s`,
    dx: `${(i % 2 === 0 ? 1 : -1) * (8 + (i % 4) * 6)}px`,
  };
});

export default function Particles() {
  return (
    <div className="particles" aria-hidden="true">
      {PARTICLES.map((particle) => (
        <span
          key={particle.id}
          className="particle"
          style={{
            left: particle.left,
            top: particle.top,
            ["--size" as string]: particle.size,
            ["--dur" as string]: particle.dur,
            ["--delay" as string]: particle.delay,
            ["--dx" as string]: particle.dx,
          }}
        />
      ))}
    </div>
  );
}
