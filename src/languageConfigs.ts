import { languages, IRange } from "monaco-editor";

export const StyleConfig: languages.LanguageConfiguration = {
  comments: {
    blockComment: ["/*", "*/"],
    lineComment: "--",
  },
  autoClosingPairs: [
    { open: "{", close: "}", notIn: ["string", "comment"] },
    { open: "[", close: "]", notIn: ["string", "comment"] },
    { open: "(", close: ")", notIn: ["string", "comment"] },
    { open: '"', close: '"', notIn: ["string", "comment"] },
    { open: "'", close: "'", notIn: ["string", "comment"] },
  ],
  surroundingPairs: [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
  brackets: [
    ["{", "}"],
    ["[", "]"],
    ["(", ")"],
  ],
};

const CommonTokens: languages.IMonarchLanguageRule[] = [
  [/"(?:[^\n"]|\\["\\ntbfr])*"/, "string"],
];

const customs = {
  keywords: [
    "forall",
    "where",
    "with",
    "delete",
    "as",
    "true",
    "false",
    "layer",
    "encourage",
    "ensure",
    "override",
    "above",
    "below",
  ],
  types: [
    "scalar",
    "int",
    "bool",
    "string",
    "path",
    "color",
    "file",
    "style",
    "shape",
    "vec2",
    "vec3",
    "vec4",
    "mat2x2",
    "mat3x3",
    "mat4x4",
    "function",
    "objective",
    "constraint",
  ],
  shapes: [
    "Arrow",
    "Path",
    "Line",
    "Text",
    "Square",
    "Image",
    "Rectangle",
    "Circle",
  ],
  constraints: [
    "atDist",
    "contains",
    "disjoint",
    "disjointScalar",
    "equal",
    "inRange",
    "lessThan",
    "lessThanSq",
    "maxSize",
    "minSize",
    "notCrossing",
    "outsideOf",
    "overlapping",
    "perpendicular",
    "rightwards",
    "smallerThan",
    "tangentTo",
  ],
  objectives: [
    "above",
    "below",
    "centerArrow",
    "centerLabel",
    "centerLabelAbove",
    "equal",
    "near",
    "nearPt",
    "nearScalar",
    "repel",
    "repelScalar",
    "sameCenter",
  ],
  computations: [
    "abs",
    "average",
    "average2",
    "cos",
    "derivative",
    "derivativePreconditioned",
    "dot",
    "get",
    "hsva",
    "intersectingSideSize",
    "len",
    "lineLength",
    "max",
    "midpointOffset",
    "min",
    "mul",
    "norm",
    "normalize",
    "normsq",
    "orientedSquare",
    "pathFromPoints",
    "rgba",
    "rot90",
    "sampleColor",
    "setOpacity",
    "sin",
    "sqrt",
    "triangle",
    "unit",
    "unitMark",
    "unitMark2",
    "vdist",
    "vdistsq",
  ],
};

export const StyleLanguageTokens: languages.IMonarchLanguage = {
  ...customs,
  tokenizer: {
    root: [
      ...CommonTokens,
      [/[{}()[]]/, "@brackets"],
      [
        /[a-z_A-Z$][\w$]*/,
        {
          cases: {
            "@keywords": "keyword",
            "@computations": "entity",
            "@objectives": "entity",
            "@constraints": "entity",
            "@shapes": "tag",
            "@types": "type",
            "@default": "identifier",
          },
        },
      ],
      [
        /\b[+-]?(?:\d+(?:[.]\d*)?(?:[eE][+-]?\d+)?|[.]\d+(?:[eE][+-]?\d+)?)\b/,
        "number.float",
      ],
    ],
  },
};

export const StyleCompletions = (range: IRange): languages.CompletionItem[] => [
  ...customs.keywords.map((keyword: string) => ({
    label: keyword,
    insertText: keyword,
    kind: languages.CompletionItemKind.Keyword,
    range,
  })),
  ...customs.shapes.map((keyword: string) => ({
    label: keyword,
    insertText: `${keyword} {
  $0
}`,
    insertTextRules: languages.CompletionItemInsertTextRule.InsertAsSnippet,
    kind: languages.CompletionItemKind.Class,
    detail: "shape constructor",
    range,
  })),
  ...customs.computations.map((keyword: string) => ({
    label: keyword,
    insertText: `${keyword}($0)`,
    insertTextRules: languages.CompletionItemInsertTextRule.InsertAsSnippet,
    kind: languages.CompletionItemKind.Function,
    detail: "computation",
    range,
  })),
  ...customs.constraints.map((keyword: string) => ({
    label: keyword,
    insertText: `${keyword}($0)`,
    insertTextRules: languages.CompletionItemInsertTextRule.InsertAsSnippet,
    kind: languages.CompletionItemKind.Event,
    detail: "constraint",
    range,
  })),
  ...customs.objectives.map((keyword: string) => ({
    label: keyword,
    insertText: `${keyword}($0)`,
    insertTextRules: languages.CompletionItemInsertTextRule.InsertAsSnippet,
    kind: languages.CompletionItemKind.Event,
    detail: "objective",
    range,
  })),
  ...customs.types.map((keyword: string) => ({
    label: keyword,
    insertText: keyword,
    kind: languages.CompletionItemKind.TypeParameter,
    detail: "type",
    range,
  })),
];
