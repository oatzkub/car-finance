"use client";
import { useState } from "react";
import { fmt, fmt2, Label, NumInput, SectionTitle, TipBox } from "./ui";

interface CarRow {
  name: string;
  price: number;
  downPct: number;
  payments: { months: number; monthlyPayment: number; rate: number }[];
}

const TENORS = [48, 60, 72, 84];

// Approximate flat rates from Excel data
const RATES: Record<number, number> = { 48: 2.29, 60: 2.49, 72: 2.9, 84: 3.4 };

const defaultCars: CarRow[] = [
  { name: "Toyota Ativ Premium SH", price: 533500, downPct: 25, payments: [] },
  { name: "Toyota Ativ Premium", price: 659000, downPct: 25, payments: [] },
  { name: "Toyota Cross", price: 789000, downPct: 25, payments: [] },
  { name: "BYD Dolphin (Dynamic)", price: 699900, downPct: 25, payments: [] },
  { name: "BYD Seal", price: 1099000, downPct: 25, payments: [] },
];

function calcPayment(price: number, downPct: number, months: number, flatRate: number) {
  const down = price * downPct / 100;
  const loan = price - down;
  const years = months / 12;
  const total = loan * (1 + (flatRate / 100) * years);
  const monthly = total / months;
  const totalInterest = total - loan;
  return { down, loan, total, monthly, totalInterest };
}

