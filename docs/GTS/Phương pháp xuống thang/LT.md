**Ý tưởng và mục đích**

- **Mục đích:** Tìm các giá trị riêng trội tiếp theo ($\lambda_2, \lambda_3, \dots, \lambda_n$) của ma trận vuông $A_{n \times n}$ sau khi đã xác định được giá trị riêng trội nhất $\lambda_1$ và véc-tơ riêng $v_1$ tương ứng.
    
- **Ý tưởng:** Loại bỏ (khử) giá trị riêng $\lambda_1$ bằng cách biến đổi $A$ thành một ma trận xuống thang $B$. Ma trận $B$ giữ nguyên các giá trị riêng $\lambda_2, \dots, \lambda_n$ của $A$ nhưng thay thế $\lambda_1$ bằng $0$. Nhờ đó, $\lambda_2$ trở thành giá trị riêng trội nhất của $B$, cho phép tiếp tục áp dụng phương pháp lũy thừa để tìm kiếm.
    

**Chi tiết phương pháp**

- **Nguyên lý chung:**
    
    - Giả sử ma trận $A$ có các giá trị riêng $\lambda_1, \lambda_2, \dots, \lambda_n$ và các véc-tơ riêng $v_i$ thỏa mãn $Av_i = \lambda_i v_i$.
        
    - Xác định một véc-tơ $x$ sao cho tích vô hướng $x^T v_1 = 1$.
        
    - Ma trận xuống thang được tính bằng công thức: $B = A - \lambda_1 v_1 x^T$.
        
    - Ma trận $B$ có các giá trị riêng là $0, \lambda_2, \dots, \lambda_n$ và các véc-tơ riêng tương ứng $u_i$ thỏa mãn $Bu_i = \lambda_i u_i$.
        
    - Mối liên hệ để suy ngược véc-tơ riêng của $A$ từ $B$ là: $v_i = (\lambda_1 - \lambda_i)u_i + \lambda_1(x^T u_i)v_1$.
        
- **Cách 1: Sử dụng véc-tơ riêng trái**
    
    - Tìm véc-tơ riêng trái $w_1$ ứng với $\lambda_1$ thỏa mãn $A^T w_1 = \lambda_1 w_1$.
        
    - Chọn véc-tơ $x = \frac{w_1}{w_1^T v_1}$, đảm bảo điều kiện $x^T v_1 = 1$.
        
    - Thiết lập ma trận xuống thang: $B = A - \frac{\lambda_1}{w_1^T v_1} v_1 w_1^T$.
        
    - Hệ quả: $Bv_1 = 0$ và với mọi $k \ne 1$, $Bv_k = \lambda_k v_k$ (do $w_1^T v_k = 0$).
        
- **Cách 2: Sử dụng phép biến đổi ma trận**
    
    - Xét $v_1 \ne 0$, tồn tại vị trí $s$ sao cho thành phần $v_{1,s} \ne 0$. Chuẩn hóa để $v_{1,s} = 1$.
        
    - Chọn $x = \frac{1}{\lambda_1} [\begin{matrix} a_{s1} & \dots & a_{sn} \end{matrix}]^T$ (sử dụng hàng $s$ của $A$).
        
    - Sử dụng ma trận biến đổi $\Theta(s, v_1) = I - [\begin{matrix} 0 & \dots & v_1 & \dots & 0 \end{matrix}]$, trong đó $v_1$ nằm ở cột thứ $s$.
        
    - Thiết lập ma trận mới: $A^{(2)} = \Theta(s, v_1)A$.
        
    - Hệ quả: $A^{(2)} v_1 = 0$ và $A^{(2)}\Theta(s, v_1)v_i = \lambda_i \Theta(s, v_1)v_i$ với $i > 1$.
        
- **Tổng quát hóa cho bước lặp thứ $k$:**
    
    - Sau $k-1$ bước, ta đã tìm được các cặp $(\lambda_i, v_i)$ với $i = 1, \dots, k-1$ và thu được ma trận $A^{(k)}$.
        
    - Ma trận cho bước tiếp theo được tính bằng: $A^{(k)} = \Theta(v_{k-1}, s_{k-1})A^{(k-1)}$.
        
    - Tính chất tại bước $k$: $A^{(k)} v_{k-1} = 0$, $A^{(k)}\Theta(v_{k-1}, s_{k-1})v_i = 0$ với $i < k-1$, và $A^{(k)}\Theta(v_{k-1}, s_{k-1})v_i = \lambda_i \Theta(v_1, s_1)v_i$ với $i > k-1$. Giá trị $\lambda_k$ tiếp theo sẽ được tìm từ ma trận $A^{(k)}$ này.
