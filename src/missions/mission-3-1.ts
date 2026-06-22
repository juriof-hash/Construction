import { ChallengeMissionData } from "../types/challenge";
import { validateMission3_1 } from "../utils/stage3Validators";
import { generateMission3_1 } from "../utils/stage3Generators";

export const mission3_1: ChallengeMissionData = {
  id: "mission-3-1",
  stage: 3,
  level: 1,
  title: "미션 3-1: SSS 합동 작도",
  description:
    "좌측에 원본 삼각형 ABC가 있습니다. 우측의 시작점 P를 이용하여 원본과 세 변의 길이가 완벽히 같은 삼각형을 작도하세요.",
  optimalCompassCount: 4,
  targetTimeSec: 60,
  referenceLabels: { A: "A", B: "B", C: "C", P: "P" },
  validate: validateMission3_1,
  initialGeometries: generateMission3_1,
};
