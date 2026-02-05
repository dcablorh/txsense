import React from 'react';

const SkeletonLoader: React.FC = () => {
  return (
    <div className="space-y-6 sm:space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-700 pb-20">
      {/* Header Skeleton */}
      <section className="sticker-card p-4 sm:p-10 md:p-16 rounded-[1.2rem] sm:rounded-[4rem] bg-white">
        <div className="mb-6 sm:mb-12">
          {/* Status Badge Skeleton */}
          <div className="mb-6 sm:mb-10 animate-pulse">
            <div className="h-6 sm:h-10 w-32 sm:w-40 bg-slate-200 rounded-full"></div>
          </div>

          {/* Title Skeleton */}
          <div className="mb-6 sm:mb-12 animate-pulse">
            <div className="h-12 sm:h-20 w-64 sm:w-96 bg-slate-200 rounded-lg mb-4"></div>
            <div className="h-2 sm:h-3 w-24 bg-slate-200 rounded-full"></div>
          </div>

          {/* Tags Skeleton */}
          <div className="flex flex-wrap gap-2 sm:gap-4 mb-6 sm:mb-10 animate-pulse">
            <div className="h-8 sm:h-12 w-24 sm:w-32 bg-slate-200 rounded-lg"></div>
            <div className="h-8 sm:h-12 w-28 sm:w-40 bg-slate-200 rounded-lg"></div>
            <div className="h-8 sm:h-12 w-32 sm:w-44 bg-slate-200 rounded-lg"></div>
          </div>

          {/* Summary Skeleton */}
          <div className="bg-slate-50 p-4 sm:p-10 rounded-xl sm:rounded-[2.5rem] border-2 border-dashed border-slate-200 animate-pulse">
            <div className="mb-4 sm:mb-6">
              <div className="h-4 w-32 bg-slate-200 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-slate-200 rounded"></div>
                <div className="h-4 w-5/6 bg-slate-200 rounded"></div>
                <div className="h-4 w-4/5 bg-slate-200 rounded"></div>
              </div>
            </div>

            <div className="h-px bg-slate-200 my-6 sm:my-10"></div>

            {/* Details Skeleton */}
            <div className="space-y-6 sm:space-y-10">
              <div>
                <div className="h-3 w-40 bg-slate-200 rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 w-full bg-slate-100 rounded"></div>
                  <div className="h-4 w-5/6 bg-slate-100 rounded"></div>
                  <div className="h-4 w-4/5 bg-slate-100 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chart Skeleton */}
      <section className="sticker-card p-4 sm:p-10 md:p-16 rounded-[1.2rem] sm:rounded-[4rem] bg-white animate-pulse">
        <div className="h-64 sm:h-96 bg-slate-100 rounded-lg"></div>
      </section>
    </div>
  );
};

export default SkeletonLoader;
