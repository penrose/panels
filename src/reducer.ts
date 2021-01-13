import { PenroseState } from "penrose-web";

export interface PaneState {
  sub: boolean;
  sty: boolean;
  dsl: boolean;
  preview: boolean;
}

export interface CurrentInstance {
  sub: string;
  sty: string;
  dsl: string;
  state: PenroseState | null;
}

export interface State {
  openPanes: PaneState;
  currentInstance: CurrentInstance;
}

export type Action =
  | { kind: "TOGGLE_SUB_PANE" }
  | { kind: "TOGGLE_STY_PANE" }
  | { kind: "TOGGLE_DSL_PANE" }
  | { kind: "TOGGLE_PREVIEW_PANE" }
  | { kind: "CHANGE_SUB"; content: string }
  | { kind: "CHANGE_STY"; content: string }
  | { kind: "CHANGE_DSL"; content: string };

const reducer = (state: State, action: Action): State => {
  switch (action.kind) {
    case "TOGGLE_DSL_PANE":
      return {
        ...state,
        openPanes: { ...state.openPanes, dsl: !state.openPanes.dsl },
      };
    case "TOGGLE_PREVIEW_PANE":
      return {
        ...state,
        openPanes: { ...state.openPanes, preview: !state.openPanes.preview },
      };
    case "TOGGLE_STY_PANE":
      return {
        ...state,
        openPanes: { ...state.openPanes, sty: !state.openPanes.sty },
      };
    case "TOGGLE_SUB_PANE":
      return {
        ...state,
        openPanes: { ...state.openPanes, sub: !state.openPanes.sub },
      };
    case "CHANGE_DSL":
      return {
        ...state,
        currentInstance: { ...state.currentInstance, dsl: action.content },
      };
    case "CHANGE_STY":
      return {
        ...state,
        currentInstance: { ...state.currentInstance, sty: action.content },
      };
    case "CHANGE_SUB":
      return {
        ...state,
        currentInstance: { ...state.currentInstance, sub: action.content },
      };
  }
};

export default reducer;
