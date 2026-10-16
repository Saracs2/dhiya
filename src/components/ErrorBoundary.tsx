import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Icon } from './Icon';

interface Props {
  /** Already-translated copy (class components can't use hooks). */
  message: string;
  retryLabel: string;
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** Contains a failure to one panel so the rest of the dashboard keeps running. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('DHIYA panel error:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="chart-state" role="alert">
        <Icon name="alert" size={22} />
        <span>{this.props.message}</span>
        <button type="button" className="btn btn-ghost" onClick={() => this.setState({ error: null })}>
          <Icon name="reset" size={16} />
          {this.props.retryLabel}
        </button>
      </div>
    );
  }
}
