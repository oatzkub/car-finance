"use client";
import { useState } from "react";
import { fmt, fmt2, Label, NumInput, ResultRow, SectionTitle, InfoBox, TipBox } from "./ui";

type FuelType = "ev" | "oil";

interface CarInput {
  name: string;
  fuelType: FuelType;
  price: number;
  downPct: number;
  interestRate: number;
  loanYears: number;
  insurance: number;
  taxPrb: number;
  servicePerKm: number; // cost per 5000km service
  tireCost: number; // 4 tires
  tireKm: number; // tire lifespan km
  battery: number; // annual misc/battery fund
  other: number;
  // fuel/ev
  consumption: number; // kWh/100km or km/L
  energyCost: number; // baht/kWh or baht/L
}

function calcCar(car: CarInput, kmPerYear: number) {
  const downAmount = car.price * car.downPct / 100;
  const loanAmount = car.price - downAmount;
  const totalLoan = loanAmount * (1 + (car.interestRate / 100) * car.loanYears);
  const yearlyLoan = totalLoan / car.loanYears;
  const monthlyLoan = yearlyLoan / 12;

  const servicePerYear = (kmPerYear / 5000) * car.servicePerKm;
  const tirePerYear = (car.tireCost / car.tireKm) * kmPerYear;
  const fixedPerYear = car.insurance + car.taxPrb + servicePerYear + tirePerYear + car.battery + car.other;

  let energyPerYear: number;
  if (car.fuelType === "ev") {
    energyPerYear = (kmPerYear / 100) * car.consumption * car.energyCost;
  } else {
    energyPerYear = (kmPerYear / car.consumption) * car.energyCost;
  }

  const operatingPerYear = fixedPerYear + energyPerYear;
  const totalYear1 = downAmount + yearlyLoan + operatingPerYear;
  const totalYearN = yearlyLoan + operatingPerYear; // after year 1

  return {
    downAmount, loanAmount, totalLoan, yearlyLoan, monthlyLoan,
    servicePerYear, tirePerYear, fixedPerYear,
    energyPerYear, operatingPerYear,
    totalYear1, totalYearN,
    costPerKm: operatingPerYear / kmPerYear,
  };
}

const defaultCar = (fuelType: FuelType): CarInput => ({
  name: fuelType === "ev" ? "รถยนต์ไฟฟ้า" : "รถยนต์น้ำมัน",
  fuelType,
  price: fuelType === "ev" ? 700000 : 500000,
  downPct: 25,
  interestRate: 1.98,
  loanYears: 5,
  insurance: 24000,
  taxPrb: 2000,
  servicePerKm: 2000,
  tireCost: 20000,
  tireKm: 40000,
  battery: 1000,
  other: 0,
  consumption: fuelType === "ev" ? 16 : 14,
  energyCost: fuelType === "ev" ? 6.9 : 33,
});

