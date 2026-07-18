import { ChallengeMissionData } from "../types/challenge";
import { Geometry } from "../types/geometry";
import { validateMission1_1 } from "../data/stage1Validators";
import { SeededRandom, safeGenerate, getDailySeed } from "../utils/randomUtils";

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
    const seed = getDailySeed();
    const rng = new SeededRandom(seed + 11); // Add unique offset per mission

    return safeGenerate(
      rng,
      (r, attempt) => {
        // Attempt logic (returns null if invalid, or array of geometries)
        const ax = r.range(0, 100);
        const ay = r.range(-150, -50);
        const bx = ax + r.range(50, 100);
        const by = ay;
        const cx = r.range(-150, -50);
        const cy = r.range(-50, 50);

        // Degenerate checks
        const lenAB = Math.hypot(bx - ax, by - ay);
        if (lenAB < 30) return null; // Avoid too short lines
        const distCtoA = Math.hypot(cx - ax, cy - ay);
        const distCtoB = Math.hypot(cx - bx, cy - by);
        if (distCtoA < 40 || distCtoB < 40) return null; // Avoid overlapping points

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
      () => {
        // Fallback geometries
        return [
          { id: "ref-C", type: "point", pt: { x: -100, y: 0 }, source: "initial", label: "C" },
          { id: "ref-A", type: "point", pt: { x: 50, y: -100 }, source: "initial", label: "A" },
          { id: "ref-B", type: "point", pt: { x: 120, y: -100 }, source: "initial", label: "B" },
          { id: "ref-AB", type: "line", p1: { x: 50, y: -100 }, p2: { x: 120, y: -100 }, source: "initial", label: "AB" },
        ];
      }
    );
  },
};
