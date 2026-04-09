"use client";

export const fmt = (n: number) => n.toLocaleString("th-TH", { maximumFractionDigits: 0 });
export const fmt2 = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function Label({ children }: { children: React.ReactNode }) {
  return <label style={{ fontSize: 12, color: "var(--text2)", display: "block", marginBottom: 4 }}>{children}</label>;
}

export function NumInput({
  value,
  onChange,
  step = 1000,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  suffix?: string;
}) {
  return (
    <div style={{ position: "relative" }}>
      <input
        type="number"
        value={value}
        step={step}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="input-field"
        style={{ paddingRight: suffix ? 48 : 12 }}
      />
      {suffix && (
        <span style={{
          position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
          fontSize: 12, color: "var(--text3)", pointerEvents: "none"
        }}>{suffix}</span>
      )}
    </div>
  );
}

export function ResultRow({ label, year, month, highlight }: {
  label: string; year: number; month: number; highlight?: boolean;
}) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr auto auto",
      gap: 12, padding: "8px 10px", borderRadius: 6,
      background: highlight ? "rgba(245,166,35,0.08)" : "transparent",
      alignItems: "center"
    }}>
      <span style={{ fontSize: 13, color: highlight ? "var(--text)" : "var(--text2)" }}>{label}</span>
      <span className="mono" style={{
        fontSize: 13, color: highlight ? "var(--accent)" : "var(--text)",
        fontWeight: highlight ? 600 : 400, minWidth: 90, textAlign: "right"
      }}>{fmt(year)}</span>
      <span className="mono" style={{
        fontSize: 12, color: "var(--text3)", minWidth: 70, textAlign: "right"
      }}>{fmt(month)}/ด.</span>
    </div>
  );
}

export function SectionTitle({ children, badge }: { children: React.ReactNode; badge?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{children}</h3>
      {badge && (
        <span style={{
          fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "rgba(245,166,35,0.15)",
          color: "var(--accent)", fontWeight: 500
        }}>{badge}</span>
      )}
    </div>
  );
}

export function InfoBox({ items }: { items: { label: string; value: string; color?: string }[] }) {
  return (
    <div style={{
      background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10,
      padding: 14, display: "grid", gap: 10
    }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--text2)" }}>{item.label}</span>
          <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: item.color || "var(--text)" }}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function TipBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "rgba(96,165,250,0.07)", border: "1px solid rgba(96,165,250,0.2)",
      borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#7cb8ff", lineHeight: 1.6
    }}>
      💡 {children}
    </div>
  );
}
