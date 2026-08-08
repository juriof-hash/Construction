import { Geometry } from "../types/geometry";
import { getDailySeed, safeGenerate, SeededRandom } from "./randomUtils";
import { distance } from "./mathUtils";

export function generateStage5_1Initial(): Geometry[] {
  const seed = getDailySeed();
  const rng = new SeededRandom(seed + 51);

  return safeGenerate(rng, () => {
      // Line l (A, B) and Point P outside line l
      const cx = (rng.nextFloat() - 0.5) * 100;
      const cy = (rng.nextFloat() - 0.5) * 100;

      const angle = rng.nextFloat() * Math.PI * 2;
      const len = 100 + rng.nextFloat() * 100;

      const A = { x: cx + Math.cos(angle) * len, y: cy + Math.sin(angle) * len };
      const B = { x: cx - Math.cos(angle) * len, y: cy - Math.sin(angle) * len };

      // Point P outside line l
      const normalAngle = angle + Math.PI / 2;
      const distFromLine = 50 + rng.nextFloat() * 100;
      const pOffset = (rng.nextFloat() - 0.5) * len;

      const P = {
        x: cx + Math.cos(angle) * pOffset + Math.cos(normalAngle) * (rng.nextFloat() > 0.5 ? 1 : -1) * distFromLine,
        y: cy + Math.sin(angle) * pOffset + Math.sin(normalAngle) * (rng.nextFloat() > 0.5 ? 1 : -1) * distFromLine
      };

      return [
        { id: "ref-l", type: "line", p1: A, p2: B, source: "initial", label: "l" },
        { id: "ref-P", type: "point", pt: P, source: "initial", label: "P" },
      ];
    },
    () => {
      const A = { x: -100, y: 50 };
      const B = { x: 150, y: -50 };
      const P = { x: 50, y: 100 };
      return [
        { id: "ref-l", type: "line", p1: A, p2: B, source: "initial", label: "l" },
        { id: "ref-P", type: "point", pt: P, source: "initial", label: "P" },
      ];
    }
  );
}

export function generateStage5_2Initial(): Geometry[] {
  const seed = getDailySeed();
  const rng = new SeededRandom(seed + 52);

  return safeGenerate(rng, () => {
      // Triangle A, B, C
            const cx = (rng.nextFloat() - 0.5) * 50;
      const cy = (rng.nextFloat() - 0.5) * 50;
      const r = 100 + rng.nextFloat() * 80;

      // Ensure variety: Acute, Right, Obtuse
      const type = rng.nextFloat();
      let angle1, angle2, angle3;
      
      const startAngle = rng.nextFloat() * Math.PI * 2;
      
      if (type < 0.33) {
         // Acute
         angle1 = startAngle;
         angle2 = angle1 + (Math.PI / 2 + rng.nextFloat() * 0.5);
         angle3 = angle2 + (Math.PI / 2 + rng.nextFloat() * 0.5);
      } else if (type < 0.66) {
         // Right
         angle1 = startAngle;
         angle2 = angle1 + Math.PI;
         angle3 = angle2 + (0.5 + rng.nextFloat() * 2);
      } else {
         // Obtuse
         angle1 = startAngle;
         angle2 = angle1 + (0.5 + rng.nextFloat() * 1.0);
         angle3 = angle2 + (0.5 + rng.nextFloat() * 1.0);
      }

      const A = { x: cx + r * Math.cos(angle1), y: cy + r * Math.sin(angle1) };
      const B = { x: cx + r * Math.cos(angle2), y: cy + r * Math.sin(angle2) };
      const C = { x: cx + r * Math.cos(angle3), y: cy + r * Math.sin(angle3) };

      return [
        { id: "ref-A", type: "point", pt: A, source: "initial", label: "A" },
        { id: "ref-B", type: "point", pt: B, source: "initial", label: "B" },
        { id: "ref-C", type: "point", pt: C, source: "initial", label: "C" },
        { id: "ref-AB", type: "line", p1: A, p2: B, source: "initial" },
        { id: "ref-BC", type: "line", p1: B, p2: C, source: "initial" },
        { id: "ref-CA", type: "line", p1: C, p2: A, source: "initial" },
      ];
    },
    () => {
      const A = { x: 0, y: -120 };
      const B = { x: -100, y: 100 };
      const C = { x: 120, y: 80 };
      return [
        { id: "ref-A", type: "point", pt: A, source: "initial", label: "A" },
        { id: "ref-B", type: "point", pt: B, source: "initial", label: "B" },
        { id: "ref-C", type: "point", pt: C, source: "initial", label: "C" },
        { id: "ref-AB", type: "line", p1: A, p2: B, source: "initial" },
        { id: "ref-BC", type: "line", p1: B, p2: C, source: "initial" },
        { id: "ref-CA", type: "line", p1: C, p2: A, source: "initial" },
      ];
    }
  );
}

export function generateStage5_3Initial(): Geometry[] {
  const seed = getDailySeed();
  const rng = new SeededRandom(seed + 53);

  return safeGenerate(rng, () => {
      // Triangle A, B, C (Various shapes)
            const cx = (rng.nextFloat() - 0.5) * 50;
      const cy = (rng.nextFloat() - 0.5) * 50;
      const r = 100 + rng.nextFloat() * 80;

      // Ensure variety: Acute, Right, Obtuse
      const type = rng.nextFloat();
      let angle1, angle2, angle3;
      
      const startAngle = rng.nextFloat() * Math.PI * 2;
      
      if (type < 0.33) {
         // Acute
         angle1 = startAngle;
         angle2 = angle1 + (Math.PI / 2 + rng.nextFloat() * 0.5);
         angle3 = angle2 + (Math.PI / 2 + rng.nextFloat() * 0.5);
      } else if (type < 0.66) {
         // Right
         angle1 = startAngle;
         angle2 = angle1 + Math.PI;
         angle3 = angle2 + (0.5 + rng.nextFloat() * 2);
      } else {
         // Obtuse
         angle1 = startAngle;
         angle2 = angle1 + (0.5 + rng.nextFloat() * 1.0);
         angle3 = angle2 + (0.5 + rng.nextFloat() * 1.0);
      }

      const A = { x: cx + r * Math.cos(angle1), y: cy + r * Math.sin(angle1) };
      const B = { x: cx + r * Math.cos(angle2), y: cy + r * Math.sin(angle2) };
      const C = { x: cx + r * Math.cos(angle3), y: cy + r * Math.sin(angle3) };

      return [
        { id: "ref-A", type: "point", pt: A, source: "initial", label: "A" },
        { id: "ref-B", type: "point", pt: B, source: "initial", label: "B" },
        { id: "ref-C", type: "point", pt: C, source: "initial", label: "C" },
        { id: "ref-AB", type: "line", p1: A, p2: B, source: "initial" },
        { id: "ref-BC", type: "line", p1: B, p2: C, source: "initial" },
        { id: "ref-CA", type: "line", p1: C, p2: A, source: "initial" },
      ];
    },
    () => {
      const A = { x: 0, y: -120 };
      const B = { x: -100, y: 100 };
      const C = { x: 120, y: 80 };
      return [
        { id: "ref-A", type: "point", pt: A, source: "initial", label: "A" },
        { id: "ref-B", type: "point", pt: B, source: "initial", label: "B" },
        { id: "ref-C", type: "point", pt: C, source: "initial", label: "C" },
        { id: "ref-AB", type: "line", p1: A, p2: B, source: "initial" },
        { id: "ref-BC", type: "line", p1: B, p2: C, source: "initial" },
        { id: "ref-CA", type: "line", p1: C, p2: A, source: "initial" },
      ];
    }
  );
}
