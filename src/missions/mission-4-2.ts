import { ChallengeMissionData } from "../types/challenge";
import { generateStage4_2Initial } from "../utils/stage4Generators";
import { evaluateCircumcenter } from "./evaluateCircumcenter";

export const mission4_2: ChallengeMissionData = {
  id: "mission-4-2",
  stage: 4,
  level: 2,
  title: "미션 4-2: 둔각삼각형의 외접원",
  description: "둔각삼각형의 외접원을 작도하세요. 외심이 삼각형 밖에 위치하게 됩니다. 두 변의 수직이등분선을 그려 밖에서 생기는 교점을 찾아보세요.",
  optimalCompassCount: 4,
  targetTimeSec: 60,
  initialGeometries: generateStage4_2Initial,
  referenceLabels: {
    "A": "A",
    "B": "B",
    "C": "C"
  },
  validate: (objects, refs, stats) => evaluateCircumcenter(objects, refs, stats, 'obtuse')
};
