"use client";

import { useEffect, useRef } from "react";
import type { AlgorithmKey } from "@/types/solver";

interface AlgorithmFormProps {
  method: AlgorithmKey;
  defaultValues: Record<string, string>;
  onSubmit: (params: Record<string, string>) => void;
}

export default function AlgorithmForm({
  method,
  defaultValues,
  onSubmit,
}: AlgorithmFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  // Reset form values when method changes
  useEffect(() => {
    if (!formRef.current) return;
    const form = formRef.current;
    for (const [key, value] of Object.entries(defaultValues)) {
      const el = form.elements.namedItem(key) as
        | HTMLInputElement
        | HTMLTextAreaElement
        | null;
      if (el) el.value = value;
    }
  }, [method, defaultValues]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;
    const form = formRef.current;
    const params: Record<string, string> = {};
    for (const key of Object.keys(defaultValues)) {
      const el = form.elements.namedItem(key) as
        | HTMLInputElement
        | HTMLTextAreaElement
        | null;
      if (el) params[key] = el.value;
    }
    onSubmit(params);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      formRef.current?.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
    }
  };

  return (
    <form id="solver-form" ref={formRef} onSubmit={handleSubmit}>
      <FormFields method={method} onKeyDown={handleKeyDown} />
    </form>
  );
}

// ---------- per-method form fields ----------

interface FieldProps {
  onKeyDown: React.KeyboardEventHandler<HTMLInputElement>;
}

function FormFields({ method, onKeyDown }: FieldProps & { method: AlgorithmKey }) {
  switch (method) {
    case "bisection": return <BisectionFields onKeyDown={onKeyDown} />;
    case "tieptuyen": return <TiepTuyenFields onKeyDown={onKeyDown} />;
    case "daycung":   return <DayCungFields onKeyDown={onKeyDown} />;
    case "lapdon":    return <LapDonFields onKeyDown={onKeyDown} />;
    case "gauss":     return <MatrixFields />;
    case "gaussjordan": return <GaussJordanFields />;
    case "gauss-seidel": return <GaussSeidelFields onKeyDown={onKeyDown} />;
    case "newton-system": return <NewtonSystemFields onKeyDown={onKeyDown} />;
    case "lapdon-system": return <LapDonSystemFields onKeyDown={onKeyDown} />;
    case "danilevsky": return <DanilevskyFields />;
    default: return null;
  }
}

function BisectionFields({ onKeyDown }: FieldProps) {
  return (
    <>
      <div className="form-section-title">Hàm số</div>
      <div className="form-group">
        <label className="form-label" htmlFor="in-f">Hàm <code>f(x)</code> (cú pháp JS)</label>
        <input className="form-input" id="in-f" name="fStr" type="text" spellCheck={false} autoComplete="off" onKeyDown={onKeyDown} />
        <div className="form-hint">Ví dụ: <code>Math.exp(x) - Math.cos(2*x)</code>, <code>x**3 - x - 2</code></div>
      </div>
      <div className="form-section-title">Khoảng cách ly nghiệm [a, b]</div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="in-a">Cận dưới <code>a</code></label>
          <input className="form-input" id="in-a" name="a" type="number" step="any" onKeyDown={onKeyDown} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="in-b">Cận trên <code>b</code></label>
          <input className="form-input" id="in-b" name="b" type="number" step="any" onKeyDown={onKeyDown} />
        </div>
      </div>
      <div className="form-section-title">Tham số</div>
      <div className="form-group">
        <label className="form-label" htmlFor="in-eps">Sai số <code>ε (epsilon)</code></label>
        <input className="form-input" id="in-eps" name="epsilon" type="text" spellCheck={false} onKeyDown={onKeyDown} />
        <div className="form-hint">Ví dụ: <code>0.5e-5</code>, <code>1e-6</code></div>
      </div>
    </>
  );
}

function TiepTuyenFields({ onKeyDown }: FieldProps) {
  return (
    <>
      <div className="form-section-title">Hàm số và đạo hàm</div>
      <div className="form-group">
        <label className="form-label" htmlFor="in-f">Hàm <code>f(x)</code></label>
        <input className="form-input" id="in-f" name="fStr" type="text" spellCheck={false} autoComplete="off" onKeyDown={onKeyDown} />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="in-df">Đạo hàm <code>f&apos;(x)</code></label>
        <input className="form-input" id="in-df" name="dfStr" type="text" spellCheck={false} autoComplete="off" onKeyDown={onKeyDown} />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="in-ddf">Đạo hàm bậc 2 <code>f&apos;&apos;(x)</code></label>
        <input className="form-input" id="in-ddf" name="ddfStr" type="text" spellCheck={false} autoComplete="off" onKeyDown={onKeyDown} />
      </div>
      <div className="form-section-title">Khoảng và tham số</div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="in-a">Cận dưới <code>a</code></label>
          <input className="form-input" id="in-a" name="a" type="number" step="any" onKeyDown={onKeyDown} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="in-b">Cận trên <code>b</code></label>
          <input className="form-input" id="in-b" name="b" type="number" step="any" onKeyDown={onKeyDown} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="in-m1"><code>m₁ = min|f&apos;(x)|</code> trên [a,b]</label>
          <input className="form-input" id="in-m1" name="m1" type="number" step="any" onKeyDown={onKeyDown} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="in-eps">Sai số <code>ε</code></label>
          <input className="form-input" id="in-eps" name="epsilon" type="text" onKeyDown={onKeyDown} />
        </div>
      </div>
    </>
  );
}

