### Ý tưởng và Mục đích

- **Ý tưởng cốt lõi:** Phân rã biến đổi tuyến tính phức tạp của ma trận $A$ thành 3 phép biến đổi hình học cơ bản nối tiếp nhau: đổi cơ sở (xoay) ở đầu vào, co giãn độc lập trên từng trục, và đổi cơ sở (xoay) ở đầu ra.
    
- **Bản chất hình học:** Ma trận $A \in \mathbb{R}^{m \times n}$ ánh xạ hình cầu đơn vị $S=\{x\in\mathbb{R}^{n}|||x||\le1\}$ thành một ellipsoid $AS=\{Ax|x\in S\}$. SVD tìm ra các hướng trực chuẩn sao cho biến đổi $A$ chỉ là các phép co giãn độc lập dọc theo các bán trục của ellipsoid này.
    
- **Mục đích:** Tách ma trận $A$ đan xen phức tạp thành tổng của các ma trận hạng 1 hoàn toàn độc lập. Việc tìm ra hệ cơ sở trực chuẩn $V$ (cho không gian nguồn) và $U$ (cho không gian đích) giúp chéo hóa hoàn toàn tác động của $A$, đưa biến đổi tuyến tính về dạng các ánh xạ một chiều độc lập: $Av_i = \sigma_i u_i$.

### Định nghĩa và Công thức SVD

- **Định nghĩa:** Với ma trận $A \in \mathbb{R}^{m \times n}$ có hạng rank A $= r$, khai triển kỳ dị của $A$ là phép phân tích thành tích 3 ma trận:
    
    $$A=U\Sigma V^{T}$$
    
- **Cấu trúc các thành phần:**
    
    - $V=[\begin{matrix}v_{1}&v_{2}&...&v_{r}\end{matrix}]$ : Ma trận có các cột là vector kỳ dị phải $v_i$. Cột $V$ lập thành cơ sở trực chuẩn. Chuyển vị $V^T$ thực hiện xoay hệ trục tọa độ gốc để căn chỉnh dọc theo các hướng mà $A$ thực hiện co giãn.
        
    - $\Sigma = diag (\sigma_{1},...,\sigma_{r})$ : Ma trận đường chéo chứa các giá trị kỳ dị $\sigma_i$ sắp xếp giảm dần $\sigma_{1}\ge\sigma_{2}\ge...\ge\sigma_{r}>0$. Các giá trị này là hệ số co giãn độc lập của từng trục tọa độ và tương đương với độ dài các bán trục của ellipsoid $AS$.
        
    - $U = [\begin{matrix}u_{1}&...&u_{r}\end{matrix}]$ : Ma trận có các cột là vector kỳ dị trái $u_i$. Các vector này là các vector đơn vị định hướng theo các bán trục của ellipsoid $AS$ trong không gian đích. $U$ thực hiện xoay các vector đã co giãn vào đúng hướng đầu ra.
        
- **Công thức khai triển thành tổng:** Ma trận $A$ được phân rã thành tổng của $r$ ma trận hạng 1:
    
    $$A=\sigma_{1}u_{1}v_{1}^{T}+\sigma_{2}u_{2}v_{2}^{T}+\cdot\cdot\cdot+\sigma_{r}u_{r}v_{r}^{T}$$
### Phương pháp xác định các thành phần của SVD

- **Giá trị kỳ dị ($\sigma_i$):** Bình phương của các giá trị kỳ dị, ký hiệu là $\sigma_i^2$, chính là các giá trị riêng khác $0$ của ma trận vuông đối xứng $A^TA$ hoặc $AA^T$.
    
- **Vector kỳ dị phải ($v_i$):** $v_i$ là các vector riêng trực chuẩn ứng với các giá trị riêng khác $0$ của ma trận $A^TA$.
    
- **Vector kỳ dị trái ($u_i$):** $u_i$ là các vector riêng trực chuẩn ứng với các giá trị riêng khác $0$ của ma trận $AA^T$.

### Khai triển SVDs
1. Trường hợp hạng đủ

- **Điều kiện:** Ma trận $A \in \mathbb{R}^{m \times n}$ với $m > n$ và $rankA = n$.
    
- **Giá trị kỳ dị:** Có đúng $n$ giá trị kỳ dị dương $\sigma_1, \sigma_2, ... , \sigma_n > 0$.
    
- **Các ma trận thành phần:**
    
    - $U = [\begin{matrix}u_1 & u_2 & ... & u_n\end{matrix}]$.
        
    - $\Sigma = diag(\sigma_1, \sigma_2, ..., \sigma_n)$.
        
    - $V = [\begin{matrix}v_1 & v_2 & ... & v_n\end{matrix}]$.
        