### Thuật toán C1:
**Đầu vào:**

- Ma trận vuông $A_{n \times n}$.
    
- Giá trị riêng trội $\lambda_1$ và véc-tơ riêng phải $v_1$ tương ứng.
    
- Sai số cho phép $\epsilon$.
    

**Đầu ra:**

- Giá trị riêng trội thứ hai $\lambda_2$.
    

**Các bước thuật toán:**

- **Bước 1: Xác định véc-tơ riêng trái $w_1$**
    
    - Giải hệ phương trình tuyến tính $(A^T - \lambda_1 I)w_1 = 0$ để tìm nghiệm $w_1 \neq 0$.
        
- **Bước 2: Xây dựng véc-tơ chuẩn hóa $x$**
    
    - Tính véc-tơ $x = \frac{w_1}{w_1^T v_1}$.
        
- **Bước 3: Xây dựng ma trận xuống thang $B$**
    
    - Tính ma trận $B = A - \lambda_1 v_1 x^T$.
        
- **Bước 4: Dùng phương pháp lũy thừa trên $B$ để tìm $\lambda_2$**
    
    - Khởi tạo véc-tơ lặp ngẫu nhiên $y_0 \neq 0$.
        
    - Vòng lặp $k \ge 0$:
        
        1. Tính $z_{k+1} = B y_k$.
            
        2. Tìm chỉ số $p$ sao cho phần tử $|z_{k+1, p}|$ là lớn nhất trong véc-tơ $z_{k+1}$.
            
        3. Gán giá trị riêng xấp xỉ $\lambda_2^{(k+1)} = z_{k+1, p}$.
            
        4. Chuẩn hóa véc-tơ lặp: $y_{k+1} = \frac{z_{k+1}}{z_{k+1, p}}$.
            
        5. Điều kiện dừng: Nếu $\|y_{k+1} - y_k\|_\infty < \epsilon$, kết thúc vòng lặp.
            
    - Giá trị $\lambda_2^{(k+1)}$ tại bước hội tụ cuối cùng chính là giá trị riêng trội thứ hai $\lambda_2$.

#### VD:
**Bài toán:** Tìm giá trị riêng trội thứ hai của ma trận $A = \begin{pmatrix} 4 & 2 \\ 1 & 3 \end{pmatrix}$. Giả thiết đã biết giá trị riêng trội nhất $\lambda_1 = 5$ và véc-tơ riêng phải $v_1 = \begin{pmatrix} 2 \\ 1 \end{pmatrix}$. Sai số cho phép $\epsilon = 0.01$.

**Bước 1: Xác định véc-tơ riêng trái $w_1$**

- Giải hệ phương trình $(A^T - 5I)w_1 = 0$:
    
    $$\begin{pmatrix} -1 & 1 \\ 2 & -2 \end{pmatrix} \begin{pmatrix} w_{11} \\ w_{12} \end{pmatrix} = \begin{pmatrix} 0 \\ 0 \end{pmatrix}$$
    
- Chọn nghiệm không tầm thường $w_1 = \begin{pmatrix} 1 \\ 1 \end{pmatrix}$.
    

**Bước 2: Xây dựng véc-tơ chuẩn hóa $x$**

- Tính tích vô hướng mẫu số: $w_1^T v_1 = \begin{pmatrix} 1 & 1 \end{pmatrix} \begin{pmatrix} 2 \\ 1 \end{pmatrix} = 3$.
    
- Tính véc-tơ $x = \frac{w_1}{w_1^T v_1} = \begin{pmatrix} 1/3 \\ 1/3 \end{pmatrix}$.
    

**Bước 3: Xây dựng ma trận xuống thang $B$**

- Tính ma trận hiệu chỉnh hạng 1:
    
    $$\lambda_1 v_1 x^T = 5 \begin{pmatrix} 2 \\ 1 \end{pmatrix} \begin{pmatrix} 1/3 & 1/3 \end{pmatrix} = \begin{pmatrix} 10/3 & 10/3 \\ 5/3 & 5/3 \end{pmatrix}$$
    
- Tính ma trận xuống thang $B = A - \lambda_1 v_1 x^T$:
    
    $$B = \begin{pmatrix} 4 & 2 \\ 1 & 3 \end{pmatrix} - \begin{pmatrix} 10/3 & 10/3 \\ 5/3 & 5/3 \end{pmatrix} = \begin{pmatrix} 2/3 & -4/3 \\ -2/3 & 4/3 \end{pmatrix}$$
    

