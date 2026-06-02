import { useState, useEffect } from "react";

const STORAGE_KEY = "tasks_items";
function load() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } }
function save(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
const empty = { title: "", deadline: "", priority: "medium", note: "" };

const PRIORITY = {
  high:   { label: "Р’С‹СЃРѕРєРёР№", color: "#f03e3e", bg: "#f03e3e22" },
  medium: { label: "РЎСЂРµРґРЅРёР№", color: "#f59f00", bg: "#f59f0022" },
  low:    { label: "РќРёР·РєРёР№",  color: "#40c057", bg: "#40c05722" },
};

function daysLeft(deadline) {
  if (!deadline) return null;
  return Math.ceil((new Date(deadline) - new Date().setHours(0,0,0,0)) / 86400000);
}

export default function Tasks() {
  const [items, setItems] = useState(load);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => { save(items); }, [items]);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const addOrUpdate = () => {
    if (!form.title.trim()) return;
    if (editId !== null) { setItems(its => its.map(it => it.id === editId ? { ...it, ...form } : it)); setEditId(null); }
    else { setItems(its => [{ id: Date.now(), ...form, done: false }, ...its]); }
    setForm(empty);
  };
  const startEdit = (it) => { setEditId(it.id); setForm({ title: it.title, deadline: it.deadline, priority: it.priority, note: it.note }); };
  const cancelEdit = () => { setEditId(null); setForm(empty); };
  const toggle = (id) => setItems(its => its.map(it => it.id === id ? { ...it, done: !it.done } : it));
  const del = (id) => { if (window.confirm("РЈРґР°Р»РёС‚СЊ Р·Р°РґР°С‡Сѓ?")) setItems(its => its.filter(it => it.id !== id)); };

  const today = new Date().setHours(0,0,0,0);
  const filtered = items.filter(it => {
    if (filter === "active") return !it.done;
    if (filter === "done") return it.done;
    if (filter === "overdue") return !it.done && it.deadline && new Date(it.deadline) < today;
    return true;
  }).sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return { high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority];
  });

  const overdueCount = items.filter(t => !t.done && t.deadline && new Date(t.deadline) < today).length;
  const activeCount = items.filter(t => !t.done).length;
  const doneCount = items.filter(t => t.done).length;

  const S = {
    card: { background: "#1e2130", border: "1px solid #2d3354", borderRadius: 10, padding: "16px 20px", marginBottom: 16 },
    inp: { padding: "8px 12px", border: "1px solid #2d3354", borderRadius: 8, fontSize: 13, background: "#252a3d", color: "#e2e8f0", boxSizing: "border-box", width: "100%" },
    btn: { padding: "7px 16px", borderRadius: 8, border: "1px solid #2d3354", background: "#252a3d", cursor: "pointer", fontSize: 13, color: "#e2e8f0" },
    btnP: { padding: "7px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#3b5bdb,#7048e8)", cursor: "pointer", fontSize: 13, color: "#fff", fontWeight: 600 },
    lbl: { fontSize: 12, color: "#7c8db5", marginBottom: 4, display: "block" },
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[{ label: "РђРєС‚РёРІРЅС‹С…", value: activeCount, color: "#4dabf7" }, { label: "Р’С‹РїРѕР»РЅРµРЅРѕ", value: doneCount, color: "#40c057" }, { label: "РџСЂРѕСЃСЂРѕС‡РµРЅРѕ", value: overdueCount, color: "#f03e3e" }].map((s, i) => (
          <div key={i} style={{ flex: 1, minWidth: 100, background: "#1e2130", border: "1px solid #2d3354", borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#7c8db5" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={S.card}>
        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: "#e2e8f0" }}>{editId !== null ? "Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ Р·Р°РґР°С‡Сѓ" : "РќРѕРІР°СЏ Р·Р°РґР°С‡Р°"}</p>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
          <div><label style={S.lbl}>РќР°Р·РІР°РЅРёРµ Р·Р°РґР°С‡Рё</label><input style={S.inp} value={form.title} onChange={e => setF("title", e.target.value)} placeholder="Р§С‚Рѕ РЅСѓР¶РЅРѕ СЃРґРµР»Р°С‚СЊ?" /></div>
          <div><label style={S.lbl}>Р”РµРґР»Р°Р№РЅ</label><input type="date" style={S.inp} value={form.deadline} onChange={e => setF("deadline", e.target.value)} /></div>
          <div>
            <label style={S.lbl}>РџСЂРёРѕСЂРёС‚РµС‚</label>
            <select style={S.inp} value={form.priority} onChange={e => setF("priority", e.target.value)}>
              <option value="high">рџ”ґ Р’С‹СЃРѕРєРёР№</option>
              <option value="medium">рџџ  РЎСЂРµРґРЅРёР№</option>
              <option value="low">рџџў РќРёР·РєРёР№</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 10 }}><label style={S.lbl}>РџСЂРёРјРµС‡Р°РЅРёРµ</label><input style={S.inp} value={form.note} onChange={e => setF("note", e.target.value)} placeholder="РљРѕРјРјРµРЅС‚Р°СЂРёР№ (РЅРµРѕР±СЏР·Р°С‚РµР»СЊРЅРѕ)" /></div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={addOrUpdate} style={S.btnP}>{editId !== null ? "РЎРѕС…СЂР°РЅРёС‚СЊ" : "+ Р”РѕР±Р°РІРёС‚СЊ"}</button>
          {editId !== null && <button onClick={cancelEdit} style={S.btn}>РћС‚РјРµРЅР°</button>}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {[["all","Р’СЃРµ"],["active","РђРєС‚РёРІРЅС‹Рµ"],["overdue","РџСЂРѕСЃСЂРѕС‡РµРЅРЅС‹Рµ"],["done","Р’С‹РїРѕР»РЅРµРЅРЅС‹Рµ"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{ ...S.btn, borderColor: filter===v?"#748ffc":"#2d3354", color: filter===v?"#748ffc":"#a0aec0", fontWeight: filter===v?600:400 }}>{l}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.length === 0 ? (
          <div style={{ background: "#1e2130", border: "1px solid #2d3354", borderRadius: 10, padding: 32, textAlign: "center", color: "#4a5568", fontSize: 14 }}>
            {items.length === 0 ? "Р—Р°РґР°С‡ РїРѕРєР° РЅРµС‚. Р”РѕР±Р°РІСЊС‚Рµ РїРµСЂРІСѓСЋ!" : "РќРёС‡РµРіРѕ РЅРµ РЅР°Р№РґРµРЅРѕ."}
          </div>
        ) : filtered.map((it) => {
          const dl = daysLeft(it.deadline);
          const overdue = !it.done && dl !== null && dl < 0;
          const soon = !it.done && dl !== null && dl >= 0 && dl <= 2;
          const pr = PRIORITY[it.priority];
          let deadlineText = "", deadlineColor = "#7c8db5";
          if (it.deadline) {
            if (dl === 0) { deadlineText = "РЎРµРіРѕРґРЅСЏ"; deadlineColor = "#f59f00"; }
            else if (dl === 1) { deadlineText = "Р—Р°РІС‚СЂР°"; deadlineColor = "#f59f00"; }
            else if (dl < 0) { deadlineText = `РџСЂРѕСЃСЂРѕС‡РµРЅРѕ РЅР° ${Math.abs(dl)} РґРЅ.`; deadlineColor = "#f03e3e"; }
            else { deadlineText = `${it.deadline.split("-").reverse().join(".")} (${dl} РґРЅ.)`; }
          }
          return (
            <div key={it.id} style={{ background: it.done ? "#1a1d2e" : overdue ? "#2a1a1a" : soon ? "#2a2210" : "#1e2130", border: `1px solid ${overdue ? "#4a2020" : soon ? "#4a3a10" : "#2d3354"}`, borderLeft: `4px solid ${it.done ? "#4a5568" : pr.color}`, borderRadius: 10, padding: "12px 16px", opacity: it.done ? 0.6 : 1 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <input type="checkbox" checked={it.done} onChange={() => toggle(it.id)} style={{ marginTop: 3, cursor: "pointer", width: 16, height: 16 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600, fontSize: 14, textDecoration: it.done ? "line-through" : "none", color: it.done ? "#4a5568" : "#e2e8f0" }}>{it.title}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: pr.color, background: pr.bg, padding: "2px 8px", borderRadius: 6 }}>{pr.label}</span>
                  </div>
                  {it.note && <div style={{ fontSize: 12, color: "#7c8db5", marginTop: 3 }}>{it.note}</div>}
                  {it.deadline && <div style={{ fontSize: 12, color: deadlineColor, marginTop: 4, fontWeight: overdue||soon ? 600 : 400 }}>рџ“… {deadlineText}</div>}
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {!it.done && <button onClick={() => startEdit(it)} style={{ ...S.btn, padding: "3px 8px", fontSize: 12 }}>вњЋ</button>}
                  <button onClick={() => del(it.id)} style={{ ...S.btn, padding: "3px 8px", fontSize: 12, color: "#f03e3e" }}>вњ•</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
