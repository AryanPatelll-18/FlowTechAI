/**
 * AppContext — Global shared state for cross-module data flow
 * Manages: Project Workspace → SO Upload → Extraction → Verification → Reports
 */
import React, { createContext, useContext, useReducer, useCallback } from "react";
import type {
  MainTab, SizingSubTab, DocumentsSubTab, LibrarySubTab, ProjectWorkspaceTab,
  DetectedInstrument, SizingResult, LevelResult, PressureResult,
  DocumentProject, GeneratedDocument,
  ProjectMetadata, ProjectStatus, ExtractedLineItem,
  ProductSelectionCheck, SizingVerificationCheck, DocumentMappingCheck,
} from "../types/shared";

// ─── State Shape ────────────────────────────────────────────────────────────
export interface AppState {
  // Navigation
  activeTab: MainTab;
  sizingSubTab: SizingSubTab;
  documentsSubTab: DocumentsSubTab;
  librarySubTab: LibrarySubTab;

  // ─── NEW: Project Workspace ──────────────────────────────────────
  projectWorkspaceTab: ProjectWorkspaceTab;
  currentProject: DocumentProject | null;
  // List of all projects (persisted)
  projects: DocumentProject[];

  // Legacy instruments (from SO parsing)
  detectedInstruments: DetectedInstrument[];

  // Sizing results
  sizingResults: SizingResult[];
  levelResults: LevelResult[];
  pressureResults: PressureResult[];

  // Document generation state
  generatedDocuments: GeneratedDocument[];
  selectedInstrumentId: string | null;

  // Notifications
  notifications: AppNotification[];
  isProcessing: boolean;
}

export interface AppNotification {
  id: string;
  type: "success" | "warning" | "error" | "info";
  message: string;
  detail?: string;
  createdAt: number;
}

// ─── Initial State ──────────────────────────────────────────────────────────
const initialState: AppState = {
  activeTab: "projects",
  sizingSubTab: "flow",
  documentsSubTab: "datasheets",
  librarySubTab: "de_codification",
  projectWorkspaceTab: "overview",
  currentProject: null,
  projects: [],
  detectedInstruments: [],
  sizingResults: [],
  levelResults: [],
  pressureResults: [],
  generatedDocuments: [],
  selectedInstrumentId: null,
  notifications: [],
  isProcessing: false,
};

