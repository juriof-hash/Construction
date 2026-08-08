import { ChallengeMissionData } from "../types/challenge";
import { generateStage5_1Initial } from "../utils/stage5Generators";
import { validatePerpendicularLine } from "../utils/stage5Validators";

export const mission5_1: ChallengeMissionData = {
  id: "5-1",
  stage: 5,
  level: 1,
  title: "미션 5-1: 수선 작도",
  description: "직선 l 밖에 있는 점 P를 지나고, 직선 l에 수직인 선분(또는 직선)을 작도하세요.",
  optimalCompassCount: 2,
  targetTimeSec: 30,
  referenceLabels: {
    "l": "l",
    "P": "P"
  },
  initialGeometries: generateStage5_1Initial,
  validate: validatePerpendicularLine
};
