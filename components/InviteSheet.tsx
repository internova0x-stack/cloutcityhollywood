"use client";

import { useEffect, useState } from "react";
import { GAME_CONFIG } from "@/lib/config";
import { crewProgress, inviteUrl } from "@/lib/invite";
import type { CrewMember } from "@/lib/player";
import { sceneOf } from "@/lib/sound";
import { handle } from "@/lib/validation";
import { CopyIcon, ShareIcon } from "./icons";
import { Sheet } from "./Sheet";

// The invite screen, "Create your band" (Milestones v0.1; Clout City Clarifications 7; owner, Oct 17: invited
// friends are your band): a personal link, a share button and the count. Rewards unlock when the town opens.
export function InviteSheet({
  open,
  onClose,
  inviteCode,
  crew,
}: {
  open: boolean;
  onClose: () => void;
  inviteCode: string;
  crew: CrewMember[];
}) {
  const [origin, setOrigin] = useState(process.env.NEXT_PUBLIC_SITE_URL ?? "");
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SITE_URL) setOrigin(window.location.origin);
  }, []);

  const link = origin ? inviteUrl(origin, inviteCode) : `/i/${inviteCode}`;
  const size = GAME_CONFIG.crew.size;
  const progress = crewProgress(crew.length, size);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  async function share() {
    const text = "Join my band in Clout City: Hollywood Music. Claim your name before the town opens.";
    if (navigator.share) {
      try {
        await navigator.share({ title: "Clout City: Hollywood Music", text, url: link });
      } catch {
        // A cancelled share sheet is fine.
      }
      return;
    }
    await copy();
  }

  return (
    <Sheet open={open} onClose={onClose} label="Create your band" tall>
      <div className="stack-24">
        <div className="stack-4" style={{ paddingRight: 44 }}>
          <div className="row" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
            <h2 className="display-lg" style={{ margin: 0 }}>Create your band</h2>
            <span className="body-strong" style={{ whiteSpace: "nowrap" }}>{progress.shown} of {size} joined</span>
          </div>
          <p className="subtext" style={{ margin: "4px 0 0" }}>
            Nobody gets famous alone. Somebody has to hold the tambourine. Everyone who signs up through your link joins your band.
          </p>
        </div>

        <div className="card stack-12">
          <p className="overline" style={{ margin: 0 }}>Your link</p>
          <div className="row" style={{ background: "#fff", borderRadius: 12, padding: "10px 12px", boxShadow: "var(--elev-1)" }}>
            <span className="body-strong" style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {link.replace(/^https?:\/\//, "")}
            </span>
            <button className="icon-round" onClick={copy} aria-label="Copy invite link">
              <CopyIcon size={16} />
            </button>
          </div>
          {copied && <p className="meta" style={{ margin: 0, color: "var(--green-text)" }} role="status">Copied. Go spread the word.</p>}
          <button className="btn btn-taxi" onClick={share}>
            <ShareIcon size={18} /> Share my link
          </button>
        </div>

        <div className="stack-8">
          <span className="title">Your band</span>
          <div style={{ height: 8, borderRadius: 999, background: "var(--chip-off)", overflow: "hidden" }} role="progressbar" aria-valuemin={0} aria-valuemax={size} aria-valuenow={progress.shown}>
            <div style={{ width: `${progress.ratio * 100}%`, height: "100%", background: "var(--spotlight-400)", borderRadius: 999, transition: "width .4s ease-out" }} />
          </div>
          <p className="meta" style={{ margin: "4px 0 0" }}>Rewards unlock when the town opens. Everyone who joins now still counts.</p>
        </div>

        <div className="stack-8">
          {crew.length === 0 ? (
            <div className="card center">
              <div className="crew-seats" aria-hidden="true">
                {Array.from({ length: size }, (_, i) => (
                  <span key={i} className="crew-seat" style={{ background: SEAT_COLORS[i % SEAT_COLORS.length] }}>
                    <svg viewBox="0 0 40 40" width="40" height="40"><circle cx="20" cy="15" r="7" fill="rgba(255,255,255,.85)" /><path d="M7 37c1.5-8 7-12 13-12s11.5 4 13 12" fill="rgba(255,255,255,.85)" /></svg>
                  </span>
                ))}
              </div>
              <p className="title" style={{ margin: 0 }}>Nobody yet</p>
              <p className="subtext" style={{ margin: "4px 0 0" }}>A band of one is a solo act. Send that link.</p>
            </div>
          ) : (
            crew.map((m) => {
              const s = sceneOf(m.scene);
              return (
                <div key={`${m.display_name}-${m.joined_at}`} className="card row" style={{ gap: 12 }}>
                  <span style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--night-900)", border: "2px solid var(--spotlight-400)", display: "grid", placeItems: "center", fontSize: 18 }} aria-hidden="true">
                    {s.emoji}
                  </span>
                  <span className="stack-4" style={{ flex: 1, minWidth: 0 }}>
                    <span className="title" style={{ display: "block" }}>{handle(m.display_name)}</span>
                    <span className="subtext" style={{ display: "block" }}>{s.label}</span>
                  </span>
                  <span className="tag tag-positive">Joined</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Sheet>
  );
}

/** Flat, soft colors for the empty band seats (Monument Valley pastels). */
const SEAT_COLORS = ["#F7B7C8", "#B9D8F7", "#C9E8C4", "#F9D9A8", "#A8DCD9"];
