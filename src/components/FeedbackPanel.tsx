import React from 'react';
import { ValidationResult } from '../types/mission';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface FeedbackPanelProps {
  result: ValidationResult | null;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ result }) => {
  if (!result) return null;

  const isSuccess = result.isSuccess;
  const isError = result.feedbackCode === 'NO_CANDIDATE_FOUND' || result.feedbackCode === 'WRONG_OBJECT_TYPE';
  
  const bgColor = isSuccess ? 'bg-green-50 border-green-200' : (isError ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200');
  const textColor = isSuccess ? 'text-green-800' : (isError ? 'text-red-800' : 'text-orange-800');
  const Icon = isSuccess ? CheckCircle2 : (isError ? XCircle : AlertCircle);
  const iconColor = isSuccess ? 'text-green-500' : (isError ? 'text-red-500' : 'text-orange-500');

  return (
    <div className={`mt-4 p-4 rounded-xl border flex items-start gap-3 ${bgColor} ${textColor} animate-in fade-in slide-in-from-top-2`}>
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
      <div>
        <p className="font-semibold text-sm">
          {isSuccess ? '정답입니다!' : '다시 확인해 보세요.'}
        </p>
        <p className="text-sm mt-1 opacity-90">{result.message}</p>
      </div>
    </div>
  );
};
