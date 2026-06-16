import { ChallengeMissionData } from "../types/challenge";
import { Geometry } from "../types/geometry";
import { validateMission1_1 } from "../data/stage1Validators";

const r = (min: number, max: number) => Math.random() * (max - min) + min;

export const mission1_1: ChallengeMissionData = {
  id: "mission-1-1",
  stage: 1,
  level: 1,
  title: "미션 1-1: 길이가 같은 선분의 작도",
  description:
    '점 C에서 시작하여, 주어진 선분 AB와 길이가 같은 선분을 작도하세요. 교점이 생성되었더라도 직접 "선분 도구"로 이어야 합니다.',
  optimalCompassCount: 1,
  targetTimeSec: 20,
  referenceLabels: { C: "C", AB: "AB" },
  validate: validateMission1_1,
  initialGeometries: (): Geometry[] => {
    const ax = r(0, 100),
      ay = r(-150, -50);
    const bx = ax + r(50, 100),
      by = ay;
    const cx = r(-150, -50),
      cy = r(-50, 50);
    return [
      {
        id: "ref-C",
        type: "point",
        pt: { x: cx, y: cy },
        source: "initial",
        label: "C",
      },
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
