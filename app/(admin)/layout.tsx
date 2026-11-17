import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import LogoutButton from "@/components/admin/LogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let authed = false;
  try {
    authed = await isAdmin();
  } catch {
    authed = false;
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <Link href="/admin" className="admin-brand">
          Spensa<span>Voice</span> <small>Admin</small>
        </Link>
        <nav className="admin-nav">
          <Link href="/" className="btn btn-ghost btn-sm">
            Lihat situs
          </Link>
          {authed && (
            <>
              <Link href="/admin/pengaturan" className="btn btn-ghost btn-sm">
                Pengaturan
              </Link>
              <LogoutButton />
            </>
          )}
        </nav>
      </header>
      {children}
    </div>
  );
}
