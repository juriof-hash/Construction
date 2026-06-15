import { ChallengeMissionData } from "../types/challenge";
import { Geometry } from "../types/geometry";
import {
  validateMission1_1,
  validateMission1_2,
  validateMission1_3,
  validateMission1_4,
} from "../data/stage1Validators";

const r = (min: number, max: number) => Math.random() * (max - min) + min;

export const MISSIONS: ChallengeMissionData[] = [
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
];
