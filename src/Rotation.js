import { useState, useEffect } from "react";

const STORAGE_KEY = "rotation_data";
function load() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { people: [], events: [] }; } catch { return { people: [], events: [] }; } }
function save(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
const emptyPerson = { name: "", priority: 1 };

export default function Rotation() {
  const [data, setData] = useState(load);
  const [form, setForm] = useState(emptyPerson);
  const [editId, setEditId] = useState(null);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [count, setCount] = useState(1);
  const [selected, setSelected] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => { save(data); }, [data]);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const addOrUpdate = () => {
    if (!form.name.trim()) return;
    if (editId !== null) { setData(d => ({ ...d, people: d.people.map(p => p.id === editId ? { ...p, ...form, priority: Number(form.priority) } : p) })); setEditId(null); }
    else { setData(d => ({ ...d, people: [...d.people, { id: Date.now(), ...form, priority: Number(form.priority), trips: 0, lastEvent: null }] })); }
    setForm(emptyPerson);
  };
  const startEdit = (p) => { setEditId(p.id); setForm({ name: p.name, priority: p.priority }); };
  const cancelEdit = () => { setEditId(null); setForm(emptyPerson); };
  const deletePerson = (id) => { if (window.confirm("РЈРґР°Р»РёС‚СЊ?")) setData(d => ({ ...d, people: d.people.filter(p => p.id !== id) })); };
  const pickPeople = () => {
    if (!eventName.trim()) { alert("Р’РІРµРґРёС‚Рµ РЅР°Р·РІР°РЅРёРµ РёРІРµРЅС‚Р°!"); return; }
    if (data.people.length === 0) { alert("Р”РѕР±Р°РІСЊС‚Рµ Р»СЋРґРµР№!"); return; }
    const n = Math.min(Number(count), data.people.length);
    const scored = [...data.people].map(p => ({ ...p, score: p.priority / (p.trips + 1) })).sort((a, b) => b.score - a.score);
    setSelected(scored.slice(0, n));
  };
  const confirmEvent = () => {
    if (selected.length === 0) return;
    const ids = new Set(selected.map(p => p.id));
    const event = { id: Date.now(), name: eventName, date: eventDate || new Date().toLocaleDateString("ru-RU"), people: selected.map(p => p.name) };
    setData(d => ({ people: d.people.map(p => ids.has(p.id) ? { ...p, trips: p.trips + 1, lastEvent: event.name } : p), events: [event, ...d.events] }));
    setSelected([]); setEventName(""); setEventDate(""); setCount(1);
    alert("РРІРµРЅС‚ РїРѕРґС‚РІРµСЂР¶РґС‘РЅ!");
  };
  const resetTrips = () => { if (window.confirm("РЎР±СЂРѕСЃРёС‚СЊ СЃС‡С‘С‚С‡РёРєРё?")) setData(d => ({ ...d, people: d.people.map(p => ({ ...p, trips: 0, lastEvent: null })) })); };

  const S = {
    card: { background: "#1e2130", border: "1px solid #2d3354", borderRadius: 10, padding: "16px 20px", marginBottom: 16 },
    inp: { padding: "8px 12px", border: "1px solid #2d3354", borderRadius: 8, fontSize: 13, background: "#252a3d", color: "#e2e8f0", boxSizing: "border-box", width: "100%" },
    btn: { padding: "7px 16px", borderRadius: 8, border: "1px solid #2d3354", background: "#252a3d", cursor: "pointer", fontSize: 13, color: "#e2e8f0" },
    btnP: { padding: "7px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#3b5bdb,#7048e8)", cursor: "pointer", fontSize: 13, color: "#fff", fontWeight: 600 },
    btnG: { padding: "7px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#2f9e44,#40c057)", cursor: "pointer", fontSize: 13, color: "#fff", fontWeight: 600 },
    lbl: { fontSize: 12, color: "#7c8db5", marginBottom: 4, display: "block" },
  };

  const maxTrips = Math.max(...data.people.map(p => p.trips), 1);
  const priorityColors = { 1: "#7c8db5", 2: "#40c057", 3: "#4dabf7", 4: "#f59f00", 5: "#f03e3e" };

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[{ label: "Р’СЃРµРіРѕ Р»СЋРґРµР№", value: data.people.length, color: "#4dabf7" }, { label: "РРІРµРЅС‚РѕРІ", value: data.events.length, color: "#40c057" }, { label: "РџРѕРµР·РґРѕРє РІСЃРµРіРѕ", value: data.people.reduce((s, p) => s + p.trips, 0), color: "#9775fa" }].map((s, i) => (
          <div key={i} style={{ flex: 1, minWidth: 120, background: "#1e2130", border: "1px solid #2d3354", borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#7c8db5" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <div style={S.card}>
            <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: "#e2e8f0" }}>{editId !== null ? "Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ" : "Р”РѕР±Р°РІРёС‚СЊ С‡РµР»РѕРІРµРєР°"}</p>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 10 }}>
              <div><label style={S.lbl}>РРјСЏ</label><input style={S.inp} value={form.name} onChange={e => setF("name", e.target.value)} placeholder="РРјСЏ СЃРѕС‚СЂСѓРґРЅРёРєР°" /></div>
              <div><label style={S.lbl}>РџСЂРёРѕСЂРёС‚РµС‚ (1-5)</label><input type="number" min="1" max="5" style={S.inp} value={form.priority} onChange={e => setF("priority", e.target.value)} /></div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={addOrUpdate} style={S.btnP}>{editId !== null ? "РЎРѕС…СЂР°РЅРёС‚СЊ" : "+ Р”РѕР±Р°РІРёС‚СЊ"}</button>
              {editId !== null && <button onClick={cancelEdit} style={S.btn}>РћС‚РјРµРЅР°</button>}
            </div>
          </div>

          <div style={{ background: "#1e2130", border: "1px solid #2d3354", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #2d3354" }}>
              <p style={{ fontWeight: 600, fontSize: 14, margin: 0, color: "#e2e8f0" }}>РЎРїРёСЃРѕРє Р»СЋРґРµР№</p>
              {data.people.length > 0 && <button onClick={resetTrips} style={{ ...S.btn, fontSize: 12, color: "#f03e3e", borderColor: "#f03e3e" }}>РЎР±СЂРѕСЃРёС‚СЊ СЃС‡С‘С‚С‡РёРєРё</button>}
            </div>
            {data.people.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "#4a5568", fontSize: 13 }}>Р”РѕР±Р°РІСЊС‚Рµ РїРµСЂРІРѕРіРѕ С‡РµР»РѕРІРµРєР°</div>
            ) : data.people.map((p, idx) => (
              <div key={p.id} style={{ padding: "10px 16px", borderTop: idx > 0 ? "1px solid #2d3354" : "none", background: selected.some(s => s.id === p.id) ? "#1a2a1a" : "transparent" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 500, fontSize: 13, color: "#e2e8f0" }}>{p.name}</span>
                    <span style={{ fontSize: 11, background: priorityColors[p.priority] + "22", color: priorityColors[p.priority], padding: "2px 6px", borderRadius: 6, fontWeight: 600 }}>P{p.priority}</span>
                    {selected.some(s => s.id === p.id) && <span style={{ fontSize: 11, background: "#40c05722", color: "#40c057", padding: "2px 6px", borderRadius: 6 }}>вњ“ РІС‹Р±СЂР°РЅ</span>}
                  </div>
                  <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#7c8db5", marginRight: 6 }}>{p.trips} РїРѕРµР·РґРѕРє</span>
                    <button onClick={() => startEdit(p)} style={{ ...S.btn, padding: "2px 7px", fontSize: 12 }}>вњЋ</button>
                    <button onClick={() => deletePerson(p.id)} style={{ ...S.btn, padding: "2px 7px", fontSize: 12, color: "#f03e3e" }}>вњ•</button>
                  </div>
                </div>
                <div style={{ height: 4, background: "#252a3d", borderRadius: 2 }}>
                  <div style={{ height: 4, width: `${maxTrips > 0 ? (p.trips / maxTrips) * 100 : 0}%`, background: "linear-gradient(135deg,#3b5bdb,#7048e8)", borderRadius: 2, transition: "width 0.3s" }} />
                </div>
                {p.lastEvent && <div style={{ fontSize: 11, color: "#4a5568", marginTop: 3 }}>РџРѕСЃР»РµРґРЅРёР№: {p.lastEvent}</div>}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={S.card}>
            <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: "#e2e8f0" }}>рџЋЇ РќРѕРІС‹Р№ РёРІРµРЅС‚</p>
            <div style={{ marginBottom: 10 }}><label style={S.lbl}>РќР°Р·РІР°РЅРёРµ РёРІРµРЅС‚Р°</label><input style={S.inp} value={eventName} onChange={e => setEventName(e.target.value)} placeholder="Р’С‹СЃС‚Р°РІРєР°, РљРѕРЅС„РµСЂРµРЅС†РёСЏ..." /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <div><label style={S.lbl}>Р”Р°С‚Р°</label><input type="date" style={S.inp} value={eventDate} onChange={e => setEventDate(e.target.value)} /></div>
              <div><label style={S.lbl}>РљРѕР»-РІРѕ С‡РµР»РѕРІРµРє</label><input type="number" min="1" max={data.people.length || 1} style={S.inp} value={count} onChange={e => setCount(e.target.value)} /></div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={pickPeople} style={S.btnP}>рџЋІ РџРѕРґРѕР±СЂР°С‚СЊ</button>
              {selected.length > 0 && <button onClick={confirmEvent} style={S.btnG}>вњ“ РџРѕРґС‚РІРµСЂРґРёС‚СЊ</button>}
            </div>
          </div>

          {selected.length > 0 && (
            <div style={{ ...S.card, borderLeft: "4px solid #40c057" }}>
              <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: "#e2e8f0" }}>вњ… Р РµРєРѕРјРµРЅРґСѓРµРјС‹Р№ СЃРѕСЃС‚Р°РІ</p>
              {selected.map((p, i) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #2d3354", fontSize: 13 }}>
                  <span style={{ color: "#e2e8f0" }}><b>{i + 1}.</b> {p.name}</span>
                  <span style={{ color: "#7c8db5" }}>{p.trips} РїРѕРµР·РґРѕРє | P{p.priority}</span>
                </div>
              ))}
              <p style={{ fontSize: 12, color: "#4a5568", marginTop: 10 }}>РќР°Р¶РјРёС‚Рµ В«РџРѕРґС‚РІРµСЂРґРёС‚СЊВ» С‡С‚РѕР±С‹ Р·Р°СЃС‡РёС‚Р°С‚СЊ РїРѕРµР·РґРєСѓ.</p>
            </div>
          )}

          <div style={S.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <p style={{ fontWeight: 600, fontSize: 14, margin: 0, color: "#e2e8f0" }}>рџ“… РСЃС‚РѕСЂРёСЏ РёРІРµРЅС‚РѕРІ</p>
              <button onClick={() => setShowHistory(!showHistory)} style={{ ...S.btn, fontSize: 12 }}>{showHistory ? "РЎРєСЂС‹С‚СЊ" : "РџРѕРєР°Р·Р°С‚СЊ"}</button>
            </div>
            {showHistory && (data.events.length === 0
              ? <p style={{ fontSize: 13, color: "#4a5568" }}>РРІРµРЅС‚РѕРІ РїРѕРєР° РЅРµС‚</p>
              : data.events.map(ev => (
                <div key={ev.id} style={{ padding: "8px 0", borderBottom: "1px solid #2d3354", fontSize: 13 }}>
                  <div style={{ fontWeight: 600, color: "#e2e8f0" }}>{ev.name} <span style={{ color: "#7c8db5", fontWeight: 400 }}>вЂ” {ev.date}</span></div>
                  <div style={{ color: "#a0aec0", marginTop: 3 }}>{ev.people.join(", ")}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
