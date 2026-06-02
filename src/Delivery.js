import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

const STORAGE_KEY = "delivery_items";
function load() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } }
function save(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
const empty = { date: "", supplier: "", amount: "", note: "" };

export default function Delivery() {
  const [items, setItems] = useState(load);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [filterSupplier, setFilterSupplier] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  useEffect(() => { save(items); }, [items]);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const addOrUpdate = () => {
    if (!form.date || !form.supplier || !form.amount) return;
    if (editId !== null) { setItems(its => its.map(it => it.id === editId ? { ...it, ...form, amount: parseFloat(form.amount) } : it)); setEditId(null); }
    else { setItems(its => [{ id: Date.now(), ...form, amount: parseFloat(form.amount) }, ...its]); }
    setForm(empty);
  };
  const startEdit = (it) => { setEditId(it.id); setForm({ date: it.date, supplier: it.supplier, amount: it.amount, note: it.note }); };
  const cancelEdit = () => { setEditId(null); setForm(empty); };
  const del = (id) => { if (window.confirm("РЈРґР°Р»РёС‚СЊ Р·Р°РїРёСЃСЊ?")) setItems(its => its.filter(it => it.id !== id)); };

  const suppliers = [...new Set(items.map(it => it.supplier))].filter(Boolean);
  const filtered = items.filter(it => {
    const matchS = !filterSupplier || it.supplier === filterSupplier;
    const matchFrom = !filterFrom || it.date >= filterFrom;
    const matchTo = !filterTo || it.date <= filterTo;
    return matchS && matchFrom && matchTo;
  });
  const total = filtered.reduce((s, it) => s + (parseFloat(it.amount) || 0), 0);

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered.map(i => ({ "Р”Р°С‚Р°": i.date.split("-").reverse().join("."), "РџРѕСЃС‚Р°РІС‰РёРє": i.supplier, "РЎСѓРјРјР°": i.amount, "РџСЂРёРјРµС‡Р°РЅРёРµ": i.note || "" })));
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Р”РѕСЃС‚Р°РІРєРё"); XLSX.writeFile(wb, "Р”РѕСЃС‚Р°РІРєРё.xlsx");
  };

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
        {[{ label: "Р’СЃРµРіРѕ РґРѕСЃС‚Р°РІРѕРє", value: filtered.length, color: "#4dabf7" }, { label: "РЎСѓРјРјР° (С„РёР»СЊС‚СЂ)", value: total.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " СЂСѓР±.", color: "#40c057" }].map((s, i) => (
          <div key={i} style={{ flex: 1, minWidth: 140, background: "#1e2130", border: "1px solid #2d3354", borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#7c8db5" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={S.card}>
        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: "#e2e8f0" }}>{editId !== null ? "Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ РґРѕСЃС‚Р°РІРєСѓ" : "Р”РѕР±Р°РІРёС‚СЊ РґРѕСЃС‚Р°РІРєСѓ"}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 2fr", gap: 10, marginBottom: 10 }}>
          <div><label style={S.lbl}>Р”Р°С‚Р°</label><input type="date" style={S.inp} value={form.date} onChange={e => setF("date", e.target.value)} /></div>
          <div><label style={S.lbl}>РџРѕСЃС‚Р°РІС‰РёРє</label><input style={S.inp} value={form.supplier} onChange={e => setF("supplier", e.target.value)} placeholder="РќР°Р·РІР°РЅРёРµ РїРѕСЃС‚Р°РІС‰РёРєР°" /></div>
          <div><label style={S.lbl}>РЎСѓРјРјР°, СЂСѓР±.</label><input type="number" style={S.inp} value={form.amount} onChange={e => setF("amount", e.target.value)} placeholder="0.00" /></div>
          <div><label style={S.lbl}>РџСЂРёРјРµС‡Р°РЅРёРµ</label><input style={S.inp} value={form.note} onChange={e => setF("note", e.target.value)} placeholder="РљРѕРјРјРµРЅС‚Р°СЂРёР№" /></div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={addOrUpdate} style={S.btnP}>{editId !== null ? "РЎРѕС…СЂР°РЅРёС‚СЊ" : "+ Р”РѕР±Р°РІРёС‚СЊ"}</button>
          {editId !== null && <button onClick={cancelEdit} style={S.btn}>РћС‚РјРµРЅР°</button>}
        </div>
      </div>

      <div style={{ ...S.card, padding: "12px 20px" }}>
        <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, color: "#e2e8f0" }}>Р¤РёР»СЊС‚СЂ</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto auto", gap: 10, alignItems: "flex-end" }}>
          <div>
            <label style={S.lbl}>РџРѕСЃС‚Р°РІС‰РёРє</label>
            <select style={S.inp} value={filterSupplier} onChange={e => setFilterSupplier(e.target.value)}>
              <option value="">Р’СЃРµ</option>
              {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div><label style={S.lbl}>Р”Р°С‚Р° РѕС‚</label><input type="date" style={S.inp} value={filterFrom} onChange={e => setFilterFrom(e.target.value)} /></div>
          <div><label style={S.lbl}>Р”Р°С‚Р° РґРѕ</label><input type="date" style={S.inp} value={filterTo} onChange={e => setFilterTo(e.target.value)} /></div>
          <button onClick={() => { setFilterSupplier(""); setFilterFrom(""); setFilterTo(""); }} style={{ ...S.btn, height: 36 }}>РЎР±СЂРѕСЃРёС‚СЊ</button>
          <button onClick={exportExcel} style={{ ...S.btn, height: 36, color: "#40c057", borderColor: "#40c057" }}>в¬‡ Excel</button>
        </div>
      </div>

      <div style={{ background: "#1e2130", border: "1px solid #2d3354", borderRadius: 10, overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "#4a5568", fontSize: 14 }}>{items.length === 0 ? "Р”РѕСЃС‚Р°РІРѕРє РїРѕРєР° РЅРµС‚." : "РќРёС‡РµРіРѕ РЅРµ РЅР°Р№РґРµРЅРѕ."}</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#252a3d" }}>
                {["Р”Р°С‚Р°","РџРѕСЃС‚Р°РІС‰РёРє","РЎСѓРјРјР°, СЂСѓР±.","РџСЂРёРјРµС‡Р°РЅРёРµ",""].map((h,i) => <th key={i} style={{ textAlign: i===2?"right":i===0||i===1?"left":"center", padding: "10px 14px", fontWeight: 600, color: "#7c8db5" }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map((it, idx) => (
                <tr key={it.id} style={{ borderTop: "1px solid #2d3354", background: idx % 2 === 0 ? "#1e2130" : "#1a1d2e" }}>
                  <td style={{ padding: "10px 14px", color: "#a0aec0" }}>{it.date.split("-").reverse().join(".")}</td>
                  <td style={{ padding: "10px 14px", fontWeight: 500, color: "#e2e8f0" }}>{it.supplier}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "#40c057" }}>{parseFloat(it.amount).toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style={{ padding: "10px 14px", color: "#7c8db5" }}>{it.note || "вЂ”"}</td>
                  <td style={{ padding: "10px 8px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                      <button onClick={() => startEdit(it)} style={{ ...S.btn, padding: "3px 8px", fontSize: 12 }}>вњЋ</button>
                      <button onClick={() => del(it.id)} style={{ ...S.btn, padding: "3px 8px", fontSize: 12, color: "#f03e3e" }}>вњ•</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "#252a3d", borderTop: "2px solid #2d3354" }}>
                <td colSpan={2} style={{ padding: "10px 14px", fontWeight: 600, color: "#e2e8f0" }}>РС‚РѕРіРѕ РїРѕ С„РёР»СЊС‚СЂСѓ:</td>
                <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "#4dabf7" }}>{total.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} СЂСѓР±.</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}
