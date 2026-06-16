import { ChallengeMissionData } from "../types/challenge";
import { Geometry } from "../types/geometry";
import { validateMission1_4 } from "../data/stage1Validators";

const r = (min: number, max: number) => Math.random() * (max - min) + min;

export const mission1_4: ChallengeMissionData = {
  id: "mission-1-4",
  stage: 1,
  level: 4,
  title: "미션 1-4: 정육각형의 작도",
  description:
    "주어진 중심 O와 반지름 선분 OA를 이용하여 완벽한 정육각형을 작도하세요. (외곽선 6개 연결, 중심점과의 연결선 6개 필요)",
  optimalCompassCount: 6,
  targetTimeSec: 90,
  referenceLabels: { O: "O", OA: "OA" },
  validate: validateMission1_4,
  initialGeometries: (): Geometry[] => {
    const ox = r(-20, 20),
      oy = r(-20, 20);
    const ax = ox + r(60, 100),
      ay = oy;
    return [
      {
        id: "ref-O",
        type: "point",
        pt: { x: ox, y: oy },
        source: "initial",
        label: "O",
      },
      {
        id: "ref-A",
        type: "point",
        pt: { x: ax, y: ay },
        source: "initial",
        label: "A",
      },
      {
        id: "ref-OA",
        type: "line",
        p1: { x: ox, y: oy },
        p2: { x: ax, y: ay },
        source: "initial",
        label: "OA",
      },
    ];
  },
};
