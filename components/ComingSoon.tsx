"use client";

import { Sheet } from "./Sheet";

// Witty "Coming soon" cards for everything v0.1 doesn't build yet (Milestones rule 1).
// Copy never implies the feature exists today.

export type ComingSoonKey =
  | "tasks" | "daily" | "shows" | "places" | "band" | "bills" | "look"
  | "phone" | "shop" | "map" | "fame" | "networth" | "bank" | "stats";

const COPY: Record<ComingSoonKey, { emoji: string; title: string; body: string }> = {
  tasks: { emoji: "📋", title: "Tasks & Goals", body: "Your to-do list is being written by a manager you can't afford yet. It lands when the town opens." },
  daily: { emoji: "✅", title: "Daily Tasks", body: "Five things to do every day, for cash. Not yet, though. Enjoy the quiet before the tour bus." },
  shows: { emoji: "🎤", title: "Shows", body: "The sound guy is still untangling cables. Open mics and shows start when the town opens." },
  places: { emoji: "🏙️", title: "Places", body: "The doors of Echo Flats are still being painted black. Places open soon." },
  band: { emoji: "🥁", title: "Band", body: "Every waiter in this town is in a band. Hiring yours opens later. Practice your solo face." },
  bills: { emoji: "🧾", title: "Bills", body: "No rent due. Savor this. It will never happen again in Los Angeles." },
  look: { emoji: "🪞", title: "Your Look", body: "Your stage clothes are still at the dry cleaner. Very rock and roll of them." },
  phone: { emoji: "📱", title: "Phone", body: "No signal yet. Gossip, brand deals and your mom asking if this is \"still the music thing\" arrive soon." },
  shop: { emoji: "🛍️", title: "Shop", body: "The guitar wall is empty and the price tags are being inflated. Opening soon." },
  map: { emoji: "🗺️", title: "Map", body: "Echo Flats is getting its streets drawn. The map arrives in the next update." },
  fame: { emoji: "⭐", title: "Fame", body: "Fame is how many strangers would ask for a selfie. Counting starts when the shows do." },
  networth: { emoji: "💎", title: "Net worth", body: "Everything you could sell if the band breaks up. Right now that's a dream and a cable." },
  bank: { emoji: "💵", title: "Bank balance", body: "Your account is open. It's just very, very quiet. Cash arrives when the town opens." },
  stats: { emoji: "⚡", title: "Energy, Mood & Confidence", body: "Your vibes are being soundchecked. Stats switch on when the town opens." },
};

export function ComingSoon({ which, onClose }: { which: ComingSoonKey | null; onClose: () => void }) {
  const copy = which ? COPY[which] : null;
  return (
    <Sheet open={!!copy} onClose={onClose} label={copy?.title ?? "Coming soon"}>
      {copy && (
        <div className="stack-16" style={{ paddingTop: 8 }}>
          <div
            aria-hidden="true"
            style={{ width: 56, height: 56, borderRadius: 14, background: "#fff", boxShadow: "var(--elev-1)", display: "grid", placeItems: "center", fontSize: 28 }}
          >
            {copy.emoji}
          </div>
          <h2 className="display-lg" style={{ margin: 0, paddingRight: 40 }}>{copy.title}</h2>
          <div className="card hazard-edge stack-4" style={{ paddingLeft: 22 }}>
            <p className="overline" style={{ margin: 0 }}>Coming soon</p>
            <p className="body" style={{ margin: 0, color: "var(--text-2)" }}>{copy.body}</p>
          </div>
          <button className="btn btn-taxi" onClick={onClose}>Got it</button>
        </div>
      )}
    </Sheet>
  );
}
