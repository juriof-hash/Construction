import { ChallengeMissionData } from "../types/challenge";
import { validateMission2_3 } from "../data/stage2Validators";
import { generateMission2_3 } from "../utils/stage2Generators";

export const mission2_3: ChallengeMissionData = {
  id: "mission-2-3",
  stage: 2,
  level: 3,
  title: "미션 2-3: 평행선의 작도",
  description:
    "직선 AB 밖의 점 P를 지나며 직선 AB와 평행한(영원히 만나지 않고 거리가 일정한) 직선을 작도하세요.",
  optimalCompassCount: 3,
  targetTimeSec: 60,
  referenceLabels: { P: "P", AB: "AB" },
  validate: validateMission2_3,
  initialGeometries: generateMission2_3,
};
