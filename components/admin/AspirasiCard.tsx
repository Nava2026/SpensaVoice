import Link from "next/link";
import { STATUS_BADGE, STATUS_LABEL } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { Aspirasi } from "@/lib/types";

export default function AspirasiCard({ item }: { item: Aspirasi }) {
  return (
    <Link
      href={`/admin/aspirasi/${encodeURIComponent(item.kode)}`}
      className="signal-card"
    >
      <div className="signal-top">
        <div>
          <div className="signal-code">{item.kode}</div>
          <div className="signal-meta">
            {formatDate(item.created_at)}
            {item.topik ? ` · ${item.topik}` : ""}
            {item.kelas ? ` · ${item.kelas}` : ""}
          </div>
        </div>
        <span className={`badge ${STATUS_BADGE[item.status]}`}>
          {STATUS_LABEL[item.status]}
        </span>
      </div>

      <p className="signal-body">{item.isi}</p>

      <div className="signal-foot">
        {item.anonim ? (
          <span className="tag tag-anon">Anonim</span>
        ) : (
          <span className="tag">{item.nama || "Tanpa nama"}</span>
        )}
        {item.topik && <span className="tag">{item.topik}</span>}
        <span className="tag tag-device">
          {item.device === "mobile"
            ? "Mobile"
            : item.device === "desktop"
              ? "Desktop"
              : "Unknown"}
        </span>
      </div>
    </Link>
  );
}
