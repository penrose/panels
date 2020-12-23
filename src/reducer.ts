export interface PaneState {
  sub: boolean;
  sty: boolean;
  dsl: boolean;
  preview: boolean;
}
export interface State {
  openPanes: PaneState;
}

export type Action =
  | { kind: "TOGGLE_SUB_PANE" }
  | { kind: "TOGGLE_STY_PANE" }
  | { kind: "TOGGLE_DSL_PANE" }
  | { kind: "TOGGLE_PREVIEW_PANE" };

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
  }
  return state;
};

export default reducer;
