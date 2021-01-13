import React, { useCallback, useEffect, useReducer, useState } from "react";
import styled from "styled-components";
import MonacoEditor from "react-monaco-editor";
import reducer from "./reducer";
import { Canvas, Packets, PenroseState, Protocol } from "penrose-web";

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
  height: 40px;
  width: 40px;
  color: #ffffff;
  line-height: 40px;
  background-color: green;
  border-radius: 50%;
`;

const ColumnContainer = styled.div<{ show: boolean; numOpen: number }>`
  display: ${({ show }: any) => (show ? "inline-block" : "none")};
  border-left: 1px solid gray;
  flex: 1;
`;

const socketAddress =
  process.env.NODE_ENV === "production"
    ? "wss://build-api.penrose.ink:8443"
    : "ws://127.0.0.1:9160";

const monacoOptions = {
  automaticLayout: true,
};

function App() {
  const [state, dispatch] = useReducer(reducer, {
    openPanes: { sub: true, sty: false, dsl: false, preview: true },
    currentInstance: { sub: "", sty: "", dsl: "", state: null },
  });
  const [protocol] = useState(
    new Protocol(socketAddress, [
      {
        kind: "editor",
        onCanvasState: (state: PenroseState) =>
          dispatch({ kind: "CHANGE_CANVAS_STATE", content: state }),
        onConnectionStatus: console.log,
        onError: (err: any) => console.log(err),
        onVarEnv: console.log,
        onVersion: console.log,
      },
    ])
  );
  const compileTrio = useCallback(() => {
    const { sub, sty, dsl } = state.currentInstance;
    protocol.sendPacket(Packets.CompileTrio(sub, sty, dsl));
  }, [state, protocol]);
  useEffect(() => {
    protocol.setupSockets();
  }, [protocol]);

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
          <StartButton onClick={compileTrio}>{">"}</StartButton>
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
            >
              <Canvas data={state.currentInstance.state} />
            </div>
          </ColumnContainer>
        </div>
      </div>
    </div>
  );
}

export default App;
