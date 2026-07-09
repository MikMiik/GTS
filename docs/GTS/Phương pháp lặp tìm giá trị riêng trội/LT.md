### Mục tiêu của phương pháp lặp tìm giá trị riêng trội

- Tìm giá trị riêng có mô-đun lớn nhất (giá trị riêng trội) của một ma trận vuông thực $A$ cỡ $n \times n$.
    
- Tìm véc-tơ riêng tương ứng với giá trị riêng trội đó.
    

### Ý tưởng của phương pháp lặp (Phương pháp lũy thừa)

- **Giả thiết nền tảng:** Giả sử ma trận $A$ có các giá trị riêng xếp theo thứ tự giảm dần về mô-đun: $|\lambda_{1}| \ge |\lambda_{2}| \ge \dots \ge |\lambda_{s}|$. Các véc-tơ riêng tương ứng là $v_1, v_2, \dots, v_s$ lập thành một cơ sở.
    
- **Khai triển véc-tơ ban đầu:** Chọn một véc-tơ ban đầu $x \neq 0$ và biểu diễn nó dưới dạng tổ hợp tuyến tính của các véc-tơ riêng:
    
    $$x = a_{1}v_{1} + a_{2}v_{2} + \dots + a_{s}v_{s}$$
    
- **Tác động lũy thừa của ma trận:** Khi nhân liên tiếp ma trận $A$ vào véc-tơ $x$ đến bậc $k$, dựa trên tính chất $Av_i = \lambda_i v_i$, ta thu được:
    
    $$A^{k}x = a_{1}\lambda_{1}^{k}v_{1} + a_{2}\lambda_{2}^{k}v_{2} + \dots + a_{s}\lambda_{s}^{k}v_{s}$$
    
- **Trội hóa và giới hạn:** Chia cả hai vế cho $\lambda_{1}^{k}$:
    
    $$\frac{A^{k}x}{\lambda_{1}^{k}} = a_{1}v_{1} + a_{2}\left(\frac{\lambda_{2}}{\lambda_{1}}\right)^{k}v_{2} + \dots + a_{s}\left(\frac{\lambda_{s}}{\lambda_{1}}\right)^{k}v_{s}$$
    
	- Vì $\lambda_1$ là giá trị riêng trội, các tỷ số $\left(\frac{\lambda_{i}}{\lambda_{1}}\right)^{k}$ sẽ tiến dần về $0$ hoặc bị triệt tiêu khi $k \to \infty$. Do đó, véc-tơ $A^kx$ sẽ bị hướng theo véc-tơ riêng của giá trị riêng trội.
    
- **Xấp xỉ kết quả:** Từ sự hội tụ này, giá trị riêng trội $\lambda_1$ và véc-tơ riêng tương ứng được xác định dựa trên tỷ số giữa các thành phần của véc-tơ ở các bước lặp liên tiếp (ví dụ: $\lambda_{1} \approx \frac{(A^{k+1}x)_{i}}{(A^{k}x)_{i}}$ đối với trường hợp một thực trội).

---
### Phương pháp lũy thừa 
- **Bước 1: Khai triển véc-tơ ban đầu** Chọn một véc-tơ thử ban đầu $x \ne 0$. Biểu diễn véc-tơ này qua hệ cơ sở gồm các véc-tơ riêng $v_1, v_2, \dots, v_s$ của ma trận $A$:
    
    $$x = a_{1}v_{1} + a_{2}v_{2} + \dots + a_{s}v_{s}$$
    
- **Bước 2: Nhân lũy thừa ma trận** Nhân liên tiếp ma trận $A$ vào véc-tơ $x$ đến bước lặp thứ $k$. Dựa trên tính chất giá trị riêng và véc-tơ riêng $Av_i = \lambda_i v_i$ , ta thu được véc-tơ lặp:
    
    $$A^{k}x = a_{1}\lambda_{1}^{k}v_{1} + a_{2}\lambda_{2}^{k}v_{2} + \dots + a_{s}\lambda_{s}^{k}v_{s}$$
    
