### Xác định giá trị kỳ dị, các vector kỳ dị và viết khai triển
**Đầu vào:** Ma trận $A \in \mathbb{R}^{m \times n}$.
**Đầu ra:** $U \in \mathbb{R}^{m \times m}$, $\Sigma \in \mathbb{R}^{m \times n}$, $V \in \mathbb{R}^{n \times n}$ sao cho $A = U\Sigma V^T$.
**Bước 1: Tính ma trận $A^TA$**
**Bước 2: Tìm giá trị riêng và vector riêng của $A^TA$**
- Giải $\det(A^TA - \lambda I) = 0$ tìm $\lambda_i$.
- Sắp xếp $\lambda_i$ giảm dần: $\lambda_1 \ge \lambda_2 \ge \dots \ge \lambda_r > 0$ và $\lambda_{r+1} = \dots = \lambda_n = 0$.
- Với mỗi $\lambda_i$, giải $(A^TA - \lambda_i I)x = 0$ tìm vector riêng $v_i$.
- Trực chuẩn hóa hệ $\{v_1, v_2, \dots, v_n\}$ (dùng Gram-Schmidt nếu cần).
**Bước 3: Xác định ma trận $\Sigma$**
- Tính $\sigma_i = \sqrt{\lambda_i}$ với $i = \overline{1,r}$.
- Lập $\Sigma \in \mathbb{R}^{m \times n}$. Đặt $\sigma_1, \dots, \sigma_r$ lên đường chéo chính, các phần tử còn lại bằng $0$.
**Bước 4: Lập ma trận $V$**
- Lập ma trận trực giao $V = \begin{bmatrix} v_1 & v_2 & \dots & v_n \end{bmatrix}$.
- Lấy chuyển vị $V^T$.
**Bước 5: Lập ma trận $U$**
- **Với $r$ cột đầu ($i = \overline{1,r}$):** Tính $u_i = \frac{1}{\sigma_i}Av_i$.
- **Với $m - r$ cột còn lại:** Giải $(AA^T - 0I)u = 0$, chọn các vector cơ sở trực chuẩn $u_{r+1}, \dots, u_m$.
- Lập ma trận trực giao $U = \begin{bmatrix} u_1 & u_2 & \dots & u_m \end{bmatrix}$.
**Bước 6: Khai triển SVD**
- $A = U\Sigma V^T$.
---
### Tìm ma trận nghịch đảo suy rộng
**Đầu vào:** Ma trận $A \in \mathbb{R}^{m \times n}$.
**Đầu ra:** Ma trận nghịch đảo suy rộng $A^\dagger \in \mathbb{R}^{n \times m}$.
**Bước 1: Tính ma trận $A^TA$**
**Bước 2: Tìm giá trị riêng và vector riêng của $A^TA$**
- Giải $\det(A^TA - \lambda I) = 0$ tìm $\lambda_i$.
- Sắp xếp $\lambda_i$ giảm dần: $\lambda_1 \ge \lambda_2 \ge \dots \ge \lambda_r > 0$ và $\lambda_{r+1} = \dots = \lambda_n = 0$.
- Với mỗi $\lambda_i$, giải $(A^TA - \lambda_i I)x = 0$ tìm vector riêng $v_i$.
- Trực chuẩn hóa hệ $\{v_1, v_2, \dots, v_n\}$.
**Bước 3: Lập ma trận $V$**
- Lập ma trận trực giao $V = \begin{bmatrix} v_1 & v_2 & \dots & v_n \end{bmatrix} \in \mathbb{R}^{n \times n}$.
**Bước 4: Lập ma trận $U$**
- **Với $r$ cột đầu ($i = \overline{1,r}$):** Tính $u_i = \frac{1}{\sqrt{\lambda_i}}Av_i$.
- **Với $m - r$ cột còn lại:** Giải $(AA^T - 0I)u = 0$, chọn các vector cơ sở trực chuẩn $u_{r+1}, \dots, u_m$.
- Lập ma trận trực giao $U = \begin{bmatrix} u_1 & u_2 & \dots & u_m \end{bmatrix} \in \mathbb{R}^{m \times m}$.
**Bước 5: Lập ma trận $\Sigma^{-1}$**
- Tính $\sigma_i = \sqrt{\lambda_i}$ với $i = \overline{1,r}$.
- Lập $\Sigma^{-1} \in \mathbb{R}^{n \times m}$. Đặt $\frac{1}{\sigma_1}, \dots, \frac{1}{\sigma_r}$ lên đường chéo chính, các phần tử còn lại bằng $0$.
**Bước 6: Tính $A^\dagger$**
- $A^\dagger = V\Sigma^{-1}U^T$.
---
### Tính số điều kiện của ma trận
**Đầu vào:** Ma trận khả nghịch $A \in \mathbb{R}^{n \times n}$.
**Đầu ra:** Số điều kiện $cond(A)$.
**Bước 1:** Tính ma trận $A^TA$.
**Bước 2:** Giải $\det(A^TA - \lambda I) = 0$ tìm $\lambda_i$.
**Bước 3:** Tính $\sigma_i = \sqrt{\lambda_i}$.
**Bước 4:** Xác định $\sigma_{\max}$ và $\sigma_{\min}$.
**Bước 5:** Tính $cond(A) = \frac{\sigma_{\max}}{\sigma_{\min}}$.
_Lưu ý:_ Nếu $\sigma_{\min} = 0$ ($A$ suy biến), quy ước $cond(A) \to \infty$.