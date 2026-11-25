import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Sparkles,
  TrendingUp,
  BookMarked,
  ArrowRight,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import moment from 'moment';

const FlashcardSetCard = ({ flashcardSet }) => {
  const navigate = useNavigate();

  const documentId = flashcardSet?.documentId?._id || flashcardSet?.documentId;
  const title =
    flashcardSet?.documentId?.title ||
    flashcardSet?.document?.title ||
    flashcardSet?.title ||
    'Untitled Flashcard Set';

  const cards = flashcardSet?.cards || [];
  const totalCards = cards.length;
  const reviewedCount = cards.filter((card) => card.lastReviewed).length;
  const progressPercentage =
    totalCards > 0 ? Math.round((reviewedCount / totalCards) * 100) : 0;

  const isCompleted = totalCards > 0 && progressPercentage === 100;
  const isStarted = reviewedCount > 0 && !isCompleted;

  const handleStudyNow = () => {
    if (documentId) {
      navigate(`/documents/${documentId}/flashcards`);
    }
  };

  return (
    <article
      onClick={handleStudyNow}
      className="group relative flex h-full min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md cursor-pointer"
    >
      {/* Top Accent Bar */}
      <div
        className={`absolute inset-x-0 top-0 h-1.5 ${
          isCompleted
            ? 'bg-gradient-to-r from-amber-400 via-emerald-500 to-teal-500'
            : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500'
        }`}
      />

      <div className="min-w-0">
        {/* Top Row: Category + Status Pill */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            <BookMarked className="h-3.5 w-3.5 shrink-0" />
            <span>Flashcards</span>
          </span>

          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
              isCompleted
                ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                : isStarted
                ? 'bg-cyan-50 text-cyan-700 ring-cyan-200'
                : 'bg-slate-100 text-slate-600 ring-slate-200'
            }`}
          >
            {isCompleted && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
            {isCompleted ? 'Mastered' : isStarted ? 'In Progress' : 'New'}
          </span>
        </div>

        {/* Title + Icon */}
        <div className="mt-3.5 flex items-start gap-3 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/70">
            <BookOpen className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h3
              className="text-base font-bold leading-snug text-slate-900 line-clamp-2 group-hover:text-emerald-700 transition-colors"
              title={title}
            >
              {title}
            </h3>
            <p className="mt-1 text-xs text-slate-500 whitespace-nowrap">
              Created{' '}
              {flashcardSet?.createdAt
                ? moment(flashcardSet.createdAt).fromNow()
                : 'recently'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Cards</span>
              <Layers className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {totalCards}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Mastery</span>
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {progressPercentage}%
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-500">Study progress</span>
            <span className="font-semibold text-slate-700 whitespace-nowrap">
              {reviewedCount}/{totalCards} reviewed
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
              role="progressbar"
              aria-valuenow={progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Flashcard review progress"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500 line-clamp-2">
          {isCompleted
            ? 'All cards reviewed. Ready for a refresher?'
            : isStarted
            ? 'Pick up where you left off.'
            : 'Start your first review session.'}
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleStudyNow();
          }}
          className={`inline-flex w-full sm:w-auto shrink-0 items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-white transition ${
            isCompleted
              ? 'bg-slate-900 hover:bg-slate-800'
              : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>{isCompleted ? 'Review Again' : 'Study Now'}</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </article>
  );
};

export default FlashcardSetCard;