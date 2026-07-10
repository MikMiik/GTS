### Phương pháp dây cung (Secant)

**Đầu vào:** Hàm $f(x)$ liên tục, khoảng $[a, b]$ cách ly nghiệm ($f(a) \cdot f(b) < 0$), sai số $\varepsilon$.

**Đầu ra:** Nghiệm gần đúng $x^*$.

---

**Bước 1: Xác định điểm cố định $d$ và điểm xuất phát $x_0$**

- Tính đạo hàm thứ hai $f''$ (ước lượng số) tại $a$ và $b$.
- Chọn $d$ là điểm thỏa $f(d) \cdot f''(d) > 0$ (điểm Fourier — phía hàm lõm về phía trục $Ox$).
- Chọn $x_0$ là điểm còn lại.

**Bước 2: Ước lượng $m_1$**

- Tính $m_1 = \min_{[a,b]} |f'(x)|$ (ước lượng bằng lấy mẫu trên $[a, b]$).
- Nếu $m_1 \approx 0$: Phương pháp không áp dụng được, dừng.

**Bước 3: Lặp tính nghiệm**

- Công thức: $x_{k+1} = x_k - \dfrac{f(x_k)(x_k - d)}{f(x_k) - f(d)}$
- Kiểm tra điều kiện dừng sau mỗi bước:
    - Nếu $\dfrac{|f(x_k)|}{m_1} \le \varepsilon$: Dừng, $x^* \approx x_{k+1}$.
    - Ngược lại: Đặt $x_k \leftarrow x_{k+1}$ và lặp tiếp.
