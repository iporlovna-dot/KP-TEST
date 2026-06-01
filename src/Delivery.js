
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

const STORAGE_KEY = "delivery_items";

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

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
    if (editId !== null) {
      setItems(its => its.map(it => it.id === editId ? { ...it, ...form, amount: parseFloat(form.amount) } : it));
      setEditId(null);
    } else {
      setItems(its => [{ id: Date.now(), ...form, amount: parseFloat(form.amount) }, ...its]);
    }
    setForm(empty);
  };

  const startEdit = (it) => {
    setEditId(it.id);
    setForm({ date: it.date, supplier: it.supplier, amount: it.amount, note: it.note });
  };

  const cancelEdit = () => { setEditId(null); setForm(empty); };

  const del = (id) => { if (window.confirm("Удалить запись?")) setItems(its => its.filter(it => it.id !== id)); };

  const suppliers = [...new Set(items.map(it => it.supplier))].filter(Boolean);

  const filtered = items.filter(it => {
    const matchS = !filterSupplier || it.supplier === filterSupplier;
    const matchFrom = !filterFrom || it.date >= filterFrom;
    const matchTo = !filterTo || it.date <= filterTo;
    return matchS && matchFrom && matchTo;
  });

  const total = filtered.reduce((s, it) => s + (parseFloat(it.amount) || 0), 0);

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered.map(i => ({
      "Дата": i.date.split("-").reverse().join("."),
      "Поставщик": i.supplier,
      "Сумма, руб.": i.amount,
      "Примечание": i.note || ""
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Доставки");
    XLSX.writeFile(wb, "Доставки.xlsx");
  };

  const inp = { padding: "6px 10px", border: "1px solid #ccc", borderRadius: 4, fontSize: 13, boxSizing: "border-box", width: "100%" };
  const lbl = { fontSize: 12, color: "#666", marginBottom: 3, display: "block" };
  const btn = { padding: "7px 16px", borderRadius: 4, border: "1px solid #ccc", background: "#fff", cursor: "pointer", fontSize: 13 };
  const card = { background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, padding: "16px 20px", marginBottom: 16 };

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Всего доставок", value: filtered.length, color: "#1a5fa8" },
          { label: "Сумма (фильтр)", value: total.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " руб.", color: "#2e7d32" },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, minWidth: 140, background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, padding: "12px 16px" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#888" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={card}>
        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>{editId !== null ? "Редактировать доставку" : "Добавить доставку"}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 2fr", gap: 10, marginBottom: 10 }}>
          <div>
            <label style={lbl}>Дата</label>
            <input type="date" style={inp} value={form.date} onChange={e => setF("date", e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Поставщик</label>
            <input style={inp} value={form.supplier} onChange={e => setF("supplier", e.target.value)} placeholder="Название поставщика" />
          </div>
          <div>
            <label style={lbl}>Сумма, руб.</label>
            <input type="number" style={inp} value={form.amount} onChange={e => setF("amount", e.target.value)} placeholder="0.00" />
          </div>
          <div>
            <label style={lbl}>Примечание</label>
            <input style={inp} value={form.note} onChange={e => setF("note", e.target.value)} placeholder="Комментарий (необязательно)" />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={addOrUpdate} style={{ ...btn, background: "#1a5fa8", color: "#fff", borderColor: "#1a5fa8", fontWeight: 600 }}>
            {editId !== null ? "Сохранить" : "+ Добавить"}
          </button>
          {editId !== null && <button onClick={cancelEdit} style={btn}>Отмена</button>}
        </div>
      </div>

      <div style={{ ...card, padding: "12px 20px" }}>
        <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Фильтр</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto auto", gap: 10, alignItems: "flex-end" }}>
          <div>
            <label style={lbl}>Поставщик</label>
            <select style={inp} value={filterSupplier} onChange={e => setFilterSupplier(e.target.value)}>
              <option value="">Все</option>
              {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Дата от</label>
            <input type="date" style={inp} value={filterFrom} onChange={e => setFilterFrom(e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Дата до</label>
            <input type="date" style={inp} value={filterTo} onChange={e => setFilterTo(e.target.value)} />
          </div>
          <button onClick={() => { setFilterSupplier(""); setFilterFrom(""); setFilterTo(""); }}
            style={{ ...btn, height: 34, padding: "0 14px" }}>Сбросить</button>
          <button onClick={exportExcel} style={{ ...btn, height: 34, padding: "0 14px", color: "#2e7d32", borderColor: "#2e7d32" }}>⬇ Excel</button>
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "#aaa", fontSize: 14 }}>
            {items.length === 0 ? "Доставок пока нет. Добавьте первую запись." : "Ничего не найдено."}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#444" }}>Дата</th>
                <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#444" }}>Поставщик</th>
                <th style={{ textAlign: "right", padding: "10px 14px", fontWeight: 600, color: "#444" }}>Сумма, руб.</th>
                <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#444" }}>Примечание</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((it, idx) => (
                <tr key={it.id} style={{ borderTop: "1px solid #f0f0f0", background: idx % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding: "10px 14px" }}>{it.date.split("-").reverse().join(".")}</td>
                  <td style={{ padding: "10px 14px", fontWeight: 500 }}>{it.supplier}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "#2e7d32" }}>
                    {parseFloat(it.amount).toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: "10px 14px", color: "#888" }}>{it.note || "—"}</td>
                  <td style={{ padding: "10px 8px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                      <button onClick={() => startEdit(it)} style={{ ...btn, padding: "3px 8px", fontSize: 12 }}>✎</button>
                      <button onClick={() => del(it.id)} style={{ ...btn, padding: "3px 8px", fontSize: 12, color: "#c00" }}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "#f0f4ff", borderTop: "2px solid #ddd" }}>
                <td colSpan={2} style={{ padding: "10px 14px", fontWeight: 600 }}>Итого по фильтру:</td>
                <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "#1a5fa8" }}>
                  {total.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} руб.
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}