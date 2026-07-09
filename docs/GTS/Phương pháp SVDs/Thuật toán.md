### Xác định giá trị kỳ dị, các vector kỳ dị và viết khai triển

**Đầu vào:** Ma trận $A \in \mathbb{R}^{m \times n}$.

**Đầu ra:** Ma trận $U \in \mathbb{R}^{m \times m}$, $\Sigma \in \mathbb{R}^{m \times n}$, và $V \in \mathbb{R}^{n \times n}$ sao cho $A = U\Sigma V^T$.

**Bước 1: Tính ma trận đối xứng**

- Tính tích ma trận $A^TA$ để được ma trận đối xứng kích thước $n \times n$.

**Bước 2: Tìm giá trị riêng và vector riêng của $A^TA$**

- Giải phương trình đặc trưng $\det(A^TA - \lambda I) = 0$ để tìm các giá trị riêng $\lambda_i$.
- Sắp xếp các giá trị riêng giảm dần: $\lambda_1 \ge \lambda_2 \ge \dots \ge \lambda_r > 0$ và $\lambda_{r+1} = \dots = \lambda_n = 0$.
- Với mỗi $\lambda_i$, giải hệ $(A^TA - \lambda_i I)x = 0$ để tìm các vector riêng tương ứng $v_i$.
- Trực chuẩn hóa hệ vector $\{v_1, v_2, \dots, v_n\}$ (sử dụng Gram-Schmidt nếu cần) để chúng có độ dài bằng $1$ và trực giao từng đôi một.

**Bước 3: Xác định ma trận giá trị kỳ dị $\Sigma$**

- Tính các giá trị kỳ dị: $\sigma_i = \sqrt{\lambda_i}$ với $i = \overline{1,r}$.
- Lập ma trận $\Sigma$ kích thước $m \times n$. Đặt $\sigma_1, \sigma_2, \dots, \sigma_r$ lên đường chéo chính từ góc trên cùng bên trái, tất cả các phần tử còn lại bằng $0$.

**Bước 4: Lập ma trận vector kỳ dị phải $V$**

- Xếp các vector riêng trực chuẩn $v_i$ thành các cột để tạo ma trận trực giao $V = \begin{bmatrix} v_1 & v_2 & \dots & v_n \end{bmatrix}$.
- Lấy chuyển vị để có $V^T$.

**Bước 5: Lập ma trận vector kỳ dị trái $U$**

- **Với $r$ cột đầu tiên ($i = \overline{1,r}$):** Tính $u_i = \frac{1}{\sigma_i}Av_i$.
- **Với $m - r$ cột còn lại (để hoàn thành SVD đầy đủ):** Tìm không gian nghiệm của ma trận $AA^T$ ứng với giá trị riêng $\lambda = 0$. Chọn các vector cơ sở trực chuẩn $u_{r+1}, \dots, u_m$ từ không gian này.
- Xếp các vector thu được thành các cột để tạo ma trận trực giao $U = \begin{bmatrix} u_1 & u_2 & \dots & u_m \end{bmatrix}$.

**Bước 6: Khai triển SVD**

- Viết kết quả dưới dạng tích ma trận: $A = U\Sigma V^T$.

#### VD ma trận hạng không đủ

Tìm khai triển SVD đầy đủ cho ma trận:

$$A = \begin{bmatrix} 1 & 1 \\ 0 & 0 \\ 0 & 0 \end{bmatrix} \in \mathbb{R}^{3 \times 2}$$

Dễ thấy kích thước $m = 3, n = 2$. Hạng của ma trận $rank(A) = r = 1 < 2$.

#### Các bước thực hiện toán học

#### Bước 1: Tính ma trận đối xứng $A^TA$

$$A^TA = \begin{bmatrix} 1 & 0 & 0 \\ 1 & 0 & 0 \end{bmatrix} \begin{bmatrix} 1 & 1 \\ 0 & 0 \\ 0 & 0 \end{bmatrix} = \begin{bmatrix} 1 & 1 \\ 1 & 1 \end{bmatrix} \in \mathbb{R}^{2 \times 2}$$

#### Bước 2: Tìm giá trị riêng và vector riêng trực chuẩn của $A^TA$

- Giải phương trình đặc trưng: $\det(A^TA - \lambda I) = (1-\lambda)^2 - 1 = 0 \Rightarrow \lambda^2 - 2\lambda = 0$.
- Thu được các giá trị riêng sắp xếp giảm dần: $\lambda_1 = 2$ và $\lambda_2 = 0$.
- **Tìm $v_1$ ứng với $\lambda_1 = 2$:**
  $$(A^TA - 2I)v_1 = 0 \Rightarrow \begin{bmatrix} -1 & 1 \\ 1 & -1 \end{bmatrix}\begin{bmatrix} x \\ y \end{bmatrix} = \begin{bmatrix} 0 \\ 0 \end{bmatrix} \Rightarrow x = y \Rightarrow v_1 = \frac{1}{\sqrt{2}}\begin{bmatrix} 1 \\ 1 \end{bmatrix}$$
