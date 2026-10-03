"use client";

import { useRef, useState } from "react";
import { CashForm } from "@/components/donations/cash-form";
import { GoodsForm } from "@/components/donations/goods-form";

const tabs = ["Goods", "Cash"] as const;
export function DonationTabs() {
  const [selected, setSelected] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <div className="space-y-8">
      <div role="tablist" aria-label="Donation type" className="inline-flex rounded-lg border border-sky-100 bg-white p-1">
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
            className={`rounded-md px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 ${selected === index ? "bg-sky-700 text-white" : "text-slate-600 hover:bg-sky-50"}`}>
            {tab}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <section key={tab} role="tabpanel" id={`donation-panel-${tab}`} aria-labelledby={`donation-tab-${tab}`}
          hidden={selected !== index} className="max-w-2xl rounded-xl border border-sky-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">{tab} Donation</h2>
            <p className="mt-1 text-sm text-slate-600">
              {tab === "Goods" ? "Enter the information after the donated goods have been segregated and counted." : "Record the final amount after the cash has been manually counted."}
            </p>
          </div>
          {tab === "Goods" ? <GoodsForm /> : <CashForm />}
        </section>
      ))}
    </div>
  );
}
