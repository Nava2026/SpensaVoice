"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Password salah. Coba lagi.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Gagal login. Cek koneksi kamu ya.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-wrap">
      <div className="login-card">
        <div className="login-eyebrow">SPENSAVOICE ADMIN</div>
        <h1 className="login-title">Masuk dulu yuk</h1>
        <p className="login-desc">
          Halaman ini khusus pengurus OSIS & pembina. Siswa gak perlu login buat
          kirim aspirasi.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="label" htmlFor="password">
              Password admin
            </label>
            <input
              id="password"
              type="password"
              className={`input${error ? " input-error" : ""}`}
              placeholder="••••••••"
              value={password}
              autoFocus
              onChange={(event) => {
                setPassword(event.target.value);
                if (error) setError("");
              }}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            style={{ marginTop: "0.75rem" }}
            disabled={loading}
          >
            {loading ? "Masuk..." : "Masuk"}
          </button>
        </form>

        <p className="login-foot">
          Satu password buat semua pengurus. Jangan disebar ya.
        </p>
      </div>
    </main>
  );
}
