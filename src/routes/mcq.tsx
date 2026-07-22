import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ayat } from "@/lib/ayat-data";

export const Route = createFileRoute("/mcq")({
  head: () => ({
    meta: [
      { title: "MCQs — سورۃ البقرۃ آیات ۱ تا ۷۰" },
      { name: "description", content: "سورۃ البقرہ کی آیات ۱ تا ۷۰ کے لفظی اور ترجمہ پر مبنی MCQs" },
    ],
  }),
  component: MCQPage,
});

const urduNum = (n: number) =>
  n.toString().replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

const MIN_AYAH = 1;
const MAX_AYAH = 70;

type MCQ = {
  id: string;
  kind: "word" | "ayah";
  ayahN: number;
  question: string;
  correct: string;
  options: string[];
};

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
  const range = ayat.filter((a) => a.n >= MIN_AYAH && a.n <= MAX_AYAH);

  const wordMap = new Map<string, string>();
  for (const a of range) {
    for (const w of a.words) {
      if (!wordMap.has(w.ar)) wordMap.set(w.ar, w.ur);
    }
  }
  const allUrduMeanings = Array.from(new Set(Array.from(wordMap.values())));

  const wordQs: MCQ[] = [];
  for (const a of range) {
    // all words per ayah
    a.words.forEach((w, idx) => {
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
    });
  }

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
  const [filterAyah, setFilterAyah] = useState<number | null>(null);
  const [jumpInput, setJumpInput] = useState("");
  const [blinkId, setBlinkId] = useState<string | null>(null);

  const list = tab === "word" ? wordQs : ayahQs;
  const visible = filterAyah ? list.filter((q) => q.ayahN === filterAyah) : list;
  const correct = visible.filter((q) => answers[q.id] === q.correct).length;
  const wrong = visible.filter((q) => answers[q.id] && answers[q.id] !== q.correct).length;
  const attempted = visible.filter((q) => answers[q.id] !== undefined).length;
  const marks = correct; // 1 mark per correct
  const percent = visible.length ? Math.round((correct / visible.length) * 100) : 0;

  const handlePick = (q: MCQ, opt: string) => {
    if (answers[q.id]) return;
    setAnswers((a) => ({ ...a, [q.id]: opt }));
    setBlinkId(q.id);
    setTimeout(() => setBlinkId((b) => (b === q.id ? null : b)), 1600);
  };

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(jumpInput.replace(/[^\d]/g, ""), 10);
    if (!isNaN(n) && n >= MIN_AYAH && n <= MAX_AYAH) {
      setFilterAyah(n);
      setTimeout(() => {
        document.getElementById(`ayah-${n}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  };

  // group visible by ayahN for section headers
  const grouped = useMemo(() => {
    const map = new Map<number, MCQ[]>();
    for (const q of visible) {
      if (!map.has(q.ayahN)) map.set(q.ayahN, []);
      map.get(q.ayahN)!.push(q);
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [visible]);

  return (
    <div className="min-h-screen px-4 py-8 md:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-6">
          <Link to="/" className="urdu text-sm text-muted-foreground hover:text-foreground">
            ← مرکزی صفحہ پر واپس
          </Link>
          <h1 className="urdu mt-3 text-3xl md:text-4xl font-bold">
            MCQs — آیات ۱ تا ۷۰
          </h1>
          <p className="urdu mt-2 text-sm text-muted-foreground">
            پہلے ایک ایک لفظ کے MCQs، پھر مکمل آیت کے MCQs
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 justify-center">
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

        {/* Jump / Index */}
        <div className="rounded-2xl bg-card border border-border p-4 mb-4">
          <p className="urdu text-center text-sm mb-3 text-muted-foreground">
            📖 آیت نمبر لکھیں (۱ تا ۷۰) — اسی آیت کے سوال کھلیں گے
          </p>
          <form onSubmit={handleJump} className="flex gap-2 justify-center mb-3">
            <input
              type="text"
              inputMode="numeric"
              value={jumpInput}
              onChange={(e) => setJumpInput(e.target.value)}
              placeholder="مثلاً 25"
              className="urdu text-center rounded-xl bg-accent border-2 border-border px-4 py-2 w-32 focus:border-primary outline-none"
            />
            <button
              type="submit"
              className="urdu rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 font-bold"
            >
              کھولیں
            </button>
            {filterAyah && (
              <button
                type="button"
                onClick={() => { setFilterAyah(null); setJumpInput(""); }}
                className="urdu rounded-xl bg-accent border border-border px-4 py-2"
              >
                سب دکھائیں
              </button>
            )}
          </form>
          {/* Quick number grid */}
          <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
            {Array.from({ length: MAX_AYAH }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => {
                  setFilterAyah(n);
                  setJumpInput(String(n));
                  setTimeout(() => {
                    document.getElementById(`ayah-${n}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 50);
                }}
                className={`aspect-square rounded-lg text-sm font-bold urdu border transition-colors
                  ${filterAyah === n
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-accent border-border hover:border-primary text-[color:var(--color-gold)]"}`}
              >
                {urduNum(n)}
              </button>
            ))}
          </div>
        </div>

        {/* Score / Marks */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          <div className="rounded-xl bg-success/20 border border-success px-4 py-2 urdu text-sm font-bold">
            🏆 نمبر: {urduNum(marks)} / {urduNum(visible.length)} ({urduNum(percent)}٪)
          </div>
          <div className="rounded-xl bg-accent border border-border px-4 py-2 urdu text-sm">
            ✅ صحیح: {urduNum(correct)}
          </div>
          <div className="rounded-xl bg-accent border border-border px-4 py-2 urdu text-sm">
            ❌ غلط: {urduNum(wrong)}
          </div>
          <div className="rounded-xl bg-accent border border-border px-4 py-2 urdu text-sm">
            📝 حل شدہ: {urduNum(attempted)}
          </div>
        </div>

        {/* Questions grouped by ayah */}
        <div className="space-y-8">
          {grouped.map(([ayahN, qs]) => (
            <div key={ayahN} id={`ayah-${ayahN}`}>
              <div className="sticky top-2 z-10 mb-3">
                <div className="inline-block rounded-full bg-primary text-primary-foreground urdu text-sm px-4 py-1 font-bold shadow-lg">
                  آیت {urduNum(ayahN)} — {urduNum(qs.length)} سوال
                </div>
              </div>
              <div className="space-y-4">
                {qs.map((q, qi) => {
                  const picked = answers[q.id];
                  const isBlink = blinkId === q.id;
                  const blinkClass = isBlink
                    ? picked === q.correct
                      ? "blink-correct"
                      : "blink-wrong"
                    : "";
                  return (
                    <div
                      key={q.id}
                      className={`rounded-2xl bg-card border border-border p-4 md:p-5 ${blinkClass}`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="urdu text-xs bg-accent px-3 py-1 rounded-full">
                          سوال {urduNum(qi + 1)}
                        </span>
                        {picked && (
                          <span className={`urdu text-xs font-bold px-3 py-1 rounded-full ${
                            picked === q.correct
                              ? "bg-success/30 text-success-foreground"
                              : "bg-danger/30 text-danger-foreground"
                          }`}>
                            {picked === q.correct ? "✅ صحیح — ۱ نمبر" : "❌ غلط — ۰ نمبر"}
                          </span>
                        )}
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
                              onClick={() => handlePick(q, opt)}
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
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center gap-3">
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
