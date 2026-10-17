"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GAME_CONFIG } from "@/lib/config";
import { cleanName, handle, nameError } from "@/lib/validation";

type Claim = (input: { name: string; ageConfirmed?: boolean }) => Promise<{ ok: true } | { ok: false; error: string; field?: "name" | "age" }>;

/**
 * Claim your name (v0.1 step 2): the first screen after sign-in. The full creator (the Look and the
 * Sound step) builds on this screen in v0.1 step 4. Google sign-ins that skipped the 18+ box get it here.
 */
export function ClaimName({ claim, check, askAge }: { claim: Claim; check?: (name: string) => Promise<boolean | null>; askAge: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [adult, setAdult] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [free, setFree] = useState<boolean | null>(null);

  const problem = name ? nameError(name) : null;
  useEffect(() => {
    setFree(null);
    if (!check || !name || nameError(name)) return;
    const t = setTimeout(() => void check(name).then(setFree), 350);
    return () => clearTimeout(t);
  }, [name, check]);

  async function submit() {
    setError(null);
    const p = nameError(name);
    if (p) return setError(p);
    if (askAge && !adult) return setError("Clout City is 18+. Confirm your age to continue.");
    setBusy(true);
    const res = await claim({ name, ageConfirmed: askAge ? adult : undefined });
    setBusy(false);
    if (!res.ok) return setError(res.error);
    router.push("/home");
    router.refresh();
  }

  return (
    <main className="hold">
      <form className="hold-card claim-card" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
        <span className="studio-mark hold-mark" style={{ fontSize: 30 }}>Clout City</span>
        <p className="hold-tagline" style={{ fontSize: 22 }}>WHAT&apos;S YOUR STAGE NAME?</p>
        <p className="hold-copy">This goes on the posters, the charts and, one day, a very large tour bus. Letters, numbers, _ and . only.</p>
        <label className="field claim-field" htmlFor="claim-name">
          <span className="claim-at" aria-hidden="true">@</span>
          <input
            id="claim-name"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            maxLength={GAME_CONFIG.profile.nameMaxLength + 1}
            placeholder="riffqueen"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="Stage name"
            aria-invalid={!!problem}
          />
        </label>
        <p className={`claim-hint${problem || free === false ? " bad" : free ? " good" : ""}`} role="status">
          {problem ?? (free === false ? `${handle(cleanName(name))} is taken.` : free ? `${handle(cleanName(name))} is yours if you want it.` : " ")}
        </p>
        {askAge && (
          <label className="check-row claim-age">
            <input type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} />
            <span>
              I&apos;m 18 or older and I agree to the <a href="/terms" target="_blank" rel="noreferrer">Terms</a> and{" "}
              <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.
            </span>
          </label>
        )}
        {error && <p className="hold-error" role="alert">{error}</p>}
        <div className="hold-actions">
          <button type="submit" className="btn btn-taxi" disabled={busy || !name || !!problem || free === false || (askAge && !adult)}>
            {busy ? "Printing the posters…" : "Claim it ›"}
          </button>
        </div>
      </form>
    </main>
  );
}
