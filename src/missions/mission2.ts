import { GeometryObject, ValidationResult } from "../types/mission";
import {
  ANGLE_EPSILON,
  DISTANCE_EPSILON,
  distance,
  toInfiniteLine,
  isPointOnLine,
  angleBetweenVectors,
} from "../utils/challengeGeometry";

export const validateMission2 = (
  objects: GeometryObject[],
  refs: Readonly<Record<string, GeometryObject>>,
): ValidationResult => {
  // 타겟: 점 D에서 뻗어나가는 segment 또는 line
  const candidates = objects.filter(
    (o) => o.source === "user" && (o.type === "segment" || o.type === "line"),
  );

  if (candidates.length === 0) {
    return {
      isSuccess: false,
      feedbackCode: "NO_CANDIDATE_FOUND",
      message: "선분을 그려주세요.",
    };
  }

  // 기준: 각 ABC (BA와 BC의 사이 각), 점 D, 반직선 DE (방향성 필요)
  // 여기서 refs['BA'], refs['BC'], refs['DE'] 가 있다고 가정
  const refBA = refs["BA"];
  const refBC = refs["BC"];
  const refDE = refs["DE"];
  const ptD = refs["D"].points[0];

  const dirBA = {
    x: refBA.points[0].x - refBA.points[1].x,
    y: refBA.points[0].y - refBA.points[1].y,
  };
  const dirBC = {
    x: refBC.points[1].x - refBC.points[0].x,
    y: refBC.points[1].y - refBC.points[0].y,
  }; // assuming point 0 is B
  // But wait, it's safer to get the angle from the infinite lines using angleBetweenVectors:
  const lineBA = toInfiniteLine(refBA);
  const lineBC = toInfiniteLine(refBC);
  const lineDE = toInfiniteLine(refDE);

  const targetAngle = angleBetweenVectors(lineBA.direction, lineBC.direction); // Directional angle between the two legs of angle ABC

  let bestScore = -1;
  let bestFeedbackCode = "WRONG_OBJECT_TYPE";
  let bestMessage = "선분을 그려야 합니다.";

  const updateFeedback = (score: number, code: string, message: string) => {
    if (score > bestScore) {
      bestScore = score;
      bestFeedbackCode = code;
      bestMessage = message;
    }
  };

  for (const cand of candidates) {
    const candInfinite = toInfiniteLine(cand);

    // 검증 1: 점 D를 지나는가
    // 끝점이 D이거나 선 위에 D가 있는지
    const passesD =
      distance(cand.points[0], ptD) <= DISTANCE_EPSILON ||
      distance(cand.points[1], ptD) <= DISTANCE_EPSILON ||
      isPointOnLine(ptD, candInfinite);

    if (!passesD) {
      updateFeedback(
        0,
        "WRONG_ANCHOR_POINT",
        "점 D를 지나는 선분을 그려주세요.",
      );
      continue;
    }

    // 검증 2: 방향 검사 (D를 기준으로 양쪽 모두 검사)
    // candInfinite 방향벡터 방향과 반대방향 모두 검사
    const angle1 = angleBetweenVectors(
      lineDE.direction,
      candInfinite.direction,
    );
    const angle2 = angleBetweenVectors(lineDE.direction, {
      x: -candInfinite.direction.x,
      y: -candInfinite.direction.y,
    });

    const isTarget = Math.abs(angle1 - targetAngle) <= ANGLE_EPSILON || Math.abs(angle2 - targetAngle) <= ANGLE_EPSILON;
    const isSupplementary = Math.abs(angle1 - (Math.PI - targetAngle)) <= ANGLE_EPSILON || Math.abs(angle2 - (Math.PI - targetAngle)) <= ANGLE_EPSILON;

    if (isTarget || isSupplementary) {
      return {
        isSuccess: true,
        feedbackCode: "SUCCESS",
        message: "정답입니다!",
      };
    } else {
      updateFeedback(
        1,
        "ANGLE_MISMATCH",
        "각의 크기가 다릅니다. (자석 스냅을 이용해 정확한 교점을 지나는지 확인하세요)",
      );
    }
  }

  return {
    isSuccess: false,
    feedbackCode: bestFeedbackCode as any,
    message: bestMessage,
  };
};
