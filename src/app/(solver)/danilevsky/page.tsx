import SolverShell from "@/components/solver/SolverShell";
import type { Metadata } from "next";
import { ALGORITHM_CONFIG } from "@/lib/algorithm-config";

export const metadata: Metadata = {
  title: `${ALGORITHM_CONFIG['danilevsky'].title} | GTS`,
  description: ALGORITHM_CONFIG['danilevsky'].subtitle,
};

export default function Page() {
  return <SolverShell method="danilevsky" />;
}
