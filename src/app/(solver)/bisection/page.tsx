import SolverShell from "@/components/solver/SolverShell";
import type { Metadata } from "next";
import { ALGORITHM_CONFIG } from "@/lib/algorithm-config";

export const metadata: Metadata = {
  title: `${ALGORITHM_CONFIG['bisection'].title} | GTS`,
  description: ALGORITHM_CONFIG['bisection'].subtitle,
};

export default function Page() {
  return <SolverShell method="bisection" />;
}


