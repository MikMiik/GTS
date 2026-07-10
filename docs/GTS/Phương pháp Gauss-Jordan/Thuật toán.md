### Phương pháp Gauss-Jordan (Reduced Row Echelon Form)

**Đầu vào:** Ma trận hệ số $A \in \mathbb{R}^{m \times n}$, ma trận vế phải $B \in \mathbb{R}^{m \times p}$.

**Đầu ra:** Ma trận nghiệm $X$, hoặc thông báo vô nghiệm / vô số nghiệm.

---

**Bước 1: Quy trình thuận (Forward Elimination — giống Gauss)**

- Lập ma trận mở rộng $[A|B]$.
- Duyệt cột $j = 1$ đến $n$, hàng $i$ tăng dần:
    1. Tìm trục (phần tử lớn nhất tuyệt đối trong cột $j$, từ hàng $i$).
    2. Nếu trục $\approx 0$: Bỏ qua cột (biến tự do).
    3. Hoán vị hàng (nếu cần) và chuẩn hóa hàng trục: $L_i \leftarrow \dfrac{L_i}{a_{ij}}$ (chia để $a_{ij} = 1$).
    4. Khử **cả phía trên lẫn phía dưới** phần tử trục: Với mọi hàng $k \ne i$:
        $$L_k \leftarrow L_k - a_{kj} \cdot L_i$$

**Bước 2: Kiểm tra tính nhất quán**

- Với các hàng không có trục: Nếu phần tử vế phải $\ne 0$ → Hệ **vô nghiệm**.

**Bước 3: Đọc nghiệm trực tiếp**

- Xác định biến tự do (cột không có trục).
- Mỗi hàng có trục cho ngay $x_j = \ldots$ (không cần thế ngược).

> **Khác biệt so với Gauss:** Gauss-Jordan khử cả hướng lên (trên trục), tạo dạng bậc thang rút gọn — đọc nghiệm trực tiếp mà không cần thế ngược.
