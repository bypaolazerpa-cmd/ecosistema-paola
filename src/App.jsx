import { useState, useEffect } from "react";

// ─── BRAND IDENTITY — FINAL ───────────────────────────────────────────────────
// Fraunces Italic   → display / emocional
// MuseoModerno Bold → titular / portada
// Space Grotesk     → cuerpo
// Space Mono        → acento / tags / numeración

const C = {
  amarillo:     "#F5C842",
  blanco:       "#FAF8F4",
  verde:        "#7C9E8A",
  rosa:         "#F2D4CC",
  lila:         "#9B8FB0",   // actualizado desde #C9C0D3
  terracota:    "#C97B5A",
  negro:        "#1A1A2E",
  gris:         "#D6D0C4",
  madera:       "#8B6F47",
  // Pasteles
  verdeSoft:    "#D4E4DA",
  rosaSoft:     "#F9EBE6",
  lilaSoft:     "#EAE5F0",   // ajustado al nuevo lila
  amarilloSoft: "#FDF3D7",
  terracotaSoft:"#F0DDD3",
};

const PILAR = {
  raiz:  { color: C.verde,     soft: C.verdeSoft,     label: "RAÍZ",  icon: "🌱", sub: "Mente · Cuerpo" },
  tallo: { color: C.terracota, soft: C.terracotaSoft,  label: "TALLO", icon: "🌿", sub: "Espacio · Entorno" },
  flor:  { color: C.lila,      soft: C.lilaSoft,       label: "FLOR",  icon: "🌸", sub: "Relaciones · Recursos" },
};

const DAYS   = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

const today = () => new Date().toISOString().slice(0, 10);

function weekDates(offset = 0) {
  const t = new Date();
  const mon = new Date(t);
  mon.setDate(t.getDate() - ((t.getDay() + 6) % 7) + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return d;
  });
}

function weekLabel(offset = 0) {
  const w = weekDates(offset);
  const d1 = w[0], d2 = w[6];
  const pad = n => String(n).padStart(2, "0");
  if (d1.getMonth() === d2.getMonth()) {
    return `Semana del ${pad(d1.getDate())} al ${pad(d2.getDate())} de ${MONTHS[d1.getMonth()]}`;
  }
  return `Semana del ${pad(d1.getDate())} de ${MONTHS[d1.getMonth()]} al ${pad(d2.getDate())} de ${MONTHS[d2.getMonth()]}`;
}

const HABITS = [
  { id: "vaciado",    label: "Vaciado mental",         pilar: "raiz" },
  { id: "journaling", label: "Journaling",              pilar: "raiz" },
  { id: "movimiento", label: "Movimiento / Ejercicio",  pilar: "raiz" },
  { id: "desayuno",   label: "Desayuno nutritivo",      pilar: "raiz" },
  { id: "comida",     label: "Comida completa",         pilar: "raiz" },
  { id: "snack",      label: "Snack balanceado",        pilar: "raiz" },
  { id: "descanso8",  label: "Descanso 8 hrs",          pilar: "raiz" },
  { id: "espacio",    label: "Orden espacio físico",    pilar: "tallo" },
  { id: "digital",    label: "Sistema digital al día",  pilar: "tallo" },
  { id: "cierre1",    label: "Cierre:", pilar: "tallo", editable: true, placeholder: "ej: cerrar Notion del día" },
  { id: "cierre2",    label: "Cierre:", pilar: "tallo", editable: true, placeholder: "ej: dejar escritorio listo" },
  { id: "finanzas",   label: "Revisión finanzas",       pilar: "flor" },
  { id: "marca",      label: "Avance marca personal",   pilar: "flor" },
  { id: "producto",   label: "Avance producto:",  pilar: "flor", editable: true, placeholder: "ej: lead magnet, curso..." },
  { id: "proyectos",  label: "Avance proyectos:", pilar: "flor", editable: true, placeholder: "ej: cliente, comercio..." },
  { id: "reflexion",  label: "Reflexión de cierre",     pilar: "flor" },
];

const blank = () => ({
  habits: {}, habitLabels: {}, weekTheme: "",
  victories: ["", "", ""], victoriesDone: [false, false, false],
  focusBlocks: {}, energy: {}, inbox: [],
  reflections: {}, reflectionsSaved: {}, stickyNotes: [],
});

async function load() {
  try {
    const r = await window.storage.get("eco-v3");
    return r ? JSON.parse(r.value) : blank();
  } catch { return blank(); }
}

async function save(d) {
  try { await window.storage.set("eco-v3", JSON.stringify(d)); } catch {}
}

// ─── TINY COMPONENTS ──────────────────────────────────────────────────────────