- **Tìm $v_2$ ứng với $\lambda_2 = 0$ (Đây là bước bổ sung vào $V$):**
  $$(A^TA - 0I)v_2 = 0 \Rightarrow \begin{bmatrix} 1 & 1 \\ 1 & 1 \end{bmatrix}\begin{bmatrix} x \\ y \end{bmatrix} = \begin{bmatrix} 0 \\ 0 \end{bmatrix} \Rightarrow x = -y \Rightarrow v_2 = \frac{1}{\sqrt{2}}\begin{bmatrix} 1 \\ -1 \end{bmatrix}$$

Ta lập được ma trận vuông trực giao $V \in \mathbb{R}^{2 \times 2}$:

$$V = \begin{bmatrix} v_1 & v_2 \end{bmatrix} = \frac{1}{\sqrt{2}}\begin{bmatrix} 1 & 1 \\ 1 & -1 \end{bmatrix}$$

#### Bước 3: Xác định ma trận giá trị kỳ dị $\Sigma$

- Các giá trị kỳ dị: $\sigma_1 = \sqrt{\lambda_1} = \sqrt{2}$. Giá trị còn lại bằng $0$.
- Lập ma trận $\Sigma$ có cùng kích thước với $A$ ($3 \times 2$):
  $$\Sigma = \begin{bmatrix} \sqrt{2} & 0 \\ 0 & 0 \\ 0 & 0 \end{bmatrix}$$

#### Bước 4: Lập ma trận vector kỳ dị trái $U$ (Bao gồm bước bổ sung)

- **Tính các cột chính thức ($i = 1 \dots r$):** Với $r = 1$, ta tính $u_1$ dựa vào $v_1$:
  $$u_1 = \frac{1}{\sigma_1}Av_1 = \frac{1}{\sqrt{2}} \begin{bmatrix} 1 & 1 \\ 0 & 0 \\ 0 & 0 \end{bmatrix} \left( \frac{1}{\sqrt{2}}\begin{bmatrix} 1 \\ 1 \end{bmatrix} \right) = \frac{1}{2} \begin{bmatrix} 2 \\ 0 \\ 0 \end{bmatrix} = \begin{bmatrix} 1 \\ 0 \\ 0 \end{bmatrix}$$
- **Bổ sung các cột thiếu ($u_2, u_3$):** Vì $m = 3$ mà mới chỉ có $u_1$, ta cần bổ sung thêm 2 vector trực chuẩn ứng với giá trị riêng bằng $0$ của ma trận $AA^T$:
  $$AA^T = \begin{bmatrix} 1 & 1 \\ 0 & 0 \\ 0 & 0 \end{bmatrix} \begin{bmatrix} 1 & 0 & 0 \\ 1 & 0 & 0 \end{bmatrix} = \begin{bmatrix} 2 & 0 & 0 \\ 0 & 0 & 0 \\ 0 & 0 & 0 \end{bmatrix}$$
  Giải hệ phương trình $(AA^T - 0I)u = 0$:
  $$\begin{bmatrix} 2 & 0 & 0 \\ 0 & 0 & 0 \\ 0 & 0 & 0 \end{bmatrix} \begin{bmatrix} x \\ y \\ z \end{bmatrix} = \begin{bmatrix} 0 \\ 0 \\ 0 \end{bmatrix} \Rightarrow x = 0; \text{ còn } y, z \text{ tự do.}$$
  Chọn 2 vector cơ sở trực chuẩn cho không gian nghiệm này:
  $$u_2 = \begin{bmatrix} 0 \\ 1 \\ 0 \end{bmatrix}, \quad u_3 = \begin{bmatrix} 0 \\ 0 \\ 1 \end{bmatrix}$$

Ta lập được ma trận vuông trực giao $U \in \mathbb{R}^{3 \times 3}$:

$$U = \begin{bmatrix} u_1 & u_2 & u_3 \end{bmatrix} = \begin{bmatrix} 1 & 0 & 0 \\ 0 & 1 & 0 \\ 0 & 0 & 1 \end{bmatrix}$$

Kết quả Khai triển SVD đầy đủ

$$A = U\Sigma V^T = \begin{bmatrix} 1 & 0 & 0 \\ 0 & 1 & 0 \\ 0 & 0 & 1 \end{bmatrix} \begin{bmatrix} \sqrt{2} & 0 \\ 0 & 0 \\ 0 & 0 \end{bmatrix} \left( \frac{1}{\sqrt{2}}\begin{bmatrix} 1 & 1 \\ 1 & -1 \end{bmatrix} \right)$$

