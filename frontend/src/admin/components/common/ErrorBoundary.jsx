import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.error(error); } // later: send to monitoring (never render error details to the user)
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="tw-m-10 tw-text-center">
        <h1 className="tw-text-xl tw-font-semibold">Something went wrong</h1>
        <p className="tw-mt-2 tw-text-muted">Please reload the page.</p>
      </div>
    );
  }
}
