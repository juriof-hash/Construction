import { ChallengeMissionData } from "../types/challenge";
import { validateMission3_2 } from "../utils/stage3Validators";
import { generateMission3_2 } from "../utils/stage3Generators";

export const mission3_2: ChallengeMissionData = {
  id: "mission-3-2",
  stage: 3,
  level: 2,
  title: "미션 3-2: SAS 합동 작도",
  description:
    "우측의 시작점 O와 기준 반직선을 이용하여 원본 삼각형과 두 변의 길이, 그리고 그 끼인각이 같은(SAS 합동) 삼각형을 작도하세요.",
  optimalCompassCount: 4,
  targetTimeSec: 70,
  referenceLabels: { A: "A", B: "B", C: "C", O: "O" },
  validate: validateMission3_2,
  initialGeometries: generateMission3_2,
};
