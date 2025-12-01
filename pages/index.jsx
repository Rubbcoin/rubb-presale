// pages/index.jsx
import { useState } from 'react';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const PRICE_PER_TOKEN_SOL = 0.00001; // 1 RUBBCOIN = 0.00001 SOL (change if you want)
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
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">
            {TOKEN_SYMBOL} Presale
          </h1>
          <WalletMultiButton className="!bg-indigo-600 hover:!bg-indigo-500" />
        </div>

        <p className="text-sm text-slate-400 mb-6">
          Buy {TOKEN_SYMBOL} with SOL on Solana mainnet. No referrals – just connect
          your wallet, enter SOL amount, and purchase.
        </p>

        <div className="space-y-3 mb-6 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Price</span>
            <span>1 {TOKEN_SYMBOL} = {PRICE_PER_TOKEN_SOL} SOL</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Payment</span>
            <span>SOL (mainnet)</span>
          </div>
          {process.env.NEXT_PUBLIC_RUBB_MINT && (
            <div className="flex flex-col">
              <span className="text-slate-400">Token Mint</span>
              <span className="text-xs break-all">
                {process.env.NEXT_PUBLIC_RUBB_MINT}
              </span>
            </div>
          )}
        </div>

        <label className="block mb-2 text-sm text-slate-300">
          Enter amount in SOL
        </label>
        <input
          type="number"
          min="0"
          step="0.0001"
          value={amountSol}
          onChange={(e) => setAmountSol(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="0.1"
        />

        <div className="mt-3 mb-4 text-sm flex justify-between">
          <span className="text-slate-400">You will receive</span>
          <span className="font-semibold">
            {tokensToReceive.toLocaleString()} {TOKEN_SYMBOL}
          </span>
        </div>

        <button
          onClick={handleBuy}
          disabled={isBuying || !publicKey}
          className="w-full rounded-xl bg-indigo-600 py-2 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed hover:bg-indigo-500 transition"
        >
          {publicKey ? (isBuying ? 'Processing...' : 'Purchase Tokens') : 'Connect Wallet to Buy'}
        </button>

        {error && (
          <p className="mt-3 text-sm text-red-400">
            {error}
          </p>
        )}

        {txSignature && (
          <p className="mt-3 text-xs text-emerald-400 break-all">
            Transaction sent:{' '}
            <a
              href={`https://explorer.solana.com/tx/${txSignature}?cluster=mainnet-beta`}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              View on Solana Explorer
            </a>
          </p>
        )}

        <div className="mt-6 border-t border-slate-800 pt-4 text-xs text-slate-500 space-y-1">
          <p className="font-semibold">How it works:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Connect your Solana wallet (Phantom, Solflare, etc.).</li>
            <li>Enter the amount of SOL you want to spend.</li>
            <li>Click &quot;Purchase Tokens&quot; and approve the transaction.</li>
            <li>{TOKEN_SYMBOL} will be distributed to your wallet according to presale rules.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