function Pill({ pilar, micro }) {
  const p = PILAR[pilar];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontFamily: "'Space Mono', monospace",
      fontSize: micro ? 9 : 10,
      letterSpacing: 1.4,
      color: p.color,
      background: p.soft + "90",
      padding: micro ? "2px 8px" : "3px 11px",
      borderRadius: 20,
      border: `1px solid ${p.color}30`,
    }}>
      {p.icon} {p.label}
    </span>
  );
}

function SectionHead({ num, title, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
      <span style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 10, letterSpacing: 2.5,
        color: C.terracota, opacity: 0.8,
      }}>{num}</span>
      <h2 style={{
        fontFamily: "'Museo Moderno', 'MuseoModerno', sans-serif",
        fontSize: 18, color: C.negro,
        margin: 0, fontWeight: 700,
        letterSpacing: -0.3,
      }}>{title}</h2>
      {children}
    </div>
  );
}

function Card({ children, style: s }) {
  return (
    <div style={{
      background: C.blanco,
      borderRadius: 20,
      padding: "28px 30px",
      border: `1px solid ${C.gris}30`,
      boxShadow: `0 1px 3px ${C.negro}06`,
      ...s,
    }}>
      {children}
    </div>
  );
}

// ─── HEADER ───────────────────────────────────────────────────────────────────

function Header({ data }) {
  const d = new Date();
  const dayName = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"][d.getDay()];
  const todayHabits = HABITS.filter(h => data.habits[today()]?.[h.id]).length;

  return (
    <div style={{
      background: C.negro,
      borderRadius: 22,
      padding: "36px 38px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Organic background shapes */}
      <div style={{ position: "absolute", top: -40, right: -20, width: 180, height: 180, borderRadius: "50%", background: C.amarillo + "12" }} />
      <div style={{ position: "absolute", bottom: -50, left: 40, width: 140, height: 140, borderRadius: "50%", background: C.verde + "10" }} />
      <div style={{ position: "absolute", top: "50%", right: "30%", width: 60, height: 60, borderRadius: "50%", background: C.lila + "15" }} />

      <div style={{ position: "relative" }}>
        {/* Top label */}
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 9, letterSpacing: 3,
          color: C.amarillo, opacity: 0.7,
          marginBottom: 16,
        }}>
          ECOSISTEMA PERSONAL · RAÍZ · TALLO · FLOR
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
          <div>
            <h1 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 42, fontWeight: 400,
              fontStyle: "italic",
              color: C.blanco,
              margin: 0, lineHeight: 1.1,
            }}>
              Hola, Paola<span style={{ color: C.amarillo }}>.</span>
            </h1>
            <p style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 13, color: C.gris,
              marginTop: 10, lineHeight: 1.5,
            }}>
              {dayName}, {d.getDate()} de {MONTHS[d.getMonth()]}
              <span style={{ color: C.terracota, margin: "0 8px" }}>·</span>
              {todayHabits}/{HABITS.length} hábitos hoy
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["raiz","tallo","flor"].map(p => {
              const info = PILAR[p];
              return (
                <div key={p} style={{
                  padding: "8px 14px", borderRadius: 14,
                  background: info.color + "15",
                  border: `1px solid ${info.color}30`,
                  display: "flex", flexDirection: "column", gap: 3,
                }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 1.5, color: info.color }}>{info.label}</span>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: C.gris, opacity: 0.7 }}>{info.sub}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quote */}
        <div style={{
          marginTop: 24,
          padding: "14px 20px",
          borderLeft: `3px solid ${C.amarillo}`,
          background: C.blanco + "05",
          borderRadius: "0 12px 12px 0",
        }}>
          <p style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 14, fontStyle: "italic",
            fontWeight: 400,
            color: C.blanco, opacity: 0.7,
            margin: 0, lineHeight: 1.6,
          }}>
            "Menos carga mental. Más enfoque. No porque te esfuerces más — sino porque diseñas mejor."
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── HABIT TRACKER ────────────────────────────────────────────────────────────

