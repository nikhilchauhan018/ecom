import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // In production, errors can be reported to telemetry
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="tw-min-h-[50vh] tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-6 tw-text-center">
          <h2 className="tw-text-xl tw-font-semibold tw-text-ink tw-mb-2">
            Something went wrong
          </h2>
          <p className="tw-text-sm tw-text-muted tw-max-w-md tw-mb-5">
            We could not load this part of the store. Please try refreshing the page.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="touch-target tw-px-5 tw-py-2.5 tw-rounded-full tw-bg-ink tw-text-white tw-font-medium tw-text-sm"
          >
            Refresh page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
