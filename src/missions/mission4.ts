import { GeometryObject, ValidationResult } from '../types/mission';
import { ANGLE_EPSILON, DISTANCE_EPSILON, isPointOnLine, toInfiniteLine, angleBetweenVectors, distance } from '../utils/challengeGeometry';

export const validateMission4 = (
  objects: GeometryObject[],
  refs: Readonly<Record<string, GeometryObject>>
): ValidationResult => {
  const candidates = objects.filter(o => o.source === 'user' && (o.type === 'segment' || o.type === 'line'));
  
  if (candidates.length === 0) {
    return { isSuccess: false, feedbackCode: 'NO_CANDIDATE_FOUND', message: '선분을 그려주세요.' };
  }

  const refBA = refs['BA'];
  const refBC = refs['BC'];
  const ptB = refs['B'].points[0];

  const lineBA = toInfiniteLine(refBA);
  const lineBC = toInfiniteLine(refBC);
  
  // 기준 각도 ABC
  const fullAngle = angleBetweenVectors(lineBA.direction, lineBC.direction);
  const halfAngle = fullAngle / 2;

  let bestFeedbackCode = 'WRONG_OBJECT_TYPE';
  let bestMessage = '선분을 그려야 합니다.';

  for (const cand of candidates) {
    const candInfinite = toInfiniteLine(cand);
    
    // 검증 1: 꼭짓점 B를 지나는가
    const passesB = 
      distance(cand.points[0], ptB) <= DISTANCE_EPSILON ||
      distance(cand.points[1], ptB) <= DISTANCE_EPSILON ||
      isPointOnLine(ptB, candInfinite);

    if (!passesB) {
      bestFeedbackCode = 'WRONG_ANCHOR_POINT';
      bestMessage = '각의 꼭짓점을 지나는 선을 그려주세요.';
      continue;
    }

    // 검증 2: 각의 이등분 조건
    // 직선 기준이므로 asUndirectedLine 모드를 쓰거나 양방향 비교
    const angleWithBA1 = angleBetweenVectors(lineBA.direction, candInfinite.direction);
    const angleWithBA2 = angleBetweenVectors(lineBA.direction, { x: -candInfinite.direction.x, y: -candInfinite.direction.y });
    
    const angleWithBC1 = angleBetweenVectors(lineBC.direction, candInfinite.direction);
    const angleWithBC2 = angleBetweenVectors(lineBC.direction, { x: -candInfinite.direction.x, y: -candInfinite.direction.y });

    // Find the smallest angle matching for BA
    const angleBA = Math.min(angleWithBA1, angleWithBA2);
    // Find the smallest angle matching for BC
    const angleBC = Math.min(angleWithBC1, angleWithBC2);

    if (Math.abs(angleBA - angleBC) <= ANGLE_EPSILON) {
      // 내각/외각 구분: 내각의 이등분선은 BA와의 사잇각이 원래 각의 절반과 같아야 함
      if (Math.abs(angleBA - halfAngle) <= ANGLE_EPSILON) {
        return { isSuccess: true, feedbackCode: 'SUCCESS', message: '정답입니다!' };
      } else {
        bestFeedbackCode = 'ANGLE_MISMATCH';
        bestMessage = '각을 이등분하긴 했지만, 보각(외각)의 이등분선입니다.';
        continue;
      }
    } else {
      bestFeedbackCode = 'ANGLE_MISMATCH';
      bestMessage = '두 선분 사이의 각을 정확히 이등분하지 않았습니다.';
    }
  }

  return { isSuccess: false, feedbackCode: bestFeedbackCode as any, message: bestMessage };
};
