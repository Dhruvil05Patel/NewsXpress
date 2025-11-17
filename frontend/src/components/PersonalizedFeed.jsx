import React from "react";
// PersonalizedFeedDemo: mock feed demonstrating personalized recommendations UI.
// NOTE: This is a demo variant (not production): toggles a local isLoggedIn state,
// simulates async loading, and renders placeholder items. Replace with real
// server-driven logic + auth context integration for production usage.
import { Sparkles, LogIn, LogOut } from "lucide-react";

export default function PersonalizedFeedDemo() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState([]);

  React.useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setItems(
        isLoggedIn
          ? [
              {
                id: 1,
                title: "AI beats benchmarks in medical imaging",
                summary:
                  "A new transformer-based model surpasses SOTA on multiple radiology datasets.",
                source: "HealthTech Daily",
              },
              {
                id: 2,
                title: "Markets rally on upbeat earnings",
                summary:
                  "Blue chips post strong Q3 results as guidance remains resilient.",
                source: "FinNews",
              },
              {
                id: 3,
                title: "Climate tech startups secure funding",
                summary:
                  "VCs pour capital into carbon capture and grid-scale storage.",
                source: "GreenWire",
              },
            ]
          : []
      );
      setLoading(false);
    }, 600);
    return () => clearTimeout(t);
  }, [isLoggedIn]);

  return (
    <div className="min-h-[60vh] w-full max-w-3xl mx-auto px-4 py-6 text-white">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-300" />
          <h1 className="text-xl sm:text-2xl font-semibold">
            Personalized Feed (Demo)
          </h1>
        </div>
        <button
          onClick={() => setIsLoggedIn((v) => !v)}
          className="inline-flex items-center gap-2 rounded-md bg-slate-700 hover:bg-slate-600 px-3 py-2 text-sm"
        >
          {isLoggedIn ? (
            <>
              <LogOut className="w-4 h-4" /> Log out
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" /> Log in
            </>
          )}
        </button>
      </header>

      {!isLoggedIn ? (
        <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-6">
          <p className="text-slate-300">
            Log in to see your personalized recommendations.
          </p>
        </div>
      ) : loading ? (
        <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-6">
          <p className="text-slate-300">Loading recommendations…</p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-6">
          <p className="text-slate-300">
            No recommendations yet. Interact with articles to get started.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((it) => (
            <li
              key={it.id}
              className="rounded-lg border border-slate-700 bg-slate-800/60 p-4 hover:bg-slate-800 transition-colors"
            >
              <h3 className="text-lg font-medium mb-1">{it.title}</h3>
              <p className="text-slate-300 text-sm mb-2">{it.summary}</p>
              <div className="text-slate-400 text-xs">Source: {it.source}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
