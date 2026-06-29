import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ayat } from "@/lib/ayat-data";

export const Route = createFileRoute("/mcq")({
  head: () => ({
    meta: [
      { title: "MCQs — سورۃ البقرۃ آیات ۱ تا ۲۰" },
      { name: "description", content: "سورۃ البقرہ کی آیات ۱ تا ۲۰ کے لفظی اور ترجمہ پر مبنی MCQs" },
    ],
  }),
  component: MCQPage,
});

const urduNum = (n: number) =>
  n.toString().replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

type MCQ = {
  id: string;
  kind: "word" | "ayah";
  ayahN: number;
  question: string; // arabic
  correct: string;
  options: string[];
};

// deterministic shuffle using seed
function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildMCQs(): { wordQs: MCQ[]; ayahQs: MCQ[] } {
  const range = ayat.filter((a) => a.n >= 1 && a.n <= 20);

  // unique word pool (ar -> ur)
  const wordMap = new Map<string, string>();
  for (const a of range) {
    for (const w of a.words) {
      if (!wordMap.has(w.ar)) wordMap.set(w.ar, w.ur);
    }
  }
  const allUrduMeanings = Array.from(new Set(Array.from(wordMap.values())));

  const wordQs: MCQ[] = [];
  let i = 0;
  for (const a of range) {
    // 2 words per ayah (or all if fewer)
    const picks = shuffle(a.words.map((_, idx) => idx), a.n * 7).slice(0, Math.min(2, a.words.length));
    for (const idx of picks) {
      const w = a.words[idx];
      const wrongs = shuffle(
        allUrduMeanings.filter((u) => u !== w.ur),
        a.n * 13 + idx
      ).slice(0, 3);
      const options = shuffle([w.ur, ...wrongs], a.n * 17 + idx);
      wordQs.push({
        id: `w-${a.n}-${idx}`,
        kind: "word",
        ayahN: a.n,
        question: w.ar,
        correct: w.ur,
        options,
      });
      i++;
    }
  }

  // ayah translation MCQs
  const allTranslations = range.map((a) => a.translation);
  const ayahQs: MCQ[] = range.map((a) => {
    const wrongs = shuffle(
      allTranslations.filter((t) => t !== a.translation),
      a.n * 23
    ).slice(0, 3);
    const options = shuffle([a.translation, ...wrongs], a.n * 29);
    const fullAr = a.words.map((w) => w.ar).join(" ");
    return {
      id: `a-${a.n}`,
      kind: "ayah",
      ayahN: a.n,
      question: fullAr,
      correct: a.translation,
      options,
    };
  });

  return { wordQs, ayahQs };
}

function MCQPage() {
  const { wordQs, ayahQs } = useMemo(buildMCQs, []);
  const [tab, setTab] = useState<"word" | "ayah">("word");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const list = tab === "word" ? wordQs : ayahQs;
  const correct = list.filter((q) => answers[q.id] === q.correct).length;
  const attempted = list.filter((q) => answers[q.id] !== undefined).length;

  return (
    <div className="min-h-screen px-4 py-8 md:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-6">
          <Link
            to="/"
            className="urdu text-sm text-muted-foreground hover:text-foreground"
          >
            ← مرکزی صفحہ پر واپس
          </Link>
          <h1 className="urdu mt-3 text-3xl md:text-4xl font-bold">
            MCQs — آیات ۱ تا ۲۰
          </h1>
          <p className="urdu mt-2 text-sm text-muted-foreground">
            پہلے ایک ایک لفظ کے MCQs، پھر مکمل آیت کے MCQs
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 justify-center">
          <button
            onClick={() => setTab("word")}
            className={`urdu px-4 py-2 rounded-xl border-2 ${
              tab === "word"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border hover:border-primary"
            }`}
          >
            لفظ بہ لفظ ({urduNum(wordQs.length)})
          </button>
          <button
            onClick={() => setTab("ayah")}
            className={`urdu px-4 py-2 rounded-xl border-2 ${
              tab === "ayah"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border hover:border-primary"
            }`}
          >
            مکمل آیات ({urduNum(ayahQs.length)})
          </button>
        </div>

        {/* Score */}
        <div className="flex justify-center mb-6">
          <div className="rounded-xl bg-accent border border-border px-5 py-2 urdu text-sm">
            ✅ صحیح: {urduNum(correct)} / حل شدہ: {urduNum(attempted)} / کل: {urduNum(list.length)}
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-5">
          {list.map((q, qi) => {
            const picked = answers[q.id];
            return (
              <div
                key={q.id}
                className="rounded-2xl bg-card border border-border p-4 md:p-5"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="urdu text-xs bg-accent px-3 py-1 rounded-full">
                    سوال {urduNum(qi + 1)}
                  </span>
                  <span className="urdu text-xs text-[color:var(--color-gold)]">
                    آیت {urduNum(q.ayahN)}
                  </span>
                </div>

                <p
                  dir="rtl"
                  className={`arabic text-center text-[color:var(--color-gold)] mb-4 leading-loose ${
                    q.kind === "ayah" ? "text-xl md:text-2xl" : "text-3xl md:text-4xl"
                  }`}
                >
                  {q.question}
                </p>

                <p className="urdu text-center text-xs text-muted-foreground mb-3">
                  {q.kind === "word" ? "اس لفظ کا صحیح مطلب کیا ہے؟" : "اس آیت کا صحیح ترجمہ کون سا ہے؟"}
                </p>

                <div className="grid gap-2">
                  {q.options.map((opt, oi) => {
                    const isPicked = picked === opt;
                    const isCorrect = opt === q.correct;
                    let cls = "bg-accent border-border hover:border-primary";
                    if (picked) {
                      if (isCorrect) cls = "bg-success/20 border-success";
                      else if (isPicked) cls = "bg-danger/20 border-danger";
                      else cls = "bg-card border-border opacity-60";
                    }
                    return (
                      <button
                        key={oi}
                        disabled={!!picked}
                        onClick={() =>
                          setAnswers((a) => ({ ...a, [q.id]: opt }))
                        }
                        className={`urdu text-right text-base md:text-lg rounded-xl border-2 px-4 py-3 transition-colors ${cls}`}
                      >
                        <span className="text-[color:var(--color-gold)] font-bold ml-2">
                          {urduNum(oi + 1)}.
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {picked && picked !== q.correct && (
                  <p className="urdu mt-3 text-sm text-center text-success">
                    ✅ صحیح جواب: {q.correct}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setAnswers({})}
            className="urdu rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 font-bold"
          >
            🔄 دوبارہ شروع کریں
          </button>
        </div>
      </div>
    </div>
  );
}
