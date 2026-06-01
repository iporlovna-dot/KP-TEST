import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

const STORAGE_KEY = "warehouse_items";

function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export default function Warehouse() {
  const [items, setItems] = useState(loadItems);
  const [form, setForm] = useState({ name: "", unit: "шт.", qty: "", min: "" });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => { saveItems(items); }, [items]);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addOrUpdate = () => {
    if (!form.name.trim()) return;
    if (editId !== null) {
      setItems(its => its.map(it => it.id === editId ? { ...it, ...form, qty: Number(form.qty), min: Number(form.min) } : it));
      setEditId(null);
    } else {
      setItems(its => [...its, { id: Date.now(), ...form, qty: Number(form.qty), min: Number(form.min) }]);
    }
    setForm({ name: "", unit: "шт.", qty: "", min: "" });
  };

  const startEdit = (it) => {
    setEditId(it.id);
    setForm({ name: it.name, unit: it.unit, qty: it.qty, min: it.min });
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ name: "", unit: "шт.", qty: "", min: "" });
  };

  const deleteItem = (id) => { if (window.confirm("Удалить товар?")) setItems(its => its.filter(it => it.id !== id)); };

  const updateQty = (id, delta) => {
    setItems(its => its.map(it => it.id === id ? { ...it, qty: Math.max(0, it.qty + delta) } : it));
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(items.map(i => ({
      "Название": i.name,
      "Ед. изм.": i.unit,
      "Количество": i.qty,
      "Мин. остаток": i.min || 0,
      "Статус": i.qty === 0 ? "Нет" : (i.min && i.qty <= i.min ? "Мало" : "В наличии")
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Склад");
    XLSX.writeFile(wb, "Склад.xlsx");
  };

  const filtered = items.filter(it => {
    const matchSearch = it.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || (filter === "low" && it.qty <= it.min && it.qty > 0) || (filter === "out" && it.qty === 0);
    return matchSearch && matchFilter;
  });

  const card = { background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, padding: "16px 20px", marginBottom: 16 };
  const inp = { padding: "6px 10px", border: "1px solid #ccc", borderRadius: 4, fontSize: 13, boxSizing: "border-box" };
  const btn = { padding: "7px 16px", borderRadius: 4, border: "1px solid #ccc", background: "#fff", cursor: "pointer", fontSize: 13 };
  const lbl = { fontSize: 12, color: "#666", marginBottom: 3, display: "block" };

  const statusColor = (it) => {
    if (it.qty === 0) return "#c00";
    if (it.min && it.qty <= it.min) return "#e65100";
    return "#2e7d32";
  };
  const statusText = (it) => {
    if (it.qty === 0) return "Нет в наличии";
    if (it.min && it.qty <= it.min) return "Мало";
    return "В наличии";
  };

  const totalItems = items.length;
  const outCount = items.filter(it => it.qty === 0).length;
  const lowCount = items.filter(it => it.min && it.qty <= it.min && it.qty > 0).length;

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Всего позиций", value: totalItems, color: "#1a5fa8" },
          { label: "Заканчивается", value: lowCount, color: "#e65100" },
          { label: "Нет в наличии", value: outCount, color: "#c00" },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, minWidth: 120, background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, padding: "12px 16px" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#888" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={card}>
        <p style={{ fontWeight: 500, marginBottom: 12, fontSize: 14 }}>{editId !== null ? "Редактировать товар" : "Добавить товар"}</p>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
          <div>
            <label style={lbl}>Название</label>
            <input style={{ ...inp, width: "100%" }} value={form.name} onChange={e => setF("name", e.target.value)} placeholder="Название товара" />
          </div>
          <div>
            <label style={lbl}>Ед. изм.</label>
            <input style={{ ...inp, width: "100%" }} value={form.unit} onChange={e => setF("unit", e.target.value)} placeholder="шт." />
          </div>
          <div>
            <label style={lbl}>Количество</label>
            <input type="number" style={{ ...inp, width: "100%" }} value={form.qty} onChange={e => setF("qty", e.target.value)} placeholder="0" />
          </div>
          <div>
            <label style={lbl}>Мин. остаток</label>
            <input type="number" style={{ ...inp, width: "100%" }} value={form.min} onChange={e => setF("min", e.target.value)} placeholder="0" />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={addOrUpdate} style={{ ...btn, background: "#1a5fa8", color: "#fff", borderColor: "#1a5fa8", fontWeight: 600 }}>
            {editId !== null ? "Сохранить" : "+ Добавить"}
          </button>
          {editId !== null && <button onClick={cancelEdit} style={btn}>Отмена</button>}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={exportExcel} style={{ ...btn, color: "#2e7d32", borderColor: "#2e7d32" }}>⬇ Excel</button>
        <input style={{ ...inp, flex: 1, minWidth: 180 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по названию..." />
        <div style={{ display: "flex", gap: 6 }}>
          {[["all","Все"],["low","Мало"],["out","Нет"]].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)} style={{ ...btn, borderColor: filter===v?"#1a5fa8":"#ccc", color: filter===v?"#1a5fa8":"#333", fontWeight: filter===v?600:400 }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "#aaa", fontSize: 14 }}>
            {items.length === 0 ? "Склад пустой. Добавьте первый товар." : "Ничего не найдено."}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#444" }}>Название</th>
                <th style={{ textAlign: "center", padding: "10px 8px", fontWeight: 600, color: "#444" }}>Ед.</th>
                <th style={{ textAlign: "center", padding: "10px 8px", fontWeight: 600, color: "#444" }}>Остаток</th>
                <th style={{ textAlign: "center", padding: "10px 8px", fontWeight: 600, color: "#444" }}>Мин.</th>
                <th style={{ textAlign: "center", padding: "10px 8px", fontWeight: 600, color: "#444" }}>Статус</th>
                <th style={{ textAlign: "center", padding: "10px 8px", fontWeight: 600, color: "#444" }}>Изменить</th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((it, idx) => (
                <tr key={it.id} style={{ borderTop: "1px solid #f0f0f0", background: idx % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 500 }}>{it.name}</td>
                  <td style={{ padding: "10px 8px", textAlign: "center", color: "#888" }}>{it.unit}</td>
                  <td style={{ padding: "10px 8px", textAlign: "center", fontWeight: 700, color: statusColor(it), fontSize: 15 }}>{it.qty}</td>
                  <td style={{ padding: "10px 8px", textAlign: "center", color: "#aaa" }}>{it.min || "—"}</td>
                  <td style={{ padding: "10px 8px", textAlign: "center" }}>
                    <span style={{ background: statusColor(it) + "18", color: statusColor(it), borderRadius: 4, padding: "3px 8px", fontSize: 12, fontWeight: 600 }}>
                      {statusText(it)}
                    </span>
                  </td>
                  <td style={{ padding: "10px 8px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 4, justifyContent: "center", alignItems: "center" }}>
                      <button onClick={() => updateQty(it.id, -1)} style={{ ...btn, padding: "3px 10px", fontSize: 16, color: "#c00" }}>−</button>
                      <button onClick={() => updateQty(it.id, 1)} style={{ ...btn, padding: "3px 10px", fontSize: 16, color: "#2e7d32" }}>+</button>
                    </div>
                  </td>
                  <td style={{ padding: "10px 8px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                      <button onClick={() => startEdit(it)} style={{ ...btn, padding: "3px 8px", fontSize: 12 }}>✎</button>
                      <button onClick={() => deleteItem(it.id)} style={{ ...btn, padding: "3px 8px", fontSize: 12, color: "#c00" }}>✕</button>
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