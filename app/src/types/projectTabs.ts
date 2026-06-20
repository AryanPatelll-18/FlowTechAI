/**
 * Project Workspace Tabs — Master Prompt 11-Tab Layout
 */

export type ProjectWorkspaceTabV2 =
  | "overview"
  | "uploaded_documents"
  | "extracted_line_items"
  | "engineering_query"
  | "product_selection"
  | "sizing_verification"
  | "datasheet_gad"
  | "document_master"
  | "qap_master"
  | "report_preview"
  | "final_reports";

export const TAB_DEFS: { id: ProjectWorkspaceTabV2; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "📋" },
  { id: "uploaded_documents", label: "Documents", icon: "📤" },
  { id: "extracted_line_items", label: "Line Items", icon: "📑" },
  { id: "engineering_query", label: "Engg Queries", icon: "⚠️" },
  { id: "product_selection", label: "Product Check", icon: "✅" },
  { id: "sizing_verification", label: "Sizing Check", icon: "📐" },
  { id: "datasheet_gad", label: "Datasheet + GAD", icon: "📄" },
  { id: "document_master", label: "Drawing Master", icon: "📁" },
  { id: "qap_master", label: "QAP Master", icon: "📋" },
  { id: "report_preview", label: "Preview", icon: "👁" },
  { id: "final_reports", label: "Final Reports", icon: "📊" },
];