// ─── Action Types ───────────────────────────────────────────────────────────
type AppAction =
  // Navigation
  | { type: "SET_MAIN_TAB"; tab: MainTab }
  | { type: "SET_SIZING_SUB_TAB"; tab: SizingSubTab }
  | { type: "SET_DOCUMENTS_SUB_TAB"; tab: DocumentsSubTab }
  | { type: "SET_LIBRARY_SUB_TAB"; tab: LibrarySubTab }
  | { type: "SET_PROJECT_WORKSPACE_TAB"; tab: ProjectWorkspaceTab }
  // ─── NEW: Projects ───────────────────────────────────────────────
  | { type: "CREATE_PROJECT"; project: DocumentProject }
  | { type: "SET_CURRENT_PROJECT"; projectId: string | null }
  | { type: "UPDATE_PROJECT"; project: Partial<DocumentProject> }
  | { type: "UPDATE_PROJECT_STATUS"; status: ProjectStatus; note: string }
  | { type: "CLEAR_PROJECT" }
  | { type: "DELETE_PROJECT"; projectId: string }
  // ─── NEW: Project documents ──────────────────────────────────────
  | { type: "ADD_UPLOADED_DOCUMENT"; doc: UploadedDoc }
  | { type: "UPDATE_DOCUMENT_EXTRACTION"; docId: string; status: string; confidence?: number }
  // ─── NEW: Line items ─────────────────────────────────────────────
  | { type: "SET_LINE_ITEMS"; items: ExtractedLineItem[] }
  | { type: "UPDATE_LINE_ITEM"; item: Partial<ExtractedLineItem> & { id: string } }
  // ─── NEW: Verification checks ────────────────────────────────────
  | { type: "SET_PRODUCT_SELECTION_CHECKS"; checks: ProductSelectionCheck[] }
  | { type: "SET_SIZING_VERIFICATION_CHECKS"; checks: SizingVerificationCheck[] }
  | { type: "SET_DOCUMENT_MAPPING_CHECKS"; checks: DocumentMappingCheck[] }
  // ─── NEW: Reports ────────────────────────────────────────────────
  | { type: "SET_EXCEPTION_REPORT"; html: string }
  | { type: "SET_FULL_REPORT"; html: string }
  // Legacy SO Detection
  | { type: "SET_DETECTED_INSTRUMENTS"; instruments: DetectedInstrument[] }
  | { type: "UPDATE_INSTRUMENT"; instrument: DetectedInstrument }
  | { type: "SELECT_INSTRUMENT"; id: string | null }
  // Sizing Results
  | { type: "ADD_SIZING_RESULT"; result: SizingResult }
  | { type: "UPDATE_SIZING_RESULT"; result: SizingResult }
  | { type: "REMOVE_SIZING_RESULT"; id: string }
  | { type: "CLEAR_SIZING_RESULTS" }
  | { type: "ADD_LEVEL_RESULT"; result: LevelResult }
  | { type: "ADD_PRESSURE_RESULT"; result: PressureResult }
  // Documents
  | { type: "ADD_GENERATED_DOCUMENT"; doc: GeneratedDocument }
  | { type: "UPDATE_INSTRUMENT_STATUS"; id: string; status: DetectedInstrument["status"] }
  // Notifications
  | { type: "ADD_NOTIFICATION"; notification: AppNotification }
  | { type: "REMOVE_NOTIFICATION"; id: string }
  // Loading
  | { type: "SET_PROCESSING"; value: boolean };

interface UploadedDoc {
  id: string;
  name: string;
  type: "quote" | "so" | "inquiry" | "supporting";
  fileSize: number;
  uploadDate: number;
  uploadedBy: string;
  extractionStatus: "pending" | "processing" | "completed" | "failed";
  confidenceScore?: number;
  ocrText?: string;
}

// ─── Helper: make empty project ─────────────────────────────────────────────
function makeEmptyProject(metadata: ProjectMetadata): DocumentProject {
  const now = Date.now();
  return {
    id: `proj-${now}`,
    name: metadata.projectName || "Untitled Project",
    soNumber: metadata.quoteNumber,
    clientName: metadata.customerName,
    createdAt: now,
    updatedAt: now,
    metadata,
    status: "draft",
    statusHistory: [{ status: "draft", timestamp: now, note: "Project created" }],
    uploadedDocuments: [],
    lineItems: [],
    productSelectionChecks: [],
    sizingVerificationChecks: [],
    documentMappingChecks: [],
    instruments: [],
    sizingResults: [],
    levelResults: [],
    pressureResults: [],
    documents: [],
  };
}

