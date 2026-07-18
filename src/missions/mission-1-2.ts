import { ChallengeMissionData } from "../types/challenge";
import { Geometry } from "../types/geometry";
import { validateMission1_2 } from "../data/stage1Validators";
import { SeededRandom, safeGenerate, getDailySeed } from "../utils/randomUtils";

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
    const seed = getDailySeed();
    const rng = new SeededRandom(seed + 12);

    return safeGenerate(
      rng,
      (r, attempt) => {
        const ax = r.range(-50, 50);
        const ay = r.range(-50, 50);
        const bx = ax + r.range(50, 100);
        const by = ay + r.range(-20, 20);

        const lenAB = Math.hypot(bx - ax, by - ay);
        if (lenAB < 30) return null;

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
      () => {
        return [
          { id: "ref-A", type: "point", pt: { x: -50, y: 0 }, source: "initial", label: "A" },
          { id: "ref-B", type: "point", pt: { x: 50, y: 0 }, source: "initial", label: "B" },
          { id: "ref-AB", type: "line", p1: { x: -50, y: 0 }, p2: { x: 50, y: 0 }, source: "initial", label: "AB" },
        ];
      }
    );
  },
};
