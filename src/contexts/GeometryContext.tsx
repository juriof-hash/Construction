import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Geometry, ViewTransform, GeomId } from '../types/geometry';

type State = {
  geometries: Geometry[];
  history: Geometry[][]; // Array of previous geometries for Undo
  historyIndex: number;
  view: ViewTransform;
};

type Action = 
  | { type: 'ADD_GEOMETRY'; payload: Geometry }
  | { type: 'REMOVE_GEOMETRY'; payload: GeomId }
  | { type: 'SET_GEOMETRIES'; payload: Geometry[] }
  | { type: 'SET_VIEW'; payload: Partial<ViewTransform> }
  | { type: 'UNDO' }
  | { type: 'REDO' };

const initialState: State = {
  geometries: [],
  history: [[]],
  historyIndex: 0,
  view: { x: 0, y: 0, scale: 1 }
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_GEOMETRY': {
      const payloadWithSource = { ...action.payload, source: action.payload.source || 'user' } as typeof action.payload;
      const newGeoms = [...state.geometries, payloadWithSource];
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newGeoms);
      return { 
        ...state, 
        geometries: newGeoms, 
        history: newHistory, 
        historyIndex: newHistory.length - 1 
      };
    }
    case 'REMOVE_GEOMETRY': {
      const newGeoms = state.geometries.filter(g => g.id !== action.payload);
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newGeoms);
      return {
        ...state,
        geometries: newGeoms,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    }
    case 'SET_GEOMETRIES': {
      return {
        ...state,
        geometries: action.payload,
        history: [action.payload],
        historyIndex: 0
      };
    }
    case 'SET_VIEW':
      return { ...state, view: { ...state.view, ...action.payload } };
    case 'UNDO':
      if (state.historyIndex > 0) {
        return { 
          ...state, 
          historyIndex: state.historyIndex - 1, 
          geometries: state.history[state.historyIndex - 1] 
        };
      }
      return state;
    case 'REDO':
      if (state.historyIndex < state.history.length - 1) {
        return { 
          ...state, 
          historyIndex: state.historyIndex + 1, 
          geometries: state.history[state.historyIndex + 1] 
        };
      }
      return state;
    default:
      return state;
  }
};

const GeometryContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export const GeometryProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <GeometryContext.Provider value={{ state, dispatch }}>
      {children}
    </GeometryContext.Provider>
  );
};

export const useGeometry = () => {
  const ctx = useContext(GeometryContext);
  if (!ctx) throw new Error('useGeometry must be used within GeometryProvider');
  return ctx;
};
