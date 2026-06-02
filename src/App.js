import { useState } from "react";
import Warehouse from "./Warehouse";
import Delivery from "./Delivery";
import Tasks from "./Tasks";
import DeliveryCalc from "./DeliveryCalc";
import Dashboard from "./Dashboard";
import Rotation from "./Rotation";

const ORGS = [
  { id: 0, label: "Р С›РЎР‚Р С–Р В°Р Р…Р С‘Р В·Р В°РЎвЂ Р С‘РЎРЏ 1", accent: "#1a5fa8", font: "'Georgia', serif", priceMultiplier: 1.0 },
  { id: 1, label: "Р С›РЎР‚Р С–Р В°Р Р…Р С‘Р В·Р В°РЎвЂ Р С‘РЎРЏ 2", accent: "#2e7d32", font: "'Trebuchet MS', sans-serif", priceMultiplier: 1.04 },
  { id: 2, label: "Р С›РЎР‚Р С–Р В°Р Р…Р С‘Р В·Р В°РЎвЂ Р С‘РЎРЏ 3", accent: "#6a1b9a", font: "'Palatino Linotype', serif", priceMultiplier: 1.06 },
];
const defaultOrgs = [
  { name: "", inn: "", address: "", phone: "", email: "", director: "" },
  { name: "", inn: "", address: "", phone: "", email: "", director: "" },
  { name: "", inn: "", address: "", phone: "", email: "", director: "" },
];
const defaultItems = [{ desc: "", qty: 1, unit: "РЎв‚¬РЎвЂљ.", price: "" }];

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
    ? `<div class="totals">Р ВРЎвЂљР С•Р С–Р С• Р В±Р ВµР В· Р СњР вЂќР РЋ: <b>${formatNum(grandTotal)} РЎР‚РЎС“Р В±.</b></div><div class="totals">Р СњР вЂќР РЋ 5%: <b>${formatNum(nds)} РЎР‚РЎС“Р В±.</b></div><div class="totals grand">Р ВР СћР С›Р вЂњР С› РЎРѓ Р СњР вЂќР РЋ: ${formatNum(withNds)} РЎР‚РЎС“Р В±.</div>`
    : `<div class="totals grand">Р ВР СћР С›Р вЂњР С› (Р В±Р ВµР В· Р СњР вЂќР РЋ): ${formatNum(grandTotal)} РЎР‚РЎС“Р В±.</div>`;
  const tableRows = rows.map((r, i) => `<tr style="background:${i%2===0?"#f9f9f9":"#fff"}"><td style="padding:6px 10px;border:1px solid #ddd;text-align:center">${i+1}</td><td style="padding:6px 10px;border:1px solid #ddd">${r.desc}</td><td style="padding:6px 10px;border:1px solid #ddd;text-align:center">${r.qty}</td><td style="padding:6px 10px;border:1px solid #ddd;text-align:center">${r.unit}</td><td style="padding:6px 10px;border:1px solid #ddd;text-align:right">${formatNum(r.unitPrice)}</td><td style="padding:6px 10px;border:1px solid #ddd;text-align:right">${formatNum(r.total)}</td></tr>`).join("");
  return `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><title>Р С™Р Сџ РІР‚вЂќ ${orgData.name}</title><style>body{font-family:${font};font-size:13px;color:#222;margin:0;padding:0}.page{max-width:800px;margin:0 auto;padding:32px 40px}.header-bar{border-bottom:3px solid ${accent};padding-bottom:16px;margin-bottom:20px;display:flex;justify-content:space-between}.org-name{font-size:15px;font-weight:bold;color:${accent};margin-bottom:4px}.kp-title{text-align:center;font-size:17px;font-weight:bold;color:${accent};margin:18px 0 10px}.meta{font-size:12px;color:#555;margin-bottom:14px}.desc-block{margin-bottom:16px;line-height:1.6}table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:8px}th{background:${accent};color:#fff;padding:7px 10px;text-align:left;border:1px solid ${accent}}.totals{text-align:right;font-size:13px;margin:6px 0}.totals b,.grand{color:${accent}}.grand{font-size:15px;font-weight:bold;text-align:right;margin:6px 0}.footer{margin-top:30px;font-size:12px;color:#555;border-top:1px solid #ddd;padding-top:14px;display:flex;justify-content:space-between}.sign{margin-top:40px;font-size:12px}</style></head><body><div class="page"><div class="header-bar"><div><div class="org-name">${orgData.name}</div><div style="font-size:12px;color:#444">Р ВР СњР Сњ: ${orgData.inn}</div><div style="font-size:12px;color:#444">${orgData.address}</div><div style="font-size:12px;color:#444">${orgData.phone} | ${orgData.email}</div></div><div style="text-align:right;font-size:12px;color:#555"><div>Р вЂќР В°РЎвЂљР В°: ${kpDate}</div><div>РІвЂћвЂ“ Р С™Р Сџ: ${Math.floor(Math.random()*900)+100}/${new Date().getFullYear()}</div></div></div><div class="kp-title">Р С™Р С›Р СљР СљР вЂўР В Р В§Р вЂўР РЋР С™Р С›Р вЂў Р СџР В Р вЂўР вЂќР вЂєР С›Р вЂ“Р вЂўР СњР ВР вЂў</div><div class="meta"><b>Р вЂ”Р В°Р С”Р В°Р В·РЎвЂЎР С‘Р С”:</b> ${client||"РІР‚вЂќ"}<br><b>Р РЋРЎР‚Р С•Р С” Р Р†РЎвЂ№Р С—Р С•Р В»Р Р…Р ВµР Р…Р С‘РЎРЏ:</b> ${deadline||"РІР‚вЂќ"}</div><div class="desc-block"><b>Р С›Р С—Р С‘РЎРѓР В°Р Р…Р С‘Р Вµ РЎР‚Р В°Р В±Р С•РЎвЂљ / РЎС“РЎРѓР В»РЎС“Р С–:</b><br>${description||"РІР‚вЂќ"}</div><table><thead><tr><th style="width:32px">РІвЂћвЂ“</th><th>Р СњР В°Р С‘Р СР ВµР Р…Р С•Р Р†Р В°Р Р…Р С‘Р Вµ</th><th style="width:50px">Р С™Р С•Р В»-Р Р†Р С•</th><th style="width:50px">Р вЂўР Т‘.</th><th style="width:90px">Р В¦Р ВµР Р…Р В°, РЎР‚РЎС“Р В±.</th><th style="width:100px">Р РЋРЎС“Р СР СР В°, РЎР‚РЎС“Р В±.</th></tr></thead><tbody>${tableRows}</tbody></table>${totalsBlock}<div style="margin-top:16px;font-size:12px;color:#555">Р СџРЎР‚Р ВµР Т‘Р В»Р С•Р В¶Р ВµР Р…Р С‘Р Вµ Р Т‘Р ВµР в„–РЎРѓРЎвЂљР Р†Р С‘РЎвЂљР ВµР В»РЎРЉР Р…Р С• 30 Р Т‘Р Р…Р ВµР в„–.</div><div class="sign"><p><b>Р вЂќР С‘РЎР‚Р ВµР С”РЎвЂљР С•РЎР‚:</b> ${orgData.director} / ___________________</p><p style="color:#aaa">Р Сљ.Р Сџ.</p></div><div class="footer"><div>${orgData.name}</div><div>${orgData.address}</div><div>${orgData.phone}</div></div></div></body></html>`;
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
  const addItem=()=>setItems([...items,{desc:"",qty:1,unit:"РЎв‚¬РЎвЂљ.",price:""}]);
  const removeItem=(i)=>setItems(items.filter((_,idx)=>idx!==i));

  const generate=async()=>{
    setLoading(true);setGenerated(false);
    let descs=[description,description,description];
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:`Р СџР ВµРЎР‚Р ВµРЎвЂћРЎР‚Р В°Р В·Р С‘РЎР‚РЎС“Р в„– Р С•Р С—Р С‘РЎРѓР В°Р Р…Р С‘Р Вµ РЎвЂљРЎР‚Р ВµР СРЎРЏ РЎРѓР С—Р С•РЎРѓР С•Р В±Р В°Р СР С‘. JSON: {"v1":"...","v2":"...","v3":"..."}. Р С›РЎР‚Р С‘Р С–Р С‘Р Р…Р В°Р В»: "${description}"`}]})});
      const data=await res.json();
      const text=data.content?.map(b=>b.text||"").join("")||"";
      const parsed=JSON.parse(text.replace(/```json|```/g,"").trim());
      descs=[parsed.v1||description,parsed.v2||description,parsed.v3||description];
    } catch {}
    setHtmls(ORGS.map((org,i)=>genKP(orgs[i],org,items,client,descs[i],deadline,kpDate,ndsModes[i])));
    setLoading(false);setGenerated(true);setStep(2);
  };

  const downloadKP=(i)=>{const blob=new Blob([htmls[i]],{type:"text/html;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`Р С™Р Сџ_${orgs[i].name||"Р С›РЎР‚Р С–_"+(i+1)}.html`;a.click();URL.revokeObjectURL(url);};

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
          <p style={S.navLabel}>Р СљР ВµР Р…РЎР‹</p>
          {[["dashboard","СЂСџРЏВ ","Р вЂњР В»Р В°Р Р†Р Р…Р В°РЎРЏ"],["kp","СЂСџвЂњвЂћ","Р вЂњР ВµР Р…Р ВµРЎР‚Р В°РЎвЂљР С•РЎР‚ Р С™Р Сџ"],["warehouse","СЂСџвЂњВ¦","Р РЋР С”Р В»Р В°Р Т‘"],["delivery","СЂСџС™С™","Р вЂќР С•РЎРѓРЎвЂљР В°Р Р†Р С”Р С‘"],["tasks","СЂСџвЂњвЂ№","Р вЂ”Р В°Р Т‘Р В°РЎвЂЎР С‘"],["calc","СЂСџС™вЂє","Р С™Р В°Р В»РЎРЉР С”РЎС“Р В»РЎРЏРЎвЂљР С•РЎР‚"],["rotation","СЂСџвЂќвЂћ","Р В Р С•РЎвЂљР В°РЎвЂ Р С‘РЎРЏ"]].map(([v,ic,l])=>(
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
                    {["Р вЂќР В°Р Р…Р Р…РЎвЂ№Р Вµ Р С™Р Сџ","Р С›РЎР‚Р С–Р В°Р Р…Р С‘Р В·Р В°РЎвЂ Р С‘Р С‘"].map((t,i)=>(
                      <button key={i} onClick={()=>setStep(i)} style={{...S.btn,fontWeight:step===i?600:400,borderColor:step===i?"#3b5bdb":"#2d3354",color:step===i?"#748ffc":"#e2e8f0"}}>{i+1}. {t}</button>
                    ))}
                  </div>
                  {step===0&&(
                    <>
                      <div style={S.card}>
                        <p style={{fontWeight:600,marginBottom:12,fontSize:14,color:"#e2e8f0"}}>Р С›Р В±РЎвЂ°Р С‘Р Вµ РЎРѓР Р†Р ВµР Т‘Р ВµР Р…Р С‘РЎРЏ</p>
                        <label style={S.lbl}>Р вЂ”Р В°Р С”Р В°Р В·РЎвЂЎР С‘Р С”</label><input style={S.inp} value={client} onChange={e=>setClient(e.target.value)} placeholder="Р С›Р С›Р С› Р’В«Р вЂ”Р В°Р С”Р В°Р В·РЎвЂЎР С‘Р С”Р’В»"/>
                        <label style={S.lbl}>Р вЂќР В°РЎвЂљР В° Р С™Р Сџ</label><input style={{...S.inp,width:"auto"}} value={kpDate} onChange={e=>setKpDate(e.target.value)}/>
                        <label style={S.lbl}>Р РЋРЎР‚Р С•Р С” Р Р†РЎвЂ№Р С—Р С•Р В»Р Р…Р ВµР Р…Р С‘РЎРЏ</label><input style={S.inp} value={deadline} onChange={e=>setDeadline(e.target.value)} placeholder="Р Р…Р В°Р С—РЎР‚Р С‘Р СР ВµРЎР‚: 30 РЎР‚Р В°Р В±Р С•РЎвЂЎР С‘РЎвЂ¦ Р Т‘Р Р…Р ВµР в„–"/>
                        <label style={S.lbl}>Р С›Р С—Р С‘РЎРѓР В°Р Р…Р С‘Р Вµ РЎР‚Р В°Р В±Р С•РЎвЂљ / РЎС“РЎРѓР В»РЎС“Р С–</label>
                        <textarea rows={4} style={{...S.inp,resize:"vertical"}} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Р С›Р С—Р С‘РЎв‚¬Р С‘РЎвЂљР Вµ РЎР‚Р В°Р В±Р С•РЎвЂљРЎвЂ№..."/>
                      </div>
                      <div style={S.card}>
                        <p style={{fontWeight:600,marginBottom:12,fontSize:14,color:"#e2e8f0"}}>Р СџР С•Р В·Р С‘РЎвЂ Р С‘Р С‘ Р С‘ РЎвЂ Р ВµР Р…РЎвЂ№</p>
                        <table style={{width:"100%",fontSize:12,borderCollapse:"collapse"}}>
                          <thead><tr style={{background:"#252a3d"}}>
                            <th style={{textAlign:"left",padding:"6px 8px",fontWeight:500,color:"#7c8db5"}}>Р СњР В°Р С‘Р СР ВµР Р…Р С•Р Р†Р В°Р Р…Р С‘Р Вµ</th>
                            <th style={{width:60,textAlign:"center",padding:"6px 8px",fontWeight:500,color:"#7c8db5"}}>Р С™Р С•Р В»-Р Р†Р С•</th>
                            <th style={{width:70,textAlign:"center",padding:"6px 8px",fontWeight:500,color:"#7c8db5"}}>Р вЂўР Т‘.</th>
                            <th style={{width:110,textAlign:"right",padding:"6px 8px",fontWeight:500,color:"#7c8db5"}}>Р В¦Р ВµР Р…Р В° (Р В±Р В°Р В·Р В°)</th>
                            <th style={{width:30}}></th>
                          </tr></thead>
                          <tbody>
                            {items.map((it,i)=>(
                              <tr key={i}>
                                <td style={{padding:"3px 4px"}}><input value={it.desc} onChange={e=>updateItem(i,"desc",e.target.value)} style={{...S.inp,marginBottom:0}} placeholder="Р СњР В°Р В·Р Р†Р В°Р Р…Р С‘Р Вµ Р С—Р С•Р В·Р С‘РЎвЂ Р С‘Р С‘"/></td>
                                <td style={{padding:"3px 4px"}}><input type="number" value={it.qty} onChange={e=>updateItem(i,"qty",e.target.value)} style={{...S.inp,marginBottom:0,textAlign:"center"}}/></td>
                                <td style={{padding:"3px 4px"}}><input value={it.unit} onChange={e=>updateItem(i,"unit",e.target.value)} style={{...S.inp,marginBottom:0}}/></td>
                                <td style={{padding:"3px 4px"}}><input type="number" value={it.price} onChange={e=>updateItem(i,"price",e.target.value)} style={{...S.inp,marginBottom:0,textAlign:"right"}} placeholder="0"/></td>
                                <td style={{padding:"3px 4px",textAlign:"center"}}>{items.length>1&&<button onClick={()=>removeItem(i)} style={{...S.btn,padding:"4px 8px",color:"#fc8181"}}>РІСљвЂў</button>}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <button onClick={addItem} style={{...S.btn,marginTop:10,color:"#748ffc"}}>+ Р вЂќР С•Р В±Р В°Р Р†Р С‘РЎвЂљРЎРЉ Р С—Р С•Р В·Р С‘РЎвЂ Р С‘РЎР‹</button>
                      </div>
                      <div style={{textAlign:"right"}}><button onClick={()=>setStep(1)} style={S.btnPrimary}>Р вЂќР В°Р В»Р ВµР Вµ: Р С›РЎР‚Р С–Р В°Р Р…Р С‘Р В·Р В°РЎвЂ Р С‘Р С‘ РІвЂ вЂ™</button></div>
                    </>
                  )}
                  {step===1&&(
                    <>
                      {ORGS.map((org,i)=>(
                        <div key={i} style={{...S.card,borderLeft:`4px solid ${org.accent}`}}>
                          <p style={{fontWeight:600,marginBottom:12,fontSize:14,color:org.accent}}>{org.label} <span style={{fontSize:11,color:"#7c8db5",fontWeight:400}}>(Р“вЂ”{(org.priceMultiplier*100).toFixed(0)}%)</span></p>
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
                            {[["name","Р СњР В°Р В·Р Р†Р В°Р Р…Р С‘Р Вµ"],["inn","Р ВР СњР Сњ"],["address","Р С’Р Т‘РЎР‚Р ВµРЎРѓ"],["phone","Р СћР ВµР В»Р ВµРЎвЂћР С•Р Р…"],["email","E-mail"],["director","Р вЂќР С‘РЎР‚Р ВµР С”РЎвЂљР С•РЎР‚"]].map(([f,l])=>(
                              <div key={f}><label style={S.lbl}>{l}</label><input style={S.inp} value={orgs[i][f]} onChange={e=>updateOrg(i,f,e.target.value)}/></div>
                            ))}
                          </div>
                          <div style={{marginTop:10}}>
                            <label style={S.lbl}>Р СњР вЂќР РЋ</label>
                            <div style={{display:"flex",gap:8}}>
                              {[["without","Р вЂР ВµР В· Р СњР вЂќР РЋ"],["with","Р РЋ Р СњР вЂќР РЋ (5%)"]].map(([v,l])=>(
                                <button key={v} onClick={()=>{const m=[...ndsModes];m[i]=v;setNdsModes(m);}} style={{padding:"5px 14px",borderRadius:8,border:`1px solid ${ndsModes[i]===v?org.accent:"#2d3354"}`,background:ndsModes[i]===v?"#252a3d":"transparent",color:ndsModes[i]===v?org.accent:"#a0aec0",cursor:"pointer",fontSize:13}}>{l}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
                        <button onClick={()=>setStep(0)} style={S.btn}>РІвЂ С’ Р СњР В°Р В·Р В°Р Т‘</button>
                        <button onClick={generate} disabled={loading} style={S.btnPrimary}>{loading?"Р вЂњР ВµР Р…Р ВµРЎР‚Р В°РЎвЂ Р С‘РЎРЏ...":"Р РЋР С–Р ВµР Р…Р ВµРЎР‚Р С‘РЎР‚Р С•Р Р†Р В°РЎвЂљРЎРЉ 3 Р С™Р Сџ РІвЂ вЂ™"}</button>
                      </div>
                    </>
                  )}
                </>
              )}
              {generated&&step===2&&(
                <>
                  <p style={{fontSize:13,color:"#7c8db5",marginBottom:16}}>3 Р С™Р Сџ Р С–Р С•РЎвЂљР С•Р Р†РЎвЂ№.</p>
                  <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
                    {ORGS.map((org,i)=>(<button key={i} onClick={()=>setActivePreview(i)} style={{...S.btn,fontWeight:activePreview===i?600:400,borderColor:activePreview===i?org.accent:"#2d3354",color:activePreview===i?org.accent:"#e2e8f0"}}>{orgs[i].name||org.label}</button>))}
                  </div>
                  <div style={{display:"flex",gap:8,marginBottom:12}}>
                    <button onClick={()=>downloadKP(activePreview)} style={S.btnPrimary}>РІВ¬вЂЎ Р РЋР С”Р В°РЎвЂЎР В°РЎвЂљРЎРЉ Р С™Р Сџ {activePreview+1}</button>
                    <button onClick={()=>{setGenerated(false);setStep(0);}} style={S.btn}>РІвЂ С’ Р СњР В°Р В·Р В°Р Т‘</button>
                  </div>
                  <div style={{border:"1px solid #2d3354",borderRadius:10,overflow:"hidden"}}>
                    <iframe key={activePreview} srcDoc={htmls[activePreview]} style={{width:"100%",height:600,border:"none"}} title={`Р С™Р Сџ ${activePreview+1}`}/>
                  </div>
                  <p style={{fontSize:11,color:"#7c8db5",marginTop:8}}>Ctrl+P РІвЂ вЂ™ Р’В«Р РЋР С•РЎвЂ¦РЎР‚Р В°Р Р…Р С‘РЎвЂљРЎРЉ Р С”Р В°Р С” PDFР’В» Р Т‘Р В»РЎРЏ РЎРѓР С•РЎвЂ¦РЎР‚Р В°Р Р…Р ВµР Р…Р С‘РЎРЏ.</p>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
