"use client";

import { useState, type ReactNode } from "react";
import type { ComingSoonKey } from "../ComingSoon";
import {
  BuildingIcon, ChecklistIcon, ChevronDownIcon, ChevronUpIcon, DiamondIcon, DrumsticksIcon,
  HouseIcon, MapPinIcon, MicIcon, PersonIcon, PhoneIcon, ReceiptIcon, SpeakerIcon, SpeakerOffIcon, StoreIcon,
} from "../icons";

export type ChromeAction = ComingSoonKey | "invite" | "tab:home";

const STATS = [
  { key: "energy", label: "Energy", emoji: "⚡" },
  { key: "mood", label: "Mood", emoji: "🙂" },
  { key: "confidence", label: "Confidence", emoji: "💪" },
] as const;

/**
 * The home-screen chrome (Clarifications 2, Clout City's layout): the top bar with the fame star,
 * the Invite your Crew pill, the fixed side column (Tasks, Shows, Places, Band, Bills, Your Look),
 * the collapsible stats panel and the bottom nav. Fame, money and stats show "—" until v0.2.
 */
export function GameChrome({
  time,
  muted,
  onToggleSound,
  onAction,
  invitePin = false,
  netWorthPin = false,
  me,
}: {
  time: string;
  muted: boolean;
  onToggleSound: () => void;
  onAction: (a: ChromeAction) => void;
  invitePin?: boolean;
  netWorthPin?: boolean;
  me: { head: ReactNode; onOpen: () => void };
}) {
  const [statsOpen, setStatsOpen] = useState(false);

  return (
    <>
      <header className="hud glass-hud" aria-label="Status bar">
        <div className="hud-cluster">
          <span className="hud-time hud-number" aria-label="City time">
            {time ? <>{time.split(" ")[0]}<small className="hud-ampm">{time.split(" ")[1]}</small></> : " "}
          </span>
          <button className="hud-btn" onClick={() => onAction("daily")} aria-label="Daily tasks">
            <DailyRing />
            <span className="hud-number">—/5</span>
          </button>
          <button className="hud-icon-btn" onClick={onToggleSound} aria-label={muted ? "Play music" : "Mute music"} aria-pressed={!muted}>
            <span className="circle">{muted ? <SpeakerOffIcon size={18} /> : <SpeakerIcon size={18} />}</span>
          </button>
        </div>
        <div className="hud-cluster">
          <button className="hud-btn hud-clout" data-tour="fame" onClick={() => onAction("fame")} aria-label="Fame">
            <FameStar size={20} />
            <span className="hud-number">—</span>
          </button>
          <button className="hud-icon-btn" data-tour="money" onClick={() => onAction("networth")} aria-label="Net worth">
            <span className="circle"><DiamondIcon size={18} /></span>
            {netWorthPin && <span className="pin-dot" />}
          </button>
          <button className="hud-btn" data-tour="money" onClick={() => onAction("bank")} aria-label="Bank balance">
            <span className="hud-number">C$—</span>
          </button>
        </div>
      </header>

      <div className="under-hud">
        <button className="pill-glass glass-hud" style={{ position: "relative" }} onClick={() => onAction("invite")}>
          Invite your Crew
          {invitePin && <span className="pin-dot" style={{ top: -2, right: -2 }} />}
        </button>
      </div>

      <nav className="side-col" aria-label="Quick actions">
        <SideBtn label="Tasks" aria="Tasks and goals" onClick={() => onAction("tasks")}><ChecklistIcon /></SideBtn>
        <SideBtn label="Shows" aria="Shows" tour="shows" onClick={() => onAction("shows")}><MicIcon /></SideBtn>
        <SideBtn label="Places" aria="Places" onClick={() => onAction("places")}><BuildingIcon /></SideBtn>
        <SideBtn label="Band" aria="Band" onClick={() => onAction("band")}><DrumsticksIcon /></SideBtn>
        <SideBtn label="Bills" aria="Bills" onClick={() => onAction("bills")}><ReceiptIcon /></SideBtn>
        <SideBtn label="Look" aria="Your look" onClick={() => onAction("look")}><PersonIcon /></SideBtn>
      </nav>

      {!statsOpen && (
        <button className="me-bubble" onClick={me.onOpen} aria-label="Your profile">
          <span className="me-bubble-head">{me.head}</span>
        </button>
      )}
      <section className={`stats glass-hud${statsOpen ? "" : " collapsed"} with-bubble`} aria-label="Energy, mood and confidence">
        {statsOpen ? (
          <>
            <button className="stats-toggle" onClick={() => setStatsOpen(false)} aria-label="Collapse stats">
              <ChevronDownIcon size={18} />
            </button>
            {STATS.map((s) => (
              <div key={s.key} className="stat-block">
                <div className="stat-row" role="meter" aria-label={`${s.label}: starts when the town opens`}>
                  <span className="label">{s.emoji} {s.label}<span className="stat-value">—</span></span>
                  <span className="stat-track" style={{ display: "block" }} />
                </div>
              </div>
            ))}
            <button className="btn btn-ghost" style={{ height: 36 }} onClick={() => onAction("stats")}>What are these?</button>
          </>
        ) : (
          <button className="stats-mini" onClick={() => setStatsOpen(true)} aria-label="Expand stats">
            {STATS.map((s) => <span key={s.key} className="stat-track" />)}
            <ChevronUpIcon size={16} />
          </button>
        )}
      </section>

      <nav className="nav glass-hud" aria-label="Main">
        <button className="nav-tab" aria-current="page" onClick={() => onAction("tab:home")}>
          <HouseIcon /> Home
        </button>
        <button className="nav-tab" data-tour="map" onClick={() => onAction("map")}>
          <MapPinIcon /> Map
        </button>
        <button className="nav-tab" data-tour="phone" onClick={() => onAction("phone")}>
          <PhoneIcon /> Phone
        </button>
        <button className="nav-tab" onClick={() => onAction("shop")}>
          <StoreIcon /> Shop
        </button>
      </nav>
    </>
  );
}

/** Daily tasks: an empty ring until tasks switch on. */
function DailyRing({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="daily-ring">
      <circle cx="12" cy="12" r={9} fill="none" stroke="currentColor" strokeOpacity={0.22} strokeWidth={3} />
    </svg>
  );
}

/** Fame: a solid spotlight-yellow star with a light core (Clarifications 2). */
export function FameStar({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="hud-star" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD84D" />
          <stop offset="1" stopColor="#F2A900" />
        </linearGradient>
      </defs>
      <path d="m12 2.6 2.8 5.9 6.4.8-4.7 4.5 1.2 6.4L12 17.1l-5.7 3.1 1.2-6.4-4.7-4.5 6.4-.8z" fill="url(#hud-star)" stroke="#E09A00" strokeWidth={0.8} strokeLinejoin="round" />
      <path d="m12 7.4 1.3 2.8 3 .4-2.2 2.1.6 3L12 14.2l-2.7 1.5.6-3-2.2-2.1 3-.4z" fill="#FFF3C4" opacity={0.85} />
    </svg>
  );
}

function SideBtn({ label, aria, tour, onClick, children }: { label: string; aria: string; tour?: string; onClick: () => void; children: ReactNode }) {
  return (
    <button className="side-btn" data-tour={tour} onClick={onClick} aria-label={aria}>
      <span className="side-ico glass-hud">{children}</span>
      <span className="side-lbl" aria-hidden="true">{label}</span>
    </button>
  );
}
