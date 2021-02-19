import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import styled from "styled-components";
import MonacoEditor from "react-monaco-editor";
import reducer from "./reducer";
import {
  compileTrio,
  prepareState,
  RenderInteractive,
  stepUntilConvergence,
} from "@penrose/core";
import dummyRegistry from "./dummy-registry.json";

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

const StartButton = styled.div<{}>`
  outline: none;
  cursor: pointer;
  text-align: center;
  vertical-align: middle;
  user-select: none;
  color: #ffffff;
  line-height: 40px;
  background-color: green;
  border-radius: 5px;
`;

const ColumnContainer = styled.div<{ show: boolean; numOpen: number }>`
  display: ${({ show }: any) => (show ? "inline-block" : "none")};
  border-left: 1px solid gray;
  flex: 1;
`;

const monacoOptions = {
  automaticLayout: true,
  minimap: { enabled: false },
};

function App() {
  const [state, dispatch] = useReducer(reducer, {
    openPanes: { sub: true, sty: false, dsl: false, preview: true },
    currentInstance: { sub: "", sty: "", dsl: "", state: null, err: null },
  });

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const domainReq = await fetch(
        `${dummyRegistry.root}${dummyRegistry.domains["set-theory"].URI}`
      );
      const domain = await domainReq.text();
      dispatch({ kind: "CHANGE_DSL", content: domain });
      const styReq = await fetch(
        `${dummyRegistry.root}${dummyRegistry.styles["venn"].URI}`
      );
      const sty = await styReq.text();
      dispatch({ kind: "CHANGE_STY", content: sty });
      const subReq = await fetch(
        `${dummyRegistry.root}${dummyRegistry.substances["nested"].URI}`
      );
      const sub = await subReq.text();
      dispatch({ kind: "CHANGE_SUB", content: sub });
    })();
  }, [dispatch]);

  const compile = useCallback(() => {
    const { sub, sty, dsl } = state.currentInstance;
    const compileRes = compileTrio(dsl, sub, sty);
    if (compileRes.isOk()) {
      (async () => {
        console.log("pre state");
        const initState = await prepareState(compileRes.value);
        console.log("inited state");
        dispatch({ kind: "CHANGE_CANVAS_STATE", content: initState });
        console.log("pre step");
        const convergedState = stepUntilConvergence(initState);
        console.log("convorged");
        dispatch({ kind: "CHANGE_CANVAS_STATE", content: convergedState });
        const cur = canvasRef.current;
        const rendered = RenderInteractive(convergedState, console.log);
        if (cur) {
          if (cur.firstChild) {
            cur.replaceChild(rendered, cur.firstChild);
          } else {
            cur.appendChild(rendered);
          }
        }
      })();
    } else {
      dispatch({ kind: "CHANGE_ERROR", content: compileRes.error });
    }
  }, [canvasRef, state]);

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
      <nav
        style={{
          display: "flex",
          width: "100%",
          backgroundColor: "#F4F4F4",
          justifyContent: "space-between",
        }}
      >
        <div style={{ alignSelf: "center" }}>
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
        <div>
          <StartButton onClick={compile}>{"compile"}</StartButton>
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
              onChange={(content) => dispatch({ kind: "CHANGE_SUB", content })}
              width={`${window.innerWidth / numOpen}px`}
              options={monacoOptions}
            />
          </ColumnContainer>
          <ColumnContainer show={state.openPanes.sty} numOpen={numOpen}>
            <MonacoEditor
              value={state.currentInstance.sty}
              width={`${window.innerWidth / numOpen}px`}
              onChange={(content) => dispatch({ kind: "CHANGE_STY", content })}
              options={monacoOptions}
            />
          </ColumnContainer>
          <ColumnContainer show={state.openPanes.dsl} numOpen={numOpen}>
            <MonacoEditor
              value={state.currentInstance.dsl}
              onChange={(content) => dispatch({ kind: "CHANGE_DSL", content })}
              width={`${window.innerWidth / numOpen}px`}
              options={monacoOptions}
            />
          </ColumnContainer>
          <ColumnContainer show={state.openPanes.preview} numOpen={numOpen}>
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#f4f4f4",
              }}
              ref={canvasRef}
            />
            {state.currentInstance.err && (
              <div style={{ position: "absolute", bottom: 0 }}>
                {JSON.stringify(state.currentInstance.err)}
              </div>
            )}
          </ColumnContainer>
        </div>
      </div>
    </div>
  );
}

export default App;
