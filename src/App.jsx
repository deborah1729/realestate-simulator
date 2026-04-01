
import { useState, useMemo } from "react";

const fmtM = (n) => n.toLocaleString() + "万";
const pct = (n) => n.toFixed(2) + "%";

function Slider({ label, value, onChange, min, max, step = 1, unit = "", color = "#7c3aed" }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color }}>{typeof value === "number" && value % 1 !== 0 ? value.toFixed(1) : value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} style={{ width: "100%", accentColor: color, height: 5 }} />
    </div>
  );
}

function MetricCard({ label, value, sub, color, big }) {
  return (
    <div style={{ flex: 1, minWidth: 80, padding: big ? 10 : 7, background: `${color}10`, borderRadius: 8, border: `1.5px solid ${color}30`, textAlign: "center" }}>
      <div style={{ fontSize: 9, fontWeight: 600, color: `${color}cc`, marginBottom: 1 }}>{label}</div>
      <div style={{ fontSize: big ? 18 : 14, fontWeight: 800, color }}>{value}</div>
      {sub && <div style={{ fontSize: 8, color: "#888", marginTop: 1 }}>{sub}</div>}
    </div>
  );
}

function SankeyDiagram({ data }) {
  const { income, vacancyLoss, effectiveIncome, loanPayment, manageFee, repairFund, tax, insurance, otherExp, netCF } = data;
  const opex = manageFee + repairFund + tax + insurance + otherExp;
  const noi = effectiveIncome - opex;

  const W = 720, PAD = 20;
  const nodeW = 120, gapX = 50;
  const cols = [PAD, PAD + nodeW + gapX, PAD + (nodeW + gapX) * 2, PAD + (nodeW + gapX) * 3];
  const totalH = 320;
  const gapY = 6;
  const ref = income || 1;
  const s = (v) => Math.max((Math.abs(v) / ref) * (totalH - gapY * 3), 16);

  const c0h = s(income);
  const c0y = PAD;

  const vH = s(vacancyLoss);
  const eH = s(effectiveIncome);
  const c1vy = c0y;
  const c1ey = c1vy + vH + gapY;

  const oxH = s(opex);
  const noiH = s(Math.max(noi, 0));
  const c2oxy = c1ey;
  const c2noiy = c2oxy + oxH + gapY;

  const lnH = s(loanPayment);
  const cfAbs = Math.abs(netCF);
  const cfH = Math.max(s(cfAbs), 20);
  const c3lny = c2noiy;
  const c3cfy = c3lny + lnH + gapY;

  const svgH = Math.max(c0y + c0h, c1ey + eH, c2noiy + noiH, c3cfy + cfH) + PAD + 10;

  const flow = (sx, sy, sh, fromH, dx, dy, dh) => {
    const x1 = sx + nodeW, x2 = dx;
    const y1 = sy, y2 = dy;
    const mx = (x1 + x2) / 2;
    return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2} L${x2},${y2 + dh} C${mx},${y2 + dh} ${mx},${y1 + sh} ${x1},${y1 + sh} Z`;
  };

  const nodes = [
    { x: cols[0], y: c0y, h: c0h, label: "満室賃料", val: income, bg: "#3b82f6" },
    { x: cols[1], y: c1vy, h: vH, label: "空室ロス", val: vacancyLoss, bg: "#ef4444" },
    { x: cols[1], y: c1ey, h: eH, label: "有効収入", val: effectiveIncome, bg: "#10b981" },
    { x: cols[2], y: c2oxy, h: oxH, label: "運営経費", val: opex, bg: "#f59e0b" },
    { x: cols[2], y: c2noiy, h: noiH, label: "営業純利益(NOI)", val: Math.max(noi, 0), bg: "#059669" },
    { x: cols[3], y: c3lny, h: lnH, label: "ローン返済", val: loanPayment, bg: "#d97706" },
    { x: cols[3], y: c3cfy, h: cfH, label: "手残り(CF)", val: netCF, bg: netCF >= 0 ? "#047857" : "#dc2626" },
  ];

  const vacSrc = { y: c0y, h: vH };
  const effSrc = { y: c0y + vH, h: c0h - vH };
  const opxSrc = { y: c1ey, h: Math.min(oxH, eH) };
  const noiSrc = { y: c1ey + Math.min(oxH, eH), h: eH - Math.min(oxH, eH) };
  const lnSrc = { y: c2noiy, h: Math.min(lnH, noiH) };
  const cfSrc = { y: c2noiy + Math.min(lnH, noiH), h: Math.max(noiH - Math.min(lnH, noiH), 2) };

  const flows = [
    { sx: cols[0], sy: vacSrc.y, sh: vacSrc.h, dx: cols[1], dy: c1vy, dh: vH, color: "rgba(239,68,68,0.18)" },
    { sx: cols[0], sy: effSrc.y, sh: effSrc.h, dx: cols[1], dy: c1ey, dh: eH, color: "rgba(16,185,129,0.18)" },
    { sx: cols[1], sy: opxSrc.y, sh: opxSrc.h, dx: cols[2], dy: c2oxy, dh: oxH, color: "rgba(245,158,11,0.18)" },
    { sx: cols[1], sy: noiSrc.y, sh: noiSrc.h, dx: cols[2], dy: c2noiy, dh: noiH, color: "rgba(5,150,105,0.18)" },
    { sx: cols[2], sy: lnSrc.y, sh: lnSrc.h, dx: cols[3], dy: c3lny, dh: lnH, color: "rgba(217,119,6,0.18)" },
    { sx: cols[2], sy: cfSrc.y, sh: cfSrc.h, dx: cols[3], dy: c3cfy, dh: cfH, color: netCF >= 0 ? "rgba(4,120,87,0.2)" : "rgba(220,38,38,0.18)" },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${svgH}`} style={{ width: "100%", height: "auto", fontFamily: "-apple-system, sans-serif", display: "block" }}>
      {flows.map((f, i) => (
        <path key={i} d={flow(f.sx, f.sy, f.sh, 0, f.dx, f.dy, f.dh)} fill={f.color} />
      ))}
      {nodes.filter(n => n.val !== 0 || n.label === "手残り(CF)").map((n, i) => {
        const showTwoLine = n.h >= 34;
        return (
          <g key={i}>
            <rect x={n.x} y={n.y} width={nodeW} height={n.h} rx={5} fill={n.bg} />
            {showTwoLine ? (
              <>
                <text x={n.x + nodeW / 2} y={n.y + n.h / 2 - 8} textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700} fill="#fff">{n.label}</text>
                <text x={n.x + nodeW / 2} y={n.y + n.h / 2 + 10} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={800} fill="#fff">{n.val < 0 ? "▲" : ""}{fmtM(Math.abs(n.val))}</text>
              </>
            ) : (
              <text x={n.x + nodeW / 2} y={n.y + n.h / 2} textAnchor="middle" dominantBaseline="central" fontSize={9} fontWeight={700} fill="#fff">{n.label} {fmtM(Math.abs(n.val))}</text>
            )}
          </g>
        );
      })}
    </svg>
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
    const opex = mManage + mRepair + mTax + mInsurance + mOther;
    const noi = effectiveRent - opex;
    const netCF = noi - monthlyLoan;
    const totalExpMonthly = monthlyLoan + opex;
    const annualCF = netCF * 12;
    const netYield = price > 0 ? (annualCF / price) * 100 : 0;
    const ccr = equity > 0 ? (annualCF / equity) * 100 : 0;
    const dscr = monthlyLoan > 0 ? effectiveRent / monthlyLoan : Infinity;
    const bep = rent > 0 ? (totalExpMonthly / rent) * 100 : 0;
    const cfProjection = [];
    let cumCF = 0;
    for (let y = 1; y <= 10; y++) {
      const yRent = effectiveRent * 12 * Math.pow(0.995, y - 1);
      const yExp = totalExpMonthly * 12;
      const yCF = Math.round(yRent - yExp);
      cumCF += yCF;
      cfProjection.push({ year: y, cf: yCF, cum: cumCF });
    }
    return { annualRent, grossYield, vacancyLoss, effectiveRent, loanAmount, equity, monthlyLoan, mManage, mRepair, mTax, mInsurance, mOther, totalExpMonthly, opex, noi, netCF, annualCF, netYield, ccr, dscr, bep, cfProjection };
  }, [price, rent, vacancy, loanRatio, rate, years, manageFee, repairFund, taxRate, insurance, otherExp]);

  const sankeyData = { income: rent, vacancyLoss: calc.vacancyLoss, effectiveIncome: calc.effectiveRent, loanPayment: calc.monthlyLoan, manageFee: calc.mManage, repairFund: calc.mRepair, tax: calc.mTax, insurance: calc.mInsurance, otherExp: calc.mOther, netCF: calc.netCF };
  const maxCF = Math.max(...calc.cfProjection.map(d => Math.abs(d.cf)), 1);
  const maxCum = Math.max(...calc.cfProjection.map(d => Math.abs(d.cum)), 1);

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", maxWidth: 1200, margin: "0 auto", padding: "12px 20px", background: "#fafafa", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 22 }}>🏢</span>
        <div>
          <h1 style={{ fontSize: 17, fontWeight: 800, color: "#111", margin: 0 }}>不動産投資シミュレーター</h1>
          <p style={{ fontSize: 10, color: "#888", margin: 0 }}>スライダーを動かしてリアルタイムに収支を確認</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 5, marginTop: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <MetricCard label="表面利回り" value={pct(calc.grossYield)} color="#3b82f6" big />
        <MetricCard label="実質利回り" value={pct(calc.netYield)} color={calc.netYield >= 0 ? "#059669" : "#dc2626"} big />
        <MetricCard label="月間CF" value={`${calc.netCF >= 0 ? "+" : ""}${fmtM(calc.netCF)}`} color={calc.netCF >= 0 ? "#059669" : "#dc2626"} big />
        <MetricCard label="年間CF" value={fmtM(calc.annualCF)} color={calc.annualCF >= 0 ? "#059669" : "#dc2626"} />
        <MetricCard label="CCR" value={pct(calc.ccr)} sub="自己資金利回り" color="#7c3aed" />
        <MetricCard label="DSCR" value={calc.dscr === Infinity ? "∞" : calc.dscr.toFixed(2)} sub="返済余裕率" color={calc.dscr >= 1.2 ? "#059669" : "#dc2626"} />
        <MetricCard label="BEP" value={pct(calc.bep)} sub="損益分岐点" color={calc.bep <= 85 ? "#059669" : "#dc2626"} />
      </div>

      <div style={{ display: "flex", gap: 3, marginBottom: 10, background: "#e5e7eb", borderRadius: 8, padding: 3 }}>
        {[["sankey", "収支フロー"], ["chart", "10年推移"], ["detail", "詳細"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ flex: 1, padding: "6px 8px", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600, background: tab === k ? "#fff" : "transparent", color: tab === k ? "#111" : "#666", boxShadow: tab === k ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>{l}</button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: "0 0 220px", minWidth: 200 }}>
          <div style={{ background: "#fff", borderRadius: 10, padding: "8px 12px", border: "1px solid #e5e7eb", marginBottom: 6 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>物件</div>
            <Slider label="物件価格" value={price} onChange={setPrice} min={1000} max={100000} step={500} unit="万" color="#3b82f6" />
            <Slider label="月額家賃収入" value={rent} onChange={setRent} min={5} max={500} step={1} unit="万" color="#10b981" />
            <Slider label="空室率" value={vacancy} onChange={setVacancy} min={0} max={30} step={1} unit="%" color="#ef4444" />
          </div>
          <div style={{ background: "#fff", borderRadius: 10, padding: "8px 12px", border: "1px solid #e5e7eb", marginBottom: 6 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#3b82f6", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>融資</div>
            <Slider label="融資比率(LTV)" value={loanRatio} onChange={setLoanRatio} min={0} max={100} step={5} unit="%" color="#3b82f6" />
            <Slider label="金利" value={rate} onChange={setRate} min={0} max={5} step={0.1} unit="%" color="#f59e0b" />
            <Slider label="返済期間" value={years} onChange={setYears} min={1} max={35} step={1} unit="年" color="#8b5cf6" />
          </div>
          <div style={{ background: "#fff", borderRadius: 10, padding: "8px 12px", border: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#059669", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>経費率</div>
            <Slider label="管理費" value={manageFee} onChange={setManageFee} min={0} max={15} step={0.5} unit="%" color="#f97316" />
            <Slider label="修繕積立金" value={repairFund} onChange={setRepairFund} min={0} max={10} step={0.5} unit="%" color="#fb923c" />
            <Slider label="固定資産税等" value={taxRate} onChange={setTaxRate} min={0} max={15} step={0.5} unit="%" color="#e11d48" />
            <Slider label="火災保険" value={insurance} onChange={setInsurance} min={0} max={5} step={0.5} unit="%" color="#be185d" />
            <Slider label="その他" value={otherExp} onChange={setOtherExp} min={0} max={10} step={0.5} unit="%" color="#a855f7" />
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 300 }}>
          {tab === "sankey" && (
            <div style={{ background: "#fff", borderRadius: 12, padding: 14, border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 6 }}>収支フロー構造</div>
              <SankeyDiagram data={sankeyData} />
              <div style={{ marginTop: 8, padding: 8, background: "#f9fafb", borderRadius: 8, fontSize: 10, color: "#555", lineHeight: 1.6 }}>
                <strong>融資:</strong> 借入 {fmtM(calc.loanAmount)} / 自己資金 {fmtM(calc.equity)} / 月額返済 {fmtM(calc.monthlyLoan)} ・ <strong>経費内訳:</strong> 管理費{fmtM(calc.mManage)} 修繕{fmtM(calc.mRepair)} 税{fmtM(calc.mTax)} 保険{fmtM(calc.mInsurance)} 他{fmtM(calc.mOther)}
              </div>
            </div>
          )}

          {tab === "chart" && (
            <div style={{ background: "#fff", borderRadius: 12, padding: 14, border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 10 }}>10年キャッシュフロー推移</div>
              <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: 10, color: "#059669" }}>■ 年間CF</span>
                <span style={{ fontSize: 10, color: "#3b82f6" }}>■ 累計CF</span>
              </div>
              {calc.cfProjection.map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <div style={{ width: 28, fontSize: 10, color: "#888", textAlign: "right" }}>{d.year}年</div>
                  <div style={{ flex: 1, position: "relative", height: 20 }}>
                    <div style={{ position: "absolute", top: 0, left: d.cf >= 0 ? "50%" : undefined, right: d.cf < 0 ? "50%" : undefined, width: `${(Math.abs(d.cf) / maxCF) * 50}%`, height: 9, background: d.cf >= 0 ? "#059669" : "#ef4444", borderRadius: 2, opacity: 0.7 }} />
                    <div style={{ position: "absolute", top: 11, left: d.cum >= 0 ? "50%" : undefined, right: d.cum < 0 ? "50%" : undefined, width: `${(Math.abs(d.cum) / maxCum) * 50}%`, height: 7, background: d.cum >= 0 ? "#3b82f6" : "#f59e0b", borderRadius: 2, opacity: 0.5 }} />
                    <div style={{ position: "absolute", top: 0, left: "50%", width: 1, height: 20, background: "#e5e7eb" }} />
                  </div>
                  <div style={{ width: 100, fontSize: 9, color: "#555", textAlign: "right" }}>
                    <span style={{ color: d.cf >= 0 ? "#059669" : "#ef4444" }}>{fmtM(d.cf)}</span>{" / "}
                    <span style={{ color: d.cum >= 0 ? "#3b82f6" : "#f59e0b", fontWeight: 600 }}>{fmtM(d.cum)}</span>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 8, padding: 8, background: "#f9fafb", borderRadius: 8, fontSize: 10, color: "#555" }}>※ 家賃は年0.5%下落を想定。経費・返済は固定。</div>
            </div>
          )}

          {tab === "detail" && (
            <div style={{ background: "#fff", borderRadius: 12, padding: 14, border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 10 }}>収支詳細（月額）</div>
              {[
                { label: "満室賃料", value: rent, color: "#3b82f6", bold: true },
                { label: "└ 空室損失", value: -calc.vacancyLoss, color: "#ef4444" },
                { label: "有効収入", value: calc.effectiveRent, color: "#10b981", bold: true, border: true },
                { label: "└ 管理費", value: -calc.mManage, color: "#f97316" },
                { label: "└ 修繕積立金", value: -calc.mRepair, color: "#fb923c" },
                { label: "└ 固定資産税等", value: -calc.mTax, color: "#e11d48" },
                { label: "└ 火災保険", value: -calc.mInsurance, color: "#be185d" },
                { label: "└ その他経費", value: -calc.mOther, color: "#a855f7" },
                { label: "NOI(営業純利益)", value: calc.noi, color: "#059669", bold: true, border: true },
                { label: "└ ローン返済", value: -calc.monthlyLoan, color: "#d97706" },
                { label: "手残りCF", value: calc.netCF, color: calc.netCF >= 0 ? "#059669" : "#dc2626", bold: true, border: true, big: true },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: row.big ? "8px 6px" : "4px 6px", borderTop: row.border ? "2px solid #e5e7eb" : "none", background: row.big ? (row.value >= 0 ? "#f0fdf4" : "#fef2f2") : "transparent", borderRadius: row.big ? 6 : 0, marginTop: row.big ? 4 : 0 }}>
                  <span style={{ fontSize: row.bold ? 11 : 10, fontWeight: row.bold ? 700 : 400, color: row.bold ? "#111" : "#666" }}>{row.label}</span>
                  <span style={{ fontSize: row.big ? 14 : 11, fontWeight: row.bold ? 800 : 600, color: row.color }}>{row.value > 0 ? "+" : ""}{fmtM(row.value)}</span>
                </div>
              ))}
              <div style={{ marginTop: 12, fontSize: 12, fontWeight: 700, color: "#111", marginBottom: 6 }}>投資指標</div>
              {[
                { label: "物件価格", value: fmtM(price) },
                { label: "借入額", value: `${fmtM(calc.loanAmount)}（LTV ${loanRatio}%）` },
                { label: "自己資金", value: fmtM(calc.equity) },
                { label: "月額返済", value: fmtM(calc.monthlyLoan) },
                { label: "表面利回り", value: pct(calc.grossYield) },
                { label: "実質利回り(NCF)", value: pct(calc.netYield) },
                { label: "CCR", value: pct(calc.ccr) },
                { label: "DSCR", value: calc.dscr === Infinity ? "∞" : calc.dscr.toFixed(2) + "x" },
                { label: "BEP", value: pct(calc.bep) },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 6px", borderBottom: "1px solid #f3f4f6" }}>
                  <span style={{ fontSize: 10, color: "#666" }}>{row.label}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#111" }}>{row.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}