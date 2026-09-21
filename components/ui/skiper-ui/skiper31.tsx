"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import ReactLenis from "lenis/react";
import { cn } from "@/lib/utils";
import {
  Layers,
  ShieldCheck,
  Landmark,
  Database,
  Cpu,
  Globe,
  Sparkles,
  Terminal,
  FileCode,
  CheckCircle2,
} from "lucide-react";

export type CharacterProps = {
  char: string;
  index: number;
  centerIndex: number;
  scrollYProgress: MotionValue<number>;
  className?: string;
  highlightColor?: string;
};

export const CharacterV1 = ({
  char,
  index,
  centerIndex,
  scrollYProgress,
  className,
  highlightColor = "text-indigo-600 dark:text-indigo-400",
}: CharacterProps) => {
  const isSpace = char === " ";
  const distanceFromCenter = index - centerIndex;

  const x = useTransform(
    scrollYProgress,
    [0, 0.5],
    [distanceFromCenter * 50, 0]
  );
  const rotateX = useTransform(
    scrollYProgress,
    [0, 0.5],
    [distanceFromCenter * 50, 0]
  );

  return (
    <motion.span
      className={cn(
        "inline-block font-black tracking-tight",
        highlightColor,
        isSpace && "w-3 sm:w-5",
        className
      )}
      style={{
        x,
        rotateX,
      }}
    >
      {char}
    </motion.span>
  );
};

export type IconItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
};

export const DEFAULT_TECH_ICONS: IconItem[] = [
  { id: "ulpin", label: "ULPIN (14-Digit)", icon: ShieldCheck, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/30" },
  { id: "geojson", label: "RFC 7946", icon: Layers, color: "text-indigo-500", bg: "bg-indigo-500/10 border-indigo-500/30" },
  { id: "nextjs", label: "Next.js 16", icon: Globe, color: "text-cyan-500", bg: "bg-cyan-500/10 border-cyan-500/30" },
  { id: "cersai", label: "CERSAI API", icon: Landmark, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/30" },
  { id: "sha256", label: "SHA-256 Ledger", icon: Cpu, color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/30" },
  { id: "deckgl", label: "deck.gl & GIS", icon: Sparkles, color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/30" },
  { id: "rest", label: "Open REST API", icon: Terminal, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/30" },
  { id: "sql", label: "PostGIS / DB", icon: Database, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/30" },
];

export const CharacterV2 = ({
  item,
  index,
  centerIndex,
  scrollYProgress,
}: {
  item: IconItem | string;
  index: number;
  centerIndex: number;
  scrollYProgress: MotionValue<number>;
}) => {
  const distanceFromCenter = index - centerIndex;

  const x = useTransform(
    scrollYProgress,
    [0, 0.5],
    [distanceFromCenter * 50, 0]
  );
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.75, 1]);
  const y = useTransform(
    scrollYProgress,
    [0, 0.5],
    [Math.abs(distanceFromCenter) * 40, 0]
  );

  if (typeof item === "string") {
    return (
      <motion.img
        src={item}
        alt="tech-icon"
        className="inline-block h-12 w-12 rounded-xl object-contain mx-2"
        style={{
          x,
          scale,
          y,
          transformOrigin: "center",
        }}
      />
    );
  }

  const Icon = item.icon;

  return (
    <motion.div
      className={cn(
        "inline-flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border shadow-sm mx-1.5 sm:mx-2.5 backdrop-blur-md transition-colors",
        item.bg
      )}
      style={{
        x,
        scale,
        y,
        transformOrigin: "center",
      }}
    >
      <Icon className={cn("h-6 w-6 sm:h-8 sm:w-8 mb-1.5", item.color)} />
      <span className="text-[10px] sm:text-xs font-bold font-mono tracking-tight text-slate-800 dark:text-zinc-200 whitespace-nowrap">
        {item.label}
      </span>
    </motion.div>
  );
};

export const CharacterV3 = ({
  item,
  index,
  centerIndex,
  scrollYProgress,
}: {
  item: IconItem | string;
  index: number;
  centerIndex: number;
  scrollYProgress: MotionValue<number>;
}) => {
  const distanceFromCenter = index - centerIndex;

  const x = useTransform(
    scrollYProgress,
    [0, 0.5],
    [distanceFromCenter * 75, 0]
  );
  const rotate = useTransform(
    scrollYProgress,
    [0, 0.5],
    [distanceFromCenter * 35, 0]
  );
  const y = useTransform(
    scrollYProgress,
    [0, 0.5],
    [-Math.abs(distanceFromCenter) * 20, 0]
  );
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.75, 1]);

  if (typeof item === "string") {
    return (
      <motion.img
        src={item}
        alt="tech-icon"
        className="inline-block h-12 w-12 rounded-xl object-contain mx-2"
        style={{
          x,
          rotate,
          y,
          scale,
          transformOrigin: "center",
        }}
      />
    );
  }

  const Icon = item.icon;

  return (
    <motion.div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-2 rounded-xl border shadow-xs mx-1.5 backdrop-blur-md",
        item.bg
      )}
      style={{
        x,
        rotate,
        y,
        scale,
        transformOrigin: "center",
      }}
    >
      <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5 shrink-0", item.color)} />
      <span className="text-xs font-bold font-mono text-slate-800 dark:text-zinc-200 whitespace-nowrap">
        {item.label}
      </span>
    </motion.div>
  );
};

