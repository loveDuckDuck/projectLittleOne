import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State { failed: boolean }

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State { return { failed: true }; }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('CV Builder error', error, info.componentStack);
  }

  render() {
    if (this.state.failed) return <main className="error-screen"><h1>Impossibile mostrare CV Builder</h1><p>Il tuo progetto salvato resta nel browser. Ricarica la pagina per riprovare.</p><button type="button" onClick={() => window.location.reload()}>Ricarica</button></main>;
    return this.props.children;
  }
}
