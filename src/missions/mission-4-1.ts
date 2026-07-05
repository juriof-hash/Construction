import { ChallengeMissionData } from "../types/challenge";
import { generateStage4_1Initial } from "../utils/stage4Generators";
import { evaluateCircumcenter } from "./evaluateCircumcenter";

export const mission4_1: ChallengeMissionData = {
  id: "mission-4-1",
  stage: 4,
  level: 1,
  title: "미션 4-1: 예각삼각형의 외접원",
  description: "수직이등분선을 이용하여 삼각형의 외심을 찾고, 세 꼭짓점을 지나는 외접원을 작도하세요. (힌트: 두 변의 수직이등분선의 교점이 외심입니다)",
  optimalCompassCount: 4,
  targetTimeSec: 60,
  initialGeometries: generateStage4_1Initial,
  referenceLabels: {
    "A": "A",
    "B": "B",
    "C": "C"
  },
  validate: (objects, refs, stats) => evaluateCircumcenter(objects, refs, stats, 'acute')
};