- **Bước 3: Đánh giá hội tụ theo từng trường hợp của giá trị riêng trội**
    
    - **Trường hợp 1: Có một giá trị riêng thực trội duy nhất ($|\lambda_{1}| > |\lambda_{2}|$)**
        
        - Tiến hành chia véc-tơ lặp cho $\lambda_{1}^{k}$:
            
            $$\frac{A^{k}x}{\lambda_{1}^{k}} = a_{1}v_{1} + a_{2}\frac{\lambda_{2}^{k}}{\lambda_{1}^{k}}v_{2} + \dots + a_{s}\frac{\lambda_{s}^{k}}{\lambda_{1}^{k}}v_{s}$$
        - Lấy giới hạn khi $k \rightarrow \infty$, do $\left|\frac{\lambda_{i}}{\lambda_{1}}\right| < 1$ với mọi $i \ge 2$, các số hạng sau đều tiến về $0$:    $$\lim_{k\rightarrow\infty}\frac{A^{k}x}{\lambda_{1}^{k}} = a_{1}v_{1} \Rightarrow \frac{A^{k}x}{\lambda_{1}^{k}} \approx a_{1}v_{1}$$$$A^{k}x \approx \lambda_{1}^{k} a_{1} v_{1}$$$$A^{k}x \approx \lambda_{1}^{k} a_{1} v_{1}$$$$(A^{k}x)_i \approx \lambda_{1}^{k} a_{1} (v_{1})_i$$$$A^{k+1}x \approx \lambda_{1}^{k+1} a_{1} v_{1}$$$$(A^{k+1}x)_i \approx \lambda_{1}^{k+1} a_{1} (v_{1})_i$$$$\frac{(A^{k+1}x)_{i}}{(A^{k}x)_{i}} \approx \frac{\lambda_{1}^{k+1} a_{1} (v_{1})_i}{\lambda_{1}^{k} a_{1} (v_{1})_i} = \lambda_{1}$$
        - Xác định giá trị riêng trội $\lambda_1$ bằng tỷ số giữa các thành phần tương ứng của véc-tơ ở hai bước lặp liên tiếp:
            
            $$\lambda_{1} \approx \frac{(A^{k+1}x)_{i}}{(A^{k}x)_{i}} \quad \forall i = \overline{1,n}$$
            
    - **Trường hợp 2: Có hai giá trị riêng đối nhau ($|\lambda_{1}| = |\lambda_{2}| > |\lambda_{3}|$ và $\lambda_{1} = -\lambda_{2}$)**
        
        - Tách chuỗi lặp theo bước chẵn $2n$ để triệt tiêu sự đảo dấu của $(-1)^{2n}$:
            
            $$\lim_{n\rightarrow\infty}\frac{A^{2n}x}{\lambda_{1}^{2n}} = a_{1}v_{1} + a_{2}v_{2} \Rightarrow \frac{A^{2n}x}{\lambda_{1}^{2n}} \approx a_{1}v_{1} + a_{2}v_{2}$$
            
        - Nhân ma trận $A^2$ vào véc-tơ xấp xỉ để tạo hệ thức:
            
            $$A^{2}\left(\frac{A^{2n}x}{\lambda_{1}^{2n}}\right) = \lambda_{1}^{2}\left(\frac{A^{2n}x}{\lambda_{1}^{2n}}\right)$$
            
        - Xác định bình phương giá trị riêng trội:
            
            $$\lambda_{1}^{2} \approx \frac{(A^{2n+2}x)_{i}}{(A^{2n}x)_{i}}$$
            
    - **Trường hợp 3: Có hai giá trị riêng phức liên hợp ($|\lambda_{1}| = |\lambda_{2}| > |\lambda_{3}|$ và $\lambda_{1} = \overline{\lambda_{2}}$)**
        
        - Khi $n \rightarrow \infty$, các thành phần chứa $\lambda_3, \dots, \lambda_s$ bị triệt tiêu , véc-tơ xấp xỉ có dạng:
            
            $$A^{n}x \approx \lambda_{1}^{n}a_{1}v_{1} + \lambda_{2}^{n}a_{2}v_{2}$$
            
        - Thiết lập phương trình sai phân tuyến tính bậc hai dựa trên tổng $p = \lambda_1 + \lambda_2$ và tích $q = \lambda_1 \lambda_2$:
            
            $$(A^{n+2}x)_i - p(A^{n+1}x)_i + q(A^{n}x)_i = 0 \quad \forall i = \overline{1,n}$$
            
        - Giải phương trình đặc trưng $t^2 - pt + q = 0$ thông qua định thức để tìm cặp giá trị riêng phức liên hợp $\lambda_{1,2}$:
            
            $$\begin{vmatrix} \lambda^{2} & \lambda & 1 \\ (A^{n+2}x)_i & (A^{n+1}x)_i & (A^{n}x)_i \end{vmatrix} = 0$$
