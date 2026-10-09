import type { RowDataPacket } from "mysql2";
import { connection } from "next/server";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { getTodayIsoDate, isValidIsoDate } from "@/lib/date";
import { getExpiryStatus, type ExpiryStatus } from "@/lib/expiry";
import { requireUser } from "@/lib/auth/session";

type SummaryRow = RowDataPacket & {
  cashTotal: unknown;
  volunteerCount: unknown;
};
type ExpiryRow = RowDataPacket & {
  expiryDate: unknown;
  recordCount: unknown;
};
type DashboardData = {
  today: string;
  goodsCount: string;
  cashTotal: string;
  volunteerCount: string;
  expiryCounts: Record<ExpiryStatus, string>;
};

function parseCount(value: unknown): bigint {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    throw new Error("Invalid recorded count.");
  }
  return BigInt(value);
}

function formatCashTotal(value: unknown): string {
  if (typeof value !== "string") {
    throw new Error("Invalid recorded cash total.");
  }
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value);
  if (!match) {
    throw new Error("Invalid recorded cash total.");
  }
  const integer = match[1].replace(/^0+(?=\d)/, "");
  return `${integer}.${(match[2] ?? "").padEnd(2, "0")}`;
}

export default async function DashboardPage() {
  await requireUser("/dashboard");
  await connection();
  let data: DashboardData | null = null;
  try {
    const today = getTodayIsoDate();
    if (!isValidIsoDate(today)) {
      throw new Error("Invalid application calendar date.");
    }
    const { db } = await import("@/lib/db");
    const [[summaryRows], [expiryRows]] = await Promise.all([
      db.execute<SummaryRow[]>(
        `SELECT CAST(COALESCE(SUM(amount), 0.00) AS CHAR) AS cashTotal,
                (SELECT CAST(COUNT(*) AS CHAR) FROM volunteers) AS volunteerCount
         FROM cash_donations`,
      ),
      db.execute<ExpiryRow[]>(
        `SELECT DATE_FORMAT(expiry_date, '%Y-%m-%d') AS expiryDate,
                CAST(COUNT(*) AS CHAR) AS recordCount
         FROM goods_donations
         GROUP BY expiry_date`,
      ),
    ]);
    if (!Array.isArray(summaryRows) || summaryRows.length !== 1 || !Array.isArray(expiryRows)) {
      throw new Error("Invalid dashboard result.");
    }
    const cashTotal = formatCashTotal(summaryRows[0].cashTotal);
    const volunteerCount = parseCount(summaryRows[0].volunteerCount).toString();
    const expiryCounts: Record<ExpiryStatus, bigint> = {
      fresh: BigInt(0),
      "expiring-soon": BigInt(0),
      expired: BigInt(0),
    };
    let goodsCount = BigInt(0);
    for (const row of expiryRows) {
      if (typeof row.expiryDate !== "string") {
        throw new Error("Invalid recorded expiry date.");
      }
      const count = parseCount(row.recordCount);
      if (count === BigInt(0)) {
        throw new Error("Invalid expiry group count.");
      }
      const status = getExpiryStatus(row.expiryDate, today);
      expiryCounts[status] += count;
      goodsCount += count;
    }
    data = {
      today,
      goodsCount: goodsCount.toString(),
      cashTotal,
      volunteerCount,
      expiryCounts: {
        fresh: expiryCounts.fresh.toString(),
        "expiring-soon": expiryCounts["expiring-soon"].toString(),
        expired: expiryCounts.expired.toString(),
      },
    };
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error
      ? error.code : undefined;
    console.error("Dashboard load failed.", {
      code: typeof code === "string" && /^ER_[A-Z0-9_]{1,60}$/.test(code)
        ? code : "UNCLASSIFIED",
    });
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description="Overview of CES donation and volunteer activity." />
      {data === null ? (
        <section role="alert" className="rounded-xl border border-error-border bg-error-surface p-6 text-error">
          <h2 className="font-semibold">Unable to load Dashboard</h2>
          <p className="mt-2">Please try loading Dashboard again. If the problem continues, contact CES support.</p>
        </section>
      ) : (
        <>
          <section aria-label="Record summary" className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Goods Records", value: data.goodsCount },
              { label: "Cash Donation Total", value: data.cashTotal },
              { label: "Volunteer Submissions", value: data.volunteerCount },
            ].map((card) => (
              <Card key={card.label}>
                <h2 className="text-sm font-medium text-muted-foreground">{card.label}</h2>
                <p className="mt-3 wrap-anywhere text-3xl font-semibold tracking-tight text-foreground tabular-nums">{card.value}</p>
              </Card>
            ))}
          </section>
          <section aria-labelledby="expiry-summary-heading" className="min-w-0">
            <Card>
              <h2 id="expiry-summary-heading" className="text-lg font-semibold text-foreground">Inventory status</h2>
              <p className="mt-1 text-sm text-muted-foreground">Current expiry condition of recorded goods.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Recorded Goods by expiry status as of <time dateTime={data.today}>{data.today}</time> (application date).
              </p>
              {data.goodsCount === "0" && <p className="mt-2 text-sm text-muted-foreground">No recorded donated goods.</p>}
              <div className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-3">
                {[
                  { label: "Fresh", value: data.expiryCounts.fresh, variant: "success" as const },
                  { label: "Expiring soon", value: data.expiryCounts["expiring-soon"], variant: "warning" as const },
                  { label: "Expired", value: data.expiryCounts.expired, variant: "error" as const },
                ].map((card) => (
                  <article key={card.label} className="min-w-0">
                    <h3><StatusBadge variant={card.variant}>{card.label}</StatusBadge></h3>
                    <p className="mt-2 wrap-anywhere text-2xl font-semibold text-foreground tabular-nums">{card.value}</p>
                  </article>
                ))}
              </div>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
