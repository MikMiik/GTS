**Đầu vào:** Ma trận vuông $A \in \mathbb{R}^{n \times n}$, véc-tơ khởi tạo $x_0 \ne 0$, sai số cho phép $\epsilon$.

**Đầu ra:** Giá trị riêng trội $\lambda$ và véc-tơ riêng $v$.
**Bước 1: Tính chuỗi lặp và chuẩn hóa**
- Lặp với $k \ge 0$:
    1. Tính véc-tơ $y_{k+1} = A x_k$.
    2. Tìm chỉ số $p$ sao cho $|(y_{k+1})_p|$ có giá trị lớn nhất.
    3. Gán giá trị xấp xỉ $m_{k+1} = (y_{k+1})_p$.
    4. Chuẩn hóa véc-tơ: $x_{k+1} = \frac{y_{k+1}}{m_{k+1}}$.
    5. Kiểm tra điều kiện dừng: Nếu $\|x_{k+1} - x_k\|_\infty < \epsilon$, dừng lặp và chuyển sang Bước 2.
**Bước 2: Xác định kết quả**
- **Trường hợp 1: Một giá trị riêng thực trội duy nhất**
    - Xảy ra khi dãy $x_k$ hội tụ.
    - Kết quả: $\lambda_1 = m_{k+1}$ và véc-tơ riêng $v_1 = x_{k+1}$.
- **Trường hợp 2: Hai giá trị riêng đối nhau ($\lambda_1 = -\lambda_2$)**
    - Xảy ra khi dãy $x_k$ không hội tụ mà đổi dấu luân phiên.
    - Lấy 3 véc-tơ lặp liên tiếp chưa chuẩn hóa (tính dội lại $y_{k+1}, y_{k+2}$ từ $x_k$).
    - Tính $\lambda_{1}^{2} \approx \frac{(y_{k+2})_i}{(x_k)_i}$ (với thành phần $i$ bất kỳ khác 0).
    - Suy ra $\lambda_1$ và $\lambda_2 = -\lambda_1$.
- **Trường hợp 3: Hai giá trị riêng phức liên hợp ($\lambda_1 = \overline{\lambda_2}$)**
    - Xảy ra khi dãy không hội tụ và không có quy luật đổi dấu.
    - Dựa vào 3 véc-tơ lặp liên tiếp $x_k, y_{k+1}, y_{k+2}$ để giải phương trình đặc trưng $t^2 - pt + q = 0$ thông qua định thức (với 2 thành phần $i, j$ bất kỳ):
        $$\begin{vmatrix} \lambda^{2} & \lambda & 1 \\ (y_{k+2})_i & (y_{k+1})_i & (x_k)_i \\ (y_{k+2})_j & (y_{k+1})_j & (x_k)_j \end{vmatrix} = 0$$
    - Giải phương trình bậc 2 thu được cặp giá trị riêng phức.