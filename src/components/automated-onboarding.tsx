"use client";

import { useState } from "react";
import { DEPARTMENTS, EXAMS } from "@/lib/questions";
import { useAuth } from "@/lib/auth";

interface AutomatedOnboardingProps {
  onComplete: () => void;
}

const SAMPLE_DIAGNOSTIC_QUESTIONS = [
  {
    id: "diag_1",
    question:
      "A 32-year-old G2P1 at 36 weeks gestation presents with sudden-onset painless vaginal bleeding. Ultrasound confirms placenta previa. What is the most definitive management step?",
    options: [
      "Immediate oxytocin induction",
      "Elective Cesarean section under regional anesthesia",
      "Emergency vaginal vacuum delivery",
      "Conservative outpatient bed rest",
    ],
    correctAnswer: "Elective Cesarean section under regional anesthesia",
    topic: "Obstetrics & Gynaecology",
  },
  {
    id: "diag_2",
    question:
      "A 45-year-old male presents with acute severe epigastric pain radiating to the back and persistent vomiting. Serum lipase is 4x upper limit of normal. What is the most critical initial fluid resuscitation strategy?",
    options: [
      "5% Dextrose 50ml/hr",
      "Aggressive Ringers Lactate 250-500ml/hr guided by hematocrit",
      "Fresh Frozen Plasma infusion",
      "Fluid restriction to prevent pulmonary edema",
    ],
    correctAnswer: "Aggressive Ringers Lactate 250-500ml/hr guided by hematocrit",
    topic: "Internal Medicine / Surgery",
  },
  {
    id: "diag_3",
    question:
      "A 4-year-old child presents with high fever, vomiting, and refusal to feed. Lumbar puncture reveals cloudy CSF with high polymorphs, low glucose, and high protein. What is the immediate empiric antibiotic regimen?",
    options: [
      "Oral amoxicillin 250mg TDS",
      "IV Ceftriaxone (100mg/kg/day) + IV Vancomycin",
      "Oral ciprofloxacin 500mg BD",
      "IV metronidazole monotherapy",
    ],
    correctAnswer: "IV Ceftriaxone (100mg/kg/day) + IV Vancomycin",
    topic: "Paediatrics",
  },
];

