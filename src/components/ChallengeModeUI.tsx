import React, { useMemo, useEffect, useRef, useState } from "react";
import { useChallengeMode } from "../hooks/useChallengeMode";
import { MISSIONS } from "../missions";
import { useGeometry } from "../contexts/GeometryContext";
import { GeometryObject } from "../types/mission";
import { Geometry } from "../types/geometry";
import { mapGeometryToGeometryObject } from "../utils/challengeGeometry";
import { FeedbackPanel } from "./FeedbackPanel";
import { Target, ArrowRight, RotateCcw, Clock, Circle } from "lucide-react";
import { motion } from "motion/react";

const computeGeomsAABB = (geoms: Geometry[]) => {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  geoms.forEach((g) => {
    if (g.type === "point") {
      minX = Math.min(minX, g.pt.x);
      minY = Math.min(minY, g.pt.y);
      maxX = Math.max(maxX, g.pt.x);
      maxY = Math.max(maxY, g.pt.y);
    } else if (g.type === "line") {
      minX = Math.min(minX, g.p1.x, g.p2.x);
      minY = Math.min(minY, g.p1.y, g.p2.y);
      maxX = Math.max(maxX, g.p1.x, g.p2.x);
      maxY = Math.max(maxY, g.p1.y, g.p2.y);
    } else if (g.type === "circle" || g.type === "arc") {
      minX = Math.min(minX, g.center.x - g.r);
      minY = Math.min(minY, g.center.y - g.r);
      maxX = Math.max(maxX, g.center.x + g.r);
      maxY = Math.max(maxY, g.center.y + g.r);
    }
  });
  if (minX === Infinity) return null;
  return { minX, minY, maxX, maxY };
};

export const ChallengeModeUI: React.FC = () => {
  const {
    state,
    currentMission,
    isLastMission,
    checkAnswer,
    nextMission,
    gotoMission,
    resetChallenge,
  } = useChallengeMode(MISSIONS);
  const { state: geomState, dispatch: geomDispatch } = useGeometry();

  const [elapsedSec, setElapsedSec] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (currentMission && currentMission.initialGeometries) {
      const geoms = currentMission.initialGeometries();
      geomDispatch({ type: "SET_GEOMETRIES", payload: geoms });

      setElapsedSec(0);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setElapsedSec((prev) => prev + 1);
      }, 1000);

      const aabb = computeGeomsAABB(geoms);
      if (aabb) {
        const cx = (aabb.minX + aabb.maxX) / 2;
        const cy = (aabb.minY + aabb.maxY) / 2;
        const scale = 1;
        const viewW = window.innerWidth / scale;
        const viewH = window.innerHeight / scale;
        const vx = cx - viewW / 2;
        const vy = cy - viewH / 2;
        geomDispatch({ type: "SET_VIEW", payload: { x: vx, y: vy, scale } });
      }
    } else {
      geomDispatch({ type: "SET_GEOMETRIES", payload: [] });
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentMission, geomDispatch, state.currentMissionIndex]);

  // Pause timer on success
  useEffect(() => {
    if (state.status === "success" && timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [state.status]);

  const compassCount = geomState.geometries.filter(
    (g) => (g.type === "circle" || g.type === "arc") && g.source === "user",
  ).length;

  const handleCheck = () => {
    const objects: GeometryObject[] = geomState.geometries.map(
      mapGeometryToGeometryObject,
    );

    const refMap: Record<string, GeometryObject> = {};
    if (currentMission) {
      for (const [key, label] of Object.entries(
        currentMission.referenceLabels,
      )) {
        const found = objects.find(
          (o) => o.label === label && o.source === "initial",
        );
        if (found) {
          refMap[key] = found;
        }
      }
    }

    checkAnswer(objects, refMap, {
      elapsedTimeSec: elapsedSec,
      compassCount: compassCount,
    });
  };

  if (!currentMission) {
    return (
      <motion.div
        drag
        dragMomentum={false}
        className="absolute left-6 top-6 w-80 bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-slate-200/60 p-6 z-20 cursor-move"
      >
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          모든 미션 완료!
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          도전 모드의 모든 단계를 마스터하셨습니다.
        </p>
        <button
          onClick={resetChallenge}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors cursor-pointer"
        >
          <RotateCcw size={18} /> 시작으로 돌아가기
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      className="absolute left-6 top-6 w-96 bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-slate-200/60 p-5 z-20 flex flex-col pointer-events-auto cursor-drag"
    >
      <div className="flex items-center gap-2 mb-3 cursor-move">
        <select
          className="bg-blue-100/50 hover:bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold tracking-wide border-none outline-none cursor-pointer appearance-none"
          value={state.currentMissionIndex}
          onChange={(e) => gotoMission(Number(e.target.value))}
        >
          {MISSIONS.map((m, i) => (
            <option key={m.id} value={i}>
              {m.title}
            </option>
          ))}
        </select>
        <div className="text-slate-400 text-sm font-medium">
          {state.currentMissionIndex + 1} / {MISSIONS.length}
        </div>
      </div>

      <h2 className="text-lg font-bold text-slate-800 mb-2 cursor-move">
        {currentMission.title}
      </h2>
      <p className="text-sm text-slate-600 leading-relaxed mb-4 cursor-move">
        {currentMission.description}
      </p>

      <div className="flex items-center gap-4 mb-5 border-t border-b border-slate-100 py-3 bg-slate-50/50 px-2">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">
            <span
              className={
                elapsedSec > currentMission.targetTimeSec ? "text-red-500" : ""
              }
            >
              {elapsedSec}s
            </span>{" "}
            / {currentMission.targetTimeSec}s
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <Circle className="w-4 h-4" />
          <span className="text-sm font-medium">
            <span
              className={
                compassCount > currentMission.optimalCompassCount
                  ? "text-red-500"
                  : ""
              }
            >
              {compassCount}회
            </span>{" "}
            / {currentMission.optimalCompassCount}회
          </span>
        </div>
      </div>

      {state.status !== "success" ? (
        <button
          onClick={handleCheck}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-xl transition-colors cursor-pointer"
        >
          <Target size={18} /> 정답 확인
        </button>
      ) : (
        <button
          onClick={isLastMission ? resetChallenge : nextMission}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors cursor-pointer"
        >
          {isLastMission ? (
            <>
              <RotateCcw size={18} /> 처음부터 다시
            </>
          ) : (
            <>
              다음 미션 <ArrowRight size={18} />
            </>
          )}
        </button>
      )}

      <FeedbackPanel result={state.lastResult} />
    </motion.div>
  );
};
