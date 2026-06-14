import { GeometryObject, ValidationResult } from '../types/mission';
import { DISTANCE_EPSILON, distance } from '../utils/challengeGeometry';

export const validateMission1 = (
  objects: GeometryObject[],
  refs: Readonly<Record<string, GeometryObject>>
): ValidationResult => {
  const candidates = objects.filter(o => o.source === 'user' && o.type === 'segment');
  
  if (candidates.length === 0) {
    return { isSuccess: false, feedbackCode: 'NO_CANDIDATE_FOUND', message: '선분을 그려주세요.' };
  }

  const refC = refs['C'];
  const refAB = refs['AB']; 
  
  if (!refC || !refAB) {
     return { isSuccess: false, feedbackCode: 'NO_CANDIDATE_FOUND', message: '오류: 기준 도형을 찾을 수 없습니다.' };
  }

  const targetLength = distance(refAB.points[0], refAB.points[1]);
  const anchorPt = refC.points[0];

  let bestScore = -1;
  let bestFeedbackCode = 'WRONG_OBJECT_TYPE';
  let bestMessage = '선분을 그려야 합니다.';

  const updateFeedback = (score: number, code: string, message: string) => {
    if (score > bestScore) {
      bestScore = score;
      bestFeedbackCode = code;
      bestMessage = message;
    }
  };

  for (const cand of candidates) {
    const hasCorrectAnchor = 
      distance(cand.points[0], anchorPt) <= DISTANCE_EPSILON ||
      distance(cand.points[1], anchorPt) <= DISTANCE_EPSILON;

    if (!hasCorrectAnchor) {
      updateFeedback(0, 'WRONG_ANCHOR_POINT', '점 C에서 시작하는 선분을 그려주세요.');
      continue;
    }

    const candLength = distance(cand.points[0], cand.points[1]);
    if (Math.abs(candLength - targetLength) > DISTANCE_EPSILON) {
      updateFeedback(1, 'LENGTH_MISMATCH', '선분 AB와 길이가 같지 않습니다.');
      continue;
    }

    return { isSuccess: true, feedbackCode: 'SUCCESS', message: '정답입니다!' };
  }

  return { isSuccess: false, feedbackCode: bestFeedbackCode as any, message: bestMessage };
};
