import { GeometryObject, Vec2 } from '../types/mission';
import { Geometry } from '../types/geometry';

export const DISTANCE_EPSILON = 1e-3;
export const ANGLE_EPSILON = 1e-4;

// 점 a, b를 잇는 무한 직선을 (point, direction) 형태로 표준화
export function toInfiniteLine(obj: GeometryObject): { point: Vec2; direction: Vec2 } {
  const p1 = obj.points[0];
  const p2 = obj.points[1];
  const direction = normalize({ x: p2.x - p1.x, y: p2.y - p1.y });
  return { point: p1, direction };
}

// 두 점 사이의 유클리드 거리
export function distance(a: Vec2, b: Vec2): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

// 점 p 에서 무한 직선까지의 수직 거리
export function pointToLineDistance(p: Vec2, line: { point: Vec2; direction: Vec2 }): number {
  const ap = { x: p.x - line.point.x, y: p.y - line.point.y };
  // AP를 직교 벡터에 투영시켜 최소 거리를 구함
  const normal = { x: -line.direction.y, y: line.direction.x };
  return Math.abs(dot(ap, normal));
}

// 점 p 가 무한 직선 위에 있는지 (DISTANCE_EPSILON 이용)
export function isPointOnLine(p: Vec2, line: { point: Vec2; direction: Vec2 }): boolean {
  return pointToLineDistance(p, line) <= DISTANCE_EPSILON;
}

// 두 벡터의 내적
export function dot(v1: Vec2, v2: Vec2): number {
  return v1.x * v2.x + v1.y * v2.y;
}

// 두 벡터의 외적 (2D 스칼라, 공선성 판별용)
export function cross(v1: Vec2, v2: Vec2): number {
  return v1.x * v2.y - v1.y * v2.x;
}

// 벡터 정규화
export function normalize(v: Vec2): Vec2 {
  const len = distance({ x: 0, y: 0 }, v);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

// 두 방향벡터가 이루는 사잇각을 0~π(0~180도) 범위로 반환
// 직선 비교 모드인 경우 예각(0~π/2)으로 보정
export function angleBetweenVectors(v1: Vec2, v2: Vec2, options?: { asUndirectedLine?: boolean }): number {
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  
  let angle = Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
  
  // 방향성이 없는 직선 비교일 경우 항상 π/2 (90도) 이하로 반환
  if (options?.asUndirectedLine) {
    if (angle > Math.PI / 2) {
      angle = Math.PI - angle;
    }
  }
  return angle;
}

// 두 점의 중점
export function midpoint(a: Vec2, b: Vec2): Vec2 {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

// 작도 엔진 상태(Geometry)를 미션 검증용 상태(GeometryObject)로 매핑하는 어댑터
export function mapGeometryToGeometryObject(geom: Geometry): GeometryObject {
  const source = geom.source || 'user';
  const label = geom.label;
  
  switch (geom.type) {
    case 'point':
      return { id: geom.id, type: 'point', points: [geom.pt], source, label };
    case 'line':
      return { id: geom.id, type: 'segment', points: [geom.p1, geom.p2], source, label };
    case 'circle':
      return { id: geom.id, type: 'circle', points: [geom.center], radius: geom.r, source, label };
    case 'arc':
      // The drawing mode only does startAngle/sweepAngle. We map it slightly to standard start/end but keep sweep logic minimal if needed
      return { id: geom.id, type: 'arc', points: [geom.center], radius: geom.r, startAngle: geom.startAngle, endAngle: geom.startAngle + geom.sweepAngle, source, label };
  }
}
