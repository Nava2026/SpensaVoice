export default function SetupNotice({ message }: { message: string }) {
  return (
    <main className="admin-main">
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Setup belum beres</div>
          <h1 className="page-title">Sheet belum kesambung</h1>
        </div>
      </div>
      <div className="card" style={{ padding: "1.5rem" }}>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
          {message}
        </p>
        <p className="hint">
          Isi <code>SHEETS_WEBAPP_URL</code> dan{" "}
          <code>SHEETS_SHARED_SECRET</code> di file <code>.env.local</code>, lalu
          restart server. Detail langkahnya ada di README.
        </p>
        <a className="btn btn-secondary btn-sm" href="/" style={{ marginTop: "1rem" }}>
          Balik ke situs
        </a>
      </div>
    </main>
  );
}
