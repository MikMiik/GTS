### Thuật toán Newton giải hệ phương trình phi tuyến

#### Input

- Hệ $n$ phương trình phi tuyến $n$ ẩn: $F(X) = 0$ với $X = [x_1, x_2, \dots, x_n]^T$ và $F = [f_1, f_2, \dots, f_n]^T$.
- Ma trận Jacobi tổng quát:
  $$J(X) = \left[\frac{\partial f_i}{\partial x_j}\right]_{i,j=1}^n$$
- Véc-tơ điểm xấp xỉ ban đầu: $X_0 = [x_{1,0}, x_{2,0}, \dots, x_{n,0}]^T$.
- Sai số cho phép: $\epsilon > 0$.
- Số bước lặp tối đa: $K_{max}$.

#### Output

- Véc-tơ nghiệm xấp xỉ: $X^* = [x_1^*, x_2^*, \dots, x_n^*]^T$ thỏa mãn điều kiện dừng.

#### Các bước thực hiện

1. **Khởi tạo:**
   - Đặt bước lặp: $k = 0$.

2. **Vòng lặp tính toán:**
   - **Bước 2.1:** Tính véc-tơ giá trị hàm tại bước $k$:
     $$F(X_k) = [f_1(X_k), f_2(X_k), \dots, f_n(X_k)]^T$$
   - **Bước 2.2:** Tính ma trận hệ số Jacobi tại bước $k$:
     $$J(X_k)$$
   - **Bước 2.3:** Giải hệ phương trình tuyến tính tìm véc-tơ gia số $\Delta X_k = [\Delta x_1, \Delta x_2, \dots, \Delta x_n]^T$:
     $$J(X_k) \cdot \Delta X_k = -F(X_k)$$
   - **Bước 2.4:** Cập nhật véc-tơ nghiệm cho bước tiếp theo:
     $$X_{k+1} = X_k + \Delta X_k$$

3. **Kiểm tra điều kiện dừng:**
   - Nếu $||\Delta X_k|| < \epsilon$ hoặc $||F(X_{k+1})|| < \epsilon$:
     - Gán $X^* = X_{k+1}$.
     - **Dừng thuật toán**.
   - Nếu $k \ge K_{max}$:
     - Thông báo thuật toán không hội tụ sau $K_{max}$ bước.
     - **Dừng thuật toán**.
   - Ngược lại:
     - Gán $k = k + 1$.
     - Quay lại **Bước 2**.

### VD1:

#### 1. Khởi tạo

- Hệ phương trình phi tuyến:
  $$\begin{cases} f(x, y) = -x^2 + x + 4y - 12 = 0 \\ g(x, y) = x^2 - 4x + 4y^2 - 12y - 12 = 0 \end{cases}$$
- Ma trận Jacobi tổng quát:
  $$J(X) = \begin{bmatrix} 1 - 2x & 4 \\ 2x - 4 & 8y - 12 \end{bmatrix}$$
- Véc-tơ điểm xấp xỉ ban đầu: $X_0 = \begin{bmatrix} 0 \\ 0 \end{bmatrix}$.
- Đặt $k = 0$.

#### 2. Vòng lặp tính toán (Bước $k = 0$)

- **Bước 2.1: Tính véc-tơ giá trị hàm tại $X_0$**
  $$F(X_0) = \begin{bmatrix} f(0,0) \\ g(0,0) \end{bmatrix} = \begin{bmatrix} -12 \\ -12 \end{bmatrix}$$
- **Bước 2.2: Tính ma trận hệ số Jacobi tại $X_0$**
  $$J(X_0) = \begin{bmatrix} 1 - 2(0) & 4 \\ 2(0) - 4 & 8(0) - 12 \end{bmatrix} = \begin{bmatrix} 1 & 4 \\ -4 & -12 \end{bmatrix}$$
- **Bước 2.3: Giải hệ phương trình tuyến tính tìm véc-tơ gia số $\Delta X_0$**
  $$J(X_0) \cdot \Delta X_0 = -F(X_0)$$
  $$\begin{bmatrix} 1 & 4 \\ -4 & -12 \end{bmatrix} \begin{bmatrix} \Delta x_0 \\ \Delta y_0 \end{bmatrix} = \begin{bmatrix} 12 \\ 12 \end{bmatrix}$$
  Giải hệ phương trình bằng phương pháp thế:
  $$\begin{cases} \Delta x_0 + 4\Delta y_0 = 12 \\ -4\Delta x_0 - 12\Delta y_0 = 12 \end{cases} \implies \begin{cases} \Delta x_0 = -48 \\ \Delta y_0 = 15 \end{cases}$$
  $$\implies \Delta X_0 = \begin{bmatrix} -48 \\ 15 \end{bmatrix}$$
