"use client";

import { useEffect, useState } from "react";
import { SignUpSheet, type AuthMode } from "./SignUpSheet";

/**
 * The front page's buttons and the sign-up sheet. Until the guest map arrives (v0.1 step 3), the
 * holding card is the front door: Sign up or Log in. An invite link (/i/CODE) opens sign-up at once.
 */
export function FrontDoor({ invited = false, authError = false, startOpen = false }: { invited?: boolean; authError?: boolean; startOpen?: boolean }) {
  const [mode, setMode] = useState<AuthMode>("signup");
  const [open, setOpen] = useState(startOpen);
  useEffect(() => {
    if (invited) setOpen(true);
  }, [invited]);

  return (
    <>
      {authError && <p className="hold-error" role="alert">That sign-in link has expired or was already used. Ask for a new one.</p>}
      <div className="hold-actions">
        <button className="btn btn-taxi" onClick={() => { setMode("signup"); setOpen(true); }}>
          {invited ? "Join your friend's crew ›" : "Claim your name ›"}
        </button>
        <button className="btn btn-ghost hold-login" onClick={() => { setMode("login"); setOpen(true); }}>
          Already in? Log in
        </button>
      </div>
      <SignUpSheet open={open} onClose={() => setOpen(false)} invited={invited} mode={mode} onSwitchMode={setMode} />
    </>
  );
}
