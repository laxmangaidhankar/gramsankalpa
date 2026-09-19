import React from 'react';

export const GEEProgress = ({ message, cached }) => {
  const borderAnimation = cached ? '' : 'animate-[pulse-border_1.5s_ease-in-out_infinite]';
  const displayMessage = cached ? 'Loading from cache…' : message;

  return (
    <div className={`bg-surface-slate border border-brand-console rounded-xl p-4 px-5 border-l-4 border-l-brand-mint ${borderAnimation}`}>
      <span className="text-body text-text-primary">{displayMessage}</span>
    </div>
  );
};