function HabitTracker({ data, update }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const week = weekDates(weekOffset);
  const td = today();

  const toggle = (dateStr, habitId) => {
    const h = { ...data.habits };
    if (!h[dateStr]) h[dateStr] = {};
    h[dateStr][habitId] = !h[dateStr][habitId];
    update({ habits: h });
  };

  const setLabel = (habitId, val) => {
    const labels = { ...data.habitLabels, [habitId]: val };
    update({ habitLabels: labels });
  };

  const pilares = ["raiz", "tallo", "flor"];

  return (
    <Card>
      <SectionHead num="01" title="Tracker de Hábitos" />

      {/* Week navigation */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 20, padding: "10px 14px", borderRadius: 12,
        background: C.amarilloSoft + "60",
        border: `1px solid ${C.gris}20`,
      }}>
        <div
          onClick={() => setWeekOffset(weekOffset - 1)}
          style={{
            width: 34, height: 34, borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", background: C.blanco,
            border: `1px solid ${C.gris}40`,
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 18, color: C.madera, userSelect: "none",
          }}
        >‹</div>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 500, color: C.negro }}>
            {weekLabel(weekOffset)}
          </div>
          {weekOffset !== 0 && (
            <span
              onClick={() => setWeekOffset(0)}
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 9, color: C.terracota,
                cursor: "pointer", letterSpacing: 0.5,
              }}
            >← volver a hoy</span>
          )}
        </div>

        <div
          onClick={() => setWeekOffset(weekOffset + 1)}
          style={{
            width: 34, height: 34, borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", background: C.blanco,
            border: `1px solid ${C.gris}40`,
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 18, color: C.madera, userSelect: "none",
          }}
        >›</div>
      </div>

      {/* Weekly grid */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 2px" }}>
          <thead>
            <tr>
              <th style={{ width: 220 }} />
              {week.map((d, i) => {
                const ds = d.toISOString().slice(0, 10);
                const isToday = ds === td;
                return (
                  <th key={i} style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 9, letterSpacing: 1.2,
                    color: isToday ? C.terracota : C.madera,
                    padding: "8px 0", textAlign: "center",
                    fontWeight: isToday ? 700 : 400,
                  }}>
                    {DAYS[i]}
                    <div style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 15, fontWeight: isToday ? 700 : 400,
                      color: isToday ? C.terracota : C.negro,
                      marginTop: 2,
                    }}>{d.getDate()}</div>
                    {isToday && <div style={{
                      width: 4, height: 4, borderRadius: "50%",
                      background: C.terracota, margin: "4px auto 0",
                    }} />}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pilares.map((pilar, pi) => (
              HABITS.filter(h => h.pilar === pilar).map((habit, hi) => (
                <tr key={habit.id}>
                  <td style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 13, color: C.negro,
                    padding: "7px 8px 7px 0", whiteSpace: "nowrap",
                    borderTop: hi === 0 && pi > 0 ? `1px solid ${C.gris}25` : "none",
                    paddingTop: hi === 0 && pi > 0 ? 14 : 7,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {hi === 0 ? (
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: PILAR[pilar].color, flexShrink: 0 }} />
                      ) : (
                        <span style={{ width: 5 }} />
                      )}
                      {habit.editable ? (
                        <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          {habit.label}
                          <input
                            type="text"
                            value={data.habitLabels?.[habit.id] || ""}
                            onChange={e => setLabel(habit.id, e.target.value)}
                            placeholder={habit.placeholder}
                            onClick={e => e.stopPropagation()}
                            style={{
                              width: 130, padding: "2px 6px",
                              fontFamily: "'Space Grotesk', sans-serif",
                              fontSize: 12, fontStyle: "italic",
                              border: "none",
                              borderBottom: `1px dashed ${C.gris}60`,
                              background: "transparent", color: C.terracota, outline: "none",
                            }}
                          />
                        </span>
                      ) : habit.label}
                    </div>
                  </td>
                  {week.map((d, di) => {
                    const ds = d.toISOString().slice(0, 10);
                    const done = data.habits[ds]?.[habit.id];
                    const isToday = ds === td;
                    return (
                      <td key={di} style={{
                        textAlign: "center", padding: "4px 0",
                        borderTop: hi === 0 && pi > 0 ? `1px solid ${C.gris}25` : "none",
                        paddingTop: hi === 0 && pi > 0 ? 14 : 4,
                      }}>
                        <div
                          onClick={() => toggle(ds, habit.id)}
                          style={{
                            width: 28, height: 28, borderRadius: 7,
                            margin: "0 auto", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: done ? PILAR[pilar].color + "18" : isToday ? C.amarillo + "08" : "white",
                            border: done
                              ? `2.5px solid ${PILAR[pilar].color}`
                              : `2px solid ${isToday ? C.gris + "80" : C.gris + "50"}`,
                            transition: "all 0.2s",
                          }}
                        >
                          {done && <span style={{ color: PILAR[pilar].color, fontSize: 13, fontWeight: 700 }}>✓</span>}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            ))}
          </tbody>
        </table>
      </div>

      {/* Pillar progress */}
      {(() => {
        const pilarMeta = {
          raiz:  { desc: "Tu base cognitiva y biológica." },
          tallo: { desc: "Lo que te rodea y puedes diseñar." },
          flor:  { desc: "Lo que conecta y circula con el mundo." },
        };
        const weekTotals = {};
        pilares.forEach(p => {
          const pHabits = HABITS.filter(h => h.pilar === p);
          const totalSlots = pHabits.length * 7;
          let doneSlots = 0;
          week.forEach(d => {
            const ds = d.toISOString().slice(0, 10);
            pHabits.forEach(h => { if (data.habits[ds]?.[h.id]) doneSlots++; });
          });
          weekTotals[p] = totalSlots > 0 ? Math.round((doneSlots / totalSlots) * 100) : 0;
        });
        return (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 20 }}>
            {pilares.map(p => {
              const pct = weekTotals[p];
              const info = PILAR[p];
              const meta = pilarMeta[p];
              return (
                <div key={p} style={{
                  padding: "14px 16px", borderRadius: 14,
                  background: info.soft + "50",
                  border: `1px solid ${info.color}20`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ fontSize: 13 }}>{info.icon}</span>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 1.2, color: info.color }}>{info.label}</span>
                    </div>
                    <span style={{
                      fontFamily: "'Fraunces', serif",
                      fontSize: 20, fontWeight: 400, fontStyle: "italic",
                      color: info.color,
                    }}>{pct}%</span>
                  </div>
                  <div style={{ height: 3, borderRadius: 2, background: C.blanco, marginBottom: 8 }}>
                    <div style={{
                      height: "100%", borderRadius: 2, background: info.color,
                      width: `${pct}%`, transition: "width 0.5s ease", opacity: 0.7,
                    }} />
                  </div>
                  <p style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 11, color: C.madera, lineHeight: 1.4, margin: 0,
                  }}>{meta.desc}</p>
                </div>
              );
            })}
          </div>
        );
      })()}
    </Card>
  );
}

