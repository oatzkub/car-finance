"use client";
import { useState } from "react";
import { fmt, fmt2, Label, NumInput, SectionTitle, TipBox } from "./ui";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

type FuelType = "ev" | "oil";

interface CarCompare {
  name: string;
  fuelType: FuelType;
  price: number;
  downPct: number;
  interestRate: number;
  loanYears: number;
  insurance: number;
  taxPrb: number;
  servicePerKm: number;
  tireCost: number;
  tireKm: number;
  other: number;
  consumption: number;
  energyCost: number;
}

function calc(car: CarCompare, kmYear: number) {
  const down = car.price * car.downPct / 100;
  const loan = car.price - down;
  const totalLoan = loan * (1 + (car.interestRate / 100) * car.loanYears);
  const yearlyLoan = totalLoan / car.loanYears;
  const service = (kmYear / 5000) * car.servicePerKm;
  const tires = (car.tireCost / car.tireKm) * kmYear;
  const fixed = car.insurance + car.taxPrb + service + tires + car.other;
  const energy = car.fuelType === "ev"
    ? (kmYear / 100) * car.consumption * car.energyCost
    : (kmYear / car.consumption) * car.energyCost;
  const operating = fixed + energy;
  return {
    down, loan, totalLoan, yearlyLoan,
    service, tires, fixed, energy, operating,
    year1: down + yearlyLoan + operating,
    yearN: yearlyLoan + operating,
    afterLoan: operating,
    total8: down + yearlyLoan * car.loanYears + operating * 8,
    costPerKm: operating / kmYear,
  };
}

const COLORS = ["#f5a623", "#60a5fa", "#34d399"];

