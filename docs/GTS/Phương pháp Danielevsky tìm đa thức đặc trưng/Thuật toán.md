### Phương pháp Danilevsky
**Đầu vào:** Ma trận vuông $A \in \mathbb{R}^{n \times n}$.
**Đầu ra:** Đa thức đặc trưng $P(\lambda)$, ma trận tích lũy $P$.
**Bước 1: Khởi tạo**
- Gán $k = n$.
- $P_{out}(\lambda) = 1$.
- $P = I_n$.
**Bước 2: Lặp ($k > 1$)**
Xét $a_{k, k-1}$:
- **Trường hợp 1:** $a_{k, k-1} = 0$ và $\exists s < k-1$ thỏa $a_{k, s} \neq 0$.
    - Lập ma trận hoán vị $C$ (đổi chỗ cột $s$ và cột $k-1$ của $I_k$).
    - $A \leftarrow C A C$, $P \leftarrow P C$.
    - Chuyển sang Trường hợp 2.
- **Trường hợp 2:** $a_{k, k-1} \neq 0$.
    - Lập ma trận khử $M$: Thay hàng $k-1$ của $I_k$ bằng hàng $k$ của $A$.
    - Lập $M^{-1}$.
    - $A \leftarrow M A M^{-1}$, $P \leftarrow P M^{-1}$.
    - $k \leftarrow k - 1$. Lặp Bước 2.
- **Trường hợp 3:** $a_{k, j} = 0, \forall j \le k-1$.
    - $P_{out}(\lambda) \leftarrow P_{out}(\lambda) \cdot (a_{kk} - \lambda)$.
    - Xóa hàng $k$ và cột $k$ của $A$.
    - $k \leftarrow k - 1$. Lặp Bước 2.
**Bước 3: Trích xuất đa thức đặc trưng**
- Thu được khối Frobenius cấp $m$. Trích hàng 1: $\begin{bmatrix} -p_1 & -p_2 & \dots & -p_m \end{bmatrix}$.
- $P_F(\lambda) = (-1)^m [\lambda^m + p_1\lambda^{m-1} + \dots + p_m]$.
- $P(\lambda) = P_{out}(\lambda) \cdot P_F(\lambda)$.
**Bước 4: Xác định véc-tơ riêng (Nếu cần)**
- Giải $P(\lambda) = 0$ tìm $\lambda_i$.
- Lập $u = \begin{bmatrix} \lambda_i^{m-1} & \dots & \lambda_i & 1 \end{bmatrix}^T$.
- Véc-tơ riêng gốc: Nhân $P$ với véc-tơ ghép từ $u$ và các số $0$ (nếu có hạ cấp).