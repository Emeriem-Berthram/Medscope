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
    a: "A free account includes 20 questions a month and the Free Resources library, no card needed. Paid plans unlock the full bank for your college and faculty.",
  },
  {
    q: "Do you add new questions?",
    a: "Yes. New recalls are added as candidates share them, and paid subscribers get them as soon as they're checked.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-teal-950">
      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-teal-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <a href="/" className="text-xl font-bold tracking-tight text-teal-600">
            Medscope
          </a>
          <nav className="hidden items-center gap-6 text-sm text-teal-800 lg:flex">
            <a href="/coverage">Coverage</a>
            <a href="#features">Features</a>
            <a href="/resources">Free Resources</a>
            <a href="#how-it-works">How it works</a>
            <a href="#reviews">Reviews</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="/login" className="text-sm font-medium text-teal-800">Sign in</a>
            <a href="/signup" className="rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-600">
              Get started
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="mb-4 text-sm font-semibold text-teal-600">
            Recall-based — built from real past exam papers
          </p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Comprehensive preparation for postgraduate medical examination success
          </h1>
          <p className="mt-4 text-lg text-teal-800/80">
            The question bank built specifically for NPMCN, WACP, WACS and Primaries —
            real exam recalls, timed mocks, and analytics that tell you exactly what to
            revise next.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="/signup" className="rounded-full bg-teal-500 px-6 py-3 font-semibold text-white hover:bg-teal-600">
              Start preparing now
            </a>
            <a href="#how-it-works" className="rounded-full border border-teal-200 px-6 py-3 font-semibold text-teal-700 hover:bg-teal-50">
              See how it works
            </a>
          </div>
          <p className="mt-4 text-sm text-teal-700/70">
            Free account includes 20 questions a month and Free Resources — no card
            needed. Subscribe when you want the full bank.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-teal-100 px-2 py-1 text-xs font-bold tracking-widest text-teal-500">NPMCN</span>
            <span className="rounded-md border border-teal-100 px-2 py-1 text-xs font-bold tracking-widest text-teal-500">WACP</span>
            <span className="rounded-md border border-teal-100 px-2 py-1 text-xs font-bold tracking-widest text-teal-500">WACS</span>
            <span className="rounded-md border border-teal-100 px-2 py-1 text-xs font-bold tracking-widest text-teal-500">PRIMARIES</span>
            <span className="text-sm text-teal-800/60">rated by doctors who&apos;ve sat the papers</span>
          </div>
        </div>

        {/* Sample question card */}
        <div className="rounded-2xl border border-teal-100 bg-gradient-to-b from-teal-50 to-white p-6 shadow-lg">
          <div className="flex items-center justify-between text-xs font-semibold text-teal-600">
            <span>WACP · Internal Medicine</span>
            <span>Question 14 of 40</span>
          </div>
          <p className="mt-1 text-right text-2xl font-bold text-teal-500">18:42</p>
          <p className="mt-4 text-teal-950">
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
                      ? "border-teal-400 bg-teal-50 font-semibold text-teal-700"
                      : "border-teal-100 bg-white"
                  }`}
                >
                  <span className="mr-2 font-bold text-teal-400">{String.fromCharCode(65 + i)}</span>
                  {opt}
                </li>
              )
            )}
          </ul>
          <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs">
            <div className="rounded-xl bg-teal-500 p-3 text-white">
              <p className="text-lg font-bold">72%</p>
              <p>Accuracy</p>
            </div>
            <div className="rounded-xl border border-teal-100 p-3">
              <p className="text-lg font-bold text-teal-600">12 days</p>
              <p>Study streak</p>
            </div>
            <div className="rounded-xl border border-teal-100 p-3">
              <p className="text-sm font-bold text-teal-600">Endocrinology</p>
              <p>Weakest topic</p>
            </div>
          </div>
          <p className="mt-4 text-center text-xs font-semibold text-teal-600">
            Answer explained — every single question
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-teal-50/50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-sm font-semibold text-teal-600">Everything you need</p>
          <h2 className="mt-2 text-3xl font-bold">Built for the exam you&apos;re actually sitting</h2>
          <p className="mt-3 max-w-2xl text-teal-800/80">
            Not a generic international bank with a local label on it. Every feature
            exists because candidates asked for it.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-teal-100 bg-white p-6">
                <h3 className="text-lg font-bold text-teal-700">{f.title}</h3>
                <p className="mt-2 text-sm text-teal-900/70">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources */}
      <section id="resources" className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-sm font-semibold text-teal-600">Free with every account</p>
        <h2 className="mt-2 text-3xl font-bold">Free Resources for the clinical exam</h2>
        <p className="mt-3 max-w-2xl text-teal-800/80">
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
            <div key={t} className="rounded-2xl border border-teal-100 p-6">
              <h3 className="font-bold text-teal-700">{t}</h3>
              <p className="mt-2 text-sm text-teal-900/70">{b}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-teal-800/70">
          A selection is open to read now — no account needed. Create a free account for
          your whole faculty&apos;s library. New material added faculty by faculty.
        </p>
        <a href="/resources" className="mt-4 inline-block rounded-full bg-teal-500 px-6 py-3 font-semibold text-white hover:bg-teal-600">
          Read the Free Resources
        </a>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-teal-600 py-16 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold">Three steps from signup to exam day</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n}>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-400 font-bold text-teal-950">
                  {s.n}
                </span>
                <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-teal-100">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold">Simple pricing</h2>
        <p className="mt-3 max-w-2xl text-teal-800/80">
          Start free. Subscribe to the college and faculty you&apos;re actually sitting —
          you never pay for a bank you won&apos;t open.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            ["Free", "₦0", "20 questions a month, Free Resources library, no card needed."],
            ["Monthly", "₦12,000/mo", "Full bank for your college & faculty, timed mocks, analytics, offline packs."],
            ["Annual", "₦10,000/yr", "Everything in Monthly — save ₦134,000 a year, priority support and exam-season updates."],
          ].map(([name, price, desc]) => (
            <div key={name} className="flex flex-col rounded-2xl border border-teal-100 p-6">
              <h3 className="font-bold text-teal-700">{name}</h3>
              <p className="mt-2 text-3xl font-bold">{price}</p>
              <p className="mt-3 flex-1 text-sm text-teal-900/70">{desc}</p>
              <a
                href={name === "Free" ? "/signup" : "/login"}
                className="mt-6 rounded-full bg-teal-500 px-4 py-2.5 text-center font-semibold text-white hover:bg-teal-600"
              >
                {name === "Free" ? "Create free account" : "Subscribe"}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="bg-teal-50/50 py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <p className="text-sm font-semibold text-teal-600">From the wards</p>
          <h2 className="mt-2 text-3xl font-bold">What doctors say after using it</h2>
          <p className="mt-4 text-teal-800/80">Be the first to share your experience.</p>
          <a
            href="/login"
            className="mt-6 inline-block rounded-full border border-teal-200 px-6 py-3 font-semibold text-teal-700 hover:bg-teal-50"
          >
            Sign in to leave a review
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="text-3xl font-bold">Questions, answered</h2>
        <p className="mt-3 text-teal-800/80">Still unsure about something? Talk to us — a real person replies.</p>
        <div className="mt-8 divide-y divide-teal-100">
          {faqs.map((f) => (
            <div key={f.q} className="py-5">
              <h3 className="font-bold text-teal-700">{f.q}</h3>
              <p className="mt-1 text-sm text-teal-900/70">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h2 className="text-3xl font-bold">Ready to walk in prepared?</h2>
        <p className="mt-3 text-teal-800/80">
          Create a free account and start on real recall questions and Free Resources
          today. No card needed to look around.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a href="/signup" className="rounded-full bg-teal-500 px-8 py-4 font-semibold text-white hover:bg-teal-600">
            Create free account
          </a>
          <a href="/coverage" className="rounded-full border border-teal-200 px-8 py-4 font-semibold text-teal-700 hover:bg-teal-50">
            Learn more about us
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-teal-100 py-10">
        <p className="mx-auto mb-8 max-w-6xl px-4 text-sm text-teal-800/70">
          Join doctors across Nigeria and West Africa preparing right now
        </p>
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-4">
          <div>
            <p className="text-xl font-bold text-teal-600">Medscope</p>
            <p className="mt-2 text-sm text-teal-800/70">
              Exam-recall question bank, mock exams and performance analytics for doctors
              sitting NPMCN, WACP and WACS.
            </p>
          </div>
          <div>
            <p className="font-bold text-teal-950">Product</p>
            <ul className="mt-2 space-y-1 text-sm text-teal-800/70">
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How it works</a></li>
              <li><a href="/resources">Free Resources</a></li>
              <li><a href="/coverage">Coverage</a></li>
              <li><a href="#reviews">Reviews</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-teal-950">Company</p>
            <ul className="mt-2 space-y-1 text-sm text-teal-800/70">
              <li><a href="/coverage">About</a></li>
              <li><a href="mailto:support@medscope.com">Contact support</a></li>
              <li><a href="mailto:support@medscope.com">support@medscope.com</a></li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-teal-950">Legal</p>
            <ul className="mt-2 space-y-1 text-sm text-teal-800/70">
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Acceptable Use</a></li>
            </ul>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-6xl px-4 text-xs text-teal-800/50">
          © 2026 Medscope. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
