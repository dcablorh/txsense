
import React from 'react';
import { PackageExplanationResult } from '../types';

interface PackageResultProps {
  result: PackageExplanationResult;
  onReset: () => void;
}

const PackageResult: React.FC<PackageResultProps> = ({ result, onReset }) => {
  const [copied, setCopied] = React.useState(false);

  const copyReportLink = () => {
    const baseUrl = window.location.origin;
    const reportLink = `${baseUrl}?package=${encodeURIComponent(result.packageId)}`;
    navigator.clipboard.writeText(reportLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
      <section className="sticker-card p-8 sm:p-12 md:p-16 rounded-[2.5rem] sm:rounded-[4rem] bg-white">
        <header className="mb-8 sm:mb-12">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#FFD43B] border-4 border-[#1a1a1a] rounded-2xl sm:rounded-[2rem] flex items-center justify-center text-3xl sm:text-4xl mb-6 sm:mb-8 -rotate-6">🏛️</div>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-4">
            Move <br/><span className="text-[#9B6DFF]">Package</span> Analysis.
          </h2>
          <p className="font-mono font-black text-slate-400 text-[10px] sm:text-xs break-all">ID: {result.packageId}</p>
        </header>

        <div className="prose prose-xl sm:prose-2xl max-w-none mb-10 sm:mb-16">
          <p className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight text-slate-800">
            {result.summary}
          </p>
        </div>

        <div>
          <h3 className="text-[10px] sm:text-sm font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] mb-6 sm:mb-8 text-slate-400">Core Capabilities</h3>
          <div className="flex flex-wrap gap-3 sm:gap-4">
            {result.capabilities.map((cap, i) => (
              <div key={i} className="btn-chunky bg-[#2AC2FF] text-white px-5 sm:px-8 py-3 sm:py-4 rounded-2xl sm:rounded-3xl font-black text-sm sm:text-lg rotate-[1deg] even:-rotate-[2deg] hover:rotate-0 transition-transform cursor-default">
                ⚡ {cap}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sticker-card p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] bg-white">
         <h3 className="text-2xl sm:text-3xl font-black uppercase mb-8 sm:mb-10 flex items-center gap-3 sm:gap-4">
            <span className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FFD43B] rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl">🧩</span>
            Inside the box
         </h3>
         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {result.modules.map((mod, i) => (
              <div key={i} className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border-2 border-[#1a1a1a] text-center font-black uppercase text-[10px] sm:text-sm hover:bg-[#2AC2FF] hover:text-white transition-all truncate">
                {mod}
              </div>
            ))}
         </div>
      </section>

      <div className="flex justify-center gap-4 py-8 sm:py-10 flex-col sm:flex-row">
         <button 
           onClick={copyReportLink}
           className={`btn-chunky text-white px-8 sm:px-16 py-4 sm:py-6 rounded-[2rem] sm:rounded-[3rem] text-lg sm:text-3xl font-black hover:opacity-90 transition-all ${
             copied
               ? "bg-[#9B6DFF] hover:bg-[#834dff]"
               : "bg-[#FFD43B] text-[#1a1a1a] hover:bg-[#ffd43b]/90"
           }`}
         >
           {copied ? "✨ COPIED!" : "📋 COPY REPORT"}
         </button>
         <button 
           onClick={onReset}
           className="btn-chunky bg-[#9B6DFF] text-white px-8 sm:px-16 py-4 sm:py-6 rounded-[2rem] sm:rounded-[3rem] text-lg sm:text-3xl font-black hover:bg-[#834dff]"
         >
           DO IT AGAIN! 🧊
         </button>
      </div>
    </div>
  );
};

export default PackageResult;
