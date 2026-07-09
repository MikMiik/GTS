### Thuật toán C1: Phương pháp xuống thang (Sử dụng véc-tơ riêng trái)

**Đầu vào:** Ma trận $A \in \mathbb{R}^{n \times n}$, giá trị riêng trội $\lambda_1$, véc-tơ riêng $v_1$, sai số $\epsilon$.
**Đầu ra:** Giá trị riêng trội thứ hai $\lambda_2$
**Bước 1: Xác định véc-tơ riêng trái $w_1$**
- Giải $(A^T - \lambda_1 I)w_1 = 0$ tìm $w_1 \neq 0$.
**Bước 2: Tính véc-tơ $x$**
- $x = \frac{w_1}{w_1^T v_1}$.
**Bước 3: Lập ma trận xuống thang $B$**
- $B = A - \lambda_1 v_1 x^T$.
**Bước 4: Tìm $\lambda_2$ bằng phương pháp lũy thừa trên $B$**
- Chọn $y_0 \neq 0$.
- Lặp $k \ge 0$:
    - Tính $z_{k+1} = B y_k$.
    - Tìm chỉ số $p$ sao cho $|(z_{k+1})_p|$ max.
    - Gán $\lambda_2^{(k+1)} = (z_{k+1})_p$.
    - Chuẩn hóa $y_{k+1} = \frac{z_{k+1}}{(z_{k+1})_p}$.
    - Dừng nếu $\|y_{k+1} - y_k\|_\infty < \epsilon$. Thu được $\lambda_2 = \lambda_2^{(k+1)}$.
### Thuật toán C2: Phương pháp xuống thang (Sử dụng phép biến đổi ma trận)
**Đầu vào:** Ma trận $A \in \mathbb{R}^{n \times n}$, giá trị riêng trội $\lambda_1$, véc-tơ riêng $v_1$, sai số $\epsilon$.
**Đầu ra:** Giá trị riêng trội thứ hai $\lambda_2$.
**Bước 1: Chuẩn hóa $v_1$**
- Tìm chỉ số $s$ sao cho $|(v_1)_s|$ max.
- Cập nhật $v_1 = \frac{v_1}{(v_1)_s}$ (để thành phần thứ $s$ bằng 1).
**Bước 2: Lập ma trận khử $\Theta$**
- Khởi tạo $\Theta = I_n$.
- Cập nhật cột $s$ của $\Theta$: $\Theta_{i, s} = \Theta_{i, s} - (v_1)_i$ với $i = \overline{1,n}$.
**Bước 3: Lập ma trận xuống thang $A^{(2)}$**
- $A^{(2)} = \Theta A$.
**Bước 4: Tìm $\lambda_2$ bằng phương pháp lũy thừa trên $A^{(2)}$**
- Chọn $y_0 \neq 0$.
- Lặp $k \ge 0$:
    - Tính $z_{k+1} = A^{(2)} y_k$.
    - Tìm chỉ số $p$ sao cho $|(z_{k+1})_p|$ max.
    - Gán $\lambda_2^{(k+1)} = (z_{k+1})_p$.
    - Chuẩn hóa $y_{k+1} = \frac{z_{k+1}}{(z_{k+1})_p}$.
    - Dừng nếu $\|y_{k+1} - y_k\|_\infty < \epsilon$. Thu được $\lambda_2 = \lambda_2^{(k+1)}$.