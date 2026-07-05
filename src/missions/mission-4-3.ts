import { ChallengeMissionData } from "../types/challenge";
import { generateStage4_3Initial } from "../utils/stage4Generators";
import { evaluateCircumcenter } from "./evaluateCircumcenter";

export const mission4_3: ChallengeMissionData = {
  id: "mission-4-3",
  stage: 4,
  level: 3,
  title: "미션 4-3: 직각삼각형의 외접원",
  description: "직각삼각형의 외접원을 작도하세요. 가장 긴 변(빗변)의 수직이등분선을 그리면 빗변의 중점에서 외심을 찾을 수 있습니다.",
  optimalCompassCount: 4,
  targetTimeSec: 60,
  initialGeometries: generateStage4_3Initial,
  referenceLabels: {
    "A": "A",
    "B": "B",
    "C": "C"
  },
  validate: (objects, refs, stats) => evaluateCircumcenter(objects, refs, stats, 'right')
};
