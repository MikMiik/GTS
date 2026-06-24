export function parseFraction(v: string): number {
  if (!v) return NaN;
  // Normalize: "- 2/3" -> "-2/3", "- 1 2/3" -> "-1 2/3"
  const str = v.trim().replace(/^-\s+/, "-");
  if (str === "") return NaN;

  // Hỗ trợ Mixed number: "1 2/3" hoặc "-1 2/3"
  const mixedMatch = str.match(/^(-?\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixedMatch) {
    const whole = Number(mixedMatch[1]);
    const num = Number(mixedMatch[2]);
    const den = Number(mixedMatch[3]);
    if (den === 0) return NaN;
    // Dùng whole < 0 hoặc str bắt đầu bằng '-' để xác định dấu
    const sign = str.startsWith("-") ? -1 : 1;
    return sign * (Math.abs(whole) + num / den);
  }

  // Phân số bình thường: "-2/3" hoặc "2/3"
  const fracMatch = str.match(/^(-?\d+)\s*\/\s*(\d+)$/);
  if (fracMatch) {
    const num = Number(fracMatch[1]);
    const den = Number(fracMatch[2]);
    if (den === 0) return NaN;
    return num / den;
  }

  // Decimal & Khoa học (Hỗ trợ dấu phẩy và e)
  const normalized = str.replace(",", ".");
  const num = Number(normalized);
  
  // Trả về NaN nếu kết quả không hợp lệ (ví dụ chứa ký tự lạ)
  return isNaN(num) ? NaN : num;
}
