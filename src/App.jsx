import { useState, useEffect, useCallback } from "react";

// ─── BRAND IDENTITY ───────────────────────────────────────────────────────────
const C = {
  amarillo:      "#F5C842",
  blanco:        "#FAF8F4",
  verde:         "#7C9E8A",
  rosa:          "#F2D4CC",
  lila:          "#9B8FB0",
  terracota:     "#C97B5A",
  negro:         "#1A1A2E",
  gris:          "#D6D0C4",
  madera:        "#8B6F47",
  verdeSoft:     "#D4E4DA",
  rosaSoft:      "#F9EBE6",
  lilaSoft:      "#EAE5F0",
  amarilloSoft:  "#FDF3D7",
  terracotaSoft: "#F0DDD3",
};

const PILAR = {
  raiz:  { color: C.verde,     soft: C.verdeSoft,     label: "RAÍZ",  icon: "🌱", sub: "Mente · Cuerpo" },
  tallo: { color: C.terracota, soft: C.terracotaSoft,  label: "TALLO", icon: "🌿", sub: "Espacio · Entorno" },
  flor:  { color: C.lila,      soft: C.lilaSoft,       label: "FLOR",  icon: "🌸", sub: "Relaciones · Recursos" },
};

const DAYS_FULL  = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
const DAYS_SHORT = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
const MONTHS     = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

// ─── DATE HELPERS ─────────────────────────────────────────────────────────────
const toISO    = d  => d.toISOString().slice(0, 10);
const today    = () => toISO(new Date());
const fromISO  = iso => new Date(iso + "T12:00:00");
const addDays  = (iso, n) => { const d = fromISO(iso); d.setDate(d.getDate() + n); return toISO(d); };
const dayLabel = iso => { const d = fromISO(iso); return `${DAYS_FULL[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]}`; };
const weekStart = iso => { const d = fromISO(iso); const m = new Date(d); m.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return toISO(m); };
const weekDatesFrom = monISO => Array.from({ length: 7 }, (_, i) => addDays(monISO, i));

// ─── HABITS ───────────────────────────────────────────────────────────────────
const HABITS = [
  { id: "vaciado",    label: "Vaciado mental",        pilar: "raiz" },
  { id: "journaling", label: "Journaling",             pilar: "raiz" },
  { id: "movimiento", label: "Movimiento / Ejercicio", pilar: "raiz" },
  { id: "desayuno",   label: "Desayuno nutritivo",     pilar: "raiz" },
  { id: "comida",     label: "Comida completa",        pilar: "raiz" },
  { id: "snack",      label: "Snack balanceado",       pilar: "raiz" },
  { id: "descanso8",  label: "Descanso 8 hrs",         pilar: "raiz" },
  { id: "espacio",    label: "Orden espacio físico",   pilar: "tallo" },
  { id: "digital",    label: "Sistema digital al día", pilar: "tallo" },
  { id: "cierre1",    label: "Cierre:", pilar: "tallo", editable: true, placeholder: "ej: cerrar Notion del día" },
  { id: "cierre2",    label: "Cierre:", pilar: "tallo", editable: true, placeholder: "ej: dejar escritorio listo" },
  { id: "finanzas",   label: "Revisión finanzas",      pilar: "flor" },
  { id: "marca",      label: "Avance marca personal",  pilar: "flor" },
  { id: "producto",   label: "Avance producto:", pilar: "flor", editable: true, placeholder: "ej: lead magnet, curso..." },
  { id: "proyectos",  label: "Avance proyectos:", pilar: "flor", editable: true, placeholder: "ej: cliente, comercio..." },
  { id: "reflexion",  label: "Reflexión de cierre",    pilar: "flor" },
];

// ─── DATA MODEL ───────────────────────────────────────────────────────────────
// habits:       { [dateISO]: { [habitId]: bool } }
// habitLabels:  { [habitId]: string }
// energy:       { [dateISO]: 0-5 }
// weeks:        { [monISO]:  { theme, victories, victoriesDone, focusBlocks } }
// days:         { [dateISO]: { inbox: [], reflection: {}, notes: [] } }

const blank     = () => ({ habits: {}, habitLabels: {}, energy: {}, weeks: {}, days: {} });
const blankDay  = () => ({ inbox: [], reflection: { learned: "", worked: "", design: "" }, notes: [] });
const blankWeek = () => ({ theme: "", victories: ["","",""], victoriesDone: [false,false,false], focusBlocks: {} });

async function loadData() {
  try { const r = await window.storage.get("eco-v4"); return r ? JSON.parse(r.value) : blank(); }
  catch { return blank(); }
}
async function saveData(d) {
  try { await window.storage.set("eco-v4", JSON.stringify(d)); } catch {}
}

