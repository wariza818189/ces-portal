import type { RowDataPacket } from "mysql2";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/button-styles";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { GOODS_CATEGORIES } from "@/lib/constants";
import { getTodayIsoDate, isValidIsoDate } from "@/lib/date";
import { getExpiryStatus, type ExpiryStatus } from "@/lib/expiry";
import { requireUser } from "@/lib/auth/session";

type GoodsRow = RowDataPacket & {
  id: string;
  category: string;
  quantity: string;
  unit: string;
  dateReceived: string;
  expiryDate: string;
};
type InventoryRecord = GoodsRow & { status: ExpiryStatus };

const statusLabels: Record<ExpiryStatus, string> = {
  expired: "Expired",
  "expiring-soon": "Expiring soon",
  fresh: "Fresh",
};
const statusVariants = {
  expired: "error",
  "expiring-soon": "warning",
  fresh: "success",
} as const;

function formatQuantity(value: string) {
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) {
    throw new Error("Invalid recorded quantity.");
  }
  return value.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  await requireUser("/inventory");
  const input = (await searchParams).category;
  const category = typeof input === "string"
    && GOODS_CATEGORIES.some((value) => value === input) ? input : "";
  let records: InventoryRecord[] = [];
  let noMatch = false;
  let loadFailed = false;
  try {
    const today = getTodayIsoDate();
    const { db } = await import("@/lib/db");
    const [rows] = await db.execute<GoodsRow[]>(
      `SELECT CAST(id AS CHAR) AS id, category,
              CAST(quantity AS CHAR) AS quantity, unit,
              DATE_FORMAT(date_received, '%Y-%m-%d') AS dateReceived,
              DATE_FORMAT(expiry_date, '%Y-%m-%d') AS expiryDate
       FROM goods_donations
       ${category ? "WHERE category = ?" : ""}
       ORDER BY expiry_date ASC, id ASC`,
      category ? [category] : [],
    );
    records = rows.map((row) => {
      if (!isValidIsoDate(row.dateReceived)) {
        throw new Error("Invalid recorded received date.");
      }
      return {
        ...row,
        quantity: formatQuantity(row.quantity),
        status: getExpiryStatus(row.expiryDate, today),
      };
    });
    if (!records.length && category) {
      const [existing] = await db.execute<RowDataPacket[]>(
        "SELECT 1 FROM goods_donations LIMIT 1",
      );
      noMatch = existing.length > 0;
    }
  } catch (error) {
    loadFailed = true;
    const code = typeof error === "object" && error !== null && "code" in error
      ? error.code : undefined;
    console.error("Inventory load failed.", {
      code: typeof code === "string" && /^ER_[A-Z0-9_]{1,60}$/.test(code)
        ? code : "UNCLASSIFIED",
    });
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Inventory" description="View recorded donated goods and their expiry status." />
      <form action="/inventory" method="get" className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-0 sm:min-w-48">
          <label htmlFor="inventory-category" className="block text-sm font-medium text-foreground">Category</label>
          <select key={category} id="inventory-category" name="category" defaultValue={category}
            className="mt-2 min-h-11 w-full rounded-lg border border-input-border bg-surface px-3 py-2 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
            <option value="">All</option>
            {GOODS_CATEGORIES.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>
        <button type="submit" className={buttonStyles.primary}>Apply filter</button>
        <Link href="/inventory" className={buttonStyles.secondary}>All categories</Link>
      </form>
      {loadFailed ? (
        <section role="alert" className="rounded-xl border border-error-border bg-error-surface p-6 text-error">
          <h2 className="font-semibold">Unable to load recorded goods</h2>
          <p className="mt-2">Please try loading Inventory again. If the problem continues, contact CES support.</p>
        </section>
      ) : !records.length ? (
        <section className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-foreground">{noMatch ? "No matching category" : "No Goods recorded"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {noMatch ? `No recorded donated goods match ${category}. Choose another category or All.` : "Recorded donated goods will appear here after staff save a Goods Donation."}
          </p>
        </section>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-border bg-surface md:block">
            <table className="w-full text-left text-sm">
              <caption className="px-5 py-4 text-left font-semibold text-foreground">Recorded donated goods — expiry soonest first</caption>
              <thead className="border-y border-border bg-hover-surface text-muted-foreground">
                <tr>
                  {["Category", "Quantity / Unit", "Date Received", "Expiry Date", "Expiry Status"].map((label) => <th key={label} scope="col" className="px-4 py-3">{label}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {records.map((record) => (
                  <tr key={record.id}>
                    <th scope="row" className="px-4 py-4 font-medium">{record.category}</th>
                    <td className="px-4 py-4 tabular-nums">{record.quantity} {record.unit}</td>
                    <td className="px-4 py-4 tabular-nums">{record.dateReceived}</td>
                    <td className="px-4 py-4 tabular-nums">{record.expiryDate}</td>
                    <td className="px-4 py-4 tabular-nums"><StatusBadge variant={statusVariants[record.status]}>{statusLabels[record.status]}</StatusBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <section aria-label="Recorded donated goods — expiry soonest first" className="space-y-4 md:hidden">
            {records.map((record) => (
              <article key={record.id} className="rounded-xl border border-border bg-surface p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-foreground">{record.category}</h2>
                  <StatusBadge variant={statusVariants[record.status]}>{statusLabels[record.status]}</StatusBadge>
                </div>
                <dl className="mt-4 space-y-3 text-sm text-foreground">
                  {[
                    ["Quantity / Unit", `${record.quantity} ${record.unit}`],
                    ["Date Received", record.dateReceived],
                    ["Expiry Date", record.expiryDate],
                  ].map(([label, value]) => (
                    <div key={label}><dt className="font-medium text-muted-foreground">{label}</dt><dd className="mt-1 wrap-anywhere tabular-nums">{value}</dd></div>
                  ))}
                </dl>
              </article>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
