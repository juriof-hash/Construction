import { GeometryObject, ValidationResult } from '../types/mission';
import { ANGLE_EPSILON, DISTANCE_EPSILON, isPointOnLine, toInfiniteLine, dot, distance } from '../utils/challengeGeometry';

export const validateMission5 = (
  objects: GeometryObject[],
  refs: Readonly<Record<string, GeometryObject>>
): ValidationResult => {
  const candidates = objects.filter(o => o.source === 'user' && (o.type === 'segment' || o.type === 'line'));
  
  if (candidates.length === 0) {
    return { isSuccess: false, feedbackCode: 'NO_CANDIDATE_FOUND', message: '선분을 그려주세요.' };
  }

  const refLine = refs['L'];
  const refP = refs['P'];
  const ptP = refP.points[0];

  const targetLine = toInfiniteLine(refLine);

  let bestFeedbackCode = 'WRONG_OBJECT_TYPE';
  let bestMessage = '선분을 그려야 합니다.';

  for (const cand of candidates) {
    const candInfinite = toInfiniteLine(cand);
    
    // 검증 1: 점 P를 지나는가
    const passesP = 
      distance(cand.points[0], ptP) <= DISTANCE_EPSILON ||
      distance(cand.points[1], ptP) <= DISTANCE_EPSILON ||
      isPointOnLine(ptP, candInfinite);

    if (!passesP) {
      bestFeedbackCode = 'NOT_THROUGH_POINT';
      bestMessage = '점 P를 지나는 선을 그려주세요.';
      continue;
    }

    // 검증 2: 직교하는가 (내적이 0)
    const dotProduct = Math.abs(dot(targetLine.direction, candInfinite.direction));
    if (dotProduct > ANGLE_EPSILON) {
      bestFeedbackCode = 'NOT_PERPENDICULAR';
      bestMessage = '직선에 수직(90도)이지 않습니다.';
      continue;
    }

    return { isSuccess: true, feedbackCode: 'SUCCESS', message: '정답입니다!' };
  }

  return { isSuccess: false, feedbackCode: bestFeedbackCode as any, message: bestMessage };
};