export const Bracket = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 27 78"
      className={cn("h-8 sm:h-12 text-slate-400 dark:text-zinc-600 shrink-0", className)}
    >
      <path
        fill="currentColor"
        d="M26.52 77.21h-5.75c-6.83 0-12.38-5.56-12.38-12.38V48.38C8.39 43.76 4.63 40 .01 40v-4c4.62 0 8.38-3.76 8.38-8.38V12.4C8.38 5.56 13.94 0 20.77 0h5.75v4h-5.75c-4.62 0-8.38 3.76-8.38 8.38V27.6c0 4.34-2.25 8.17-5.64 10.38 3.39 2.21 5.64 6.04 5.64 10.38v16.45c0 4.62 3.76 8.38 8.38 8.38h5.75v4.02Z"
      />
    </svg>
  );
};

export interface Skiper31Props {
  headlineText?: string;
  subheadingText?: string;
  techIcons?: IconItem[] | string[];
  enableLenis?: boolean;
  className?: string;
}

export function Skiper31({
  headlineText = "LAND STACK DPI",
  subheadingText = "Built on India's Digital Public Infrastructure Standards",
  techIcons = DEFAULT_TECH_ICONS,
  enableLenis = false,
  className,
}: Skiper31Props) {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const targetRef2 = useRef<HTMLDivElement | null>(null);
  const targetRef3 = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });
  const { scrollYProgress: scrollYProgress2 } = useScroll({
    target: targetRef2,
    offset: ["start end", "end start"],
  });
  const { scrollYProgress: scrollYProgress3 } = useScroll({
    target: targetRef3,
    offset: ["start end", "end start"],
  });

  const characters = headlineText.split("");
  const centerIndex = Math.floor(characters.length / 2);
  const iconCenterIndex = Math.floor(techIcons.length / 2);

  const content = (
    <div
      data-testid="skiper31-text-scroll-animation"
      className={cn(
        "relative w-full overflow-hidden bg-slate-50 dark:bg-zinc-950 border-y border-slate-200 dark:border-zinc-800 transition-colors py-12",
        className
      )}
    >
      {/* Top Scroll Indicator */}
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider border border-indigo-200 dark:border-indigo-800/80">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>Scroll-Driven Parallax Architecture</span>
        </span>
      </div>

      {/* Section 1: 3D Typography Character Rotation */}
      <div
        ref={targetRef}
        className="relative flex min-h-[50vh] sm:min-h-[65vh] items-center justify-center overflow-hidden px-4"
      >
        <div
          className="w-full max-w-5xl text-center text-4xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tighter text-slate-900 dark:text-white"
          style={{ perspective: "500px" }}
        >
          {characters.map((char, index) => (
            <CharacterV1
              key={index}
              char={char}
              index={index}
              centerIndex={centerIndex}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </div>
      </div>

      {/* Section 2: Converging Tech Stack Icons (V2) */}
      <div
        ref={targetRef2}
        className="relative flex min-h-[45vh] sm:min-h-[55vh] flex-col items-center justify-center gap-6 px-4"
      >
        <div className="flex items-center justify-center gap-3 text-center">
          <Bracket className="text-indigo-600 dark:text-indigo-400" />
          <span className="text-base sm:text-xl font-bold tracking-tight text-slate-800 dark:text-zinc-200">
            {subheadingText}
          </span>
          <Bracket className="scale-x-[-1] text-indigo-600 dark:text-indigo-400" />
        </div>

        <div className="w-full max-w-5xl flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {techIcons.map((item, index) => (
            <CharacterV2
              key={typeof item === "string" ? index : item.id}
              item={item}
              index={index}
              centerIndex={iconCenterIndex}
              scrollYProgress={scrollYProgress2}
            />
          ))}
        </div>
      </div>

      {/* Section 3: 3D Tilting Rotational Parallax (V3) */}
      <div
        ref={targetRef3}
        className="relative flex min-h-[40vh] sm:min-h-[50vh] flex-col items-center justify-center gap-6 px-4"
      >
        <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>Interstate Zero-Rebuild Federation Stack</span>
        </div>

        <div
          className="w-full max-w-5xl flex flex-wrap items-center justify-center gap-2 sm:gap-3"
          style={{ perspective: "600px" }}
        >
          {techIcons.map((item, index) => (
            <CharacterV3
              key={typeof item === "string" ? index : item.id}
              item={item}
              index={index}
              centerIndex={iconCenterIndex}
              scrollYProgress={scrollYProgress3}
            />
          ))}
        </div>
      </div>
    </div>
  );

  if (enableLenis) {
    return <ReactLenis root>{content}</ReactLenis>;
  }

  return content;
}

export default Skiper31;

/**
 * Skiper 31 ScrollAnimation_002 — React + framer-motion + lenis
 *
 * Attribution:
 * Author: @gurvinder-singh02 (Skiper UI)
 * Registry: @skiper-ui/skiper31
 * Website: https://skiper-ui.com
 */
