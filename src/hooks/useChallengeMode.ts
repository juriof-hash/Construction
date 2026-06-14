import { useReducer, useCallback } from 'react';
import { MissionDefinition, ValidationResult, GeometryObject } from '../types/mission';

type ChallengeState = {
  currentMissionIndex: number;
  lastResult: ValidationResult | null;
  status: 'idle' | 'checking' | 'success' | 'failure';
};

type ChallengeAction = 
  | { type: 'CHECK_ANSWER'; payload: ValidationResult }
  | { type: 'NEXT_MISSION' }
  | { type: 'SET_MISSION'; payload: number }
  | { type: 'RESET' };

const initialState: ChallengeState = {
  currentMissionIndex: 0,
  lastResult: null,
  status: 'idle',
};

function challengeReducer(state: ChallengeState, action: ChallengeAction): ChallengeState {
  switch (action.type) {
    case 'CHECK_ANSWER':
      return {
        ...state,
        lastResult: action.payload,
        status: action.payload.isSuccess ? 'success' : 'failure',
      };
    case 'NEXT_MISSION':
      return {
        ...state,
        currentMissionIndex: state.currentMissionIndex + 1,
        lastResult: null,
        status: 'idle',
      };
    case 'SET_MISSION':
      return {
        ...state,
        currentMissionIndex: action.payload,
        lastResult: null,
        status: 'idle',
      };
    case 'RESET':
      return {
        ...state,
        currentMissionIndex: 0,
        lastResult: null,
        status: 'idle',
      };
    default:
      return state;
  }
}

export function useChallengeMode(missions: MissionDefinition[]) {
  const [state, dispatch] = useReducer(challengeReducer, initialState);

  const checkAnswer = useCallback((objects: GeometryObject[], refs: Record<string, GeometryObject>) => {
    const currentMission = missions[state.currentMissionIndex];
    if (!currentMission) return;
    
    // Call the validation logic
    const result = currentMission.validate(objects, refs);
    dispatch({ type: 'CHECK_ANSWER', payload: result });
  }, [missions, state.currentMissionIndex]);

  const nextMission = useCallback(() => {
    dispatch({ type: 'NEXT_MISSION' });
  }, []);

  const gotoMission = useCallback((index: number) => {
    dispatch({ type: 'SET_MISSION', payload: index });
  }, []);

  const resetChallenge = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    state,
    currentMission: missions[state.currentMissionIndex],
    isLastMission: state.currentMissionIndex === missions.length - 1,
    checkAnswer,
    nextMission,
    gotoMission,
    resetChallenge,
  };
}
