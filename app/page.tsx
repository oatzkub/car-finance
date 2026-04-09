"use client";
import { useState } from "react";
import CostCalculator from "@/components/CostCalculator";
import CompareCalculator from "@/components/CompareCalculator";
import CashVsLoan from "@/components/CashVsLoan";
import InstallmentTable from "@/components/InstallmentTable";

const tabs = [
  { id: "cost", label: "💰 ค่าใช้จ่ายรถ" },
  { id: "compare", label: "⚖️ เปรียบเทียบรถ" },
  { id: "cashvsloan", label: "🏦 เงินสด vs ผ่อน" },
  { id: "installment", label: "📋 ลองผ่อน" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("cost");

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ paddingTop: 20, paddingBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 22 }}>🚗</span>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)" }}>Car Finance Calculator</h1>
            </div>
            <p style={{ fontSize: 13, color: "var(--text2)" }}>วางแผนการซื้อรถอย่างชาญฉลาด · คำนวณค่าใช้จ่ายจริง · เปรียบเทียบตัวเลือก</p>
          </div>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, overflowX: "auto" }}>
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: "10px 18px",
                  fontSize: 13,
                  fontFamily: "inherit",
                  fontWeight: activeTab === t.id ? 600 : 400,
                  color: activeTab === t.id ? "var(--accent)" : "var(--text2)",
                  background: "none",
                  border: "none",
                  borderBottom: activeTab === t.id ? "2px solid var(--accent)" : "2px solid transparent",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>
        {activeTab === "cost" && <CostCalculator />}
        {activeTab === "compare" && <CompareCalculator />}
        {activeTab === "cashvsloan" && <CashVsLoan />}
        {activeTab === "installment" && <InstallmentTable />}
      </div>

      <div style={{ textAlign: "center", padding: "20px", color: "var(--text3)", fontSize: 12 }}>
        ตัวเลขที่คำนวณเป็นค่าประมาณ · ควรตรวจสอบกับผู้ให้บริการสินเชื่อจริง
      </div>
    </div>
  );
}
