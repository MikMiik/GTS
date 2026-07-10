### Thuật toán trực chuẩn hóa Gram-Schmidt

**Đầu vào:** Tập hợp các véc-tơ độc lập tuyến tính $V = \{v_1, v_2, \dots, v_n\}$ trong không gian $\mathbb{R}^m$.

**Đầu ra:** Tập hợp các véc-tơ trực chuẩn $E = \{e_1, e_2, \dots, e_n\}$.

---

**Bước 1: Trực giao hóa (Tìm hệ véc-tơ trực giao $U = \{u_1, u_2, \dots, u_n\}$)**

- Đặt véc-tơ đầu tiên: 
  $$u_1 = v_1$$

- Với mỗi $k$ chạy từ $2 \to n$, tính véc-tơ trực giao $u_k$:
  $$u_k = v_k - \sum_{i=1}^{k-1} \frac{\langle v_k, u_i \rangle}{\langle u_i, u_i \rangle} u_i$$

  Trong đó:
  - $\langle x, y \rangle = \sum_{j=1}^m x_j y_j$ là tích vô hướng của hai véc-tơ $x$ và $y$.
  - Nếu tồn tại $u_i \approx 0$ (phụ thuộc tuyến tính), bỏ qua phép chiếu tương ứng để tránh chia cho 0.

**Bước 2: Trực chuẩn hóa (Tìm hệ véc-tơ trực chuẩn $E = \{e_1, e_2, \dots, e_n\}$)**

- Với mỗi $i$ chạy từ $1 \to n$:
  - Tính chuẩn Euclide (độ dài) của $u_i$:
    $$\|u_i\| = \sqrt{\langle u_i, u_i \rangle}$$
  
  - Nếu $\|u_i\| = 0$: Gán $e_i = u_i$.
  
  - Nếu $\|u_i\| > 0$: Chuẩn hóa véc-tơ:
    $$e_i = \frac{u_i}{\|u_i\|}$$
