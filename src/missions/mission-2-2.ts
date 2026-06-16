import { ChallengeMissionData } from "../types/challenge";
import { validateMission2_2 } from "../data/stage2Validators";
import { generateMission2_2 } from "../utils/stage2Generators";

export const mission2_2: ChallengeMissionData = {
  id: "mission-2-2",
  stage: 2,
  level: 2,
  title: "미션 2-2: 크기가 같은 각의 작도",
  description:
    "좌측에 원본 각이 주어집니다. 우측의 점 O와 기준선 OX에 원본과 크기가 완벽히 똑같은 각을 형성하는 반직선을 그리세요.",
  optimalCompassCount: 3,
  targetTimeSec: 50,
  referenceLabels: { V: "V", VA: "VA", VB: "VB", O: "O", OX: "OX" },
  validate: validateMission2_2,
  initialGeometries: generateMission2_2,
};
