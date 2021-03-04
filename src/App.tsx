import React, { useCallback, useEffect, useReducer, useRef } from "react";
import styled from "styled-components";
import { ToastContainer } from "react-toastify";
import MonacoEditor from "@monaco-editor/react";
import { editor } from "monaco-editor";
import "react-toastify/dist/ReactToastify.css";
import reducer, { debouncedSave, initialState } from "./reducer";
import {
  compileTrio,
  PenroseState,
  prepareState,
  RenderInteractive,
  RenderStatic,
  resample,
  showError,
  stepUntilConvergence,
} from "@penrose/core";
import { DownloadSVG, retrieveGist, usePublishGist } from "./Util";
import AuthorshipTitle from "./components/AuthorshipTitle";
import BlueButton from "./components/BlueButton";
import { useParams } from "react-router-dom";

const TabButton = styled.a<{ open: boolean }>`
  outline: none;
  cursor: pointer;
  background-color: ${({ open }: any) => (open ? "#EDF8FF" : "#FBFBFB")};
  font-weight: ${({ open }: any) => (open ? "bold" : "500")};
  border: 1px solid #a9a9a9;
  font-size: 1em;
  padding: 10px 10px 5px 10px;
  margin-left: -1px;
  text-align: center;
  vertical-align: middle;
  user-select: none;
`;

const ColumnContainer = styled.div<{ show: boolean; numOpen: number }>`
  display: ${({ show }: any) => (show ? "inline-block" : "none")};
  position: relative;
  border-left: 1px solid gray;
  flex: 1;
`;

const monacoOptions: editor.IStandaloneEditorConstructionOptions = {
  automaticLayout: true,
  minimap: { enabled: false },
  wordWrap: "on",
};

