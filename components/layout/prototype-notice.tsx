export function PrototypeNotice({ publicFacing = false }: { publicFacing?: boolean }) {
  return (
    <aside aria-label="Academic prototype notice" className={publicFacing
      ? "rounded-xl border border-info-border bg-info-surface px-4 py-4 text-sm leading-6 text-info"
      : "rounded-lg border border-border bg-surface px-4 py-3 text-sm leading-6 text-muted-foreground"}>
      <strong className="font-semibold">Academic prototype.</strong>{" "}
      {publicFacing
        ? "Use fictional information only. Do not submit real personal or contact information. Institutional production use is not approved."
        : "Fictional records only. Real-data collection and institutional production use are not approved."}
    </aside>
  );
}