// ─── Reducer ────────────────────────────────────────────────────────────────
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // ─── Navigation ────────────────────────────────────────────────
    case "SET_MAIN_TAB":
      return { ...state, activeTab: action.tab };
    case "SET_SIZING_SUB_TAB":
      return { ...state, sizingSubTab: action.tab };
    case "SET_DOCUMENTS_SUB_TAB":
      return { ...state, documentsSubTab: action.tab };
    case "SET_LIBRARY_SUB_TAB":
      return { ...state, librarySubTab: action.tab };
    case "SET_PROJECT_WORKSPACE_TAB":
      return { ...state, projectWorkspaceTab: action.tab };

    // ─── NEW: Projects ─────────────────────────────────────────────
    case "CREATE_PROJECT": {
      const proj = action.project;
      return {
        ...state,
        currentProject: proj,
        projects: [proj, ...state.projects],
        projectWorkspaceTab: "overview",
      };
    }
    case "SET_CURRENT_PROJECT": {
      if (action.projectId === null) {
        return { ...state, currentProject: null, projectWorkspaceTab: "overview" };
      }
      const proj = state.projects.find((p) => p.id === action.projectId);
      return proj
        ? { ...state, currentProject: proj, projectWorkspaceTab: "overview", activeTab: "projects" }
        : state;
    }
    case "UPDATE_PROJECT": {
      if (!state.currentProject) return state;
      const updated = { ...state.currentProject, ...action.project, updatedAt: Date.now() };
      return {
        ...state,
        currentProject: updated,
        projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
      };
    }
    case "UPDATE_PROJECT_STATUS": {
      if (!state.currentProject) return state;
      const updated: DocumentProject = {
        ...state.currentProject,
        status: action.status,
        statusHistory: [
          ...state.currentProject.statusHistory,
          { status: action.status, timestamp: Date.now(), note: action.note },
        ],
        updatedAt: Date.now(),
      };
      return {
        ...state,
        currentProject: updated,
        projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
      };
    }
    case "CLEAR_PROJECT":
      return {
        ...state,
        currentProject: null,
        detectedInstruments: [],
        sizingResults: [],
        levelResults: [],
        pressureResults: [],
        generatedDocuments: [],
        selectedInstrumentId: null,
      };
    case "DELETE_PROJECT":
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.projectId),
        currentProject: state.currentProject?.id === action.projectId ? null : state.currentProject,
      };

    // ─── NEW: Documents ────────────────────────────────────────────
    case "ADD_UPLOADED_DOCUMENT": {
      if (!state.currentProject) return state;
      const doc = action.doc;
      const updated = {
        ...state.currentProject,
        uploadedDocuments: [...state.currentProject.uploadedDocuments, doc],
        updatedAt: Date.now(),
      };
      return {
        ...state,
        currentProject: updated,
        projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
      };
    }
    case "UPDATE_DOCUMENT_EXTRACTION": {
      if (!state.currentProject) return state;
      const docs = state.currentProject.uploadedDocuments.map((d) =>
        d.id === action.docId
          ? { ...d, extractionStatus: action.status as any, confidenceScore: action.confidence }
          : d
      );
      const updated = { ...state.currentProject, uploadedDocuments: docs, updatedAt: Date.now() };
      return {
        ...state,
        currentProject: updated,
        projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
      };
    }

    // ─── NEW: Line items ───────────────────────────────────────────
    case "SET_LINE_ITEMS": {
      if (!state.currentProject) return state;
      const updated = { ...state.currentProject, lineItems: action.items, updatedAt: Date.now() };
      return {
        ...state,
        currentProject: updated,
        projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
      };
    }
    case "UPDATE_LINE_ITEM": {
      if (!state.currentProject) return state;
      const items = state.currentProject.lineItems.map((li) =>
        li.id === action.item.id ? { ...li, ...action.item } : li
      );
      const updated = { ...state.currentProject, lineItems: items, updatedAt: Date.now() };
      return {
        ...state,
        currentProject: updated,
        projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
      };
    }

    // ─── NEW: Verification checks ──────────────────────────────────
    case "SET_PRODUCT_SELECTION_CHECKS": {
      if (!state.currentProject) return state;
      const updated = { ...state.currentProject, productSelectionChecks: action.checks, updatedAt: Date.now() };
      return {
        ...state,
        currentProject: updated,
        projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
      };
    }
    case "SET_SIZING_VERIFICATION_CHECKS": {
      if (!state.currentProject) return state;
      const updated = { ...state.currentProject, sizingVerificationChecks: action.checks, updatedAt: Date.now() };
      return {
        ...state,
        currentProject: updated,
        projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
      };
    }
    case "SET_DOCUMENT_MAPPING_CHECKS": {
      if (!state.currentProject) return state;
      const updated = { ...state.currentProject, documentMappingChecks: action.checks, updatedAt: Date.now() };
      return {
        ...state,
        currentProject: updated,
        projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
      };
    }

    // ─── NEW: Reports ──────────────────────────────────────────────
    case "SET_EXCEPTION_REPORT": {
      if (!state.currentProject) return state;
      const updated = { ...state.currentProject, exceptionReportHtml: action.html, updatedAt: Date.now() };
      return { ...state, currentProject: updated, projects: state.projects.map((p) => (p.id === updated.id ? updated : p)) };
    }
    case "SET_FULL_REPORT": {
      if (!state.currentProject) return state;
      const updated = { ...state.currentProject, fullReportHtml: action.html, reportGeneratedAt: Date.now(), updatedAt: Date.now() };
      return { ...state, currentProject: updated, projects: state.projects.map((p) => (p.id === updated.id ? updated : p)) };
    }

    // ─── Legacy SO Detection ───────────────────────────────────────
    case "SET_DETECTED_INSTRUMENTS":
      return { ...state, detectedInstruments: action.instruments };
    case "UPDATE_INSTRUMENT": {
      const idx = state.detectedInstruments.findIndex((i) => i.id === action.instrument.id);
      if (idx === -1) return { ...state, detectedInstruments: [...state.detectedInstruments, action.instrument] };
      const updated = [...state.detectedInstruments];
      updated[idx] = action.instrument;
      return { ...state, detectedInstruments: updated };
    }
    case "SELECT_INSTRUMENT":
      return { ...state, selectedInstrumentId: action.id };

    // ─── Sizing Results ────────────────────────────────────────────
    case "ADD_SIZING_RESULT": {
      const existing = state.sizingResults.findIndex((r) => r.instrumentId === action.result.instrumentId);
      if (existing !== -1) {
        const updated = [...state.sizingResults];
        updated[existing] = action.result;
        return { ...state, sizingResults: updated };
      }
      return { ...state, sizingResults: [...state.sizingResults, action.result] };
    }
    case "UPDATE_SIZING_RESULT": {
      const idx = state.sizingResults.findIndex((r) => r.id === action.result.id);
      if (idx === -1) return state;
      const updated = [...state.sizingResults];
      updated[idx] = action.result;
      return { ...state, sizingResults: updated };
    }
    case "REMOVE_SIZING_RESULT":
      return { ...state, sizingResults: state.sizingResults.filter((r) => r.id !== action.id) };
    case "CLEAR_SIZING_RESULTS":
      return { ...state, sizingResults: [] };
    case "ADD_LEVEL_RESULT": {
      const existing = state.levelResults.findIndex((r) => r.instrumentId === action.result.instrumentId);
      if (existing !== -1) {
        const updated = [...state.levelResults];
        updated[existing] = action.result;
        return { ...state, levelResults: updated };
      }
      return { ...state, levelResults: [...state.levelResults, action.result] };
    }
    case "ADD_PRESSURE_RESULT": {
      const existing = state.pressureResults.findIndex((r) => r.instrumentId === action.result.instrumentId);
      if (existing !== -1) {
        const updated = [...state.pressureResults];
        updated[existing] = action.result;
        return { ...state, pressureResults: updated };
      }
      return { ...state, pressureResults: [...state.pressureResults, action.result] };
    }

    // ─── Documents ─────────────────────────────────────────────────
    case "ADD_GENERATED_DOCUMENT":
      return { ...state, generatedDocuments: [...state.generatedDocuments, action.doc] };
    case "UPDATE_INSTRUMENT_STATUS": {
      const idx = state.detectedInstruments.findIndex((i) => i.id === action.id);
      if (idx === -1) return state;
      const updated = [...state.detectedInstruments];
      updated[idx] = { ...updated[idx], status: action.status };
      return { ...state, detectedInstruments: updated };
    }

    // ─── Notifications ─────────────────────────────────────────────
    case "ADD_NOTIFICATION":
      return { ...state, notifications: [...state.notifications, action.notification] };
    case "REMOVE_NOTIFICATION":
      return { ...state, notifications: state.notifications.filter((n) => n.id !== action.id) };

    // ─── Loading ───────────────────────────────────────────────────
    case "SET_PROCESSING":
      return { ...state, isProcessing: action.value };

    default:
      return state;
  }
}

