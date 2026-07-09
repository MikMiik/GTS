### Phương pháp lặp đơn giải hệ phương trình phi tuyến

**Đầu vào:** Hệ phương trình $F(X) = 0$, véc-tơ lặp ban đầu $X_0$, sai số $\varepsilon$.

**Đầu ra:** Nghiệm xấp xỉ $X_n$.

**Bước 1: Đưa về dạng lặp**

- Biến đổi hệ $F(X) = 0 \iff X = \varphi(X)$.
    
- Xác định miền $D \subset \mathbb{R}^m$ sao cho $\varphi(X) \in D, \forall X \in D$.
    

**Bước 2: Kiểm tra điều kiện ánh xạ co**

- Lập ma trận Jacobi $D\varphi = \left[ \frac{\partial \varphi_i}{\partial x_j} \right]_{i,j=\overline{1,m}}$.
    
- Tính chuẩn ma trận (thường dùng chuẩn hàng $\|A\|_\infty = \max_i \sum_j |a_{ij}|$).
    
- Tìm hệ số co $q = \max_D \|D\varphi\|$. Điều kiện lặp hội tụ: $q < 1$.
    

**Bước 3: Tính dãy lặp**

- Lặp với $k \ge 1$: Tính $X_k = \varphi(X_{k-1})$.
    

**Bước 4: Kiểm tra điều kiện dừng**

- Tính sai số (theo công thức hậu nghiệm): $\Delta = \frac{q}{1-q} \|X_k - X_{k-1}\|$.
    
- Nếu $\Delta \le \varepsilon$: Dừng lặp, thu được nghiệm $X_n \approx X_k$.
    
- Nếu $\Delta > \varepsilon$: Quay lại Bước 3.

---
### Ví dụ phương pháp lặp đơn giải hệ phương trình phi tuyến

**Đầu vào:** Hệ phương trình:

$$\begin{cases} 3x_1 - \cos(x_2 x_3) - 0.5 = 0 \\ x_1^2 - 81(x_2 + 0.1)^2 + \sin(x_3) + 1.06 = 0 \\ e^{-x_1 x_2} + 20x_3 + 9.1389 = 0 \end{cases}$$

Véc-tơ khởi tạo $X_0 = (0, 0, 0)$, yêu cầu sai số $\varepsilon = 10^{-4}$.

**Bước 1: Đưa về dạng lặp $X = \varphi(X)$**

- Rút $x_1, x_2, x_3$ từ hệ phương trình gốc:
    
    $$\begin{cases} x_1 = \frac{1}{3}(\cos(x_2 x_3) + 0.5) \\ x_2 = \frac{1}{9}\sqrt{x_1^2 + \sin(x_3) + 1.06} - 0.1 \\ x_3 = -\frac{1}{20}e^{-x_1 x_2} - \frac{9.1389}{20} \end{cases}$$
    
- Chọn miền khảo sát $D = [-1, 1]^3$.
    

**Bước 2: Kiểm tra điều kiện ánh xạ co**

- Tính các đạo hàm riêng $\frac{\partial \varphi_i}{\partial x_j}$:
    
    - $\frac{\partial \varphi_1}{\partial x_1} = 0$; $\quad \frac{\partial \varphi_1}{\partial x_2} = \frac{-x_3 \sin(x_2 x_3)}{3}$; $\quad \frac{\partial \varphi_1}{\partial x_3} = \frac{-x_2 \sin(x_2 x_3)}{3}$
        
    - $\frac{\partial \varphi_2}{\partial x_1} = \frac{x_1}{9\sqrt{x_1^2 + \sin(x_3) + 1.06}}$; $\quad \frac{\partial \varphi_2}{\partial x_2} = 0$; $\quad \frac{\partial \varphi_2}{\partial x_3} = \frac{\cos(x_3)}{18\sqrt{x_1^2 + \sin(x_3) + 1.06}}$
        
    - $\frac{\partial \varphi_3}{\partial x_1} = \frac{x_2}{20} e^{-x_1 x_2}$; $\quad \frac{\partial \varphi_3}{\partial x_2} = \frac{x_1}{20} e^{-x_1 x_2}$; $\quad \frac{\partial \varphi_3}{\partial x_3} = 0$
        
- Đánh giá chuẩn hàng ma trận Jacobi (tổng trị tuyệt đối từng hàng) trên miền $D$:
    
    - Tổng hàng 1: $\left|\frac{\partial \varphi_1}{\partial x_1}\right| + \left|\frac{\partial \varphi_1}{\partial x_2}\right| + \left|\frac{\partial \varphi_1}{\partial x_3}\right| \le \frac{2\sin 1}{3} \approx 0.56$
        
    - Tổng hàng 2: $\left|\frac{\partial \varphi_2}{\partial x_1}\right| + \left|\frac{\partial \varphi_2}{\partial x_2}\right| + \left|\frac{\partial \varphi_2}{\partial x_3}\right| = \frac{2|x_1| + |\cos x_3|}{18\sqrt{x_1^2 + \sin(x_3) + 1.06}} \le \frac{3}{18\sqrt{1.06}} = \frac{1}{6\sqrt{1.06}} \approx 0.16$
        
    - Tổng hàng 3: $\left|\frac{\partial \varphi_3}{\partial x_1}\right| + \left|\frac{\partial \varphi_3}{\partial x_2}\right| + \left|\frac{\partial \varphi_3}{\partial x_3}\right| = \frac{|x_1| + |x_2|}{20} e^{-x_1 x_2} \le \frac{2e}{20} = \frac{e}{10} \approx 0.27$
        
- Hệ số co $q = \max_D \|D\varphi\|_\infty = \max\left\{\frac{2\sin 1}{3}, \frac{1}{6\sqrt{1.06}}, \frac{e}{10}\right\} = 0.56 < 1$. Hệ thỏa mãn điều kiện hội tụ.
    

**Bước 3: Công thức lặp**

- Tính dãy $X_{k+1}$ dựa trên $X_k$:
    
    $$\begin{cases} x_{1, k+1} = \frac{1}{3}(\cos(x_{2,k} x_{3,k}) + 0.5) \\ x_{2, k+1} = \frac{1}{9}\sqrt{x_{1,k}^2 + \sin(x_{3,k}) + 1.06} - 0.1 \\ x_{3, k+1} = -\frac{1}{20}e^{-x_{1,k} x_{2,k}} - \frac{9.1389}{20} \end{cases}$$
    

**Bước 4: Điều kiện dừng**

- Sử dụng công thức đánh giá sai số hậu nghiệm:
    
    $$\|X_n - X^*\| \le \frac{q}{1-q} \|X_n - X_{n-1}\| \le \varepsilon$$
    
- Với $q = 0.56$ và $\varepsilon = 10^{-4}$, quá trình lặp dừng lại khi:
    
    $$\frac{0.56}{1 - 0.56} \|X_n - X_{n-1}\|_\infty \le 10^{-4} \implies \|X_n - X_{n-1}\|_\infty \le \frac{0.44}{0.56} \cdot 10^{-4}$$