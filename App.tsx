
import React, { useState, useEffect } from 'react';
import { identifyInput, fetchTransactionDetails, fetchPackageModules, fetchCoinMetadataBatch, fetchRandomTransactionDigest } from './services/suiService';
import { fetchAftermathCoinMetadatas } from './services/aftermathService';
import { generateExplanation, generatePackageExplanation } from './services/geminiService';
import { checkRateLimit, recordRequest } from './services/rateLimitService';
import { resolveSuinsNames } from './services/suinsService';
import { ExplanationResult, PackageExplanationResult, CoinMetadata } from './types';
import TransactionResult from './components/TransactionResult';
import PackageResult from './components/PackageResult';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitWait, setRateLimitWait] = useState<number>(0);
  const [txResult, setTxResult] = useState<ExplanationResult | null>(null);
  const [pkgResult, setPkgResult] = useState<PackageExplanationResult | null>(null);
  const [loadingStep, setLoadingStep] = useState('');

  // Countdown timer for rate limiting
  useEffect(() => {
    let timer: number | undefined;
    if (rateLimitWait > 0 && error === 'RATE_LIMIT') {
      timer = window.setInterval(() => {
        setRateLimitWait((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setError(null); // Auto-clear error when timer reaches 0
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [rateLimitWait, error]);

  const handleExplain = async (e?: React.FormEvent, overrideInput?: string) => {
    if (e) e.preventDefault();
    const targetInput = (overrideInput || input).trim();
    const { type, id } = identifyInput(targetInput);

    if (!id) {
      setError('Oops! That doesn\'t look right. Try a Sui link! 🧐');
      return;
    }

    // Rate Limit Check
    const limitStatus = checkRateLimit();
    if (!limitStatus.allowed) {
      setRateLimitWait(limitStatus.waitTimeSeconds);
      setError('RATE_LIMIT');
      return;
    }

    setLoading(true);
    setError(null);
    setTxResult(null);
    setPkgResult(null);

    try {
      if (type === 'transaction') {
        setLoadingStep('Sniffing the chain... 🐕');
        const txData = await fetchTransactionDetails(id);
        
        setLoadingStep('Fetching metadata & names... 🪙');
        const coinMetadata: Record<string, CoinMetadata> = {};
        const uniqueCoins = Array.from(new Set(txData.balanceChanges?.map(bc => bc.coinType) || []));
        const addressesToResolve = [
          txData.transaction?.data.sender,
          txData.transaction?.data.gasData.owner,
          ...(txData.balanceChanges?.map(bc => {
            const owner = bc.owner;
            return typeof owner === 'object' ? Object.values(owner)[0] : owner;
          }) || [])
        ].filter((addr): addr is string => !!addr && addr.startsWith('0x'));

        // Fetch coin metadata AND SuiNS names in parallel (they don't depend on each other)
        const [, suinsNames] = await Promise.all([
          // Coin metadata: Aftermath as primary source, Sui RPC batch only for missing coins
          (async () => {
            const aftermathMeta = await fetchAftermathCoinMetadatas(uniqueCoins);
            for (const [coinType, afMeta] of aftermathMeta) {
              coinMetadata[coinType] = {
                id: coinType,
                name: afMeta.name,
                symbol: afMeta.symbol,
                decimals: afMeta.decimals,
                description: '',
                iconUrl: afMeta.iconUrl,
              };
            }
            // Only call Sui RPC for coins Aftermath didn't cover (single batch request)
            const missingCoins = uniqueCoins.filter(c => !aftermathMeta.has(c));
            if (missingCoins.length > 0) {
              const rpcMeta = await fetchCoinMetadataBatch(missingCoins);
              Object.assign(coinMetadata, rpcMeta);
            }
          })(),
          // SuiNS names - runs in parallel with coin metadata
          resolveSuinsNames(addressesToResolve)
        ]);

        setLoadingStep('Brewing the story... ☕');
        const explanation = await generateExplanation(txData, coinMetadata, suinsNames);

        // Enrich involved parties with SuiNS names
        const enrichedParties = explanation.involvedParties?.map(party => ({
          ...party,
          suinsName: suinsNames.get(party.address) || null
        }));

        // Record successful request for rate limiting
        recordRequest();

        setTxResult({
          raw: txData,
          summary: explanation.summary,
          technicalPlayByPlay: explanation.technicalPlayByPlay,
          mermaidCode: explanation.mermaidCode,
          protocol: explanation.protocol,
          actionType: explanation.actionType,
          involvedParties: enrichedParties,
          coinMetadata,
          senderSuinsName: suinsNames.get(txData.transaction?.data.sender || '') || null
        });
      } else if (type === 'package') {
        setLoadingStep('Unboxing Move code... 🎁');
        const modules = await fetchPackageModules(id);
        setLoadingStep('Analyzing the logic... 🪄');
        const pkgExp = await generatePackageExplanation(id, modules);
        
        // Record successful request for rate limiting
        recordRequest();
        
        setPkgResult(pkgExp);
      }
    } catch (err: any) {
      setError('Something went pop! 🛑 ' + (err.message || 'Check your connection!'));
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleRandom = async () => {
    const limitStatus = checkRateLimit();
    if (!limitStatus.allowed) {
      setRateLimitWait(limitStatus.waitTimeSeconds);
      setError('RATE_LIMIT');
      return;
    }

    setLoading(true);
    setLoadingStep('Rolling the dice... 🎲');
    try {
      const digest = await fetchRandomTransactionDigest();
      setInput(digest);
      await handleExplain(undefined, digest);
    } catch (err: any) {
      setError('Dice roll failed! Try again.');
      setLoading(false);
    }
  };

  const handleReset = () => {
    setInput('');
    setTxResult(null);
    setPkgResult(null);
    setError(null);
    setRateLimitWait(0);
  };

  return (
    <div className="min-h-screen px-3 sm:px-6 lg:px-8 py-4 sm:py-16">
      {/* Fixed Nav Logo */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-3 sm:p-8 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-between items-start">
          <div 
            onClick={handleReset}
            className="pointer-events-auto cursor-pointer sticker-card bg-[#2AC2FF] p-2 sm:p-4 rounded-xl sm:rounded-3xl hover:rotate-6 transition-transform flex items-center gap-2 sm:gap-3"
          >
            <span className="text-lg sm:text-4xl">⚡</span>
            <span className="text-sm sm:text-2xl font-black text-white hidden sm:block tracking-tighter uppercase">TXSENSE</span>
          </div>
        </div>
      </nav>

      <header className="max-w-4xl mx-auto flex flex-col items-center gap-2 sm:gap-6 mb-8 sm:mb-16 text-center pt-14 sm:pt-24">
        <div>
          <h1 className="text-3xl sm:text-7xl md:text-9xl font-black tracking-tighter uppercase leading-none">
            TX<span className="text-[#9B6DFF]">SENSE</span>
          </h1>
          <p className="mt-2 text-[9px] sm:text-lg md:text-xl font-bold uppercase tracking-[0.1em] sm:tracking-[0.4em] text-slate-400 px-2">
            Blockchain interactions, decoded in plain english.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        {!txResult && !pkgResult && !loading && !error && (
          <div className="space-y-6 sm:space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
            {/* Main Search Input */}
            <div className="sticker-card p-1.5 sm:p-3 rounded-xl sm:rounded-[3.5rem] bg-white">
              <form onSubmit={handleExplain} className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <input 
                  type="text"
                  placeholder="Paste a Sui Link or ID..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 bg-transparent px-4 sm:px-8 py-3 sm:py-6 text-sm sm:text-2xl font-bold outline-none placeholder:text-slate-300 min-w-0"
                />
                <button 
                  type="submit"
                  className="btn-chunky bg-[#2AC2FF] text-white px-6 sm:px-12 py-3 sm:py-6 rounded-lg sm:rounded-[3rem] text-sm sm:text-2xl font-black hover:bg-[#1fb8ff] w-full sm:w-auto whitespace-nowrap"
                >
                  GO!
                </button>
              </form>
            </div>

            {/* Random Pick Button */}
            <div className="flex justify-center">
              <button 
                onClick={handleRandom}
                className="sticker-card bg-[#FFD43B] p-5 sm:p-14 rounded-xl sm:rounded-[4rem] text-left group overflow-hidden relative max-w-sm sm:max-w-lg w-full"
              >
                <div className="relative z-10">
                  <span className="text-3xl sm:text-6xl mb-2 sm:mb-6 block group-hover:rotate-[360deg] transition-transform duration-700">🎲</span>
                  <h3 className="text-lg sm:text-4xl font-black uppercase leading-none mb-1 sm:mb-2">Pick Random</h3>
                  <p className="text-[10px] sm:text-xl font-bold opacity-70">Analyze a random transaction</p>
                </div>
                <div className="absolute top-0 right-0 p-2 sm:p-4 text-5xl sm:text-9xl opacity-10 group-hover:scale-150 transition-transform">🎲</div>
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 sm:py-32 space-y-4 sm:space-y-10 animate-in fade-in">
             <div className="sticker-card w-24 h-24 sm:w-48 sm:h-48 rounded-full flex items-center justify-center bg-white animate-bounce">
                <span className="text-3xl sm:text-7xl">🍧</span>
             </div>
             <div className="text-center px-4">
                <h2 className="text-sm sm:text-5xl font-black uppercase tracking-tight break-words">{loadingStep}</h2>
                <div className="mt-3 sm:mt-6 flex gap-2 sm:gap-3 justify-center">
                   <div className="w-2 h-2 sm:w-5 sm:h-5 rounded-full bg-[#2AC2FF] animate-ping"></div>
                   <div className="w-2 h-2 sm:w-5 sm:h-5 rounded-full bg-[#9B6DFF] animate-ping" style={{animationDelay: '0.2s'}}></div>
                   <div className="w-2 h-2 sm:w-5 sm:h-5 rounded-full bg-[#FFD43B] animate-ping" style={{animationDelay: '0.4s'}}></div>
                </div>
             </div>
          </div>
        )}

        {error === 'RATE_LIMIT' && (
          <div className="sticker-card bg-[#FFD43B] p-6 sm:p-16 rounded-xl sm:rounded-[4rem] text-black animate-in zoom-in mx-1 sm:mx-0 text-center">
            <span className="text-4xl sm:text-8xl block mb-4 sm:mb-8 animate-pulse">🧊</span>
            <h3 className="text-lg sm:text-6xl font-black uppercase mb-2 sm:mb-6 tracking-tight">Whoa, Slow Down!</h3>
            <p className="text-xs sm:text-2xl font-bold mb-6 sm:mb-12 opacity-80 leading-relaxed">
              Chill bruh you’re sniffing the chain too fast. <br className="hidden sm:block"/>
              Take a breath! You can go again in <br/>
              <span className="text-[#9B6DFF] text-3xl sm:text-6xl font-black tabular-nums">{rateLimitWait} seconds</span>.
            </p>
            <button 
              onClick={handleReset} 
              className="btn-chunky bg-[#1a1a1a] text-white px-8 sm:px-16 py-3 sm:py-6 rounded-xl sm:rounded-[3rem] font-black uppercase text-xs sm:text-2xl w-full sm:w-auto"
            >
              Cancel
            </button>
          </div>
        )}

        {error && error !== 'RATE_LIMIT' && (
          <div className="sticker-card bg-[#9B6DFF] p-5 sm:p-12 rounded-xl sm:rounded-[4rem] text-white animate-in zoom-in mx-1 sm:mx-0">
            <h3 className="text-lg sm:text-5xl font-black uppercase mb-2 sm:mb-6">Wait! ⛈️</h3>
            <p className="text-xs sm:text-2xl font-bold mb-5 sm:mb-10 opacity-90">{error}</p>
            <button onClick={handleReset} className="btn-chunky bg-white text-[#9B6DFF] px-6 sm:px-12 py-2 sm:py-5 rounded-lg sm:rounded-3xl font-black uppercase text-xs sm:text-xl w-full sm:w-auto">Retry</button>
          </div>
        )}

        {!loading && txResult && <TransactionResult result={txResult} onReset={handleReset} />}
        {!loading && pkgResult && <PackageResult result={pkgResult} onReset={handleReset} />}
      </main>

      <footer className="mt-12 sm:mt-32 max-w-4xl mx-auto flex flex-col items-center gap-2 sm:gap-6 opacity-40 hover:opacity-100 transition-opacity pb-8 sm:pb-20 px-4">
        <div className="h-[3px] sm:h-[6px] w-16 sm:w-40 bg-[#1a1a1a] rounded-full"></div>
        <p className="font-black uppercase tracking-[0.1em] sm:tracking-[0.5em] text-[8px] sm:text-base text-center">TxSense: Plain english blockchain analysis.</p>
      </footer>
    </div>
  );
};

export default App;
