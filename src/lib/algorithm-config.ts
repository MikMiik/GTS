import { runBisection } from "@/lib/algorithms/bisection";
import { runTiepTuyen } from "@/lib/algorithms/tieptuyen";
import { runDayCung } from "@/lib/algorithms/daycung";
import { runLapDon } from "@/lib/algorithms/lapdon";
import { runGauss } from "@/lib/algorithms/gauss";
import { runGaussJordan } from "@/lib/algorithms/gaussjordan";
import { runNewtonSystem } from "@/lib/algorithms/newton-system";
import { runLapDonSystem } from "@/lib/algorithms/lapdon-system";
import { runDanilevsky } from "@/lib/algorithms/danilevsky";
import { runGaussSeidel } from "@/lib/algorithms/gauss-seidel";
import type { AlgoConfig, AlgorithmKey, Logger } from "@/types/solver";

export const ALGORITHM_CONFIG: Record<AlgorithmKey, AlgoConfig> = {
  bisection: {
    title: "Phương Pháp Chia Đôi",
    subtitle: "Bisection Method — f(x) = 0",
    icon: "⚡",
    defaultValues: {
      fStr: "Math.exp(x) - Math.cos(2*x)",
      a: "-1",
      b: "-0.1",
      epsilon: "0.5e-5",
    },
    run: runBisection,
  },
  tieptuyen: {
    title: "Phương Pháp Tiếp Tuyến",
    subtitle: "Newton-Raphson 1D — f(x) = 0",
    icon: "∂",
    defaultValues: {
      fStr: "Math.pow(x,5) - 17",
      dfStr: "5 * Math.pow(x,4)",
      ddfStr: "20 * Math.pow(x,3)",
      a: "1",
      b: "2",
      m1: "5",
      epsilon: "0.5e-6",
    },
    run: runTiepTuyen,
  },
  daycung: {
    title: "Phương Pháp Dây Cung",
    subtitle: "Secant/Chord Method — f(x) = 0",
    icon: "⌒",
    defaultValues: {
      fStr: "x**3 - x - 2",
      a: "1",
      b: "2",
      epsilon: "1e-6",
    },
    run: runDayCung,
  },
  lapdon: {
    title: "Lặp Đơn 1 Biến",
    subtitle: "Fixed-Point Iteration 1D — x = φ(x)",
    icon: "↺",
    defaultValues: {
      phiStr: "1 / Math.sqrt(x + 3)",
      x0: "0.5",
      q: "0.0963",
      epsilon: "5e-9",
    },
    run: runLapDon,
  },
  gauss: {
    title: "Phương Pháp Gauss",
    subtitle: "Forward Elimination + Back Substitution — Ax = B",
    icon: "▦",
    defaultValues: {
      matA: "1 2 1\n2 3 2\n1 1 3",
      matB: "8 1\n14 2\n10 3",
    },
    run: runGauss,
  },
  gaussjordan: {
    title: "Phương Pháp Gauss-Jordan",
    subtitle: "Row Reduction to RREF — Ax = B",
    icon: "▣",
    defaultValues: {
      matA: "2 4 5 -6\n0 -1 0 8\n0 0 0 0\n0 0 -1.5 -4",
      matB: "7 3\n-6 1\n0 0\n2.8 -1.5",
    },
    run: runGaussJordan,
  },
  "gauss-seidel": {
    title: "Phương Pháp Gauss-Seidel",
    subtitle: "Iterative Method — Ax = b",
    icon: "⟲",
    defaultValues: {
      matA: "10 5 7\n2 15 3\n-3 1 30",
      vecB: "11\n12\n19",
      x0Str: "0 0 0",
      epsilon: "1e-2",
      maxIter: "100",
    },
    run: runGaussSeidel,
  },
  "newton-system": {
    title: "Newton Hệ Phi Tuyến",
    subtitle: "Newton Method for Nonlinear Systems",
    icon: "∇",
    defaultValues: {
      x0Str: "0.1 0.1 -0.1",
      tol: "1e-6",
    },
    run: (params: Record<string, string>, logger: Logger) =>
      runNewtonSystem(params, logger),
  },
  "lapdon-system": {
    title: "Lặp Đơn Hệ Phi Tuyến",
    subtitle: "Fixed-Point Iteration for Nonlinear Systems",
    icon: "⟳",
    defaultValues: {
      x0Str: "0 0 0",
      q: "0.34",
      epsilon: "1e-6",
    },
    run: (params: Record<string, string>, logger: Logger) =>
      runLapDonSystem(params, logger),
  },
  danilevsky: {
    title: "Phương Pháp Danilevsky",
    subtitle: "Tìm Đa Thức Đặc Trưng",
    icon: "Δ",
    defaultValues: {
      matA: "2 1 0 3 1\n1 3 1 2 0\n0 1 4 1 2\n1 2 0 3 1\n0 0 3 4 2",
    },
    run: (params: Record<string, string>, logger: Logger) =>
      runDanilevsky(params, logger),
  },
};

export const SIDEBAR_SECTIONS = [
  {
    methods: ["bisection", "tieptuyen", "daycung", "lapdon"] as AlgorithmKey[],
  },
  {
    methods: ["gauss", "gaussjordan", "gauss-seidel"] as AlgorithmKey[],
  },
  {
    methods: ["newton-system", "lapdon-system"] as AlgorithmKey[],
  },
  {
    methods: ["danilevsky"] as AlgorithmKey[],
  },
] as const;
