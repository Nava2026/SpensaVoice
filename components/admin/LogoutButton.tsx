"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    startTransition(() => {
      router.replace("/admin");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      onClick={logout}
      disabled={pending}
    >
      {pending ? "Keluar..." : "Keluar"}
    </button>
  );
}
