import { GeometryObject, ValidationResult } from "../types/mission";
import {
  EPSILON,
  distance,
  distancePointToInfiniteLine,
  getSegmentLength,
  isSamePoint,
} from "../utils/geoGraphValidation";
import {
  PlayerStats,
  ChallengeValidationResult,
  ScoreResult,
} from "../types/challenge";
import { calculateScore } from "./stage1Validators";

type Vec2 = { x: number; y: number };

function getPointAtDistance(p1: Vec2, p2: Vec2, d: number): Vec2 {
  const origDist = distance(p1, p2);
  if (origDist === 0) return p1;
  const ratio = d / origDist;
  return {
    x: p1.x + (p2.x - p1.x) * ratio,
    y: p1.y + (p2.y - p1.y) * ratio,
  };
}

// 점이 선분 위에 있는지 확인 (직선까지의 거리가 EPSILON 이하이고, 바운딩 박스 안에 있음)
function isPointOnSegmentApprox(pt: Vec2, p1: Vec2, p2: Vec2): boolean {
  if (distancePointToInfiniteLine(pt, p1, p2) > EPSILON) return false;
  const minX = Math.min(p1.x, p2.x) - EPSILON;
  const maxX = Math.max(p1.x, p2.x) + EPSILON;
  const minY = Math.min(p1.y, p2.y) - EPSILON;
  const maxY = Math.max(p1.y, p2.y) + EPSILON;
  return pt.x >= minX && pt.x <= maxX && pt.y >= minY && pt.y <= maxY;
}

// ------------------------------------------
// Mission 2-1: 각의 이등분선 작도
// ------------------------------------------
export const validateMission2_1 = (
  objects: GeometryObject[],
  refs: Record<string, GeometryObject>,
  stats: PlayerStats,
): ChallengeValidationResult => {
  const P_V = refs["V"];
  const S_VA = refs["VA"];
  const S_VB = refs["VB"];

  if (!P_V || !S_VA || !S_VB)
    return { isSuccess: false, message: "System error: Missing ref" };

  const V_pt = P_V.points[0];
  const A_orig = isSamePoint(S_VA.points[0], V_pt)
    ? S_VA.points[1]
    : S_VA.points[0];
  const B_orig = isSamePoint(S_VB.points[0], V_pt)
    ? S_VB.points[1]
    : S_VB.points[0];

  const R = 100; // 기준 거리
  const A_prime = getPointAtDistance(V_pt, A_orig, R);
  const B_prime = getPointAtDistance(V_pt, B_orig, R);
  const chordLength = distance(A_prime, B_prime);

  const userSegments = objects.filter(
    (o) => o.source === "user" && o.type === "segment",
  );
  let success = false;

  for (const seg of userSegments) {
    let userDirPoint = null;
    if (isSamePoint(seg.points[0], V_pt)) {
      userDirPoint = seg.points[1];
    } else if (isSamePoint(seg.points[1], V_pt)) {
      userDirPoint = seg.points[0];
    } else if (isPointOnSegmentApprox(V_pt, seg.points[0], seg.points[1])) {
      // 선분이 V를 관통하는 경우도 인정
      userDirPoint = seg.points[0];
      // V가 아닌 한 끝점을 방향점으로 사용
      if (isSamePoint(userDirPoint, V_pt)) userDirPoint = seg.points[1];
    }

    if (userDirPoint) {
      if (isSamePoint(V_pt, userDirPoint)) continue;

      // 양방향 모두 검사 (관통 선분 처리)
      const testDirs = [
        userDirPoint,
        {
          x: V_pt.x - (userDirPoint.x - V_pt.x),
          y: V_pt.y - (userDirPoint.y - V_pt.y),
        },
      ];

      for (const dirPt of testDirs) {
        if (isSamePoint(V_pt, dirPt)) continue;
        const P = getPointAtDistance(V_pt, dirPt, R);
        const d1 = distance(P, A_prime);
        const d2 = distance(P, B_prime);

        // 유클리드 거리를 활용한 완벽한 빗변 검증 (각의 이등분선은 현과 V의 거리가 동일함)
        // P가 내부인지 확인하기 위해 chordLength보다 거리가 짧은지 확인
        if (Math.abs(d1 - d2) <= EPSILON * 2 && d1 < chordLength - EPSILON) {
          success = true;
          break;
        }
      }
    }
  }

  if (!success) {
    return {
      isSuccess: false,
      message:
        "꼭짓점 V에서 시작하여 각을 정확히 반으로 나누는 선분을 그려야 합니다.",
    };
  }

  return {
    isSuccess: true,
    message: "정답입니다! 각의 이등분선을 완벽하게 작도하셨습니다.",
    score: calculateScore(stats, 3, 45),
  };
};

