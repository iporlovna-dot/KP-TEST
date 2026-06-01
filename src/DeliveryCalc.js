import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

const SETTINGS_KEY = "delivery_calc_settings";
const defaultSettings = {
  pricePerKg: 10,
  pricePerKm: 5,
  pricePerM3: 500,
  minPrice: 300,
};

function loadSettings() {
  try { return { ...defaultSettings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY)) }; }
  catch { return defaultSettings; }
}
function saveSettings(s) { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); }

export default function DeliveryCalc() {
  const [settings, setSettings] = useState(loadSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [form, setForm] = useState({ weight: "", distance: "", length: "", width: "", height: "", desc: "" });
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("delivery_calc_history")) || []; }
    catch { return []; }
  });

  useEffect(() => { localStorage.setItem("delivery_calc_history", JSON.stringify(history)); }, [history]);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setS = (k, v) => setSettings(s => ({ ...s, [k]: v }));

  const calculate = () => {
    const weight = parseFloat(form.weight) || 0;
    const distance = parseFloat(form.distance) || 0;
    const l = parseFloat(form.length) || 0;
    const w = parseFloat(form.width) || 0;
    const h = parseFloat(form.height) || 0;
    const volume = (l * w * h) / 1000000;
    const dimWeight = volume * 250;
    const billableWeight = Math.max(weight, dimWeight);
    const costWeight = billableWeight * settings.pricePerKg;
    const costDistance = distance * settings.pricePerKm;
    const costVolume = volume * settings.pricePerM3;
    const subtotal = costWeight + costDistance + costVolume;
    const total = Math.max(subtotal, settings.minPrice);

    const res = {
      id: Date.now(),
      date: new Date().toLocaleDateString("ru-RU"),
      desc: form.desc || "Без описания",
      weight, distance, volume: volume.toFixed(4),
      dimWeight: dimWeight.toFixed(2),
      billableWeight: billableWeight.toFixed(2),
      costWeight: costWeight.toFixed(2),
      costDistance: costDistance.toFixed(2),
      costVolume: costVolume.toFixed(2),
      total: total.toFixed(2),
    };
    setResult(res);
  };

  const saveToHistory = () => {
    if (!result) return;
    setHistory(h => [result, ...h].slice(0, 50));
    alert("Расчёт сохранён в историю!");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(history.map(i => ({
      "Дата": i.date,
      "Описание": i.desc,
      "Вес, кг": i.weight,
      "Расстояние, км": i.distance,
      "Объём, м³": i.volume,
      "Итого, руб.": i.total
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Расчёты");
    XLSX.writeFile(wb, "Расчёты_доставки.xlsx");
  };

  const deleteHistory = (id) => setHistory(h => h.filter(r => r.id !== id));
  const clearHistory = () => { if (window.confirm("Очистить всю историю?")) setHistory([]); };

  const inp = { padding: "6px 10px", border: "1px solid #ccc", borderRadius: 4, fontSize: 13, boxSizing: "border-box", width: "100%" };
  const lbl = { fontSize: 12, color: "#666", marginBottom: 3, display: "block" };
  const card = { background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, padding: "16px 20px", marginBottom: 16 };
  const btn = { padding: "7px 16px", borderRadius: 4, border: "1px solid #ccc", background: "#fff", cursor: "pointer", fontSize: 13 };

  return (
    <div>
      <div style={{ ...card, borderLeft: "4px solid #1a5fa8" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showSettings ? 14 : 0 }}>
          <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>⚙️ Тариф доставки</p>
          <button onClick={() => { if (showSettings) saveSettings(settings); setShowSettings(!showSettings); }}
            style={{ ...btn, color: "#1a5fa8", borderColor: "#1a5fa8" }}>
            {showSettings ? "Сохранить тариф" : "Изменить тариф"}
          </button>
        </div>
        {showSettings && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginTop: 14 }}>
            {[
              ["pricePerKg", "Цена за кг, руб."],
              ["pricePerKm", "Цена за км, руб."],
              ["pricePerM3", "Цена за м³, руб."],
              ["minPrice", "Мин. стоимость, руб."],
            ].map(([k, l]) => (
              <div key={k}>
                <label style={lbl}>{l}</label>
                <input type="number" style={inp} value={settings[k]} onChange={e => setS(k, parseFloat(e.target.value) || 0)} />
              </div>
            ))}
          </div>
        )}
        {!showSettings && (
          <div style={{ display: "flex", gap: 20, marginTop: 10, flexWrap: "wrap", fontSize: 13, color: "#555" }}>
            <span>За кг: <b>{settings.pricePerKg} руб.</b></span>
            <span>За км: <b>{settings.pricePerKm} руб.</b></span>
            <span>За м³: <b>{settings.pricePerM3} руб.</b></span>
            <span>Минимум: <b>{settings.minPrice} руб.</b></span>
          </div>
        )}
      </div>

      <div style={card}>
        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Новый расчёт</p>
        <div style={{ marginBottom: 10 }}>
          <label style={lbl}>Описание груза</label>
          <input style={inp} value={form.desc} onChange={e => setF("desc", e.target.value)} placeholder="Например: холодильник, коробки и т.д." />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <div>
            <label style={lbl}>Вес, кг</label>
            <input type="number" style={inp} value={form.weight} onChange={e => setF("weight", e.target.value)} placeholder="0" />
          </div>
          <div>
            <label style={lbl}>Расстояние, км</label>
            <input type="number" style={inp} value={form.distance} onChange={e => setF("distance", e.target.value)} placeholder="0" />
          </div>
        </div>
        <p style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Габариты (необязательно)</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
          {[["length","Длина, см"],["width","Ширина, см"],["height","Высота, см"]].map(([k, l]) => (
            <div key={k}>
              <label style={lbl}>{l}</label>
              <input type="number" style={inp} value={form[k]} onChange={e => setF(k, e.target.value)} placeholder="0" />
            </div>
          ))}
        </div>
        <button onClick={calculate} style={{ ...btn, background: "#1a5fa8", color: "#fff", borderColor: "#1a5fa8", fontWeight: 600 }}>
          Рассчитать →
        </button>
      </div>

      {result && (
        <div style={{ ...card, borderLeft: "4px solid #2e7d32" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>Результат расчёта</p>
            <button onClick={saveToHistory} style={{ ...btn, color: "#2e7d32", borderColor: "#2e7d32" }}>
              Сохранить в историю
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13, marginBottom: 14 }}>
            <div style={{ color: "#666" }}>Вес фактический:</div><div><b>{result.weight} кг</b></div>
            <div style={{ color: "#666" }}>Объёмный вес:</div><div><b>{result.dimWeight} кг</b></div>
            <div style={{ color: "#666" }}>Расчётный вес:</div><div><b>{result.billableWeight} кг</b></div>
            <div style={{ color: "#666" }}>Объём:</div><div><b>{result.volume} м³</b></div>
            <div style={{ color: "#666" }}>Стоимость за вес:</div><div><b>{result.costWeight} руб.</b></div>
            <div style={{ color: "#666" }}>Стоимость за расстояние:</div><div><b>{result.costDistance} руб.</b></div>
            <div style={{ color: "#666" }}>Стоимость за объём:</div><div><b>{result.costVolume} руб.</b></div>
          </div>
          <div style={{ background: "#f0f7f0", borderRadius: 8, padding: "14px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "#555", marginBottom: 4 }}>Итоговая стоимость доставки</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#2e7d32" }}>{result.total} руб.</div>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>История расчётов</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={exportExcel} style={{ ...btn, color: "#2e7d32", borderColor: "#2e7d32", fontSize: 12 }}>⬇ Excel</button>
              <button onClick={clearHistory} style={{ ...btn, color: "#c00", borderColor: "#c00", fontSize: 12 }}>Очистить всё</button>
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ textAlign: "left", padding: "8px 10px", fontWeight: 600, color: "#444" }}>Дата</th>
                <th style={{ textAlign: "left", padding: "8px 10px", fontWeight: 600, color: "#444" }}>Описание</th>
                <th style={{ textAlign: "center", padding: "8px 10px", fontWeight: 600, color: "#444" }}>Вес</th>
                <th style={{ textAlign: "center", padding: "8px 10px", fontWeight: 600, color: "#444" }}>Км</th>
                <th style={{ textAlign: "right", padding: "8px 10px", fontWeight: 600, color: "#444" }}>Итого</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {history.map((r, i) => (
                <tr key={r.id} style={{ borderTop: "1px solid #f0f0f0", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding: "8px 10px" }}>{r.date}</td>
                  <td style={{ padding: "8px 10px" }}>{r.desc}</td>
                  <td style={{ padding: "8px 10px", textAlign: "center" }}>{r.weight} кг</td>
                  <td style={{ padding: "8px 10px", textAlign: "center" }}>{r.distance} км</td>
                  <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: "#2e7d32" }}>{r.total} руб.</td>
                  <td style={{ padding: "8px 10px", textAlign: "center" }}>
                    <button onClick={() => deleteHistory(r.id)} style={{ ...btn, padding: "2px 7px", fontSize: 12, color: "#c00" }}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}