export const SuggestedQuestions = ({ onSelect }) => {
  const questions = [
    "What crops are recommended for my village soil?",
    "Show 7-day weather forecast & rainfall warning",
    "What is the optimal sowing window for Soybean?",
    "Which government schemes apply for irrigation?"
  ];
  return <div className="flex flex-wrap gap-2 mt-4">
      {questions.map((q, idx) => <button
    key={idx}
    onClick={() => onSelect(q)}
    className="bg-surface-elevated border border-surface-border text-text-secondary text-[11px] font-mono uppercase px-3 py-1.5 rounded-full hover:border-brand-mint hover:text-brand-mint transition-colors text-left"
  >
          {q}
        </button>)}
    </div>;
};
