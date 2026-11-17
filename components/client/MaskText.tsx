interface MaskTextProps {
  text: string;
  className?: string;
  delay?: number;
}

/** Huruf naik dari garis potong. Dipakai untuk judul brand. */
export default function MaskText({
  text,
  className = "",
  delay = 0,
}: MaskTextProps) {
  return (
    <span className={className} aria-label={text}>
      {Array.from(text).map((letter, index) => (
        <span className="mk" aria-hidden="true" key={`${letter}-${index}`}>
          <span
            className="ch"
            style={
              {
                "--i": index,
                "--d": `${delay}s`,
              } as React.CSSProperties
            }
          >
            {letter === " " ? "\u00a0" : letter}
          </span>
        </span>
      ))}
    </span>
  );
}
