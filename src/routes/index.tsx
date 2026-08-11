import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ayat } from "@/lib/ayat-data";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "سورۃ البقرۃ — آیات ۱ تا ۲۸۶" },
      { name: "description", content: "سورۃ البقرہ کی آیات ۱ تا ۲۸۶ — لفظ بہ لفظ مطلب اور مکمل ترجمہ" },
    ],
  }),
  component: Index,
});

const urduNum = (n: number) =>
  n.toString().replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

function Index() {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [showTrans, setShowTrans] = useState(false);
  const [memorized, setMemorized] = useState<Record<number, boolean>>({});

  const ayah = useMemo(
    () => (selected ? ayat.find((a) => a.n === selected) ?? null : null),
    [selected]
  );

  const yesCount = Object.values(memorized).filter((v) => v === true).length;
  const noCount = Object.values(memorized).filter((v) => v === false).length;

  const openAyah = (n: number) => {
    setSelected(n);
    setRevealed({});
    setShowTrans(false);
  };

  const go = (delta: number) => {
    if (!ayah) return;
    const next = ayah.n + delta;
    if (next < 1 || next > ayat[ayat.length - 1].n) return;
    openAyah(next);
  };

  return (
    <div className="min-h-screen px-4 py-8 md:py-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="inline-block rounded-full bg-primary/90 text-primary-foreground text-xs urdu px-3 py-1">
            🌙 فہمِ قرآن
          </span>
          <h1 className="urdu mt-4 text-4xl md:text-5xl font-bold">
            سورۃ البقرۃ
          </h1>
          <h2 className="urdu mt-2 text-2xl md:text-3xl text-[color:var(--color-gold)]">
            آیات ۱ تا ۲۸۶
          </h2>
          <p className="urdu mt-3 text-sm md:text-base text-muted-foreground">
            لفظ بہ لفظ مطلب سیکھیں — ہر لفظ پر ٹیپ کریں
          </p>
        </div>

        {/* Bismillah */}
        <div className="text-center my-8">
          <p className="arabic text-3xl md:text-4xl text-[color:var(--color-gold)]">
            بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
          </p>
        </div>

        {/* Counters */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <div className="rounded-xl bg-success/20 border border-success px-4 py-2 urdu text-sm">
            ✅ یاد — {urduNum(yesCount)}
          </div>
          <div className="rounded-xl bg-danger/20 border border-danger px-4 py-2 urdu text-sm">
            ❌ یاد نہیں — {urduNum(noCount)}
          </div>
          <Link
            to="/mcq"
            className="rounded-xl bg-primary/90 hover:bg-primary text-primary-foreground border border-primary px-4 py-2 urdu text-sm font-bold"
          >
            📝 MCQs کوئز (۱ تا ۷۰)
          </Link>
        </div>


        {!ayah ? (
          /* INDEX */
          <div>
            <h3 className="urdu text-center text-xl mb-6 text-muted-foreground">
              آیت نمبر پر کلک کریں
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-5 gap-3">
              {ayat.map((a) => {
                const m = memorized[a.n];
                return (
                  <button
                    key={a.n}
                    onClick={() => openAyah(a.n)}
                    className={`aspect-square rounded-2xl border-2 transition-all hover:scale-105 hover:border-primary flex items-center justify-center
                      ${
                        m === true
                          ? "bg-success/20 border-success"
                          : m === false
                          ? "bg-danger/20 border-danger"
                          : "bg-card border-border"
                      }`}
                  >
                    <span className="urdu text-2xl md:text-3xl font-bold text-[color:var(--color-gold)]">
                      {urduNum(a.n)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* AYAH VIEW */
          <div>
            <button
              onClick={() => setSelected(null)}
              className="urdu mb-4 text-sm text-muted-foreground hover:text-foreground"
            >
              ← فہرست پر واپس
            </button>

            <div className="rounded-2xl bg-card border border-border p-5 md:p-7">
              <div className="flex justify-between items-center mb-4">
                <span className="urdu text-sm bg-accent px-3 py-1 rounded-full">
                  مرحلہ ۱ — ہر لفظ کا مطلب
                </span>
                <span className="urdu text-lg font-bold text-[color:var(--color-gold)]">
                  آیت {urduNum(ayah.n)}
                </span>
              </div>

              <p className="urdu text-center text-sm text-muted-foreground mb-5">
                ⬇ ہر لفظ پر ٹیپ کریں — مطلب ظاہر ہوگا
              </p>

              {/* Words */}
              <div
                dir="rtl"
                className="flex flex-wrap gap-3 justify-center mb-6"
              >
                {ayah.words.map((w, i) => {
                  const open = revealed[i];
                  return (
                    <button
                      key={i}
                      onClick={() =>
                        setRevealed((r) => ({ ...r, [i]: !r[i] }))
                      }
                      className={`min-w-[80px] rounded-xl border-2 px-3 py-3 transition-all
                        ${
                          open
                            ? "bg-primary/20 border-primary"
                            : "bg-accent border-border hover:border-primary"
                        }`}
                    >
                      <div className="arabic text-2xl md:text-3xl text-[color:var(--color-gold)]">
                        {w.ar}
                      </div>
                      {open && (
                        <div className="urdu text-sm mt-1 text-foreground">
                          {w.ur}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Full translation */}
              <button
                onClick={() => setShowTrans((s) => !s)}
                className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground urdu py-3 font-bold"
              >
                {showTrans ? "ترجمہ چھپائیں" : "مکمل ترجمہ دیکھیں ←"}
              </button>

              {showTrans && (
                <div className="mt-5 rounded-xl bg-accent/50 border border-border p-5">
                  <p className="arabic text-2xl md:text-3xl text-center text-[color:var(--color-gold)] leading-loose mb-4">
                    {ayah.words.map((w) => w.ar).join(" ")}
                  </p>
                  <div className="border-t border-border my-4" />
                  <p className="urdu text-lg md:text-xl text-center leading-loose">
                    {ayah.translation}
                  </p>
                </div>
              )}

              {/* Memorize buttons */}
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() =>
                    setMemorized((m) => ({ ...m, [ayah.n]: false }))
                  }
                  className={`flex-1 rounded-xl urdu py-2 font-bold border-2 transition-colors
                    ${
                      memorized[ayah.n] === false
                        ? "bg-danger text-danger-foreground border-danger"
                        : "bg-danger/10 border-danger text-foreground hover:bg-danger/20"
                    }`}
                >
                  ❌ یاد نہیں
                </button>
                <button
                  onClick={() =>
                    setMemorized((m) => ({ ...m, [ayah.n]: true }))
                  }
                  className={`flex-1 rounded-xl urdu py-2 font-bold border-2 transition-colors
                    ${
                      memorized[ayah.n] === true
                        ? "bg-success text-success-foreground border-success"
                        : "bg-success/10 border-success text-foreground hover:bg-success/20"
                    }`}
                >
                  ✅ یاد ہے
                </button>
              </div>
            </div>

            {/* Nav */}
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => go(-1)}
                disabled={ayah.n === 1}
                className="flex-1 rounded-xl bg-card border border-border urdu py-3 disabled:opacity-40 hover:border-primary"
              >
                ← پچھلا
              </button>
              <button
                onClick={() => go(1)}
                disabled={ayah.n === ayat[ayat.length - 1].n}
                className="flex-1 rounded-xl bg-card border border-border urdu py-3 disabled:opacity-40 hover:border-primary"
              >
                اگلا →
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="urdu text-center text-xs text-muted-foreground mt-10">
          اللہ آپ کو قرآن سمجھنے کی توفیق دے۔ آمین 🤲
        </p>
      </div>
    </div>
  );
}
