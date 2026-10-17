"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { EXAMS, DEPARTMENTS } from "@/lib/questions";
import { supabase } from "@/lib/supabase";

interface OnboardingProps {
  onComplete: () => void;
}

const SAMPLE_DIAGNOSTIC_QUESTIONS = [
  {
    id: "diag-1",
    question: "A 45-year-old male presents with sudden-onset crushing chest pain radiating to the left arm. ECG demonstrates ST-segment elevation in leads II, III, and aVF. Which coronary artery is most likely occluded?",
    options: ["Left anterior descending artery", "Right coronary artery", "Left circumflex artery", "Left main coronary artery"],
    correct: "Right coronary artery",
    topic: "Cardiology",
  },
  {
    id: "diag-2",
    question: "Which of the following is the hallmark laboratory finding in diabetic ketoacidosis (DKA)?",
    options: ["Serum bicarbonate > 24 mEq/L", "High anion gap metabolic acidosis", "Arterial pH > 7.35", "Hypoglycemia"],
    correct: "High anion gap metabolic acidosis",
    topic: "Endocrinology",
  },
  {
    id: "diag-3",
    question: "In pediatric trauma resuscitation, the initial fluid bolus for hypovolemic shock using isotonic crystalloid is:",
    options: ["10 mL/kg over 2 hours", "20 mL/kg rapidly", "50 mL/kg over 30 minutes", "5 mL/kg slowly"],
    correct: "20 mL/kg rapidly",
    topic: "Pediatrics & Trauma",
  },
];

