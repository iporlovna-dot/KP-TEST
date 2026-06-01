import { useState } from "react";
import Warehouse from "./Warehouse";
import Delivery from "./Delivery";
import Tasks from "./Tasks";
import DeliveryCalc from "./DeliveryCalc";
import Dashboard from "./Dashboard";

const ORGS = [
  { id: 0, label: "Организация 1", accent: "#1a5fa8", font: "'Georgia', serif", priceMultiplier: 1.0 },
  { id: 1, label: "Организация 2", accent: "#2e7d32", font: "'Trebuchet MS', sans-serif", priceMultiplier: 1.04 },
  { id: 2, label: "Организация 3", accent: "#6a1b9a", font: "'Palatino Linotype', serif", priceMultiplier: 1.06 },
];

const defaultOrgs = [
  { name: "", inn: "", address: "", phone: "", email: "", director: "" },
  { name: "", inn: "", address: "", phone: "", email: "", director: "" },
  { name: "", inn: "", address: "", phone: "", email: "", director: "" },
];

const defaultItems = [{ desc: "", qty: 1, unit: "шт.", price: "" }];

function formatNum(n) {
  return Number(n).toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function genKP(orgData, org, items, client, description, deadline, kpDate, ndsMode) {
  const accent = org.accent;
  const font = org.font;
  const mult = org.priceMultiplier;

  const rows = items.map((it) => {
    const p = parseFloat(it.price) || 0;
    const q = parseFloat(it.qty) || 0;
    const unitPrice = p * mult;
    const total = unitPrice * q;
    return { ...it, unitPrice, total };
  });

  const grandTotal = rows.reduce((s, r) => s + r.total, 0);
  const nds = ndsMode === "with" ? grandTotal * 0.05 : 0;
  const withNds = grandTotal + nds;

  const totalsBlock = ndsMode === "with"
    ? `<div class="totals">Итого без НДС: <b>${formatNum(grandTotal)} руб.</b></div>
       <div class="totals">НДС 5%: <b>${formatNum(nds)} руб.</b></div>
       <div class="totals grand">ИТОГО с НДС: ${formatNum(withNds)} руб.</div>`
    : `<div class="totals grand">ИТОГО (без НДС): ${formatNum(grandTotal)} руб.</div>`;

  const tableRows = rows.map((r, i) => `
    <tr style="background:${i % 2 === 0 ? "#f9f9f9" : "#fff"}">
      <td style="padding:6px 10px;border:1px solid #ddd;text-align:center">${i + 1}</td>
      <td style="padding:6px 10px;border:1px solid #ddd">${r.desc}</td>
      <td style="padding:6px 10px;border:1px solid #ddd;text-align:center">${r.qty}</td>
      <td style="padding:6px 10px;border:1px solid #ddd;text-align:center">${r.unit}</td>
      <td style="padding:6px 10px;border:1px solid #ddd;text-align:right">${formatNum(r.unitPrice)}</td>
      <td style="padding:6px 10px;border:1px solid #ddd;text-align:right">${formatNum(r.total)}</td>
    </tr>`).join("");

  return `<!DOCTYPE html>
<html lang="ru">
<head><meta charset="UTF-8">
<title>КП — ${orgData.name}</title>
<style>
  body { font-family: ${font}; font-size: 13px; color: #222; margin: 0; padding: 0; }
  @media print { .no-print { display: none; } }
  .page { max-width: 800px; margin: 0 auto; padding: 32px 40px; }
  .header-bar { border-bottom: 3px solid ${accent}; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
  .org-name { font-size: 15px; font-weight: bold; color: ${accent}; margin-bottom: 4px; }
  .kp-title { text-align: center; font-size: 17px; font-weight: bold; color: ${accent}; margin: 18px 0 10px; }
  .meta { font-size: 12px; color: #555; margin-bottom: 14px; }
  .desc-block { margin-bottom: 16px; line-height: 1.6; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 8px; }
  th { background: ${accent}; color: #fff; padding: 7px 10px; text-align: left; border: 1px solid ${accent}; }
  .totals { text-align: right; font-size: 13px; margin: 6px 0; }
  .totals b { color: ${accent}; }
  .grand { font-size: 15px; font-weight: bold; color: ${accent}; text-align: right; margin: 6px 0; }
  .footer { margin-top: 30px; font-size: 12px; color: #555; border-top: 1px solid #ddd; padding-top: 14px; display: flex; justify-content: space-between; }
  .sign { margin-top: 40px; font-size: 12px; }
</style>
</head>
<body>
<div class="page">
  <div class="header-bar">
    <div>
      <div class="org-name">${orgData.name}</div>
      <div style="font-size:12px;color:#444">ИНН: ${orgData.inn}</div>
      <div style="font-size:12px;color:#444">${orgData.address}</div>
      <div style="font-size:12px;color:#444">${orgData.phone} | ${orgData.email}</div>
    </div>
    <div style="text-align:right;font-size:12px;color:#555">
      <div>Дата: ${kpDate}</div>
      <div>№ КП: ${Math.floor(Math.random()*900)+100}/${new Date().getFullYear()}</div>
    </div>
  </div>
  <div class="kp-title">КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ</div>
  <div class="meta">
    <b>Заказчик:</b> ${client || "—"}<br>
    <b>Срок выполнения:</b> ${deadline || "—"}
  </div>
  <div class="desc-block"><b>Описание работ / услуг:</b><br>${description || "—"}</div>
  <table>
    <thead>
      <tr>
        <th style="width:32px">№</th>
        <th>Наименование</th>
        <th style="width:50px">Кол-во</th>
        <th style="width:50px">Ед.</th>
        <th style="width:90px">Цена, руб.</th>
        <th style="width:100px">Сумма, руб.</th>
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>
  ${totalsBlock}
  <div style="margin-top:16px;font-size:12px;color:#555">
    Настоящее коммерческое предложение действительно в течение 30 дней с момента выдачи.
  </div>
  <div class="sign">
    <p><b>Директор:</b> ${orgData.director} / ___________________</p>
    <p style="color:#aaa">М.П.</p>
  </div>
  <div class="footer">
    <div>${orgData.name}</div>
    <div>${orgData.address}</div>
    <div>${orgData.phone}</div>
  </div>
</div>
</body></html>`;
}

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const getBadge = (v) => {
    try {
      if (v === "tasks") {
        const tasks = JSON.parse(localStorage.getItem("tasks_items") || "[]");
        const n = tasks.filter(t => !t.done && t.deadline && new Date(t.deadline) < new Date().setHours(0,0,0,0)).length;
        return n > 0 ? n : null;
      }
      if (v === "warehouse") {
        const w = JSON.parse(localStorage.getItem("warehouse_items") || "[]");
        const n = w.filter(i => i.qty === 0).length;
        return n > 0 ? n : null;
      }
    } catch {}
    return null;
  };
  const [step, setStep] = useState(0);
  const [orgs, setOrgs] = useState(defaultOrgs);
  const [client, setClient] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [kpDate, setKpDate] = useState(new Date().toLocaleDateString("ru-RU"));
  const [items, setItems] = useState(defaultItems);
  const [ndsModes, setNdsModes] = useState(["without", "without", "without"]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [activePreview, setActivePreview] = useState(0);
  const [htmls, setHtmls] = useState(["", "", ""]);

  const updateOrg = (i, field, val) => {
    const o = [...orgs]; o[i] = { ...o[i], [field]: val }; setOrgs(o);
  };
  const updateItem = (i, field, val) => {
    const it = [...items]; it[i] = { ...it[i], [field]: val }; setItems(it);
  };
  const addItem = () => setItems([...items, { desc: "", qty: 1, unit: "шт.", price: "" }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

  const generate = async () => {
    setLoading(true);
    setGenerated(false);
    let descs = [description, description, description];
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Перефразируй следующее описание работ/услуг тремя разными способами. Сохраняй смысл и все ключевые детали, только меняй формулировки и стиль. Верни ровно 3 варианта в формате JSON: {"v1":"...","v2":"...","v3":"..."}. Не добавляй ничего кроме JSON. Оригинал: "${description}"`
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      descs = [parsed.v1 || description, parsed.v2 || description, parsed.v3 || description];
    } catch {
      descs = [description, description, description];
    }
    const newHtmls = ORGS.map((org, i) =>
      genKP(orgs[i], org, items, client, descs[i], deadline, kpDate, ndsModes[i])
    );
    setHtmls(newHtmls);
    setLoading(false);
    setGenerated(true);
    setStep(2);
  };

  const downloadKP = (i) => {
    const blob = new Blob([htmls[i]], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `КП_${orgs[i].name || "Организация_" + (i + 1)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const inp = { width: "100%", boxSizing: "border-box", marginBottom: 8, padding: "6px 10px", border: "1px solid #ccc", borderRadius: 4, fontSize: 13 };
  const lbl = { display: "block", fontSize: 12, color: "#666", marginBottom: 3 };
  const card = { background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, padding: "16px 20px", marginBottom: 16 };
  const btn = { padding: "8px 18px", borderRadius: 4, border: "1px solid #ccc", background: "#fff", cursor: "pointer", fontSize: 13 };

  return (
    <div style={{ background: "#f0f2f5", minHeight: "100vh", padding: "32px 16px" }}>
     <div style={{ maxWidth: 900, margin: "0 auto", fontFamily: "Arial, sans-serif", display: "flex", gap: 0 }}>

        {/* Навигация слева */}
        <div style={{ width: 180, minWidth: 180, marginRight: 24 }}>
          {[["dashboard", "🏠 Главная"], ["kp", "📄 Генератор КП"], ["warehouse", "📦 Склад"], ["delivery", "🚚 Доставки"], ["tasks", "📋 Задачи"], ["calc", "🚛 Калькулятор"]].map(([v, l]) => (
            <button key={v} onClick={() => setTab(v)} style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 16px", marginBottom: 6, borderRadius: 6, border: `2px solid ${tab === v ? "#1a5fa8" : "#ddd"}`, background: tab === v ? "#1a5fa8" : "#fff", color: tab === v ? "#fff" : "#555", cursor: "pointer", fontSize: 14, fontWeight: tab === v ? 600 : 400 }}>
              {l}{getBadge(v) ? <span style={{marginLeft:6,background:"#c00",color:"#fff",borderRadius:10,padding:"1px 7px",fontSize:11,fontWeight:700}}>{getBadge(v)}</span> : null}
            </button>
          ))}
        </div>

        {/* Контент */}
        <div style={{ flex: 1, minWidth: 0 }}>
        
        

        {tab === "dashboard" && <Dashboard setTab={setTab} />}{/* Склад */}
        {tab === "warehouse" && <Warehouse />}
        {tab === "delivery" && <Delivery />}
        {tab === "tasks" && <Tasks />}
        {tab === "calc" && <DeliveryCalc />}

        {/* Генератор КП */}
        {tab === "kp" && (
          <>
            {step !== 2 && (
              <>
                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                  {["Данные КП", "Организации"].map((t, i) => (
                    <button key={i} onClick={() => setStep(i)} style={{ ...btn, fontWeight: step === i ? 600 : 400, borderColor: step === i ? "#1a5fa8" : "#ccc", color: step === i ? "#1a5fa8" : "#333" }}>
                      {i + 1}. {t}
                    </button>
                  ))}
                </div>

                {step === 0 && (
                  <>
                    <div style={card}>
                      <p style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Общие сведения</p>
                      <label style={lbl}>Заказчик</label>
                      <input style={inp} value={client} onChange={e => setClient(e.target.value)} placeholder='ООО «Название заказчика»' />
                      <label style={lbl}>Дата КП</label>
                      <input style={{ ...inp, width: "auto" }} value={kpDate} onChange={e => setKpDate(e.target.value)} />
                      <label style={lbl}>Срок выполнения</label>
                      <input style={inp} value={deadline} onChange={e => setDeadline(e.target.value)} placeholder="например: 30 рабочих дней" />
                      <label style={lbl}>Описание работ / услуг</label>
                      <textarea rows={4} style={{ ...inp, resize: "vertical" }} value={description} onChange={e => setDescription(e.target.value)} placeholder="Опишите работы или услуги..." />
                    </div>

                    <div style={card}>
                      <p style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Позиции и цены</p>
                      <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: "#f0f0f0" }}>
                            <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Наименование</th>
                            <th style={{ width: 60, textAlign: "center", padding: "6px 8px", fontWeight: 500 }}>Кол-во</th>
                            <th style={{ width: 70, textAlign: "center", padding: "6px 8px", fontWeight: 500 }}>Ед.</th>
                            <th style={{ width: 110, textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Цена (база)</th>
                            <th style={{ width: 30 }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((it, i) => (
                            <tr key={i}>
                              <td style={{ padding: "3px 4px" }}><input value={it.desc} onChange={e => updateItem(i, "desc", e.target.value)} style={{ ...inp, marginBottom: 0 }} placeholder="Название позиции" /></td>
                              <td style={{ padding: "3px 4px" }}><input type="number" value={it.qty} onChange={e => updateItem(i, "qty", e.target.value)} style={{ ...inp, marginBottom: 0, textAlign: "center" }} /></td>
                              <td style={{ padding: "3px 4px" }}><input value={it.unit} onChange={e => updateItem(i, "unit", e.target.value)} style={{ ...inp, marginBottom: 0 }} /></td>
                              <td style={{ padding: "3px 4px" }}><input type="number" value={it.price} onChange={e => updateItem(i, "price", e.target.value)} style={{ ...inp, marginBottom: 0, textAlign: "right" }} placeholder="0" /></td>
                              <td style={{ padding: "3px 4px", textAlign: "center" }}>
                                {items.length > 1 && <button onClick={() => removeItem(i)} style={{ ...btn, padding: "4px 8px", color: "#c00" }}>✕</button>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <button onClick={addItem} style={{ ...btn, marginTop: 10, color: "#1a5fa8" }}>+ Добавить позицию</button>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <button onClick={() => setStep(1)} style={{ ...btn, background: "#1a5fa8", color: "#fff", borderColor: "#1a5fa8", fontWeight: 600 }}>Далее: Организации →</button>
                    </div>
                  </>
                )}

                {step === 1 && (
                  <>
                    {ORGS.map((org, i) => (
                      <div key={i} style={{ ...card, borderLeft: `4px solid ${org.accent}` }}>
                        <p style={{ fontWeight: 600, marginBottom: 12, fontSize: 14, color: org.accent }}>
                          {org.label} <span style={{ fontSize: 11, color: "#888", fontWeight: 400 }}>(цены ×{(org.priceMultiplier * 100).toFixed(0)}%)</span>
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                          {[["name","Название организации"],["inn","ИНН"],["address","Адрес"],["phone","Телефон"],["email","E-mail"],["director","ФИО директора"]].map(([f, l]) => (
                            <div key={f}>
                              <label style={lbl}>{l}</label>
                              <input style={inp} value={orgs[i][f]} onChange={e => updateOrg(i, f, e.target.value)} />
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop: 10 }}>
                          <label style={lbl}>НДС</label>
                          <div style={{ display: "flex", gap: 8 }}>
                            {[["without","Без НДС"],["with","С НДС (5%)"]].map(([v, l]) => (
                              <button key={v} onClick={() => { const m = [...ndsModes]; m[i] = v; setNdsModes(m); }}
                                style={{ padding: "5px 14px", borderRadius: 4, border: `1px solid ${ndsModes[i]===v ? org.accent : "#ccc"}`, background: ndsModes[i]===v ? "#f0f4ff" : "#fff", color: ndsModes[i]===v ? org.accent : "#333", cursor: "pointer", fontSize: 13 }}>
                                {l}{getBadge(v) ? <span style={{marginLeft:6,background:"#c00",color:"#fff",borderRadius:10,padding:"1px 7px",fontSize:11,fontWeight:700}}>{getBadge(v)}</span> : null}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}

                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                      <button onClick={() => setStep(0)} style={btn}>← Назад</button>
                      <button onClick={generate} disabled={loading} style={{ ...btn, background: loading ? "#aaa" : "#1a5fa8", color: "#fff", borderColor: loading ? "#aaa" : "#1a5fa8", fontWeight: 600 }}>
                        {loading ? "Генерация..." : "Сгенерировать 3 КП →"}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

            {generated && step === 2 && (
              <>
                <p style={{ fontSize: 13, color: "#555", marginBottom: 16 }}>3 КП готовы. Просмотрите и скачайте каждое.</p>
                <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                  {ORGS.map((org, i) => (
                    <button key={i} onClick={() => setActivePreview(i)}
                      style={{ ...btn, fontWeight: activePreview === i ? 600 : 400, borderColor: activePreview === i ? org.accent : "#ccc", color: activePreview === i ? org.accent : "#333" }}>
                      {orgs[i].name || org.label}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <button onClick={() => downloadKP(activePreview)} style={{ ...btn, background: "#1a5fa8", color: "#fff", borderColor: "#1a5fa8" }}>
                    ⬇ Скачать КП {activePreview + 1}
                  </button>
                  <button onClick={() => { setGenerated(false); setStep(0); }} style={btn}>← Изменить данные</button>
                </div>
                <div style={{ border: "1px solid #ddd", borderRadius: 8, overflow: "hidden" }}>
                  <iframe
                    key={activePreview}
                    srcDoc={htmls[activePreview]}
                    style={{ width: "100%", height: 600, border: "none" }}
                    title={`Предпросмотр КП ${activePreview + 1}`}
                  />
                </div>
                <p style={{ fontSize: 11, color: "#888", marginTop: 8 }}>
                  Чтобы сохранить как PDF — откройте скачанный HTML файл в браузере и нажмите Ctrl+P → «Сохранить как PDF».
                </p>
              </>
            )}
          </>
        )}

      </div>
      </div>
    </div>
  );
}
