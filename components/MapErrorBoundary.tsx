"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { MapPinOff } from "lucide-react";
import { ErrorState } from "@/components/ui";

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
  onReset?: () => void;
  className?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * MapErrorBoundary
 * Catches runtime rendering errors in MapComponent (e.g. Leaflet crashes, tile provider issues,
 * invalid geometry calculations) and renders a friendly fallback UI using ErrorState.
 */
export class MapErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[MapErrorBoundary] Map failed to render:", error, errorInfo);
  }

  public handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          data-testid="map-error-boundary-fallback"
          className={`flex-1 min-h-[420px] sm:min-h-[500px] md:min-h-[580px] w-full flex items-center justify-center p-6 ${
            this.props.className || ""
          }`}
        >
          <ErrorState
            variant="card"
            size="lg"
            icon={<MapPinOff className="h-8 w-8" />}
            title={this.props.fallbackMessage || "Map temporarily unavailable"}
            message="The spatial map or tile service encountered an issue while loading. You can still search parcels, view title history, and inspect records."
            onRetry={this.handleRetry}
            retryLabel="Try Again"
            className="w-full max-w-lg shadow-md"
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default MapErrorBoundary;
