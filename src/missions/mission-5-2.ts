import { ChallengeMissionData } from "../types/challenge";
import { generateStage5_2Initial } from "../utils/stage5Generators";
import { validateIncenter } from "../utils/stage5Validators";

export const mission5_2: ChallengeMissionData = {
  id: "5-2",
  stage: 5,
  level: 2,
  title: "미션 5-2: 내심 찾기",
  description: "삼각형 ABC의 내심을 찾아 점을 찍으세요.",
  optimalCompassCount: 4,
  targetTimeSec: 60,
  referenceLabels: {
    "A": "A",
    "B": "B",
    "C": "C"
  },
  initialGeometries: generateStage5_2Initial,
  validate: validateIncenter
};
