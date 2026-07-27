export type H01CellDefinition = {
  id: string;
  sourceId: string;
  name: string;
  classification: string;
  description: string;
  color: string;
};

export const H01_MODEL_URL = "/data/h01/h01-seven-cells.glb";
export const H01_PREVIEW_MODEL_URL = "/data/h01/h01-seven-cells-preview.glb";
export const H01_DATASET_URL = "https://h01-release.storage.googleapis.com/data.html";
export const H01_LICENSE_URL = "https://creativecommons.org/licenses/by/4.0/";
export const H01_PAPER_URL = "https://doi.org/10.1126/science.adk4858";

export const H01_CELLS: H01CellDefinition[] = [
  {
    id: "h01-1072605926",
    sourceId: "1072605926",
    name: "H01 cell 1072605926",
    classification: "Proofread reconstruction",
    description: "Public H01 reconstruction simplified for this interactive interface demo.",
    color: "#32d7d2",
  },
  {
    id: "h01-810151953",
    sourceId: "810151953",
    name: "H01 cell 810151953",
    classification: "Proofread reconstruction",
    description: "Public H01 reconstruction simplified for this interactive interface demo.",
    color: "#ff9d4d",
  },
  {
    id: "h01-620880207",
    sourceId: "620880207",
    name: "H01 cell 620880207",
    classification: "Proofread reconstruction",
    description: "Public H01 reconstruction simplified for this interactive interface demo.",
    color: "#ed70cf",
  },
  {
    id: "h01-1684504313",
    sourceId: "1684504313",
    name: "H01 cell 1684504313",
    classification: "Proofread reconstruction",
    description: "Public H01 reconstruction simplified for this interactive interface demo.",
    color: "#9de36c",
  },
  {
    id: "h01-1465400601",
    sourceId: "1465400601",
    name: "H01 cell 1465400601",
    classification: "Proofread reconstruction",
    description: "Public H01 reconstruction simplified for this interactive interface demo.",
    color: "#ffd166",
  },
  {
    id: "h01-810970127",
    sourceId: "810970127",
    name: "H01 cell 810970127",
    classification: "Proofread reconstruction",
    description: "Public H01 reconstruction simplified for this interactive interface demo.",
    color: "#5ea8ff",
  },
  {
    id: "h01-2047644309",
    sourceId: "2047644309",
    name: "H01 cell 2047644309",
    classification: "Proofread reconstruction",
    description: "Public H01 reconstruction simplified for this interactive interface demo.",
    color: "#9b7cff",
  },
];
