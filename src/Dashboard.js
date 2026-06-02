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
    const today = new Date().setHours(0,0,0,0);
    const overdueTasks = tasks.filter(t => !t.done && t.deadline && new Date(t.deadline) < today);
    const activeTasks = tasks.filter(t => !t.done);
    const doneTasks = tasks.filter(t => t.done);
    const soonTasks = tasks.filter(t => { if(t.done||!t.deadline)return false; const d=Math.ceil((new Date(t.deadline)-today)/86400000); return d>=0&&d<=3; });
    const outOfStock = warehouse.filter(w => w.qty === 0);
    const lowStock = warehouse.filter(w => w.min && w.qty <= w.min && w.qty > 0);
    const deliveryTotal = deliveries.reduce((s,d) => s+(parseFloat(d.amount)||0), 0);
    const urgentTasks = [...activeTasks].filter(t=>t.deadline).sort((a,b)=>new Date(a.deadline)-new Date(b.deadline)).slice(0,5);
    setData({ overdueTasks, activeTasks, doneTasks, soonTasks, outOfStock, lowStock, deliveryTotal, deliveries, calcHistory, urgentTasks });
  }, []);

  const S = {
    card: { background:"#1e2130", border:"1px solid #2d3354", borderRadius:10, padding:"16px 20px", marginBottom:16 },
    btn: { padding:"5px 12px", borderRadius:8, border:"1px solid #2d3354", background:"#252a3d", cursor:"pointer", fontSize:12, color:"#748ffc" },
  };

  const StatBox = ({ label, value, color, tab, sublabel }) => (
    <div onClick={() => tab && setTab(tab)} style={{ flex:1, minWidth:120, background:"#1e2130", border:"1px solid #2d3354", borderRadius:10, padding:"14px 16px", cursor:tab?"pointer":"default" }}>
      <div style={{ fontSize:26, fontWeight:700, color }}>{value}</div>
      <div style={{ fontSize:12, color:"#7c8db5", marginTop:2 }}>{label}</div>
      {sublabel && <div style={{ fontSize:11, color:"#4a5568", marginTop:1 }}>{sublabel}</div>}
    </div>
  );

  return (
    <div>
      <p style={{ fontSize:13, color:"#7c8db5", marginBottom:20 }}>
        {new Date().toLocaleDateString("ru-RU", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}
      </p>
      <div style={{ display:"flex", gap:12, marginBottom:16, flexWrap:"wrap" }}>
        <StatBox label="Р С’Р С”РЎвЂљР С‘Р Р†Р Р…РЎвЂ№РЎвЂ¦ Р В·Р В°Р Т‘Р В°РЎвЂЎ" value={data.activeTasks?.length||0} color="#4dabf7" tab="tasks"/>
        <StatBox label="Р СџРЎР‚Р С•РЎРѓРЎР‚Р С•РЎвЂЎР ВµР Р…Р С•" value={data.overdueTasks?.length||0} color="#f03e3e" tab="tasks" sublabel="Р Р…Р В°Р В¶Р СР С‘РЎвЂљР Вµ РЎвЂЎРЎвЂљР С•Р В±РЎвЂ№ Р С•РЎвЂљР С”РЎР‚РЎвЂ№РЎвЂљРЎРЉ"/>
        <StatBox label="Р РЋР С”Р С•РЎР‚Р С• Р Т‘Р ВµР Т‘Р В»Р В°Р в„–Р Р…" value={data.soonTasks?.length||0} color="#f59f00" tab="tasks" sublabel="Р Р† РЎвЂљР ВµРЎвЂЎР ВµР Р…Р С‘Р Вµ 3 Р Т‘Р Р…Р ВµР в„–"/>
        <StatBox label="Р вЂ™РЎвЂ№Р С—Р С•Р В»Р Р…Р ВµР Р…Р С•" value={data.doneTasks?.length||0} color="#40c057" tab="tasks"/>
      </div>
      <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
        <StatBox label="Р СњР ВµРЎвЂљ Р Р…Р В° РЎРѓР С”Р В»Р В°Р Т‘Р Вµ" value={data.outOfStock?.length||0} color="#f03e3e" tab="warehouse"/>
        <StatBox label="Р вЂ”Р В°Р С”Р В°Р Р…РЎвЂЎР С‘Р Р†Р В°Р ВµРЎвЂљРЎРѓРЎРЏ" value={data.lowStock?.length||0} color="#f59f00" tab="warehouse"/>
        <StatBox label="Р РЋРЎС“Р СР СР В° Р Т‘Р С•РЎРѓРЎвЂљР В°Р Р†Р С•Р С”" value={(data.deliveryTotal||0).toLocaleString("ru-RU",{maximumFractionDigits:0})+" РІвЂљР…"} color="#4dabf7" tab="delivery"/>
        <StatBox label="Р В Р В°РЎРѓРЎвЂЎРЎвЂРЎвЂљР С•Р Р†" value={data.calcHistory?.length||0} color="#9775fa" tab="calc"/>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div style={S.card}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <p style={{ fontWeight:600, fontSize:14, margin:0, color:"#e2e8f0" }}>СЂСџвЂњвЂ№ Р РЋРЎР‚Р С•РЎвЂЎР Р…РЎвЂ№Р Вµ Р В·Р В°Р Т‘Р В°РЎвЂЎР С‘</p>
            <button onClick={() => setTab("tasks")} style={S.btn}>Р вЂ™РЎРѓР Вµ РІвЂ вЂ™</button>
          </div>
          {!data.urgentTasks?.length ? <p style={{ fontSize:13, color:"#4a5568" }}>Р СњР ВµРЎвЂљ Р В°Р С”РЎвЂљР С‘Р Р†Р Р…РЎвЂ№РЎвЂ¦ Р В·Р В°Р Т‘Р В°РЎвЂЎ</p>
          : data.urgentTasks.map(t => {
            const dl = Math.ceil((new Date(t.deadline)-new Date().setHours(0,0,0,0))/86400000);
            const color = dl<0?"#f03e3e":dl<=1?"#f59f00":"#a0aec0";
            return (
              <div key={t.id} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid #2d3354", fontSize:13 }}>
                <span style={{ color:"#cbd5e0" }}>{{high:"СЂСџвЂќТ‘",medium:"СЂСџСџВ ",low:"СЂСџСџСћ"}[t.priority]} {t.title}</span>
                <span style={{ color, fontWeight:600, whiteSpace:"nowrap", marginLeft:8 }}>{dl<0?`Р С—РЎР‚Р С•РЎРѓРЎР‚Р С•РЎвЂЎР ВµР Р…Р С• ${Math.abs(dl)}Р Т‘`:dl===0?"РЎРѓР ВµР С–Р С•Р Т‘Р Р…РЎРЏ":`${dl} Р Т‘Р Р….`}</span>
              </div>
            );
          })}
        </div>
        <div style={S.card}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <p style={{ fontWeight:600, fontSize:14, margin:0, color:"#e2e8f0" }}>СЂСџвЂњВ¦ Р РЋР С”Р В»Р В°Р Т‘ РІР‚вЂќ Р Р†Р Р…Р С‘Р СР В°Р Р…Р С‘Р Вµ</p>
            <button onClick={() => setTab("warehouse")} style={S.btn}>Р РЋР С”Р В»Р В°Р Т‘ РІвЂ вЂ™</button>
          </div>
          {!data.outOfStock?.length && !data.lowStock?.length
            ? <p style={{ fontSize:13, color:"#40c057" }}>РІСљвЂ¦ Р вЂ™РЎРѓРЎвЂ Р Р† Р Р…Р С•РЎР‚Р СР Вµ</p>
            : <>
              {data.outOfStock?.slice(0,3).map(w => <div key={w.id} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid #2d3354", fontSize:13 }}><span style={{ color:"#cbd5e0" }}>{w.name}</span><span style={{ color:"#f03e3e", fontWeight:600 }}>Р СњР ВµРЎвЂљ</span></div>)}
              {data.lowStock?.slice(0,3).map(w => <div key={w.id} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid #2d3354", fontSize:13 }}><span style={{ color:"#cbd5e0" }}>{w.name}</span><span style={{ color:"#f59f00", fontWeight:600 }}>{w.qty} {w.unit}</span></div>)}
            </>}
        </div>
        <div style={S.card}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <p style={{ fontWeight:600, fontSize:14, margin:0, color:"#e2e8f0" }}>СЂСџС™С™ Р СџР С•РЎРѓР В»Р ВµР Т‘Р Р…Р С‘Р Вµ Р Т‘Р С•РЎРѓРЎвЂљР В°Р Р†Р С”Р С‘</p>
            <button onClick={() => setTab("delivery")} style={S.btn}>Р вЂ™РЎРѓР Вµ РІвЂ вЂ™</button>
          </div>
          {!data.deliveries?.length ? <p style={{ fontSize:13, color:"#4a5568" }}>Р вЂќР С•РЎРѓРЎвЂљР В°Р Р†Р С•Р С” Р С—Р С•Р С”Р В° Р Р…Р ВµРЎвЂљ</p>
          : data.deliveries.slice(0,5).map(d => <div key={d.id} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid #2d3354", fontSize:13 }}><span style={{ color:"#a0aec0" }}>{d.date.split("-").reverse().join(".")} РІР‚вЂќ {d.supplier}</span><span style={{ color:"#40c057", fontWeight:600 }}>{parseFloat(d.amount).toLocaleString("ru-RU")} РІвЂљР…</span></div>)}
        </div>
        <div style={S.card}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <p style={{ fontWeight:600, fontSize:14, margin:0, color:"#e2e8f0" }}>СЂСџС™вЂє Р СџР С•РЎРѓР В»Р ВµР Т‘Р Р…Р С‘Р Вµ РЎР‚Р В°РЎРѓРЎвЂЎРЎвЂРЎвЂљРЎвЂ№</p>
            <button onClick={() => setTab("calc")} style={S.btn}>Р вЂ™РЎРѓР Вµ РІвЂ вЂ™</button>
          </div>
          {!data.calcHistory?.length ? <p style={{ fontSize:13, color:"#4a5568" }}>Р В Р В°РЎРѓРЎвЂЎРЎвЂРЎвЂљР С•Р Р† Р С—Р С•Р С”Р В° Р Р…Р ВµРЎвЂљ</p>
          : data.calcHistory.slice(0,5).map(c => <div key={c.id} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid #2d3354", fontSize:13 }}><span style={{ color:"#a0aec0" }}>{c.date} РІР‚вЂќ {c.desc}</span><span style={{ color:"#9775fa", fontWeight:600 }}>{parseFloat(c.total).toLocaleString("ru-RU")} РІвЂљР…</span></div>)}
        </div>
      </div>
    </div>
  );
}
