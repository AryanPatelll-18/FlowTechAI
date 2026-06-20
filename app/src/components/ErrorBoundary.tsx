/**
 * ErrorBoundary — Catches React errors anywhere in the child tree.
 * Prevents the entire app from going blank.
 */
import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("[ErrorBoundary] React error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div style={{ padding: 40, textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#dc2626", marginBottom: 12 }}>
            Something went wrong
          </div>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 20, maxWidth: 500, margin: "0 auto 20px" }}>
            {this.state.error?.message || "An unexpected error occurred"}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: "10px 24px", borderRadius: 6, background: "#c20017", color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", marginRight: 10 }}
          >
            Reload Page
          </button>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ padding: "10px 24px", borderRadius: 6, background: "#fff", color: "#374151", border: "1px solid #d1d5db", fontSize: 14, cursor: "pointer" }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
