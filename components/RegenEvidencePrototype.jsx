"use client";

import React, { useMemo, useState } from "react";

// --- Mock dataset (blend of quant + qual) ---
const DATA = [
  {
    id: "LM-2022-WO-ORC",
    title: "Living Mulch in Winter Oats",
    approach: ["Living mulches", "Cover crops"],
    crop: "Cereals",
    region: "Oxfordshire",
    distanceKm: 42,
    confidence: "Medium",
    evidence: ["Field trial", "Scorecards"],
    outcomes: [
      { type: "Yield", value: "−30% (vs control)", tone: "neg" },
      { type: "Soil", value: "N↑, worms↑", tone: "pos" },
      { type: "Weeds", value: "Grasses↑, grazing helps", tone: "warn" },
    ],
    bullets: [
      "Yield penalty in year 1; soil indicators up",
      "Direct drill into established clover; graze/mow to knock back",
      "Bushel weight similar; numerical weather TBD",
    ],
    advisor: {
      table: [
        ["Yield (t/ha)", "LM 3.22", "Ctrl 4.57"],
        ["Bushel weight (kg/hl)", "56.0", "56.7"],
        ["Worms (#/20cm³)", "↑ vs ctrl", "—"],
      ],
    },
    year: 2022,
  },
  {
    id: "NI-Yatesbury-2000s",
    title: "Non-Inversion Tillage – Yatesbury Case Study",
    approach: ["Reduced/No-till", "Grazing integration"],
    crop: "Cereals",
    region: "Wiltshire",
    distanceKm: 135,
    confidence: "Low",
    evidence: ["Case study"],
    outcomes: [
      { type: "Soil", value: "Structure↑", tone: "pos" },
      { type: "Weeds", value: "Manageable with stale seedbeds", tone: "warn" },
    ],
    bullets: [
      "Shallow cultivations (Horsch/Lemken); repeated stale seedbeds",
      "Occasional ploughing used for reset",
      "No quantified yields reported",
    ],
    advisor: { table: [["Depth", "Shallow (≤10 cm)", "—"]] },
    year: 2007,
  },
  {
    id: "LEGSIL-meta",
    title: "LEGSIL: Grass-Clover & Lucerne Silage",
    approach: ["Ley & pasture diversity"],
    crop: "Forage",
    region: "EU multi-site",
    distanceKm: 650,
    confidence: "High",
    evidence: ["Meta-trial", "Economics"],
    outcomes: [
      { type: "Yield", value: "+2.5 t DM/ha vs WC", tone: "pos" },
      { type: "Econ", value: "+20–29% profit vs grass", tone: "pos" },
    ],
    bullets: [
      "Lucerne highest yields; red clover most consistent",
      "Cost/ kg DM lower than fertilised grass",
      "Species choice by soil & cutting regime",
    ],
    advisor: { table: [["€/kg DM (silage)", "RC 0.086", "Grass 0.118"]] },
    year: 2007,
  },
  {
    id: "NI-Defra-ES0203",
    title: "Non-Inversion Tillage – Econ (Defra ES0203)",
    approach: ["Reduced/No-till"],
    crop: "Cereals",
    region: "England (clay loam)",
    distanceKm: 90,
    confidence: "Medium",
    evidence: ["Modelled"],
    outcomes: [
      { type: "Econ", value: "~£40/ha saving", tone: "pos" },
      { type: "Env", value: "N loss −6.8%, P −4%", tone: "pos" },
    ],
    bullets: [
      "Savings from machinery + nutrient retention",
      "Non-organic baseline; direction still relevant",
    ],
    advisor: { table: [["Soil", "Clay loam", "—"]] },
    year: 2007,
  },
];

// --- Small helpers ---
const toneStyles = {
  pos: "bg-emerald-50 text-emerald-700",
  neg: "bg-rose-50 text-rose-700",
  warn: "bg-amber-50 text-amber-800",
};

function Badge({ children, variant = "neutral" }) {
  const v =
    variant === "primary"
      ? "bg-black text-white"
      : variant === "soft"
      ? "bg-zinc-100 text-zinc-800"
      : "bg-zinc-200 text-zinc-800";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${v}`}>
      {children}
    </span>
  );
}

function OutcomePill({ type, value, tone }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${toneStyles[tone]}`}>
      <span className="font-semibold mr-1">{type}:</span> {value}
    </span>
  );
}

