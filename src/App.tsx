import React, { useReducer } from "react";
import PanelGroup from "react-panelgroup";
import styled from "styled-components";
import MonacoEditor from "react-monaco-editor";
import reducer from "./reducer";

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

const panelWidth = (toggled: boolean) => ({
  size: toggled ? 100 : 0,
  minSize: 0,
});

function App() {
  const [state, dispatch] = useReducer(reducer, {
    openPanes: { sub: true, sty: false, dsl: false, preview: true },
  });
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
          justifyContent: "center",
          width: "100%",
          backgroundColor: "#F4F4F4",
        }}
      >
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
      </nav>
      <div style={{ flexGrow: 1 }}>
        <PanelGroup
          borderColor="#a9a9a9"
          panelWidths={[
            panelWidth(state.openPanes.sub),
            panelWidth(state.openPanes.sty),
            panelWidth(state.openPanes.dsl),
            panelWidth(state.openPanes.preview),
          ]}
        >
          <MonacoEditor />
          <MonacoEditor />
          <MonacoEditor />
          {
            <div
              style={{ backgroundColor: "blue", width: "100%", height: "100%" }}
            />
          }
        </PanelGroup>
      </div>
    </div>
  );
}

export default App;
