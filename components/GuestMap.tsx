"use client";

import { useEffect, useState } from "react";
import { cityMinutes } from "@/lib/clock";
import { PLACE_PINS, GUEST_START } from "@/lib/places";
import { CityMap } from "./map/CityMap";
import { SignUpSheet, type AuthMode } from "./SignUpSheet";

/** Day runs 6 AM to 7:59 PM on the city clock (one day every 2 real hours). */
const isDay = (ms: number) => {
  const m = cityMinutes(ms);
  return m >= 6 * 60 && m < 20 * 60;
};

function cityTime(ms: number): string {
  const m = cityMinutes(ms);
  const h = Math.floor(m / 60);
  return `${((h + 11) % 12) + 1}:${String(m % 60).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/**
 * The guest map (Milestones v0.1; Clarifications 3): Echo Flats on real Echo Park and Silver Lake streets,
 * the four venues and three homes, the Halo Dome and the CLOUTWOOD letters in the Elysian Park hills, and
 * the locked districts under clouds. Any tap opens sign-up.
 */
export function GuestMap({ invited = false, authError = false, forceTime }: { invited?: boolean; authError?: boolean; forceTime?: "day" | "night" }) {
  const [auth, setAuth] = useState<AuthMode | null>(invited ? "signup" : null);
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(t);
  }, []);
  const daytime = forceTime ? forceTime === "day" : now === null ? false : isDay(now);
  const signUp = () => setAuth("signup");

  return (
    <main className="game">
      <CityMap
        pins={PLACE_PINS}
        initialCenter={GUEST_START.at}
        initialZoom={GUEST_START.zoom}
        daytime={daytime}
        onPinTap={signUp}
        onLockedTap={signUp}
        vehicles
        attributionControl={false}
        fitPins={{ top: 150, bottom: 300 }}
      />

      <div className="guest-top">
        <div className="guest-pills" aria-label="Echo Flats right now">
          <span className="pill-status glass-hud">📍 Echo Flats, Hollywood</span>
          {now !== null && <span className="pill-status glass-hud">{daytime ? "☀️" : "🌙"} {cityTime(now)}</span>}
          <span className="pill-status glass-hud">🎤 4 stages · 3 homes</span>
        </div>
      </div>

      <div className="guest-bottom">
        <section className="guest-card glass-hud" aria-label="Join Clout City: Hollywood Music">
          <h1 className="studio-mark guest-card-logo">Clout City</h1>
          <p className="body-strong" style={{ margin: 0 }}>
            Play loud. Blow up.{" "}
            <span style={{ fontWeight: 400, color: "var(--text-3)" }}>Free in your browser.</span>
          </p>
          {(authError || invited) && (
            <p className="subtext" style={{ margin: "6px 0 0", color: authError ? "var(--red-text)" : "var(--text-2)" }}>
              {authError ? "That sign-in link expired or was already used. Grab a fresh one." : "A friend saved you a spot in their band. Claim your name before the town opens."}
            </p>
          )}
          <div className="row" style={{ gap: 8, marginTop: 12 }}>
            <button className="btn btn-taxi" style={{ flex: 3 }} onClick={signUp}>Claim your name</button>
            <button className="btn btn-secondary on-dark-secondary" style={{ flex: 1.2 }} onClick={() => setAuth("login")}>Log in</button>
          </div>
          <p className="meta guest-foot">
            A parody · 18+ · <a href="/terms">Terms</a> · <a href="/privacy">Privacy</a> · No ad trackers
            <br />
            Map <a href="https://openfreemap.org" target="_blank" rel="noreferrer">OpenFreeMap</a> ©{" "}
            <a href="https://www.openmaptiles.org/" target="_blank" rel="noreferrer">OpenMapTiles</a> ©{" "}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>
          </p>
        </section>
      </div>

      <SignUpSheet open={auth !== null} mode={auth ?? "signup"} onClose={() => setAuth(null)} onSwitchMode={setAuth} invited={invited} />
    </main>
  );
}
