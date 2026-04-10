export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative">
      <div className="glow-orb w-[400px] h-[400px] bg-[rgba(0,255,100,0.06)] top-[10%] left-[20%] absolute" />
      <h1 className="text-5xl font-bold text-glow tracking-wider">MOGPOLY</h1>
      <p className="mt-4 text-[var(--text-secondary)] text-sm">Setting up...</p>
    </main>
  );
}
