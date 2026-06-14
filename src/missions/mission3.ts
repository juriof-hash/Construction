import { GeometryObject, ValidationResult } from '../types/mission';
import { ANGLE_EPSILON, DISTANCE_EPSILON, pointToLineDistance, toInfiniteLine, dot, midpoint, normalize } from '../utils/challengeGeometry';

export const validateMission3 = (
  objects: GeometryObject[],
  refs: Readonly<Record<string, GeometryObject>>
): ValidationResult => {
  const candidates = objects.filter(o => o.source === 'user' && (o.type === 'segment' || o.type === 'line'));
  
  if (candidates.length === 0) {
    return { isSuccess: false, feedbackCode: 'NO_CANDIDATE_FOUND', message: '선분을 그려주세요.' };
  }

  const refAB = refs['AB'];
  const pA = refAB.points[0];
  const pB = refAB.points[1];
  const midM = midpoint(pA, pB);
  
  const lineAB = toInfiniteLine(refAB);

  let bestFeedbackCode = 'WRONG_OBJECT_TYPE';
  let bestMessage = '선분을 그려야 합니다.';

  for (const cand of candidates) {
    const candInfinite = toInfiniteLine(cand);
    
    // 검증 1: 중점을 지나는가
    const distToMid = pointToLineDistance(midM, candInfinite);
    if (distToMid > DISTANCE_EPSILON) {
      bestFeedbackCode = 'NOT_THROUGH_MIDPOINT';
      bestMessage = '선분의 중앙을 지나지 않습니다.';
      continue;
    }

    // 검증 2: 직교하는가 (내적이 0)
    const dotProduct = Math.abs(dot(lineAB.direction, candInfinite.direction));
    if (dotProduct > ANGLE_EPSILON) {
      bestFeedbackCode = 'NOT_PERPENDICULAR';
      bestMessage = '선분의 중앙을 지났지만, 직교(90도)하지 않습니다.';
      continue;
    }

    return { isSuccess: true, feedbackCode: 'SUCCESS', message: '정답입니다!' };
  }

  return { isSuccess: false, feedbackCode: bestFeedbackCode as any, message: bestMessage };
};