// ------------------------------------------
// Mission 2-2: 크기가 같은 각의 작도
// ------------------------------------------
export const validateMission2_2 = (
  objects: GeometryObject[],
  refs: Record<string, GeometryObject>,
  stats: PlayerStats,
): ChallengeValidationResult => {
  const P_V = refs["V"];
  const S_VA = refs["VA"];
  const S_VB = refs["VB"];
  const P_O = refs["O"];
  const S_OX = refs["OX"];

  if (!P_V || !S_VA || !S_VB || !P_O || !S_OX)
    return { isSuccess: false, message: "System error: Missing ref" };

  const V_pt = P_V.points[0];
  const A_orig = isSamePoint(S_VA.points[0], V_pt)
    ? S_VA.points[1]
    : S_VA.points[0];
  const B_orig = isSamePoint(S_VB.points[0], V_pt)
    ? S_VB.points[1]
    : S_VB.points[0];

  const O_pt = P_O.points[0];
  const X_orig = isSamePoint(S_OX.points[0], O_pt)
    ? S_OX.points[1]
    : S_OX.points[0];

  const R = 80;
  const A_prime = getPointAtDistance(V_pt, A_orig, R);
  const B_prime = getPointAtDistance(V_pt, B_orig, R);
  // 현의 길이 C
  const C = distance(A_prime, B_prime);

  const X_prime = getPointAtDistance(O_pt, X_orig, R);

  const userSegments = objects.filter(
    (o) => o.source === "user" && o.type === "segment",
  );
  let success = false;

  for (const seg of userSegments) {
    let Y_dir = null;
    if (isSamePoint(seg.points[0], O_pt)) {
      Y_dir = seg.points[1];
    } else if (isSamePoint(seg.points[1], O_pt)) {
      Y_dir = seg.points[0];
    }

    if (Y_dir) {
      const Y_prime = getPointAtDistance(O_pt, Y_dir, R);
      const userChord = distance(X_prime, Y_prime);

      // SSS 합동조건: 거리가 C와 같다면 같은 각!
      if (Math.abs(userChord - C) <= EPSILON * 2) {
        success = true;
        break;
      }
    }
  }

  if (!success) {
    return {
      isSuccess: false,
      message:
        "꼭짓점 O에서 시작하고 기준선 위에 원본 각과 크기가 정확히 같은 각을 이루는 새로운 반직선을 그려야 합니다.",
    };
  }

  return {
    isSuccess: true,
    message: "정답입니다! SSS 합동의 원리를 통해 동일한 각도를 복사했습니다.",
    score: calculateScore(stats, 3, 50),
  };
};

// ------------------------------------------
// Mission 2-3: 평행선의 작도
// ------------------------------------------
export const validateMission2_3 = (
  objects: GeometryObject[],
  refs: Record<string, GeometryObject>,
  stats: PlayerStats,
): ChallengeValidationResult => {
  const S_AB = refs["AB"];
  const P_P = refs["P"];
  if (!S_AB || !P_P)
    return { isSuccess: false, message: "System error: Missing ref" };

  const A_pt = S_AB.points[0];
  const B_pt = S_AB.points[1];
  const P_pt = P_P.points[0];

  const h_P = distancePointToInfiniteLine(P_pt, A_pt, B_pt);

  const userSegments = objects.filter(
    (o) => o.source === "user" && o.type === "segment",
  );
  let success = false;

  for (const seg of userSegments) {
    // 1. 선분이 점 P를 지난다
    if (
      distancePointToInfiniteLine(P_pt, seg.points[0], seg.points[1]) > EPSILON
    )
      continue;
    if (!isPointOnSegmentApprox(P_pt, seg.points[0], seg.points[1])) continue;

    // 2. 선분 위의 임의의 다른 세 점을 구해서 일관된 방향인지 확인한다
    const P2 = getPointAtDistance(seg.points[0], seg.points[1], 50);
    const P3 = getPointAtDistance(seg.points[0], seg.points[1], 100);

    const h_P2 = distancePointToInfiniteLine(P2, A_pt, B_pt);
    const h_P3 = distancePointToInfiniteLine(P3, A_pt, B_pt);

    // 평행하면 모든 점에서의 거리가 h_P와 일치해야 함.
    if (
      Math.abs(h_P - h_P2) <= EPSILON * 2 &&
      Math.abs(h_P - h_P3) <= EPSILON * 2
    ) {
      if (distance(seg.points[0], seg.points[1]) > 10) {
        // 길이가 너무 짧은 점 제거
        success = true;
        break;
      }
    }
  }

  if (!success) {
    return {
      isSuccess: false,
      message:
        "점 P를 지나며 기준 직선 AB와 영원히 만나지 않는(거리가 일정한) 평행선을 그려야 합니다.",
    };
  }

  return {
    isSuccess: true,
    message: "정답입니다! 수학적 완벽함이 돋보이는 평행선이네요.",
    score: calculateScore(stats, 3, 60),
  };
};
