import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Geometry, ViewTransform, GeomId, GeometryStyle } from '../types/geometry';

type State = {
  geometries: Geometry[];
  history: Geometry[][]; // Array of previous geometries for Undo
  historyIndex: number;
  view: ViewTransform;
  selectedId: GeomId | null;
};

type Action = 
  | { type: 'ADD_GEOMETRY'; payload: Geometry }
  | { type: 'REMOVE_GEOMETRY'; payload: GeomId }
  | { type: 'SET_GEOMETRIES'; payload: Geometry[] }
  | { type: 'SET_VIEW'; payload: Partial<ViewTransform> }
  | { type: 'SELECT_GEOMETRY'; payload: GeomId | null }
  | { type: 'UPDATE_GEOMETRY_STYLE'; payload: { id: GeomId; style: GeometryStyle } }
  | { type: 'UPDATE_GEOMETRY_LABEL'; payload: { id: GeomId; label: string } }
  | { type: 'UNDO' }
  | { type: 'REDO' };

const initialState: State = {
  geometries: [],
  history: [[]],
  historyIndex: 0,
  view: { x: 0, y: 0, scale: 1 },
  selectedId: null,
};

const getNextPointLabel = (geometries: Geometry[]) => {
  const existingLabels = new Set(
    geometries.filter(g => g.type === 'point' && g.label).map(g => g.label)
  );
  const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  for (const letter of alphabet) {
    if (!existingLabels.has(letter)) return letter;
  }
  let index = 1;
  while (true) {
    const fallback = `P${index}`;
    if (!existingLabels.has(fallback)) return fallback;
    index++;
  }
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_GEOMETRY': {
      const payloadWithSource = { ...action.payload, source: action.payload.source || 'user' } as typeof action.payload;
      
      if (payloadWithSource.type === 'point' && !payloadWithSource.label && payloadWithSource.source === 'user') {
        payloadWithSource.label = getNextPointLabel(state.geometries);
      }

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
        historyIndex: newHistory.length - 1,
        selectedId: state.selectedId === action.payload ? null : state.selectedId,
      };
    }
    case 'SET_GEOMETRIES': {
      return {
        ...state,
        geometries: action.payload,
        history: [action.payload],
        historyIndex: 0,
        selectedId: null,
      };
    }
    case 'SET_VIEW':
      return { ...state, view: { ...state.view, ...action.payload } };
    case 'SELECT_GEOMETRY':
      return { ...state, selectedId: action.payload };
    case 'UPDATE_GEOMETRY_STYLE': {
      const newGeoms = state.geometries.map(g => 
        g.id === action.payload.id ? { ...g, style: { ...g.style, ...action.payload.style } } : g
      );
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newGeoms);
      return {
        ...state,
        geometries: newGeoms,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    }
    case 'UPDATE_GEOMETRY_LABEL': {
      const { id, label } = action.payload;
      const target = state.geometries.find(g => g.id === id);
      if (!target || target.type !== 'point') return state;
      
      const trimmed = label.trim();
      if (!trimmed) return state;

      const isDuplicate = state.geometries.some(g => g.id !== id && g.type === 'point' && g.label === trimmed);
      if (isDuplicate) return state;

      const newGeoms = state.geometries.map(g => 
        g.id === id ? { ...g, label: trimmed } : g
      );
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newGeoms);
      return {
        ...state,
        geometries: newGeoms,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    }
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
