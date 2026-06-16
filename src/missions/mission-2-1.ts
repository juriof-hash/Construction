import { ChallengeMissionData } from "../types/challenge";
import { validateMission2_1 } from "../data/stage2Validators";
import { generateMission2_1 } from "../utils/stage2Generators";

export const mission2_1: ChallengeMissionData = {
  id: "mission-2-1",
  stage: 2,
  level: 1,
  title: "미션 2-1: 각의 이등분선 작도",
  description:
    "꼭짓점 V와 반직선 VA, VB로 이루어진 각이 주어집니다. 이 각을 정확히 반으로 나누는 이등분선을 작도하세요.",
  optimalCompassCount: 3,
  targetTimeSec: 45,
  referenceLabels: { V: "V", VA: "VA", VB: "VB" },
  validate: validateMission2_1,
  initialGeometries: generateMission2_1,
};
