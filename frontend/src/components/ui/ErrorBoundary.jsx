import { Component } from "react";
import { ErrorState } from "./States";

/**
 * Catches render errors so one broken screen cannot blank the whole app.
 *
 * Class component by necessity: React exposes no hook equivalent of
 * componentDidCatch.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Left as console output deliberately: this is the last place an
    // otherwise invisible render failure can be surfaced.
    console.error("Unhandled render error:", error, info?.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <ErrorState
          title="This screen ran into a problem"
          description={error.message || "An unexpected error occurred."}
          onRetry={this.handleReset}
        />
      </div>
    );
  }
}

export default ErrorBoundary;