// ─── SHARED UI ────────────────────────────────────────────────────────────────
function Pill({ pilar, micro }) {
  const p = PILAR[pilar];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontFamily: "'Space Mono',monospace", fontSize: micro ? 9 : 10,
      letterSpacing: 1.2, color: p.color, background: p.soft + "90",
      padding: micro ? "2px 8px" : "3px 11px", borderRadius: 20,
      border: `1px solid ${p.color}30`, whiteSpace: "nowrap",
    }}>{p.icon} {p.label}</span>
  );
}

function SectionHead({ num, title, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: 2, color: C.terracota, opacity: 0.7 }}>{num}</span>
      <h2 style={{ fontFamily: "'Museo Moderno','MuseoModerno',sans-serif", fontSize: 17, color: C.negro, margin: 0, fontWeight: 700 }}>{title}</h2>
      {children}
    </div>
  );
}

function Card({ children, style: s }) {
  return (
    <div style={{ background: C.blanco, borderRadius: 18, padding: "22px 20px", border: `1px solid ${C.gris}30`, boxShadow: `0 1px 4px ${C.negro}05`, ...s }}>
      {children}
    </div>
  );
}

function NavRow({ label, onPrev, onNext, onToday, isToday }) {
  const btn = { width: 32, height: 32, borderRadius: 9, border: `1px solid ${C.gris}40`, background: C.blanco, color: C.madera, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: 12, background: C.amarilloSoft + "70", border: `1px solid ${C.gris}20`, marginBottom: 16 }}>
      <button onClick={onPrev} style={btn}>‹</button>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 500, color: C.negro }}>{label}</div>
        {!isToday && <span onClick={onToday} style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: C.terracota, cursor: "pointer" }}>← volver a hoy</span>}
      </div>
      <button onClick={onNext} style={btn}>›</button>
    </div>
  );
}

// ─── HEADER ───────────────────────────────────────────────────────────────────
function Header({ data }) {
  const d  = new Date();
  const td = today();
  const n  = HABITS.filter(h => data.habits[td]?.[h.id]).length;
  return (
    <div style={{ background: C.negro, borderRadius: 20, padding: "26px 22px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -40, right: -20, width: 150, height: 150, borderRadius: "50%", background: C.amarillo + "10", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -40, left: 30, width: 110, height: 110, borderRadius: "50%", background: C.verde + "08", pointerEvents: "none" }} />
      <div style={{ position: "relative" }}>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 3, color: C.amarillo, opacity: 0.6, marginBottom: 12 }}>ECOSISTEMA PERSONAL · RAÍZ · TALLO · FLOR</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 34, fontWeight: 400, fontStyle: "italic", color: C.blanco, margin: 0, lineHeight: 1.1 }}>
              Hola, Paola<span style={{ color: C.amarillo }}>.</span>
            </h1>
            <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, color: C.gris, marginTop: 8, lineHeight: 1.5 }}>
              {DAYS_FULL[d.getDay()]}, {d.getDate()} de {MONTHS[d.getMonth()]}
              <span style={{ color: C.terracota, margin: "0 7px" }}>·</span>
              {n}/{HABITS.length} hábitos hoy
            </p>
          </div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {["raiz","tallo","flor"].map(p => (
              <div key={p} style={{ padding: "6px 11px", borderRadius: 11, background: PILAR[p].color + "15", border: `1px solid ${PILAR[p].color}30` }}>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 1, color: PILAR[p].color }}>{PILAR[p].label}</div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 9, color: C.gris, opacity: 0.6, marginTop: 1 }}>{PILAR[p].sub}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 16, padding: "11px 15px", borderLeft: `3px solid ${C.amarillo}`, background: C.blanco + "05", borderRadius: "0 10px 10px 0" }}>
          <p style={{ fontFamily: "'Fraunces',serif", fontSize: 13, fontStyle: "italic", color: C.blanco, opacity: 0.6, margin: 0, lineHeight: 1.6 }}>
            "Menos carga mental. Más enfoque. No porque te esfuerces más — sino porque diseñas mejor."
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── TAB BAR ──────────────────────────────────────────────────────────────────
function TabBar({ active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 5, background: C.blanco, borderRadius: 14, padding: 5, border: `1px solid ${C.gris}30` }}>
      {[{ id: "dia", label: "📅 Hoy" }, { id: "semana", label: "📆 Semana" }].map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          flex: 1, padding: "10px 16px", borderRadius: 10,
          fontFamily: "'Space Mono',monospace", fontSize: 11, letterSpacing: 1,
          border: "none", cursor: "pointer",
          background: active === t.id ? C.negro : "transparent",
          color: active === t.id ? C.amarillo : C.madera,
          transition: "all 0.2s",
        }}>{t.label}</button>
      ))}
    </div>
  );
}