function Card({ item, onSave, onCompare, onDetails, saved, compared }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {item.approach.map((a) => (
          <Badge key={a} variant="soft">{a}</Badge>
        ))}
        <Badge>{item.crop}</Badge>
        <Badge variant="soft">{item.region}</Badge>
        <Badge variant="soft">{Math.round(item.distanceKm)} km</Badge>
        <Badge variant="soft">Confidence: {item.confidence}</Badge>
      </div>
      <h3 className="text-lg font-semibold mb-2 text-zinc-800">{item.title}</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {item.outcomes.map((o, idx) => (
          <OutcomePill key={idx} {...o} />
        ))}
      </div>
      <ul className="text-sm text-zinc-700 list-disc pl-5 space-y-1 mb-4">
        {item.bullets.map((b, i) => (<li key={i}>{b}</li>))}
      </ul>
      <div className="flex gap-2">
        <button onClick={() => onSave(item)} className={`rounded-xl px-3 py-2 text-sm border ${saved ? "bg-zinc-900 text-white" : "bg-white text-zinc-900"}`}>
          {saved ? "Saved" : "Save"}
        </button>
        <button onClick={() => onCompare(item)} className={`rounded-xl px-3 py-2 text-sm border ${compared ? "bg-zinc-900 text-white" : "bg-white text-zinc-900"}`}>
          {compared ? "In Compare" : "Compare"}
        </button>
        <button onClick={() => onDetails(item)} className="rounded-xl px-3 py-2 text-sm bg-zinc-900 text-white">
          Details
        </button>
      </div>
    </div>
  );
}

