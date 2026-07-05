import {
  PlayerStats,
  ScoreResult,
  ChallengeValidationResult,
} from "../types/challenge";
import { GeometryObject } from "../types/mission";
import {
  isSamePoint,
  getSegmentLength,
  distancePointToInfiniteLine,
  hasEndpoint,
  EPSILON,
  GeoGraph,
} from "../utils/geoGraphValidation";

// ------------------------------------------
// 점수 및 칭호 계산 헬퍼
// ------------------------------------------
export function calculateScore(
  stats: PlayerStats,
  optimalCompassCount: number,
  targetTimeSec: number,
): ScoreResult {
  let stars: 1 | 2 | 3 = 1;
  const titles: string[] = [];

  const metCompass = stats.compassCount <= optimalCompassCount;
  const metTime = stats.elapsedTimeSec <= targetTimeSec;

  if (metCompass) stars = 2;
  if (metCompass && metTime) stars = 3;

  if (metCompass) titles.push("유클리드의 재림 (E-Metric Master)");
  if (metTime) titles.push("빛보다 빠른 손");

  // 중복이 있거나 한 개만 있어도 그대로 반환
  return {
    stars,
    titles,
  };
}

// ------------------------------------------
// Mission 1-1: 길이가 같은 선분의 작도
// ------------------------------------------
// 기초 데이터: 기준 선분 AB (L), 시작점 C
export const validateMission1_1 = (
  objects: GeometryObject[],
  refs: Record<string, GeometryObject>,
  stats: PlayerStats,
): ChallengeValidationResult => {
  const S_AB = refs["AB"];
  const P_C = refs["C"];

  if (!S_AB || !P_C)
    return { isSuccess: false, message: "System error: Missing ref" };

  const L = getSegmentLength(S_AB);
  const userSegments = objects.filter(
    (o) => o.source === "user" && o.type === "segment",
  );

  let success = false;
  for (const seg of userSegments) {
    // 1. One endpoint must be exactly at C
    if (hasEndpoint(seg, P_C.points[0])) {
      // 2. Length must match L
      const len = getSegmentLength(seg);
      if (Math.abs(len - L) <= EPSILON) {
        success = true;
        break;
      }
    }
  }

  if (!success) {
    return {
      isSuccess: false,
      message:
        "선분 도구를 사용하여 점 C에서 시작해 선분 AB와 길이가 같은 선분을 그리세요. 교점이 생성되었더라도 직접 '선분'으로 이어야 합니다.",
    };
  }

  return {
    isSuccess: true,
    message: "정답입니다! 선분의 길이를 정확히 옮겼습니다.",
    score: calculateScore(stats, 1, 20),
  };
};

// ------------------------------------------
// Mission 1-2: 길이가 2배인 선분을 작도
// ------------------------------------------
// 기초 데이터: 기준 선분 AB (L)
export const validateMission1_2 = (
  objects: GeometryObject[],
  refs: Record<string, GeometryObject>,
  stats: PlayerStats,
): ChallengeValidationResult => {
  const S_AB = refs["AB"];
  if (!S_AB || S_AB.points.length !== 2)
    return { isSuccess: false, message: "System error: Missing ref" };

  const ptA = S_AB.points[0];
  const ptB = S_AB.points[1];
  const L = getSegmentLength(S_AB);
  const targetL = 2 * L;

  const userSegments = objects.filter(
    (o) => o.source === "user" && o.type === "segment",
  );
  let success = false;

  for (const seg of userSegments) {
    const len = getSegmentLength(seg);
    if (Math.abs(len - targetL) > EPSILON) continue;

    // 선분 S가 직선 AB 위에 존재하는지 검증
    // S의 두 끝점 모두 직선 AB까지의 거리가 EPSILON 이하여야 함
    const p1 = seg.points[0];
    const p2 = seg.points[1];

    if (distancePointToInfiniteLine(p1, ptA, ptB) > EPSILON) continue;
    if (distancePointToInfiniteLine(p2, ptA, ptB) > EPSILON) continue;

    // S의 한 쪽 끝점이 원래 점 A 또는 B와 일치해야 함
    if (hasEndpoint(seg, ptA) || hasEndpoint(seg, ptB)) {
      success = true;
      break;
    }
  }

  if (!success) {
    return {
      isSuccess: false,
      message:
        "선분 AB를 연장한 직선 위에서, 점 A나 점 B를 끝점으로 하면서 길이가 원본의 2배인 선분을 직접 그려야 합니다.",
    };
  }

  return {
    isSuccess: true,
    message: "정답입니다! 길이가 정확히 2배인 선분을 완성했습니다.",
    score: calculateScore(stats, 2, 30),
  };
};

// ------------------------------------------
// Mission 1-3: 정삼각형의 작도
// ------------------------------------------
// 기초 데이터: 기준 선분 AB (L)
export const validateMission1_3 = (
  objects: GeometryObject[],
  refs: Record<string, GeometryObject>,
  stats: PlayerStats,
): ChallengeValidationResult => {
  const S_AB = refs["AB"];
  if (!S_AB) return { isSuccess: false, message: "System error: Missing ref" };

  const L = getSegmentLength(S_AB);
  const segmentsLengthL = objects.filter(
    (o) => o.type === "segment" && Math.abs(getSegmentLength(o) - L) <= EPSILON,
  );

  // 그래프 생성
  const graph = new GeoGraph();
  for (const seg of segmentsLengthL) {
    graph.addSegment(seg);
  }

  // 수학적 단순성: 길이가 L인 선분들로 이루어진 3개의 노드를 가진 사이클이 있는지 검증 (각도 배제)
  const triangles = graph.findCyclesOfSize(3);

  if (triangles.length === 0) {
    return {
      isSuccess: false,
      message:
        "정삼각형이 검출되지 않았습니다. 교점을 찾았다면 선분 도구를 이용해 점들을 모두 이어 수학적인 '닫힌 선분 루프'를 만들어야 합니다.",
    };
  }

  return {
    isSuccess: true,
    message: "정답입니다! 완벽한 정삼각형을 작도하셨습니다.",
    score: calculateScore(stats, 2, 35),
  };
};

// ------------------------------------------
