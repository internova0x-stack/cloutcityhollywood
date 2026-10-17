"use client";

import { useEffect, useState } from "react";
import { cityMinutes } from "@/lib/clock";
import type { CrewMember, Player } from "@/lib/player";
import { sceneOf } from "@/lib/sound";
import { handle } from "@/lib/validation";
import { ComingSoon, type ComingSoonKey } from "./ComingSoon";
import { GameChrome, FameStar, type ChromeAction } from "./hud/GameChrome";
import { InviteSheet } from "./InviteSheet";
import { Sheet } from "./Sheet";

/** "9:41 PM" on the city clock (one day every 2 real hours). */
function cityTime(nowMs: number): string {
  const m = cityMinutes(nowMs);
  const h = Math.floor(m / 60);
  return `${((h + 11) % 12) + 1}:${String(m % 60).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/**
 * The signed-in home screen (v0.1). Only Home and the invite screen work; everything else opens a
 * "Coming soon" card. The room and the 3D artist arrive in a later step; until then a stage-lit
 * welcome card sits behind the chrome.
 */
export function GameShell({
  player,
  crew,
  onToggleMute,
  preview = false,
}: {
  player: Player;
  crew: CrewMember[];
  /** Saves the mute choice on the account; the preview leaves it out. */
  onToggleMute?: (muted: boolean) => Promise<unknown>;
  preview?: boolean;
}) {
  const [time, setTime] = useState("");
  const [muted, setMuted] = useState(player.music_muted);
  const [soon, setSoon] = useState<ComingSoonKey | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  // The invite pill wears a dot until the player opens it once (Clarifications 2: notification pins).
  const [invitePin, setInvitePin] = useState(false);

  useEffect(() => {
    const tick = () => setTime(cityTime(Date.now()));
    tick();
    const t = setInterval(tick, 5000);
    try {
      setInvitePin(localStorage.getItem("cch_invite_seen") !== "1");
    } catch {
      setInvitePin(true);
    }
    return () => clearInterval(t);
  }, []);

  function onAction(a: ChromeAction) {
    if (a === "tab:home") return;
    if (a === "invite") {
      setInviteOpen(true);
      setInvitePin(false);
      try {
        localStorage.setItem("cch_invite_seen", "1");
      } catch {
        // Private windows: the dot just comes back next time.
      }
      return;
    }
    setSoon(a);
  }

  function toggleSound() {
    const next = !muted;
    setMuted(next);
    void onToggleMute?.(next);
  }

  const initials = player.display_name.slice(0, 2).toUpperCase();
  const head = <span className="cch-head" aria-hidden="true">{initials}</span>;

  return (
    <main className="game cch-home">
      <section className="cch-stage" aria-label="Home">
        <div className="cch-welcome">
          <p className="overline" style={{ margin: 0, color: "var(--marquee-bulb)" }}>Echo Flats · Home</p>
          <h1 className="display-lg" style={{ margin: 0, color: "var(--text-on-dark)" }}>{handle(player.display_name)}</h1>
          <p className="subtext" style={{ margin: 0, color: "rgba(255,255,255,.82)" }}>
            Your place is still getting its furniture. While the movers argue, round up your crew.
          </p>
          <p className="cch-crew-count" role="status">{Math.min(crew.length, 5)} of 5 joined</p>
        </div>
      </section>

      <GameChrome
        time={time}
        muted={muted}
        onToggleSound={toggleSound}
        onAction={onAction}
        invitePin={invitePin}
        me={{ head, onOpen: () => setProfileOpen(true) }}
      />

      <ComingSoon which={soon} onClose={() => setSoon(null)} />
      <InviteSheet open={inviteOpen} onClose={() => setInviteOpen(false)} inviteCode={player.invite_code} crew={crew} />
      <Sheet open={profileOpen} onClose={() => setProfileOpen(false)} label="Your profile">
        <div className="stack-16" style={{ paddingTop: 8 }}>
          <div className="row" style={{ gap: 12, paddingRight: 44 }}>
            <span className="cch-head cch-head-lg" aria-hidden="true">{initials}</span>
            <span className="stack-4" style={{ minWidth: 0 }}>
              <h2 className="display-lg" style={{ margin: 0, overflowWrap: "anywhere" }}>{handle(player.display_name)}</h2>
              <span className="subtext">{sceneOf(player.scene).emoji} {sceneOf(player.scene).label}</span>
            </span>
          </div>
          <div className="card row" style={{ justifyContent: "space-between" }}>
            <span className="row" style={{ gap: 6 }}><FameStar size={18} /> <span className="body-strong">Fame</span></span>
            <span className="body-strong">— <span className="meta">· Nobody (for now)</span></span>
          </div>
          <div className="card row" style={{ justifyContent: "space-between" }}>
            <span className="body-strong">Crew</span>
            <span className="body-strong">{Math.min(crew.length, 5)} of 5 joined</span>
          </div>
          {!preview && (
            <form action="/auth/signout" method="post">
              <button type="submit" className="btn btn-secondary">Sign out</button>
            </form>
          )}
        </div>
      </Sheet>
    </main>
  );
}
