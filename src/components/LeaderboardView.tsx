import React, { useState, useEffect, useMemo } from 'react';
import { LeaderboardRecord } from '../types/leaderboard';

interface LeaderboardViewProps {
  currentStage?: string;
}

export function LeaderboardView({ currentStage = "stage-2" }: LeaderboardViewProps) {
  const [records, setRecords] = useState<LeaderboardRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'today' | 'all-time'>('today');

  useEffect(() => {
    let isMounted = true;
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        // 클라이언트는 /api/leaderboard 만 호출한다
        const res = await fetch('/api/leaderboard');
        if (!res.ok) throw new Error("Failed to fetch leaderboard from server");
        
        const json = await res.json();
        if (json.status !== 'success') {
          throw new Error(json.message || "Unknown error from server");
        }
        
        if (isMounted) {
          setRecords(json.data || []);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "리더보드 데이터를 불러오는데 실패했습니다.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLeaderboard();
    return () => { isMounted = false; };
  }, []);

  // ① [방어] 날짜 필터링은 새로운 Date().toISOString() 방식의 오류 방지를 위해 KST 기준으로 수행
  const toKSTDateString = (date: Date): string => {
    const kst = new Date(date.getTime() + 9 * 3600000);
    return kst.toISOString().split('T')[0];
  };

  const filteredRecords = useMemo(() => {
    const todayKST = toKSTDateString(new Date());
    
    // 프론트 메모리에서 필터링 (서버 재호출 없음)
    const relevantRecords = records.filter(r => {
      if (currentStage && r.stage !== currentStage) return false;
      if (activeTab === 'today') {
        return toKSTDateString(new Date(r.timestamp)) === todayKST;
      }
      return true;
    });

    // ② [방어] 정렬 시 원본 배열 변경 방지: 복사 후 정렬 (elapsedTime 오름차순, 동점 시 timestamp 빠른 순)
    return [...relevantRecords].sort((a, b) => {
      if (a.elapsedTime !== b.elapsedTime) {
        return a.elapsedTime - b.elapsedTime;
      }
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
  }, [records, activeTab, currentStage]);

  // ③ [방어] getRankStyle 반환 타입을 string으로 명시하고 모든 분기에서 반환하여 undefined 추론 방지
  const getRankStyle = (index: number, tab: 'today' | 'all-time'): string => {
    const rank = index + 1;
    if (tab === 'all-time') {
      if (rank === 1) return "bg-yellow-50 border-l-4 border-yellow-400 font-bold";
      if (rank === 2) return "bg-gray-50 border-l-4 border-gray-400 font-bold";
      if (rank === 3) return "bg-orange-50 border-l-4 border-orange-500 font-bold";
      if (rank <= 10) return "bg-blue-50 font-bold";
      return "bg-white text-gray-700";
    } else {
      if (rank <= 3) return "bg-slate-50 font-bold text-slate-900";
      return "bg-white text-gray-700";
    }
  };

  const getMedal = (index: number, tab: 'today' | 'all-time'): string => {
    const rank = index + 1;
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `${rank}위`;
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 flex flex-col gap-4">
      {/* 모바일 최적화: 터치 타겟 최소 44px (min-h-[44px]) */}
      <div className="flex bg-slate-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('today')}
          className={`flex-1 min-h-[44px] flex items-center justify-center rounded-md text-sm font-semibold transition-colors ${
            activeTab === 'today' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'
          }`}
        >
          오늘 리더보드
        </button>
        <button
          onClick={() => setActiveTab('all-time')}
          className={`flex-1 min-h-[44px] flex items-center justify-center rounded-md text-sm font-semibold transition-colors ${
            activeTab === 'all-time' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'
          }`}
        >
          역대 명예의 전당
        </button>
      </div>

      {/* 로딩 중 / 에러 / 데이터 없음 상태 분리 */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center text-sm font-medium">
          {error}
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">
          아직 기록이 없습니다. 첫 번째 기록의 주인공이 되어보세요!
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredRecords.map((record, idx) => (
            <div 
              key={`${record.userName}-${record.timestamp}-${idx}`}
              className={`flex items-center justify-between p-3 rounded-lg shadow-sm border border-slate-100 ${getRankStyle(idx, activeTab)}`}
              style={{ minHeight: '44px' }}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="w-8 text-center flex-shrink-0 text-sm">
                  {getMedal(idx, activeTab)}
                </span>
                {/* 이름 셀: truncate 처리, title 속성으로 전체 툴팁 (break-all 금지) */}
                <span 
                  className="truncate text-sm md:text-base max-w-[120px] md:max-w-[200px]" 
                  title={record.userName}
                >
                  {record.userName}
                </span>
              </div>
              <div className="font-mono text-sm md:text-base flex-shrink-0">
                {record.elapsedTime.toFixed(1)}s
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
