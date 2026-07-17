import { Component } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

/**
 * Catches render-time errors in a page so a single broken screen never blanks
 * the whole app. Reset it by changing the `resetKey` prop (e.g. the route path).
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('Page render error:', error, info);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <AlertTriangle size={26} className="text-red-500" />
          </div>
          <h2 className="font-display text-lg font-semibold text-forest">Something went wrong on this page</h2>
          <p className="text-sm text-forest-400 mt-1 max-w-md">
            An unexpected error occurred while loading this screen. You can try reloading it.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-3 max-w-xl overflow-auto text-left text-xs text-red-600 bg-red-50 rounded-lg p-3">
              {this.state.error.message}
            </pre>
          )}
          <button
            className="btn-primary mt-5"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            <RotateCcw size={15} /> Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
