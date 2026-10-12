"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { QUESTIONS } from "@/lib/questions";
import { getBookmarks, toggleBookmark } from "@/lib/store";

export default function Bookmarks() {
  const { user } = useAuth();
  const [, force] = useState(0);
  if (!user) return null;

  const bookmarks = getBookmarks(user.id)
    .map((id) => ({ ...QUESTIONS[id], id }))
    .filter((q) => q.text);

  return (
    <div>
      <h1 className="text-2xl font-bold text-burgundy-950">Bookmarks</h1>
      <p className="mt-1 text-sm text-burgundy-800/70">
        Questions you saved to revisit before exam day.
      </p>

      {bookmarks.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-burgundy-100 bg-cream-50 p-10 text-center">
          <p className="font-bold text-burgundy-950">No bookmarks yet</p>
          <p className="mt-2 text-sm text-burgundy-800/70">
            Tap the star on any question in the question bank to save it here.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {bookmarks.map((q) => (
            <li
              key={q.id}
              className="rounded-xl border border-burgundy-100 bg-cream-50 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-burgundy-950">{q.text}</p>
                  <p className="mt-2 text-xs font-semibold text-burgundy-600">
                    {q.exam} · {q.faculty}
                    {q.sub ? ` · ${q.sub}` : ""} · {q.topic}
                  </p>
                </div>
                <button
                  onClick={() => {
                    toggleBookmark(user.id, q.id);
                    force((n) => n + 1);
                  }}
                  className="shrink-0 rounded-full border border-burgundy-200 px-3 py-1 text-sm font-semibold text-burgundy-700 hover:bg-burgundy-50"
                >
                  Remove
                </button>
              </div>
              <div className="mt-3 rounded-lg bg-burgundy-50 p-3 text-sm text-burgundy-900/80">
                <span className="font-semibold text-burgundy-800">
                  Answer: {q.correct}.
                </span>{" "}
                {q.explanation}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
