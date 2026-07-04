import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/repeated")({
  head: () => ({
    meta: [
      { title: "دہرائے گئے الفاظ — کوئز" },
      { name: "description", content: "سورۃ البقرہ آیات ۱ تا ۳۰ میں بار بار آنے والے الفاظ کا کوئز" },
    ],
  }),
  component: RepeatedQuiz,
});

const urduNum = (n: number) =>
  n.toString().replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

type Q = { ar: string; ur: string; note?: string };

const WORDS: Q[] = [
  { ar: "اللَّهُ", ur: "اللہ", note: "سب سے زیادہ مرتبہ" },
  { ar: "الَّذِينَ", ur: "جو لوگ / جن لوگوں نے", note: "آیت ۳، ۴، ۶، ۸، ۹، ۲۷" },
  { ar: "يُؤْمِنُونَ", ur: "ایمان لاتے ہیں", note: "آیت ۳، ۴" },
  { ar: "آمَنُوا", ur: "ایمان لائے", note: "آیت ۹، ۱۴، ۲۵" },
  { ar: "قَالُوا", ur: "انہوں نے کہا", note: "آیت ۱۱، ۱۴" },
  { ar: "أُولَٰئِكَ", ur: "یہی لوگ", note: "آیت ۵، ۱۶" },
  { ar: "هُدًى", ur: "ہدایت", note: "آیت ۲، ۵" },
  { ar: "وَإِذَا", ur: "اور جب", note: "آیت ۱۱، ۱۴" },
  { ar: "الْأَرْضِ", ur: "زمین", note: "آیت ۱۱، ۲۲، ۲۷، ۳۰" },
  { ar: "لَا يَعْلَمُونَ", ur: "نہیں جانتے", note: "آیت ۱۳" },
  { ar: "لَا يَشْعُرُونَ", ur: "محسوس نہیں کرتے", note: "آیت ۹، ۱۲" },
  { ar: "الْمَلَائِكَةِ", ur: "فرشتے", note: "آیت ۳۰، ۳۴" },
  { ar: "لَا", ur: "نہیں (نفی)" },
  { ar: "وَ", ur: "اور" },
  { ar: "فِي", ur: "میں" },
  { ar: "مِنْ", ur: "سے" },
];

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

function RepeatedQuiz() {
  const questions = useMemo(() => {
    const allUr = Array.from(new Set(WORDS.map((w) => w.ur)));
    return shuffle(WORDS, 42).map((w, i) => {
      const wrongs = shuffle(
        allUr.filter((u) => u !== w.ur),
        i * 31 + 7
      ).slice(0, 3);
      return {
        ...w,
        options: shuffle([w.ur, ...wrongs], i * 17 + 3),
      };
    });
  }, []);

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const correct = questions.filter((q, i) => answers[i] === q.ur).length;
  const attempted = Object.keys(answers).length;

  return (
    <div className="min-h-screen px-4 py-8 md:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-6">
          <Link to="/" className="urdu text-sm text-muted-foreground hover:text-foreground">
            ← مرکزی صفحہ پر واپس
          </Link>
          <h1 className="urdu mt-3 text-3xl md:text-4xl font-bold">
            دہرائے گئے الفاظ کا کوئز
          </h1>
          <p className="urdu mt-2 text-sm text-muted-foreground">
            سورۃ البقرہ آیات ۱ تا ۳۰ — بار بار آنے والے الفاظ
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="rounded-xl bg-accent border border-border px-5 py-2 urdu text-sm">
            ✅ صحیح: {urduNum(correct)} / حل شدہ: {urduNum(attempted)} / کل: {urduNum(questions.length)}
          </div>
        </div>

        <div className="space-y-5">
          {questions.map((q, i) => {
            const picked = answers[i];
            return (
              <div key={i} className="rounded-2xl bg-card border border-border p-4 md:p-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="urdu text-xs bg-accent px-3 py-1 rounded-full">
                    سوال {urduNum(i + 1)}
                  </span>
                  {q.note && (
                    <span className="urdu text-xs text-[color:var(--color-gold)]">
                      {q.note}
                    </span>
                  )}
                </div>

                <p dir="rtl" className="arabic text-center text-3xl md:text-4xl text-[color:var(--color-gold)] mb-4 leading-loose">
                  {q.ar}
                </p>

                <p className="urdu text-center text-xs text-muted-foreground mb-3">
                  اس لفظ کا صحیح مطلب کیا ہے؟
                </p>

                <div className="grid gap-2">
                  {q.options.map((opt, oi) => {
                    const isPicked = picked === opt;
                    const isCorrect = opt === q.ur;
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
                        onClick={() => setAnswers((a) => ({ ...a, [i]: opt }))}
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

                {picked && picked !== q.ur && (
                  <p className="urdu mt-3 text-sm text-center text-success">
                    ✅ صحیح جواب: {q.ur}
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
