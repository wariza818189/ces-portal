"use client";

import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { CashForm } from "@/components/donations/cash-form";
import { GoodsForm } from "@/components/donations/goods-form";

const tabs = ["Goods", "Cash"] as const;
export function DonationTabs() {
  const [selected, setSelected] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <Card>
      <div role="tablist" aria-label="Donation type" className="mb-6 flex gap-2 border-b border-border pb-4">
        {tabs.map((tab, index) => (
          <button key={tab} ref={(element) => { buttons.current[index] = element; }}
            type="button" role="tab" id={`donation-tab-${tab}`} aria-controls={`donation-panel-${tab}`}
            aria-selected={selected === index} tabIndex={selected === index ? 0 : -1}
            onClick={() => setSelected(index)}
            onKeyDown={(event) => {
              let next: number;
              if (event.key === "ArrowRight" || event.key === "ArrowLeft") next = 1 - index;
              else if (event.key === "Home") next = 0;
              else if (event.key === "End") next = 1;
              else return;
              event.preventDefault();
              setSelected(next);
              buttons.current[next]?.focus();
            }}
            className={`min-h-11 min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:flex-none sm:px-5 ${selected === index ? "border-primary bg-active-surface text-primary" : "border-transparent text-muted-foreground hover:bg-hover-surface"}`}>
            {tab} Donation
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <section key={tab} role="tabpanel" id={`donation-panel-${tab}`} aria-labelledby={`donation-tab-${tab}`}
          hidden={selected !== index} className="min-w-0">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">{tab} Donation</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {tab === "Goods" ? "Enter the information after the donated goods have been segregated and counted." : "Record the final amount after the cash has been manually counted."}
            </p>
          </div>
          {tab === "Goods" ? <GoodsForm /> : <CashForm />}
        </section>
      ))}
    </Card>
  );
}
