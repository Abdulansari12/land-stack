import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Skiper31, CharacterV1, CharacterV2, CharacterV3, Bracket, DEFAULT_TECH_ICONS } from "@/components/ui/skiper-ui/skiper31";

describe("Skiper31 Text Scroll Animation Component", () => {
  it("renders the container with testid", () => {
    render(<Skiper31 headlineText="LAND STACK" subheadingText="DPI Tech Stack" />);
    const container = screen.getByTestId("skiper31-text-scroll-animation");
    expect(container).toBeInTheDocument();
  });

  it("renders all characters of the headline in 3D typography section", () => {
    render(<Skiper31 headlineText="LAND STACK" />);
    // Characters: 'L', 'A', 'N', 'D', ' ', 'S', 'T', 'A', 'C', 'K'
    expect(screen.getByText("L")).toBeInTheDocument();
    expect(screen.getAllByText("A").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("N")).toBeInTheDocument();
    expect(screen.getByText("D")).toBeInTheDocument();
    expect(screen.getByText("S")).toBeInTheDocument();
    expect(screen.getByText("T")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
    expect(screen.getByText("K")).toBeInTheDocument();
  });

  it("renders the subheading and default tech icons", () => {
    render(<Skiper31 subheadingText="Test DPI Infrastructure" />);
    expect(screen.getByText("Test DPI Infrastructure")).toBeInTheDocument();
    expect(screen.getAllByText("ULPIN (14-Digit)").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("RFC 7946").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("CERSAI API").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Next.js 16").length).toBeGreaterThanOrEqual(1);
  });

  it("renders Bracket decorative elements", () => {
    const { container } = render(<Bracket className="custom-bracket" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
