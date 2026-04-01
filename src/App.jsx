
import { useState, useMemo } from "react";

const fmt = (n) => {
  if (Math.abs(n) >= 10000) return (n / 10000).toFixed(2) + "億";
  return n.toLocaleString();
};
const fmtM = (n) => n.toLocaleString() + "万";
const pct = (n) => n.toFixed(2) + "%";

function Slider({ label, value, onChange, min, max, step = 1, unit = "", color = "#7c3aed" }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color }}>{typeof value === "number" && value % 1 !== 0 ? value.toFixed(1) : value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: color, height: 6 }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#9ca3af" }}>
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

function SankeyFlow({ data }) {
  const { income, vacancyLoss, effectiveIncome, loanPayment, manageFee, repairFund, tax, insurance, otherExp, netCF } = data;
  const maxVal = income;
  const scale = (v) => Math.max((v / maxVal) * 160, 3);

  const nodes = [
    { id: "income", label: "総潜在収入", value: income, x: 30, y: 20, color: "#3b82f6" },
    { id: "vacancy", label: "空室損失", value: vacancyLoss, x: 250, y: 10, color: "#ef4444" },
    { id: "effective", label: "有効総収入", value: effectiveIncome, x: 250, y: 120, color: "#10b981" },
    { id: "loan", label: "ローン返済", value: loanPayment, x: 480, y: 0, color: "#f59e0b" },
    { id: "manage", label: "管理費", value: manageFee, x: 480, y: 65, color: "#f97316" },
    { id: "repair", label: "修繕積立金", value: repairFund, x: 480, y: 120, color: "#fb923c" },
    { id: "tax", label: "固定資産税", value: tax, x: 480, y: 175, color: "#e11d48" },
    { id: "insurance", label: "火災保険", value: insurance, x: 480, y: 225, color: "#be185d" },
    { id: "other", label: "その他経費", value: otherExp, x: 480, y: 270, color: "#a855f7" },
    { id: "cf", label: "手残り(CF)", value: netCF, x: 480, y: 340, color: netCF >= 0 ? "#059669" : "#dc2626" },
  ];

  const links = [
    { from: "income", to: "vacancy", value: vacancyLoss, color: "rgba(239,68,68,0.25)" },
    { from: "income", to: "effective", value: effectiveIncome, color: "rgba(16,185,129,0.25)" },
    { from: "effective", to: "loan", value: loanPayment, color: "rgba(245,158,11,0.2)" },
    { from: "effective", to: "manage", value: manageFee, color: "rgba(249,115,22,0.2)" },
    { from: "effective", to: "repair", value: repairFund, color: "rgba(251,146,60,0.2)" },
    { from: "effective", to: "tax", value: tax, color: "rgba(225,29,72,0.2)" },
    { from: "effective", to: "insurance", value: insurance, color: "rgba(190,24,93,0.2)" },
    { from: "effective", to: "other", value: otherExp, color: "rgba(168,85,247,0.2)" },
    { from: "effective", to: "cf", value: Math.max(netCF, 0), color: "rgba(5,150,105,0.25)" },
  ];

  const getNode = (id) => nodes.find(n => n.id === id);
  let srcOffsets = {};
  let dstOffsets = {};

  return (
    <svg viewBox="0 0 700 420" style={{ width: "100%", height: "auto", fontFamily: "-apple-system, sans-serif" }}>
      {links.filter(l => l.value > 0).map((link, i) => {
        const src = getNode(link.from);
        const dst = getNode(link.to);
        const thickness = scale(link.value);
        const srcOff = srcOffsets[link.from] || 0;
        const dstOff = dstOffsets[link.to] || 0;
        srcOffsets[link.from] = srcOff + thickness;
        dstOffsets[link.to] = dstOff + thickness;
        const x1 = src.x + 120;
        const y1 = src.y + 12 + srcOff + thickness / 2;
        const x2 = dst.x;
        const y2 = dst.y + 12 + dstOff + thickness / 2;
        const mx = (x1 + x2) / 2;
        return (
          <path key={i} d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`}
            fill="none" stroke={link.color} strokeWidth={thickness} opacity={0.7} />
        );
      })}
      {nodes.filter(n => n.value !== 0 || n.id === "cf").map((node) => {
        const h = Math.max(scale(Math.abs(node.value)), 18);
        return (
          <g key={node.id}>
            <rect x={node.x} y={node.y} width={120} height={h + 24} rx={6}
              fill={node.color} opacity={0.12} stroke={node.color} strokeWidth={1.5} strokeOpacity={0.3} />
            <rect x={node.x} y={node.y} width={4} height={h + 24} rx={2} fill={node.color} />
            <text x={node.x + 12} y={node.y + 14} fontSize={10} fontWeight={700} fill={node.color}>{node.label}</text>
            <text x={node.x + 12} y={node.y + h + 16} fontSize={11} fontWeight={800} fill={node.color}>
              {node.value < 0 ? "▲" : ""}{fmtM(Math.abs(node.value))}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function MetricCard({ label, value, sub, color, big }) {
  return (
    <div style={{ flex: 1, minWidth: 100, padding: big ? 14 : 10, background: `${color}10`, borderRadius: 10, border: `1.5px solid ${color}30`, textAlign: "center" }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: `${color}cc`, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: big ? 22 : 17, fontWeight: 800, color }}>{value}</div>
      {sub && <div style={{ fontSize: 9, color: "#888", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default function App() {
  const [price, setPrice] = useState(15000);
  const [rent, setRent] = useState(80);
  const [vacancy, setVacancy] = useState(5);
  const [loanRatio, setLoanRatio] = useState(90);
  const [rate, setRate] = useState(1.5);
  const [years, setYears] = useState(30);
  const [manageFee, setManageFee] = useState(3);
  const [repairFund, setRepairFund] = useState(2);
  const [taxRate, setTaxRate] = useState(5);
  const [insurance, setInsurance] = useState(1);
  const [otherExp, setOtherExp] = useState(2);
  const [tab, setTab] = useState("sankey");

  const calc = useMemo(() => {
    const annualRent = rent * 12;
    const grossYield = (annualRent / price) * 100;
    const vacancyLoss = Math.round(rent * (vacancy / 100));
    const effectiveRent = rent - vacancyLoss;
    const loanAmount = Math.round(price * (loanRatio / 100));
    const equity = price - loanAmount;
    const monthlyRate = rate / 100 / 12;
    const totalMonths = years * 12;
    const monthlyLoan = monthlyRate > 0
      ? Math.round(loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1))
      : Math.round(loanAmount / totalMonths);
    const mManage = Math.round(effectiveRent * (manageFee / 100));
    const mRepair = Math.round(effectiveRent * (repairFund / 100));
    const mTax = Math.round(effectiveRent * (taxRate / 100));
    const mInsurance = Math.round(effectiveRent * (insurance / 100));
    const mOther = Math.round(effectiveRent * (otherExp / 100));
    const totalExpMonthly = monthlyLoan + mManage + mRepair + mTax + mInsurance + mOther;
    const netCF = effectiveRent - totalExpMonthly;
    const annualCF = netCF * 12;
    const netYield = price > 0 ? (annualCF / price) * 100 : 0;
    const ccr = equity > 0 ? (annualCF / equity) * 100 : 0;
    const dscr = monthlyLoan > 0 ? effectiveRent / monthlyLoan : Infinity;
    const bep = ((monthlyLoan + mManage + mRepair + mTax + mInsurance + mOther) / rent) * 100;
    const cfProjection = [];
    let cumCF = 0;
    for (let y = 1; y <= 10; y++) {
      const yRent = effectiveRent * 12 * Math.pow(0.995, y - 1);
      const yExp = totalExpMonthly * 12;
      const yCF = Math.round(yRent - yExp);
      cumCF += yCF;
      cfProjection.push({ year: y, cf: yCF, cum: cumCF });
    }
    return { annualRent, grossYield, vacancyLoss, effectiveRent, loanAmount, equity, monthlyLoan, mManage, mRepair, mTax, mInsurance, mOther, totalExpMonthly, netCF, annualCF, netYield, ccr, dscr, bep, cfProjection };
  }, [price, rent, vacancy, loanRatio, rate, years, manageFee, repairFund, taxRate, insurance, otherExp]);

  const sankeyData = { income: rent, vacancyLoss: calc.vacancyLoss, effectiveIncome: calc.effectiveRent, loanPayment: calc.monthlyLoan, manageFee: calc.mManage, repairFund: calc.mRepair, tax: calc.mTax, insurance: calc.mInsurance, otherExp: calc.mOther, netCF: calc.netCF };
  const maxCF = Math.max(...calc.cfProjection.map(d => Math.abs(d.cf)), 1);
  const maxCum = Math.max(...calc.cfProjection.map(d => Math.abs(d.cum)), 1);

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", maxWidth: 780, margin: "0 auto", padding: 16, background: "#fafafa", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <span style={{ fontSize: 28 }}>🏢</span>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#111", margin: 0 }}>不動産投資シミュレーター</h1>
          <p style={{ fontSize: 11, color: "#888", margin: 0 }}>スライダーを動かしてリアルタイムに収支を確認</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <MetricCard label="表面利回り" value={pct(calc.grossYield)} color="#3b82f6" big />
        <MetricCard label="実質利回り" value={pct(calc.netYield)} color={calc.netYield >= 0 ? "#059669" : "#dc2626"} big />
        <MetricCard label="月間CF" value={`${calc.netCF >= 0 ? "+" : ""}${fmtM(calc.netCF)}`} color={calc.netCF >= 0 ? "#059669" : "#dc2626"} big />
        <MetricCard label="年間CF" value={`${fmtM(calc.annualCF)}`} color={calc.annualCF >= 0 ? "#059669" : "#dc2626"} />
        <MetricCard label="CCR" value={pct(calc.ccr)} sub="自己資金利回り" color="#7c3aed" />
        <MetricCard label="DSCR" value={calc.dscr === Infinity ? "∞" : calc.dscr.toFixed(2)} sub="返済余裕率" color={calc.dscr >= 1.2 ? "#059669" : "#dc2626"} />
        <MetricCard label="BEP" value={pct(calc.bep)} sub="損益分岐点" color={calc.bep <= 85 ? "#059669" : "#dc2626"} />
      </div>

      <div style={{ display: "flex", gap: 3, marginBottom: 12, background: "#e5e7eb", borderRadius: 8, padding: 3 }}>
        {[["sankey", "収支フロー"], ["chart", "10年推移"], ["detail", "詳細"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            flex: 1, padding: "7px 8px", border: "none", borderRadius: 6, cursor: "pointer",
            fontSize: 12, fontWeight: 600,
            background: tab === k ? "#fff" : "transparent",
            color: tab === k ? "#111" : "#666",
            boxShadow: tab === k ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
          }}>{l}</button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: "0 0 240px", minWidth: 220 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 14, border: "1px solid #e5e7eb", marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>物件</div>
            <Slider label="物件価格" value={price} onChange={setPrice} min={1000} max={100000} step={500} unit="万" color="#3b82f6" />
            <Slider label="月額家賃収入" value={rent} onChange={setRent} min={5} max={500} step={1} unit="万" color="#10b981" />
            <Slider label="空室率" value={vacancy} onChange={setVacancy} min={0} max={30} step={1} unit="%" color="#ef4444" />
          </div>
          <div style={{ background: "#fff", borderRadius: 12, padding: 14, border: "1px solid #e5e7eb", marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>融資</div>
            <Slider label="融資比率(LTV)" value={loanRatio} onChange={setLoanRatio} min={0} max={100} step={5} unit="%" color="#3b82f6" />
            <Slider label="金利" value={rate} onChange={setRate} min={0} max={5} step={0.1} unit="%" color="#f59e0b" />
            <Slider label="返済期間" value={years} onChange={setYears} min={1} max={35} step={1} unit="年" color="#8b5cf6" />
          </div>
          <div style={{ background: "#fff", borderRadius: 12, padding: 14, border: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#059669", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>経費率</div>
            <Slider label="管理費" value={manageFee} onChange={setManageFee} min={0} max={15} step={0.5} unit="%" color="#f97316" />
            <Slider label="修繕積立金" value={repairFund} onChange={setRepairFund} min={0} max={10} step={0.5} unit="%" color="#fb923c" />
            <Slider label="固定資産税等" value={taxRate} onChange={setTaxRate} min={0} max={15} step={0.5} unit="%" color="#e11d48" />
            <Slider label="火災保険" value={insurance} onChange={setInsurance} min={0} max={5} step={0.5} unit="%" color="#be185d" />
            <Slider label="その他" value={otherExp} onChange={setOtherExp} min={0} max={10} step={0.5} unit="%" color="#a855f7" />
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 300 }}>
          {tab === "sankey" && (
            <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 8 }}>月間収支フロー（サンキー図）</div>
              <SankeyFlow data={sankeyData} />
              <div style={{ marginTop: 12, padding: 10, background: "#f9fafb", borderRadius: 8, fontSize: 11, color: "#555", lineHeight: 1.7 }}>
                <strong>融資情報:</strong> 借入 {fmtM(calc.loanAmount)} / 自己資金 {fmtM(calc.equity)} / 月額返済 {fmtM(calc.monthlyLoan)}
              </div>
            </div>
          )}

          {tab === "chart" && (
            <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 12 }}>10年キャッシュフロー推移</div>
              <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: 10, color: "#059669" }}>■ 年間CF</span>
                <span style={{ fontSize: 10, color: "#3b82f6" }}>■ 累計CF</span>
              </div>
              {calc.cfProjection.map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 30, fontSize: 10, color: "#888", textAlign: "right" }}>{d.year}年</div>
                  <div style={{ flex: 1, position: "relative", height: 22 }}>
                    <div style={{ position: "absolute", top: 0, left: d.cf >= 0 ? "50%" : undefined, right: d.cf < 0 ? "50%" : undefined, width: `${(Math.abs(d.cf) / maxCF) * 50}%`, height: 10, background: d.cf >= 0 ? "#059669" : "#ef4444", borderRadius: 3, opacity: 0.7 }} />
                    <div style={{ position: "absolute", top: 12, left: d.cum >= 0 ? "50%" : undefined, right: d.cum < 0 ? "50%" : undefined, width: `${(Math.abs(d.cum) / maxCum) * 50}%`, height: 8, background: d.cum >= 0 ? "#3b82f6" : "#f59e0b", borderRadius: 3, opacity: 0.5 }} />
                    <div style={{ position: "absolute", top: 0, left: "50%", width: 1, height: 22, background: "#e5e7eb" }} />
                  </div>
                  <div style={{ width: 100, fontSize: 9, color: "#555", textAlign: "right" }}>
                    <span style={{ color: d.cf >= 0 ? "#059669" : "#ef4444" }}>{fmtM(d.cf)}</span>
                    {" / "}
                    <span style={{ color: d.cum >= 0 ? "#3b82f6" : "#f59e0b", fontWeight: 600 }}>{fmtM(d.cum)}</span>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 12, padding: 10, background: "#f9fafb", borderRadius: 8, fontSize: 11, color: "#555" }}>
                ※ 家賃は年0.5%下落を想定。経費・返済は固定。
              </div>
            </div>
          )}

          {tab === "detail" && (
            <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 12 }}>収支詳細（月額）</div>
              {[
                { label: "総潜在収入", value: rent, color: "#3b82f6", bold: true },
                { label: "└ 空室損失", value: -calc.vacancyLoss, color: "#ef4444" },
                { label: "有効総収入", value: calc.effectiveRent, color: "#10b981", bold: true, border: true },
                { label: "└ ローン返済", value: -calc.monthlyLoan, color: "#f59e0b" },
                { label: "└ 管理費", value: -calc.mManage, color: "#f97316" },
                { label: "└ 修繕積立金", value: -calc.mRepair, color: "#fb923c" },
                { label: "└ 固定資産税等", value: -calc.mTax, color: "#e11d48" },
                { label: "└ 火災保険", value: -calc.mInsurance, color: "#be185d" },
                { label: "└ その他経費", value: -calc.mOther, color: "#a855f7" },
                { label: "経費合計", value: -calc.totalExpMonthly, color: "#dc2626", bold: true, border: true },
                { label: "手残りCF", value: calc.netCF, color: calc.netCF >= 0 ? "#059669" : "#dc2626", bold: true, border: true, big: true },
              ].map((row, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: row.big ? "10px 8px" : "5px 8px",
                  borderTop: row.border ? "2px solid #e5e7eb" : "none",
                  background: row.big ? (row.value >= 0 ? "#f0fdf4" : "#fef2f2") : "transparent",
                  borderRadius: row.big ? 8 : 0, marginTop: row.big ? 4 : 0,
                }}>
                  <span style={{ fontSize: row.bold ? 12 : 11, fontWeight: row.bold ? 700 : 400, color: row.bold ? "#111" : "#666" }}>{row.label}</span>
                  <span style={{ fontSize: row.big ? 16 : 12, fontWeight: row.bold ? 800 : 600, color: row.color }}>
                    {row.value > 0 ? "+" : ""}{fmtM(row.value)}
                  </span>
                </div>
              ))}

              <div style={{ marginTop: 16, fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 8 }}>投資指標</div>
              {[
                { label: "物件価格", value: `${fmtM(price)}（${fmt(price)}円）` },
                { label: "借入額", value: `${fmtM(calc.loanAmount)}（LTV ${loanRatio}%）` },
                { label: "自己資金", value: fmtM(calc.equity) },
                { label: "月額返済", value: fmtM(calc.monthlyLoan) },
                { label: "年間家賃", value: fmtM(calc.annualRent) },
                { label: "表面利回り", value: pct(calc.grossYield) },
                { label: "実質利回り(NCF)", value: pct(calc.netYield) },
                { label: "CCR(自己資金利回り)", value: pct(calc.ccr) },
                { label: "DSCR(返済余裕率)", value: calc.dscr === Infinity ? "∞" : calc.dscr.toFixed(2) + "x" },
                { label: "BEP(損益分岐点)", value: pct(calc.bep) },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: "1px solid #f3f4f6" }}>
                  <span style={{ fontSize: 11, color: "#666" }}>{row.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#111" }}>{row.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}