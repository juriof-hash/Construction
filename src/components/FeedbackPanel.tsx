import React from "react";
import { ChallengeValidationResult } from "../types/challenge";
import { CheckCircle2, XCircle, Star, Trophy } from "lucide-react";

interface FeedbackPanelProps {
  result: ChallengeValidationResult | null;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ result }) => {
  if (!result) return null;

  const isSuccess = result.isSuccess;

  const bgColor = isSuccess
    ? "bg-green-50 border-green-200"
    : "bg-red-50 border-red-200";
  const textColor = isSuccess ? "text-green-800" : "text-red-800";
  const Icon = isSuccess ? CheckCircle2 : XCircle;
  const iconColor = isSuccess ? "text-green-500" : "text-red-500";

  return (
    <div
      className={`mt-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2`}
    >
      <div
        className={`p-4 rounded-xl border flex items-start gap-3 ${bgColor} ${textColor}`}
      >
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
        <div>
          <p className="font-semibold text-sm">
            {isSuccess ? "정답입니다!" : "다시 확인해 보세요."}
          </p>
          <p className="text-sm mt-1 opacity-90">{result.message}</p>
        </div>
      </div>

      {isSuccess && result.score && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col gap-2">
          <div className="flex items-center gap-1 mb-1">
            {[1, 2, 3].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 ${star <= (result.score?.stars || 1) ? "fill-amber-400 text-amber-400" : "fill-transparent text-amber-200"}`}
              />
            ))}
          </div>
          {result.score.titles.map((title, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-amber-800 text-sm font-bold bg-amber-100 px-3 py-1.5 rounded-full w-fit"
            >
              <Trophy className="w-4 h-4" /> {title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