- **Bước 2.4: Cập nhật véc-tơ nghiệm cho bước tiếp theo**
  $$X_1 = X_0 + \Delta X_0 = \begin{bmatrix} 0 \\ 0 \end{bmatrix} + \begin{bmatrix} -48 \\ 15 \end{bmatrix} = \begin{bmatrix} -48 \\ 15 \end{bmatrix}$$

#### 3. Vòng lặp tính toán (Bước $k = 1$)

- **Bước 3.1: Tính véc-tơ giá trị hàm tại $X_1 = [-48, 15]^T$**
  $$f(-48, 15) = -(-48)^2 + (-48) + 4(15) - 12 = -2304 - 48 + 60 - 12 = -2304$$
  $$g(-48, 15) = (-48)^2 - 4(-48) + 4(15)^2 - 12(15) - 12 = 2304 + 192 + 900 - 180 - 12 = 3204$$
  $$\implies F(X_1) = \begin{bmatrix} -2304 \\ 3204 \end{bmatrix}$$
- **Bước 3.2: Tính ma trận hệ số Jacobi tại $X_1$**
  $$J(X_1) = \begin{bmatrix} 1 - 2(-48) & 4 \\ 2(-48) - 4 & 8(15) - 12 \end{bmatrix} = \begin{bmatrix} 97 & 4 \\ -100 & 108 \end{bmatrix}$$
- **Bước 3.3: Giải hệ phương trình tuyến tính tìm véc-tơ gia số $\Delta X_1$**
  $$J(X_1) \cdot \Delta X_1 = -F(X_1)$$
  $$\begin{bmatrix} 97 & 4 \\ -100 & 108 \end{bmatrix} \begin{bmatrix} \Delta x_1 \\ \Delta y_1 \end{bmatrix} = \begin{bmatrix} 2304 \\ -3204 \end{bmatrix}$$
  Giải hệ phương trình tuyến tính bậc nhất hai ẩn trên thu được:
  $$\begin{cases} \Delta x_1 \approx 24.05737 \\ \Delta y_1 \approx -7.39132 \end{cases} \implies \Delta X_1 \approx \begin{bmatrix} 24.05737 \\ -7.39132 \end{bmatrix}$$
- **Bước 3.4: Cập nhật véc-tơ nghiệm cho bước tiếp theo**
  $$X_2 = X_1 + \Delta X_1 = \begin{bmatrix} -48 \\ 15 \end{bmatrix} + \begin{bmatrix} 24.05737 \\ -7.39132 \end{bmatrix} = \begin{bmatrix} -23.94263 \\ 7.60868 \end{bmatrix}$$

### VD2:

#### 1. Khởi tạo

- Hệ phương trình phi tuyến:
  $$\begin{cases} F(x, y) = 4x^2 - 20x + \frac{1}{4}y^2 + 8 = 0 \\ G(x, y) = \frac{1}{2}xy^2 + 2x - 5y + 8 = 0 \end{cases}$$
- Ma trận Jacobi tổng quát:
  $$J(X) = \begin{bmatrix} 8x - 20 & \frac{1}{2}y \\ \frac{1}{2}y^2 + 2 & xy - 5 \end{bmatrix}$$
- Véc-tơ điểm xấp xỉ ban đầu: $X_0 = \begin{bmatrix} 0 \\ 0 \end{bmatrix}$.
- Đặt $k = 0$.

#### 2. Vòng lặp tính toán (Bước $k = 0$)

- **Bước 2.1: Tính véc-tơ giá trị hàm tại $X_0$**
  $$F(0, 0) = 4(0)^2 - 20(0) + \frac{1}{4}(0)^2 + 8 = 8$$
  $$G(0, 0) = \frac{1}{2}(0)(0)^2 + 2(0) - 5(0) + 8 = 8$$
  $$\implies F(X_0) = \begin{bmatrix} 8 \\ 8 \end{bmatrix}$$
