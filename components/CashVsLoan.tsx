"use client";
import { useState, useMemo } from "react";
import { fmt, fmt2, Label, NumInput, SectionTitle, TipBox } from "./ui";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";

export default function CashVsLoan() {
  const [carPrice, setCarPrice] = useState(700000);
  const [downPct, setDownPct] = useState(25);
  const [loanRate, setLoanRate] = useState(1.98);
  const [loanMonths, setLoanMonths] = useState(48);
  const [depositRate, setDepositRate] = useState(5.0);

  const down = carPrice * downPct / 100;
  const loanAmount = carPrice - down;
  const monthlyPayment = (loanAmount * (1 + (loanRate / 100) * (loanMonths / 12))) / loanMonths;
  const totalInterestPaid = monthlyPayment * loanMonths - loanAmount;

  // Cash scenario: put all money in deposit, withdraw as needed
  // Loan scenario: put down payment in deposit, keep rest earning, pay monthly installments

  const chartData = useMemo(() => {
    const data = [];
    let cashBalance = carPrice; // money you have
    let loanBalance = loanAmount; // remaining loan principal
    let depositBalance = down; // deposit for loan scenario (start with down, rest is saved)
    const remainingCash = 0; // cash buyer has spent everything

    // For cash buyer: if they had the money in savings and withdrew it all
    // Opportunity cost: that money could have earned depositRate
    let cashOpportunityCost = 0;

    // For loan buyer: they pay monthly installments but keep loanAmount in deposit
    let loanSavingsBalance = loanAmount; // kept in bank
    let loanTotalInterestPaid = 0;
    let cashTotalOpportunityCost = 0;

    for (let m = 1; m <= loanMonths; m++) {
      // Loan scenario
      const depositInterest = loanSavingsBalance * (depositRate / 100 / 12);
      loanSavingsBalance += depositInterest;
      const installmentInterest = loanBalance * (loanRate / 100 / 12);
      const principal = monthlyPayment - installmentInterest;
      loanBalance = Math.max(0, loanBalance - principal);
      loanTotalInterestPaid += installmentInterest;

      // Cash scenario opportunity cost
      const monthlyOppCost = (carPrice - down) * (depositRate / 100 / 12);
      cashOpportunityCost += monthlyOppCost;
      cashTotalOpportunityCost += monthlyOppCost;

      if (m % 6 === 0 || m === 1) {
        const netGainFromLoan = loanSavingsBalance - loanAmount; // interest earned
        const costOfLoan = loanTotalInterestPaid;
        const netBenefit = netGainFromLoan - costOfLoan;

        data.push({
          month: m,
          label: `ด.${m}`,
          "ดอกเงินฝาก (ผ่อน)": Math.round(loanSavingsBalance - loanAmount),
          "ดอกเงินกู้ (จ่าย)": Math.round(loanTotalInterestPaid),
          "ส่วนต่างสุทธิ": Math.round(netBenefit),
          "ค่าเสียโอกาส (เงินสด)": Math.round(cashTotalOpportunityCost),
        });
      }
    }
    return data;
  }, [carPrice, downPct, loanRate, loanMonths, depositRate, loanAmount, down, monthlyPayment]);

  // Final net benefit
  const finalData = chartData[chartData.length - 1];
  const netBenefit = finalData ? finalData["ส่วนต่างสุทธิ"] : 0;
  const isBetterToLoan = netBenefit > 0;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 20 }}>
        {/* Inputs */}
        <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
          <div className="card">
            <SectionTitle>💳 ข้อมูลรถ & สินเชื่อ</SectionTitle>
            <div style={{ display: "grid", gap: 10 }}>
              <div><Label>ราคารถ (บาท)</Label><NumInput value={carPrice} onChange={setCarPrice} step={10000} suffix="฿" /></div>
              <div><Label>เงินดาวน์ (%)</Label><NumInput value={downPct} onChange={setDownPct} step={5} suffix="%" /></div>
              <div><Label>ดอกเบี้ยเงินกู้ (%/ปี flat rate)</Label><NumInput value={loanRate} onChange={setLoanRate} step={0.1} suffix="%" /></div>
              <div><Label>จำนวนงวด (เดือน)</Label><NumInput value={loanMonths} onChange={setLoanMonths} step={12} suffix="งวด" /></div>
            </div>
          </div>

          <div className="card">
            <SectionTitle>🏦 ดอกเบี้ยเงินฝาก</SectionTitle>
            <div><Label>ดอกเบี้ยเงินฝาก (%/ปี)</Label><NumInput value={depositRate} onChange={setDepositRate} step={0.25} suffix="%" /></div>
            <div style={{ marginTop: 10, fontSize: 12, color: "var(--text3)" }}>
              ใช้เปรียบเทียบว่าถ้านำเงินที่ไม่ต้องผ่อนไปฝากธนาคาร จะได้ดอกเบี้ยเพียงพอชดเชยดอกสินเชื่อหรือไม่
            </div>
          </div>

          <div className="card">
            <SectionTitle>🔢 สรุปตัวเลขสินเชื่อ</SectionTitle>
            <div style={{ display: "grid", gap: 8 }}>
              {[
                { l: "เงินดาวน์", v: `${fmt(down)} ฿`, c: "var(--text)" },
                { l: "ยอดสินเชื่อ", v: `${fmt(loanAmount)} ฿`, c: "var(--text)" },
                { l: "ค่างวด/เดือน", v: `${fmt(monthlyPayment)} ฿`, c: "var(--accent)" },
                { l: "ดอกเบี้ยรวม", v: `${fmt(totalInterestPaid)} ฿`, c: "var(--red)" },
                { l: "ยอดชำระรวม", v: `${fmt(monthlyPayment * loanMonths + down)} ฿`, c: "var(--text)" },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: i < 4 ? "1px solid var(--border)" : "none" }}>
                  <span style={{ color: "var(--text2)" }}>{r.l}</span>
                  <span className="mono" style={{ color: r.c, fontWeight: i === 2 ? 700 : 400 }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Result */}
        <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
          {/* Big result */}
          <div className="card" style={{ borderColor: isBetterToLoan ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)" }}>
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <div style={{ fontSize: 14, color: "var(--text2)", marginBottom: 8 }}>ผลสรุปหลังครบกำหนด {loanMonths} งวด</div>
              <div style={{ fontSize: 40, marginBottom: 4 }}>{isBetterToLoan ? "✅" : "❌"}</div>
              <div style={{
                fontSize: 22, fontWeight: 700,
                color: isBetterToLoan ? "var(--green)" : "var(--red)"
              }}>
                {isBetterToLoan ? "ผ่อนดีกว่า" : "จ่ายเงินสดดีกว่า"}
              </div>
              <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 6 }}>
                {isBetterToLoan
                  ? `ได้ดอกเงินฝากเกินกว่าดอกสินเชื่อ ${fmt(Math.abs(netBenefit))} บาท`
                  : `เสียดอกสินเชื่อเกินกว่าดอกเงินฝาก ${fmt(Math.abs(netBenefit))} บาท`
                }
              </div>
            </div>
          </div>

          <div className="card">
            <SectionTitle>📈 สะสมดอกเบี้ยตลอดระยะผ่อน</SectionTitle>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <XAxis dataKey="label" tick={{ fill: "var(--text3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--text3)", fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: unknown) => [`${fmt(Number(v))} บาท`]}
                />
                <ReferenceLine y={0} stroke="var(--border2)" />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="ดอกเงินฝาก (ผ่อน)" stroke="var(--green)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="ดอกเงินกู้ (จ่าย)" stroke="var(--red)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="ส่วนต่างสุทธิ" stroke="var(--accent)" strokeWidth={2.5} dot={false} strokeDasharray="0" />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 12 }}>
              {finalData && [
                { l: "ดอกฝากสะสม", v: finalData["ดอกเงินฝาก (ผ่อน)"], c: "var(--green)" },
                { l: "ดอกกู้สะสม", v: finalData["ดอกเงินกู้ (จ่าย)"], c: "var(--red)" },
                { l: "ส่วนต่างสุทธิ", v: finalData["ส่วนต่างสุทธิ"], c: "var(--accent)" },
              ].map((r, i) => (
                <div key={i} style={{ background: "var(--surface2)", borderRadius: 8, padding: 10, border: "1px solid var(--border)", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 4 }}>{r.l}</div>
                  <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: r.c }}>{fmt(r.v)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <SectionTitle>📚 หลักการวิเคราะห์</SectionTitle>
            <div style={{ display: "grid", gap: 10 }}>
              {[
                { title: "ทำไมถึงผ่อนได้บางครั้ง?", desc: "ถ้าดอกเบี้ยเงินฝาก > ดอกเบี้ยเงินกู้ การเอาเงินฝากไว้ทำดอกแล้วค่อยผ่อนรถอาจได้กำไรมากกว่า" },
                { title: "Flat rate vs EIR", desc: "ดอกเบี้ยรถยนต์คิดแบบ flat rate ตลอดต้น อัตราดอกเบี้ยที่แท้จริง (EIR) สูงกว่าประมาณ 1.8–2x เช่น flat 1.98% ≈ EIR ~3.8%" },
                { title: "ควรฝากที่ไหน?", desc: "บัญชีออมทรัพย์ดอกสูง เช่น CIMB, KBank, หรือ กองทุนตลาดเงิน มักให้ดอก 1.5–5% ขึ้นอยู่กับนโยบาย" },
              ].map((r, i) => (
                <div key={i} style={{ background: "var(--surface2)", borderRadius: 8, padding: 12, border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6 }}>{r.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <TipBox>
        <strong>คำเตือน:</strong> การวิเคราะห์นี้ดูแค่มุมดอกเบี้ยเท่านั้น · ในความเป็นจริงควรพิจารณาสภาพคล่อง (cash flow) ด้วย 
        · ถ้าเงินสดน้อยอยู่แล้ว ไม่ควรนำไปจ่ายรถทั้งหมด เผื่อฉุกเฉิน · 
        ดอกเงินฝากในไทยอาจลดลงได้ตามนโยบาย กนง.
      </TipBox>
    </div>
  );
}
