import { FrontDoor } from "./FrontDoor";

// The holding card with the sign-up buttons (the front page and its preview).
export function FrontCard({ invited = false, authError = false, startOpen = false }: { invited?: boolean; authError?: boolean; startOpen?: boolean }) {
  return (
    <main className="hold">
      <div className="hold-card">
        <span className="studio-mark hold-mark">Clout City</span>
        <span className="hold-badge">Hollywood Music</span>
        <p className="hold-tagline">PLAY LOUD. BLOW UP.</p>
        <p className="hold-copy">Welcome to Hollywood. Every waiter here is in a band. Yours just has to be the one that makes it.</p>
        <p className="hold-soon">Early access: claim your name before the town opens.</p>
        <FrontDoor invited={invited} authError={authError} startOpen={startOpen} />
      </div>
    </main>
  );
}
