import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

const STORAGE_KEY = "warehouse_items";
function loadItems() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } }
function saveItems(items) { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }

export default function Warehouse() {
  const [items, setItems] = useState(loadItems);
  const [form, setForm] = useState({ name: "", unit: "С€С‚.", qty: "", min: "" });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => { saveItems(items); }, [items]);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const addOrUpdate = () => {
    if (!form.name.trim()) return;
    if (editId !== null) { setItems(its => its.map(it => it.id === editId ? { ...it, ...form, qty: Number(form.qty), min: Number(form.min) } : it)); setEditId(null); }
    else { setItems(its => [...its, { id: Date.now(), ...form, qty: Number(form.qty), min: Number(form.min) }]); }
    setForm({ name: "", unit: "С€С‚.", qty: "", min: "" });
  };
  const startEdit = (it) => { setEditId(it.id); setForm({ name: it.name, unit: it.unit, qty: it.qty, min: it.min }); };
  const cancelEdit = () => { setEditId(null); setForm({ name: "", unit: "С€С‚.", qty: "", min: "" }); };
  const deleteItem = (id) => { if (window.confirm("РЈРґР°Р»РёС‚СЊ С‚РѕРІР°СЂ?")) setItems(its => its.filter(it => it.id !== id)); };
  const updateQty = (id, delta) => { setItems(its => its.map(it => it.id === id ? { ...it, qty: Math.max(0, it.qty + delta) } : it)); };
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(items.map(i => ({ "РќР°Р·РІР°РЅРёРµ": i.name, "Р•Рґ.": i.unit, "РљРѕР»-РІРѕ": i.qty, "РњРёРЅ.": i.min || 0, "РЎС‚Р°С‚СѓСЃ": i.qty === 0 ? "РќРµС‚" : (i.min && i.qty <= i.min ? "РњР°Р»Рѕ" : "Р’ РЅР°Р»РёС‡РёРё") })));
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "РЎРєР»Р°Рґ"); XLSX.writeFile(wb, "РЎРєР»Р°Рґ.xlsx");
  };

  const filtered = items.filter(it => {
    const matchSearch = it.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || (filter === "low" && it.qty <= it.min && it.qty > 0) || (filter === "out" && it.qty === 0);
    return matchSearch && matchFilter;
  });

  const S = {
    card: { background: "#1e2130", border: "1px solid #2d3354", borderRadius: 10, padding: "16px 20px", marginBottom: 16 },
    inp: { padding: "8px 12px", border: "1px solid #2d3354", borderRadius: 8, fontSize: 13, background: "#252a3d", color: "#e2e8f0", boxSizing: "border-box" },
    btn: { padding: "7px 16px", borderRadius: 8, border: "1px solid #2d3354", background: "#252a3d", cursor: "pointer", fontSize: 13, color: "#e2e8f0" },
    btnP: { padding: "7px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#3b5bdb,#7048e8)", cursor: "pointer", fontSize: 13, color: "#fff", fontWeight: 600 },
    lbl: { fontSize: 12, color: "#7c8db5", marginBottom: 4, display: "block" },
  };

  const statusColor = (it) => it.qty === 0 ? "#f03e3e" : (it.min && it.qty <= it.min) ? "#f59f00" : "#40c057";
  const statusText = (it) => it.qty === 0 ? "РќРµС‚" : (it.min && it.qty <= it.min) ? "РњР°Р»Рѕ" : "Р’ РЅР°Р»РёС‡РёРё";
  const outCount = items.filter(it => it.qty === 0).length;
  const lowCount = items.filter(it => it.min && it.qty <= it.min && it.qty > 0).length;

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[{ label: "Р’СЃРµРіРѕ РїРѕР·РёС†РёР№", value: items.length, color: "#4dabf7" }, { label: "Р—Р°РєР°РЅС‡РёРІР°РµС‚СЃСЏ", value: lowCount, color: "#f59f00" }, { label: "РќРµС‚ РІ РЅР°Р»РёС‡РёРё", value: outCount, color: "#f03e3e" }].map((s, i) => (
          <div key={i} style={{ flex: 1, minWidth: 120, background: "#1e2130", border: "1px solid #2d3354", borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#7c8db5" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={S.card}>
        <p style={{ fontWeight: 600, marginBottom: 12, fontSize: 14, color: "#e2e8f0" }}>{editId !== null ? "Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ С‚РѕРІР°СЂ" : "Р”РѕР±Р°РІРёС‚СЊ С‚РѕРІР°СЂ"}</p>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
          <div><label style={S.lbl}>РќР°Р·РІР°РЅРёРµ</label><input style={{ ...S.inp, width: "100%" }} value={form.name} onChange={e => setF("name", e.target.value)} placeholder="РќР°Р·РІР°РЅРёРµ С‚РѕРІР°СЂР°" /></div>
          <div><label style={S.lbl}>Р•Рґ. РёР·Рј.</label><input style={{ ...S.inp, width: "100%" }} value={form.unit} onChange={e => setF("unit", e.target.value)} /></div>
          <div><label style={S.lbl}>РљРѕР»РёС‡РµСЃС‚РІРѕ</label><input type="number" style={{ ...S.inp, width: "100%" }} value={form.qty} onChange={e => setF("qty", e.target.value)} placeholder="0" /></div>
          <div><label style={S.lbl}>РњРёРЅ. РѕСЃС‚Р°С‚РѕРє</label><input type="number" style={{ ...S.inp, width: "100%" }} value={form.min} onChange={e => setF("min", e.target.value)} placeholder="0" /></div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={addOrUpdate} style={S.btnP}>{editId !== null ? "РЎРѕС…СЂР°РЅРёС‚СЊ" : "+ Р”РѕР±Р°РІРёС‚СЊ"}</button>
          {editId !== null && <button onClick={cancelEdit} style={S.btn}>РћС‚РјРµРЅР°</button>}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={exportExcel} style={{ ...S.btn, color: "#40c057", borderColor: "#40c057" }}>в¬‡ Excel</button>
        <input style={{ ...S.inp, flex: 1, minWidth: 180 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="РџРѕРёСЃРє РїРѕ РЅР°Р·РІР°РЅРёСЋ..." />
        <div style={{ display: "flex", gap: 6 }}>
          {[["all","Р’СЃРµ"],["low","РњР°Р»Рѕ"],["out","РќРµС‚"]].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)} style={{ ...S.btn, borderColor: filter===v?"#748ffc":"#2d3354", color: filter===v?"#748ffc":"#a0aec0", fontWeight: filter===v?600:400 }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ background: "#1e2130", border: "1px solid #2d3354", borderRadius: 10, overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "#4a5568", fontSize: 14 }}>{items.length === 0 ? "РЎРєР»Р°Рґ РїСѓСЃС‚РѕР№. Р”РѕР±Р°РІСЊС‚Рµ РїРµСЂРІС‹Р№ С‚РѕРІР°СЂ." : "РќРёС‡РµРіРѕ РЅРµ РЅР°Р№РґРµРЅРѕ."}</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#252a3d" }}>
                {["РќР°Р·РІР°РЅРёРµ","Р•Рґ.","РћСЃС‚Р°С‚РѕРє","РњРёРЅ.","РЎС‚Р°С‚СѓСЃ","РР·РјРµРЅРёС‚СЊ",""].map((h,i) => <th key={i} style={{ textAlign: i===0?"left":"center", padding: "10px 10px", fontWeight: 600, color: "#7c8db5" }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map((it, idx) => (
                <tr key={it.id} style={{ borderTop: "1px solid #2d3354", background: idx % 2 === 0 ? "#1e2130" : "#1a1d2e" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 500, color: "#e2e8f0" }}>{it.name}</td>
                  <td style={{ padding: "10px 8px", textAlign: "center", color: "#7c8db5" }}>{it.unit}</td>
                  <td style={{ padding: "10px 8px", textAlign: "center", fontWeight: 700, color: statusColor(it), fontSize: 15 }}>{it.qty}</td>
                  <td style={{ padding: "10px 8px", textAlign: "center", color: "#4a5568" }}>{it.min || "вЂ”"}</td>
                  <td style={{ padding: "10px 8px", textAlign: "center" }}>
                    <span style={{ background: statusColor(it) + "22", color: statusColor(it), borderRadius: 6, padding: "3px 8px", fontSize: 12, fontWeight: 600 }}>{statusText(it)}</span>
                  </td>
                  <td style={{ padding: "10px 8px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                      <button onClick={() => updateQty(it.id, -1)} style={{ ...S.btn, padding: "3px 10px", fontSize: 16, color: "#f03e3e" }}>в€’</button>
                      <button onClick={() => updateQty(it.id, 1)} style={{ ...S.btn, padding: "3px 10px", fontSize: 16, color: "#40c057" }}>+</button>
                    </div>
                  </td>
                  <td style={{ padding: "10px 8px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                      <button onClick={() => startEdit(it)} style={{ ...S.btn, padding: "3px 8px", fontSize: 12 }}>вњЋ</button>
                      <button onClick={() => deleteItem(it.id)} style={{ ...S.btn, padding: "3px 8px", fontSize: 12, color: "#f03e3e" }}>вњ•</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
