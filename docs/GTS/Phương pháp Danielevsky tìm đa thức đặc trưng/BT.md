### C43
#### Thuật toán Danilevsky:**
**Input:** Ma trận vuông $A$ cấp $n$.
**Output:** Đa thức đặc trưng $P(\lambda) = \det(A - \lambda I)$.
**Bước 1: Khởi tạo**
- Gán $k = n$ (xét từ hàng cuối).
- Khởi tạo đa thức tích lũy $P_{out}(\lambda) = 1$.
**Bước 2: Lặp (Điều kiện: $k > 1$)**
Xét các phần tử trên hàng $k$ của ma trận $A$, tập trung vào vị trí sát đường chéo chính $a_{k, k-1}$:
- **Trường hợp 1: $a_{k, k-1} = 0$ và $\exists s < k-1$ sao cho $a_{k, s} \neq 0$**
	1. Lập ma trận hoán vị $C_{s \leftrightarrow k-1}$ bằng cách đổi chỗ cột $s$ và cột $k-1$ của ma trận đơn vị $I_n$.
	2. Biến đổi đồng dạng ma trận: $A^{(n-k+1)} \leftarrow C_{s \leftrightarrow k-1} \cdot A^{(n-k+1)} \cdot C_{s \leftrightarrow k-1}$.
- Chuyển trực tiếp sang xử lý tiếp theo quy trình của **Trường hợp 2**.
- **Trường hợp 2: $a_{k, k-1} \neq 0$**
    1. Lập ma trận khử $M$ cấp $k$: Lấy ma trận đơn vị $I_k$, thay hàng $k-1$ bằng toàn bộ hàng $k$ của ma trận $A$.
    2. Lập ma trận nghịch đảo $M^{-1}$ cấp $k$: 
    3. Cập nhật ma trận: $A \leftarrow M A M^{-1}$.
    4. Gán $k \leftarrow k - 1$. Quay lại đầu Bước 2.
- **Trường hợp 3: $a_{k, j} = 0, \forall j \le k-1$** $$A = \left[ \begin{array}{cccc|c} a_{11} & a_{12} & \dots & a_{1,k-1} & a_{1k} \\ a_{21} & a_{22} & \dots & a_{2,k-1} & a_{2k} \\ \vdots & \vdots & \ddots & \vdots & \vdots \\ a_{k-1,1} & a_{k-1,2} & \dots & a_{k-1,k-1} & a_{k-1,k} \\ \hline \mathbf{0} & \mathbf{0} & \dots & \mathbf{0} & a_{kk} \end{array} \right] = \begin{bmatrix} A_{k-1} & \Box \\ \theta & a_{kk} \end{bmatrix}$$
    1. Cập nhật đa thức tích lũy: $P_{out}(\lambda) \leftarrow P_{out}(\lambda) \cdot (a_{kk} - \lambda)$.
    2. Cập nhật ma trận $A$: Thu gọn thành ma trận con cấp $k-1$ bằng cách xóa hàng $k$ và cột $k$.
    3. Gán $k \leftarrow k - 1$. Quay lại đầu Bước 2.
**Bước 3: Trích xuất kết quả**
Khi vòng lặp dừng, ma trận thu được có dạng chuẩn Frobenius cấp $m$ ($m \le n$).
- Trích xuất các hệ số ở hàng 1 của ma trận hiện tại: $\begin{bmatrix} -p_1 & -p_2 & \dots & -p_m \end{bmatrix}$.
- Lập đa thức đặc trưng của khối Frobenius:
$$P_F(\lambda) = (-1)^m [\lambda^m + p_1\lambda^{m-1} + p_2\lambda^{m-2} + \dots + p_m]$$
- **Output:** $P(\lambda) = P_{out}(\lambda) \cdot P_F(\lambda)$. Lấy phương trình $P(\lambda) = 0$.
#### VD ma trận cấp $5 \times 5$

**Input:** Cho ma trận vuông $A$ cấp 5:

