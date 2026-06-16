import { ChallengeMissionData } from "../types/challenge";
import { Geometry } from "../types/geometry";
import { validateMission1_2 } from "../data/stage1Validators";

const r = (min: number, max: number) => Math.random() * (max - min) + min;

export const mission1_2: ChallengeMissionData = {
  id: "mission-1-2",
  stage: 1,
  level: 2,
  title: "미션 1-2: 길이가 2배인 선분을 작도",
  description:
    "선분 AB를 연장한 직선 위에서, 점 A나 점 B를 끝점으로 하면서 길이가 원본의 2배인 선분을 직접 그리세요.",
  optimalCompassCount: 2,
  targetTimeSec: 30,
  referenceLabels: { AB: "AB", A: "A", B: "B" },
  validate: validateMission1_2,
  initialGeometries: (): Geometry[] => {
    const ax = r(-50, 50),
      ay = r(-50, 50);
    const bx = ax + r(50, 100),
      by = ay + r(-20, 20);
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
