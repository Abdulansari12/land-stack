"use client";

import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  Link2,
  CheckCircle2,
  Copy,
  Check,
  Calendar,
  Layers,
  FileText,
  AlertTriangle,
  Cpu,
  ArrowDown,
  Sparkles,
  Search,
} from "lucide-react";
import { LandParcelProperties } from "@/data/parcels";
import {
  AuditBlock,
  generateParcelAuditTrail,
  verifyChainIntegrity,
} from "@/lib/auditTrail";
import { useLanguage } from "@/context/LanguageContext";
import { LoadingState } from "@/components/ui/LoadingState";
import toast from "react-hot-toast";

interface AuditTrailTabProps {
  parcel: LandParcelProperties;
}

export default function AuditTrailTab({ parcel }: AuditTrailTabProps) {
  const { t } = useLanguage();
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [highlightedBlockHeight, setHighlightedBlockHeight] = useState<number | null>(null);
  const [filterQuery, setFilterQuery] = useState("");

  // Deterministically generate the immutable hash-chained audit trail
  const blocks = useMemo(() => generateParcelAuditTrail(parcel), [parcel]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    toast.success("Hash copied to clipboard!", { id: "hash-copy" });
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleVerifyChain = () => {
    setIsVerifying(true);
    setTimeout(() => {
      const result = verifyChainIntegrity(blocks);
      setIsVerifying(false);
      if (result.isValid) {
        toast.success(
          t("chainVerifiedSuccess") ||
            `✓ Cryptographic Audit Trail Verified: All ${blocks.length} blocks valid. Zero tampering detected!`,
          {
            duration: 4000,
            icon: "🛡️",
          }
        );
      } else {
        toast.error(`Tampering detected: ${result.message}`, { duration: 5000 });
      }
    }, 600);
  };

  const filteredBlocks = useMemo(() => {
    if (!filterQuery.trim()) return blocks;
    const q = filterQuery.toLowerCase();
    return blocks.filter(
      (b) =>
        b.actionType.toLowerCase().includes(q) ||
        b.actor.toLowerCase().includes(q) ||
        b.documentRef.toLowerCase().includes(q) ||
        b.blockHash.toLowerCase().includes(q) ||
        b.prevHash.toLowerCase().includes(q)
    );
  }, [blocks, filterQuery]);

  const getCategoryBadge = (category: AuditBlock["actionCategory"]) => {
    switch (category) {
      case "genesis":
        return {
          bg: "bg-brand-secondary-light dark:bg-purple-950/80 text-brand-secondary dark:text-purple-300 border-brand-secondary-border dark:border-purple-800",
          label: "GENESIS",
        };
      case "transfer":
        return {
          bg: "bg-status-info-bg text-status-info-text border-status-info-border",
          label: "DEED REGISTRATION",
        };
      case "mutation":
        return {
          bg: "bg-status-verified-bg text-status-verified-text border-status-verified-border",
          label: "REVENUE MUTATION",
        };
      case "encumbrance":
        return {
          bg: "bg-status-disputed-bg text-status-disputed-text border-status-disputed-border",
          label: "ENCUMBRANCE / CAVEAT",
        };
      case "tax":
        return {
          bg: "bg-status-pending-bg text-status-pending-text border-status-pending-border",
          label: "TAX ASSESSMENT",
        };
      case "verification":
        return {
          bg: "bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
          label: "E-SIGN VERIFICATION",
        };
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in-50 duration-200" data-testid="audit-trail-section">
      {/* Blockchain Header Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-zinc-900 to-indigo-950 text-white border border-indigo-900/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>{t("auditTrailTitle") || "Tamper-Proof Cadastral Audit Trail"}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-status-verified/20 text-status-verified-text dark:text-status-verified-text border border-status-verified/30">
                  PoA
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {t("auditTrailSubtitle") || "Cryptographically Chained State Machine (ULPIN-Anchored Ledger)"}
              </p>
            </div>
          </div>
        </div>

        {/* Key Blockchain Ledger Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-slate-800/80 relative z-10 text-xs">
          <div className="bg-slate-800/40 p-2 rounded-xl border border-slate-700/40">
            <span className="text-[10px] text-slate-400 block">{t("chainHeight") || "Chain Height"}</span>
            <span className="font-bold text-indigo-300 font-mono">
              #{blocks.length - 1} ({blocks.length} {t("blocks") || "Blocks"})
            </span>
          </div>

          <div className="bg-slate-800/40 p-2 rounded-xl border border-slate-700/40">
            <span className="text-[10px] text-slate-400 block">{t("consensusStatus") || "Consensus"}</span>
            <span className="font-bold text-status-verified flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-status-verified animate-pulse" />
              {t("consensusVerified") || "0 Forks"}
            </span>
          </div>

          <div className="bg-slate-800/40 p-2 rounded-xl border border-slate-700/40 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 block">{t("merkleRoot") || "Genesis Anchor"}</span>
            <span className="font-mono text-[10px] text-indigo-300 truncate block" title={blocks[0]?.blockHash}>
              {blocks[0]?.blockHash.slice(0, 10)}...
            </span>
          </div>
        </div>

        {/* Verification Trigger Button */}
        <div className="mt-3.5 pt-2 flex items-center justify-between gap-2 relative z-10">
          <button
            type="button"
            data-testid="verify-chain-integrity-btn"
            onClick={handleVerifyChain}
            disabled={isVerifying}
            aria-label="Verify chain integrity"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/30 cursor-pointer disabled:opacity-60"
          >
            {isVerifying ? (
              <LoadingState
                variant="inline"
                size="sm"
                label="Verifying Merkle Hashes..."
                className="text-white justify-center"
              />
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                <span>{t("verifyChain") || "Verify Chain Integrity"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter / Search within Blocks */}
      <div className="relative">
        <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder="Filter blocks by action, actor, or hash..."
          className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/70 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Hash-Chained Blocks Vertical Timeline */}
      <div className="relative pl-6 space-y-4">
        {/* Continuous glowing vertical blockchain cable line */}
        <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-emerald-500 rounded-full" />

        {filteredBlocks.map((block, idx) => {
          const badge = getCategoryBadge(block.actionCategory);
          const isGenesis = block.blockHeight === 0;
          const isLatest = block.blockHeight === blocks.length - 1;
          const isHighlighted = highlightedBlockHeight === block.blockHeight;

          return (
            <div
              key={block.blockHeight}
              data-testid={`audit-block-${block.blockHeight}`}
              className={`relative p-3.5 rounded-xl border transition-all duration-300 ${
                isHighlighted
                  ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-400/50 shadow-md"
                  : "bg-white dark:bg-zinc-900/90 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 shadow-xs"
              }`}
            >
              {/* Timeline Chain Node (Icon on the cable) */}
              <div
                className={`absolute -left-[27px] top-3.5 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm transition-transform ${
                  isGenesis
                    ? "bg-brand-secondary text-white ring-2 ring-brand-secondary/30"
                    : isLatest
                    ? "bg-status-verified text-white ring-2 ring-status-verified/30 animate-pulse"
                    : "bg-brand-primary text-white ring-2 ring-brand-primary/30"
                }`}
              >
                {block.blockHeight}
              </div>

              {/* Block Header */}
              <div className="flex items-start justify-between gap-2 flex-wrap mb-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-mono text-xs font-black text-slate-800 dark:text-zinc-200">
                    BLOCK #{String(block.blockHeight).padStart(3, "0")}
                  </span>

                  {isGenesis && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-secondary text-white">
                      {t("genesisBlock") || "Genesis"}
                    </span>
                  )}
                  {isLatest && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-status-verified text-white">
                      {t("latestBlock") || "Latest"}
                    </span>
                  )}

                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${badge.bg}`}
                  >
                    {badge.label}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                  <Calendar className="h-3 w-3" />
                  <span>{block.timestamp}</span>
                </div>
              </div>

              {/* Action Title & Executing Authority */}
              <div className="mt-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {block.actionType}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  <span>Party: <strong className="text-slate-700 dark:text-zinc-300">{block.actor}</strong></span>
                  <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1 py-0.5 rounded">
                    {block.documentRef}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed bg-slate-50 dark:bg-zinc-800/50 p-2 rounded-lg border border-slate-100 dark:border-zinc-800/80">
                  {block.details}
                </p>
              </div>

              {/* Cryptographic Hashes Container */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800/80 space-y-1.5 text-[10px] font-mono">
                {/* Block Hash */}
                <div className="flex items-center justify-between bg-slate-100/70 dark:bg-zinc-800/80 p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700/80">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-slate-400 shrink-0 font-sans font-medium">{t("currentHash") || "Hash"}:</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold truncate" title={block.blockHash}>
                      {block.blockHash.slice(0, 18)}...{block.blockHash.slice(-8)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(block.blockHash, `hash-${block.blockHeight}`)}
                    className="p-1 hover:bg-white dark:hover:bg-zinc-700 rounded text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition cursor-pointer shrink-0 ml-1"
                    title="Copy Full Block Hash"
                    aria-label="Copy Full Block Hash"
                  >
                    {copiedHash === `hash-${block.blockHeight}` ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>

                {/* Previous Hash Reference (The Hash Chain Link!) */}
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 px-1">
                  <div className="flex items-center gap-1 min-w-0">
                    <Link2 className="h-3 w-3 text-purple-500 shrink-0" />
                    <span className="shrink-0 font-sans">{t("prevHash") || "Prev Hash"}:</span>
                    {isGenesis ? (
                      <span className="text-slate-400 dark:text-zinc-500 italic">
                        0x0000...0000 (Genesis Root)
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setHighlightedBlockHeight(block.blockHeight - 1);
                          setTimeout(() => setHighlightedBlockHeight(null), 1500);
                        }}
                        className="text-purple-600 dark:text-purple-400 hover:underline truncate cursor-pointer font-bold"
                        title={`Points to Block #${block.blockHeight - 1}: ${block.prevHash}`}
                        aria-label={`Jump to previous block #${block.blockHeight - 1}`}
                      >
                        {block.prevHash.slice(0, 12)}...{block.prevHash.slice(-6)}
                      </button>
                    )}
                  </div>

                  <span className="text-[9px] text-slate-400 font-sans">
                    Nonce: {block.nonce}
                  </span>
                </div>
              </div>

              {/* Hash Chain Flow Arrow */}
              {!isLatest && (
                <div className="flex justify-center -mb-5 mt-2 text-indigo-400">
                  <ArrowDown className="h-3 w-3 animate-pulse opacity-60" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