export default function InstallmentTable() {
  const [cars, setCars] = useState<CarRow[]>(defaultCars);
  const [customRate, setCustomRate] = useState(false);
  const [rates, setRates] = useState(RATES);
  const [selectedTenors, setSelectedTenors] = useState<Set<number>>(new Set([48, 60, 72]));
  const [income, setIncome] = useState(30000);
  const [newCar, setNewCar] = useState({ name: "", price: 0, downPct: 25 });

  const toggleTenor = (t: number) => {
    const next = new Set(selectedTenors);
    next.has(t) ? next.delete(t) : next.add(t);
    setSelectedTenors(next);
  };

  const activeTenors = TENORS.filter(t => selectedTenors.has(t));

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Settings */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <SectionTitle>⚙️ ตั้งค่า</SectionTitle>
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <Label>รายได้ต่อเดือน (คำนวณ 30% rule)</Label>
              <NumInput value={income} onChange={setIncome} step={1000} suffix="฿" />
              <div style={{ marginTop: 6, fontSize: 12, color: "var(--green)" }}>
                งวดที่เหมาะสม: ≤ {fmt(income * 0.3)} บาท/เดือน (30% ของรายได้)
              </div>
            </div>

            <div>
              <Label>เลือกระยะผ่อนที่แสดง</Label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                {TENORS.map(t => (
                  <button key={t} onClick={() => toggleTenor(t)} style={{
                    padding: "5px 14px", borderRadius: 6, fontSize: 12,
                    border: "1px solid",
                    borderColor: selectedTenors.has(t) ? "var(--accent)" : "var(--border)",
                    background: selectedTenors.has(t) ? "rgba(245,166,35,0.15)" : "var(--surface2)",
                    color: selectedTenors.has(t) ? "var(--accent)" : "var(--text2)",
                    cursor: "pointer", fontFamily: "inherit"
                  }}>{t} งวด</button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Label>อัตราดอกเบี้ย (flat rate %)</Label>
                <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--text2)", cursor: "pointer" }}>
                  <input type="checkbox" checked={customRate} onChange={e => setCustomRate(e.target.checked)} />
                  ปรับเอง
                </label>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                {TENORS.map(t => (
                  <div key={t}>
                    <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: 3 }}>{t} งวด</div>
                    {customRate ? (
                      <NumInput value={rates[t]} onChange={v => setRates({ ...rates, [t]: v })} step={0.1} suffix="%" />
                    ) : (
                      <div className="mono" style={{ fontSize: 13, color: "var(--text2)", padding: "8px 0" }}>{rates[t]}%</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <SectionTitle>➕ เพิ่มรถ</SectionTitle>
          <div style={{ display: "grid", gap: 8 }}>
            <div><Label>ชื่อรุ่นรถ</Label>
              <input className="input-field" value={newCar.name} onChange={e => setNewCar({ ...newCar, name: e.target.value })} placeholder="เช่น Honda City e:HEV" />
            </div>
            <div><Label>ราคารถ (฿)</Label>
              <NumInput value={newCar.price} onChange={v => setNewCar({ ...newCar, price: v })} step={10000} suffix="฿" />
            </div>
            <div><Label>เงินดาวน์ (%)</Label>
              <NumInput value={newCar.downPct} onChange={v => setNewCar({ ...newCar, downPct: v })} step={5} suffix="%" />
            </div>
            <button onClick={() => {
              if (newCar.name && newCar.price > 0) {
                setCars([...cars, { ...newCar, payments: [] }]);
                setNewCar({ name: "", price: 0, downPct: 25 });
              }
            }} style={{
              padding: "9px", borderRadius: 8, border: "none",
              background: "var(--accent)", color: "#000", fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit", fontSize: 13
            }}>+ เพิ่มรถ</button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <SectionTitle>📋 ตารางเปรียบเทียบผ่อน</SectionTitle>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border2)" }}>
                <th style={{ textAlign: "left", padding: "10px 8px", color: "var(--text3)", fontWeight: 400, fontSize: 11, minWidth: 160 }}>รุ่นรถ</th>
                <th style={{ textAlign: "right", padding: "10px 8px", color: "var(--text3)", fontWeight: 400, fontSize: 11 }}>ราคา</th>
                <th style={{ textAlign: "right", padding: "10px 8px", color: "var(--text3)", fontWeight: 400, fontSize: 11 }}>ดาวน์ 25%</th>
                {activeTenors.map(t => (
                  <th key={t} colSpan={2} style={{ textAlign: "center", padding: "10px 8px", color: "var(--accent)", fontWeight: 600, fontSize: 12, borderLeft: "1px solid var(--border)" }}>
                    {t} งวด ({rates[t]}%)
                  </th>
                ))}
                <th style={{ textAlign: "right", padding: "10px 8px", color: "var(--text3)", fontWeight: 400, fontSize: 11, borderLeft: "1px solid var(--border)" }}>ลบ</th>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface2)" }}>
                <td colSpan={3}></td>
                {activeTenors.map(t => (
                  <>
                    <td key={`${t}-m`} style={{ textAlign: "right", padding: "5px 8px", color: "var(--text3)", fontSize: 11, borderLeft: "1px solid var(--border)" }}>งวด/เดือน</td>
                    <td key={`${t}-i`} style={{ textAlign: "right", padding: "5px 8px", color: "var(--text3)", fontSize: 11 }}>ดอกรวม</td>
                  </>
                ))}
                <td></td>
              </tr>
            </thead>
            <tbody>
              {cars.map((car, ci) => {
                const calcResults = activeTenors.map(t => calcPayment(car.price, car.downPct, t, rates[t]));
                const affordable = calcResults.map(r => r.monthly <= income * 0.3);
                return (
                  <tr key={ci} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "10px 8px" }}>
                      <div style={{ fontWeight: 500, color: "var(--text)" }}>{car.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text3)" }}>ดาวน์ {car.downPct}%</div>
                    </td>
                    <td className="mono" style={{ textAlign: "right", padding: "10px 8px", color: "var(--text2)", fontSize: 12 }}>
                      {fmt(car.price)}
                    </td>
                    <td className="mono" style={{ textAlign: "right", padding: "10px 8px", color: "var(--text)", fontSize: 13, fontWeight: 600 }}>
                      {fmt(car.price * car.downPct / 100)}
                    </td>
                    {calcResults.map((r, ti) => (
                      <>
                        <td key={`${ti}-m`} style={{ textAlign: "right", padding: "10px 8px", borderLeft: "1px solid var(--border)" }}>
                          <div className="mono" style={{
                            fontSize: 14, fontWeight: 700,
                            color: affordable[ti] ? "var(--green)" : "var(--red)"
                          }}>{fmt(r.monthly)}</div>
                          {affordable[ti]
                            ? <div style={{ fontSize: 10, color: "var(--green)" }}>✓ ≤30%รายได้</div>
                            : <div style={{ fontSize: 10, color: "var(--red)" }}>✗ หนักเกิน</div>
                          }
                        </td>
                        <td key={`${ti}-i`} className="mono" style={{ textAlign: "right", padding: "10px 8px", color: "var(--text3)", fontSize: 12 }}>
                          {fmt(r.totalInterest)}
                        </td>
                      </>
                    ))}
                    <td style={{ textAlign: "center", padding: "10px 8px", borderLeft: "1px solid var(--border)" }}>
                      <button onClick={() => setCars(cars.filter((_, i) => i !== ci))} style={{
                        background: "none", border: "1px solid var(--border)", borderRadius: 4,
                        color: "var(--text3)", cursor: "pointer", padding: "2px 8px", fontSize: 12
                      }}>✕</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rate info */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {activeTenors.map(t => {
          const eir = rates[t] * 1.85; // approximate EIR from flat rate
          return (
            <div key={t} className="card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 4 }}>{t} งวด</div>
              <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)" }}>{rates[t]}%</div>
              <div style={{ fontSize: 11, color: "var(--text3)" }}>flat rate</div>
              <div className="mono" style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>≈{fmt2(eir)}%</div>
              <div style={{ fontSize: 11, color: "var(--text3)" }}>EIR โดยประมาณ</div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <SectionTitle>📐 กฎและหลักการ</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { icon: "💳", title: "กฎ 30%", desc: "ค่างวดรถไม่ควรเกิน 30% ของรายได้สุทธิต่อเดือน เพื่อไม่ให้กระทบค่าใช้จ่ายอื่น" },
            { icon: "⬇️", title: "ดาวน์อย่างน้อย 20-25%", desc: "ดาวน์น้อยทำให้ยอดสินเชื่อสูง ดอกรวมมากขึ้น และมีความเสี่ยงรถมีมูลค่าต่ำกว่ายอดหนี้" },
            { icon: "📅", title: "ผ่อนสั้น vs ผ่อนยาว", desc: "ผ่อนสั้น = งวดสูงกว่า แต่ดอกรวมน้อยกว่ามาก ผ่อนยาว = งวดเบา แต่เสียดอกมากขึ้น" },
            { icon: "📊", title: "Flat rate ≠ EIR", desc: "ดอก 2.49% flat = ดอกจริง ~4.6% เพราะคิดดอกจากยอดต้นทั้งหมดตลอด ไม่ใช่ยอดคงเหลือ" },
          ].map((r, i) => (
            <div key={i} style={{ background: "var(--surface2)", borderRadius: 8, padding: 12, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 16, marginBottom: 4 }}>{r.icon} <strong style={{ fontSize: 13, color: "var(--text)" }}>{r.title}</strong></div>
              <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6 }}>{r.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <TipBox>
        <strong>เคล็ดลับ:</strong> ลองเจรจาขอลดราคา ของแถม หรือดอกเบี้ยพิเศษจากโปรโมชั่น · 
        เช็คเงื่อนไขการชำระคืนก่อนกำหนดว่ามีค่าปรับหรือไม่ · 
        ถ้าดอกเบี้ยในตลาดลดลง อาจขอ refinance ได้ · 
        ประกันชั้น 1 มักบังคับตลอดระยะผ่อน ควรเผื่องบประมาณด้วย
      </TipBox>
    </div>
  );
}