- **Công thức phân rã:** $A = \sigma_1 u_1 v_1^T + \sigma_2 u_2 v_2^T + \cdot\cdot\cdot + \sigma_n u_n v_n^T$.
    

2. Trường hợp hạng không đủ (SVD rút gọn)

- **Điều kiện:** Ma trận $A \in \mathbb{R}^{m \times n}$ với $m > n$ và $rankA = r < n$.
    
- **Giá trị kỳ dị:** Chỉ có $r$ giá trị kỳ dị dương $\sigma_1 \ge \sigma_2 \ge ... \ge \sigma_r > 0$.
    
- **Các ma trận thành phần:**
    
    - $U = [\begin{matrix}u_1 & u_2 & ... & u_r\end{matrix}]$.
        
    - $\Sigma = diag(\sigma_1, ..., \sigma_r)$.
        
    - $V = [\begin{matrix}v_1 & v_2 & ... & v_r\end{matrix}]$.
        
- **Công thức phân rã:** $A = \sigma_1 u_1 v_1^T + \sigma_2 u_2 v_2^T + \cdot\cdot\cdot + \sigma_r u_r v_r^T$.


### Xác định giá trị kỳ dị và các vector kỳ dị
**1. Xác định giá trị kỳ dị ($\sigma_i$)**

- Tính ma trận đối xứng $A^TA$ hoặc $AA^T$.
    
- Tìm các giá trị riêng của ma trận $A^TA$ hoặc $AA^T$. Các giá trị riêng này chính là bình phương của các giá trị kỳ dị, ký hiệu là $\sigma_i^2$.
    
- Các giá trị kỳ dị $\sigma_i$ được tính bằng căn bậc hai của các giá trị riêng dương ($\sigma_i > 0$).
    

**2. Xác định vector kỳ dị phải ($v_i$)**

- Dựa trên biến đổi: $A^TA = (U\Sigma V^T)^T(U\Sigma V^T) = V\Sigma^2 V^T$.
    
- Tìm $v_i$ bằng cách xác định các vector riêng trực chuẩn ứng với các giá trị riêng khác $0$ của ma trận $A^TA$.
    
- Tập hợp $\{v_i\}_{i=\overline{1,r}}$ tạo thành cơ sở trực chuẩn của không gian vector $ker A^\perp$.
    

**3. Xác định vector kỳ dị trái ($u_i$)**

- **Cách 1:** Dựa trên biến đổi: $AA^T = (U\Sigma V^T)(U\Sigma V^T)^T = U\Sigma^2 U^T$. Tìm $u_i$ bằng cách xác định các vector riêng trực chuẩn ứng với các giá trị riêng khác $0$ của ma trận $AA^T$. Tập hợp $\{u_i\}_{i=\overline{1,r}}$ tạo thành cơ sở trực chuẩn của không gian $ImA$.
    
- **Cách 2:** Tính trực tiếp từ vector kỳ dị phải thông qua hệ thức $Av_i = \sigma_i u_i \Rightarrow u_i = \frac{1}{\sigma_i}Av_i$.

**4. VD
**Bài toán:** Tìm khai triển SVD cho ma trận $A = \begin{bmatrix} 4 & 0 \\ 3 & -5 \end{bmatrix}$.

**Bước 1: Tính ma trận $A^TA$**

$$A^TA = \begin{bmatrix} 4 & 3 \\ 0 & -5 \end{bmatrix} \begin{bmatrix} 4 & 0 \\ 3 & -5 \end{bmatrix} = \begin{bmatrix} 25 & -15 \\ -15 & 25 \end{bmatrix}$$

**Bước 2: Xác định giá trị kỳ dị ($\sigma_i$)**

- Giải phương trình đặc trưng $det(A^TA - \lambda I) = 0$:
    
    $$(25-\lambda)^2 - (-15)(-15) = 0 \Rightarrow (25-\lambda)^2 = 225$$
    
- Các giá trị riêng: $\lambda_1 = 40$ và $\lambda_2 = 10$.
    
- Các giá trị kỳ dị ($\sigma_i = \sqrt{\lambda_i}$): $\sigma_1 = \sqrt{40} = 2\sqrt{10}$ và $\sigma_2 = \sqrt{10}$.
    
- Ma trận đường chéo $\Sigma$:
    
    $$\Sigma = \begin{bmatrix} 2\sqrt{10} & 0 \\ 0 & \sqrt{10} \end{bmatrix}$$
    

**Bước 3: Xác định vector kỳ dị phải ($V$)**

