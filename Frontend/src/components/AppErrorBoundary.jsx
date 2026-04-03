import React from "react";
import { toast } from "react-toastify";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled render error", { error, info });
    toast.error("Something went wrong while rendering the page.");
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-xl p-8 text-center">
            <h1 className="text-2xl font-black text-slate-800">Unexpected Error</h1>
            <p className="mt-3 text-sm text-slate-500">
              The app recovered safely, but this screen failed to render.
            </p>
            <p className="mt-2 text-xs text-slate-400 break-words">
              {this.state.error?.message || "Unknown rendering error"}
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-6 px-5 py-3 rounded-xl bg-[#358a74] text-white text-sm font-bold hover:bg-[#2f7764]"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