function DayCungFields({ onKeyDown }: FieldProps) {
  return (
    <>
      <div className="form-section-title">Hàm số</div>
      <div className="form-group">
        <label className="form-label" htmlFor="in-f">Hàm <code>f(x)</code></label>
        <input className="form-input" id="in-f" name="fStr" type="text" spellCheck={false} autoComplete="off" onKeyDown={onKeyDown} />
        <div className="form-hint">Đạo hàm f&apos; và f&apos;&apos; sẽ được tính số tự động.</div>
      </div>
      <div className="form-section-title">Khoảng và tham số</div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="in-a">Cận dưới <code>a</code></label>
          <input className="form-input" id="in-a" name="a" type="number" step="any" onKeyDown={onKeyDown} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="in-b">Cận trên <code>b</code></label>
          <input className="form-input" id="in-b" name="b" type="number" step="any" onKeyDown={onKeyDown} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="in-eps">Sai số <code>ε</code></label>
        <input className="form-input" id="in-eps" name="epsilon" type="text" onKeyDown={onKeyDown} />
      </div>
    </>
  );
}

function LapDonFields({ onKeyDown }: FieldProps) {
  return (
    <>
      <div className="form-section-title">Hàm lặp</div>
      <div className="form-group">
        <label className="form-label" htmlFor="in-phi">Hàm <code>φ(x)</code> (sao cho x = φ(x))</label>
        <input className="form-input" id="in-phi" name="phiStr" type="text" spellCheck={false} autoComplete="off" onKeyDown={onKeyDown} />
        <div className="form-hint">Ví dụ: <code>1 / Math.sqrt(x + 3)</code></div>
      </div>
      <div className="form-section-title">Tham số</div>
      <div className="form-group">
        <label className="form-label" htmlFor="in-x0">Điểm xuất phát <code>x₀</code></label>
        <input className="form-input" id="in-x0" name="x0" type="number" step="any" onKeyDown={onKeyDown} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="in-q">Hệ số co <code>q</code> (0 &lt; q &lt; 1)</label>
          <input className="form-input" id="in-q" name="q" type="number" step="any" min="0" max="1" onKeyDown={onKeyDown} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="in-eps">Sai số <code>ε</code></label>
          <input className="form-input" id="in-eps" name="epsilon" type="text" onKeyDown={onKeyDown} />
        </div>
      </div>
    </>
  );
}

function MatrixFields() {
  return (
    <>
      <div className="matrix-help">
        📋 Nhập mỗi hàng trên một dòng, các giá trị cách nhau bằng khoảng trắng hoặc dấu phẩy.<br />
        Ví dụ hàng: <code>1 2 1</code> hoặc <code>1, 2, 1</code>
      </div>
      <div className="form-section-title">Ma trận A (hệ số)</div>
      <div className="form-group">
        <label className="form-label" htmlFor="in-matA">Ma trận A</label>
        <textarea className="form-textarea" id="in-matA" name="matA" rows={4} spellCheck={false} />
      </div>
      <div className="form-section-title">Ma trận B (vế phải)</div>
      <div className="form-group">
        <label className="form-label" htmlFor="in-matB">Ma trận B (có thể nhiều cột)</label>
        <textarea className="form-textarea" id="in-matB" name="matB" rows={4} spellCheck={false} />
        <div className="form-hint">Mỗi hàng = 1 vế phải. Nhiều cột = giải đồng thời nhiều hệ.</div>
      </div>
    </>
  );
}

function GaussJordanFields() {
  return (
    <>
      <div className="matrix-help">
        📋 Nhập mỗi hàng trên một dòng, các giá trị cách nhau bằng khoảng trắng hoặc dấu phẩy.<br />
        Ví dụ: <code>2 4 5 -6</code>
      </div>
      <div className="form-section-title">Ma trận A (hệ số)</div>
      <div className="form-group">
        <label className="form-label" htmlFor="in-matA">Ma trận A</label>
        <textarea className="form-textarea" id="in-matA" name="matA" rows={5} spellCheck={false} />
      </div>
      <div className="form-section-title">Ma trận B (vế phải)</div>
      <div className="form-group">
        <label className="form-label" htmlFor="in-matB">Ma trận B</label>
        <textarea className="form-textarea" id="in-matB" name="matB" rows={5} spellCheck={false} />
      </div>
    </>
  );
}