function App({ location }: any) {
  const [state, dispatch] = useReducer(reducer, null, initialState);

  useEffect(() => {
    debouncedSave(state);
  }, [state]);
  const urlParams = useParams() as any;
  useEffect(() => {
    if (urlParams.gistId) {
      retrieveGist(urlParams.gistId, dispatch);
    }
  }, [urlParams, dispatch]);
  useEffect(() => {
    if (location.state && location.state.authed) {
      const params = new URLSearchParams(location.state.params);
      const username = params.get("profile[login]");
      const access_token = params.get("access_token");
      const avatar = params.get("profile[avatar_url]");
      if (username !== null && access_token !== null && avatar !== null) {
        dispatch({
          kind: "CHANGE_GH_USER",
          user: {
            username,
            access_token,
            avatar,
          },
        });
      }
    }
  }, [location, dispatch]);

  const canvasRef = useRef<HTMLDivElement>(null);

  const convergeRenderState = useCallback(
    (state: PenroseState) => {
      dispatch({ kind: "CHANGE_CANVAS_STATE", content: state });
      const convergedState = stepUntilConvergence(state);
      dispatch({ kind: "CHANGE_CANVAS_STATE", content: convergedState });
      const cur = canvasRef.current;
      const rendered = RenderInteractive(convergedState, convergeRenderState);
      if (cur) {
        if (cur.firstChild) {
          cur.replaceChild(rendered, cur.firstChild);
        } else {
          cur.appendChild(rendered);
        }
      }
    },
    [dispatch, canvasRef]
  );

  const compile = useCallback(() => {
    const { sub, sty, dsl } = state.currentInstance;
    const compileRes = compileTrio(dsl, sub, sty);
    if (compileRes.isOk()) {
      dispatch({ kind: "CHANGE_ERROR", content: null });
      (async () => {
        const initState = await prepareState(compileRes.value);
        convergeRenderState(initState);
      })();
    } else {
      dispatch({ kind: "CHANGE_ERROR", content: compileRes.error });
    }
  }, [state, convergeRenderState]);

  const onResample = useCallback(() => {
    const NUM_SAMPLES = 1;
    if (state.currentInstance.state) {
      const resampled = resample(state.currentInstance.state, NUM_SAMPLES);
      convergeRenderState(resampled);
    }
  }, [state, convergeRenderState]);

  const svg = useCallback(() => {
    if (state.currentInstance.state) {
      const rendered = RenderStatic(state.currentInstance.state);
      DownloadSVG(rendered);
    }
  }, [state]);

  const onChangeTitle = useCallback(
    (name: string) => {
      dispatch({ kind: "CHANGE_TITLE", name });
    },
    [dispatch]
  );

  const onPublish = usePublishGist(state, dispatch);

  const numOpen = Object.values(state.openPanes).filter((open) => open).length;

  return (
    <div
      className="App"
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ToastContainer position="bottom-left" />
      <nav
        style={{
          display: "flex",
          width: "100%",
          backgroundColor: "#F4F4F4",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px",
          boxSizing: "border-box",
        }}
      >
        <AuthorshipTitle
          authorship={state.currentInstance.authorship}
          myUser={state.settings.githubUser}
          onPublish={onPublish}
          onChangeTitle={onChangeTitle}
        />
        <div style={{}}>
          <TabButton
            role="button"
            open={state.openPanes.sub}
            style={{ borderRadius: "5px 0px 0px 5px" }}
            onClick={() => dispatch({ kind: "TOGGLE_SUB_PANE" })}
          >
            sub
          </TabButton>
          <TabButton
            role="button"
            open={state.openPanes.sty}
            onClick={() => dispatch({ kind: "TOGGLE_STY_PANE" })}
          >
            sty
          </TabButton>
          <TabButton
            role="button"
            open={state.openPanes.dsl}
            onClick={() => dispatch({ kind: "TOGGLE_DSL_PANE" })}
          >
            dsl
          </TabButton>
          <TabButton
            role="button"
            open={state.openPanes.preview}
            style={{ borderRadius: "0px 5px 5px 0px" }}
            onClick={() => dispatch({ kind: "TOGGLE_PREVIEW_PANE" })}
          >
            👁️
          </TabButton>
        </div>
        <div style={{}}>
          <BlueButton onClick={compile}>{"compile"}</BlueButton>
        </div>
      </nav>
      <div style={{ display: "flex", flexGrow: 1, flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            height: "100%",
          }}
        >
          <ColumnContainer show={state.openPanes.sub} numOpen={numOpen}>
            <MonacoEditor
              value={state.currentInstance.sub}
              onChange={(content) =>
                dispatch({
                  kind: "CHANGE_CODE",
                  lang: "sub",
                  content: content as string,
                })
              }
              width={`${window.innerWidth / numOpen}px`}
              options={monacoOptions}
            />
          </ColumnContainer>
          <ColumnContainer show={state.openPanes.sty} numOpen={numOpen}>
            <MonacoEditor
              value={state.currentInstance.sty}
              width={`${window.innerWidth / numOpen}px`}
              onChange={(content) =>
                dispatch({
                  kind: "CHANGE_CODE",
                  lang: "sty",
                  content: content as string,
                })
              }
              options={monacoOptions}
            />
          </ColumnContainer>
          <ColumnContainer show={state.openPanes.dsl} numOpen={numOpen}>
            <MonacoEditor
              value={state.currentInstance.dsl}
              onChange={(content) =>
                dispatch({
                  kind: "CHANGE_CODE",
                  lang: "dsl",
                  content: content as string,
                })
              }
              width={`${window.innerWidth / numOpen}px`}
              options={monacoOptions}
            />
          </ColumnContainer>
          <ColumnContainer show={state.openPanes.preview} numOpen={numOpen}>
            <div
              style={{
                position: "absolute",
                padding: "1em",
                right: 0,
                display: "flex",
              }}
            >
              <BlueButton onClick={onResample}>resample</BlueButton>
              <BlueButton onClick={svg}>SVG</BlueButton>
            </div>
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#ffffff",
              }}
              ref={canvasRef}
            />
            {state.currentInstance.err && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  backgroundColor: "#ffdada",
                  maxHeight: "400px",
                  maxWidth: "100%",
                  overflow: "auto",
                  padding: "10px",
                  boxSizing: "border-box",
                }}
              >
                <pre>{showError(state.currentInstance.err).toString()}</pre>
              </div>
            )}
          </ColumnContainer>
        </div>
      </div>
    </div>
  );
}

export default App;
