
import React from 'react';
import { ExplanationResult, CoinMetadata, InvolvedParty } from '../types';
import { EXPLORER_URL, MIST_PER_SUI } from '../constants';
import MermaidChart from './MermaidChart';

interface TransactionResultProps {
  result: ExplanationResult;
  onReset: () => void;
}

const TransactionResult: React.FC<TransactionResultProps> = ({ result, onReset }) => {
  const { raw, summary, mermaidCode, coinMetadata, protocol, actionType, technicalPlayByPlay, involvedParties } = result;
  
  const gas = raw.effects ? (
    BigInt(raw.effects.gasUsed.computationCost) + 
    BigInt(raw.effects.gasUsed.storageCost) - 
    BigInt(raw.effects.gasUsed.storageRebate)
  ) : 0n;
  
  const gasInSui = Number(gas) / Number(MIST_PER_SUI);
  const status = raw.effects?.status.status || 'unknown';
  const sender = raw.transaction?.data.sender;

  const shortenAddr = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const getCoinDisplay = (coinType: string, meta?: CoinMetadata) => {
    if (meta?.symbol) return { symbol: meta.symbol, name: meta.name };
    const parts = coinType.split('::');
    const fallbackSymbol = parts[parts.length - 1] || 'COIN';
    return { symbol: fallbackSymbol, name: 'Unregistered Asset' };
  };

  return (
    <div className="space-y-6 sm:space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
      {/* Main Intel Panel */}
      <section className="sticker-card p-4 sm:p-10 md:p-16 rounded-[1.5rem] sm:rounded-[4rem] relative overflow-hidden bg-white">
        <div className="sm:absolute top-4 sm:top-6 right-4 sm:right-6 bg-[#FFD43B] border-2 sm:border-4 border-[#1a1a1a] px-2.5 sm:px-6 py-1 sm:py-2 rounded-full font-black uppercase text-[9px] sm:text-sm z-10 w-fit mb-4 sm:mb-0">
          {status === 'success' ? '✨ Verified' : '❌ Failed'}
        </div>

        <div className="mb-6 sm:mb-12">
          <h2 className="text-2xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter mb-2 sm:mb-6 leading-none">
            Tx<span className="text-[#2AC2FF]">Sense</span> <br className="hidden xs:block"/>Report.
          </h2>
          <div className="h-[4px] sm:h-[8px] w-12 sm:w-24 bg-[#9B6DFF] rounded-full mb-6 sm:mb-10"></div>
          
          <div className="flex flex-wrap gap-2 sm:gap-4 mb-6 sm:mb-10">
            {protocol && (
              <div className="bg-[#2AC2FF]/10 px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl border-2 border-[#2AC2FF] font-black uppercase text-[8px] sm:text-sm text-[#2AC2FF]">
                🏦 {protocol}
              </div>
            )}
            {actionType && (
              <div className="bg-[#9B6DFF]/10 px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl border-2 border-[#9B6DFF] font-black uppercase text-[8px] sm:text-sm text-[#9B6DFF]">
                ⚡ {actionType}
              </div>
            )}
            {sender && (
              <a 
                href={`https://suivision.xyz/account/${sender}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-100 px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl border-2 border-[#1a1a1a] font-black text-[8px] sm:text-sm hover:bg-slate-200 transition-colors inline-block"
              >
                👤 {shortenAddr(sender)}
              </a>
            )}
          </div>

          <div className="space-y-4 sm:space-y-8">
            <div className="bg-slate-50 p-4 sm:p-8 rounded-xl sm:rounded-[2.5rem] border-2 border-dashed border-slate-200 shadow-inner">
              <p className="text-base sm:text-2xl md:text-3xl leading-snug font-black text-slate-800 tracking-tight mb-3 sm:mb-6">
                {summary}
              </p>
              <div className="h-[1px] sm:h-[2px] w-full bg-slate-200 mb-4 sm:mb-8"></div>
              <div className="space-y-2 sm:space-y-4">
                <h4 className="text-[8px] sm:text-xs font-black uppercase tracking-widest text-slate-400">Technical Breakdown</h4>
                <p className="text-xs sm:text-xl md:text-2xl font-bold text-slate-600 leading-relaxed italic">
                  {technicalPlayByPlay || "Analyzing technical flow..."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 pt-6 sm:pt-10 border-t-2 sm:border-t-4 border-[#1a1a1a]/5">
          <div className="bg-[#2AC2FF]/10 p-4 sm:p-6 rounded-xl sm:rounded-[2rem] border-2 sm:border-4 border-dashed border-[#2AC2FF]">
             <p className="text-[8px] sm:text-xs font-black uppercase tracking-widest text-[#2AC2FF] mb-1">Fee paid</p>
             <p className="text-lg sm:text-3xl font-black">{gasInSui.toFixed(6)} SUI</p>
          </div>
          <div className="bg-[#9B6DFF]/10 p-4 sm:p-6 rounded-xl sm:rounded-[2rem] border-2 sm:border-4 border-dashed border-[#9B6DFF]">
             <p className="text-[8px] sm:text-xs font-black uppercase tracking-widest text-[#9B6DFF] mb-1">Assets Moved</p>
             <p className="text-lg sm:text-3xl font-black">{raw.balanceChanges?.length || 0} Types</p>
          </div>
          <div className="bg-[#FFD43B]/10 p-4 sm:p-6 rounded-xl sm:rounded-[2rem] border-2 sm:border-4 border-dashed border-[#FFD43B] sm:col-span-2 lg:col-span-1">
             <p className="text-[8px] sm:text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Objects</p>
             <p className="text-lg sm:text-3xl font-black">{raw.objectChanges?.length || 0} Affected</p>
          </div>
        </div>
      </section>

      {/* Involved Parties Section */}
      {involvedParties && involvedParties.length > 0 && (
        <section className="sticker-card p-4 sm:p-10 rounded-[1.5rem] sm:rounded-[3.5rem] bg-white">
          <h3 className="text-lg sm:text-3xl font-black uppercase mb-6 sm:mb-10 flex items-center gap-2 sm:gap-4">
            <span className="w-6 h-6 sm:w-10 sm:h-10 bg-[#9B6DFF] rounded-lg sm:rounded-xl flex items-center justify-center text-white text-xs sm:text-xl">🤝</span>
            Involved Parties
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
            {involvedParties.map((party, idx) => (
              <div key={idx} className="p-3 sm:p-5 rounded-lg sm:rounded-2xl bg-slate-50 border-2 border-[#1a1a1a] flex flex-col gap-1 hover:bg-slate-100 transition-colors">
                <div className="flex justify-between items-start">
                  <span className="bg-[#FFD43B] text-black px-2 py-0.5 rounded-full font-black uppercase text-[7px] sm:text-[10px]">
                    {party.role}
                  </span>
                  {party.label && (
                    <span className="text-[7px] sm:text-[10px] font-black uppercase text-slate-400">
                      {party.label}
                    </span>
                  )}
                </div>
                <a 
                  href={`https://suivision.xyz/account/${party.address}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[9px] sm:text-sm font-mono font-bold break-all hover:text-[#2AC2FF] transition-colors"
                >
                  {party.address}
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {mermaidCode && (
        <section className="sticker-card p-4 sm:p-10 rounded-[1.5rem] sm:rounded-[3.5rem] bg-white overflow-hidden">
          <h3 className="text-lg sm:text-3xl font-black uppercase mb-6 sm:mb-10 flex items-center gap-2 sm:gap-4">
            <span className="w-6 h-6 sm:w-10 sm:h-10 bg-[#2AC2FF] rounded-lg sm:rounded-xl flex items-center justify-center text-white text-xs sm:text-xl">🗺️</span>
            Flow Visualization
          </h3>
          <div className="p-3 sm:p-8 bg-slate-50 border-2 sm:border-4 border-[#1a1a1a] rounded-xl sm:rounded-[2.5rem]">
            <MermaidChart chart={mermaidCode} />
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
        <div className="sticker-card p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[3rem] bg-white">
          <h4 className="text-sm sm:text-2xl font-black uppercase mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
             <span className="text-base sm:text-3xl text-[#9B6DFF]">👛</span> Balance Deltas
          </h4>
          <div className="space-y-3 sm:space-y-4">
            {raw.balanceChanges && raw.balanceChanges.length > 0 ? (
              raw.balanceChanges.map((bc, i) => {
                const meta = coinMetadata[bc.coinType];
                const display = getCoinDisplay(bc.coinType, meta);
                const decimals = meta?.decimals ?? 9;
                const amount = BigInt(bc.amount);
                const isNegative = amount < 0n;
                const scaledValue = Number(amount < 0n ? -amount : amount) / Math.pow(10, decimals);
                const formatted = scaledValue.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: decimals,
                });
                
                return (
                 <div key={i} className="p-3 sm:p-5 rounded-lg sm:rounded-2xl bg-slate-50 border-2 border-[#1a1a1a] hover:bg-[#9B6DFF]/5 transition-colors group">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-2">
                      <div className="min-w-0 flex-1 w-full">
                        <div className="flex items-center gap-2">
                           <span className="font-black text-xs sm:text-xl block truncate">{display.symbol}</span>
                           {!meta && <span className="text-[6px] sm:text-[10px] bg-slate-200 px-1 py-0.5 rounded font-black opacity-50">?</span>}
                        </div>
                        <span className="text-[6px] sm:text-[10px] uppercase font-black opacity-40 truncate block w-full group-hover:opacity-100 transition-opacity">
                            {bc.coinType.slice(0, 10)}...{bc.coinType.slice(-8)}
                        </span>
                      </div>
                      <div className="sm:text-right w-full sm:w-auto">
                        <span className={`text-sm sm:text-2xl font-black ${isNegative ? 'text-[#9B6DFF]' : 'text-[#2AC2FF]'}`}>
                           {isNegative ? '-' : '+'}{formatted}
                        </span>
                      </div>
                    </div>
                 </div>
                );
              })
            ) : (
              <p className="text-slate-400 font-bold p-3 italic text-[10px] sm:text-base">No wallet impact detected.</p>
            )}
          </div>
        </div>

        <div className="sticker-card p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[3rem] bg-white">
          <h4 className="text-sm sm:text-2xl font-black uppercase mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
             <span className="text-base sm:text-3xl text-[#FFD43B]">🏗️</span> Object Impact
          </h4>
          <div className="space-y-3 sm:space-y-4 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
            {raw.objectChanges && raw.objectChanges.length > 0 ? (
              raw.objectChanges.map((oc, i) => (
                <div key={i} className="p-2 sm:p-4 rounded-lg sm:rounded-2xl bg-slate-50 border-2 border-[#1a1a1a] text-[8px] sm:text-xs">
                  <div className="flex gap-1.5 mb-1.5">
                    <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-black uppercase text-[6px] sm:text-[9px] text-white ${
                      oc.type === 'mutated' ? 'bg-[#FFD43B] text-black' : 
                      oc.type === 'created' ? 'bg-[#2AC2FF]' :
                      oc.type === 'deleted' ? 'bg-red-500' : 'bg-slate-400'
                    }`}>
                      {oc.type}
                    </span>
                  </div>
                  <a 
                    href={`https://suivision.xyz/object/${oc.objectId}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-mono font-bold truncate block hover:text-[#2AC2FF] transition-colors"
                  >
                    {oc.objectId}
                  </a>
                  <p className="text-[6px] sm:text-[9px] font-black uppercase opacity-30 mt-1 truncate">Type: {oc.objectType.split('::').pop()}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-400 font-bold p-3 italic text-[10px] sm:text-base">No objects were changed.</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 sm:gap-6 py-6 sm:py-10">
         <a 
            href={`${EXPLORER_URL}${raw.digest}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="text-slate-400 font-bold uppercase tracking-widest hover:text-[#9B6DFF] transition-colors text-[9px] sm:text-sm text-center"
         >
           View Data on Suivision ↗
         </a>
         <button 
           onClick={onReset}
           className="btn-chunky bg-[#2AC2FF] text-white px-8 sm:px-16 py-3 sm:py-5 rounded-xl sm:rounded-[3rem] text-sm sm:text-3xl font-black hover:bg-[#1fb8ff] w-full sm:w-auto"
         >
           ANOTHER ONE! 🍬
         </button>
      </div>
    </div>
  );
};

export default TransactionResult;