function CarForm({ car, onChange }: { car: CarInput; onChange: (c: CarInput) => void }) {
  const s = (field: keyof CarInput) => (v: number) => onChange({ ...car, [field]: v });
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div>
        <Label>ราคารถ (บาท)</Label>
        <NumInput value={car.price} onChange={s("price")} step={10000} suffix="฿" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <Label>เงินดาวน์ (%)</Label>
          <NumInput value={car.downPct} onChange={s("downPct")} step={5} suffix="%" />
        </div>
        <div>
          <Label>ดอกเบี้ย (%/ปี)</Label>
          <NumInput value={car.interestRate} onChange={s("interestRate")} step={0.1} suffix="%" />
        </div>
      </div>
      <div>
        <Label>จำนวนปีผ่อน</Label>
        <NumInput value={car.loanYears} onChange={s("loanYears")} step={1} suffix="ปี" />
      </div>
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10 }}>
        <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 8 }}>ค่าใช้จ่ายประจำปี</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div><Label>ประกันภัย/ปี</Label><NumInput value={car.insurance} onChange={s("insurance")} step={1000} suffix="฿" /></div>
          <div><Label>ภาษี+พ.ร.บ./ปี</Label><NumInput value={car.taxPrb} onChange={s("taxPrb")} step={100} suffix="฿" /></div>
          <div><Label>เช็คระยะ/5,000 กม.</Label><NumInput value={car.servicePerKm} onChange={s("servicePerKm")} step={500} suffix="฿" /></div>
          <div><Label>สำรองแบตฯ/ปี</Label><NumInput value={car.battery} onChange={s("battery")} step={500} suffix="฿" /></div>
        </div>
      </div>
      <div>
        <Label>ยาง 4 เส้น (฿)</Label>
        <NumInput value={car.tireCost} onChange={s("tireCost")} step={1000} suffix="฿" />
      </div>
      <div>
        <Label>อายุยาง (กม.)</Label>
        <NumInput value={car.tireKm} onChange={s("tireKm")} step={5000} suffix="กม." />
      </div>
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10 }}>
        <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 8 }}>
          {car.fuelType === "ev" ? "พลังงานไฟฟ้า" : "เชื้อเพลิง"}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {car.fuelType === "ev" ? (
            <>
              <div><Label>อัตราสิ้นเปลือง (kWh/100กม.)</Label><NumInput value={car.consumption} onChange={s("consumption")} step={0.5} suffix="kWh" /></div>
              <div><Label>ค่าไฟฟ้า (บาท/kWh)</Label><NumInput value={car.energyCost} onChange={s("energyCost")} step={0.1} suffix="฿" /></div>
            </>
          ) : (
            <>
              <div><Label>อัตราสิ้นเปลือง (กม./ลิตร)</Label><NumInput value={car.consumption} onChange={s("consumption")} step={0.5} suffix="กม./L" /></div>
              <div><Label>ราคาน้ำมัน (บาท/ลิตร)</Label><NumInput value={car.energyCost} onChange={s("energyCost")} step={0.5} suffix="฿/L" /></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CostCalculator() {
  const [kmDay, setKmDay] = useState(50);
  const [kmTravel, setKmTravel] = useState(5000);
  const [car, setCar] = useState<CarInput>(defaultCar("ev"));

  const kmYear = kmDay * 260 + kmTravel;
  const kmMonth = kmYear / 12;
  const r = calcCar(car, kmYear);

  const badges: Record<string, string> = {
    ev: "EV ⚡",
    oil: "น้ำมัน ⛽",
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
        <button
          onClick={() => setCar(c => ({ ...defaultCar("ev"), price: c.price, downPct: c.downPct, loanYears: c.loanYears }))}
          style={{
            padding: "10px", borderRadius: 8, border: "1px solid",
            borderColor: car.fuelType === "ev" ? "var(--accent)" : "var(--border)",
            background: car.fuelType === "ev" ? "rgba(245,166,35,0.1)" : "var(--surface)",
            color: car.fuelType === "ev" ? "var(--accent)" : "var(--text2)",
            cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600
          }}
        >⚡ รถไฟฟ้า</button>
        <button
          onClick={() => setCar(c => ({ ...defaultCar("oil"), price: c.price, downPct: c.downPct, loanYears: c.loanYears }))}
          style={{
            padding: "10px", borderRadius: 8, border: "1px solid",
            borderColor: car.fuelType === "oil" ? "var(--accent)" : "var(--border)",
            background: car.fuelType === "oil" ? "rgba(245,166,35,0.1)" : "var(--surface)",
            color: car.fuelType === "oil" ? "var(--accent)" : "var(--text2)",
            cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600
          }}
        >⛽ รถน้ำมัน</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20 }}>
        {/* Input column */}
        <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
          <div className="card">
            <SectionTitle>🛣️ ระยะทาง</SectionTitle>
            <div style={{ display: "grid", gap: 10 }}>
              <div>
                <Label>ระยะทางขับ/วัน (วันทำงาน 260 วัน)</Label>
                <NumInput value={kmDay} onChange={setKmDay} step={5} suffix="กม." />
              </div>
              <div>
                <Label>ขับท่องเที่ยว/ปี</Label>
                <NumInput value={kmTravel} onChange={setKmTravel} step={500} suffix="กม." />
              </div>
              <InfoBox items={[
                { label: "รวม/ปี", value: `${fmt(kmYear)} กม.` },
                { label: "เฉลี่ย/เดือน", value: `${fmt(kmMonth)} กม.` },
              ]} />
            </div>
          </div>
          <div className="card">
            <SectionTitle badge={badges[car.fuelType]}>🚗 ข้อมูลรถ</SectionTitle>
            <CarForm car={car} onChange={setCar} />
          </div>
        </div>

        {/* Result column */}
        <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
          <div className="card">
            <SectionTitle>💳 ภาระสินเชื่อ</SectionTitle>
            <InfoBox items={[
              { label: "เงินดาวน์", value: `${fmt(r.downAmount)} บาท` },
              { label: "ยอดจัดสินเชื่อ", value: `${fmt(r.loanAmount)} บาท` },
              { label: "ดอกเบี้ยรวม", value: `${fmt(r.totalLoan - r.loanAmount)} บาท`, color: "var(--red)" },
              { label: "ยอดหนี้รวม", value: `${fmt(r.totalLoan)} บาท` },
              { label: "ค่างวด/ปี", value: `${fmt(r.yearlyLoan)} บาท`, color: "var(--accent)" },
              { label: "ค่างวด/เดือน", value: `${fmt(r.monthlyLoan)} บาท`, color: "var(--accent)" },
            ]} />
          </div>

          <div className="card">
            <SectionTitle>🔧 ค่าใช้จ่ายประจำปี (ไม่รวมค่างวด)</SectionTitle>
            <ResultRow label="ประกัน + ภาษี + พ.ร.บ." year={car.insurance + car.taxPrb} month={(car.insurance + car.taxPrb) / 12} />
            <ResultRow label="เช็คระยะ" year={r.servicePerYear} month={r.servicePerYear / 12} />
            <ResultRow label="ยาง (เฉลี่ย)" year={r.tirePerYear} month={r.tirePerYear / 12} />
            <ResultRow label="สำรองแบตฯ/อื่นๆ" year={car.battery + car.other} month={(car.battery + car.other) / 12} />
            <ResultRow label={car.fuelType === "ev" ? "ค่าไฟฟ้า" : "ค่าน้ำมัน"} year={r.energyPerYear} month={r.energyPerYear / 12} />
            <ResultRow label="รวมค่าดำเนินการ" year={r.operatingPerYear} month={r.operatingPerYear / 12} highlight />
          </div>

          <div className="card">
            <SectionTitle>📊 ค่าใช้จ่ายรวมต่อปี</SectionTitle>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ background: "rgba(245,166,35,0.08)", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 4 }}>ปีที่ 1 (รวมดาวน์)</div>
                  <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: "var(--accent)" }}>{fmt(r.totalYear1)}</div>
                  <div style={{ fontSize: 12, color: "var(--text2)" }}>{fmt(r.totalYear1 / 12)} บาท/เดือน</div>
                </div>
                <div style={{ background: "var(--surface2)", borderRadius: 10, padding: 14, border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 4 }}>ปีที่ 2+ (ขณะผ่อน)</div>
                  <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>{fmt(r.totalYearN)}</div>
                  <div style={{ fontSize: 12, color: "var(--text2)" }}>{fmt(r.totalYearN / 12)} บาท/เดือน</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ background: "var(--surface2)", borderRadius: 10, padding: 14, border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 4 }}>หลังผ่อนหมด/ปี</div>
                  <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: "var(--green)" }}>{fmt(r.operatingPerYear)}</div>
                  <div style={{ fontSize: 12, color: "var(--text2)" }}>{fmt(r.operatingPerYear / 12)} บาท/เดือน</div>
                </div>
                <div style={{ background: "var(--surface2)", borderRadius: 10, padding: 14, border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 4 }}>ต้นทุน/กิโลเมตร</div>
                  <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: "var(--blue)" }}>{fmt2(r.costPerKm)}</div>
                  <div style={{ fontSize: 12, color: "var(--text2)" }}>บาท/กม. (เฉพาะ operating)</div>
                </div>
              </div>
            </div>
          </div>

          <TipBox>
            <strong>สิ่งที่ควรรู้:</strong> ค่าใช้จ่ายจริงแตกต่างตามพฤติกรรมขับขี่ · รถ EV ค่าบำรุงรักษาน้อยกว่าเพราะชิ้นส่วนน้อย 
            แต่ประกันภัยมักแพงกว่า · ราคาน้ำมันและค่าไฟอาจเปลี่ยนแปลงได้ · 
            ควรเผื่อเงินฉุกเฉินรถอีก 10-20% ของค่าใช้จ่ายรวม
          </TipBox>
        </div>
      </div>
    </div>
  );
}
