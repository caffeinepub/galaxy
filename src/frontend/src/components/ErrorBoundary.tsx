import { Component } from "react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("[ErrorBoundary] 3D rendering error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100vw",
              height: "100vh",
              background: "#0B1017",
              color: "#F6C35B",
              fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              gap: 16,
              textAlign: "center",
              padding: 32,
            }}
          >
            <div style={{ fontSize: 48 }}>⚠️</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>
              Something went wrong with the 3D view.
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(200,180,140,0.7)",
                maxWidth: 420,
              }}
            >
              Please refresh the page to try again. If the issue persists, your
              device may not support WebGL.
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                marginTop: 8,
                background: "rgba(246,195,91,0.15)",
                border: "1px solid rgba(246,195,91,0.4)",
                borderRadius: 10,
                color: "#F6C35B",
                cursor: "pointer",
                padding: "10px 24px",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.06em",
              }}
            >
              Refresh Page
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