// ─── INBOX (day) ──────────────────────────────────────────────────────────────
function Inbox({ data, update, dateISO }) {
  const [txt, setTxt] = useState("");
  const dayData = data.days[dateISO] || blankDay();
  const prevISO = addDays(dateISO, -1);
  const prevDay = data.days[prevISO] || blankDay();
  const carried = prevDay.inbox.filter(x => !x.done);
  const pending = dayData.inbox.filter(x => !x.done).length;

  const setDay = patch => update({ days: { ...data.days, [dateISO]: { ...dayData, ...patch } } });

  const add = () => {
    if (!txt.trim()) return;
    setDay({ inbox: [{ id: Date.now(), text: txt.trim(), done: false }, ...dayData.inbox] });
    setTxt("");
  };

  const toggle = (id, fromCarried) => {
    if (fromCarried) {
      const prev = { ...(data.days[prevISO] || blankDay()) };
      prev.inbox = prev.inbox.map(x => x.id === id ? { ...x, done: true } : x);
      update({ days: { ...data.days, [prevISO]: prev } });
    } else {
      setDay({ inbox: dayData.inbox.map(x => x.id === id ? { ...x, done: !x.done } : x) });
    }
  };

  const remove = id => setDay({ inbox: dayData.inbox.filter(x => x.id !== id) });

  const allItems = [
    ...carried.map(x => ({ ...x, _carried: true })),
    ...dayData.inbox,
  ];

  return (
    <Card style={{ padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 15 }}>🧠</span>
        <h2 style={{ fontFamily: "'Museo Moderno','MuseoModerno',sans-serif", fontSize: 16, color: C.negro, margin: 0, fontWeight: 700 }}>Inbox Mental</h2>
        <Pill pilar="raiz" micro />
        {pending > 0 && <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, background: C.terracotaSoft, color: C.terracota, padding: "2px 8px", borderRadius: 10, marginLeft: "auto" }}>{pending} abiertas</span>}
      </div>
      <div style={{ display: "flex", gap: 7, marginBottom: allItems.length ? 10 : 0 }}>
        <input type="text" value={txt} onChange={e => setTxt(e.target.value)} onKeyDown={e => e.key === "Enter" && add()}
          placeholder="💭 Capturá lo que tengas en la cabeza..."
          style={{ flex: 1, padding: "10px 13px", fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, border: `1.5px solid ${C.gris}40`, borderRadius: 10, background: "white", color: C.negro, outline: "none" }} />
        <button onClick={add} style={{ padding: "10px 16px", fontFamily: "'Space Mono',monospace", fontSize: 14, fontWeight: 700, background: C.verde, color: "white", border: "none", borderRadius: 10, cursor: "pointer", flexShrink: 0 }}>+</button>
      </div>
      {allItems.length > 0 && (
        <div style={{ maxHeight: 210, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
          {allItems.map(item => (
            <div key={String(item.id) + (item._carried ? "c" : "")} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 11px", borderRadius: 9,
              background: item.done ? C.verdeSoft + "50" : item._carried ? C.amarilloSoft : `${C.gris}10`,
              border: `1px solid ${item._carried ? C.amarillo + "55" : C.gris + "18"}`,
            }}>
              <div onClick={() => toggle(item.id, item._carried)} style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, border: `2px solid ${item.done ? C.verde : item._carried ? C.amarillo : C.gris}`, background: item.done ? C.verde : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {item.done && <span style={{ color: "white", fontSize: 10 }}>✓</span>}
              </div>
              <span style={{ flex: 1, fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: item.done ? C.madera : C.negro, textDecoration: item.done ? "line-through" : "none", opacity: item.done ? 0.5 : 1 }}>{item.text}</span>
              {item._carried && <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: C.madera, opacity: 0.55, flexShrink: 0 }}>🔁 ayer</span>}
              {!item._carried && (
                <span onClick={() => remove(item.id)} style={{ cursor: "pointer", color: C.gris, fontSize: 14, padding: "0 3px", lineHeight: 1 }}
                  onMouseEnter={e => e.currentTarget.style.color = C.terracota}
                  onMouseLeave={e => e.currentTarget.style.color = C.gris}>×</span>
              )}
            </div>
          ))}
        </div>
      )}
      {allItems.length === 0 && (
        <p style={{ fontFamily: "'Fraunces',serif", fontSize: 13, fontStyle: "italic", color: C.gris, margin: 0, paddingTop: 2 }}>✨ Mente clara. Sin pestañas abiertas.</p>
      )}
    </Card>
  );
}

