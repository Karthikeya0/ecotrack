import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
          <div className="glass-panel p-8 max-w-md w-full border-rose-500/30 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-6">
              <AlertTriangle className="h-8 w-8 text-rose-400" />
            </div>
            <h1 className="text-2xl font-bold font-outfit text-white mb-2">Something went wrong</h1>
            <p className="text-slate-400 mb-8 text-sm">
              We encountered an unexpected error while rendering this page. Our team has been notified.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/20"
            >
              <RefreshCcw className="h-4 w-4" />
              <span>Reload Page</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