export default function AutomatedOnboarding({ onComplete }: OnboardingProps) {
  const { user, setProfile } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Selections
  const [exam, setExam] = useState(user?.exam || "NPMCN");
  const [faculty, setFaculty] = useState(user?.faculty || "Internal Medicine");
  const [targetExam, setTargetExam] = useState("Part I");
  const [targetDate, setTargetDate] = useState("");
  
  // Diagnostic responses
  const [diagAnswers, setDiagAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const calculateDiagnosticScore = () => {
    let correctCount = 0;
    SAMPLE_DIAGNOSTIC_QUESTIONS.forEach((q) => {
      if (diagAnswers[q.id] === q.correct) correctCount++;
    });
    return Math.round((correctCount / SAMPLE_DIAGNOSTIC_QUESTIONS.length) * 100);
  };

  const handleFinish = async () => {
    setSaving(true);
    const baselineScore = calculateDiagnosticScore();

    // 1. Update local auth state
    setProfile({
      exam,
      faculty,
    });

    // 2. Persist to Supabase profiles
    if (user?.id) {
      try {
        await supabase.from("profiles").upsert({
          id: user.id,
          name: user.name || "Doctor",
          email: user.email,
          college: exam,
          faculty,
          target_exam: targetExam,
          target_date: targetDate || null,
          readiness_score: Math.max(baselineScore, 20),
          streak: 1,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Error saving profile:", err);
      }
    }

    setSaving(false);
    onComplete();
  };

  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-burgundy-100 bg-white shadow-xl">
      {/* Header bar */}
      <div className="border-b border-burgundy-100 bg-gradient-to-r from-burgundy-900 to-burgundy-950 px-8 py-6 text-cream-50">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-burgundy-300">
              Personalized Setup
            </span>
            <h2 className="text-xl font-bold sm:text-2xl">
              Doctor Onboarding & Curriculum Setup
            </h2>
          </div>
          <span className="rounded-full bg-burgundy-800/80 px-4 py-1 text-sm font-semibold text-burgundy-200">
            Step {step} of 5
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-burgundy-950/60">
          <div
            className="h-full bg-gradient-to-r from-burgundy-400 to-burgundy-200 transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      <div className="p-6 sm:p-10">
        {/* Step 1: Select Examination College */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-burgundy-950">
                1. Select your target Examination College
              </h3>
              <p className="mt-1 text-sm text-burgundy-800/70">
                Your entire question bank will be filtered to match the exact past recall papers set by this college.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {EXAMS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setExam(e)}
                  className={`flex flex-col rounded-2xl border p-5 text-left transition-all ${
                    exam === e
                      ? "border-burgundy-600 bg-burgundy-50 ring-2 ring-burgundy-500/20"
                      : "border-burgundy-100 bg-cream-50/50 hover:bg-burgundy-50/40"
                  }`}
                >
                  <span className="font-bold text-burgundy-950">{e}</span>
                  <span className="mt-1 text-xs text-burgundy-800/70">
                    Postgraduate medical college syllabus
                  </span>
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-full bg-burgundy-600 px-8 py-3 font-semibold text-cream-50 transition-colors hover:bg-burgundy-700"
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
              <h3 className="text-xl font-bold text-burgundy-950">
                2. What is your Medical Faculty / Department?
              </h3>
              <p className="mt-1 text-sm text-burgundy-800/70">
                Choose the department you are training or sitting your fellowship in.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setFaculty(dept)}
                  className={`rounded-xl border p-4 text-center font-medium transition-all ${
                    faculty === dept
                      ? "border-burgundy-600 bg-burgundy-50 text-burgundy-950 ring-2 ring-burgundy-500/20"
                      : "border-burgundy-100 bg-cream-50/50 text-burgundy-800 hover:bg-burgundy-50/40"
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm font-semibold text-burgundy-700 hover:underline"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="rounded-full bg-burgundy-600 px-8 py-3 font-semibold text-cream-50 transition-colors hover:bg-burgundy-700"
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
              <h3 className="text-xl font-bold text-burgundy-950">
                3. Examination Level & Target Sitting Date
              </h3>
              <p className="mt-1 text-sm text-burgundy-800/70">
                This configures your daily question quota, readiness projection, and spaced repetition calendar.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-burgundy-900">
                  Examination Level
                </label>
                <div className="mt-2 flex flex-wrap gap-3">
                  {["Primaries", "Part I", "Part II (Finals)"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setTargetExam(level)}
                      className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                        targetExam === level
                          ? "bg-burgundy-600 text-white"
                          : "border border-burgundy-200 text-burgundy-700 hover:bg-burgundy-50"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-burgundy-900">
                  Target Exam Sitting Month / Date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-burgundy-200 bg-cream-50/50 p-3.5 text-burgundy-950 outline-none focus:border-burgundy-600 focus:ring-1 focus:ring-burgundy-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-sm font-semibold text-burgundy-700 hover:underline"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="rounded-full bg-burgundy-600 px-8 py-3 font-semibold text-cream-50 transition-colors hover:bg-burgundy-700"
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
              <h3 className="text-xl font-bold text-burgundy-950">
                4. Baseline Diagnostic Calibration
              </h3>
              <p className="mt-1 text-sm text-burgundy-800/70">
                Answer these 3 quick high-yield recall questions to calibrate your initial weakness tracker.
              </p>
            </div>

            <div className="space-y-6">
              {SAMPLE_DIAGNOSTIC_QUESTIONS.map((q, qIdx) => (
                <div
                  key={q.id}
                  className="rounded-2xl border border-burgundy-100 bg-cream-50/40 p-5"
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-burgundy-600">
                    Question {qIdx + 1} · {q.topic}
                  </span>
                  <p className="mt-2 text-sm font-medium text-burgundy-950">
                    {q.question}
                  </p>
                  <div className="mt-3 space-y-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() =>
                          setDiagAnswers((prev) => ({ ...prev, [q.id]: opt }))
                        }
                        className={`flex w-full items-center rounded-xl border px-3.5 py-2.5 text-left text-sm transition-all ${
                          diagAnswers[q.id] === opt
                            ? "border-burgundy-600 bg-burgundy-100/70 font-semibold text-burgundy-950"
                            : "border-burgundy-100 bg-white hover:bg-burgundy-50"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="text-sm font-semibold text-burgundy-700 hover:underline"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep(5)}
                className="rounded-full bg-burgundy-600 px-8 py-3 font-semibold text-cream-50 transition-colors hover:bg-burgundy-700"
              >
                Calculate Personalized Plan →
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Summary & Personalized Curriculum Reveal */}
        {step === 5 && (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-burgundy-100 text-3xl">
              🩺
            </div>
            <div>
              <h3 className="text-2xl font-bold text-burgundy-950">
                Your Personalized Study Engine is Ready!
              </h3>
              <p className="mt-2 text-sm text-burgundy-800/80">
                Here is your calibrated plan based on your diagnostic answers:
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-burgundy-100 bg-cream-50 p-4">
                <span className="text-xs font-semibold text-burgundy-600">
                  Target Board
                </span>
                <p className="mt-1 text-lg font-bold text-burgundy-950">
                  {exam}
                </p>
                <p className="text-xs text-burgundy-700">{faculty}</p>
              </div>

              <div className="rounded-2xl border border-burgundy-100 bg-cream-50 p-4">
                <span className="text-xs font-semibold text-burgundy-600">
                  Initial Readiness Score
                </span>
                <p className="mt-1 text-2xl font-bold text-burgundy-600">
                  {Math.max(calculateDiagnosticScore(), 20)}%
                </p>
                <p className="text-xs text-burgundy-700">Calibrated baseline</p>
              </div>

              <div className="rounded-2xl border border-burgundy-100 bg-cream-50 p-4">
                <span className="text-xs font-semibold text-burgundy-600">
                  Recommended Daily Target
                </span>
                <p className="mt-1 text-2xl font-bold text-burgundy-950">
                  25 Qs/day
                </p>
                <p className="text-xs text-burgundy-700">Spaced repetition queue</p>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                disabled={saving}
                onClick={handleFinish}
                className="w-full rounded-full bg-burgundy-600 py-4 text-base font-bold text-cream-50 shadow-md transition-all hover:bg-burgundy-700 hover:shadow-lg disabled:opacity-50"
              >
                {saving ? "Launching your dashboard..." : "Launch Personalized Dashboard →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
