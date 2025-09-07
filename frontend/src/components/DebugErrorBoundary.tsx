import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class DebugErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to console
    console.error('DebugErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-red-700 mb-4">⚠️ Something went wrong</h2>
            <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-700">
                <strong>Error:</strong> {this.state.error?.message}
              </p>
            </div>
            <details className="bg-gray-100 p-4 rounded">
              <summary className="font-semibold text-gray-700 cursor-pointer">Error Details</summary>
              <pre className="mt-2 text-sm text-gray-600 overflow-auto">
                {this.state.error?.stack}
              </pre>
              {this.state.errorInfo && (
                <pre className="mt-2 text-sm text-gray-600 overflow-auto">
                  {JSON.stringify(this.state.errorInfo.componentStack, null, 2)}
                </pre>
              )}
            </details>
            <div className="mt-6">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DebugErrorBoundary;