// ─── Context ────────────────────────────────────────────────────────────────
interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;

  // Convenience methods
  navigateTo: (tab: MainTab) => void;
  navigateToSizing: (subTab: SizingSubTab) => void;
  navigateToDocuments: (subTab: DocumentsSubTab) => void;
  navigateToLibrary: (subTab: LibrarySubTab) => void;
  navigateToProjectTab: (tab: ProjectWorkspaceTab) => void;
  goToSizingForInstrument: (instrumentId: string) => void;
  goToDocumentsForInstrument: (instrumentId: string) => void;
  notify: (type: AppNotification["type"], message: string, detail?: string) => void;
  dismissNotification: (id: string) => void;

  // NEW: Project helpers
  createProject: (metadata: ProjectMetadata) => DocumentProject;
  setCurrentProject: (projectId: string | null) => void;
  deleteProject: (projectId: string) => void;
  updateProjectStatus: (status: ProjectStatus, note: string) => void;

  // Getters
  getSelectedInstrument: () => DetectedInstrument | undefined;
  getSizingForInstrument: (id: string) => SizingResult | undefined;
  getInstrumentsNeedingSizing: () => DetectedInstrument[];
  getInstrumentsReadyForDocs: () => DetectedInstrument[];

  // NEW: Project stats
  getProjectStats: () => { total: number; approved: number; warnings: number; rejected: number; reportReady: boolean };
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Navigation helpers
  const navigateTo = useCallback((tab: MainTab) => {
    dispatch({ type: "SET_MAIN_TAB", tab });
  }, []);

  const navigateToSizing = useCallback((subTab: SizingSubTab) => {
    dispatch({ type: "SET_MAIN_TAB", tab: "sizing" });
    dispatch({ type: "SET_SIZING_SUB_TAB", tab: subTab });
  }, []);

  const navigateToDocuments = useCallback((subTab: DocumentsSubTab) => {
    dispatch({ type: "SET_MAIN_TAB", tab: "documents" });
    dispatch({ type: "SET_DOCUMENTS_SUB_TAB", tab: subTab });
  }, []);

  const navigateToLibrary = useCallback((subTab: LibrarySubTab) => {
    dispatch({ type: "SET_MAIN_TAB", tab: "library" });
    dispatch({ type: "SET_LIBRARY_SUB_TAB", tab: subTab });
  }, []);

  const navigateToProjectTab = useCallback((tab: ProjectWorkspaceTab) => {
    dispatch({ type: "SET_PROJECT_WORKSPACE_TAB", tab });
  }, []);

  const goToSizingForInstrument = useCallback((instrumentId: string) => {
    dispatch({ type: "SELECT_INSTRUMENT", id: instrumentId });
    const inst = state.detectedInstruments.find((i) => i.id === instrumentId);
    if (inst) {
      if (inst.productFamily.includes("Level")) {
        dispatch({ type: "SET_SIZING_SUB_TAB", tab: "level" });
      } else if (inst.productFamily.includes("Pressure")) {
        dispatch({ type: "SET_SIZING_SUB_TAB", tab: "pressure" });
      } else {
        dispatch({ type: "SET_SIZING_SUB_TAB", tab: "flow" });
      }
    }
    dispatch({ type: "SET_MAIN_TAB", tab: "sizing" });
  }, [state.detectedInstruments]);

  const goToDocumentsForInstrument = useCallback((instrumentId: string) => {
    dispatch({ type: "SELECT_INSTRUMENT", id: instrumentId });
    dispatch({ type: "SET_MAIN_TAB", tab: "documents" });
  }, []);

  // Notification helper
  const notify = useCallback((type: AppNotification["type"], message: string, detail?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    dispatch({
      type: "ADD_NOTIFICATION",
      notification: { id, type, message, detail, createdAt: Date.now() },
    });
    setTimeout(() => dispatch({ type: "REMOVE_NOTIFICATION", id }), 5000);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    dispatch({ type: "REMOVE_NOTIFICATION", id });
  }, []);

  // ─── NEW: Project helpers ──────────────────────────────────────
  const createProject = useCallback((metadata: ProjectMetadata): DocumentProject => {
    const project = makeEmptyProject(metadata);
    dispatch({ type: "CREATE_PROJECT", project });
    return project;
  }, []);

  const setCurrentProject = useCallback((projectId: string | null) => {
    dispatch({ type: "SET_CURRENT_PROJECT", projectId });
  }, []);

  const deleteProject = useCallback((projectId: string) => {
    dispatch({ type: "DELETE_PROJECT", projectId });
  }, []);

  const updateProjectStatus = useCallback((status: ProjectStatus, note: string) => {
    dispatch({ type: "UPDATE_PROJECT_STATUS", status, note });
  }, []);

  // Getters
  const getSelectedInstrument = useCallback(() => {
    if (!state.selectedInstrumentId) return undefined;
    return state.detectedInstruments.find((i) => i.id === state.selectedInstrumentId);
  }, [state.selectedInstrumentId, state.detectedInstruments]);

  const getSizingForInstrument = useCallback((id: string) => {
    return state.sizingResults.find((r) => r.instrumentId === id);
  }, [state.sizingResults]);

  const getInstrumentsNeedingSizing = useCallback(() => {
    return state.detectedInstruments.filter(
      (i) => i.status === "detected" && !state.sizingResults.some((r) => r.instrumentId === i.id)
    );
  }, [state.detectedInstruments, state.sizingResults]);

  const getInstrumentsReadyForDocs = useCallback(() => {
    return state.detectedInstruments.filter(
      (i) =>
        (i.status === "sized" || i.status === "documented") &&
        state.sizingResults.some((r) => r.instrumentId === i.id)
    );
  }, [state.detectedInstruments, state.sizingResults]);

  // NEW: Project stats
  const getProjectStats = useCallback(() => {
    const proj = state.currentProject;
    if (!proj) return { total: 0, approved: 0, warnings: 0, rejected: 0, reportReady: false };
    const li = proj.lineItems;
    const approved = li.filter((i) => i.status === "approved" || i.status === "product_ok" || i.status === "sizing_ok" || i.status === "mapping_ok").length;
    const warnings = li.filter((i) => i.status === "product_warning" || i.status === "sizing_warning" || i.status === "mapping_incomplete").length;
    const rejected = li.filter((i) => i.status === "rejected" || i.status === "product_rejected" || i.status === "sizing_rejected" || i.status === "hold").length;
    const reportReady = proj.status === "ready_for_report" || proj.status === "report_generated";
    return { total: li.length, approved, warnings, rejected, reportReady };
  }, [state.currentProject]);

  const value: AppContextValue = {
    state,
    dispatch,
    navigateTo,
    navigateToSizing,
    navigateToDocuments,
    navigateToLibrary,
    navigateToProjectTab,
    goToSizingForInstrument,
    goToDocumentsForInstrument,
    notify,
    dismissNotification,
    createProject,
    setCurrentProject,
    deleteProject,
    updateProjectStatus,
    getSelectedInstrument,
    getSizingForInstrument,
    getInstrumentsNeedingSizing,
    getInstrumentsReadyForDocs,
    getProjectStats,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ─── Hook ───────────────────────────────────────────────────────────────────
export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}

export type { AppAction };
