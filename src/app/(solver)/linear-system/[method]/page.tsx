import { notFound } from "next/navigation";
import SolverShell from "@/components/solver/SolverShell";
import type { AlgorithmKey } from "@/types/solver";
import type { Metadata } from "next";
import { ALGORITHM_CONFIG } from "@/lib/algorithm-config";

const VALID_METHODS = ["gauss", "gaussjordan"] as const;

interface Props {
  params: Promise<{ method: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { method } = await params;
  const cfg = ALGORITHM_CONFIG[method as AlgorithmKey];
  if (!cfg) return { title: "GTS — Giải Tích Số" };
  return { title: `${cfg.title} | GTS`, description: cfg.subtitle };
}

export default async function LinearSystemPage({ params }: Props) {
  const { method } = await params;
  if (!VALID_METHODS.includes(method as (typeof VALID_METHODS)[number])) {
    notFound();
  }
  return <SolverShell method={method as AlgorithmKey} />;
}

export function generateStaticParams() {
  return VALID_METHODS.map((method) => ({ method }));
}
