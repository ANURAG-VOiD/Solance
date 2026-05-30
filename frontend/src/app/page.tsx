import { Header } from "@/components/Header";
import { WalletStatus } from "@/components/WalletStatus";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#050508] text-white">
      <Header />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-16">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm uppercase tracking-[0.2em] text-violet-400">
            Phase 13 · Wallet Auth
          </p>
          <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Collaborate on Solana.
            <span className="block bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Own your identity.
            </span>
          </h1>
          <p className="mb-10 max-w-lg text-lg leading-relaxed text-zinc-400">
            Solance is a wallet-native platform for freelancers and clients —
            no passwords, just cryptographic proof of wallet ownership.
          </p>

          <WalletStatus />
        </div>
      </main>
    </div>
  );
}