$$A = \begin{bmatrix} 2 & 1 & 0 & 3 & 1 \\ 1 & 3 & 1 & 2 & 0 \\ 0 & 1 & 4 & 1 & 2 \\ 1 & 2 & 0 & 3 & 1 \\ 0 & 0 & 3 & \mathbf{4} & 2 \end{bmatrix}$$
Bước 1: Khởi tạo
- Gán $k = 5$.
- $P_{out}(\lambda) = 1$.
Bước 2: Lặp lần 1 ($k = 5$)
Xét  $a_{5,4} = 4 \neq 0 \implies$ **Trường hợp 2**.
**1. Lập ma trận khử $M$ cấp 5:** Thay hàng 4 của ma trận đơn vị $I_5$ bằng hàng 5 của $A$.

$$M = \begin{bmatrix} 1 & 0 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 & 0 \\ 0 & 0 & 1 & 0 & 0 \\ 0 & 0 & 3 & 4 & 2 \\ 0 & 0 & 0 & 0 & 1 \end{bmatrix}$$

**2. Lập ma trận nghịch đảo $M^{-1}$:** 

$$M^{-1} = \begin{bmatrix} 1 & 0 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 & 0 \\ 0 & 0 & 1 & 0 & 0 \\ 0 & 0 & -0.75 & 0.25 & -0.5 \\ 0 & 0 & 0 & 0 & 1 \end{bmatrix}$$

**3. Cập nhật ma trận $A \leftarrow M A M^{-1}$:**

$$A = \begin{bmatrix} 2 & 1 & -2.25 & 0.75 & -0.5 \\ 1 & 3 & -0.5 & 0.5 & -1 \\ 0 & 1 & 3.25 & 0.25 & 1.5 \\ 13 & 22 & -1.75 & 6.25 & 3.5 \\ \mathbf{0} & \mathbf{0} & \mathbf{0} & \mathbf{1} & \mathbf{0} \end{bmatrix}$$

**4. Hạ cấp:** Gán $k = 4$.
- Bước 3: Vòng lặp điều kiện lần 2 ($k = 4$)
- Xét $a_{4,3} = -1.75 \neq 0 \implies$ **Trường hợp 2**.
**1. Lập ma trận khử $M$ cấp 4:** Thay hàng 3 bằng hàng 4.

$$M = \begin{bmatrix} 1 & 0 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 & 0 \\ 13 & 22 & -1.75 & 6.25 & 3.5 \\ 0 & 0 & 0 & 1 & 0 \\ 0 & 0 & 0 & 0 & 1 \end{bmatrix}$$

**2. Lập ma trận nghịch đảo $M^{-1}$:** Chia hàng 3 cho $-a_{4,3} = 1.75$:

$$M^{-1} = \begin{bmatrix} 1 & 0 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 & 0 \\ 7.429 & 12.571 & -0.571 & 3.571 & 2 \\ 0 & 0 & 0 & 1 & 0 \\ 0 & 0 & 0 & 0 & 1 \end{bmatrix}$$

**3. Cập nhật ma trận $A \leftarrow M A M^{-1}$:**

$$A = \begin{bmatrix} -3.571 & -8.429 & 1.286 & -2.286 & -2 \\ -2.714 & -3.286 & 0.286 & -1.286 & -2 \\ 133.429 & 228.571 & 15.286 & 67.286 & 31 \\ \mathbf{0} & \mathbf{0} & \mathbf{1} & \mathbf{0} & \mathbf{0} \\ 0 & 0 & 0 & 1 & 0 \end{bmatrix}$$

**4. Hạ cấp:** Gán $k = 3$.
Bước 4: Vòng lặp điều kiện lần 3 ($k = 3$)

Xét phần tử sát đường chéo chính tại hàng 3 hiện tại: $a_{3,2} = 228.571 \neq 0 \implies$ **Trường hợp 2**.

**1. Lập ma trận khử $M$ cấp 3:** Thay hàng 2 bằng hàng 3.

$$M = \begin{bmatrix} 1 & 0 & 0 & 0 & 0 \\ 133.429 & 228.571 & 15.286 & 67.286 & 31 \\ 0 & 0 & 1 & 0 & 0 \\ 0 & 0 & 0 & 1 & 0 \\ 0 & 0 & 0 & 0 & 1 \end{bmatrix}$$

