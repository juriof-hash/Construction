import { GeometryObject } from "../types/mission";
import { EPSILON, distance, GeoGraph } from "./geoGraphValidation";
import { PlayerStats, ChallengeValidationResult } from "../types/challenge";
import { calculateScore } from "../data/stage1Validators";

function getOriginTriangleSides(refs: Record<string, GeometryObject>) {
  const pA = refs["A"]?.points[0];
  const pB = refs["B"]?.points[0];
  const pC = refs["C"]?.points[0];
  if (!pA || !pB || !pC) return null;
  const sides = [distance(pA, pB), distance(pB, pC), distance(pC, pA)].sort(
    (a, b) => a - b,
  );
  return sides;
}

function validateTriangleCongruence(
  objects: GeometryObject[],
  originSides: number[],
  targetPointP: { x: number; y: number },
  maxAllowedRadiiFromSides: number = 3
): { isSuccess: boolean; isCongruent: boolean; message?: string } {
  const graph = new GeoGraph();
  const segments = objects.filter((o) => o.type === "segment");
  for (const seg of segments) {
    graph.addSegment(seg);
  }

  // 1.5% 상대 오차율 적용
  const maxSide = originSides[2];
  const relEpsilon = Math.max(EPSILON, maxSide * 0.015);

  const triangles = graph.findCyclesOfSize(3);
  let foundCongruent = false;

  for (const tri of triangles) {
    const p1 = tri[0].pt;
    const p2 = tri[1].pt;
    const p3 = tri[2].pt;

    const userSides = [
      distance(p1, p2),
      distance(p2, p3),
      distance(p3, p1),
    ].sort((a, b) => a - b);

    const isCongruent =
      Math.abs(userSides[0] - originSides[0]) <= relEpsilon * 2 &&
      Math.abs(userSides[1] - originSides[1]) <= relEpsilon * 2 &&
      Math.abs(userSides[2] - originSides[2]) <= relEpsilon * 2;

    if (isCongruent) {
      if (
        distance(p1, targetPointP) <= relEpsilon ||
        distance(p2, targetPointP) <= relEpsilon ||
        distance(p3, targetPointP) <= relEpsilon
      ) {
        foundCongruent = true;
        break;
      }
    }
  }

  if (!foundCongruent) {
    return { isSuccess: false, isCongruent: false };
  }

  // 합동인 삼각형을 찾았을 경우, 치팅(의도되지 않은 방식) 검사
  // 현재 존재하는 원/호 객체들 중에서 원본 삼각형의 변의 길이를 반지름으로 쓴 횟수 검사
  // (실수 방지 목적이며, 완전히 지웠다면 봐준다)
  const userCircles = objects.filter(o => o.type === "circle" || o.type === "arc");
  let usedSideRadiiCount = 0;
  
  for (const side of originSides) {
    const isUsed = userCircles.some(
      c => c.radius !== undefined && Math.abs(c.radius - side) <= relEpsilon
    );
    if (isUsed) usedSideRadiiCount++;
  }

  if (usedSideRadiiCount > maxAllowedRadiiFromSides) {
    return { 
      isSuccess: false, 
      isCongruent: true, 
      message: "작도된 삼각형은 합동이지만, 주어진 조건 외의 변의 길이를 컴퍼스로 측정한 기록이 있습니다. 해당 미션이 요구하는 합동 작도법을 사용하세요."
    };
  }

  return { isSuccess: true, isCongruent: true };
}

export const validateMission3_1 = (
  objects: GeometryObject[],
  refs: Record<string, GeometryObject>,
  stats: PlayerStats,
): ChallengeValidationResult => {
  const originSides = getOriginTriangleSides(refs);
  const targetPointP = refs["P"]?.points[0];
  if (!originSides || !targetPointP)
    return { isSuccess: false, message: "System error: Missing ref" };

  const result = validateTriangleCongruence(objects, originSides, targetPointP, 3);

  if (result.isSuccess) {
    return {
      isSuccess: true,
      message:
        "정답입니다! 세 변의 길이가 같은(SSS 합동) 완벽한 삼각형을 작도하셨습니다.",
      score: calculateScore(stats, 4, 60),
    };
  }

  if (result.isCongruent && result.message) {
    return { isSuccess: false, message: result.message };
  }

  return {
    isSuccess: false,
    message:
      "시작점 P를 이용하여 원본 삼각형 ABC와 완벽히 합동인 닫힌 삼각형을 완성해야 합니다.",
  };
};

export const validateMission3_2 = (
  objects: GeometryObject[],
  refs: Record<string, GeometryObject>,
  stats: PlayerStats,
): ChallengeValidationResult => {
  const originSides = getOriginTriangleSides(refs);
  const targetPointP = refs["O"]?.points[0];
  if (!originSides || !targetPointP)
    return { isSuccess: false, message: "System error: Missing ref" };

  const result = validateTriangleCongruence(objects, originSides, targetPointP, 2);

  if (result.isSuccess) {
    return {
      isSuccess: true,
      message:
        "정답입니다! 두 변의 길이와 그 끼인각을 정확히 복사하여(SAS 합동) 작도하셨습니다.",
      score: calculateScore(stats, 4, 70),
    };
  }

  if (result.isCongruent && result.message) {
    return { isSuccess: false, message: result.message };
  }

  return {
    isSuccess: false,
    message:
      "점 O에서 시작하고 주어진 기준 반직선을 활용하여 원본 삼각형과 완벽히 합동인 닫힌 삼각형을 완성해야 합니다.",
  };
};

export const validateMission3_3 = (
  objects: GeometryObject[],
  refs: Record<string, GeometryObject>,
  stats: PlayerStats,
): ChallengeValidationResult => {
  const originSides = getOriginTriangleSides(refs);
  const targetPointP = refs["A'"]?.points[0];
  if (!originSides || !targetPointP)
    return { isSuccess: false, message: "System error: Missing ref" };

  // ASA는 잔여 리스크(우연히 임의 반지름이 다른 두 변과 일치)가 존재하나, 완벽한 안티치트보다는 실수 방지가 목적이므로 1로 설정.
  const result = validateTriangleCongruence(objects, originSides, targetPointP, 1);

  if (result.isSuccess) {
    return {
      isSuccess: true,
      message:
        "정답입니다! 양 끝각을 정확히 복사하여(ASA 합동) 완벽한 삼각형을 작도하셨습니다.",
      score: calculateScore(stats, 4, 70),
    };
  }

  if (result.isCongruent && result.message) {
    return { isSuccess: false, message: result.message };
  }

  return {
    isSuccess: false,
    message:
      "제공된 선분 A'B'의 양 끝에서 시작하여 원본 삼각형과 완벽히 합동인 닫힌 삼각형을 완성해야 합니다.",
  };
};