### Tìm ma trận nghịch đảo suy rộng

**Đầu vào:** Ma trận $A \in \mathbb{R}^{m \times n}$.

**Đầu ra:** Ma trận nghịch đảo suy rộng $A^\dagger \in \mathbb{R}^{n \times m}$.

**Bước 1: Tính ma trận đối xứng**

- Tính tích ma trận $A^TA$ để được ma trận đối xứng kích thước $n \times n$.

**Bước 2: Tìm giá trị riêng và vector riêng của $A^TA$**

- Giải phương trình đặc trưng $\det(A^TA - \lambda I) = 0$ để tìm các giá trị riêng $\lambda_i$.
- Sắp xếp các giá trị riêng giảm dần: $\lambda_1 \ge \lambda_2 \ge \dots \ge \lambda_r > 0$ và $\lambda_{r+1} = \dots = \lambda_n = 0$.
- Với mỗi $\lambda_i$, giải hệ $(A^TA - \lambda_i I)x = 0$ để tìm các vector riêng tương ứng $v_i$.
- Trực chuẩn hóa hệ vector $\{v_1, v_2, \dots, v_n\}$ để chúng có độ dài bằng $1$ và trực giao từng đôi một.

**Bước 3: Lập ma trận vector kỳ dị phải $V$**

- Xếp các vector riêng trực chuẩn $v_i$ thành các cột để tạo ma trận trực giao $V = \begin{bmatrix} v_1 & v_2 & \dots & v_n \end{bmatrix} \in \mathbb{R}^{n \times n}$.

**Bước 4: Lập ma trận vector kỳ dị trái $U$**

- **Với $r$ cột đầu tiên ($i = \overline{1,r}$):** Tính $u_i = \frac{1}{\sqrt{\lambda_i}}Av_i$.
- **Với $m - r$ cột còn lại:** Tìm không gian nghiệm của ma trận $AA^T$ ứng với giá trị riêng $\lambda = 0$. Chọn các vector cơ sở trực chuẩn $u_{r+1}, \dots, u_m$ từ không gian này.
- Xếp các vector thu được thành các cột để tạo ma trận trực giao $U = \begin{bmatrix} u_1 & u_2 & \dots & u_m \end{bmatrix} \in \mathbb{R}^{m \times m}$.

**Bước 5: Lập ma trận đường chéo nghịch đảo $\Sigma^{-1}$**

- Tính các giá trị kỳ dị: $\sigma_i = \sqrt{\lambda_i}$ với $i = \overline{1,r}$.
- Lập ma trận $\Sigma^{-1}$ có kích thước $n \times m$.
- Đặt các giá trị nghịch đảo $\frac{1}{\sigma_1}, \frac{1}{\sigma_2}, \dots, \frac{1}{\sigma_r}$ lên đường chéo chính xuất phát từ góc trên cùng bên trái.
- Đặt tất cả các phần tử còn lại trong ma trận bằng $0$.

**Bước 6: Tính toán kết quả ma trận nghịch đảo suy rộng**

- Thực hiện phép nhân 3 ma trận theo công thức: $A^\dagger = V\Sigma^{-1}U^T$.

### Tính số điều kiện của ma trận\*\*

**Đầu vào:** Ma trận khả nghịch $A \in \mathbb{R}^{n \times n}$.

**Đầu ra:** Số điều kiện $cond(A)$.

- **Bước 1:** Tính ma trận đối xứng $A^TA$.
- **Bước 2:** Giải phương trình đặc trưng $\det(A^TA - \lambda I) = 0$ để tìm các giá trị riêng $\lambda_i$ của $A^TA$.
- **Bước 3:** Tính các giá trị kỳ dị bằng cách lấy căn bậc hai các giá trị riêng: $\sigma_i = \sqrt{\lambda_i}$.
- **Bước 4:** Xác định giá trị lớn nhất ($\sigma_{\max}$) và giá trị nhỏ nhất ($\sigma_{\min}$) từ tập các giá trị kỳ dị vừa tính.
- **Bước 5:** Tính kết quả số điều kiện theo công thức $cond(A) = \frac{\sigma_{\max}}{\sigma_{\min}}$.

_Lưu ý:_ Nếu $\sigma_{\min} = 0$ (ma trận $A$ không khả nghịch/suy biến), hệ số $\frac{\sigma_{\max}}{0}$ không xác định và quy ước số điều kiện $cond(A) \to \infty$, thể hiện hệ phương trình cực kỳ mất ổn định và không thể nghịch đảo.