// ─── WEEK DESIGN ──────────────────────────────────────────────────────────────

function WeekDesign({ data, update }) {
  const week = weekDates();
  const td = today();

  const blocks = [
    { label: "Profundo",  color: C.verde,     icon: "◆" },
    { label: "Creativo",  color: C.amarillo,  icon: "✦" },
    { label: "Operativo", color: C.terracota, icon: "●" },
    { label: "Descanso",  color: C.lila,      icon: "○" },
  ];

  const cycleBlock = (ds) => {
    const fb = { ...data.focusBlocks };
    const cur = blocks.findIndex(b => b.label === fb[ds]);
    fb[ds] = blocks[(cur + 1) % blocks.length].label;
    update({ focusBlocks: fb });
  };

  return (
    <Card>
      <SectionHead num="02" title="Diseño de Semana" />

      <div style={{ marginBottom: 22 }}>
        <label style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 9, letterSpacing: 1.8, color: C.madera,
          display: "block", marginBottom: 8,
        }}>TEMA ANCLA</label>
        <input
          type="text" value={data.weekTheme}
          onChange={e => update({ weekTheme: e.target.value })}
          placeholder="¿Qué pregunta o tensión guía esta semana?"
          style={{
            width: "100%", padding: "11px 14px",
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 13,
            border: `1.5px solid ${C.gris}40`, borderRadius: 10,
            background: "white", color: C.negro, outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div style={{ marginBottom: 22 }}>
        <label style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 9, letterSpacing: 1.8, color: C.madera,
          display: "block", marginBottom: 10,
        }}>3 VICTORIAS CLAVE</label>
        {[0, 1, 2].map(i => {
          const done = data.victoriesDone?.[i];
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 11, color: C.terracota,
                fontWeight: 600, minWidth: 20,
              }}>0{i + 1}</span>
              <input
                type="text" value={data.victories[i]}
                onChange={e => {
                  const v = [...data.victories];
                  v[i] = e.target.value;
                  update({ victories: v });
                }}
                placeholder={`Victoria ${i + 1}`}
                style={{
                  flex: 1, padding: "10px 12px",
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: 13,
                  border: `1px solid ${C.gris}30`, borderRadius: 8,
                  background: done ? C.verdeSoft + "60" : data.victories[i] ? C.verdeSoft + "20" : "white",
                  color: done ? C.madera : C.negro, outline: "none",
                  textDecoration: done ? "line-through" : "none",
                  opacity: done ? 0.7 : 1,
                }}
              />
              <div
                onClick={() => {
                  const vd = [...(data.victoriesDone || [false,false,false])];
                  vd[i] = !vd[i];
                  update({ victoriesDone: vd });
                }}
                style={{
                  width: 26, height: 26, borderRadius: "50%",
                  border: `2px solid ${done ? C.verde : C.gris}`,
                  background: done ? C.verde : "transparent",
                  cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s", flexShrink: 0,
                }}
              >
                {done && <span style={{ color: "white", fontSize: 13, fontWeight: 700 }}>✓</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6, flexWrap: "wrap" }}>
          <label style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 1.8, color: C.madera }}>
            BLOQUES DE ENFOQUE
          </label>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {blocks.map(b => (
              <span key={b.label} style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 9, color: b.color,
                display: "flex", alignItems: "center", gap: 4,
              }}>
                {b.icon} {b.label}
              </span>
            ))}
          </div>
        </div>
        <p style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 11, color: C.madera, opacity: 0.7,
          marginBottom: 10, lineHeight: 1.5,
        }}>
          🖱️ Hacé click en cada día para asignarle un tipo de energía. Así diseñás la semana antes de que te pase.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
          {week.map((d, i) => {
            const ds = d.toISOString().slice(0, 10);
            const isT = ds === td;
            const bk = blocks.find(b => b.label === data.focusBlocks[ds]);
            return (
              <div key={i} onClick={() => cycleBlock(ds)} style={{
                textAlign: "center", padding: "12px 4px", borderRadius: 12,
                cursor: "pointer", minHeight: 72,
                background: isT ? C.amarillo + "12" : "white",
                border: isT ? `2px solid ${C.amarillo}60` : `1px solid ${C.gris}25`,
                transition: "all 0.2s",
              }}>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 9, letterSpacing: 1,
                  color: isT ? C.terracota : C.madera,
                }}>{DAYS[i]}</div>
                <div style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 17, color: C.negro,
                  fontWeight: isT ? 700 : 400, margin: "2px 0",
                }}>{d.getDate()}</div>
                {bk && <div style={{ fontSize: 15, color: bk.color, marginTop: 4 }}>{bk.icon}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

// ─── INBOX MENTAL ─────────────────────────────────────────────────────────────

function Inbox({ data, update }) {
  const [txt, setTxt] = useState("");

  const add = () => {
    if (!txt.trim()) return;
    update({ inbox: [{ text: txt.trim(), ts: Date.now(), done: false }, ...data.inbox] });
    setTxt("");
  };

  const toggle = i => {
    const inbox = [...data.inbox];
    inbox[i] = { ...inbox[i], done: !inbox[i].done };
    update({ inbox });
  };

  const remove = i => update({ inbox: data.inbox.filter((_, j) => j !== i) });
  const pending = data.inbox.filter(x => !x.done).length;

  return (
    <Card style={{ padding: "20px 28px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: 2.5, color: C.terracota, opacity: 0.8 }}>🧠</span>
        <h2 style={{ fontFamily: "'Museo Moderno', 'MuseoModerno', sans-serif", fontSize: 16, color: C.negro, margin: 0, fontWeight: 700 }}>
          Inbox Mental
        </h2>
        <Pill pilar="raiz" micro />
        {pending > 0 && (
          <span style={{
            fontFamily: "'Space Mono', monospace", fontSize: 9,
            background: C.terracotaSoft, color: C.terracota,
            padding: "2px 8px", borderRadius: 10, marginLeft: "auto",
          }}>{pending} abiertas</span>
        )}
      </div>

      {/* Quick capture row */}
      <div style={{ display: "flex", gap: 8, marginBottom: data.inbox.length ? 12 : 0 }}>
        <input
          type="text" value={txt}
          onChange={e => setTxt(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()}
          placeholder="💭 Capturá lo que tengas en la cabeza — Enter para guardar"
          style={{
            flex: 1, padding: "11px 16px",
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 13,
            border: `1.5px solid ${C.gris}40`, borderRadius: 10,
            background: "white", color: C.negro, outline: "none",
          }}
        />
        <button onClick={add} style={{
          padding: "11px 20px",
          fontFamily: "'Space Mono', monospace",
          fontSize: 14, fontWeight: 700,
          background: C.verde, color: "white",
          border: "none", borderRadius: 10, cursor: "pointer",
          flexShrink: 0,
        }}>+</button>
      </div>

      {data.inbox.length > 0 && (
        <div style={{ maxHeight: 180, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
          {data.inbox.map((item, i) => (
            <div key={item.ts} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 12px", borderRadius: 9,
              background: item.done ? C.verdeSoft + "50" : `${C.gris}10`,
              border: `1px solid ${C.gris}18`,
            }}>
              <div onClick={() => toggle(i)} style={{
                width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                border: `2px solid ${item.done ? C.verde : C.gris}`,
                background: item.done ? C.verde : "transparent",
                cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center",
              }}>
                {item.done && <span style={{ color: "white", fontSize: 10 }}>✓</span>}
              </div>
              <span style={{
                flex: 1,
                fontFamily: "'Space Grotesk', sans-serif", fontSize: 13,
                color: item.done ? C.madera : C.negro,
                textDecoration: item.done ? "line-through" : "none",
                opacity: item.done ? 0.5 : 1,
              }}>{item.text}</span>
              <span onClick={() => remove(i)} style={{
                cursor: "pointer", color: C.gris, fontSize: 15,
                padding: "0 4px", lineHeight: 1,
                transition: "color 0.15s",
              }}
                onMouseEnter={e => e.currentTarget.style.color = C.terracota}
                onMouseLeave={e => e.currentTarget.style.color = C.gris}
              >×</span>
            </div>
          ))}
        </div>
      )}

      {data.inbox.length === 0 && (
        <p style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 13, fontStyle: "italic",
          color: C.gris, margin: 0, textAlign: "center", paddingTop: 4,
        }}>✨ Mente clara. Sin pestañas abiertas.</p>
      )}
    </Card>
  );
}

// ─── ENERGY TRACKER ───────────────────────────────────────────────────────────

function Energy({ data, update }) {
  const week = weekDates();
  const td = today();

  const setLevel = (ds, lvl) => {
    const e = { ...data.energy };
    e[ds] = e[ds] === lvl ? 0 : lvl;
    update({ energy: e });
  };

  const lvlColors = ["", C.gris, C.lila, C.terracota, C.verde, "#5A8A6E"];
  const lvlLabels = ["", "Baja", "Media-B", "Media", "Media-A", "Alta"];

  return (
    <Card>
      <SectionHead num="04" title="Energía Semanal">
        <Pill pilar="raiz" micro />
      </SectionHead>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 10 }}>
        {week.map((d, i) => {
          const ds = d.toISOString().slice(0, 10);
          const isT = ds === td;
          const lvl = data.energy[ds] || 0;
          return (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 9, letterSpacing: 1,
                color: isT ? C.terracota : C.madera,
                marginBottom: 8, fontWeight: isT ? 700 : 400,
              }}>{DAYS[i]}</div>

              <div style={{
                padding: "10px 2px", borderRadius: 14,
                background: isT ? C.amarillo + "10" : "transparent",
                border: isT ? `1.5px solid ${C.amarillo}50` : "1.5px solid transparent",
                display: "flex", flexDirection: "column",
                gap: 5, alignItems: "center",
              }}>
                {[5,4,3,2,1].map(l => (
                  <div
                    key={l}
                    onClick={() => setLevel(ds, l)}
                    style={{
                      width: 36, height: 11, borderRadius: 6,
                      background: l <= lvl ? lvlColors[lvl] : C.gris + "22",
                      cursor: "pointer", transition: "all 0.25s",
                      border: l <= lvl ? `1px solid ${lvlColors[lvl]}50` : `1px solid ${C.gris}15`,
                    }}
                  />
                ))}
              </div>

              {lvl > 0 && (
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 8, color: lvlColors[lvl],
                  marginTop: 6, fontWeight: 500,
                }}>{lvlLabels[lvl]}</div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── REFLECTION ───────────────────────────────────────────────────────────────

function Reflection({ data, update }) {
  const td = today();
  const ref = data.reflections[td] || { learned: "", worked: "", design: "" };
  const saved = data.reflectionsSaved?.[td] || {};

  const set = (k, v) => {
    update({ reflections: { ...data.reflections, [td]: { ...ref, [k]: v } } });
  };

  const toggleSaved = (k) => {
    const rs = { ...data.reflectionsSaved };
    if (!rs[td]) rs[td] = {};
    rs[td][k] = !rs[td]?.[k];
    update({ reflectionsSaved: rs });
  };

  const qs = [
    { k: "learned", label: "¿Qué aprendí hoy?",       icon: "🌱", pilar: "raiz" },
    { k: "worked",  label: "¿Qué funcionó bien?",      icon: "🌿", pilar: "tallo" },
    { k: "design",  label: "¿Qué diseño para mañana?", icon: "🌸", pilar: "flor" },
  ];

  return (
    <div style={{
      background: C.negro,
      borderRadius: 20, padding: "28px 30px",
      position: "relative", overflow: "hidden",
      border: `1px solid ${C.negro}`,
    }}>
      <div style={{ position: "absolute", top: -20, right: -10, width: 120, height: 120, borderRadius: "50%", background: C.lila + "12" }} />
      <div style={{ position: "absolute", bottom: -30, left: 30, width: 80, height: 80, borderRadius: "50%", background: C.verde + "10" }} />

      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: 2.5, color: C.terracota, opacity: 0.8 }}>05</span>
          <h2 style={{ fontFamily: "'Museo Moderno', 'MuseoModerno', sans-serif", fontSize: 18, color: C.blanco, margin: 0, fontWeight: 700 }}>
            Reflexión de Cierre
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {qs.map(q => {
            const isDone = saved[q.k];
            const pilarColor = PILAR[q.pilar].color;
            const pilarSoft  = PILAR[q.pilar].soft;
            return (
              <div key={q.k} style={{
                borderRadius: 14,
                border: `1px solid ${pilarColor}30`,
                background: pilarColor + "10",
                padding: "14px 16px",
              }}>
                {/* Pilar label bar */}
                <div style={{
                  display: "flex", alignItems: "center",
                  gap: 8, marginBottom: 10,
                }}>
                  <span style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 9, letterSpacing: 1.5,
                    color: pilarColor,
                    background: pilarColor + "20",
                    padding: "3px 10px", borderRadius: 20,
                    border: `1px solid ${pilarColor}40`,
                  }}>
                    {PILAR[q.pilar].icon} {PILAR[q.pilar].label}
                  </span>
                  <label style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 13, fontWeight: 500,
                    color: C.blanco, opacity: 0.9, flex: 1,
                  }}>{q.label}</label>
                  {isDone && (
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: C.verde, opacity: 0.8 }}>✓ guardado</span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <textarea
                    value={ref[q.k]} onChange={e => set(q.k, e.target.value)}
                    rows={2}
                    style={{
                      flex: 1, padding: "10px 12px",
                      fontFamily: "'Space Grotesk', sans-serif", fontSize: 13,
                      border: `1.5px solid ${isDone ? C.verde + "60" : pilarColor + "25"}`,
                      borderRadius: 10,
                      background: isDone ? C.verde + "15" : C.blanco + "06",
                      color: C.blanco, outline: "none", resize: "none", lineHeight: 1.5,
                      boxSizing: "border-box",
                    }}
                  />
                  <div
                    onClick={() => toggleSaved(q.k)}
                    style={{
                      width: 30, height: 30, borderRadius: "50%", flexShrink: 0, marginTop: 4,
                      border: `2px solid ${isDone ? C.verde : pilarColor + "60"}`,
                      background: isDone ? C.verde : "transparent",
                      cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s",
                    }}
                  >
                    {isDone
                      ? <span style={{ color: "white", fontSize: 13, fontWeight: 700 }}>✓</span>
                      : <span style={{ color: pilarColor, fontSize: 14, opacity: 0.6 }}>○</span>
                    }
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── STICKY BOARD ─────────────────────────────────────────────────────────────

const STICKY_COLORS = [
  { bg: "#FDF3D7", border: "#F5C842", shadow: "#F5C84220" },
  { bg: "#F9EBE6", border: "#F2D4CC", shadow: "#F2D4CC20" },
  { bg: "#EAE5F0", border: "#9B8FB0", shadow: "#9B8FB020" },  // lila actualizado
  { bg: "#D4E4DA", border: "#7C9E8A", shadow: "#7C9E8A20" },
  { bg: "#F0DDD3", border: "#C97B5A", shadow: "#C97B5A20" },
];

function StickyBoard({ data, update }) {
  const notes = data.stickyNotes || [];

  const addNote = () => {
    update({ stickyNotes: [...notes, {
      id: Date.now(), text: "", date: "",
      color: notes.length % STICKY_COLORS.length,
      rotation: Math.round((Math.random() - 0.5) * 5 * 10) / 10,
    }]});
  };

  const updateNote = (id, field, val) => {
    update({ stickyNotes: notes.map(n => n.id === id ? { ...n, [field]: val } : n) });
  };

  const removeNote = (id) => {
    update({ stickyNotes: notes.filter(n => n.id !== id) });
  };

  return (
    <div style={{
      borderRadius: 20, padding: "28px 30px",
      background: `
        radial-gradient(circle at 20% 80%, ${C.terracota}06 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, ${C.lila}08 0%, transparent 50%),
        linear-gradient(135deg, ${C.madera}08 0%, ${C.gris}15 50%, ${C.madera}06 100%)
      `,
      border: `1px solid ${C.madera}20`,
      position: "relative",
    }}>
      <div style={{
        position: "absolute", inset: 0, borderRadius: 20, opacity: 0.025,
        backgroundImage: `radial-gradient(${C.negro} 1px, transparent 1px)`,
        backgroundSize: "16px 16px", pointerEvents: "none",
      }} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, position: "relative" }}>
        <SectionHead num="06" title="Mi Pizarrón" />
        <div
          onClick={addNote}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 10,
            background: C.blanco, border: `1.5px solid ${C.gris}40`,
            cursor: "pointer",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 12, color: C.madera, fontWeight: 500,
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Nueva nota
        </div>
      </div>

      {notes.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px", position: "relative" }}>
          <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.35 }}>📌</div>
          <p style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 15, fontStyle: "italic",
            color: C.madera, opacity: 0.55, margin: 0,
          }}>Tu pizarrón está vacío. Colgá tu primera nota.</p>
        </div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
        gap: 16, position: "relative",
      }}>
        {notes.map(note => {
          const palette = STICKY_COLORS[note.color % STICKY_COLORS.length];
          return (
            <div
              key={note.id}
              style={{
                background: palette.bg,
                border: `1px solid ${palette.border}40`,
                borderRadius: 4, padding: "14px 14px 12px",
                minHeight: 150, display: "flex", flexDirection: "column",
                position: "relative",
                transform: `rotate(${note.rotation}deg)`,
                boxShadow: `2px 3px 8px ${palette.shadow}, 0 1px 2px ${C.negro}08`,
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "rotate(0deg) translateY(-2px)";
                e.currentTarget.style.boxShadow = `3px 5px 14px ${palette.shadow}, 0 2px 4px ${C.negro}10`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = `rotate(${note.rotation}deg)`;
                e.currentTarget.style.boxShadow = `2px 3px 8px ${palette.shadow}, 0 1px 2px ${C.negro}08`;
              }}
            >
              <div style={{
                position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)",
                width: 8, height: 8, borderRadius: "50%",
                background: palette.border, opacity: 0.5,
              }} />
              <input
                type="text" value={note.date}
                onChange={e => updateNote(note.id, "date", e.target.value)}
                placeholder="fecha..."
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 9, letterSpacing: 0.8,
                  color: C.madera, opacity: 0.7,
                  border: "none", background: "transparent",
                  outline: "none", padding: "0 0 6px",
                  marginTop: 10, width: "80%",
                }}
              />
              <textarea
                value={note.text}
                onChange={e => updateNote(note.id, "text", e.target.value)}
                placeholder="Escribí tu nota..."
                style={{
                  flex: 1, border: "none", background: "transparent",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 13, color: C.negro,
                  outline: "none", resize: "none", lineHeight: 1.5, padding: 0,
                }}
              />
              {/* Borrar button at bottom */}
              <div
                onClick={() => removeNote(note.id)}
                style={{
                  marginTop: 10,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                  padding: "5px 0",
                  borderTop: `1px dashed ${palette.border}40`,
                  cursor: "pointer",
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 9, letterSpacing: 1,
                  color: palette.border, opacity: 0.5,
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
              >
                🗑 borrar
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <div style={{ textAlign: "center", padding: "32px 20px" }}>
      <p style={{
        fontFamily: "'Fraunces', serif",
        fontSize: 16, fontStyle: "italic", fontWeight: 400,
        color: C.madera, margin: 0,
      }}>
        La estructura es lo que sostiene la ambición.
      </p>
      <p style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 9, letterSpacing: 2.5,
        color: C.gris, marginTop: 10,
      }}>
        — PAOLA ZERPA · DISEÑO & SISTEMAS
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 12 }}>
        {[C.verde, C.terracota, C.lila].map((c, i) => (
          <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: c }} />
        ))}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load().then(d => { setData(d); setLoading(false); }); }, []);

  const update = (patch) => {
    const next = { ...data, ...patch };
    setData(next);
    save(next);
  };

  if (loading || !data) return (
    <div style={{
      minHeight: "100vh", background: C.negro,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 16,
    }}>
      <div style={{ display: "flex", gap: 6 }}>
        {[C.verde, C.terracota, C.lila].map((c, i) => (
          <span key={i} style={{
            width: 6, height: 6, borderRadius: "50%", background: c,
            animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
      <p style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 10, letterSpacing: 3,
        color: C.madera,
      }}>CARGANDO ECOSISTEMA...</p>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,300;1,400;1,500&family=Museo+Moderno:wght@600;700&family=Space+Grotesk:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #E8E3DC; }
        input, textarea { transition: border-color 0.2s; }
        input:focus, textarea:focus { border-color: ${C.terracota} !important; }
        input::placeholder, textarea::placeholder { color: ${C.gris}; opacity: 0.8; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.gris}; border-radius: 2px; }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
      <div style={{
        maxWidth: 940, margin: "0 auto",
        padding: "24px 16px 48px",
        display: "flex", flexDirection: "column", gap: 20,
      }}>
        <Header data={data} />
        <Inbox data={data} update={update} />
        <HabitTracker data={data} update={update} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>
          <WeekDesign data={data} update={update} />
          <Energy data={data} update={update} />
        </div>
        <Reflection data={data} update={update} />
        <StickyBoard data={data} update={update} />
        <Footer />
      </div>
    </>
  );
}
