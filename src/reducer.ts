import { PenroseState } from "@penrose/core";
import { debounce } from "lodash";

export interface PaneState {
  sub: boolean;
  sty: boolean;
  dsl: boolean;
  preview: boolean;
}

export interface AuthorshipInfo {
  name: string;
  madeBy: string | null;
  gistID: string | null;
}

export interface CurrentInstance {
  authorship: AuthorshipInfo;
  sub: string;
  sty: string;
  dsl: string;
  state: PenroseState | null;
  err: string | null;
}

export interface ISettings {
  githubToken: string | null;
  vimMode: boolean;
}

export interface State {
  openPanes: PaneState;
  settings: ISettings;
  currentInstance: CurrentInstance;
}

export const initialState = (): State => {
  const fromStorage = window.localStorage.getItem("state");
  console.log("retrieved");
  if (fromStorage !== null) {
    return JSON.parse(fromStorage);
  }
  return {
    openPanes: { sub: true, sty: false, dsl: false, preview: true },
    currentInstance: {
      sub: "",
      sty: "",
      dsl: "",
      state: null,
      err: null,
      authorship: {
        name: "untitled",
        madeBy: null,
        gistID: null,
      },
    },
    settings: { githubToken: null, vimMode: false },
  };
};

export const debouncedSave = debounce((state: State) => {
  const stateWithoutCircular = { ...state };
  delete stateWithoutCircular.currentInstance.state;
  window.localStorage.setItem("state", JSON.stringify(stateWithoutCircular));
}, 250);

export type Action =
  | { kind: "TOGGLE_SUB_PANE" }
  | { kind: "TOGGLE_STY_PANE" }
  | { kind: "TOGGLE_DSL_PANE" }
  | { kind: "TOGGLE_PREVIEW_PANE" }
  | { kind: "CHANGE_SUB"; content: string }
  | { kind: "CHANGE_STY"; content: string }
  | { kind: "CHANGE_DSL"; content: string }
  | { kind: "CHANGE_CANVAS_STATE"; content: PenroseState | null }
  | { kind: "CHANGE_ERROR"; content: string | null }
  | { kind: "CHANGE_TITLE"; name: string };

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
    case "CHANGE_CANVAS_STATE":
      return {
        ...state,
        currentInstance: { ...state.currentInstance, state: action.content },
      };
    case "CHANGE_ERROR":
      return {
        ...state,
        currentInstance: { ...state.currentInstance, err: action.content },
      };
    case "CHANGE_TITLE":
      return {
        ...state,
        currentInstance: {
          ...state.currentInstance,
          authorship: {
            ...state.currentInstance.authorship,
            name: action.name,
          },
        },
      };
  }
};

export default reducer;
