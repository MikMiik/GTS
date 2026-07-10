### Phương pháp tiếp tuyến (Newton–Raphson)

**Đầu vào:** Hàm $f(x)$, đạo hàm $f'(x)$, đạo hàm bậc hai $f''(x)$, khoảng $[a, b]$ chứa nghiệm, $m_1 = \min_{[a,b]} |f'(x)|$, sai số $\varepsilon$.

**Đầu ra:** Nghiệm gần đúng $x^*$ thỏa $|x^* - x| \le \varepsilon$.

---

**Bước 1: Chọn điểm xuất phát $x_0$ (điểm Fourier)**

- Chọn $x_0 \in \{a, b\}$ sao cho $f(x_0) \cdot f''(x_0) > 0$ (đảm bảo hội tụ đơn điệu).

**Bước 2: Lặp Newton**

- Công thức: $x_{n+1} = x_n - \dfrac{f(x_n)}{f'(x_n)}$
- Lặp với $n = 0, 1, 2, \ldots$:
    1. Nếu $f'(x_n) \approx 0$: Dừng với thông báo lỗi.
    2. Tính $x_{n+1}$ theo công thức trên.
    3. Ước lượng sai số: $\Delta_n = \dfrac{|f(x_n)|}{m_1}$.
    4. Nếu $\Delta_n \le \varepsilon$: Dừng, $x^* \approx x_{n+1}$.
    5. Ngược lại: Đặt $x_n \leftarrow x_{n+1}$ và lặp tiếp.

**Ghi chú:** Phương pháp hội tụ bậc 2 (rất nhanh) khi chọn đúng $x_0$.
