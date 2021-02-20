import { useEffect } from "react";
import { Action } from "./reducer";
import dummyRegistry from "./dummy-registry.json";

/**
 * (browser-only) Downloads any given exported SVG to the user's computer
 * @param svg
 * @param title the filename
 */
export const DownloadSVG = (
  svg: SVGSVGElement,
  title = "illustration"
): void => {
  const blob = new Blob([svg.outerHTML], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = `${title}.svg`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
};

export const useFetchTrioPreset = (dispatch: React.Dispatch<Action>) => {
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
};
