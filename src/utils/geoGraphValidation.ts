import { GeometryObject, Vec2 } from "../types/mission";

export const EPSILON = 1e-3;

export function distance(p1: Vec2, p2: Vec2): number {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

export function isSamePoint(p1: Vec2, p2: Vec2): boolean {
  return distance(p1, p2) <= EPSILON;
}

export function getSegmentLength(seg: GeometryObject): number {
  if (seg.type !== "segment" || !seg.points || seg.points.length !== 2)
    return 0;
  return distance(seg.points[0], seg.points[1]);
}

// 점(pt)에서 두 점(linePt1, linePt2)을 지나는 무한 직선까지의 수직 거리 (미션 1-2 직선 검증용)
export function distancePointToInfiniteLine(
  pt: Vec2,
  linePt1: Vec2,
  linePt2: Vec2,
): number {
  const dx = linePt2.x - linePt1.x;
  const dy = linePt2.y - linePt1.y;
  const length2 = dx * dx + dy * dy;
  if (length2 === 0) return distance(pt, linePt1); // 두 점이 같을 경우

  const t = ((pt.x - linePt1.x) * dx + (pt.y - linePt1.y) * dy) / length2;
  const proj = {
    x: linePt1.x + t * dx,
    y: linePt1.y + t * dy,
  };
  return distance(pt, proj);
}

// 점(pt)가 선분(seg)의 끝점 중 하나와 일치하는지 확인
export function hasEndpoint(seg: GeometryObject, pt: Vec2): boolean {
  if (seg.type !== "segment" || !seg.points || seg.points.length !== 2)
    return false;
  return isSamePoint(seg.points[0], pt) || isSamePoint(seg.points[1], pt);
}

// ------------------------------------------
// Graph Validation Tools
// ------------------------------------------
export interface GraphNode {
  pt: Vec2;
  edges: GraphEdge[];
}

export interface GraphEdge {
  segment: GeometryObject;
  to: GraphNode;
}

export class GeoGraph {
  nodes: GraphNode[] = [];

  addSegment(seg: GeometryObject) {
    if (seg.type !== "segment" || !seg.points || seg.points.length !== 2)
      return;
    const p1 = seg.points[0];
    const p2 = seg.points[1];

    const n1 = this.getOrAddNode(p1);
    const n2 = this.getOrAddNode(p2);

    n1.edges.push({ segment: seg, to: n2 });
    n2.edges.push({ segment: seg, to: n1 });
  }

  getOrAddNode(pt: Vec2): GraphNode {
    for (const n of this.nodes) {
      if (isSamePoint(n.pt, pt)) return n;
    }
    const newNode: GraphNode = { pt, edges: [] };
    this.nodes.push(newNode);
    return newNode;
  }

  // 1-3. 정삼각형, 1-4. 정육각형 등을 찾기 위한 심플 사이클 검색 알고리즘
  // N개의 노드로 구성된 닫힌 고리(루프)를 찾고, 그 루프를 구성하는 노드들의 배열을 반환한다.
  findCyclesOfSize(size: number): GraphNode[][] {
    const cycles: GraphNode[][] = [];

    for (const startNode of this.nodes) {
      this.dfsCycle(startNode, startNode, size, 0, [], cycles);
    }
    return cycles;
  }

  private dfsCycle(
    startNode: GraphNode,
    currentNode: GraphNode,
    targetSize: number,
    depth: number,
    visited: GraphNode[],
    foundCycles: GraphNode[][],
  ) {
    if (depth === targetSize) {
      if (currentNode === startNode) {
        // 이미 찾은 cycle인지 확인 (시작점, 방향에 따라 중복 가능하므로 간단히만 확인)
        foundCycles.push([...visited]);
      }
      return;
    }

    visited.push(currentNode);

    for (const edge of currentNode.edges) {
      const nextNode = edge.to;

      // 진행 전 사이클 크기보다 짧게 돌아오는 경우 차단
      if (depth < targetSize - 1 && visited.includes(nextNode)) {
        continue;
      }
      // 마지막 뎁스에서는 무조건 시작점으로 돌아와야 함
      if (depth === targetSize - 1 && nextNode !== startNode) {
        continue;
      }

      this.dfsCycle(
        startNode,
        nextNode,
        targetSize,
        depth + 1,
        visited,
        foundCycles,
      );
    }

    visited.pop();
  }
}
