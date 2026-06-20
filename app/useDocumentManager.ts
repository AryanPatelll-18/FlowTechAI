// ============================================================
// Document Manager — QAP Generator + SO Datasheet Generator
// ============================================================

import { useState, useCallback } from "react";
import type { QapDocument, DatasheetDocument } from "../data/documentTypes";

export interface DocumentManagerState {
  qapDocs: QapDocument[];
  datasheetDocs: DatasheetDocument[];
  activeDocId: string | null;
  activeDocType: "qap" | "datasheet" | null;
  setActiveDoc: (id: string | null, type: "qap" | "datasheet" | null) => void;
  addQapDoc: (doc: QapDocument) => void;
  addDatasheetDoc: (doc: DatasheetDocument) => void;
}

export function useDocumentManager(): DocumentManagerState {
  const [qapDocs, setQapDocs] = useState<QapDocument[]>([]);
  const [datasheetDocs, setDatasheetDocs] = useState<DatasheetDocument[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [activeDocType, setActiveDocType] = useState<"qap" | "datasheet" | null>(null);

  const setActiveDoc = useCallback((id: string | null, type: "qap" | "datasheet" | null) => {
    setActiveDocId(id);
    setActiveDocType(type);
  }, []);

  const addQapDoc = useCallback((doc: QapDocument) => {
    setQapDocs((prev) => [doc, ...prev]);
    setActiveDocId(doc.id);
    setActiveDocType("qap");
  }, []);

  const addDatasheetDoc = useCallback((doc: DatasheetDocument) => {
    setDatasheetDocs((prev) => [doc, ...prev]);
    setActiveDocId(doc.id);
    setActiveDocType("datasheet");
  }, []);

  return {
    qapDocs,
    datasheetDocs,
    activeDocId,
    activeDocType,
    setActiveDoc,
    addQapDoc,
    addDatasheetDoc,
  };
}
