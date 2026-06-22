import { ChallengeMissionData } from "../types/challenge";
import { validateMission3_3 } from "../utils/stage3Validators";
import { generateMission3_3 } from "../utils/stage3Generators";

export const mission3_3: ChallengeMissionData = {
  id: "mission-3-3",
  stage: 3,
  level: 3,
  title: "미션 3-3: ASA 합동 작도",
  description:
    "우측에 원본 삼각형의 한 변의 길이와 일치하는 선분 A'B'가 주어져 있습니다. 두 끝각을 복사하여(ASA 합동) 완벽한 삼각형을 작도하세요.",
  optimalCompassCount: 4,
  targetTimeSec: 70,
  referenceLabels: { A: "A", B: "B", C: "C", "A'": "A'", "B'": "B'" },
  validate: validateMission3_3,
  initialGeometries: generateMission3_3,
};
