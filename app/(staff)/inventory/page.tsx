import type { RowDataPacket } from "mysql2";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { GOODS_CATEGORIES } from "@/lib/constants";
import { getTodayIsoDate, isValidIsoDate } from "@/lib/date";
import { getExpiryStatus, type ExpiryStatus } from "@/lib/expiry";

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
const statusClasses: Record<ExpiryStatus, string> = {
  expired: "bg-red-50 text-red-800 border-red-200",
  "expiring-soon": "bg-amber-50 text-amber-800 border-amber-200",
  fresh: "bg-green-50 text-green-800 border-green-200",
};

function StatusBadge({ status }: { status: ExpiryStatus }) {
  return (
    <span className={`inline-block rounded-full border px-3 py-1 text-sm font-medium ${statusClasses[status]}`}>
      {statusLabels[status]}
    </span>
  );
}

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

  const focusClass = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700";
  return (
    <div className="space-y-8">
      <PageHeader title="Inventory" description="View recorded donated goods and their expiry status." />
      <form action="/inventory" method="get" className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="inventory-category" className="block text-sm font-medium text-slate-800">Category</label>
          <select key={category} id="inventory-category" name="category" defaultValue={category}
            className={`mt-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 ${focusClass}`}>
            <option value="">All</option>
            {GOODS_CATEGORIES.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>
        <button type="submit" className={`rounded-lg bg-sky-700 px-4 py-2 font-semibold text-white hover:bg-sky-800 ${focusClass}`}>Apply filter</button>
        <Link href="/inventory" className={`rounded px-2 py-2 text-sm font-medium text-sky-700 underline ${focusClass}`}>All categories</Link>
      </form>
      {loadFailed ? (
        <section role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
          <h2 className="font-semibold">Unable to load recorded goods</h2>
          <p className="mt-2">Please try loading Inventory again. If the problem continues, contact CES support.</p>
        </section>
      ) : !records.length ? (
        <section className="rounded-xl border border-sky-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">{noMatch ? "No matching category" : "No Goods recorded"}</h2>
          <p className="mt-2 text-sm text-slate-600">
            {noMatch ? `No recorded donated goods match ${category}. Choose another category or All.` : "Recorded donated goods will appear here after staff save a Goods Donation."}
          </p>
        </section>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-sky-100 bg-white shadow-sm md:block">
            <table className="w-full text-left text-sm">
              <caption className="px-5 py-4 text-left font-semibold text-slate-900">Recorded donated goods — expiry soonest first</caption>
              <thead className="border-y border-sky-100 bg-sky-50 text-slate-700">
                <tr>
                  {["Category", "Quantity / Unit", "Date Received", "Expiry Date", "Expiry Status"].map((label) => <th key={label} scope="col" className="px-4 py-3">{label}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100 text-slate-800">
                {records.map((record) => (
                  <tr key={record.id}>
                    <th scope="row" className="px-4 py-4 font-medium">{record.category}</th>
                    <td className="px-4 py-4">{record.quantity} {record.unit}</td>
                    <td className="px-4 py-4">{record.dateReceived}</td>
                    <td className="px-4 py-4">{record.expiryDate}</td>
                    <td className="px-4 py-4"><StatusBadge status={record.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <section aria-label="Recorded donated goods — expiry soonest first" className="space-y-4 md:hidden">
            {records.map((record) => (
              <article key={record.id} className="rounded-xl border border-sky-100 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">{record.category}</h2>
                <dl className="mt-4 space-y-3 text-sm text-slate-800">
                  {[
                    ["Quantity / Unit", `${record.quantity} ${record.unit}`],
                    ["Date Received", record.dateReceived],
                    ["Expiry Date", record.expiryDate],
                  ].map(([label, value]) => (
                    <div key={label}><dt className="font-medium text-slate-600">{label}</dt><dd className="mt-1">{value}</dd></div>
                  ))}
                  <div><dt className="font-medium text-slate-600">Expiry Status</dt><dd className="mt-1"><StatusBadge status={record.status} /></dd></div>
                </dl>
              </article>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