---
#### VD:
**Bài toán:** Tìm giá trị riêng trội của ma trận $A = \begin{bmatrix} 5 & -2 \\ 0 & 1 \end{bmatrix}$.

Khởi tạo $x_0 = \begin{bmatrix} 1 \\ 1 \end{bmatrix}$, sai số cho phép $\epsilon = 0.05$.

**Bước 1: Tính chuỗi lặp và chuẩn hóa**

- **Lần lặp 1 ($k=0$):**
    
    1. $y_1 = Ax_0 = \begin{bmatrix} 5 & -2 \\ 0 & 1 \end{bmatrix}\begin{bmatrix} 1 \\ 1 \end{bmatrix} = \begin{bmatrix} 3 \\ 1 \end{bmatrix}$.
        
    2. Phần tử có trị tuyệt đối lớn nhất: $m_1 = 3$.
        
    3. Chuẩn hóa: $x_1 = \frac{y_1}{3} = \begin{bmatrix} 1 \\ 0.333 \end{bmatrix}$.
        
    4. Kiểm tra: $\|x_1 - x_0\|_\infty = |0.333 - 1| = 0.667 \ge 0.05$. Tiếp tục lặp.
        
- **Lần lặp 2 ($k=1$):**
    
    1. $y_2 = Ax_1 = \begin{bmatrix} 5 & -2 \\ 0 & 1 \end{bmatrix}\begin{bmatrix} 1 \\ 0.333 \end{bmatrix} = \begin{bmatrix} 4.334 \\ 0.333 \end{bmatrix}$.
        
    2. Phần tử có trị tuyệt đối lớn nhất: $m_2 = 4.334$.
        
    3. Chuẩn hóa: $x_2 = \frac{y_2}{4.334} = \begin{bmatrix} 1 \\ 0.077 \end{bmatrix}$.
        
    4. Kiểm tra: $\|x_2 - x_1\|_\infty = |0.077 - 0.333| = 0.256 \ge 0.05$. Tiếp tục lặp.
        
- **Lần lặp 3 ($k=2$):**
    
    1. $y_3 = Ax_2 = \begin{bmatrix} 5 & -2 \\ 0 & 1 \end{bmatrix}\begin{bmatrix} 1 \\ 0.077 \end{bmatrix} = \begin{bmatrix} 4.846 \\ 0.077 \end{bmatrix}$.
        
    2. Phần tử có trị tuyệt đối lớn nhất: $m_3 = 4.846$.
        
    3. Chuẩn hóa: $x_3 = \frac{y_3}{4.846} = \begin{bmatrix} 1 \\ 0.016 \end{bmatrix}$.
        
    4. Kiểm tra: $\|x_3 - x_2\|_\infty = |0.016 - 0.077| = 0.061 \ge 0.05$. Tiếp tục lặp.
        
- **Lần lặp 4 ($k=3$):**
    
    1. $y_4 = Ax_3 = \begin{bmatrix} 5 & -2 \\ 0 & 1 \end{bmatrix}\begin{bmatrix} 1 \\ 0.016 \end{bmatrix} = \begin{bmatrix} 4.968 \\ 0.016 \end{bmatrix}$.
        
    2. Phần tử có trị tuyệt đối lớn nhất: $m_4 = 4.968$.
        
    3. Chuẩn hóa: $x_4 = \frac{y_4}{4.968} = \begin{bmatrix} 1 \\ 0.003 \end{bmatrix}$.
        
    4. Kiểm tra: $\|x_4 - x_3\|_\infty = |0.003 - 0.016| = 0.013 < 0.05$. Thỏa mãn điều kiện dừng.
        

**Bước 2: Xác định kết quả**

- Dãy lặp hội tụ (thuộc Trường hợp 1).
    
- Giá trị riêng trội xấp xỉ: $\lambda_1 = m_4 = 4.968$.
    
- Véc-tơ riêng xấp xỉ: $v_1 = x_4 = \begin{bmatrix} 1 \\ 0.003 \end{bmatrix}$.
    

_(Lưu ý: Giá trị đúng xác định bằng giải tích là $\lambda = 5$ và $v = \begin{bmatrix} 1 \\ 0 \end{bmatrix}$)_.