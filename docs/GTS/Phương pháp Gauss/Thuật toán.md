### Phương pháp khử Gauss (Gaussian Elimination)

**Đầu vào:** Ma trận hệ số $A \in \mathbb{R}^{m \times n}$, ma trận vế phải $B \in \mathbb{R}^{m \times p}$.

**Đầu ra:** Ma trận nghiệm $X$, hoặc thông báo vô nghiệm / vô số nghiệm.

---

**Bước 1: Quy trình thuận (Forward Elimination)**

- Lập ma trận mở rộng $[A|B]$.
- Duyệt từ cột $j = 1$ đến $n$, hàng $i$ tăng dần:
    1. Tìm phần tử có giá trị tuyệt đối lớn nhất trong cột $j$ (từ hàng $i$ trở xuống) — **chọn trục**.
    2. Nếu phần tử trục $\approx 0$: Cột $j$ toàn 0, bỏ qua (biến tự do).
    3. Hoán vị hàng nếu cần để đưa phần tử trục lên hàng $i$.
    4. Khử các hàng bên dưới: Với mỗi hàng $k > i$:
        $$L_k \leftarrow L_k - \frac{a_{kj}}{a_{ij}} L_i$$

**Bước 2: Kiểm tra tính nhất quán**

- Với các hàng không có trục: Nếu phần tử vế phải $\ne 0$ → Hệ **vô nghiệm**.

**Bước 3: Quy trình nghịch (Back Substitution)**

- Xác định biến tự do (các cột không có trục).
- Lần lượt giải ngược từ hàng cuối lên hàng đầu để tính từng biến trục $x_j$ theo các biến tự do và vế phải.

**Bước 4: Xuất nghiệm**

- Nếu không có biến tự do: Một nghiệm duy nhất $X = [x_1, x_2, \ldots, x_n]^T$.
- Nếu có $r$ biến tự do: Vô số nghiệm, biểu diễn nghiệm tổng quát qua $t_1, t_2, \ldots, t_r$.