export default function AutomatedOnboarding({
  onComplete,
}: AutomatedOnboardingProps) {
  const { user, setProfile } = useAuth();

  const [step, setStep] = useState(1);
  const [exam, setExam] = useState<string>(user?.exam || EXAMS[0]);
  const [faculty, setFaculty] = useState<string>(
    user?.faculty || DEPARTMENTS[0]
  );
  const [targetExam, setTargetExam] = useState<string>("Primaries");
  const [targetDate, setTargetDate] = useState<string>("2026-11-15");
  const [diagAnswers, setDiagAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const calculateDiagnosticScore = () => {
    let correct = 0;
    SAMPLE_DIAGNOSTIC_QUESTIONS.forEach((q) => {
      if (diagAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / SAMPLE_DIAGNOSTIC_QUESTIONS.length) * 100);
  };

  const handleFinish = async () => {
    setSaving(true);
    const score = calculateDiagnosticScore();
    setProfile({
      exam,
      faculty,
      onboardingCompleted: true,
      diagnosticScore: score,
      targetSittingDate: targetDate,
      targetLevel: targetExam,
    });
    setSaving(false);
    onComplete();
  };

  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-burgundy-100 bg-white shadow-xl transition-all">
      {/* Header bar */}
      <div className="border-b border-burgundy-100 bg-gradient-to-r from-burgundy-900 via-burgundy-950 to-burgundy-900 px-4 py-4 sm:px-8 sm:py-6 text-cream-50">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-burgundy-300">
              Dashboard Setup
            </span>
            <h2 className="text-lg font-bold sm:text-2xl leading-tight">
              Doctor Onboarding & Curriculum Setup
            </h2>
          </div>
          <span className="shrink-0 rounded-full bg-burgundy-800/90 px-3 py-1 text-xs sm:text-sm font-semibold text-burgundy-200 border border-burgundy-700/50">
            Step {step} of 5
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-burgundy-950/70">
          <div
            className="h-full bg-gradient-to-r from-burgundy-400 to-burgundy-200 transition-all duration-300 ease-out"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      <div className="p-4 sm:p-8 md:p-10">
        {/* Step 1: Select Examination College */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-burgundy-950 sm:text-xl">
                1. Select your target Examination College
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-burgundy-800/70">
                Your entire question bank will be filtered to match the exact past recall papers set by this college.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {EXAMS.map((e) => {
                const selected = exam === e;
                return (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setExam(e)}
                    className={`flex items-start justify-between rounded-2xl border p-4 sm:p-5 text-left transition-all active:scale-[0.99] ${
                      selected
                        ? "border-burgundy-600 bg-burgundy-50 ring-2 ring-burgundy-500/20 shadow-sm"
                        : "border-burgundy-100 bg-cream-50/50 hover:bg-burgundy-50/40"
                    }`}
                  >
                    <div>
                      <span className="font-bold text-burgundy-950 text-sm sm:text-base">{e}</span>
                      <span className="mt-1 block text-xs text-burgundy-800/70">
                        Postgraduate medical college syllabus
                      </span>
                    </div>
                    <div
                      className={`ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                        selected
                          ? "border-burgundy-600 bg-burgundy-600 text-white"
                          : "border-burgundy-300 text-transparent"
                      }`}
                    >
                      ✓
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full sm:w-auto rounded-full bg-burgundy-600 px-8 py-3 text-sm font-semibold text-cream-50 shadow-sm transition-all hover:bg-burgundy-700 active:scale-95"
              >
                Continue to Faculty →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Select Medical Faculty */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-burgundy-950 sm:text-xl">
                2. What is your Medical Faculty / Department?
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-burgundy-800/70">
                Choose the department you are training or sitting your fellowship in.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
              {DEPARTMENTS.map((dept) => {
                const selected = faculty === dept;
                return (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setFaculty(dept)}
                    className={`flex items-center justify-between rounded-xl border p-3 sm:p-4 text-left font-medium transition-all active:scale-[0.98] ${
                      selected
                        ? "border-burgundy-600 bg-burgundy-50 text-burgundy-950 ring-2 ring-burgundy-500/20 font-bold shadow-sm"
                        : "border-burgundy-100 bg-cream-50/50 text-burgundy-800 hover:bg-burgundy-50/40"
                    }`}
                  >
                    <span className="truncate text-xs sm:text-sm">{dept}</span>
                    {selected && (
                      <span className="ml-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-burgundy-600 text-[9px] text-white">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full sm:w-auto py-2 text-sm font-semibold text-burgundy-700 hover:underline text-center"
              >
                ← Back to College
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full sm:w-auto rounded-full bg-burgundy-600 px-8 py-3 text-sm font-semibold text-cream-50 shadow-sm transition-all hover:bg-burgundy-700 active:scale-95 text-center"
              >
                Continue to Target Exam →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Exam Level & Target Date */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-burgundy-950 sm:text-xl">
                3. Examination Level & Target Sitting Date
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-burgundy-800/70">
                This configures your daily question quota, readiness projection, and spaced repetition calendar.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-burgundy-900">
                  Examination Level
                </label>
                <div className="mt-2 flex flex-wrap gap-2.5">
                  {["Primaries", "Part I", "Part II (Finals)"].map((level) => {
                    const selected = targetExam === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setTargetExam(level)}
                        className={`flex-1 sm:flex-initial rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all active:scale-95 ${
                          selected
                            ? "bg-burgundy-600 text-white shadow-sm"
                            : "border border-burgundy-200 text-burgundy-700 bg-white hover:bg-burgundy-50"
                        }`}
                      >
                        {level} {selected ? "✓" : ""}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-burgundy-900">
                  Target Exam Sitting Month / Date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-burgundy-200 bg-cream-50/50 p-3 text-sm text-burgundy-950 outline-none transition focus:border-burgundy-600 focus:ring-1 focus:ring-burgundy-600"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full sm:w-auto py-2 text-sm font-semibold text-burgundy-700 hover:underline text-center"
              >
                ← Back to Faculty
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="w-full sm:w-auto rounded-full bg-burgundy-600 px-8 py-3 text-sm font-semibold text-cream-50 shadow-sm transition-all hover:bg-burgundy-700 active:scale-95 text-center"
              >
                Diagnostic Calibration →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Rapid Diagnostic Assessment (3 questions) */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-burgundy-950 sm:text-xl">
                4. Baseline Diagnostic Calibration
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-burgundy-800/70">
                Answer these 3 quick high-yield recall questions to calibrate your initial weakness tracker.
              </p>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {SAMPLE_DIAGNOSTIC_QUESTIONS.map((q, qIdx) => (
                <div
                  key={q.id}
                  className="rounded-2xl border border-burgundy-100 bg-cream-50/40 p-4 sm:p-5"
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-burgundy-600">
                    Question {qIdx + 1} · {q.topic}
                  </span>
                  <p className="mt-2 text-xs sm:text-sm font-medium leading-relaxed text-burgundy-950">
                    {q.question}
                  </p>
                  <div className="mt-3 space-y-2">
                    {q.options.map((opt) => {
                      const isChosen = diagAnswers[q.id] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() =>
                            setDiagAnswers((prev) => ({ ...prev, [q.id]: opt }))
                          }
                          className={`flex w-full items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-xs sm:text-sm transition-all active:scale-[0.99] ${
                            isChosen
                              ? "border-burgundy-600 bg-burgundy-100/80 font-semibold text-burgundy-950 ring-1 ring-burgundy-500"
                              : "border-burgundy-100 bg-white text-burgundy-800 hover:bg-burgundy-50"
                          }`}
                        >
                          <span
                            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                              isChosen
                                ? "border-burgundy-600 bg-burgundy-600 text-white"
                                : "border-burgundy-300 text-transparent"
                            }`}
                          >
                            ✓
                          </span>
                          <span className="flex-1">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full sm:w-auto py-2 text-sm font-semibold text-burgundy-700 hover:underline text-center"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep(5)}
                className="w-full sm:w-auto rounded-full bg-burgundy-600 px-8 py-3 text-sm font-semibold text-cream-50 shadow-sm transition-all hover:bg-burgundy-700 active:scale-95 text-center"
              >
                Calculate Study Plan →
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Summary & Curriculum Reveal */}
        {step === 5 && (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-burgundy-100 text-2xl sm:text-3xl shadow-inner">
              🩺
            </div>
            <div>
              <h3 className="text-xl font-bold text-burgundy-950 sm:text-2xl">
                Your Study Engine is Ready!
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-burgundy-800/80">
                Here is your calibrated plan based on your diagnostic answers:
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-burgundy-100 bg-cream-50 p-4">
                <span className="text-[11px] font-semibold uppercase text-burgundy-600">
                  Target Board
                </span>
                <p className="mt-1 text-base sm:text-lg font-bold text-burgundy-950">
                  {exam}
                </p>
                <p className="text-xs text-burgundy-700 truncate">{faculty}</p>
              </div>

              <div className="rounded-2xl border border-burgundy-100 bg-cream-50 p-4">
                <span className="text-[11px] font-semibold uppercase text-burgundy-600">
                  Initial Readiness Score
                </span>
                <p className="mt-1 text-2xl font-bold text-burgundy-600">
                  {Math.max(calculateDiagnosticScore(), 20)}%
                </p>
                <p className="text-xs text-burgundy-700">Calibrated baseline</p>
              </div>

              <div className="rounded-2xl border border-burgundy-100 bg-cream-50 p-4">
                <span className="text-[11px] font-semibold uppercase text-burgundy-600">
                  Recommended Daily Target
                </span>
                <p className="mt-1 text-2xl font-bold text-burgundy-950">
                  25 Qs/day
                </p>
                <p className="text-xs text-burgundy-700">Spaced repetition queue</p>
              </div>
            </div>

            <div className="pt-2 sm:pt-4">
              <button
                type="button"
                disabled={saving}
                onClick={handleFinish}
                className="w-full rounded-full bg-burgundy-600 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-cream-50 shadow-md transition-all hover:bg-burgundy-700 hover:shadow-lg active:scale-[0.99] disabled:opacity-50"
              >
                {saving ? "Launching dashboard..." : "Launch Dashboard →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
