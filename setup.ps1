$utf8 = New-Object System.Text.UTF8Encoding $false

# App.js
[System.IO.File]::WriteAllText("$PSScriptRoot\src\App.js", @'
import { useState } from "react";
import Warehouse from "./Warehouse";
import Delivery from "./Delivery";
import Tasks from "./Tasks";
import DeliveryCalc from "./DeliveryCalc";
import Dashboard from "./Dashboard";
import Rotation from "./Rotation";

const ORGS = [
  { id: 0, label: "Организация 1", accent: "#1a5fa8", font: "'Georgia', serif", priceMultiplier: 1.0 },
  { id: 1, label: "Организация 2", accent: "#2e7d32", font: "'Trebuchet MS', sans-serif", priceMultiplier: 1.04 },
  { id: 2, label: "Организация 3", accent: "#6a1b9a", font: "'Palatino Linotype', serif", priceMultiplier: 1.06 },
];
const defaultOrgs = [
  { name: "", inn: "", address: "", phone: "", email: "", director: "" },
  { name: "", inn: "", address: "", phone: "", email: "", director: "" },
  { name: "", inn: "", address: "", phone: "", email: "", director: "" },
];
const defaultItems = [{ desc: "", qty: 1, unit: "шт.", price: "" }];

function formatNum(n) {
  return Number(n).toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function genKP(orgData, org, items, client, description, deadline, kpDate, ndsMode) {
  const accent = org.accent, font = org.font, mult = org.priceMultiplier;
  const rows = items.map((it) => {
    const p = parseFloat(it.price) || 0, q = parseFloat(it.qty) || 0;
    return { ...it, unitPrice: p * mult, total: p * mult * q };
  });
  const grandTotal = rows.reduce((s, r) => s + r.total, 0);
  const nds = ndsMode === "with" ? grandTotal * 0.05 : 0;
  const withNds = grandTotal + nds;
  const totalsBlock = ndsMode === "with"
    ? `<div class="totals">Итого без НДС: <b>${formatNum(grandTotal)} руб.</b></div><div class="totals">НДС 5%: <b>${formatNum(nds)} руб.</b></div><div class="totals grand">ИТОГО с НДС: ${formatNum(withNds)} руб.</div>`
    : `<div class="totals grand">ИТОГО (без НДС): ${formatNum(grandTotal)} руб.</div>`;
  const tableRows = rows.map((r, i) => `<tr style="background:${i%2===0?"#f9f9f9":"#fff"}"><td style="padding:6px 10px;border:1px solid #ddd;text-align:center">${i+1}</td><td style="padding:6px 10px;border:1px solid #ddd">${r.desc}</td><td style="padding:6px 10px;border:1px solid #ddd;text-align:center">${r.qty}</td><td style="padding:6px 10px;border:1px solid #ddd;text-align:center">${r.unit}</td><td style="padding:6px 10px;border:1px solid #ddd;text-align:right">${formatNum(r.unitPrice)}</td><td style="padding:6px 10px;border:1px solid #ddd;text-align:right">${formatNum(r.total)}</td></tr>`).join("");
  return `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><title>КП — ${orgData.name}</title><style>body{font-family:${font};font-size:13px;color:#222;margin:0;padding:0}.page{max-width:800px;margin:0 auto;padding:32px 40px}.header-bar{border-bottom:3px solid ${accent};padding-bottom:16px;margin-bottom:20px;display:flex;justify-content:space-between}.org-name{font-size:15px;font-weight:bold;color:${accent};margin-bottom:4px}.kp-title{text-align:center;font-size:17px;font-weight:bold;color:${accent};margin:18px 0 10px}.meta{font-size:12px;color:#555;margin-bottom:14px}.desc-block{margin-bottom:16px;line-height:1.6}table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:8px}th{background:${accent};color:#fff;padding:7px 10px;text-align:left;border:1px solid ${accent}}.totals{text-align:right;font-size:13px;margin:6px 0}.totals b,.grand{color:${accent}}.grand{font-size:15px;font-weight:bold;text-align:right;margin:6px 0}.footer{margin-top:30px;font-size:12px;color:#555;border-top:1px solid #ddd;padding-top:14px;display:flex;justify-content:space-between}.sign{margin-top:40px;font-size:12px}</style></head><body><div class="page"><div class="header-bar"><div><div class="org-name">${orgData.name}</div><div style="font-size:12px;color:#444">ИНН: ${orgData.inn}</div><div style="font-size:12px;color:#444">${orgData.address}</div><div style="font-size:12px;color:#444">${orgData.phone} | ${orgData.email}</div></div><div style="text-align:right;font-size:12px;color:#555"><div>Дата: ${kpDate}</div><div>№ КП: ${Math.floor(Math.random()*900)+100}/${new Date().getFullYear()}</div></div></div><div class="kp-title">КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ</div><div class="meta"><b>Заказчик:</b> ${client||"—"}<br><b>Срок выполнения:</b> ${deadline||"—"}</div><div class="desc-block"><b>Описание работ / услуг:</b><br>${description||"—"}</div><table><thead><tr><th style="width:32px">№</th><th>Наименование</th><th style="width:50px">Кол-во</th><th style="width:50px">Ед.</th><th style="width:90px">Цена, руб.</th><th style="width:100px">Сумма, руб.</th></tr></thead><tbody>${tableRows}</tbody></table>${totalsBlock}<div style="margin-top:16px;font-size:12px;color:#555">Предложение действительно 30 дней.</div><div class="sign"><p><b>Директор:</b> ${orgData.director} / ___________________</p><p style="color:#aaa">М.П.</p></div><div class="footer"><div>${orgData.name}</div><div>${orgData.address}</div><div>${orgData.phone}</div></div></div></body></html>`;
}

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [step, setStep] = useState(0);
  const [orgs, setOrgs] = useState(defaultOrgs);
  const [client, setClient] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [kpDate, setKpDate] = useState(new Date().toLocaleDateString("ru-RU"));
  const [items, setItems] = useState(defaultItems);
  const [ndsModes, setNdsModes] = useState(["without","without","without"]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [activePreview, setActivePreview] = useState(0);
  const [htmls, setHtmls] = useState(["","",""]);

  const getBadge = (v) => {
    try {
      if (v==="tasks") { const t=JSON.parse(localStorage.getItem("tasks_items")||"[]"); const n=t.filter(t=>!t.done&&t.deadline&&new Date(t.deadline)<new Date().setHours(0,0,0,0)).length; return n>0?n:null; }
      if (v==="warehouse") { const w=JSON.parse(localStorage.getItem("warehouse_items")||"[]"); const n=w.filter(i=>i.qty===0).length; return n>0?n:null; }
    } catch {} return null;
  };

  const updateOrg=(i,f,v)=>{const o=[...orgs];o[i]={...o[i],[f]:v};setOrgs(o);};
  const updateItem=(i,f,v)=>{const it=[...items];it[i]={...it[i],[f]:v};setItems(it);};
  const addItem=()=>setItems([...items,{desc:"",qty:1,unit:"шт.",price:""}]);
  const removeItem=(i)=>setItems(items.filter((_,idx)=>idx!==i));

  const generate=async()=>{
    setLoading(true);setGenerated(false);
    let descs=[description,description,description];
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:`Перефразируй описание тремя способами. JSON: {"v1":"...","v2":"...","v3":"..."}. Оригинал: "${description}"`}]})});
      const data=await res.json();
      const text=data.content?.map(b=>b.text||"").join("")||"";
      const parsed=JSON.parse(text.replace(/```json|```/g,"").trim());
      descs=[parsed.v1||description,parsed.v2||description,parsed.v3||description];
    } catch {}
    setHtmls(ORGS.map((org,i)=>genKP(orgs[i],org,items,client,descs[i],deadline,kpDate,ndsModes[i])));
    setLoading(false);setGenerated(true);setStep(2);
  };

  const downloadKP=(i)=>{const blob=new Blob([htmls[i]],{type:"text/html;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`КП_${orgs[i].name||"Орг_"+(i+1)}.html`;a.click();URL.revokeObjectURL(url);};

  const S = {
    page: { background:"#0f1117", minHeight:"100vh", padding:"24px 16px" },
    wrap: { maxWidth:900, margin:"0 auto", fontFamily:"Inter,Arial,sans-serif", display:"flex", gap:0 },
    nav: { width:180, minWidth:180, marginRight:20 },
    navLabel: { color:"#7c8db5", fontSize:11, fontWeight:600, letterSpacing:"1px", textTransform:"uppercase", margin:"0 0 10px 8px" },
    navActive: { background:"linear-gradient(135deg,#3b5bdb,#7048e8)", borderRadius:10, padding:"11px 14px", marginBottom:4, display:"flex", alignItems:"center", gap:10, cursor:"pointer", border:"none", width:"100%", textAlign:"left" },
    navItem: { background:"transparent", borderRadius:10, padding:"11px 14px", marginBottom:4, display:"flex", alignItems:"center", gap:10, cursor:"pointer", border:"none", width:"100%", textAlign:"left" },
    content: { flex:1, minWidth:0 },
    card: { background:"#1e2130", border:"1px solid #2d3354", borderRadius:10, padding:"16px 20px", marginBottom:16 },
    inp: { width:"100%", boxSizing:"border-box", marginBottom:8, padding:"8px 12px", border:"1px solid #2d3354", borderRadius:8, fontSize:13, background:"#252a3d", color:"#e2e8f0" },
    lbl: { display:"block", fontSize:12, color:"#7c8db5", marginBottom:4 },
    btn: { padding:"8px 18px", borderRadius:8, border:"1px solid #2d3354", background:"#252a3d", cursor:"pointer", fontSize:13, color:"#e2e8f0" },
    btnPrimary: { padding:"8px 18px", borderRadius:8, border:"none", background:"linear-gradient(135deg,#3b5bdb,#7048e8)", cursor:"pointer", fontSize:13, color:"#fff", fontWeight:600 },
  };

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <div style={S.nav}>
          <p style={S.navLabel}>Меню</p>
          {[["dashboard","🏠","Главная"],["kp","📄","Генератор КП"],["warehouse","📦","Склад"],["delivery","🚚","Доставки"],["tasks","📋","Задачи"],["calc","🚛","Калькулятор"],["rotation","🔄","Ротация"]].map(([v,ic,l])=>(
            <button key={v} onClick={()=>setTab(v)} style={tab===v?S.navActive:S.navItem}>
              <span style={{fontSize:16}}>{ic}</span>
              <span style={{color:tab===v?"#fff":"#a0aec0",fontSize:14,fontWeight:tab===v?600:400}}>{l}</span>
              {getBadge(v)?<span style={{marginLeft:"auto",background:"#e53e3e",color:"#fff",borderRadius:10,padding:"1px 7px",fontSize:11,fontWeight:700}}>{getBadge(v)}</span>:null}
            </button>
          ))}
        </div>

        <div style={S.content}>
          {tab==="dashboard"&&<Dashboard setTab={setTab}/>}
          {tab==="warehouse"&&<Warehouse/>}
          {tab==="delivery"&&<Delivery/>}
          {tab==="tasks"&&<Tasks/>}
          {tab==="calc"&&<DeliveryCalc/>}
          {tab==="rotation"&&<Rotation/>}
          {tab==="kp"&&(
            <>
              {step!==2&&(
                <>
                  <div style={{display:"flex",gap:8,marginBottom:20}}>
                    {["Данные КП","Организации"].map((t,i)=>(
                      <button key={i} onClick={()=>setStep(i)} style={{...S.btn,fontWeight:step===i?600:400,borderColor:step===i?"#3b5bdb":"#2d3354",color:step===i?"#748ffc":"#e2e8f0"}}>{i+1}. {t}</button>
                    ))}
                  </div>
                  {step===0&&(
                    <>
                      <div style={S.card}>
                        <p style={{fontWeight:600,marginBottom:12,fontSize:14,color:"#e2e8f0"}}>Общие сведения</p>
                        <label style={S.lbl}>Заказчик</label><input style={S.inp} value={client} onChange={e=>setClient(e.target.value)} placeholder="ООО «Заказчик»"/>
                        <label style={S.lbl}>Дата КП</label><input style={{...S.inp,width:"auto"}} value={kpDate} onChange={e=>setKpDate(e.target.value)}/>
                        <label style={S.lbl}>Срок выполнения</label><input style={S.inp} value={deadline} onChange={e=>setDeadline(e.target.value)} placeholder="например: 30 рабочих дней"/>
                        <label style={S.lbl}>Описание работ / услуг</label>
                        <textarea rows={4} style={{...S.inp,resize:"vertical"}} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Опишите работы..."/>
                      </div>
                      <div style={S.card}>
                        <p style={{fontWeight:600,marginBottom:12,fontSize:14,color:"#e2e8f0"}}>Позиции и цены</p>
                        <table style={{width:"100%",fontSize:12,borderCollapse:"collapse"}}>
                          <thead><tr style={{background:"#252a3d"}}>
                            <th style={{textAlign:"left",padding:"6px 8px",fontWeight:500,color:"#7c8db5"}}>Наименование</th>
                            <th style={{width:60,textAlign:"center",padding:"6px 8px",fontWeight:500,color:"#7c8db5"}}>Кол-во</th>
                            <th style={{width:70,textAlign:"center",padding:"6px 8px",fontWeight:500,color:"#7c8db5"}}>Ед.</th>
                            <th style={{width:110,textAlign:"right",padding:"6px 8px",fontWeight:500,color:"#7c8db5"}}>Цена (база)</th>
                            <th style={{width:30}}></th>
                          </tr></thead>
                          <tbody>
                            {items.map((it,i)=>(
                              <tr key={i}>
                                <td style={{padding:"3px 4px"}}><input value={it.desc} onChange={e=>updateItem(i,"desc",e.target.value)} style={{...S.inp,marginBottom:0}} placeholder="Название позиции"/></td>
                                <td style={{padding:"3px 4px"}}><input type="number" value={it.qty} onChange={e=>updateItem(i,"qty",e.target.value)} style={{...S.inp,marginBottom:0,textAlign:"center"}}/></td>
                                <td style={{padding:"3px 4px"}}><input value={it.unit} onChange={e=>updateItem(i,"unit",e.target.value)} style={{...S.inp,marginBottom:0}}/></td>
                                <td style={{padding:"3px 4px"}}><input type="number" value={it.price} onChange={e=>updateItem(i,"price",e.target.value)} style={{...S.inp,marginBottom:0,textAlign:"right"}} placeholder="0"/></td>
                                <td style={{padding:"3px 4px",textAlign:"center"}}>{items.length>1&&<button onClick={()=>removeItem(i)} style={{...S.btn,padding:"4px 8px",color:"#fc8181"}}>✕</button>}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <button onClick={addItem} style={{...S.btn,marginTop:10,color:"#748ffc"}}>+ Добавить позицию</button>
                      </div>
                      <div style={{textAlign:"right"}}><button onClick={()=>setStep(1)} style={S.btnPrimary}>Далее: Организации →</button></div>
                    </>
                  )}
                  {step===1&&(
                    <>
                      {ORGS.map((org,i)=>(
                        <div key={i} style={{...S.card,borderLeft:`4px solid ${org.accent}`}}>
                          <p style={{fontWeight:600,marginBottom:12,fontSize:14,color:org.accent}}>{org.label} <span style={{fontSize:11,color:"#7c8db5",fontWeight:400}}>(×{(org.priceMultiplier*100).toFixed(0)}%)</span></p>
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
                            {[["name","Название"],["inn","ИНН"],["address","Адрес"],["phone","Телефон"],["email","E-mail"],["director","Директор"]].map(([f,l])=>(
                              <div key={f}><label style={S.lbl}>{l}</label><input style={S.inp} value={orgs[i][f]} onChange={e=>updateOrg(i,f,e.target.value)}/></div>
                            ))}
                          </div>
                          <div style={{marginTop:10}}>
                            <label style={S.lbl}>НДС</label>
                            <div style={{display:"flex",gap:8}}>
                              {[["without","Без НДС"],["with","С НДС (5%)"]].map(([v,l])=>(
                                <button key={v} onClick={()=>{const m=[...ndsModes];m[i]=v;setNdsModes(m);}} style={{padding:"5px 14px",borderRadius:8,border:`1px solid ${ndsModes[i]===v?org.accent:"#2d3354"}`,background:ndsModes[i]===v?"#252a3d":"transparent",color:ndsModes[i]===v?org.accent:"#a0aec0",cursor:"pointer",fontSize:13}}>{l}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
                        <button onClick={()=>setStep(0)} style={S.btn}>← Назад</button>
                        <button onClick={generate} disabled={loading} style={S.btnPrimary}>{loading?"Генерация...":"Сгенерировать 3 КП →"}</button>
                      </div>
                    </>
                  )}
                </>
              )}
              {generated&&step===2&&(
                <>
                  <p style={{fontSize:13,color:"#7c8db5",marginBottom:16}}>3 КП готовы.</p>
                  <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
                    {ORGS.map((org,i)=>(<button key={i} onClick={()=>setActivePreview(i)} style={{...S.btn,fontWeight:activePreview===i?600:400,borderColor:activePreview===i?org.accent:"#2d3354",color:activePreview===i?org.accent:"#e2e8f0"}}>{orgs[i].name||org.label}</button>))}
                  </div>
                  <div style={{display:"flex",gap:8,marginBottom:12}}>
                    <button onClick={()=>downloadKP(activePreview)} style={S.btnPrimary}>⬇ Скачать КП {activePreview+1}</button>
                    <button onClick={()=>{setGenerated(false);setStep(0);}} style={S.btn}>← Назад</button>
                  </div>
                  <div style={{border:"1px solid #2d3354",borderRadius:10,overflow:"hidden"}}>
                    <iframe key={activePreview} srcDoc={htmls[activePreview]} style={{width:"100%",height:600,border:"none"}} title={`КП ${activePreview+1}`}/>
                  </div>
                  <p style={{fontSize:11,color:"#7c8db5",marginTop:8}}>Ctrl+P → «Сохранить как PDF» для сохранения.</p>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
'@, $utf8)

Write-Host "App.js готов" -ForegroundColor Green

# Dashboard.js
[System.IO.File]::WriteAllText("$PSScriptRoot\src\Dashboard.js", @'
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
        <StatBox label="Активных задач" value={data.activeTasks?.length||0} color="#4dabf7" tab="tasks"/>
        <StatBox label="Просрочено" value={data.overdueTasks?.length||0} color="#f03e3e" tab="tasks" sublabel="нажмите чтобы открыть"/>
        <StatBox label="Скоро дедлайн" value={data.soonTasks?.length||0} color="#f59f00" tab="tasks" sublabel="в течение 3 дней"/>
        <StatBox label="Выполнено" value={data.doneTasks?.length||0} color="#40c057" tab="tasks"/>
      </div>
      <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
        <StatBox label="Нет на складе" value={data.outOfStock?.length||0} color="#f03e3e" tab="warehouse"/>
        <StatBox label="Заканчивается" value={data.lowStock?.length||0} color="#f59f00" tab="warehouse"/>
        <StatBox label="Сумма доставок" value={(data.deliveryTotal||0).toLocaleString("ru-RU",{maximumFractionDigits:0})+" ₽"} color="#4dabf7" tab="delivery"/>
        <StatBox label="Расчётов" value={data.calcHistory?.length||0} color="#9775fa" tab="calc"/>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div style={S.card}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <p style={{ fontWeight:600, fontSize:14, margin:0, color:"#e2e8f0" }}>📋 Срочные задачи</p>
            <button onClick={() => setTab("tasks")} style={S.btn}>Все →</button>
          </div>
          {!data.urgentTasks?.length ? <p style={{ fontSize:13, color:"#4a5568" }}>Нет активных задач</p>
          : data.urgentTasks.map(t => {
            const dl = Math.ceil((new Date(t.deadline)-new Date().setHours(0,0,0,0))/86400000);
            const color = dl<0?"#f03e3e":dl<=1?"#f59f00":"#a0aec0";
            return (
              <div key={t.id} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid #2d3354", fontSize:13 }}>
                <span style={{ color:"#cbd5e0" }}>{{high:"🔴",medium:"🟠",low:"🟢"}[t.priority]} {t.title}</span>
                <span style={{ color, fontWeight:600, whiteSpace:"nowrap", marginLeft:8 }}>{dl<0?`просрочено ${Math.abs(dl)}д`:dl===0?"сегодня":`${dl} дн.`}</span>
              </div>
            );
          })}
        </div>
        <div style={S.card}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <p style={{ fontWeight:600, fontSize:14, margin:0, color:"#e2e8f0" }}>📦 Склад — внимание</p>
            <button onClick={() => setTab("warehouse")} style={S.btn}>Склад →</button>
          </div>
          {!data.outOfStock?.length && !data.lowStock?.length
            ? <p style={{ fontSize:13, color:"#40c057" }}>✅ Всё в норме</p>
            : <>
              {data.outOfStock?.slice(0,3).map(w => <div key={w.id} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid #2d3354", fontSize:13 }}><span style={{ color:"#cbd5e0" }}>{w.name}</span><span style={{ color:"#f03e3e", fontWeight:600 }}>Нет</span></div>)}
              {data.lowStock?.slice(0,3).map(w => <div key={w.id} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid #2d3354", fontSize:13 }}><span style={{ color:"#cbd5e0" }}>{w.name}</span><span style={{ color:"#f59f00", fontWeight:600 }}>{w.qty} {w.unit}</span></div>)}
            </>}
        </div>
        <div style={S.card}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <p style={{ fontWeight:600, fontSize:14, margin:0, color:"#e2e8f0" }}>🚚 Последние доставки</p>
            <button onClick={() => setTab("delivery")} style={S.btn}>Все →</button>
          </div>
          {!data.deliveries?.length ? <p style={{ fontSize:13, color:"#4a5568" }}>Доставок пока нет</p>
          : data.deliveries.slice(0,5).map(d => <div key={d.id} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid #2d3354", fontSize:13 }}><span style={{ color:"#a0aec0" }}>{d.date.split("-").reverse().join(".")} — {d.supplier}</span><span style={{ color:"#40c057", fontWeight:600 }}>{parseFloat(d.amount).toLocaleString("ru-RU")} ₽</span></div>)}
        </div>
        <div style={S.card}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <p style={{ fontWeight:600, fontSize:14, margin:0, color:"#e2e8f0" }}>🚛 Последние расчёты</p>
            <button onClick={() => setTab("calc")} style={S.btn}>Все →</button>
          </div>
          {!data.calcHistory?.length ? <p style={{ fontSize:13, color:"#4a5568" }}>Расчётов пока нет</p>
          : data.calcHistory.slice(0,5).map(c => <div key={c.id} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid #2d3354", fontSize:13 }}><span style={{ color:"#a0aec0" }}>{c.date} — {c.desc}</span><span style={{ color:"#9775fa", fontWeight:600 }}>{parseFloat(c.total).toLocaleString("ru-RU")} ₽</span></div>)}
        </div>
      </div>
    </div>
  );
}
'@, $utf8)

Write-Host "Dashboard.js готов" -ForegroundColor Green
Write-Host "Остальные файлы (Warehouse, Delivery, DeliveryCalc, Tasks, Rotation) вставь вручную из артефактов в чате." -ForegroundColor Yellow
Write-Host "Все готово! Запусти: npm run deploy" -ForegroundColor Cyan