import { ChallengeMissionData } from "../types/challenge";
import { Geometry } from "../types/geometry";
import { validateMission1_3 } from "../data/stage1Validators";

const r = (min: number, max: number) => Math.random() * (max - min) + min;

export const mission1_3: ChallengeMissionData = {
  id: "mission-1-3",
  stage: 1,
  level: 3,
  title: "미션 1-3: 정삼각형의 작도",
  description:
    "주어진 선분 AB를 한 변으로 하는 완벽한 정삼각형을 작도하세요. 점들을 꼭 선분으로 이어 닫힌 삼각형을 만들어야 합니다.",
  optimalCompassCount: 2,
  targetTimeSec: 35,
  referenceLabels: { AB: "AB" },
  validate: validateMission1_3,
  initialGeometries: (): Geometry[] => {
    const ax = r(-80, -30),
      ay = r(50, 100);
    const bx = ax + r(100, 150),
      by = ay;
    return [
      {
        id: "ref-A",
        type: "point",
        pt: { x: ax, y: ay },
        source: "initial",
        label: "A",
      },
      {
        id: "ref-B",
        type: "point",
        pt: { x: bx, y: by },
        source: "initial",
        label: "B",
      },
      {
        id: "ref-AB",
        type: "line",
        p1: { x: ax, y: ay },
        p2: { x: bx, y: by },
        source: "initial",
        label: "AB",
      },
    ];
  },
};
