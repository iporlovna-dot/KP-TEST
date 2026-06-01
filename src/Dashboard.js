import { useState, useEffect } from "react";

function loadJSON(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
}

export default function Dashboard({ setTab }) {
  const [data, setData] = useState({});

  useEffect(() => {
    const tasks = loadJSON("tasks_items");
    const warehouse = loadJSON("warehouse_items");
    const deliveries = loadJSON("delivery_items");
    const calcHistory = loadJSON("delivery_calc_history");

    const today = new Date().setHours(0, 0, 0, 0);
    const overdueTasks = tasks.filter(t => !t.done && t.deadline && new Date(t.deadline) < today);
    const activeTasks = tasks.filter(t => !t.done);
    const doneTasks = tasks.filter(t => t.done);
    const soonTasks = tasks.filter(t => {
      if (t.done || !t.deadline) return false;
      const d = Math.ceil((new Date(t.deadline) - today) / 86400000);
      return d >= 0 && d <= 3;
    });
    const outOfStock = warehouse.filter(w => w.qty === 0);
    const lowStock = warehouse.filter(w => w.min && w.qty <= w.min && w.qty > 0);
    const deliveryTotal = deliveries.reduce((s, d) => s + (parseFloat(d.amount) || 0), 0);
    const lastDeliveries = [...deliveries].slice(0, 5);
    const calcTotal = calcHistory.reduce((s, c) => s + (parseFloat(c.total) || 0), 0);
    const urgentTasks = [...activeTasks]
      .filter(t => t.deadline)
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5);

    setData({ overdueTasks, activeTasks, doneTasks, soonTasks, outOfStock, lowStock, deliveryTotal, lastDeliveries, calcTotal, calcHistory, urgentTasks, warehouse, tasks });
  }, []);

  const card = { background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, padding: "16px 20px", marginBottom: 16 };
  const btn = { padding: "5px 12px", borderRadius: 4, border: "1px solid #ccc", background: "#fff", cursor: "pointer", fontSize: 12 };

  const StatBox = ({ label, value, color, tab, sublabel }) => (
    <div onClick={() => tab && setTab(tab)} style={{ flex: 1, minWidth: 120, background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, padding: "14px 16px", cursor: tab ? "pointer" : "default", transition: "box-shadow 0.15s" }}
      onMouseEnter={e => { if (tab) e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}>
      <div style={{ fontSize: 26, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{label}</div>
      {sublabel && <div style={{ fontSize: 11, color: "#aaa", marginTop: 1 }}>{sublabel}</div>}
    </div>
  );

  return (
    <div>
      <p style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>
        {new Date().toLocaleDateString("ru-RU", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
      </p>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <StatBox label="Активных задач" value={data.activeTasks?.length || 0} color="#1a5fa8" tab="tasks" />
        <StatBox label="Просрочено" value={data.overdueTasks?.length || 0} color="#c00" tab="tasks" sublabel="нажмите чтобы открыть" />
        <StatBox label="Скоро дедлайн" value={data.soonTasks?.length || 0} color="#e65100" tab="tasks" sublabel="в течение 3 дней" />
        <StatBox label="Выполнено задач" value={data.doneTasks?.length || 0} color="#2e7d32" tab="tasks" />
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <StatBox label="Нет на складе" value={data.outOfStock?.length || 0} color="#c00" tab="warehouse" />
        <StatBox label="Заканчивается" value={data.lowStock?.length || 0} color="#e65100" tab="warehouse" />
        <StatBox label="Сумма доставок" value={(data.deliveryTotal || 0).toLocaleString("ru-RU", { maximumFractionDigits: 0 }) + " ₽"} color="#1a5fa8" tab="delivery" />
        <StatBox label="Расчётов КП" value={data.calcHistory?.length || 0} color="#6a1b9a" tab="calc" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>📋 Срочные задачи</p>
            <button onClick={() => setTab("tasks")} style={{ ...btn, color: "#1a5fa8" }}>Все задачи →</button>
          </div>
          {!data.urgentTasks?.length ? (
            <p style={{ fontSize: 13, color: "#aaa" }}>Нет активных задач с дедлайном</p>
          ) : data.urgentTasks.map(t => {
            const dl = Math.ceil((new Date(t.deadline) - new Date().setHours(0,0,0,0)) / 86400000);
            const color = dl < 0 ? "#c00" : dl <= 1 ? "#e65100" : "#555";
            const PRIORITY = { high: "🔴", medium: "🟡", low: "🟢" };
            return (
              <div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f5f5f5", fontSize: 13 }}>
                <span>{PRIORITY[t.priority]} {t.title}</span>
                <span style={{ color, fontWeight: 600, whiteSpace: "nowrap", marginLeft: 8 }}>
                  {dl < 0 ? `просрочено ${Math.abs(dl)}д` : dl === 0 ? "сегодня" : `${dl} дн.`}
                </span>
              </div>
            );
          })}
        </div>

        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>📦 Склад — внимание</p>
            <button onClick={() => setTab("warehouse")} style={{ ...btn, color: "#1a5fa8" }}>Склад →</button>
          </div>
          {!data.outOfStock?.length && !data.lowStock?.length ? (
            <p style={{ fontSize: 13, color: "#2e7d32" }}>✅ Всё в норме</p>
          ) : (
            <>
              {data.outOfStock?.slice(0, 3).map(w => (
                <div key={w.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f5f5f5", fontSize: 13 }}>
                  <span>{w.name}</span>
                  <span style={{ color: "#c00", fontWeight: 600 }}>Нет в наличии</span>
                </div>
              ))}
              {data.lowStock?.slice(0, 3).map(w => (
                <div key={w.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f5f5f5", fontSize: 13 }}>
                  <span>{w.name}</span>
                  <span style={{ color: "#e65100", fontWeight: 600 }}>Осталось: {w.qty} {w.unit}</span>
                </div>
              ))}
            </>
          )}
        </div>

        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>🚚 Последние доставки</p>
            <button onClick={() => setTab("delivery")} style={{ ...btn, color: "#1a5fa8" }}>Все →</button>
          </div>
          {!data.lastDeliveries?.length ? (
            <p style={{ fontSize: 13, color: "#aaa" }}>Доставок пока нет</p>
          ) : data.lastDeliveries.map(d => (
            <div key={d.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f5f5f5", fontSize: 13 }}>
              <span>{d.date.split("-").reverse().join(".")} — {d.supplier}</span>
              <span style={{ color: "#2e7d32", fontWeight: 600 }}>{parseFloat(d.amount).toLocaleString("ru-RU")} ₽</span>
            </div>
          ))}
        </div>

        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>🚛 Последние расчёты</p>
            <button onClick={() => setTab("calc")} style={{ ...btn, color: "#1a5fa8" }}>Калькулятор →</button>
          </div>
          {!data.calcHistory?.length ? (
            <p style={{ fontSize: 13, color: "#aaa" }}>Расчётов пока нет</p>
          ) : data.calcHistory.slice(0, 5).map(c => (
            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f5f5f5", fontSize: 13 }}>
              <span>{c.date} — {c.desc}</span>
              <span style={{ color: "#6a1b9a", fontWeight: 600 }}>{parseFloat(c.total).toLocaleString("ru-RU")} ₽</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
