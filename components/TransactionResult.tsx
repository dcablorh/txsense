import React from "react";
import { ExplanationResult, CoinMetadata, InvolvedParty } from "../types";
import { EXPLORER_URL, MIST_PER_SUI } from "../constants";
import MermaidChart from "./MermaidChart";

interface TransactionResultProps {
  result: ExplanationResult;
  onReset: () => void;
}

const TransactionResult: React.FC<TransactionResultProps> = ({
  result,
  onReset,
}) => {
  const {
    raw,
    summary,
    mermaidCode,
    coinMetadata,
    protocol,
    actionType,
    technicalPlayByPlay,
    involvedParties,
  } = result;

  const gas = raw.effects
    ? BigInt(raw.effects.gasUsed.computationCost) +
      BigInt(raw.effects.gasUsed.storageCost) -
      BigInt(raw.effects.gasUsed.storageRebate)
    : 0n;

  const gasInSui = Number(gas) / Number(MIST_PER_SUI);
  const status = raw.effects?.status.status || "unknown";
  const sender = raw.transaction?.data.sender;

  const shortenAddr = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const getCoinDisplay = (coinType: string, meta?: CoinMetadata) => {
    if (meta?.symbol) return { symbol: meta.symbol, name: meta.name };
    const parts = coinType.split("::");
    const fallbackSymbol = parts[parts.length - 1] || "COIN";
    return { symbol: fallbackSymbol, name: "Unregistered Asset" };
  };

  return (
    <div className="space-y-6 sm:space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-700 pb-20 px-1 sm:px-0">
      {/* Primary Intelligence Section */}
      <section className="sticker-card p-4 sm:p-10 md:p-16 rounded-[1.2rem] sm:rounded-[4rem] relative overflow-hidden bg-white">
        <div className="sm:absolute top-4 sm:top-6 right-4 sm:right-6 bg-[#FFD43B] border-2 sm:border-4 border-[#1a1a1a] px-2 sm:px-6 py-0.5 sm:py-2 rounded-full font-black uppercase text-[8px] sm:text-sm z-10 w-fit mb-4 sm:mb-0">
          {status === "success" ? "✨ Verified" : "❌ Failed"}
        </div>

        <div className="mb-6 sm:mb-12">
          <h2 className="text-2xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter mb-2 sm:mb-6 leading-none">
            TxSense <span className="text-[#2AC2FF]">Report.</span>
          </h2>
          <div className="h-[3px] sm:h-[8px] w-10 sm:w-24 bg-[#9B6DFF] rounded-full mb-6 sm:mb-10"></div>

          <div className="flex flex-wrap gap-1.5 sm:gap-4 mb-6 sm:mb-10">
            {protocol && (
              <div className="bg-[#2AC2FF]/10 px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl border-2 border-[#2AC2FF] font-black uppercase text-[7px] sm:text-sm text-[#2AC2FF]">
                🏦 {protocol}
              </div>
            )}
            {actionType && (
              <div className="bg-[#9B6DFF]/10 px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl border-2 border-[#9B6DFF] font-black uppercase text-[7px] sm:text-sm text-[#9B6DFF]">
                ⚡ {actionType}
              </div>
            )}
            {sender && (
              <a
                href={`https://suivision.xyz/account/${sender}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-100 px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl border-2 border-[#1a1a1a] font-black text-[7px] sm:text-sm hover:bg-slate-200 transition-colors inline-block"
              >
                👤 {shortenAddr(sender)}
              </a>
            )}
          </div>

          <div className="space-y-4 sm:space-y-8">
            <div className="bg-slate-50 p-4 sm:p-10 rounded-xl sm:rounded-[2.5rem] border-2 border-dashed border-slate-200 shadow-inner">
              <div className="mb-6 sm:mb-10">
                <h4 className="text-[9px] sm:text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                  Executive Summary
                </h4>
                <p className="text-sm sm:text-2xl md:text-3xl leading-snug font-black text-slate-800 tracking-tight">
                  {summary}
                </p>
              </div>

              <div className="h-[2px] w-full bg-slate-200 mb-6 sm:mb-10"></div>

              <div className="space-y-6 sm:space-y-10">
                <div>
                  <h4 className="text-[9px] sm:text-xs font-black uppercase tracking-widest text-slate-400 mb-4 sm:mb-6">
                    Forensic Audit Trail
                  </h4>
                  <div className="text-[12px] sm:text-xl md:text-2xl font-bold text-slate-600 leading-relaxed space-y-6">
                    {technicalPlayByPlay ? (
                      technicalPlayByPlay.split("\n").map(
                        (line, i) =>
                          line.trim() && (
                            <p
                              key={i}
                              className="pl-3 sm:pl-6 border-l-4 border-[#2AC2FF]/30 hover:border-[#2AC2FF] transition-colors"
                            >
                              {line}
                            </p>
                          ),
                      )
                    ) : (
                      <p className="italic animate-pulse">
                        Reconstructing ledger events...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 pt-6 sm:pt-10 border-t-2 sm:border-t-4 border-[#1a1a1a]/5">
          <div className="bg-[#2AC2FF]/10 p-3 sm:p-6 rounded-xl sm:rounded-[2rem] border-2 sm:border-4 border-dashed border-[#2AC2FF]">
            <p className="text-[7px] sm:text-xs font-black uppercase tracking-widest text-[#2AC2FF] mb-1">
              Network Fee
            </p>
            <p className="text-sm sm:text-3xl font-black">
              {gasInSui.toFixed(4)} SUI
            </p>
          </div>
          <div className="bg-[#9B6DFF]/10 p-3 sm:p-6 rounded-xl sm:rounded-[2rem] border-2 sm:border-4 border-dashed border-[#9B6DFF]">
            <p className="text-[7px] sm:text-xs font-black uppercase tracking-widest text-[#9B6DFF] mb-1">
              Impacted Assets
            </p>
            <p className="text-sm sm:text-3xl font-black">
              {raw.balanceChanges?.length || 0} Transfers
            </p>
          </div>
          <div className="bg-[#FFD43B]/10 p-3 sm:p-6 rounded-xl sm:rounded-[2rem] border-2 sm:border-4 border-dashed border-[#FFD43B] sm:col-span-2 lg:col-span-1">
            <p className="text-[7px] sm:text-xs font-black uppercase tracking-widest text-slate-500 mb-1">
              State Mutations
            </p>
            <p className="text-sm sm:text-3xl font-black">
              {raw.objectChanges?.length || 0} Changes
            </p>
          </div>
        </div>
      </section>

      {/* Logic Flowchart (Diagram) */}
      {mermaidCode && (
        <section className="sticker-card p-4 sm:p-10 rounded-[1.2rem] sm:rounded-[3.5rem] bg-white overflow-hidden">
          <h3 className="text-base sm:text-3xl font-black uppercase mb-4 sm:mb-10 flex items-center gap-2 sm:gap-4">
            <span className="w-6 h-6 sm:w-12 sm:h-12 bg-[#2AC2FF] rounded-lg sm:rounded-xl flex items-center justify-center text-white text-[10px] sm:text-xl">
              🗺️
            </span>
            Execution Logic Flow
          </h3>
          <div className="p-2 sm:p-12 bg-slate-50 border-2 sm:border-4 border-[#1a1a1a] rounded-xl sm:rounded-[2.5rem] shadow-inner min-h-[180px] flex items-center justify-center overflow-x-auto">
            <MermaidChart chart={mermaidCode} />
          </div>
        </section>
      )}

      {/* Identified Entities Section - Mobile Optimized */}
      {involvedParties && involvedParties.length > 0 && (
        <section className="sticker-card p-4 sm:p-10 rounded-[1.2rem] sm:rounded-[3.5rem] bg-white">
          <div className="flex items-center justify-between mb-4 sm:mb-10">
            <h3 className="text-base sm:text-3xl font-black uppercase flex items-center gap-2 sm:gap-4">
              <span className="w-6 h-6 sm:w-12 sm:h-12 bg-[#9B6DFF] rounded-lg sm:rounded-xl flex items-center justify-center text-white text-[10px] sm:text-xl">
                🤝
              </span>
              Involved Parties{" "}
            </h3>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full border-separate border-spacing-y-2 min-w-[450px] sm:min-w-0">
              <thead className="hidden sm:table-header-group">
                <tr className="text-left text-[9px] sm:text-xs font-black uppercase tracking-widest text-slate-400">
                  <th className="pb-4 pl-6">Role</th>
                  <th className="pb-4">Identification</th>
                  <th className="pb-4">Address</th>
                </tr>
              </thead>
              <tbody>
                {involvedParties.map((party, idx) => (
                  <tr key={idx} className="group">
                    <td className="bg-slate-50 p-2 sm:p-6 rounded-l-xl sm:rounded-l-2xl border-l-2 border-t-2 border-b-2 border-[#1a1a1a] sm:border-none group-hover:bg-slate-100 transition-colors">
                      <span className="bg-[#FFD43B] text-black px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-md font-black uppercase text-[6px] sm:text-[10px] border border-[#1a1a1a] whitespace-nowrap">
                        {party.role}
                      </span>
                    </td>
                    <td className="bg-slate-50 p-2 sm:p-6 border-t-2 border-b-2 border-[#1a1a1a] sm:border-none group-hover:bg-slate-100 transition-colors">
                      <span className="text-[8px] sm:text-base font-black text-[#1a1a1a] block truncate max-w-[80px] sm:max-w-none">
                        {party.label || "External Body"}
                      </span>
                    </td>
                    <td className="bg-slate-50 p-2 sm:p-6 rounded-r-xl sm:rounded-r-2xl border-r-2 border-t-2 border-b-2 border-[#1a1a1a] sm:border-none group-hover:bg-slate-100 transition-colors">
                      <a
                        href={`https://suivision.xyz/account/${party.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[7px] sm:text-sm font-mono font-bold text-slate-400 hover:text-[#2AC2FF] transition-colors break-all"
                      >
                        {party.address}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Asset Movement Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-10">
        <div className="sticker-card p-4 sm:p-8 rounded-[1.2rem] sm:rounded-[3rem] bg-white">
          <h4 className="text-sm sm:text-2xl font-black uppercase mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <span className="text-base sm:text-3xl text-[#9B6DFF]">👛</span>{" "}
            Large Unit Balances
          </h4>
          <div className="space-y-2 sm:space-y-4">
            {raw.balanceChanges && raw.balanceChanges.length > 0 ? (
              raw.balanceChanges
                .map((bc, i) => {
                  const meta = coinMetadata[bc.coinType];
                  const display = getCoinDisplay(bc.coinType, meta);
                  const decimals = meta?.decimals ?? 9;
                  const amount = BigInt(bc.amount);
                  const isNegative = amount < 0n;

                  // ROUNDING: Round to max 2 decimals for perfect large units
                  const scaledValue =
                    Number(amount < 0n ? -amount : amount) /
                    Math.pow(10, decimals);
                  const formatted = scaledValue.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  });

                  if (scaledValue === 0) return null;

                  return (
                    <div
                      key={i}
                      className="p-2 sm:p-5 rounded-lg sm:rounded-2xl bg-slate-50 border-2 border-[#1a1a1a] hover:bg-[#9B6DFF]/5 transition-colors group"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-0.5 sm:gap-2">
                        <div className="min-w-0 flex-1 w-full">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-[9px] sm:text-xl block truncate">
                              {display.symbol}
                            </span>
                          </div>
                          <span className="text-[5px] sm:text-[10px] uppercase font-black opacity-30 truncate block w-full group-hover:opacity-100 transition-opacity">
                            {bc.coinType}
                          </span>
                        </div>
                        <div className="sm:text-right w-full sm:w-auto mt-1 sm:mt-0">
                          <span
                            className={`text-[12px] sm:text-2xl font-black ${isNegative ? "text-[#9B6DFF]" : "text-[#2AC2FF]"}`}
                          >
                            {isNegative ? "-" : "+"}
                            {formatted}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
                .filter(Boolean)
            ) : (
              <p className="text-slate-400 font-bold p-2 italic text-[9px] sm:text-base">
                No significant balance changes.
              </p>
            )}
          </div>
        </div>

        <div className="sticker-card p-4 sm:p-8 rounded-[1.2rem] sm:rounded-[3rem] bg-white">
          <h4 className="text-sm sm:text-2xl font-black uppercase mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <span className="text-base sm:text-3xl text-[#FFD43B]">🏗️</span>{" "}
            State Variations
          </h4>
          <div className="space-y-2 sm:space-y-4 max-h-[300px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
            {raw.objectChanges && raw.objectChanges.length > 0 ? (
              raw.objectChanges.map((oc, i) => (
                <div
                  key={i}
                  className="p-2 sm:p-5 rounded-lg sm:rounded-2xl bg-slate-50 border-2 border-[#1a1a1a] text-[7px] sm:text-xs"
                >
                  <div className="flex gap-2 mb-1.5">
                    <span
                      className={`px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full font-black uppercase text-[5px] sm:text-[9px] text-white border border-[#1a1a1a]/10 ${
                        oc.type === "mutated"
                          ? "bg-[#FFD43B] text-black"
                          : oc.type === "created"
                            ? "bg-[#2AC2FF]"
                            : oc.type === "deleted"
                              ? "bg-red-500"
                              : "bg-slate-400"
                      }`}
                    >
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
                  <p className="text-[5px] sm:text-[9px] font-black uppercase opacity-30 mt-0.5 truncate">
                    Type: {oc.objectType.split("::").pop()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-400 font-bold p-2 italic text-[9px] sm:text-base">
                No state variations identified.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col items-center gap-3 sm:gap-6 py-6 sm:py-10">
        <a
          href={`${EXPLORER_URL}${raw.digest}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 font-bold uppercase tracking-widest hover:text-[#9B6DFF] transition-colors text-[8px] sm:text-sm text-center"
        >
          Access On-Chain Ledger Record ↗
        </a>
        <button
          onClick={onReset}
          className="btn-chunky bg-[#2AC2FF] text-white px-6 sm:px-16 py-3 sm:py-6 rounded-xl sm:rounded-[3rem] text-xs sm:text-3xl font-black hover:bg-[#1fb8ff] w-full sm:w-auto"
        >
          AUDIT NEW TRANSACTION 🍬
        </button>
      </div>
    </div>
  );
};

export default TransactionResult;
