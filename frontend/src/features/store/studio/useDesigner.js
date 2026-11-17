import { useCallback, useEffect, useMemo, useReducer } from "react";
import { duplicateLayer, emptyDoc } from "../../../lib/tee/model";
import { fitInArea } from "../../../lib/tee/render";

/** Every layer kept inside the print area (also repairs older drafts). */
const fitDoc = (doc) => ({ ...doc, front: doc.front.map(fitInArea), back: doc.back.map(fitInArea) });

/**
 * Studio state: the design document, the side being edited, the selection,
 * and undo/redo history.
 *
 * - `commit` records a history step. Rapid edits to the same thing (typing,
 *   dragging a slider) share one step via a `coalesce` key.
 * - Drags call `live` (no history) between `begin` and `end`, so one drag is
 *   one undo step however many frames it took.
 * - The draft is kept on this device, so a refresh or sign-in loses nothing.
 */
const DRAFT_KEY = "planet.studio.draft";
const HISTORY_LIMIT = 80;
const COALESCE_MS = 900;

const loadDraft = () => {
  try {
    const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
    if (draft && Array.isArray(draft.front) && Array.isArray(draft.back)) return fitDoc(draft);
  } catch {
    /* corrupt or blocked storage: start fresh */
  }
  return null;
};

const initial = () => ({
  doc: loadDraft() || emptyDoc(),
  side: "front",
  selectedId: null,
  past: [],
  future: [],
  coalesceKey: null,
  coalesceAt: 0,
  gesture: null,
});

const pushHistory = (state, nextDoc, key) => {
  if (nextDoc === state.doc) return state;
  const now = Date.now();
  const merge = key && key === state.coalesceKey && now - state.coalesceAt < COALESCE_MS;
  return {
    ...state,
    doc: nextDoc,
    past: merge ? state.past : [...state.past, state.doc].slice(-HISTORY_LIMIT),
    future: [],
    coalesceKey: key || null,
    coalesceAt: now,
  };
};

const reducer = (state, action) => {
  switch (action.type) {
    case "commit":
      return pushHistory(state, action.fn(state.doc, state), action.coalesce);
    case "live":
      return { ...state, doc: action.fn(state.doc, state) };
    case "begin":
      return { ...state, gesture: state.doc };
    case "end": {
      if (!state.gesture || state.gesture === state.doc) return { ...state, gesture: null };
      return {
        ...state,
        past: [...state.past, state.gesture].slice(-HISTORY_LIMIT),
        future: [],
        gesture: null,
        coalesceKey: null,
      };
    }
    case "undo": {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return { ...state, doc: previous, past: state.past.slice(0, -1), future: [state.doc, ...state.future], coalesceKey: null };
    }
    case "redo": {
      if (state.future.length === 0) return state;
      const [next, ...rest] = state.future;
      return { ...state, doc: next, past: [...state.past, state.doc], future: rest, coalesceKey: null };
    }
    case "side":
      return { ...state, side: action.side, selectedId: null };
    case "select":
      return { ...state, selectedId: action.id };
    default:
      return state;
  }
};

/** Applies `fn` to the layers of one side. */
const onSide = (doc, side, fn) => ({ ...doc, [side]: fn(doc[side]) });

export const useDesigner = () => {
  const [state, dispatch] = useReducer(reducer, undefined, initial);
  const { doc, side, selectedId } = state;

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(doc));
      } catch {
        // Too big for storage (large photos) or storage blocked: the design still works.
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [doc]);

  const layers = doc[side];
  const selected = useMemo(() => layers.find((layer) => layer.id === selectedId) || null, [layers, selectedId]);

  const commit = useCallback((fn, coalesce) => dispatch({ type: "commit", fn, coalesce }), []);
  const live = useCallback((fn) => dispatch({ type: "live", fn }), []);

  const updateLayer = useCallback(
    (id, patch, { coalesce, liveOnly } = {}) => {
      const fn = (current, s) =>
        onSide(current, s.side, (list) => list.map((layer) => (layer.id === id ? fitInArea({ ...layer, ...(typeof patch === "function" ? patch(layer) : patch) }) : layer)));
      if (liveOnly) live(fn);
      else commit(fn, coalesce ? `${id}:${coalesce}` : undefined);
    },
    [commit, live]
  );

  const addLayer = useCallback(
    (raw) => {
      // Never drop a new element exactly on top of another: step it down-right.
      let placed = raw;
      for (let i = 0; i < 8 && layers.some((other) => Math.abs(other.x - placed.x) < 6 && Math.abs(other.y - placed.y) < 6); i++) {
        placed = { ...placed, x: placed.x + 22, y: placed.y + 22 };
      }
      const layer = fitInArea(placed);
      commit((current, s) => onSide(current, s.side, (list) => [...list, layer]));
      dispatch({ type: "select", id: layer.id });
    },
    [commit, layers]
  );

  const removeLayer = useCallback(
    (id) => {
      commit((current, s) => onSide(current, s.side, (list) => list.filter((layer) => layer.id !== id)));
      dispatch({ type: "select", id: null });
    },
    [commit]
  );

  const duplicate = useCallback(
    (id) => {
      const source = layers.find((layer) => layer.id === id);
      if (!source) return;
      const copy = fitInArea(duplicateLayer(source));
      commit((current, s) => onSide(current, s.side, (list) => [...list, copy]));
      dispatch({ type: "select", id: copy.id });
    },
    [commit, layers]
  );

  /** Moves a layer up (+1) or down (-1) the stack, or to the very top/bottom (±Infinity). */
  const reorder = useCallback(
    (id, step) =>
      commit((current, s) =>
        onSide(current, s.side, (list) => {
          const index = list.findIndex((layer) => layer.id === id);
          if (index === -1) return list;
          const target = Math.max(0, Math.min(list.length - 1, Number.isFinite(step) ? index + step : step > 0 ? list.length - 1 : 0));
          if (target === index) return list;
          const next = [...list];
          const [item] = next.splice(index, 1);
          next.splice(target, 0, item);
          return next;
        })
      ),
    [commit]
  );

  /** Changes the shirt colour; `mapLayer` can adjust layers too (e.g. swap ink that would vanish). */
  const setColor = useCallback(
    (color, mapLayer) =>
      commit((current) => ({
        ...current,
        color,
        ...(mapLayer ? { front: current.front.map(mapLayer), back: current.back.map(mapLayer) } : {}),
      })),
    [commit]
  );
  const setName = useCallback((name) => commit((current) => ({ ...current, name }), "name"), [commit]);
  const replaceSide = useCallback((target, list) => commit((current) => ({ ...current, [target]: list.map(fitInArea) })), [commit]);
  const loadDoc = useCallback((next) => {
    commit(() => fitDoc(next));
    dispatch({ type: "side", side: "front" });
  }, [commit]);

  return {
    doc,
    side,
    layers,
    selected,
    selectedId,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    setSide: (next) => dispatch({ type: "side", side: next }),
    select: (id) => dispatch({ type: "select", id }),
    undo: () => dispatch({ type: "undo" }),
    redo: () => dispatch({ type: "redo" }),
    begin: () => dispatch({ type: "begin" }),
    end: () => dispatch({ type: "end" }),
    updateLayer,
    addLayer,
    removeLayer,
    duplicate,
    reorder,
    setColor,
    setName,
    replaceSide,
    loadDoc,
  };
};

export default useDesigner;