export default function CompareCalculator() {
  const [kmDay, setKmDay] = useState(50);
  const [kmTravel, setKmTravel] = useState(5000);
  const [cars, setCars] = useState<CarCompare[]>([
    {
      name: "รถมือสอง/เก่า", fuelType: "oil", price: 300000, downPct: 0,
      interestRate: 0, loanYears: 4, insurance: 8000, taxPrb: 2200,
      servicePerKm: 3000, tireCost: 20000, tireKm: 40000, other: 5000,
      consumption: 13, energyCost: 33,
    },
    {
      name: "รถน้ำมันใหม่", fuelType: "oil", price: 700000, downPct: 25,
      interestRate: 2.5, loanYears: 5, insurance: 27000, taxPrb: 2000,
      servicePerKm: 2000, tireCost: 20000, tireKm: 40000, other: 5000,
      consumption: 14, energyCost: 33,
    },
    {
      name: "รถ EV", fuelType: "ev", price: 800000, downPct: 25,
      interestRate: 1.98, loanYears: 5, insurance: 30000, taxPrb: 2000,
      servicePerKm: 1500, tireCost: 20000, tireKm: 40000, other: 3000,
      consumption: 16, energyCost: 6.9,
    },
  ]);

  const kmYear = kmDay * 260 + kmTravel;
  const results = cars.map(c => calc(c, kmYear));

  const updateCar = (i: number, field: keyof CarCompare, val: number | string) => {
    setCars(cars.map((c, idx) => idx === i ? { ...c, [field]: val } : c));
  };

  const chartData = [
    { name: "ปีที่ 1", ...Object.fromEntries(cars.map((c, i) => [c.name, Math.round(results[i].year1)])) },
    { name: "ปีที่ 2–5", ...Object.fromEntries(cars.map((c, i) => [c.name, Math.round(results[i].yearN)])) },
    { name: "หลังผ่อนหมด", ...Object.fromEntries(cars.map((c, i) => [c.name, Math.round(results[i].afterLoan)])) },
  ];

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Distance */}
      <div className="card">
        <SectionTitle>🛣️ ระยะทาง (ใช้ร่วมกันทุกคัน)</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div><Label>ขับ/วัน (260 วัน)</Label><NumInput value={kmDay} onChange={setKmDay} step={5} suffix="กม." /></div>
          <div><Label>ท่องเที่ยว/ปี</Label><NumInput value={kmTravel} onChange={setKmTravel} step={500} suffix="กม." /></div>
          <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 2 }}>
            <div style={{ background: "rgba(245,166,35,0.08)", padding: "8px 14px", borderRadius: 8, width: "100%" }}>
              <div style={{ fontSize: 11, color: "var(--text3)" }}>รวม/ปี</div>
              <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>{fmt(kmYear)} กม.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cars grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {cars.map((car, i) => (
          <div key={i} className="card" style={{ borderColor: COLORS[i] + "44" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <input
                value={car.name}
                onChange={e => updateCar(i, "name", e.target.value)}
                style={{
                  background: "none", border: "none", color: COLORS[i],
                  fontSize: 14, fontWeight: 700, fontFamily: "inherit", width: "100%"
                }}
              />
              <span style={{
                fontSize: 10, padding: "2px 6px", borderRadius: 99,
                background: car.fuelType === "ev" ? "#1a3a2a" : "#2a1e10",
                color: car.fuelType === "ev" ? "var(--green)" : "#f5a623",
                border: `1px solid ${car.fuelType === "ev" ? "#235234" : "#4a3015"}`,
                whiteSpace: "nowrap"
              }}>{car.fuelType === "ev" ? "⚡ EV" : "⛽ น้ำมัน"}</span>
            </div>

            <div style={{ display: "grid", gap: 7 }}>
              <div><Label>ราคารถ (฿)</Label>
                <NumInput value={car.price} onChange={v => updateCar(i, "price", v)} step={10000} suffix="฿" /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <div><Label>ดาวน์ (%)</Label>
                  <NumInput value={car.downPct} onChange={v => updateCar(i, "downPct", v)} step={5} suffix="%" /></div>
                <div><Label>ดอกเบี้ย (%)</Label>
                  <NumInput value={car.interestRate} onChange={v => updateCar(i, "interestRate", v)} step={0.1} suffix="%" /></div>
              </div>
              <div><Label>ระยะผ่อน (ปี)</Label>
                <NumInput value={car.loanYears} onChange={v => updateCar(i, "loanYears", v)} step={1} suffix="ปี" /></div>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 8 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  <div><Label>ประกัน/ปี</Label>
                    <NumInput value={car.insurance} onChange={v => updateCar(i, "insurance", v)} step={1000} /></div>
                  <div><Label>ภาษี+พ.ร.บ.</Label>
                    <NumInput value={car.taxPrb} onChange={v => updateCar(i, "taxPrb", v)} step={100} /></div>
                  <div><Label>เช็ค/5,000กม.</Label>
                    <NumInput value={car.servicePerKm} onChange={v => updateCar(i, "servicePerKm", v)} step={500} /></div>
                  <div><Label>อื่นๆ/ปี</Label>
                    <NumInput value={car.other} onChange={v => updateCar(i, "other", v)} step={500} /></div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <div>
                  <Label>{car.fuelType === "ev" ? "kWh/100กม." : "กม./ลิตร"}</Label>
                  <NumInput value={car.consumption} onChange={v => updateCar(i, "consumption", v)} step={0.5} />
                </div>
                <div>
                  <Label>{car.fuelType === "ev" ? "฿/kWh" : "฿/ลิตร"}</Label>
                  <NumInput value={car.energyCost} onChange={v => updateCar(i, "energyCost", v)} step={0.5} />
                </div>
              </div>
            </div>

            {/* Results */}
            <div style={{ marginTop: 14, background: "var(--bg)", borderRadius: 8, padding: 12, border: "1px solid var(--border)" }}>
              <div style={{ display: "grid", gap: 6 }}>
                {[
                  { l: "ค่างวด/เดือน", v: results[i].yearlyLoan / 12, c: "var(--text)" },
                  { l: "พลังงาน/ปี", v: results[i].energy, c: "var(--text2)" },
                  { l: "ดำเนินการ/ปี", v: results[i].operating, c: "var(--text2)" },
                  { l: "รวม/เดือน (ปีที่ 2+)", v: results[i].yearN / 12, c: COLORS[i] },
                ].map((row, j) => (
                  <div key={j} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ color: "var(--text3)" }}>{row.l}</span>
                    <span className="mono" style={{ color: row.c, fontWeight: j === 3 ? 700 : 400 }}>{fmt(row.v)}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, borderTop: "1px solid var(--border)", paddingTop: 8 }}>
                <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 2 }}>ต้นทุน/กม. (operating)</div>
                <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: COLORS[i] }}>{fmt2(results[i].costPerKm)} ฿/กม.</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card">
        <SectionTitle>📊 เปรียบเทียบค่าใช้จ่ายต่อปี (บาท)</SectionTitle>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barGap={4}>
            <XAxis dataKey="name" tick={{ fill: "var(--text2)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--text3)", fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              formatter={(v: unknown) => [`${fmt(Number(v))} บาท`]}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {cars.map((c, i) => (
              <Bar key={i} dataKey={c.name} fill={COLORS[i]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary table */}
      <div className="card">
        <SectionTitle>📋 สรุปเปรียบเทียบ</SectionTitle>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ textAlign: "left", padding: "8px 10px", color: "var(--text3)", fontWeight: 400, fontSize: 12 }}>รายการ</th>
                {cars.map((c, i) => (
                  <th key={i} style={{ textAlign: "right", padding: "8px 10px", color: COLORS[i], fontWeight: 600 }}>{c.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "ราคารถ", vals: cars.map(c => fmt(c.price) + " ฿") },
                { label: "เงินดาวน์", vals: results.map(r => fmt(r.down) + " ฿") },
                { label: "ดอกเบี้ยรวม", vals: results.map(r => fmt(r.totalLoan - r.loan) + " ฿") },
                { label: "ค่างวด/เดือน", vals: results.map(r => fmt(r.yearlyLoan / 12) + " ฿"), hl: true },
                { label: "ค่าพลังงาน/ปี", vals: results.map(r => fmt(r.energy) + " ฿") },
                { label: "รวม operating/ปี", vals: results.map(r => fmt(r.operating) + " ฿") },
                { label: "รวม/เดือน (ปีที่ 2+)", vals: results.map(r => fmt(r.yearN / 12) + " ฿"), hl: true },
                { label: "ต้นทุน/กม.", vals: results.map(r => fmt2(r.costPerKm) + " ฿") },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border)", background: row.hl ? "rgba(245,166,35,0.05)" : "transparent" }}>
                  <td style={{ padding: "8px 10px", color: "var(--text2)" }}>{row.label}</td>
                  {row.vals.map((v, j) => (
                    <td key={j} className="mono" style={{ padding: "8px 10px", textAlign: "right", color: row.hl ? COLORS[j] : "var(--text)", fontWeight: row.hl ? 600 : 400 }}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <TipBox>
        <strong>ข้อควรพิจารณาเพิ่มเติม:</strong> รถมือสองมีความเสี่ยงเรื่องค่าซ่อมที่ไม่แน่นอน · 
        รถ EV ค่าประกันแพงกว่าเพราะค่าชิ้นส่วน · 
        มูลค่าซากรถ EV ยังไม่แน่นอนในตลาดไทย · 
        เปรียบเทียบ "ค่าใช้จ่ายรวม" ให้ครบ อย่าดูแค่ค่างวด
      </TipBox>
    </div>
  );
}
