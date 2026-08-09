import React, { useMemo, useEffect, useRef, useState } from "react";
import { useChallengeMode } from "../hooks/useChallengeMode";
import { MISSIONS } from "../missions";
import { useGeometry } from "../contexts/GeometryContext";
import { GeometryObject } from "../types/mission";
import { Geometry } from "../types/geometry";
import { getDailySeed } from "../utils/randomUtils";
import { mapGeometryToGeometryObject } from "../utils/challengeGeometry";
import { FeedbackPanel } from "./FeedbackPanel";
import { Target, ArrowRight, RotateCcw, Clock, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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
  const [isExpanded, setIsExpanded] = useState(true);
  const expandTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (currentMission) {
      setIsExpanded(true);
      if (expandTimeoutRef.current) clearTimeout(expandTimeoutRef.current);
      expandTimeoutRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, 3000);
    }
    return () => {
      if (expandTimeoutRef.current) clearTimeout(expandTimeoutRef.current);
    };
  }, [currentMission?.id, state.currentMissionIndex]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [userName, setUserName] = useState(() => {
    try {
      return localStorage.getItem("userName") || "";
    } catch (e) {
      return "";
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (currentMission && currentMission.initialGeometries) {
      const geoms = currentMission.initialGeometries();
      geomDispatch({ type: "SET_GEOMETRIES", payload: geoms });

      setElapsedSec(0);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setElapsedSec((prev) => +(prev + 0.1).toFixed(1));
      }, 100);

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

    setSubmitSuccess(false);

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
        currentMission.referenceLabels || {},
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

  const handleSubmitScore = async () => {
    if (!userName.trim()) return;
    try {
      localStorage.setItem("userName", userName);
    } catch (e) {
      console.warn("localStorage disabled");
    }
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError("");

    try {
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // timestamp will be generated by the server/GAS if not specified
        body: JSON.stringify({
          stage: currentMission?.id,
          elapsedTime: elapsedSec,
          userName: userName.trim(),
        }),
      });
      const json = await res.json();
      if (json.status === "success") {
        setSubmitSuccess(true);
      } else {
        setSubmitError("기록 저장에 실패했습니다. " + (json.message || ""));
      }
    } catch (e: any) {
      setSubmitError("기록 저장 중 오류가 발생했습니다. " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentMission) {
    return (
      <motion.div
        drag
        dragMomentum={false}
        className="absolute left-0 right-0 mx-auto top-20 md:top-24 md:left-6 md:right-auto md:mx-0 w-[calc(100vw-2rem)] md:w-80 bg-white/5 backdrop-blur rounded-2xl shadow-xl border border-slate-200/60 p-5 md:p-6 z-20 cursor-move"
      >
        <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-2">
          모든 미션 완료!
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          도전 모드의 모든 단계를 마스터하셨습니다.
        </p>
        <button
          onClick={resetChallenge}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 md:py-2.5 rounded-xl transition-colors cursor-pointer"
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
      className="absolute left-0 right-0 mx-auto top-20 md:top-24 md:left-6 md:right-auto md:mx-0 w-[calc(100vw-2rem)] md:w-96 bg-white/10 backdrop-blur rounded-2xl shadow-xl border border-slate-200/60 p-4 md:p-5 z-20 flex flex-col pointer-events-auto cursor-drag"
    >
      <div className="flex items-center justify-between mb-3 cursor-move">
        <div className="relative flex items-center">
          <select
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            value={state.currentMissionIndex}
            onChange={(e) => gotoMission(Number(e.target.value))}
          >
            {MISSIONS.map((m, i) => (
              <option key={m.id} value={i}>
                {m.title}
              </option>
            ))}
          </select>
          <div className="bg-blue-100/50 hover:bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-md text-xs font-bold tracking-wide pointer-events-none flex items-center gap-1 shadow-sm">
            다른 미션에 도전하세요! <span className="opacity-70 text-[10px]">▼</span>
          </div>
        </div>
        
        {/* Timer is always visible */}
        <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-bold tracking-tight">
            <span
              className={
                elapsedSec > currentMission.targetTimeSec ? "text-red-500" : ""
              }
            >
              {elapsedSec.toFixed(1)}
            </span>
            <span className="text-slate-400 text-xs mx-0.5">/</span>
            <span className="text-slate-500">{currentMission.targetTimeSec}s</span>
          </span>
        </div>
      </div>

      <div 
        className="flex items-center justify-between cursor-pointer group mb-1 py-1"
        onClick={() => {
          setIsExpanded(!isExpanded);
          if (expandTimeoutRef.current) clearTimeout(expandTimeoutRef.current);
        }}
      >
        <h2 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
          {currentMission.title}
        </h2>
        {isExpanded ? <ChevronUp size={20} className="text-slate-400 group-hover:text-blue-500 transition-colors" /> : <ChevronDown size={20} className="text-slate-400 group-hover:text-blue-500 transition-colors" />}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              {currentMission.description}
            </p>

            <div className="flex items-center gap-4 mb-5 border-t border-b border-slate-100 py-3 bg-slate-50/50 px-2">
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

          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-2">
        {state.status !== "success" ? (
          <button
            onClick={handleCheck}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-xl transition-colors cursor-pointer mt-2"
          >
            <Target size={18} /> 정답 확인
          </button>
        ) : (
          <div className="flex flex-col gap-3 mt-2">
            {!submitSuccess ? (
              <div className="flex flex-col gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <label className="text-xs font-semibold text-blue-800">
                  명예의 전당 등록
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="이름을 입력하세요"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    maxLength={20}
                    className="flex-1 px-3 py-1.5 text-sm border border-blue-200 rounded-lg outline-none focus:border-blue-400 bg-white"
                  />
                  <button
                    onClick={handleSubmitScore}
                    disabled={isSubmitting || !userName.trim()}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {isSubmitting ? "저장 중..." : "기록 등록"}
                  </button>
                </div>
                {submitError && (
                  <div className="text-red-500 text-xs mt-1">{submitError}</div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-center text-sm font-medium text-green-700">
                🎉 훌륭합니다! 명예의 전당에 기록이 저장되었습니다.
              </div>
            )}
            <button
              onClick={isLastMission ? resetChallenge : nextMission}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-medium py-2.5 rounded-xl transition-colors cursor-pointer"
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
          </div>
        )}
        <FeedbackPanel result={state.lastResult} />
        <div className="mt-2 text-right">
          <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            Seed: {getDailySeed()}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