function Drawer({ open, onClose, item }) {
  if (!open || !item) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl p-6 overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-semibold">{item.title}</h3>
        <button onClick={onClose} className="text-zinc-600 hover:text-zinc-900">Close</button>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {item.approach.map((a) => (<Badge key={a} variant="soft">{a}</Badge>))}
          <Badge>{item.crop}</Badge>
          <Badge variant="soft">{item.region}</Badge>
          <Badge variant="soft">Confidence: {item.confidence}</Badge>
        </div>
        <div className="space-y-2 mb-6">
          {item.bullets.map((b, i) => (<p key={i} className="text-zinc-700">• {b}</p>))}
        </div>
        <h4 className="font-semibold mb-2">Advisor details</h4>
        <div className="overflow-hidden rounded-xl border">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="text-left px-3 py-2">Metric</th>
                <th className="text-left px-3 py-2">Treatment</th>
                <th className="text-left px-3 py-2">Control</th>
              </tr>
            </thead>
            <tbody>
              {item.advisor?.table?.map((row, i) => (
                <tr key={i} className="odd:bg-white even:bg-zinc-50">
                  {row.map((cell, j) => (<td key={j} className="px-3 py-2">{cell}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 text-xs text-zinc-500">
          <p>Provenance: Structured numbers + AI summary. Link to source PDF in production.</p>
        </div>
      </div>
    </div>
  );
}

function Chip({ label, active, onClick }) {
  return (
    <button onClick={onClick} className={`rounded-full border px-3 py-1 text-sm ${active ? "bg-zinc-900 text-white" : "bg-white text-zinc-800"}`}>
      {label}
    </button>
  );
}

export default function RegenEvidencePrototype() {
  const [step, setStep] = useState("onboarding");
  const [postcode, setPostcode] = useState("");
  const [crop, setCrop] = useState("Cereals");
  const [approaches, setApproaches] = useState(["Living mulches", "Reduced/No-till"]);
  const [saved, setSaved] = useState([]);
  const [compare, setCompare] = useState([]);
  const [drawerItem, setDrawerItem] = useState(null);

  const toggleApproach = (a) =>
    setApproaches((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const data = useMemo(() => {
    return DATA.filter((d) =>
      (crop ? d.crop === crop || (crop === "Cereals" && d.crop === "Cereals") : true) &&
      (approaches.length ? approaches.some((a) => d.approach.includes(a)) : true)
    ).sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
  }, [crop, approaches]);

  const handleSave = (item) => {
    setSaved((prev) => (prev.includes(item.id) ? prev.filter((x) => x !== item.id) : [...prev, item.id]));
  };
  const handleCompare = (item) => {
    setCompare((prev) => {
      const next = prev.includes(item.id) ? prev.filter((x) => x !== item.id) : [...prev, item.id];
      return next.slice(-2); // keep max 2
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-zinc-900" />
            <span className="font-semibold text-zinc-900">Seeds • Evidence</span>
          </div>
          <div className="text-sm text-zinc-600">{step === "feed" ? "Personalised feed" : "Onboarding"}</div>
        </div>
      </header>

      {step === "onboarding" && (
        <main className="max-w-4xl mx-auto px-4 py-10">
          <h1 className="text-2xl font-semibold mb-2 text-zinc-900">Tell us a bit about your farm</h1>
          <p className="text-zinc-600 mb-6">So we can personalise the evidence we show you. You can change this anytime.</p>

          <div className="grid gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-800">📍 Postcode or region (optional)</label>
              <input
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                placeholder="e.g. SY1 or Shropshire"
                className="w-full rounded-xl border px-3 py-2 bg-white"/>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-800">🌾 Main crop/system</label>
              <div className="flex flex-wrap gap-2">
                {['Cereals','Dairy','Mixed','Horticulture','Forage'].map((c) => (
                  <Chip key={c} label={c} active={crop===c} onClick={() => setCrop(c)} />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-800">🌱 Approaches you’re curious about</label>
              <div className="flex flex-wrap gap-2">
                {['Cover crops','Living mulches','Reduced/No-till','Ley & pasture diversity','Grazing integration','Agroforestry'].map((a) => (
                  <Chip key={a} label={a} active={approaches.includes(a)} onClick={() => toggleApproach(a)} />
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button onClick={() => setStep('feed')} className="rounded-xl px-4 py-2 bg-zinc-900 text-white">Show my feed</button>
            </div>
          </div>
        </main>
      )}

      {step === "feed" && (
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm text-zinc-600 mr-2">Filters:</span>
            <Chip label={crop ?? 'Any crop'} active onClick={() => {}} />
            {approaches.map((a) => (
              <Chip key={a} label={a} active onClick={() => toggleApproach(a)} />
            ))}
            <span className="ml-auto text-sm text-zinc-600">Saved: {saved.length} · Compare: {compare.length}/2</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {data.map((item) => (
              <Card
                key={item.id}
                item={item}
                onSave={handleSave}
                onCompare={handleCompare}
                onDetails={setDrawerItem}
                saved={saved.includes(item.id)}
                compared={compare.includes(item.id)}
              />
            ))}
          </div>

          {compare.length === 2 && (
            <div className="mt-8 rounded-2xl border bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Compare</h3>
                <button className="text-sm text-zinc-600" onClick={()=>setCompare([])}>Clear</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {compare.map((id) => {
                  const item = DATA.find((d) => d.id === id);
                  return (
                    <div key={id} className="rounded-xl border p-4">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {item.approach.map((a) => <Badge key={a} variant="soft">{a}</Badge>)}
                        <Badge>{item.crop}</Badge>
                        <Badge variant="soft">Conf: {item.confidence}</Badge>
                      </div>
                      <div className="text-sm font-semibold mb-2">{item.title}</div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {item.outcomes.map((o, i)=> <OutcomePill key={i} {...o} />)}
                      </div>
                      <ul className="text-sm text-zinc-700 list-disc pl-4 space-y-1">
                        {item.bullets.map((b,i)=> <li key={i}>{b}</li>)}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      )}

      <Drawer open={!!drawerItem} onClose={()=>setDrawerItem(null)} item={drawerItem} />

      <footer className="border-t mt-10">
        <div className="max-w-6xl mx-auto px-4 py-6 text-xs text-zinc-500 flex flex-wrap gap-3">
          <span>Prototype UI · All data illustrative</span>
          <span>·</span>
          <span>Structured DB + AI summaries + Approaches/Location/Crop facets</span>
        </div>
      </footer>
    </div>
  );
}