**2. Lập ma trận nghịch đảo $M^{-1}$:** Chia hàng 2 cho $-a_{3,2} = -228.571$:

$$M^{-1} = \begin{bmatrix} 1 & 0 & 0 & 0 & 0 \\ -0.584 & 0.004 & -0.067 & -0.294 & -0.136 \\ 0 & 0 & 1 & 0 & 0 \\ 0 & 0 & 0 & 1 & 0 \\ 0 & 0 & 0 & 0 & 1 \end{bmatrix}$$

**3. Cập nhật ma trận $A \leftarrow M A M^{-1}$:**

$$A = \begin{bmatrix} 1.352 & -0.037 & 1.850 & 0.192 & -0.852 \\ 10.970 & 2.648 & 35.836 & 25.132 & 23.360 \\ \mathbf{0} & \mathbf{1} & \mathbf{0} & \mathbf{0} & \mathbf{0} \\ 0 & 0 & 1 & 0 & 0 \\ 0 & 0 & 0 & 1 & 0 \end{bmatrix}$$
**4. Hạ cấp:** Gán $k = 2$.
Bước 5: Vòng lặp điều kiện lần 4 ($k = 2$)
Xét $a_{2,1} = 10.970 \neq 0 \implies$ **Trường hợp 2**.
**1. Lập ma trận khử $M$ cấp 2:** Thay hàng 1 bằng hàng 2.

$$M = \begin{bmatrix} 10.970 & 2.648 & 35.836 & 25.132 & 23.360 \\ 0 & 1 & 0 & 0 & 0 \\ 0 & 0 & 1 & 0 & 0 \\ 0 & 0 & 0 & 1 & 0 \\ 0 & 0 & 0 & 0 & 1 \end{bmatrix}$$

**2. Lập ma trận nghịch đảo $M^{-1}$:** Chia hàng 1 cho $-a_{2,1} = -10.970$:

$$M^{-1} = \begin{bmatrix} 0.091 & -0.241 & -3.267 & -2.291 & -2.129 \\ 0 & 1 & 0 & 0 & 0 \\ 0 & 0 & 1 & 0 & 0 \\ 0 & 0 & 0 & 1 & 0 \\ 0 & 0 & 0 & 0 & 1 \end{bmatrix}$$

**3. Cập nhật ma trận $A \leftarrow M A M^{-1}$ (Thu được ma trận chuẩn Frobenius $F$):**

$$F = \begin{bmatrix} \mathbf{4} & \mathbf{-4.108} & \mathbf{-14.417} & \mathbf{-13.065} & \mathbf{-11.168} \\ \mathbf{1} & \mathbf{0} & \mathbf{0} & \mathbf{0} & \mathbf{0} \\ 0 & 1 & 0 & 0 & 0 \\ 0 & 0 & 1 & 0 & 0 \\ 0 & 0 & 0 & 1 & 0 \end{bmatrix}$$

**4. Hạ cấp:** Gán $k = 1 \implies$ Vòng lặp dừng.
Bước 3: Trích xuất kết quả
Ma trận đạt dạng chuẩn Frobenius cấp $m = 5$. Trích xuất các hệ số ở hàng 1:
$$\begin{bmatrix} -p_1 & -p_2 & -p_3 & -p_4 & -p_5 \end{bmatrix} = \begin{bmatrix} 4 & -4.108 & -14.417 & -13.065 & -11.168 \end{bmatrix}$$
Suy ra bộ hệ số nguyên bản:
$$p_1 = -4, \quad p_2 = 4.108, \quad p_3 = 14.417, \quad p_4 = 13.065, \quad p_5 = 11.168$$
**Output:** Do $P_{out}(\lambda) = 1$, đa thức đặc trưng của ma trận $A$ là:
$$P(\lambda) = (-1)^5 [\lambda^5 - 4\lambda^4 + 4.108\lambda^3 + 14.417\lambda^2 + 13.065\lambda + 11.168] = 0$$
