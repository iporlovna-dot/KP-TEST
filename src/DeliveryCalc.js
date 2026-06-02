import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

const SETTINGS_KEY = "delivery_calc_settings";
const defaultSettings = { pricePerKg: 10, pricePerKm: 5, pricePerM3: 500, minPrice: 300 };
function loadSettings() { try { return { ...defaultSettings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY)) }; } catch { return defaultSettings; } }
function saveSettings(s) { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); }

export default function DeliveryCalc() {
  const [settings, setSettings] = useState(loadSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [form, setForm] = useState({ weight: "", distance: "", length: "", width: "", height: "", desc: "" });
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(() => { try { return JSON.parse(localStorage.getItem("delivery_calc_history")) || []; } catch { return []; } });

  useEffect(() => { localStorage.setItem("delivery_calc_history", JSON.stringify(history)); }, [history]);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setS = (k, v) => setSettings(s => ({ ...s, [k]: v }));

  const calculate = () => {
    const weight = parseFloat(form.weight) || 0;
    const distance = parseFloat(form.distance) || 0;
    const l = parseFloat(form.length) || 0, w = parseFloat(form.width) || 0, h = parseFloat(form.height) || 0;
    const volume = (l * w * h) / 1000000;
    const dimWeight = volume * 250;
    const billableWeight = Math.max(weight, dimWeight);
    const costWeight = billableWeight * settings.pricePerKg;
    const costDistance = distance * settings.pricePerKm;
    const costVolume = volume * settings.pricePerM3;
    const total = Math.max(costWeight + costDistance + costVolume, settings.minPrice);
    setResult({ id: Date.now(), date: new Date().toLocaleDateString("ru-RU"), desc: form.desc || "Р‘РµР· РѕРїРёСЃР°РЅРёСЏ", weight, distance, volume: volume.toFixed(4), dimWeight: dimWeight.toFixed(2), billableWeight: billableWeight.toFixed(2), costWeight: costWeight.toFixed(2), costDistance: costDistance.toFixed(2), costVolume: costVolume.toFixed(2), total: total.toFixed(2) });
  };

  const saveToHistory = () => { if (!result) return; setHistory(h => [result, ...h].slice(0, 50)); alert("РЎРѕС…СЂР°РЅРµРЅРѕ!"); };
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(history.map(i => ({ "Р”Р°С‚Р°": i.date, "РћРїРёСЃР°РЅРёРµ": i.desc, "Р’РµСЃ": i.weight, "РљРј": i.distance, "РћР±СЉС‘Рј": i.volume, "РС‚РѕРіРѕ": i.total })));
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Р Р°СЃС‡С‘С‚С‹"); XLSX.writeFile(wb, "Р Р°СЃС‡С‘С‚С‹.xlsx");
  };
  const deleteHistory = (id) => setHistory(h => h.filter(r => r.id !== id));
  const clearHistory = () => { if (window.confirm("РћС‡РёСЃС‚РёС‚СЊ РёСЃС‚РѕСЂРёСЋ?")) setHistory([]); };

  const S = {
    card: { background: "#1e2130", border: "1px solid #2d3354", borderRadius: 10, padding: "16px 20px", marginBottom: 16 },
    inp: { padding: "8px 12px", border: "1px solid #2d3354", borderRadius: 8, fontSize: 13, background: "#252a3d", color: "#e2e8f0", boxSizing: "border-box", width: "100%" },
    btn: { padding: "7px 16px", borderRadius: 8, border: "1px solid #2d3354", background: "#252a3d", cursor: "pointer", fontSize: 13, color: "#e2e8f0" },
    btnP: { padding: "7px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#3b5bdb,#7048e8)", cursor: "pointer", fontSize: 13, color: "#fff", fontWeight: 600 },
    lbl: { fontSize: 12, color: "#7c8db5", marginBottom: 4, display: "block" },
  };

  return (
    <div>
      <div style={{ ...S.card, borderLeft: "4px solid #3b5bdb" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showSettings ? 14 : 0 }}>
          <p style={{ fontWeight: 600, fontSize: 14, margin: 0, color: "#e2e8f0" }}>вљ™пёЏ РўР°СЂРёС„ РґРѕСЃС‚Р°РІРєРё</p>
          <button onClick={() => { if (showSettings) saveSettings(settings); setShowSettings(!showSettings); }} style={{ ...S.btn, color: "#748ffc", borderColor: "#3b5bdb" }}>
            {showSettings ? "РЎРѕС…СЂР°РЅРёС‚СЊ С‚Р°СЂРёС„" : "РР·РјРµРЅРёС‚СЊ С‚Р°СЂРёС„"}
          </button>
        </div>
        {showSettings && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginTop: 14 }}>
            {[["pricePerKg","Р—Р° РєРі, СЂСѓР±."],["pricePerKm","Р—Р° РєРј, СЂСѓР±."],["pricePerM3","Р—Р° РјВі, СЂСѓР±."],["minPrice","РњРёРЅРёРјСѓРј, СЂСѓР±."]].map(([k, l]) => (
              <div key={k}><label style={S.lbl}>{l}</label><input type="number" style={S.inp} value={settings[k]} onChange={e => setS(k, parseFloat(e.target.value) || 0)} /></div>
            ))}
          </div>
        )}
        {!showSettings && (
          <div style={{ display: "flex", gap: 20, marginTop: 10, flexWrap: "wrap", fontSize: 13, color: "#a0aec0" }}>
            <span>Р—Р° РєРі: <b style={{ color: "#e2e8f0" }}>{settings.pricePerKg} СЂСѓР±.</b></span>
            <span>Р—Р° РєРј: <b style={{ color: "#e2e8f0" }}>{settings.pricePerKm} СЂСѓР±.</b></span>
            <span>Р—Р° РјВі: <b style={{ color: "#e2e8f0" }}>{settings.pricePerM3} СЂСѓР±.</b></span>
            <span>РњРёРЅРёРјСѓРј: <b style={{ color: "#e2e8f0" }}>{settings.minPrice} СЂСѓР±.</b></span>
          </div>
        )}
      </div>

      <div style={S.card}>
        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 14, color: "#e2e8f0" }}>РќРѕРІС‹Р№ СЂР°СЃС‡С‘С‚</p>
        <div style={{ marginBottom: 10 }}><label style={S.lbl}>РћРїРёСЃР°РЅРёРµ РіСЂСѓР·Р°</label><input style={S.inp} value={form.desc} onChange={e => setF("desc", e.target.value)} placeholder="РќР°РїСЂРёРјРµСЂ: С…РѕР»РѕРґРёР»СЊРЅРёРє, РєРѕСЂРѕР±РєРё..." /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <div><label style={S.lbl}>Р’РµСЃ, РєРі</label><input type="number" style={S.inp} value={form.weight} onChange={e => setF("weight", e.target.value)} placeholder="0" /></div>
          <div><label style={S.lbl}>Р Р°СЃСЃС‚РѕСЏРЅРёРµ, РєРј</label><input type="number" style={S.inp} value={form.distance} onChange={e => setF("distance", e.target.value)} placeholder="0" /></div>
        </div>
        <p style={{ fontSize: 12, color: "#7c8db5", marginBottom: 8 }}>Р“Р°Р±Р°СЂРёС‚С‹ (РЅРµРѕР±СЏР·Р°С‚РµР»СЊРЅРѕ)</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
          {[["length","Р”Р»РёРЅР°, СЃРј"],["width","РЁРёСЂРёРЅР°, СЃРј"],["height","Р’С‹СЃРѕС‚Р°, СЃРј"]].map(([k, l]) => (
            <div key={k}><label style={S.lbl}>{l}</label><input type="number" style={S.inp} value={form[k]} onChange={e => setF(k, e.target.value)} placeholder="0" /></div>
          ))}
        </div>
        <button onClick={calculate} style={S.btnP}>Р Р°СЃСЃС‡РёС‚Р°С‚СЊ в†’</button>
      </div>

      {result && (
        <div style={{ ...S.card, borderLeft: "4px solid #40c057" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <p style={{ fontWeight: 600, fontSize: 14, margin: 0, color: "#e2e8f0" }}>Р РµР·СѓР»СЊС‚Р°С‚ СЂР°СЃС‡С‘С‚Р°</p>
            <button onClick={saveToHistory} style={{ ...S.btn, color: "#40c057", borderColor: "#40c057" }}>РЎРѕС…СЂР°РЅРёС‚СЊ РІ РёСЃС‚РѕСЂРёСЋ</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13, marginBottom: 14 }}>
            {[["Р’РµСЃ С„Р°РєС‚РёС‡РµСЃРєРёР№:",`${result.weight} РєРі`],["РћР±СЉС‘РјРЅС‹Р№ РІРµСЃ:",`${result.dimWeight} РєРі`],["Р Р°СЃС‡С‘С‚РЅС‹Р№ РІРµСЃ:",`${result.billableWeight} РєРі`],["РћР±СЉС‘Рј:",`${result.volume} РјВі`],["Р—Р° РІРµСЃ:",`${result.costWeight} СЂСѓР±.`],["Р—Р° СЂР°СЃСЃС‚РѕСЏРЅРёРµ:",`${result.costDistance} СЂСѓР±.`],["Р—Р° РѕР±СЉС‘Рј:",`${result.costVolume} СЂСѓР±.`]].map(([l,v],i) => (
              <><div key={`l${i}`} style={{ color: "#7c8db5" }}>{l}</div><div key={`v${i}`}><b style={{ color: "#e2e8f0" }}>{v}</b></div></>
            ))}
          </div>
          <div style={{ background: "#252a3d", borderRadius: 8, padding: "14px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "#7c8db5", marginBottom: 4 }}>РС‚РѕРіРѕРІР°СЏ СЃС‚РѕРёРјРѕСЃС‚СЊ</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#40c057" }}>{result.total} СЂСѓР±.</div>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <p style={{ fontWeight: 600, fontSize: 14, margin: 0, color: "#e2e8f0" }}>РСЃС‚РѕСЂРёСЏ СЂР°СЃС‡С‘С‚РѕРІ</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={exportExcel} style={{ ...S.btn, color: "#40c057", borderColor: "#40c057", fontSize: 12 }}>в¬‡ Excel</button>
              <button onClick={clearHistory} style={{ ...S.btn, color: "#f03e3e", borderColor: "#f03e3e", fontSize: 12 }}>РћС‡РёСЃС‚РёС‚СЊ</button>
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#252a3d" }}>
                {["Р”Р°С‚Р°","РћРїРёСЃР°РЅРёРµ","Р’РµСЃ","РљРј","РС‚РѕРіРѕ",""].map((h,i) => <th key={i} style={{ textAlign: i===4?"right":i===0||i===1?"left":"center", padding: "8px 10px", fontWeight: 600, color: "#7c8db5" }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {history.map((r, i) => (
                <tr key={r.id} style={{ borderTop: "1px solid #2d3354", background: i % 2 === 0 ? "#1e2130" : "#1a1d2e" }}>
                  <td style={{ padding: "8px 10px", color: "#a0aec0" }}>{r.date}</td>
                  <td style={{ padding: "8px 10px", color: "#e2e8f0" }}>{r.desc}</td>
                  <td style={{ padding: "8px 10px", textAlign: "center", color: "#a0aec0" }}>{r.weight} РєРі</td>
                  <td style={{ padding: "8px 10px", textAlign: "center", color: "#a0aec0" }}>{r.distance} РєРј</td>
                  <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: "#40c057" }}>{r.total} СЂСѓР±.</td>
                  <td style={{ padding: "8px 10px", textAlign: "center" }}>
                    <button onClick={() => deleteHistory(r.id)} style={{ ...S.btn, padding: "2px 7px", fontSize: 12, color: "#f03e3e" }}>вњ•</button>
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