// ─── REFLECTION (day) ─────────────────────────────────────────────────────────
function Reflection({ data, update, dateISO }) {
  const dayData = data.days[dateISO] || blankDay();
  const ref     = dayData.reflection || { learned: "", worked: "", design: "" };
  const set = (k, v) => update({ days: { ...data.days, [dateISO]: { ...dayData, reflection: { ...ref, [k]: v } } } });

  const qs = [
    { k: "learned", label: "¿Qué aprendí hoy?",       pilar: "raiz" },
    { k: "worked",  label: "¿Qué funcionó bien?",      pilar: "tallo" },
    { k: "design",  label: "¿Qué diseño para mañana?", pilar: "flor" },
  ];

  return (
    <div style={{ background: C.negro, borderRadius: 18, padding: "22px 20px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -20, right: -10, width: 100, height: 100, borderRadius: "50%", background: C.lila + "12", pointerEvents: "none" }} />
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: 2, color: C.terracota, opacity: 0.75 }}>02</span>
          <h2 style={{ fontFamily: "'Museo Moderno','MuseoModerno',sans-serif", fontSize: 17, color: C.blanco, margin: 0, fontWeight: 700 }}>Reflexión de Cierre</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {qs.map(q => {
            const pc = PILAR[q.pilar].color;
            return (
              <div key={q.k} style={{ borderRadius: 12, border: `1px solid ${pc}35`, background: pc + "10", padding: "12px 13px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 1.2, color: pc, background: pc + "22", padding: "2px 9px", borderRadius: 20, border: `1px solid ${pc}40`, whiteSpace: "nowrap" }}>
                    {PILAR[q.pilar].icon} {PILAR[q.pilar].label}
                  </span>
                  <label style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, fontWeight: 500, color: C.blanco, opacity: 0.85, flex: 1 }}>{q.label}</label>
                  {ref[q.k]?.trim() && <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: C.verde, opacity: 0.7 }}>✓</span>}
                </div>
                <textarea value={ref[q.k]} onChange={e => set(q.k, e.target.value)} rows={2} placeholder="Escribí acá..."
                  style={{ width: "100%", padding: "9px 11px", fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, border: `1.5px solid ${ref[q.k]?.trim() ? pc + "55" : pc + "22"}`, borderRadius: 9, background: C.blanco + "06", color: C.blanco, outline: "none", resize: "none", lineHeight: 1.5, boxSizing: "border-box" }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── STICKY NOTES (day) ───────────────────────────────────────────────────────
const STICKY_PAL = [
  { bg: "#FDF3D7", border: "#F5C842", shadow: "#F5C84222" },
  { bg: "#F9EBE6", border: "#F2D4CC", shadow: "#F2D4CC22" },
  { bg: "#EAE5F0", border: "#9B8FB0", shadow: "#9B8FB022" },
  { bg: "#D4E4DA", border: "#7C9E8A", shadow: "#7C9E8A22" },
  { bg: "#F0DDD3", border: "#C97B5A", shadow: "#C97B5A22" },
];

function StickyNotes({ data, update, dateISO }) {
  const dayData = data.days[dateISO] || blankDay();
  const notes   = dayData.notes || [];
  const setNotes = n => update({ days: { ...data.days, [dateISO]: { ...dayData, notes: n } } });
  const add  = () => setNotes([...notes, { id: Date.now(), text: "", color: notes.length % STICKY_PAL.length, rotation: Math.round((Math.random() - 0.5) * 4 * 10) / 10 }]);
  const upd  = (id, val) => setNotes(notes.map(n => n.id === id ? { ...n, text: val } : n));
  const del  = id => setNotes(notes.filter(n => n.id !== id));

  return (
    <div style={{ borderRadius: 18, padding: "22px 20px", background: `linear-gradient(135deg, ${C.madera}08 0%, ${C.gris}14 100%)`, border: `1px solid ${C.madera}20`, position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 18, opacity: 0.025, backgroundImage: `radial-gradient(${C.negro} 1px, transparent 1px)`, backgroundSize: "16px 16px", pointerEvents: "none" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, position: "relative" }}>
        <SectionHead num="03" title="Mi Pizarrón" />
        <button onClick={add} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 13px", borderRadius: 9, background: C.blanco, border: `1.5px solid ${C.gris}40`, fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, color: C.madera, fontWeight: 500, cursor: "pointer" }}>
          <span style={{ fontSize: 14 }}>+</span> Nueva nota
        </button>
      </div>
      {notes.length === 0 && (
        <div style={{ textAlign: "center", padding: "28px 20px", position: "relative" }}>
          <div style={{ fontSize: 22, marginBottom: 7, opacity: 0.3 }}>📌</div>
          <p style={{ fontFamily: "'Fraunces',serif", fontSize: 13, fontStyle: "italic", color: C.madera, opacity: 0.45, margin: 0 }}>Tu pizarrón de hoy está vacío.</p>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 13, position: "relative" }}>
        {notes.map(note => {
          const p = STICKY_PAL[note.color % STICKY_PAL.length];
          return (
            <div key={note.id} style={{ background: p.bg, border: `1px solid ${p.border}40`, borderRadius: 4, padding: "14px 12px 10px", minHeight: 130, display: "flex", flexDirection: "column", position: "relative", transform: `rotate(${note.rotation}deg)`, boxShadow: `2px 3px 8px ${p.shadow}`, transition: "transform 0.2s, box-shadow 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "rotate(0deg) translateY(-2px)"; e.currentTarget.style.boxShadow = `3px 6px 14px ${p.shadow}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = `rotate(${note.rotation}deg)`; e.currentTarget.style.boxShadow = `2px 3px 8px ${p.shadow}`; }}
            >
              <div style={{ position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)", width: 6, height: 6, borderRadius: "50%", background: p.border, opacity: 0.4 }} />
              <textarea value={note.text} onChange={e => upd(note.id, e.target.value)} placeholder="Escribí tu nota..."
                style={{ flex: 1, border: "none", background: "transparent", fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: C.negro, outline: "none", resize: "none", lineHeight: 1.5, padding: "8px 0 0" }} />
              <div onClick={() => del(note.id)} style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "5px 0", borderTop: `1px dashed ${p.border}40`, cursor: "pointer", fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 0.8, color: p.border, opacity: 0.4, transition: "opacity 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0.4}
              >🗑 borrar</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── DAY VIEW ─────────────────────────────────────────────────────────────────
function DayView({ data, update }) {
  const [offset, setOffset] = useState(0);
  const td      = today();
  const dateISO = addDays(td, offset);
  const isToday = offset === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <NavRow
        label={isToday ? `📅 Hoy — ${dayLabel(dateISO)}` : dayLabel(dateISO)}
        onPrev={() => setOffset(o => o - 1)}
        onNext={() => setOffset(o => o + 1)}
        onToday={() => setOffset(0)}
        isToday={isToday}
      />
      <Inbox      data={data} update={update} dateISO={dateISO} />
      <Reflection data={data} update={update} dateISO={dateISO} />
      <StickyNotes data={data} update={update} dateISO={dateISO} />
    </div>
  );
}

// ─── HABIT TRACKER (week) ─────────────────────────────────────────────────────
function HabitTracker({ data, update, weekMonISO }) {
  const week    = weekDatesFrom(weekMonISO);
  const td      = today();
  const pilares = ["raiz","tallo","flor"];
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const toggle   = (d, id) => { const h = { ...data.habits }; if (!h[d]) h[d] = {}; h[d][id] = !h[d][id]; update({ habits: h }); };
  const setLabel = (id, v)  => update({ habitLabels: { ...data.habitLabels, [id]: v } });

  if (isMobile) {
    return (
      <Card>
        <SectionHead num="01" title="Tracker de Hábitos" />
        {/* Day strip */}
        <div style={{ display: "flex", gap: 5, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
          {week.map((d, i) => {
            const isT   = d === td;
            const count = HABITS.filter(h => data.habits[d]?.[h.id]).length;
            return (
              <div key={d} style={{ flex: "0 0 auto", textAlign: "center", padding: "7px 9px", borderRadius: 10, background: isT ? C.negro : C.blanco, border: `2px solid ${isT ? C.amarillo : C.gris + "40"}`, minWidth: 38 }}>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: isT ? C.amarillo : C.madera }}>{DAYS_SHORT[i]}</div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: isT ? 700 : 400, color: isT ? C.blanco : C.negro, margin: "2px 0" }}>{fromISO(d).getDate()}</div>
                {count > 0 && <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: isT ? C.amarillo : C.verde }}>{count}</div>}
              </div>
            );
          })}
        </div>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 1.5, color: C.madera, marginBottom: 10 }}>HOY — {dayLabel(td)}</div>
        {pilares.map(pilar => (
          <div key={pilar} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: PILAR[pilar].color }} />
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 1, color: PILAR[pilar].color }}>{PILAR[pilar].label}</span>
            </div>
            {HABITS.filter(h => h.pilar === pilar).map(habit => {
              const done = data.habits[td]?.[habit.id];
              return (
                <div key={habit.id} onClick={() => toggle(td, habit.id)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 11px", borderRadius: 10, marginBottom: 4, cursor: "pointer", background: done ? PILAR[pilar].color + "14" : "white", border: `1.5px solid ${done ? PILAR[pilar].color + "60" : C.gris + "30"}`, transition: "all 0.15s" }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, background: done ? PILAR[pilar].color + "20" : "transparent", border: `2px solid ${done ? PILAR[pilar].color : C.gris}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {done && <span style={{ color: PILAR[pilar].color, fontSize: 12, fontWeight: 700 }}>✓</span>}
                  </div>
                  <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: done ? C.madera : C.negro, flex: 1 }}>
                    {habit.editable ? (
                      <>{habit.label}<input type="text" value={data.habitLabels?.[habit.id] || ""} onChange={e => { e.stopPropagation(); setLabel(habit.id, e.target.value); }} onClick={e => e.stopPropagation()} placeholder={habit.placeholder}
                        style={{ border: "none", borderBottom: `1px dashed ${C.gris}60`, background: "transparent", color: C.terracota, fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, fontStyle: "italic", outline: "none", marginLeft: 4, width: 140 }} /></>
                    ) : habit.label}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </Card>
    );
  }

  // Desktop table
  return (
    <Card>
      <SectionHead num="01" title="Tracker de Hábitos" />
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 2px", minWidth: 540 }}>
          <thead>
            <tr>
              <th style={{ width: 205 }} />
              {week.map((d, i) => {
                const isT = d === td;
                return (
                  <th key={d} style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 1, color: isT ? C.terracota : C.madera, padding: "7px 0", textAlign: "center", fontWeight: isT ? 700 : 400 }}>
                    {DAYS_SHORT[i]}
                    <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: isT ? 700 : 400, color: isT ? C.terracota : C.negro, marginTop: 2 }}>{fromISO(d).getDate()}</div>
                    {isT && <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.terracota, margin: "3px auto 0" }} />}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pilares.map((pilar, pi) =>
              HABITS.filter(h => h.pilar === pilar).map((habit, hi) => (
                <tr key={habit.id}>
                  <td style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: C.negro, padding: "5px 8px 5px 0", whiteSpace: "nowrap", borderTop: hi === 0 && pi > 0 ? `1px solid ${C.gris}25` : "none", paddingTop: hi === 0 && pi > 0 ? 11 : 5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {hi === 0 ? <span style={{ width: 5, height: 5, borderRadius: "50%", background: PILAR[pilar].color, flexShrink: 0 }} /> : <span style={{ width: 5 }} />}
                      {habit.editable ? (
                        <span style={{ display: "flex", alignItems: "center", gap: 3 }}>{habit.label}
                          <input type="text" value={data.habitLabels?.[habit.id] || ""} onChange={e => setLabel(habit.id, e.target.value)} placeholder={habit.placeholder} onClick={e => e.stopPropagation()}
                            style={{ width: 128, padding: "1px 4px", fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, fontStyle: "italic", border: "none", borderBottom: `1px dashed ${C.gris}60`, background: "transparent", color: C.terracota, outline: "none" }} />
                        </span>
                      ) : habit.label}
                    </div>
                  </td>
                  {week.map(d => {
                    const done = data.habits[d]?.[habit.id];
                    const isT  = d === td;
                    return (
                      <td key={d} style={{ textAlign: "center", padding: "3px 0", borderTop: hi === 0 && pi > 0 ? `1px solid ${C.gris}25` : "none", paddingTop: hi === 0 && pi > 0 ? 11 : 3 }}>
                        <div onClick={() => toggle(d, habit.id)} style={{ width: 26, height: 26, borderRadius: 7, margin: "0 auto", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: done ? PILAR[pilar].color + "18" : isT ? C.amarillo + "08" : "white", border: done ? `2.5px solid ${PILAR[pilar].color}` : `2px solid ${isT ? C.gris + "80" : C.gris + "50"}`, transition: "all 0.15s" }}>
                          {done && <span style={{ color: PILAR[pilar].color, fontSize: 12, fontWeight: 700 }}>✓</span>}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 16 }}>
        {pilares.map(p => {
          const ph   = HABITS.filter(h => h.pilar === p);
          let done   = 0; week.forEach(d => ph.forEach(h => { if (data.habits[d]?.[h.id]) done++; }));
          const pct  = Math.round((done / (ph.length * 7)) * 100);
          return (
            <div key={p} style={{ padding: "11px 13px", borderRadius: 12, background: PILAR[p].soft + "50", border: `1px solid ${PILAR[p].color}18` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: PILAR[p].color }}>{PILAR[p].icon} {PILAR[p].label}</span>
                <span style={{ fontFamily: "'Fraunces',serif", fontSize: 17, fontStyle: "italic", color: PILAR[p].color }}>{pct}%</span>
              </div>
              <div style={{ height: 3, borderRadius: 2, background: C.blanco }}>
                <div style={{ height: "100%", borderRadius: 2, background: PILAR[p].color, width: `${pct}%`, transition: "width 0.4s", opacity: 0.7 }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── WEEK DESIGN ──────────────────────────────────────────────────────────────
function WeekDesign({ data, update, weekMonISO }) {
  const week  = weekDatesFrom(weekMonISO);
  const td    = today();
  const wk    = data.weeks[weekMonISO] || blankWeek();
  const setWk = patch => update({ weeks: { ...data.weeks, [weekMonISO]: { ...wk, ...patch } } });

  const blocks = [
    { label: "Profundo",  color: C.verde,     icon: "◆" },
    { label: "Creativo",  color: C.amarillo,  icon: "✦" },
    { label: "Operativo", color: C.terracota, icon: "●" },
    { label: "Descanso",  color: C.lila,      icon: "○" },
  ];

  const cycleBlock = d => { const fb = { ...wk.focusBlocks }; const cur = blocks.findIndex(b => b.label === fb[d]); fb[d] = blocks[(cur + 1) % blocks.length].label; setWk({ focusBlocks: fb }); };

  return (
    <Card>
      <SectionHead num="02" title="Diseño de Semana" />
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 1.8, color: C.madera, display: "block", marginBottom: 6 }}>TEMA ANCLA</label>
        <input type="text" value={wk.theme} onChange={e => setWk({ theme: e.target.value })} placeholder="¿Qué pregunta o tensión guía esta semana?"
          style={{ width: "100%", padding: "10px 13px", fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, border: `1.5px solid ${C.gris}40`, borderRadius: 10, background: "white", color: C.negro, outline: "none", boxSizing: "border-box" }} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 1.8, color: C.madera, display: "block", marginBottom: 8 }}>3 VICTORIAS CLAVE</label>
        {[0,1,2].map(i => {
          const done = wk.victoriesDone?.[i];
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: C.terracota, fontWeight: 600, minWidth: 20 }}>0{i+1}</span>
              <input type="text" value={wk.victories[i]} onChange={e => { const v = [...wk.victories]; v[i] = e.target.value; setWk({ victories: v }); }} placeholder={`Victoria ${i+1}`}
                style={{ flex: 1, padding: "9px 11px", fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, border: `1px solid ${C.gris}30`, borderRadius: 8, background: done ? C.verdeSoft + "60" : wk.victories[i] ? C.verdeSoft + "20" : "white", color: done ? C.madera : C.negro, outline: "none", textDecoration: done ? "line-through" : "none", opacity: done ? 0.7 : 1 }} />
              <div onClick={() => { const vd = [...(wk.victoriesDone || [false,false,false])]; vd[i] = !vd[i]; setWk({ victoriesDone: vd }); }}
                style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${done ? C.verde : C.gris}`, background: done ? C.verde : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 }}>
                {done && <span style={{ color: "white", fontSize: 12, fontWeight: 700 }}>✓</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
          <label style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 1.8, color: C.madera }}>BLOQUES DE ENFOQUE</label>
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            {blocks.map(b => <span key={b.label} style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: b.color, display: "flex", alignItems: "center", gap: 3 }}>{b.icon} {b.label}</span>)}
          </div>
        </div>
        <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 11, color: C.madera, opacity: 0.6, marginBottom: 10, lineHeight: 1.5 }}>
          🖱 Tocá cada día para asignarle un tipo de energía. Diseñá la semana antes de que te pase.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5 }}>
          {week.map((d, i) => {
            const isT = d === td;
            const bk  = blocks.find(b => b.label === wk.focusBlocks[d]);
            return (
              <div key={d} onClick={() => cycleBlock(d)} style={{ textAlign: "center", padding: "10px 3px", borderRadius: 10, cursor: "pointer", minHeight: 64, background: isT ? C.amarillo + "12" : "white", border: isT ? `2px solid ${C.amarillo}60` : `1px solid ${C.gris}25`, transition: "all 0.15s" }}>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 0.8, color: isT ? C.terracota : C.madera }}>{DAYS_SHORT[i]}</div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, color: C.negro, fontWeight: isT ? 700 : 400, margin: "2px 0" }}>{fromISO(d).getDate()}</div>
                {bk && <div style={{ fontSize: 13, color: bk.color, marginTop: 2 }}>{bk.icon}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

// ─── ENERGY (week) ────────────────────────────────────────────────────────────
function Energy({ data, update, weekMonISO }) {
  const week = weekDatesFrom(weekMonISO);
  const td   = today();
  const setLevel = (d, l) => { const e = { ...data.energy }; e[d] = e[d] === l ? 0 : l; update({ energy: e }); };
  const lvlColors = ["", C.gris, C.lila, C.terracota, C.verde, "#5A8A6E"];
  const lvlLabels = ["", "Baja", "Media-B", "Media", "Media-A", "Alta"];

  return (
    <Card>
      <SectionHead num="03" title="Energía Semanal"><Pill pilar="raiz" micro /></SectionHead>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 7 }}>
        {week.map((d, i) => {
          const isT = d === td;
          const lvl = data.energy[d] || 0;
          return (
            <div key={d} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: isT ? C.terracota : C.madera, marginBottom: 6, fontWeight: isT ? 700 : 400 }}>{DAYS_SHORT[i]}</div>
              <div style={{ padding: "8px 2px", borderRadius: 11, background: isT ? C.amarillo + "10" : "transparent", border: isT ? `1.5px solid ${C.amarillo}40` : "1.5px solid transparent", display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
                {[5,4,3,2,1].map(l => (
                  <div key={l} onClick={() => setLevel(d, l)} style={{ width: 30, height: 10, borderRadius: 5, background: l <= lvl ? lvlColors[lvl] : C.gris + "22", cursor: "pointer", transition: "all 0.2s", border: l <= lvl ? `1px solid ${lvlColors[lvl]}50` : `1px solid ${C.gris}15` }} />
                ))}
              </div>
              {lvl > 0 && <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: lvlColors[lvl], marginTop: 4 }}>{lvlLabels[lvl]}</div>}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── WEEK VIEW ────────────────────────────────────────────────────────────────
function WeekView({ data, update }) {
  const [wkOffset, setWkOffset] = useState(0);
  const td         = today();
  const baseMonISO = weekStart(td);
  const weekMonISO = addDays(baseMonISO, wkOffset * 7);
  const weekEnd    = addDays(weekMonISO, 6);
  const isCurrent  = wkOffset === 0;

  const wm = fromISO(weekMonISO), we = fromISO(weekEnd);
  const pad = d => String(fromISO(d).getDate()).padStart(2, "0");
  const wkLabel = wm.getMonth() === we.getMonth()
    ? `Semana del ${pad(weekMonISO)} al ${pad(weekEnd)} de ${MONTHS[wm.getMonth()]}`
    : `${pad(weekMonISO)} ${MONTHS[wm.getMonth()]} — ${pad(weekEnd)} ${MONTHS[we.getMonth()]}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <NavRow
        label={isCurrent ? `📆 Esta semana — ${wkLabel}` : wkLabel}
        onPrev={() => setWkOffset(o => o - 1)}
        onNext={() => setWkOffset(o => o + 1)}
        onToday={() => setWkOffset(0)}
        isToday={isCurrent}
      />
      <HabitTracker data={data} update={update} weekMonISO={weekMonISO} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
        <WeekDesign data={data} update={update} weekMonISO={weekMonISO} />
        <Energy     data={data} update={update} weekMonISO={weekMonISO} />
      </div>
    </div>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <div style={{ textAlign: "center", padding: "26px 20px" }}>
      <p style={{ fontFamily: "'Fraunces',serif", fontSize: 14, fontStyle: "italic", color: C.madera, margin: 0 }}>La estructura es lo que sostiene la ambición.</p>
      <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 2.5, color: C.gris, marginTop: 8 }}>— PAOLA ZERPA · DISEÑO & SISTEMAS</p>
      <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 10 }}>
        {[C.verde, C.terracota, C.lila].map((c, i) => <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: c }} />)}
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState("dia");

  useEffect(() => { loadData().then(d => { setData(d); setLoading(false); }); }, []);

  const update = useCallback((patch) => {
    setData(prev => { const next = { ...prev, ...patch }; saveData(next); return next; });
  }, []);

  if (loading || !data) return (
    <div style={{ minHeight: "100vh", background: C.negro, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {[C.verde, C.terracota, C.lila].map((c, i) => (
          <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: c, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
      <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: 3, color: C.madera }}>CARGANDO ECOSISTEMA...</p>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,300;1,400;1,500&family=Museo+Moderno:wght@600;700&family=Space+Grotesk:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #E8E3DC; -webkit-font-smoothing: antialiased; }
        input, textarea, button { font-family: inherit; }
        input, textarea { transition: border-color 0.15s; }
        input:focus, textarea:focus { border-color: ${C.terracota} !important; outline: none; }
        input::placeholder, textarea::placeholder { color: ${C.gris}; opacity: 0.7; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.gris}; border-radius: 2px; }
        @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.1); } }
      `}</style>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "18px 14px 48px", display: "flex", flexDirection: "column", gap: 14 }}>
        <Header data={data} />
        <TabBar active={tab} onChange={setTab} />
        {tab === "dia"    && <DayView  data={data} update={update} />}
        {tab === "semana" && <WeekView data={data} update={update} />}
        <Footer />
      </div>
    </>
  );
}
