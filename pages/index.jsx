// pages/index.jsx
import { useState } from 'react';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const PRICE_PER_TOKEN_SOL = 0.00001; // 1 RUBBCOIN = 0.00001 SOL
const TOKEN_SYMBOL = 'RUBBCOIN';

export default function Home() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [amountSol, setAmountSol] = useState('');
  const [isBuying, setIsBuying] = useState(false);
  const [txSignature, setTxSignature] = useState(null);
  const [error, setError] = useState(null);

  const treasuryAddress = process.env.NEXT_PUBLIC_TREASURY_WALLET;

  const parsedAmount = parseFloat(amountSol) || 0;
  const tokensToReceive =
    parsedAmount > 0 ? Math.floor(parsedAmount / PRICE_PER_TOKEN_SOL) : 0;

  const handleBuy = async () => {
    setError(null);
    setTxSignature(null);

    if (!publicKey) {
      setError('Please connect your wallet first.');
      return;
    }

    if (!treasuryAddress) {
      setError('Treasury wallet is not configured.');
      return;
    }

    if (parsedAmount <= 0) {
      setError('Enter a valid SOL amount.');
      return;
    }

    try {
      setIsBuying(true);

      const lamports = Math.round(parsedAmount * LAMPORTS_PER_SOL);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(treasuryAddress),
          lamports,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      setTxSignature(signature);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Transaction failed.');
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {/* Top bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center text-xs font-bold">
              RB
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide">
                {TOKEN_SYMBOL}
              </div>
              <div className="text-[11px] text-slate-400 uppercase tracking-[0.18em]">
                Solana Presale
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="#how-it-works"
              className="text-xs text-slate-300 hover:text-slate-100 transition"
            >
              How it works
            </a>
            <WalletMultiButton className="!h-9 !rounded-xl !bg-indigo-600 hover:!bg-indigo-500 !text-xs !font-semibold" />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-start">
          {/* Left: Presale card */}
          <section className="rounded-3xl border border-slate-800/80 bg-slate-900/80 shadow-xl shadow-black/40 p-6 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                {TOKEN_SYMBOL} Presale
              </h1>
              <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-300 uppercase tracking-[0.18em]">
                Live
                <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </span>
            </div>

            <p className="text-sm text-slate-300 mb-5">
              Participate in the {TOKEN_SYMBOL} presale using SOL on Solana
              mainnet. Connect your wallet, choose how much SOL to contribute,
              and confirm the transaction. Tokens will be distributed according
              to the presale schedule.
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3 text-xs mb-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-3 py-3">
                <div className="text-slate-400 mb-1">Price</div>
                <div className="text-sm font-semibold">
                  1 {TOKEN_SYMBOL} = {PRICE_PER_TOKEN_SOL} SOL
                </div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-3 py-3">
                <div className="text-slate-400 mb-1">Network</div>
                <div className="text-sm font-semibold">Solana Mainnet</div>
              </div>
            </div>

            {/* Amount input */}
            <label className="block mb-2 text-xs font-semibold text-slate-300 tracking-wide">
              Amount in SOL
            </label>
            <div className="flex items-center gap-3 mb-3">
              <input
                type="number"
                min="0"
                step="0.0001"
                value={amountSol}
                onChange={(e) => setAmountSol(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-sm outline-none ring-0 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/70"
                placeholder="0.5"
              />
              <button
                type="button"
                onClick={() => setAmountSol('0.5')}
                className="px-3 py-2 rounded-2xl border border-slate-700 text-[11px] text-slate-300 hover:border-indigo-500 hover:text-indigo-300 transition"
              >
                0.5 SOL
              </button>
            </div>

            {/* Receive info */}
            <div className="flex items-center justify-between text-xs mb-5">
              <span className="text-slate-400">You will receive</span>
              <span className="font-semibold text-slate-50 text-sm">
                {tokensToReceive.toLocaleString()} {TOKEN_SYMBOL}
              </span>
            </div>

            {/* CTA button */}
            <button
              onClick={handleBuy}
              disabled={isBuying || !publicKey}
              className="w-full rounded-2xl bg-indigo-600 py-2.5 text-sm font-semibold shadow-md shadow-indigo-900/50 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-indigo-500 transition"
            >
              {publicKey
                ? isBuying
                  ? 'Processing transaction...'
                  : 'Purchase Tokens'
                : 'Connect Wallet to Buy'}
            </button>

            {/* Error / success messages */}
            {error && (
              <p className="mt-3 text-xs text-red-400 bg-red-950/40 border border-red-900/70 rounded-2xl px-3 py-2">
                {error}
              </p>
            )}

            {txSignature && (
              <p className="mt-3 text-[11px] text-emerald-300 bg-emerald-950/40 border border-emerald-900/60 rounded-2xl px-3 py-2 break-all">
                Transaction sent:{' '}
                <a
                  href={`https://explorer.solana.com/tx/${txSignature}?cluster=mainnet-beta`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2 hover:text-emerald-100"
                >
                  View on Solana Explorer
                </a>
              </p>
            )}

            {/* Small note */}
            <p className="mt-4 text-[11px] text-slate-400">
              By participating in this presale you acknowledge that on-chain
              transactions are final and you understand the risks of
              cryptocurrency and token sales.
            </p>
          </section>

          {/* Right: Info panel */}
          <aside className="space-y-4">
            <div className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-5">
              <h2 className="text-sm font-semibold mb-2">Token details</h2>
              <dl className="text-xs space-y-2">
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-400">Token</dt>
                  <dd className="font-medium">{TOKEN_SYMBOL}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-400">Chain</dt>
                  <dd className="font-medium">Solana</dd>
                </div>
                {process.env.NEXT_PUBLIC_RUBB_MINT && (
                  <div className="flex flex-col gap-1">
                    <dt className="text-slate-400">Mint address</dt>
                    <dd className="font-mono text-[11px] break-all text-slate-200">
                      {process.env.NEXT_PUBLIC_RUBB_MINT}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div
              id="how-it-works"
              className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-5"
            >
              <h2 className="text-sm font-semibold mb-2">How it works</h2>
              <ol className="text-xs space-y-2 text-slate-300">
                <li>
                  <span className="font-semibold text-slate-100">1.</span>{' '}
                  Connect your Solana wallet (Phantom, Solflare, etc.) using the
                  button in the top-right.
                </li>
                <li>
                  <span className="font-semibold text-slate-100">2.</span>{' '}
                  Enter the amount of SOL you want to contribute to the presale.
                </li>
                <li>
                  <span className="font-semibold text-slate-100">3.</span>{' '}
                  Click <span className="font-semibold">Purchase Tokens</span>{' '}
                  and approve the transaction in your wallet.
                </li>
                <li>
                  <span className="font-semibold text-slate-100">4.</span>{' '}
                  You will later receive {TOKEN_SYMBOL} to your connected wallet
                  according to the presale distribution plan.
                </li>
              </ol>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