**Bước 4: Dùng phương pháp lũy thừa trên $B$ để tìm $\lambda_2$**

- Khởi tạo véc-tơ lặp $y_0 = \begin{pmatrix} 1 \\ 0 \end{pmatrix}$.
    
- **Lặp lần 1 ($k=0$):**
    
    1. Tính $z_1 = B y_0 = \begin{pmatrix} 2/3 & -4/3 \\ -2/3 & 4/3 \end{pmatrix} \begin{pmatrix} 1 \\ 0 \end{pmatrix} = \begin{pmatrix} 2/3 \\ -2/3 \end{pmatrix}$.
        
    2. Phần tử có trị tuyệt đối lớn nhất là $z_{1,1} = 2/3$.
        
    3. Gán giá trị riêng xấp xỉ $\lambda_2^{(1)} = 2/3$.
        
    4. Chuẩn hóa véc-tơ lặp: $y_1 = \frac{z_1}{2/3} = \begin{pmatrix} 1 \\ -1 \end{pmatrix}$.
        
- **Lặp lần 2 ($k=1$):**
    
    1. Tính $z_2 = B y_1 = \begin{pmatrix} 2/3 & -4/3 \\ -2/3 & 4/3 \end{pmatrix} \begin{pmatrix} 1 \\ -1 \end{pmatrix} = \begin{pmatrix} 2 \\ -2 \end{pmatrix}$.
        
    2. Phần tử có trị tuyệt đối lớn nhất là $z_{2,1} = 2$.
        
    3. Gán giá trị riêng xấp xỉ $\lambda_2^{(2)} = 2$.
        
    4. Chuẩn hóa véc-tơ lặp: $y_2 = \frac{z_2}{2} = \begin{pmatrix} 1 \\ -1 \end{pmatrix}$.
        
- **Kiểm tra điều kiện dừng:** Tính chuẩn vô cùng của hiệu hai véc-tơ $\|y_2 - y_1\|_\infty = 0 < \epsilon$. Thuật toán hội tụ.
    

**Kết quả:**

Giá trị riêng trội thứ hai của ma trận $A$ là $\lambda_2 = 2$.

### Thuật toán C2:
**Đầu vào:**

- Ma trận vuông $A_{n \times n}$.
    
- Giá trị riêng trội $\lambda_1$ và véc-tơ riêng phải $v_1$ tương ứng.
    
- Sai số cho phép $\epsilon$.
    

**Đầu ra:**

- Giá trị riêng trội thứ hai $\lambda_2$.
    

**Các bước thuật toán:**

- **Bước 1: Chuẩn hóa véc-tơ $v_1$**
    
    - Tìm chỉ số $s$ sao cho thành phần $|v_{1, s}|$ có giá trị mô-đun lớn nhất.
        
    - Cập nhật $v_1 = \frac{v_1}{v_{1, s}}$ để thành phần tại vị trí $s$ bằng 1.
        
- **Bước 2: Xây dựng ma trận khử $\Theta$**
    
    - Khởi tạo $\Theta$ là ma trận đơn vị $I_n$.
        
    - Cập nhật giá trị cho cột thứ $s$ của $\Theta$ bằng cách trừ đi thành phần tương ứng của $v_1$: $\Theta_{i, s} = \Theta_{i, s} - v_{1, i}$ với $\forall i = \overline{1,n}$.
        
- **Bước 3: Tính ma trận xuống thang $A^{(2)}$**
    
    - Tính ma trận mới $A^{(2)} = \Theta A$. Ma trận này nhận các giá trị riêng là $0, \lambda_2, \lambda_3, \dots, \lambda_n$.
        
- **Bước 4: Dùng phương pháp lũy thừa trên $A^{(2)}$**
    
    - Khởi tạo véc-tơ ngẫu nhiên ban đầu $y_0 \neq 0$.
        
    - Lặp với $k \ge 0$:
        
        1. Tính véc-tơ mới $z_{k+1} = A^{(2)} y_k$.
            
        2. Tìm chỉ số $p$ để $|z_{k+1, p}|$ có giá trị tuyệt đối lớn nhất.
            
        3. Tính xấp xỉ giá trị riêng $\lambda_2^{(k+1)}$ bằng tỷ số của các tọa độ tương ứng.
            
        4. Chuẩn hóa véc-tơ lặp: $y_{k+1} = \frac{z_{k+1}}{z_{k+1, p}}$.
            
        5. Kiểm tra điều kiện dừng: Nếu chuẩn vô cùng của hiệu hai véc-tơ $\|y_{k+1} - y_k\|_\infty < \epsilon$, kết thúc vòng lặp.
            
    - Giá trị $\lambda_2^{(k+1)}$ thu được tại bước hội tụ là giá trị riêng trội thứ hai cần tìm.

