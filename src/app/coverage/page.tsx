const COLLEGES = [
  {
    college: "NPMCN",
    note: "Nigerian Postgraduate Medical College",
    faculties: [
      { name: "Internal Medicine", count: 1240 },
      { name: "Surgery", count: 980 },
      { name: "Paediatrics", count: 860 },
      { name: "Obstetrics & Gynaecology", count: 790 },
      { name: "Psychiatry", count: 540 },
      { name: "Radiology", count: 430 },
      { name: "Anaesthesia", count: 410 },
      { name: "Pathology", count: 380 },
    ],
  },
  {
    college: "WACP",
    note: "West African College of Physicians",
    faculties: [
      { name: "Internal Medicine", count: 1120 },
      { name: "Paediatrics", count: 760 },
      { name: "Psychiatry", count: 490 },
      { name: "Public Health", count: 350 },
      { name: "Family Medicine", count: 320 },
    ],
  },
  {
    college: "WACS",
    note: "West African College of Surgeons",
    faculties: [
      { name: "Surgery", count: 940 },
      { name: "Obstetrics & Gynaecology", count: 720 },
      { name: "Orthopaedics", count: 410 },
      { name: "ENT", count: 290 },
      { name: "Ophthalmology", count: 260 },
      { name: "Dental Surgery", count: 240 },
    ],
  },
  {
    college: "Primaries",
    note: "Primary fellowship papers",
    faculties: [
      { name: "Internal Medicine", count: 860 },
      { name: "Surgery", count: 720 },
      { name: "Paediatrics", count: 640 },
      { name: "Obstetrics & Gynaecology", count: 590 },
      { name: "Anaesthesia", count: 380 },
      { name: "Radiology", count: 310 },
    ],
  },
];

export default function Coverage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="text-4xl font-bold text-teal-950">Is your exam covered?</h1>
      <p className="mt-3 max-w-2xl text-teal-800/80">
        Every college and faculty in the bank, with the number of questions in each. Subscribe to the
        college and faculty you&apos;re actually sitting — you never pay for a bank you won&apos;t open.
      </p>
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        {COLLEGES.map((c) => (
          <section key={c.college} className="rounded-2xl border border-teal-100 p-6">
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-bold text-teal-700">{c.college}</h2>
              <span className="text-sm text-teal-800/60">{c.note}</span>
            </div>
            <ul className="mt-4 divide-y divide-teal-50">
              {c.faculties.map((f) => (
                <li key={f.name} className="flex items-center justify-between py-2.5">
                  <span className="text-teal-950">{f.name}</span>
                  <span className="text-sm font-semibold text-teal-600">
                    {f.count.toLocaleString()} questions
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <div className="mt-12 rounded-2xl bg-teal-50 p-8 text-center">
        <h2 className="text-2xl font-bold text-teal-950">Found your faculty?</h2>
        <p className="mx-auto mt-2 max-w-xl text-teal-800/80">
          Every account gets 20 free questions every month. Open your faculty, read real stems and
          explanations, and get a feel for the platform before you pay for anything.
        </p>
        <a
          href="/auth?mode=signup"
          className="mt-6 inline-block rounded-full bg-teal-500 px-6 py-3 font-semibold text-white hover:bg-teal-600"
        >
          Create a free account
        </a>
      </div>
    </main>
  );
}
