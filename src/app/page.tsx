import PricingButton from "@/components/pricing-button";

const features = [
  {
    title: "Real exam recalls",
    body: "Every question comes from an actual past paper recall — tagged by college, faculty and subject, so you practise what was genuinely asked.",
  },
  {
    title: "Analytics that name your weak spots",
    body: "Accuracy by subject and topic, trends over time, and a ranked list of exactly what to revise next.",
  },
  {
    title: "Timed mock exams",
    body: "Full-length mocks under real exam conditions, with instant scoring and a question-by-question breakdown.",
  },
  {
    title: "Find any question, fast",
    body: "Search the whole bank by keyword, or filter down to a single college, faculty and subject when you want to drill one topic.",
  },
  {
    title: "An explanation for every question",
    body: "Not just the correct letter — the reasoning, the distractors, and why the obvious answer was wrong.",
  },
  {
    title: "Works when the network doesn't",
    body: "On any paid plan, download question packs to your device and keep revising through a call shift, a dead spot or a data outage. Your answers sync the moment you're back online.",
  },
];

const steps = [
  {
    n: "1",
    title: "Pick your college and faculty",
    body: "Choose NPMCN, WACP, WACS or Primaries and the faculty you're sitting. The bank filters to what's actually on your paper.",
  },
  {
    n: "2",
    title: "Practise and sit mocks",
    body: "Work through recall questions in focused sets, or take a timed full-length mock when you want the real thing.",
  },
  {
    n: "3",
    title: "Revise what the data says",
    body: "Your weak-areas list updates after every session, so revision time goes where it moves your score most.",
  },
];

