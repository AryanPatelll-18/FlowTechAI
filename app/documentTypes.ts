// ============================================================
// Document Types — QAP Generator + SO Datasheet Generator
// ============================================================

export interface QapDocument {
  id: string;
  type: "qap";
  productFamily: string;
  status: "ready" | "generated";
  title: string;
  date: string;
}

export interface DatasheetDocument {
  id: string;
  type: "datasheet";
  status: "ready" | "generated";
  title: string;
  date: string;
}

export type FlowtechDocument = QapDocument | DatasheetDocument;

export const DOC_TEMPLATES = {
  qap: {
    key: "qap" as const,
    title: "QAP Generator",
    description: "Generate Quality Assurance Plan",
  },
  datasheet: {
    key: "datasheet" as const,
    title: "SO Datasheet Generator",
    description: "Generate Technical Datasheet from SO/Quotation",
  },
} as const;
