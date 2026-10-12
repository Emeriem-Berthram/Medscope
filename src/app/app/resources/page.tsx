const RESOURCES: Record<string, { type: string; title: string }[]> = {
  "Internal Medicine": [
    { type: "Checklist", title: "Long case presentation mark sheet" },
    { type: "Quick reference", title: "Scores and classifications you must know" },
    { type: "Case presentation", title: "Presenting chest pain: a model answer" },
    { type: "Checklist", title: "Acute abdomen examination station" },
  ],
  Surgery: [
    { type: "Checklist", title: "Pre-op examination station checklist" },
    { type: "Quick reference", title: "Surgical scores and staging tables" },
    { type: "Case presentation", title: "Presenting an acute abdomen" },
    { type: "Quick reference", title: "Suture sizes and wound closure" },
  ],
  Paediatrics: [
    { type: "Checklist", title: "Under-five assessment station marks" },
    { type: "Quick reference", title: "Immunisation schedules and growth charts" },
    { type: "Case presentation", title: "The febrile child: a model presentation" },
  ],
  "Obstetrics & Gynaecology": [
    { type: "Checklist", title: "Antenatal examination mark sheet" },
    { type: "Quick reference", title: "Partograph and labour stage tables" },
    { type: "Case presentation", title: "Presenting postpartum haemorrhage" },
  ],
  Psychiatry: [
    { type: "Checklist", title: "Mental state examination stations" },
    { type: "Quick reference", title: "ICD criteria summary sheets" },
    { type: "Case presentation", title: "Presenting psychosis: a model answer" },
  ],
  Radiology: [
    { type: "Quick reference", title: "Common films and their findings" },
    { type: "Checklist", title: "Film interpretation station marks" },
    { type: "Case presentation", title: "Reading a chest X-ray systematically" },
  ],
  Anaesthesia: [
    { type: "Checklist", title: "Airway assessment station" },
    { type: "Quick reference", title: "Anaesthesia machine check (CEEAP)" },
    { type: "Case presentation", title: "Presenting a difficult airway plan" },
  ],
  Pathology: [
    { type: "Quick reference", title: "Common stains and what they show" },
    { type: "Checklist", title: "Histopathology reporting station" },
    { type: "Case presentation", title: "Describing a blood film" },
  ],
};

const TYPE_STYLE: Record<string, string> = {
  Checklist: "bg-burgundy-500 text-white",
  "Quick reference": "border border-burgundy-200 text-burgundy-700",
  "Case presentation": "bg-burgundy-100 text-burgundy-900",
};

export default function Resources() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-burgundy-950">Free Resources</h1>
      <p className="mt-1 text-sm text-burgundy-800/70">
        Clinical exam prep — how to examine, what to say, and what the
        examiner will ask next. Written for your faculty and checked by
        clinicians.
      </p>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {Object.entries(RESOURCES).map(([faculty, items]) => (
          <section
            key={faculty}
            className="rounded-2xl border border-burgundy-100 bg-cream-50 p-6"
          >
            <h2 className="text-lg font-bold text-burgundy-700">{faculty}</h2>
            <ul className="mt-4 space-y-3">
              {items.map((item) => (
                <li
                  key={item.title}
                  className="flex items-center justify-between gap-4 rounded-xl border border-burgundy-50 p-3"
                >
                  <p className="font-medium text-burgundy-950">{item.title}</p>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${TYPE_STYLE[item.type]}`}
                  >
                    {item.type}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
