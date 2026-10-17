// v0.1 step 1: a holding page while the town is built. The guest map replaces it in step 3.
export default function Home() {
  return (
    <main className="hold">
      <div className="hold-card">
        <span className="studio-mark hold-mark">Clout City</span>
        <span className="hold-badge">Hollywood Music</span>
        <p className="hold-tagline">PLAY LOUD. BLOW UP.</p>
        <p className="hold-copy">Welcome to Hollywood. Every waiter here is in a band. Yours just has to be the one that makes it.</p>
        <p className="hold-soon">The doors open soon.</p>
      </div>
    </main>
  );
}
