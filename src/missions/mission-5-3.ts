import { ChallengeMissionData } from "../types/challenge";
import { generateStage5_3Initial } from "../utils/stage5Generators";
import { validateIncircle } from "../utils/stage5Validators";

export const mission5_3: ChallengeMissionData = {
  id: "5-3",
  stage: 5,
  level: 3,
  title: "미션 5-3: 내접원 작도",
  description: "삼각형 ABC에 내접하는 원을 작도하세요.",
  optimalCompassCount: 5,
  targetTimeSec: 90,
  referenceLabels: {
    "A": "A",
    "B": "B",
    "C": "C"
  },
  initialGeometries: generateStage5_3Initial,
  validate: validateIncircle
};