- Với $\lambda_1 = 40$, giải $(A^TA - 40I)v_1 = 0$:
    
    $$\begin{bmatrix} -15 & -15 \\ -15 & -15 \end{bmatrix} \begin{bmatrix} x \\ y \end{bmatrix} = \begin{bmatrix} 0 \\ 0 \end{bmatrix} \Rightarrow x = -y$$
    
    Vector riêng trực chuẩn: $v_1 = \frac{1}{\sqrt{2}}\begin{bmatrix} 1 \\ -1 \end{bmatrix}$.
    
- Với $\lambda_2 = 10$, giải $(A^TA - 10I)v_2 = 0$:
    
    $$\begin{bmatrix} 15 & -15 \\ -15 & 15 \end{bmatrix} \begin{bmatrix} x \\ y \end{bmatrix} = \begin{bmatrix} 0 \\ 0 \end{bmatrix} \Rightarrow x = y$$
    
    Vector riêng trực chuẩn: $v_2 = \frac{1}{\sqrt{2}}\begin{bmatrix} 1 \\ 1 \end{bmatrix}$.
    
- Ma trận $V$:
    
    $$V = \begin{bmatrix} v_1 & v_2 \end{bmatrix} = \frac{1}{\sqrt{2}}\begin{bmatrix} 1 & 1 \\ -1 & 1 \end{bmatrix}$$
    

**Bước 4: Xác định vector kỳ dị trái ($U$)**

Áp dụng công thức $u_i = \frac{1}{\sigma_i} A v_i$:

- $u_1 = \frac{1}{2\sqrt{10}} \begin{bmatrix} 4 & 0 \\ 3 & -5 \end{bmatrix} \left( \frac{1}{\sqrt{2}}\begin{bmatrix} 1 \\ -1 \end{bmatrix} \right) = \frac{1}{2\sqrt{20}} \begin{bmatrix} 4 \\ 8 \end{bmatrix} = \frac{1}{\sqrt{5}} \begin{bmatrix} 1 \\ 2 \end{bmatrix}$
    
- $u_2 = \frac{1}{\sqrt{10}} \begin{bmatrix} 4 & 0 \\ 3 & -5 \end{bmatrix} \left( \frac{1}{\sqrt{2}}\begin{bmatrix} 1 \\ 1 \end{bmatrix} \right) = \frac{1}{\sqrt{20}} \begin{bmatrix} 4 \\ -2 \end{bmatrix} = \frac{1}{\sqrt{5}} \begin{bmatrix} 2 \\ -1 \end{bmatrix}$
    
- Ma trận $U$:
    
    $$U = \begin{bmatrix} u_1 & u_2 \end{bmatrix} = \frac{1}{\sqrt{5}}\begin{bmatrix} 1 & 2 \\ 2 & -1 \end{bmatrix}$$
    

**Bước 5: Kết quả khai triển SVD ($A = U\Sigma V^T$)**

$$A = \left( \frac{1}{\sqrt{5}}\begin{bmatrix} 1 & 2 \\ 2 & -1 \end{bmatrix} \right) \begin{bmatrix} 2\sqrt{10} & 0 \\ 0 & \sqrt{10} \end{bmatrix} \left( \frac{1}{\sqrt{2}}\begin{bmatrix} 1 & -1 \\ 1 & 1 \end{bmatrix} \right)$$

### Nghịch đảo suy rộng
### Khái niệm ma trận nghịch đảo suy rộng

Ma trận nghịch đảo suy rộng (Moore-Penrose inverse), ký hiệu là $A^\dagger$, là một mở rộng của ma trận nghịch đảo thông thường áp dụng cho các ma trận không vuông hoặc không khả nghịch. Dựa trên khai triển SVD $A = U\Sigma V^T$, ma trận nghịch đảo suy rộng được xác định bằng công thức:

$$A^\dagger = V\Sigma^{-1}U^T \text{ [cite: 50]}$$

### Khác biệt so với ma trận nghịch đảo thông thường

- **Điều kiện tồn tại:** Ma trận nghịch đảo thông thường ($A^{-1}$) chỉ tồn tại khi $A$ là ma trận vuông và khả nghịch ($\det(A) \neq 0$). Ma trận nghịch đảo suy rộng ($A^\dagger$) luôn tồn tại duy nhất với mọi ma trận bất kỳ (chữ nhật, vuông, hạng đủ hay thiếu hạng).
    
- **Tính chất đại số:** * Với nghịch đảo thông thường: $AA^{-1} = A^{-1}A = I$.
    
    - Với nghịch đảo suy rộng: Nói chung $AA^\dagger \neq I$ và $A^\dagger A \neq I$. Khái niệm nghịch đảo được nới lỏng qua hệ thức Moore-Penrose: $AA^\dagger A = A$ và $A^\dagger A A^\dagger = A^\dagger$.
        
