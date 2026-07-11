import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="glass-panel p-5 border border-slate-800/60 flex items-start gap-4">
      {/* Icon shimmer circle */}
      <div className="w-12 h-12 rounded-xl skeleton-shimmer shrink-0" />

      {/* Text shimmers */}
      <div className="flex-1 space-y-3">
        <div className="flex items-center justify-between">
          {/* Category Tag shimmer */}
          <div className="w-16 h-4 rounded skeleton-shimmer" />
          {/* Saving badge shimmer */}
          <div className="w-20 h-5 rounded-full skeleton-shimmer" />
        </div>
        
        {/* Title line shimmer */}
        <div className="w-3/4 h-5 rounded-md skeleton-shimmer" />
        
        {/* Description block shimmer */}
        <div className="space-y-1.5 pt-1">
          <div className="w-full h-3 rounded skeleton-shimmer" />
          <div className="w-5/6 h-3 rounded skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
