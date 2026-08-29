import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(error, info.componentStack);
  }

  render() {
    if (this.state.error !== null) {
      return (
        <div role="alert">
          <p>Что-то пошло не так.</p>
          <button type="button" onClick={() => this.setState({ error: null })}>
            Попробовать снова
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