- **Nghiệm của hệ phương trình $Ax = y$:**
    
    - Khi $A$ khả nghịch, hệ có nghiệm duy nhất $x = A^{-1}y$.
        
    - Khi $A$ không vuông hoặc không khả nghịch, hệ có thể vô nghiệm hoặc vô số nghiệm. Nghiệm $x = A^\dagger y$ mang tính chất tối ưu hóa: nó là nghiệm xấp xỉ tốt nhất giúp tối thiểu hóa sai số khoảng cách $\|Az - y\|$ theo nghĩa bình phương tối thiểu.
        

### Bản chất toán học của công thức $A^\dagger = (A^T A)^{-1} A^T$

Xét khai triển SVD rút gọn của ma trận $A$ hạng đủ ($rank(A) = n$): $A = U\Sigma V^T$, trong đó $U \in \mathbb{R}^{m \times n}$ thỏa mãn $U^TU = I_n$, $V \in \mathbb{R}^{n \times n}$ là ma trận trực giao ($V^TV = VV^T = I_n$), và $\Sigma \in \mathbb{R}^{n \times n}$ là ma trận đường chéo khả nghịch.

1. Tính tích ma trận $A^TA$:
    
    $$A^TA = (U\Sigma V^T)^T (U\Sigma V^T) = V\Sigma^T U^T U \Sigma V^T$$
    
    Vì $U^TU = I_n$ và $\Sigma^T = \Sigma$, biểu thức thu gọn thành:
    
    $$A^TA = V\Sigma^2 V^T$$
    
2. Tính nghịch đảo của tích này:
    
    $$(A^TA)^{-1} = (V\Sigma^2 V^T)^{-1} = (V^T)^{-1}(\Sigma^2)^{-1}V^{-1} = V\Sigma^{-2}V^T$$
    
3. Nhân tiếp với $A^T$ ở phía sau:
    
    $$(A^TA)^{-1}A^T = (V\Sigma^{-2}V^T)(U\Sigma V^T)^T = (V\Sigma^{-2}V^T)(V\Sigma U^T)$$
    
    $$(A^TA)^{-1}A^T = V\Sigma^{-2}(V^TV)\Sigma U^T = V\Sigma^{-2}I_n\Sigma U^T = V\Sigma^{-1}U^T$$
    

Theo định nghĩa ban đầu, $V\Sigma^{-1}U^T$ chính là $A^\dagger$. Do đó, phép biến đổi chứng minh:

$$A^\dagger = (A^TA)^{-1}A^T$$

### Số điều kiện của ma trận
### Ý tưởng và Mục đích của Số điều kiện (Condition Number)

- **Ý tưởng cốt lõi:** Khi giải hệ phương trình tuyến tính $y = Ax$ trong thực tế, các dữ liệu đầu vào (ma trận $A$ hoặc vector kết quả $y$) thường chứa sai số do đo lường hoặc làm tròn số máy tính. Số điều kiện, ký hiệu là $cond(A)$, là công cụ toán học dùng để đo lường mức độ nhạy cảm của nghiệm $x$ đối với những thay đổi hoặc sai số nhỏ từ dữ liệu đầu vào đó.
    
- **Mục đích:** Đánh giá độ ổn định và độ tin cậy của việc giải hệ phương trình tuyến tính.
    
    - Nếu $cond(A)$ nhỏ (gần bằng 1), hệ được gọi là **ổn định (well-conditioned)**, nghĩa là nhiễu nhỏ ở đầu vào chỉ gây ra biến động nhỏ ở nghiệm đầu ra.
        
    - Nếu $cond(A)$ rất lớn, hệ được gọi là **không ổn định (ill-conditioned)**, nghĩa là một sai số cực kỳ nhỏ ở đầu vào cũng có thể làm nghiệm đầu ra bị sai lệch hoàn toàn.
- **Chứng minh công thức:**
	- Giả sử $A$ là ma trận khả nghịch

$$y = Ax \quad\quad y + \delta y = A(x + \delta x)$$

$$\delta x = A^{-1}\delta y \Rightarrow \|\delta x\| \le \|A^{-1}\|\|\delta y\|$$

$$\|y\| \le \|A\|\|x\| \Rightarrow \frac{1}{\|x\|} \le \frac{\|A\|}{\|y\|} \Rightarrow \frac{\|\delta x\|}{\|x\|} \le \|A\|\|A^{-1}\|\frac{\|\delta y\|}{\|y\|}$$

$$condA = \|A\|\|A^{-1}\| = \frac{\sigma_{\max}}{\sigma_{\min}} $$