#### VD:
**Bài toán:** Tìm giá trị riêng trội thứ hai của ma trận $A = \begin{pmatrix} 4 & 2 \\ 1 & 3 \end{pmatrix}$.

Giả thiết đã biết giá trị riêng trội nhất $\lambda_1 = 5$ và véc-tơ riêng phải tương ứng $v_1 = \begin{pmatrix} 2 \\ 1 \end{pmatrix}$. Sai số cho phép $\epsilon = 0.01$.

**Bước 1: Chuẩn hóa véc-tơ $v_1$**

- Thành phần có trị tuyệt đối lớn nhất của $v_1$ là $2$ nằm ở vị trí hàng thứ nhất ($s = 1$).
    
- Chuẩn hóa $v_1$ bằng cách chia cho $2$:
    
    $$v_1 = \begin{pmatrix} 2/2 \\ 1/2 \end{pmatrix} = \begin{pmatrix} 1 \\ 0.5 \end{pmatrix}$$
    
    _(Lúc này thành phần $v_{1,1} = 1$)_.
    

**Bước 2: Xây dựng ma trận khử $\Theta$**

- Khởi tạo ma trận đơn vị $I_2 = \begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix}$.
    
- Cập nhật cột thứ nhất ($s=1$) bằng cách trừ đi $v_1$:
    
    - $\Theta_{1,1} = 1 - 1 = 0$
        
    - $\Theta_{2,1} = 0 - 0.5 = -0.5$
        
- Kết quả ma trận khử:
    
    $$\Theta = \begin{pmatrix} 0 & 0 \\ -0.5 & 1 \end{pmatrix}$$
    

**Bước 3: Tính ma trận xuống thang $A^{(2)}$**

- Tính $A^{(2)} = \Theta A$:
    
    $$A^{(2)} = \begin{pmatrix} 0 & 0 \\ -0.5 & 1 \end{pmatrix} \begin{pmatrix} 4 & 2 \\ 1 & 3 \end{pmatrix} = \begin{pmatrix} 0 & 0 \\ -0.5(4)+1(1) & -0.5(2)+1(3) \end{pmatrix} = \begin{pmatrix} 0 & 0 \\ -1 & 2 \end{pmatrix}$$
    

**Bước 4: Dùng phương pháp lũy thừa trên $A^{(2)}$ để tìm $\lambda_2$**

- Khởi tạo véc-tơ lặp ngẫu nhiên $y_0 = \begin{pmatrix} 1 \\ 1 \end{pmatrix}$.
    
- **Lặp lần 1 ($k=0$):**
    
    1. Tính $z_1 = A^{(2)} y_0 = \begin{pmatrix} 0 & 0 \\ -1 & 2 \end{pmatrix} \begin{pmatrix} 1 \\ 1 \end{pmatrix} = \begin{pmatrix} 0 \\ 1 \end{pmatrix}$.
        
    2. Phần tử có trị tuyệt đối lớn nhất là $z_{1,2} = 1$.
        
    3. Giá trị riêng xấp xỉ $\lambda_2^{(1)} = 1$.
        
    4. Chuẩn hóa véc-tơ lặp: $y_1 = \frac{z_1}{1} = \begin{pmatrix} 0 \\ 1 \end{pmatrix}$.
        
- **Lặp lần 2 ($k=1$):**
    
    1. Tính $z_2 = A^{(2)} y_1 = \begin{pmatrix} 0 & 0 \\ -1 & 2 \end{pmatrix} \begin{pmatrix} 0 \\ 1 \end{pmatrix} = \begin{pmatrix} 0 \\ 2 \end{pmatrix}$.
        
    2. Phần tử có trị tuyệt đối lớn nhất là $z_{2,2} = 2$.
        
    3. Giá trị riêng xấp xỉ $\lambda_2^{(2)} = 2$.
        
    4. Chuẩn hóa véc-tơ lặp: $y_2 = \frac{z_2}{2} = \begin{pmatrix} 0 \\ 1 \end{pmatrix}$.
        
- **Kiểm tra điều kiện dừng:** Tính chuẩn vô cùng $\|y_2 - y_1\|_\infty = 0 < \epsilon$. Thuật toán hội tụ.
    

**Kết quả:**

Giá trị riêng trội thứ hai của ma trận $A$ là $\lambda_2 = 2$.