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
): boolean {
  const graph = new GeoGraph();
  const segments = objects.filter((o) => o.type === "segment");
  for (const seg of segments) {
    graph.addSegment(seg);
  }

  const triangles = graph.findCyclesOfSize(3);

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
      Math.abs(userSides[0] - originSides[0]) <= EPSILON * 2 &&
      Math.abs(userSides[1] - originSides[1]) <= EPSILON * 2 &&
      Math.abs(userSides[2] - originSides[2]) <= EPSILON * 2;

    if (isCongruent) {
      // 삼각형이 오른쪽에 위치하는지(x > -50 근처) 확인
      if (p1.x > -50 || p2.x > -50 || p3.x > -50) {
        return true;
      }
    }
  }

  return false;
}

export const validateMission3_1 = (
  objects: GeometryObject[],
  refs: Record<string, GeometryObject>,
  stats: PlayerStats,
): ChallengeValidationResult => {
  const originSides = getOriginTriangleSides(refs);
  if (!originSides)
    return { isSuccess: false, message: "System error: Missing ref" };

  if (validateTriangleCongruence(objects, originSides)) {
    return {
      isSuccess: true,
      message:
        "정답입니다! 세 변의 길이가 같은(SSS 합동) 완벽한 삼각형을 작도하셨습니다.",
      score: calculateScore(stats, 4, 60),
    };
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
  if (!originSides)
    return { isSuccess: false, message: "System error: Missing ref" };

  if (validateTriangleCongruence(objects, originSides)) {
    return {
      isSuccess: true,
      message:
        "정답입니다! 두 변의 길이와 그 끼인각을 정확히 복사하여(SAS 합동) 작도하셨습니다.",
      score: calculateScore(stats, 4, 70),
    };
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
  if (!originSides)
    return { isSuccess: false, message: "System error: Missing ref" };

  if (validateTriangleCongruence(objects, originSides)) {
    return {
      isSuccess: true,
      message:
        "정답입니다! 양 끝각을 정확히 복사하여(ASA 합동) 완벽한 삼각형을 작도하셨습니다.",
      score: calculateScore(stats, 4, 70),
    };
  }

  return {
    isSuccess: false,
    message:
      "제공된 선분 A'B'의 양 끝에서 시작하여 원본 삼각형과 완벽히 합동인 닫힌 삼각형을 완성해야 합니다.",
  };
};
