const RESOURCES = [
  {
    faculty: "Internal Medicine",
    items: [
      { type: "Checklist", title: "Long case presentation mark sheet" },
      { type: "Quick reference", title: "Scores and classifications you must know" },
      { type: "Case presentation", title: "Presenting chest pain: a model answer" },
    ],
  },
  {
    faculty: "Surgery",
    items: [
      { type: "Checklist", title: "Pre-op examination station checklist" },
      { type: "Quick reference", title: "Surgical scores and staging tables" },
      { type: "Case presentation", title: "Presenting an acute abdomen" },
    ],
  },
  {
    faculty: "Paediatrics",
    items: [
      { type: "Checklist", title: "Under-five assessment station marks" },
      { type: "Quick reference", title: "Immunisation schedules and growth charts" },
      { type: "Case presentation", title: "The febrile child: a model presentation" },
    ],
  },
  {
    faculty: "Obstetrics & Gynaecology",
    items: [
      { type: "Checklist", title: "Antenatal examination mark sheet" },
      { type: "Quick reference", title: "Partograph and labour stage tables" },
      { type: "Case presentation", title: "Presenting postpartum haemorrhage" },
    ],
  },
  {
    faculty: "Psychiatry",
    items: [
      { type: "Checklist", title: "Mental state examination stations" },
      { type: "Quick reference", title: "ICD criteria summary sheets" },
      { type: "Case presentation", title: "Presenting psychosis: a model answer" },
    ],
  },
  {
    faculty: "Radiology",
    items: [
      { type: "Quick reference", title: "Common films and their findings" },
      { type: "Checklist", title: "Film interpretation station marks" },
      { type: "Case presentation", title: "Reading a chest X-ray systematically" },
    ],
  },
];

const TYPES: Record<string, string> = {
  Checklist: "bg-teal-500 text-white",
  "Quick reference": "border border-teal-200 text-teal-700",
  "Case presentation": "bg-teal-100 text-teal-900",
};

export default function Resources() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-14">
      <p className="text-sm font-semibold uppercase tracking-widest text-teal-500">
        Free with every account
      </p>
      <h1 className="mt-2 text-4xl font-bold text-teal-950">
        Free Resources for the clinical exam
      </h1>
      <p className="mt-3 max-w-2xl text-teal-800/80">
        The written paper is only half of it. Free Resources prepare you for the clinicals — how to
        examine, what to say, and what the examiner will ask next. A selection is open to read now,
        no account needed.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {RESOURCES.map((r) => (
          <section key={r.faculty} className="rounded-2xl border border-teal-100 p-6">
            <h2 className="text-xl font-bold text-teal-700">{r.faculty}</h2>
            <ul className="mt-4 space-y-3">
              {r.items.map((item) => (
                <li
                  key={item.title}
                  className="flex items-center justify-between gap-4 rounded-xl border border-teal-50 bg-white p-3"
                >
                  <div>
                    <p className="font-medium text-teal-950">{item.title}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${TYPES[item.type]}`}
                  >
                    {item.type}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <div className="mt-12 rounded-2xl bg-teal-600 p-8 text-center text-white">
        <h2 className="text-2xl font-bold">Your whole faculty&apos;s library</h2>
        <p className="mx-auto mt-2 max-w-xl text-teal-100">
          Create a free account to unlock every faculty&apos;s checklists, case presentations and
          quick-reference sheets. New material is added faculty by faculty.
        </p>
        <a
          href="/auth?mode=signup"
          className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-teal-700 hover:bg-teal-50"
        >
          Create free account
        </a>
      </div>
    </main>
  );
}
