import { useState, useEffect } from "react";

const STORAGE_KEY = "tasks_items";

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function save(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

const empty = { title: "", deadline: "", priority: "medium", note: "" };

const PRIORITY = {
  high:   { label: "Высокий", color: "#c00",    bg: "#fff0f0" },
  medium: { label: "Средний", color: "#e65100", bg: "#fff8f0" },
  low:    { label: "Низкий",  color: "#2e7d32", bg: "#f0fff4" },
};

function daysLeft(deadline) {
  if (!deadline) return null;
  const diff = Math.ceil((new Date(deadline) - new Date().setHours(0,0,0,0)) / 86400000);
  return diff;
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
    if (editId !== null) {
      setItems(its => its.map(it => it.id === editId ? { ...it, ...form } : it));
      setEditId(null);
    } else {
      setItems(its => [{ id: Date.now(), ...form, done: false }, ...its]);
    }
    setForm(empty);
  };

  const startEdit = (it) => {
    setEditId(it.id);
    setForm({ title: it.title, deadline: it.deadline, priority: it.priority, note: it.note });
  };

  const cancelEdit = () => { setEditId(null); setForm(empty); };
  const toggle = (id) => setItems(its => its.map(it => it.id === id ? { ...it, done: !it.done } : it));
  const del = (id) => { if (window.confirm("Удалить задачу?")) setItems(its => its.filter(it => it.id !== id)); };

  const today = new Date().setHours(0,0,0,0);

  const filtered = items.filter(it => {
    if (filter === "active") return !it.done;
    if (filter === "done") return it.done;
    if (filter === "overdue") return !it.done && it.deadline && new Date(it.deadline) < today;
    return true;
  }).sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const pa = { high: 0, medium: 1, low: 2 };
    return pa[a.priority] - pa[b.priority];
  });

  const overdueCount = items.filter(it => !it.done && it.deadline && new Date(it.deadline) < today).length;
  const activeCount = items.filter(it => !it.done).length;
  const doneCount = items.filter(it => it.done).length;

  const inp = { padding: "6px 10px", border: "1px solid #ccc", borderRadius: 4, fontSize: 13, boxSizing: "border-box", width: "100%" };
  const lbl = { fontSize: 12, color: "#666", marginBottom: 3, display: "block" };
  const btn = { padding: "7px 16px", borderRadius: 4, border: "1px solid #ccc", background: "#fff", cursor: "pointer", fontSize: 13 };
  const card = { background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, padding: "16px 20px", marginBottom: 16 };

  return (
    <div>
      {/* Статистика */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Активных", value: activeCount, color: "#1a5fa8" },
          { label: "Выполнено", value: doneCount, color: "#2e7d32" },
          { label: "Просрочено", value: overdueCount, color: "#c00" },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, minWidth: 100, background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, padding: "12px 16px" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#888" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Форма */}
      <div style={card}>
        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>{editId !== null ? "Редактировать задачу" : "Новая задача"}</p>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
          <div>
            <label style={lbl}>Название задачи</label>
            <input style={inp} value={form.title} onChange={e => setF("title", e.target.value)} placeholder="Что нужно сделать?" />
          </div>
          <div>
            <label style={lbl}>Дедлайн</label>
            <input type="date" style={inp} value={form.deadline} onChange={e => setF("deadline", e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Приоритет</label>
            <select style={inp} value={form.priority} onChange={e => setF("priority", e.target.value)}>
              <option value="high">🔴 Высокий</option>
              <option value="medium">🟠 Средний</option>
              <option value="low">🟢 Низкий</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={lbl}>Примечание</label>
          <input style={inp} value={form.note} onChange={e => setF("note", e.target.value)} placeholder="Комментарий (необязательно)" />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={addOrUpdate} style={{ ...btn, background: "#1a5fa8", color: "#fff", borderColor: "#1a5fa8", fontWeight: 600 }}>
            {editId !== null ? "Сохранить" : "+ Добавить"}
          </button>
          {editId !== null && <button onClick={cancelEdit} style={btn}>Отмена</button>}
        </div>
      </div>

      {/* Фильтр */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {[["all","Все"],["active","Активные"],["overdue","Просроченные"],["done","Выполненные"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            style={{ ...btn, borderColor: filter===v?"#1a5fa8":"#ccc", color: filter===v?"#1a5fa8":"#333", fontWeight: filter===v?600:400 }}>
            {l}
          </button>
        ))}
      </div>

      {/* Список задач */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.length === 0 ? (
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, padding: 32, textAlign: "center", color: "#aaa", fontSize: 14 }}>
            {items.length === 0 ? "Задач пока нет. Добавьте первую!" : "Ничего не найдено."}
          </div>
        ) : filtered.map((it) => {
          const dl = daysLeft(it.deadline);
          const overdue = !it.done && dl !== null && dl < 0;
          const soon = !it.done && dl !== null && dl >= 0 && dl <= 2;
          const pr = PRIORITY[it.priority];

          let deadlineText = "";
          let deadlineColor = "#888";
          if (it.deadline) {
            if (dl === 0) { deadlineText = "Сегодня"; deadlineColor = "#e65100"; }
            else if (dl === 1) { deadlineText = "Завтра"; deadlineColor = "#e65100"; }
            else if (dl < 0) { deadlineText = `Просрочено на ${Math.abs(dl)} дн.`; deadlineColor = "#c00"; }
            else { deadlineText = `${it.deadline.split("-").reverse().join(".")} (${dl} дн.)`; }
          }

          return (
            <div key={it.id} style={{
              background: it.done ? "#f9f9f9" : overdue ? "#fff5f5" : soon ? "#fffbf0" : "#fff",
              border: `1px solid ${overdue ? "#ffcccc" : soon ? "#ffe0b2" : "#e0e0e0"}`,
              borderLeft: `4px solid ${it.done ? "#ccc" : pr.color}`,
              borderRadius: 8, padding: "12px 16px",
              opacity: it.done ? 0.7 : 1,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <input type="checkbox" checked={it.done} onChange={() => toggle(it.id)}
                  style={{ marginTop: 3, cursor: "pointer", width: 16, height: 16 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600, fontSize: 14, textDecoration: it.done ? "line-through" : "none", color: it.done ? "#aaa" : "#222" }}>
                      {it.title}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: pr.color, background: pr.bg, padding: "2px 8px", borderRadius: 4 }}>
                      {pr.label}
                    </span>
                  </div>
                  {it.note && <div style={{ fontSize: 12, color: "#888", marginTop: 3 }}>{it.note}</div>}
                  {it.deadline && (
                    <div style={{ fontSize: 12, color: deadlineColor, marginTop: 4, fontWeight: overdue||soon ? 600 : 400 }}>
                      📅 {deadlineText}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {!it.done && <button onClick={() => startEdit(it)} style={{ ...btn, padding: "3px 8px", fontSize: 12 }}>✎</button>}
                  <button onClick={() => del(it.id)} style={{ ...btn, padding: "3px 8px", fontSize: 12, color: "#c00" }}>✕</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}