- **Bước 2.2: Tính ma trận hệ số Jacobi tại $X_0$**
  $$J(X_0) = \begin{bmatrix} 8(0) - 20 & \frac{1}{2}(0) \\ \frac{1}{2}(0)^2 + 2 & (0)(0) - 5 \end{bmatrix} = \begin{bmatrix} -20 & 0 \\ 2 & -5 \end{bmatrix}$$
- **Bước 2.3: Giải hệ phương trình tuyến tính tìm véc-tơ gia số $\Delta X_0$**
  $$J(X_0) \cdot \Delta X_0 = -F(X_0)$$
  $$\begin{bmatrix} -20 & 0 \\ 2 & -5 \end{bmatrix} \begin{bmatrix} \Delta x_0 \\ \Delta y_0 \end{bmatrix} = \begin{bmatrix} -8 \\ -8 \end{bmatrix}$$
  Giải hệ phương trình phương pháp thế trực tiếp:
  $$\begin{cases} -20\Delta x_0 = -8 \implies \Delta x_0 = 0.4 \\ 2(0.4) - 5\Delta y_0 = -8 \implies -5\Delta y_0 = -8.8 \implies \Delta y_0 = 1.76 \end{cases}$$
  $$\implies \Delta X_0 = \begin{bmatrix} 0.4 \\ 1.76 \end{bmatrix}$$
- **Bước 2.4: Cập nhật véc-tơ nghiệm cho bước tiếp theo**
  $$X_1 = X_0 + \Delta X_0 = \begin{bmatrix} 0 \\ 0 \end{bmatrix} + \begin{bmatrix} 0.4 \\ 1.76 \end{bmatrix} = \begin{bmatrix} 0.4 \\ 1.76 \end{bmatrix}$$

#### 3. Vòng lặp tính toán (Bước $k = 1$)

- **Bước 3.1: Tính véc-tơ giá trị hàm tại $X_1 = [0.4, 1.76]^T$**
  $$F(0.4, 1.76) = 4(0.4)^2 - 20(0.4) + \frac{1}{4}(1.76)^2 + 8 = 0.64 - 8 + 0.7744 + 8 = 1.4144$$
  $$G(0.4, 1.76) = \frac{1}{2}(0.4)(1.76)^2 + 2(0.4) - 5(1.76) + 8 = 0.61952 + 0.8 - 8.8 + 8 = 0.61952$$
  $$\implies F(X_1) = \begin{bmatrix} 1.4144 \\ 0.61952 \end{bmatrix}$$
- **Bước 3.2: Tính ma trận hệ số Jacobi tại $X_1$**
  $$J(X_1) = \begin{bmatrix} 8(0.4) - 20 & \frac{1}{2}(1.76) \\ \frac{1}{2}(1.76)^2 + 2 & (0.4)(1.76) - 5 \end{bmatrix} = \begin{bmatrix} -16.8 & 0.88 \\ 3.5488 & -4.296 \end{bmatrix}$$
- **Bước 3.3: Giải hệ phương trình tuyến tính tìm véc-tơ gia số $\Delta X_1$**
  $$J(X_1) \cdot \Delta X_1 = -F(X_1)$$
  $$\begin{bmatrix} -16.8 & 0.88 \\ 3.5488 & -4.296 \end{bmatrix} \begin{bmatrix} \Delta x_1 \\ \Delta y_1 \end{bmatrix} = \begin{bmatrix} -1.4144 \\ -0.61952 \end{bmatrix}$$
  Giải hệ phương trình tuyến tính bậc nhất hai ẩn trên thu được:
  $$\begin{cases} \Delta x_1 \approx 0.095087 \\ \Delta y_1 \approx 0.208036 \end{cases} \implies \Delta X_1 \approx \begin{bmatrix} 0.095087 \\ 0.208036 \end{bmatrix}$$
- **Bước 3.4: Cập nhật véc-tơ nghiệm cho bước tiếp theo**
  $$X_2 = X_1 + \Delta X_1 = \begin{bmatrix} 0.4 \\ 1.76 \end{bmatrix} + \begin{bmatrix} 0.095087 \\ 0.208036 \end{bmatrix} = \begin{bmatrix} 0.495087 \\ 1.968036 \end{bmatrix}$$
