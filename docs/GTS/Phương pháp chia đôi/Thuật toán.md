### Phương pháp chia đôi (Bisection)

**Đầu vào:** Hàm $f(x)$ liên tục, khoảng $[a, b]$ cách ly nghiệm (tức $f(a) \cdot f(b) < 0$), sai số $\varepsilon$.

**Đầu ra:** Nghiệm gần đúng $x^*$ thỏa $|x^* - x| \le \varepsilon$.

---

**Bước 1: Kiểm tra điều kiện**

- Tính $f(a)$ và $f(b)$.
- Nếu $f(a) \cdot f(b) \ge 0$: Khoảng không hợp lệ, dừng.

**Bước 2: Lặp chia đôi**

- Lặp với $k = 1, 2, \ldots$:
    1. Tính điểm giữa: $c_k = \dfrac{a + b}{2}$.
    2. Kiểm tra điều kiện dừng: Nếu $|b - a| < \varepsilon$ hoặc $f(c_k) = 0$, dừng — kết quả $x^* = c_k$.
    3. Cập nhật khoảng:
        - Nếu $f(a) \cdot f(c_k) < 0$: Đặt $b \leftarrow c_k$.
        - Ngược lại: Đặt $a \leftarrow c_k$.

**Bước 3: Kết quả**

- Nghiệm xấp xỉ: $x^* \approx c_k$.
- Sai số: $|x^* - x| \le \dfrac{b - a}{2^k}$.
