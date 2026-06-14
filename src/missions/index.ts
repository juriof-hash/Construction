import { MissionDefinition } from '../types/mission';
import { validateMission1 } from './mission1';
import { validateMission2 } from './mission2';
import { validateMission3 } from './mission3';
import { validateMission4 } from './mission4';
import { validateMission5 } from './mission5';
import { validateMission6 } from './mission6';

const r = (min: number, max: number) => Math.random() * (max - min) + min;

export const MISSIONS: MissionDefinition[] = [
  {
    id: 'mission-1',
    stage: 1,
    title: '크기가 같은 선분',
    description: '점 C에서 시작하여, 주어진 선분 AB와 길이가 같은 선분을 작도하세요.',
    referenceLabels: { 'C': 'C', 'AB': 'AB' },
    validate: validateMission1,
    initialGeometries: () => {
      const ax = r(0, 100), ay = r(-150, -50);
      const bx = r(0, 100), by = ax + r(50, 150);
      const cx = r(-150, -50), cy = r(-50, 50);
      return [
        { id: 'ref-C', type: 'point', pt: { x: cx, y: cy }, source: 'initial', label: 'C' },
        { id: 'ref-A', type: 'point', pt: { x: ax, y: ay }, source: 'initial', label: 'A' },
        { id: 'ref-B', type: 'point', pt: { x: bx, y: by }, source: 'initial', label: 'B' },
        { id: 'ref-AB', type: 'line', p1: { x: ax, y: ay }, p2: { x: bx, y: by }, source: 'initial', label: 'AB' }
      ];
    }
  },
  {
    id: 'mission-2',
    stage: 1,
    title: '크기가 같은 각',
    description: '주어진 각 ABC와 크기가 같은 각을 반직선 DE 위에서 점 D를 꼭짓점으로 하여 작도하세요.',
    referenceLabels: { 'D': 'D', 'DE': 'DE', 'BA': 'BA', 'BC': 'BC' },
    validate: validateMission2,
    initialGeometries: () => {
      const bx = r(-200, -100), by = r(-50, 50);
      const ax = bx + r(50, 120), ay = by + r(-120, -50);
      const cx = bx + r(50, 120), cy = by + r(50, 120);
      const dx = r(0, 100), dy = r(-50, 50);
      const ex = dx + r(100, 180), ey = dy + r(-30, 30);
      return [
        { id: 'ref-B', type: 'point', pt: { x: bx, y: by }, source: 'initial', label: 'B' },
        { id: 'ref-A', type: 'point', pt: { x: ax, y: ay }, source: 'initial', label: 'A' },
        { id: 'ref-C', type: 'point', pt: { x: cx, y: cy }, source: 'initial', label: 'C' },
        { id: 'ref-BA', type: 'line', p1: { x: bx, y: by }, p2: { x: ax, y: ay }, source: 'initial', label: 'BA' },
        { id: 'ref-BC', type: 'line', p1: { x: bx, y: by }, p2: { x: cx, y: cy }, source: 'initial', label: 'BC' },
        { id: 'ref-D', type: 'point', pt: { x: dx, y: dy }, source: 'initial', label: 'D' },
        { id: 'ref-DE', type: 'line', p1: { x: dx, y: dy }, p2: { x: ex, y: ey }, source: 'initial', label: 'DE' },
      ];
    }
  },
  {
    id: 'mission-3',
    stage: 2,
    title: '수직이등분선 작도',
    description: '주어진 선분 AB의 수직이등분선을 작도하세요.',
    referenceLabels: { 'AB': 'AB' },
    validate: validateMission3,
    initialGeometries: () => {
      const ax = r(-150, -50), ay = r(-50, 50);
      const bx = ax + r(100, 200), by = ay + r(-50, 50);
      return [
        { id: 'ref-A', type: 'point', pt: { x: ax, y: ay }, source: 'initial', label: 'A' },
        { id: 'ref-B', type: 'point', pt: { x: bx, y: by }, source: 'initial', label: 'B' },
        { id: 'ref-AB', type: 'line', p1: { x: ax, y: ay }, p2: { x: bx, y: by }, source: 'initial', label: 'AB' }
      ];
    }
  },
  {
    id: 'mission-4',
    stage: 2,
    title: '각의 이등분선 작도',
    description: '주어진 각 ABC의 이등분선을 작도하세요.',
    referenceLabels: { 'B': 'B', 'BA': 'BA', 'BC': 'BC' },
    validate: validateMission4,
    initialGeometries: () => {
      const bx = r(-80, 0), by = r(-50, 50);
      const ax = bx + r(-100, -50), ay = by + r(-120, -50);
      const cx = bx + r(100, 150), cy = by + r(-30, 50);
      return [
        { id: 'ref-B', type: 'point', pt: { x: bx, y: by }, source: 'initial', label: 'B' },
        { id: 'ref-A', type: 'point', pt: { x: ax, y: ay }, source: 'initial', label: 'A' },
        { id: 'ref-C', type: 'point', pt: { x: cx, y: cy }, source: 'initial', label: 'C' },
        { id: 'ref-BA', type: 'line', p1: { x: bx, y: by }, p2: { x: ax, y: ay }, source: 'initial', label: 'BA' },
        { id: 'ref-BC', type: 'line', p1: { x: bx, y: by }, p2: { x: cx, y: cy }, source: 'initial', label: 'BC' }
      ];
    }
  },
  {
    id: 'mission-5',
    stage: 3,
    title: '외부의 점에서 수선 작도',
    description: '직선 밖의 점 P에서 직선 l에 내린 수선을 작도하세요.',
    referenceLabels: { 'P': 'P', 'L': 'L' },
    validate: validateMission5,
    initialGeometries: () => {
      const py = r(-150, -80);
      const px = r(-50, 50);
      const lineY = r(0, 100);
      const angle = r(-0.2, 0.2); // slight tilt
      const dx = 200 * Math.cos(angle);
      const dy = 200 * Math.sin(angle);
      return [
        { id: 'ref-P', type: 'point', pt: { x: px, y: py }, source: 'initial', label: 'P' },
        { id: 'ref-L', type: 'line', p1: { x: px - dx, y: lineY - dy }, p2: { x: px + dx, y: lineY + dy }, source: 'initial', label: 'L' }
      ];
    }
  },
  {
    id: 'mission-6',
    stage: 3,
    title: '직선 위의 점에서 수선 작도',
    description: '직선 l 위의 점 P를 지나는 수선을 작도하세요.',
    referenceLabels: { 'P': 'P', 'L': 'L' },
    validate: validateMission6,
    initialGeometries: () => {
      const py = r(-20, 20);
      const px = r(-50, 50);
      const angle = r(-0.2, 0.2); // slight tilt
      const dx = 200 * Math.cos(angle);
      const dy = 200 * Math.sin(angle);
      return [
        { id: 'ref-L', type: 'line', p1: { x: px - dx, y: py - dy }, p2: { x: px + dx, y: py + dy }, source: 'initial', label: 'L' },
        { id: 'ref-P', type: 'point', pt: { x: px, y: py }, source: 'initial', label: 'P' }
      ];
    }
  }
];