function GaussSeidelFields({ onKeyDown }: FieldProps) {
  return (
    <>
      <div className="matrix-help">
        📋 Nhập ma trận vuông A (mỗi hàng một dòng) và vector b (mỗi dòng một giá trị).<br />
        Ví dụ hàng A: <code>10 5 7</code>
      </div>
      <div className="form-section-title">Ma trận A (hệ số)</div>
      <div className="form-group">
        <label className="form-label" htmlFor="in-matA">Ma trận A (n × n)</label>
        <textarea className="form-textarea" id="in-matA" name="matA" rows={4} spellCheck={false} />
      </div>
      <div className="form-section-title">Vector b (vế phải)</div>
      <div className="form-group">
        <label className="form-label" htmlFor="in-vecB">Vector b (mỗi dòng 1 giá trị)</label>
        <textarea className="form-textarea" id="in-vecB" name="vecB" rows={4} spellCheck={false} />
      </div>
      <div className="form-section-title">Tham số lặp</div>
      <div className="form-group">
        <label className="form-label" htmlFor="in-x0">Xấp xỉ đầu X⁽⁰⁾</label>
        <input className="form-input" id="in-x0" name="x0Str" type="text" spellCheck={false} onKeyDown={onKeyDown} />
        <div className="form-hint">Ví dụ: <code>0 0 0</code></div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="in-eps">Sai số <code>ε</code></label>
          <input className="form-input" id="in-eps" name="epsilon" type="text" onKeyDown={onKeyDown} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="in-maxIter">Số lặp tối đa <code>N</code></label>
          <input className="form-input" id="in-maxIter" name="maxIter" type="number" min="1" step="1" onKeyDown={onKeyDown} />
        </div>
      </div>
    </>
  );
}

function NewtonSystemFields({ onKeyDown }: FieldProps) {
  return (
    <>
      <div className="matrix-help">
        ⚙️ Hệ phương trình cố định từ bài toán mẫu:<br />
        <code>3x₁ - cos(x₂x₃) - 0.5 = 0</code><br />
        <code>x₁² - 81(x₂+0.1)² + sin(x₃) + 1.06 = 0</code><br />
        <code>e^(-x₁x₂) + 20x₃ + 9.1389 = 0</code>
      </div>
      <div className="form-section-title">Điểm xuất phát X₀</div>
      <div className="form-group">
        <label className="form-label" htmlFor="in-x0">X₀ = [x₁, x₂, x₃] (cách nhau bằng dấu cách hoặc phẩy)</label>
        <input className="form-input" id="in-x0" name="x0Str" type="text" spellCheck={false} onKeyDown={onKeyDown} />
        <div className="form-hint">Ví dụ: <code>0.1 0.1 -0.1</code></div>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="in-tol">Tolerance (sai số hội tụ)</label>
        <input className="form-input" id="in-tol" name="tol" type="text" onKeyDown={onKeyDown} />
      </div>
    </>
  );
}

function LapDonSystemFields({ onKeyDown }: FieldProps) {
  return (
    <>
      <div className="matrix-help">
        ⚙️ Hệ hàm lặp Φ cố định từ bài toán mẫu:<br />
        <code>φ₁ = (cos(x₂x₃) + 0.5) / 3</code><br />
        <code>φ₂ = (1/25)·√(x₁² + 0.3125) - 0.03</code><br />
        <code>φ₃ = -(1/20)·e^(-x₁x₂) - (10π-3)/60</code>
      </div>
      <div className="form-section-title">Điểm xuất phát X₀</div>
      <div className="form-group">
        <label className="form-label" htmlFor="in-x0">X₀ = [x₁, x₂, x₃]</label>
        <input className="form-input" id="in-x0" name="x0Str" type="text" spellCheck={false} onKeyDown={onKeyDown} />
        <div className="form-hint">Ví dụ: <code>0 0 0</code></div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="in-q">Hệ số co <code>q</code> (0 &lt; q &lt; 1)</label>
          <input className="form-input" id="in-q" name="q" type="number" step="any" onKeyDown={onKeyDown} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="in-eps">Sai số <code>ε</code></label>
          <input className="form-input" id="in-eps" name="epsilon" type="text" onKeyDown={onKeyDown} />
        </div>
      </div>
    </>
  );
}

function DanilevskyFields() {
  return (
    <>
      <div className="matrix-help">
        📋 Nhập ma trận vuông cấp n, mỗi hàng trên một dòng, các giá trị cách nhau bằng khoảng trắng hoặc dấu phẩy.<br />
        Ví dụ: <code>2 1 0 3 1</code>
      </div>
      <div className="form-section-title">Ma trận A (n × n)</div>
      <div className="form-group">
        <label className="form-label" htmlFor="in-matA">Ma trận vuông A</label>
        <textarea className="form-textarea" id="in-matA" name="matA" rows={6} spellCheck={false} />
      </div>
    </>
  );
}