const faqs = [
  {
    q: "Which exams does Medscope cover?",
    a: "NPMCN, WACP, WACS and Primaries, across every faculty in the bank. New faculties are added regularly.",
  },
  {
    q: "Where do the questions come from?",
    a: "Real recall questions contributed by doctors who have sat the papers. Every recall is checked before it goes live so you never practise on a wrong answer.",
  },
  {
    q: "Can I use it on my phone?",
    a: "Yes. Medscope is mobile-first and works on a slow ward network, and paid plans include downloadable packs for offline study.",
  },
  {
    q: "What are Free Resources?",
    a: "Clinical exam prep — examination checklists, model case presentations and quick-reference sheets — written for your faculty and checked by clinicians.",
  },
  {
    q: "How much does it cost?",
    a: "A free account includes 10 questions a month and the Free Resources library, no card needed. Paid plans unlock the full bank for your college and faculty.",
  },
  {
    q: "Do you add new questions?",
    a: "Yes. New recalls are added as candidates share them, and paid subscribers get them as soon as they're checked.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-cream-50 text-burgundy-950">
      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-burgundy-100 bg-cream-50/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <a href="/" className="text-xl font-bold tracking-tight text-burgundy-600">
            Medscope
          </a>
          <nav className="hidden items-center gap-6 text-sm text-burgundy-800 lg:flex">
            <a href="/coverage">Coverage</a>
            <a href="#features">Features</a>
            <a href="/resources">Free Resources</a>
            <a href="#how-it-works">How it works</a>
            <a href="#reviews">Reviews</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="/login" className="text-sm font-medium text-burgundy-800">Sign in</a>
            <a href="/signup" className="rounded-full bg-burgundy-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-burgundy-600">
              Get started
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="mb-4 text-sm font-semibold text-burgundy-600">
            Recall-based — built from real past exam papers
          </p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Comprehensive preparation for postgraduate medical examination success
          </h1>
          <p className="mt-4 text-lg text-burgundy-800/80">
            The question bank built specifically for NPMCN, WACP, WACS and
            Primaries — real exam recalls, timed mocks, and analytics that tell
            you exactly what to revise next. Study alone, face off against a
            colleague, or compete with the whole ward.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="/signup" className="rounded-full bg-burgundy-500 px-6 py-3 font-semibold text-white hover:bg-burgundy-600">
              Start preparing now
            </a>
            <a href="#how-it-works" className="rounded-full border border-burgundy-200 px-6 py-3 font-semibold text-burgundy-700 hover:bg-burgundy-50">
              See how it works
            </a>
          </div>
          <p className="mt-4 text-sm text-burgundy-700/70">
            Free account includes 10 questions a month and Free Resources — no card
            needed. Subscribe when you want the full bank.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-burgundy-100 px-2 py-1 text-xs font-bold tracking-widest text-burgundy-500">NPMCN</span>
            <span className="rounded-md border border-burgundy-100 px-2 py-1 text-xs font-bold tracking-widest text-burgundy-500">WACP</span>
            <span className="rounded-md border border-burgundy-100 px-2 py-1 text-xs font-bold tracking-widest text-burgundy-500">WACS</span>
            <span className="rounded-md border border-burgundy-100 px-2 py-1 text-xs font-bold tracking-widest text-burgundy-500">PRIMARIES</span>
            <span className="text-sm text-burgundy-800/60">rated by doctors who&apos;ve sat the papers</span>
          </div>
        </div>

        {/* Sample question card */}
        <div className="rounded-2xl border border-burgundy-100 bg-gradient-to-b from-burgundy-50 to-cream-50 p-6 shadow-lg">
          <div className="flex items-center justify-between text-xs font-semibold text-burgundy-600">
            <span>WACP · Internal Medicine</span>
            <span>Question 14 of 40</span>
          </div>
          <p className="mt-1 text-right text-2xl font-bold text-burgundy-500">18:42</p>
          <p className="mt-4 text-burgundy-950">
            A 34-year-old man presents with fever, tachycardia and warm peripheries. BP
            is 82/40 mmHg with a wide pulse pressure. Which type of shock is most likely?
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {["Hypovolaemic shock", "Cardiogenic shock", "Septic shock", "Neurogenic shock"].map(
              (opt, i) => (
                <li
                  key={opt}
                  className={`rounded-lg border px-3 py-2 ${
                    i === 2
                      ? "border-burgundy-400 bg-burgundy-50 font-semibold text-burgundy-700"
                      : "border-burgundy-100 bg-cream-50"
                  }`}
                >
                  <span className="mr-2 font-bold text-burgundy-400">{String.fromCharCode(65 + i)}</span>
                  {opt}
                </li>
              )
            )}
          </ul>
          <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs">
            <div className="rounded-xl bg-burgundy-500 p-3 text-white">
              <p className="text-lg font-bold">72%</p>
              <p>Accuracy</p>
            </div>
            <div className="rounded-xl border border-burgundy-100 p-3">
              <p className="text-lg font-bold text-burgundy-600">12 days</p>
              <p>Study streak</p>
            </div>
            <div className="rounded-xl border border-burgundy-100 p-3">
              <p className="text-sm font-bold text-burgundy-600">Endocrinology</p>
              <p>Weakest topic</p>
            </div>
          </div>
          <p className="mt-4 text-center text-xs font-semibold text-burgundy-600">
            Answer explained — every single question
          </p>
        </div>
      </section>

      {/* Study modes — face-off visual */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold">
              One bank, every way to study
            </h2>
            <p className="mt-3 max-w-xl text-burgundy-800/80">
              Medscope supports individual reading, group reading, and
              competitions — the same recall questions power all three.
            </p>
            <div className="mt-8 space-y-4">
              {[
                [
                  "Individual reading",
                  "Work through recalls at your own pace with explanations for every question.",
                ],
                [
                  "Group reading",
                  "Create a challenge room, share the code, and take turns answering with a colleague.",
                ],
                [
                  "Competitions",
                  "Battle rooms for up to 20 doctors — fastest correct answer takes the points.",
                ],
              ].map(([t, b]) => (
                <div
                  key={t}
                  className="rounded-2xl border border-burgundy-100 bg-cream-50 p-5"
                >
                  <h3 className="font-bold text-burgundy-950">{t}</h3>
                  <p className="mt-1 text-sm text-burgundy-800/70">{b}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Face-off illustration */}
          <div className="rounded-3xl border border-burgundy-100 bg-gradient-to-b from-burgundy-50 to-cream-50 p-10">
            <svg
              viewBox="0 0 360 300"
              className="mx-auto w-full"
              role="img"
              aria-label="Two doctors facing off"
            >
              <defs>
                <radialGradient id="burst" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#800020" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#800020" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="180" cy="150" r="130" fill="url(#burst)" />
              <line x1="30" y1="270" x2="330" y2="270" stroke="#e3d4b8" strokeWidth="4" strokeLinecap="round" />

              {/* LEFT FIGURE — burgundy scrubs, combat stance */}
              <g>
                {/* back leg */}
                <path d="M118 270 L112 205 L100 270 Z" fill="#450011" />
                {/* front leg */}
                <path d="M132 270 L138 205 L152 270 Z" fill="#570016" />
                {/* torso — scrubs */}
                <path d="M108 205 L116 128 Q138 116 160 128 L168 205 Z" fill="#800020" />
                {/* head */}
                <circle cx="138" cy="100" r="24" fill="#c68863" />
                {/* hair */}
                <path d="M114 96 Q116 72 138 72 Q160 72 162 96 Q150 84 138 84 Q126 84 114 96 Z" fill="#2e000b" />
                {/* face */}
                <circle cx="131" cy="99" r="2.4" fill="#2e000b" />
                <circle cx="145" cy="99" r="2.4" fill="#2e000b" />
                <path d="M132 108 Q138 112 144 108" stroke="#2e000b" strokeWidth="2" fill="none" strokeLinecap="round" />
                {/* stethoscope */}
                <path d="M126 130 Q138 148 150 130" stroke="#2e000b" strokeWidth="2.5" fill="none" />
                <circle cx="138" cy="152" r="4" fill="#2e000b" />
                {/* guard arms */}
                <path d="M116 136 L92 118" stroke="#800020" strokeWidth="11" strokeLinecap="round" />
                <circle cx="88" cy="115" r="7" fill="#c68863" />
                <path d="M160 136 L172 112" stroke="#800020" strokeWidth="11" strokeLinecap="round" />
                <circle cx="174" cy="108" r="7" fill="#c68863" />
              </g>

              {/* RIGHT FIGURE — lighter scrubs, combat stance */}
              <g>
                <path d="M242 270 L248 205 L260 270 Z" fill="#d19da8" />
                <path d="M228 270 L222 205 L208 270 Z" fill="#bc6b7c" />
                <path d="M252 205 L244 128 Q222 116 200 128 L192 205 Z" fill="#bc6b7c" />
                <circle cx="222" cy="100" r="24" fill="#8d5a3b" />
                <path d="M198 94 Q200 68 222 68 Q244 68 246 94 Q236 80 222 82 Q208 80 198 94 Z" fill="#2e000b" />
                <circle cx="215" cy="99" r="2.4" fill="#2e000b" />
                <circle cx="229" cy="99" r="2.4" fill="#2e000b" />
                <path d="M216 108 Q222 112 228 108" stroke="#2e000b" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M234 130 Q222 148 210 130" stroke="#2e000b" strokeWidth="2.5" fill="none" />
                <circle cx="222" cy="152" r="4" fill="#2e000b" />
                <path d="M244 136 L268 118" stroke="#bc6b7c" strokeWidth="11" strokeLinecap="round" />
                <circle cx="272" cy="115" r="7" fill="#8d5a3b" />
                <path d="M200 136 L188 112" stroke="#bc6b7c" strokeWidth="11" strokeLinecap="round" />
                <circle cx="186" cy="108" r="7" fill="#8d5a3b" />
              </g>

              {/* VS burst */}
              <circle cx="180" cy="105" r="34" fill="#fdfbf7" stroke="#800020" strokeWidth="4" />
              <text x="180" y="117" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="28" fill="#800020">VS</text>

              {/* energy sparks */}
              <g stroke="#a34457" strokeWidth="4" strokeLinecap="round">
                <line x1="168" y1="52" x2="158" y2="30" />
                <line x1="192" y1="52" x2="202" y2="30" />
                <line x1="180" y1="48" x2="180" y2="24" />
                <line x1="150" y1="66" x2="132" y2="52" />
                <line x1="210" y1="66" x2="228" y2="52" />
              </g>
            </svg>
            <p className="mt-4 text-center text-sm font-semibold text-burgundy-700">
              Challenge room — two doctors, one question bank
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-burgundy-50/50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-sm font-semibold text-burgundy-600">Everything you need</p>
          <h2 className="mt-2 text-3xl font-bold">Built for the exam you&apos;re actually sitting</h2>
          <p className="mt-3 max-w-2xl text-burgundy-800/80">
            Not a generic international bank with a local label on it. Every feature
            exists because candidates asked for it.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-burgundy-100 bg-cream-50 p-6">
                <h3 className="text-lg font-bold text-burgundy-700">{f.title}</h3>
                <p className="mt-2 text-sm text-burgundy-900/70">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources */}
      <section id="resources" className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-sm font-semibold text-burgundy-600">Free with every account</p>
        <h2 className="mt-2 text-3xl font-bold">Free Resources for the clinical exam</h2>
        <p className="mt-3 max-w-2xl text-burgundy-800/80">
          The written paper is only half of it. Free Resources prepare you for the
          clinicals — how to examine, what to say, and what the examiner will ask next —
          written for your faculty and checked by clinicians.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            [
              "Examination checklists",
              "Step-by-step mark sheets for the clinical stations, with where the marks sit and a model summary of findings to present.",
            ],
            [
              "Model case presentations",
              "How a confident candidate presents a long or short case — findings, differentials, investigations, management and the questions examiners ask next.",
            ],
            [
              "Quick-reference sheets",
              "Tables, scores and classifications to revise the night before, with pearls and the pitfalls that cost candidates marks.",
            ],
          ].map(([t, b]) => (
            <div key={t} className="rounded-2xl border border-burgundy-100 p-6">
              <h3 className="font-bold text-burgundy-700">{t}</h3>
              <p className="mt-2 text-sm text-burgundy-900/70">{b}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-burgundy-800/70">
          A selection is open to read now — no account needed. Create a free account for
          your whole faculty&apos;s library. New material added faculty by faculty.
        </p>
        <a href="/resources" className="mt-4 inline-block rounded-full bg-burgundy-500 px-6 py-3 font-semibold text-white hover:bg-burgundy-600">
          Read the Free Resources
        </a>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-burgundy-600 py-16 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold">Three steps from signup to exam day</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n}>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-burgundy-400 font-bold text-burgundy-950">
                  {s.n}
                </span>
                <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-burgundy-100">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Battle room visual */}
      <section className="bg-burgundy-600 py-16 text-cream-50">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold">
              Battle room — up to 20 doctors, one clock
            </h2>
            <p className="mt-3 text-burgundy-100">
              The fastest correct answer takes 2 points. A wrong
              answer costs 0.5. Every player sees the same
              question, and everyone leaves with the questions,
              answers, and explanations.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-burgundy-100">
              <li>· Choose a title and topic — "Cardiology battle"</li>
              <li>· Start immediately or schedule for later</li>
              <li>· Public or private rooms</li>
              <li>· Set the number of questions and time per question</li>
            </ul>
            <a
              href="/signup"
              className="mt-8 inline-block rounded-full bg-cream-50 px-8 py-3 font-semibold text-burgundy-700 hover:bg-white"
            >
              Start a battle
            </a>
          </div>

          {/* Battle room illustration */}
          <div className="rounded-3xl bg-cream-50 p-8 text-burgundy-950">
            <svg
              viewBox="0 0 360 260"
              className="mx-auto w-full"
              role="img"
              aria-label="Battle room scoreboard"
            >
              {/* scoreboard */}
              <rect x="110" y="10" width="140" height="46" rx="8" fill="#800020" />
              <text x="180" y="40" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="20" fill="#fdfbf7">LIVE</text>
              {/* three figures */}
              {[90, 180, 270].map((cx, i) => (
                <g key={cx}>
                  <circle cx={cx} cy="120" r="22" fill={i === 0 ? "#800020" : i === 1 ? "#bc6b7c" : "#d19da8"} />
                  <path d={`M${cx - 30} 235 L${cx - 24} 165 Q${cx} 150 ${cx + 24} 165 L${cx + 30} 235 Z`} fill={i === 0 ? "#800020" : i === 1 ? "#bc6b7c" : "#d19da8"} />
                  {/* arm raised */}
                  <line x1={cx - 24} y1="175" x2={cx - 44} y2="140" stroke={i === 0 ? "#800020" : i === 1 ? "#bc6b7c" : "#d19da8"} strokeWidth="8" strokeLinecap="round" />
                </g>
              ))}
              {/* timer badge */}
              <circle cx="320" cy="60" r="24" fill="#fdfbf7" stroke="#800020" strokeWidth="3" />
              <text x="320" y="67" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="16" fill="#800020">40s</text>
            </svg>
            <div className="mt-2 space-y-1">
              {[
                ["#1", "Dr. Chidi O.", "6.0"],
                ["#2", "Dr. Fatima B.", "4.0"],
                ["#3", "Dr. Emeka N.", "2.0"],
              ].map((r) => (
                <div
                  key={r[0]}
                  className="flex items-center justify-between rounded-lg border border-burgundy-100 bg-cream-50 px-3 py-1.5 text-sm"
                >
                  <span className="text-burgundy-600">{r[0]}</span>
                  <span className="font-medium text-burgundy-950">{r[1]}</span>
                  <span className="font-bold text-burgundy-600">{r[2]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold">Simple pricing</h2>
        <p className="mt-3 max-w-2xl text-burgundy-800/80">
          Start free. Subscribe to the college and faculty you&apos;re actually sitting —
          you never pay for a bank you won&apos;t open.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              name: "Free",
              price: "₦0",
              desc: "10 questions a month, Free Resources library, no card needed.",
              plan: "free" as const,
              cta: "Create free account",
            },
            {
              name: "Monthly",
              price: "₦12,000/mo",
              desc: "Full bank for your college & faculty, timed mocks, analytics, offline packs.",
              plan: "monthly" as const,
              cta: "Subscribe",
            },
            {
              name: "Annual",
              price: "₦10,000/yr",
              desc: "Everything in Monthly — save ₦134,000 a year, priority support and exam-season updates.",
              plan: "annual" as const,
              cta: "Subscribe — save ₦134,000",
            },
          ].map((p) => (
            <div key={p.name} className="flex flex-col rounded-2xl border border-burgundy-100 bg-cream-50 p-6">
              <h3 className="font-bold text-burgundy-700">{p.name}</h3>
              <p className="mt-2 text-3xl font-bold">{p.price}</p>
              <p className="mt-3 flex-1 text-sm text-burgundy-900/70">{p.desc}</p>
              <PricingButton plan={p.plan} label={p.cta} />
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="bg-burgundy-50/50 py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <p className="text-sm font-semibold text-burgundy-600">From the wards</p>
          <h2 className="mt-2 text-3xl font-bold">What doctors say after using it</h2>
          <p className="mt-4 text-burgundy-800/80">Be the first to share your experience.</p>
          <a
            href="/login"
            className="mt-6 inline-block rounded-full border border-burgundy-200 px-6 py-3 font-semibold text-burgundy-700 hover:bg-burgundy-50"
          >
            Sign in to leave a review
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="text-3xl font-bold">Questions, answered</h2>
        <p className="mt-3 text-burgundy-800/80">Still unsure about something? Talk to us — a real person replies.</p>
        <div className="mt-8 divide-y divide-burgundy-100">
          {faqs.map((f) => (
            <div key={f.q} className="py-5">
              <h3 className="font-bold text-burgundy-700">{f.q}</h3>
              <p className="mt-1 text-sm text-burgundy-900/70">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h2 className="text-3xl font-bold">Ready to walk in prepared?</h2>
        <p className="mt-3 text-burgundy-800/80">
          Create a free account and start on real recall questions and Free Resources
          today. No card needed to look around.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a href="/signup" className="rounded-full bg-burgundy-500 px-8 py-4 font-semibold text-white hover:bg-burgundy-600">
            Create free account
          </a>
          <a href="/coverage" className="rounded-full border border-burgundy-200 px-8 py-4 font-semibold text-burgundy-700 hover:bg-burgundy-50">
            Learn more about us
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-burgundy-100 py-10">
        <p className="mx-auto mb-8 max-w-6xl px-4 text-sm text-burgundy-800/70">
          Join doctors across Nigeria and West Africa preparing right now
        </p>
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-4">
          <div>
            <p className="text-xl font-bold text-burgundy-600">Medscope</p>
            <p className="mt-2 text-sm text-burgundy-800/70">
              Exam-recall question bank, mock exams and performance analytics for doctors
              sitting NPMCN, WACP and WACS.
            </p>
          </div>
          <div>
            <p className="font-bold text-burgundy-950">Product</p>
            <ul className="mt-2 space-y-1 text-sm text-burgundy-800/70">
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How it works</a></li>
              <li><a href="/resources">Free Resources</a></li>
              <li><a href="/coverage">Coverage</a></li>
              <li><a href="#reviews">Reviews</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-burgundy-950">Company</p>
            <ul className="mt-2 space-y-1 text-sm text-burgundy-800/70">
              <li><a href="/coverage">About</a></li>
              <li><a href="mailto:support@medscope.com">Contact support</a></li>
              <li><a href="mailto:support@medscope.com">support@medscope.com</a></li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-burgundy-950">Legal</p>
            <ul className="mt-2 space-y-1 text-sm text-burgundy-800/70">
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Acceptable Use</a></li>
            </ul>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-6xl px-4 text-xs text-burgundy-800/50">
          © 2026 Medscope. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
