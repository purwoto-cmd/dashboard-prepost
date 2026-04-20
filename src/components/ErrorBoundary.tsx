import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  retryLabel?: string;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("ErrorBoundary caught", error, info.componentStack);
  }

  private reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div role="alert" className="card mx-auto my-8 max-w-xl p-6" aria-live="assertive">
          <h2 className="mb-2 text-red-600 dark:text-red-400">
            {this.props.fallbackTitle ?? "Terjadi kesalahan"}
          </h2>
          <pre className="mb-4 overflow-auto rounded bg-slate-100 p-3 text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-100">
            {this.state.error.message}
          </pre>
          <button type="button" className="btn-primary" onClick={this.reset}>
            {this.props.retryLabel ?? "Coba lagi"}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
