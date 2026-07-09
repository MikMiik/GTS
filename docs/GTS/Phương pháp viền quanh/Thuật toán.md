### Phương pháp viền quanh tìm ma trận nghịch đảo

**Đầu vào:** Ma trận vuông $A \in \mathbb{R}^{n \times n}$.

**Đầu ra:** Ma trận nghịch đảo $A^{-1}$.

**Bước 1: Khởi tạo và kiểm tra điều kiện đầu**

- Xét phần tử $a_{11}$. Nếu $a_{11} = 0$, chuyển ngay sang Bước 4.
    
- Gán ma trận nghịch đảo cấp 1: $A_1^{-1} = \begin{bmatrix} \frac{1}{a_{11}} \end{bmatrix}$.
    

**Bước 2: Lặp viền quanh (với $k$ chạy từ $2$ đến $n$)**

- Trích xuất các thành phần để viền ma trận cấp $k$:
    
    $$A_k = \begin{bmatrix} A_{k-1} & \alpha_{k-1,1} \\ \alpha_{1,k-1} & a_{kk} \end{bmatrix}$$
    
    (với $\alpha_{k-1,1}$ là véc-tơ cột, $\alpha_{1,k-1}$ là véc-tơ hàng kích thước tương ứng) .
    
- Tính hệ số vô hướng $m = a_{kk} - \alpha_{1,k-1} A_{k-1}^{-1} \alpha_{k-1,1}$.
    
- Nếu $m = 0$, quá trình lặp thất bại (định thức con bằng 0), chuyển sang Bước 4.
    
- Tính các khối con của ma trận nghịch đảo cấp $k$:
    
    1. $b_{kk} = \frac{1}{m}$.
        
    2. $\beta_{k-1,1} = -b_{kk} A_{k-1}^{-1} \alpha_{k-1,1}$.
        
    3. $\beta_{1,k-1} = -b_{kk} \alpha_{1,k-1} A_{k-1}^{-1}$.
        
    4. $B_{k-1} = A_{k-1}^{-1} - \beta_{k-1,1} \alpha_{1,k-1} A_{k-1}^{-1}$.
        
- Ghép các khối thành ma trận nghịch đảo cấp $k$:
    
    $$A_k^{-1} = \begin{bmatrix} B_{k-1} & \beta_{k-1,1} \\ \beta_{1,k-1} & b_{kk} \end{bmatrix}$$
    
    .
    

**Bước 3: Kết thúc lặp**

- Khi $k = n$, vòng lặp dừng. Thu được kết quả $A^{-1} = A_n^{-1}$.
    

**Bước 4: Xử lý ngoại lệ (Ma trận không thỏa mãn điều kiện viền quanh)**

- Áp dụng khi $a_{11} = 0$ hoặc tồn tại định thức con $m = 0$.
    
- Lập ma trận đối xứng $M = A^TA$.
    
- Áp dụng lại thuật toán (từ Bước 1 đến Bước 3) cho $M$ để tìm $M^{-1}$ (ma trận $M$ luôn thỏa mãn điều kiện thực hiện phương pháp).
    
- Tính kết quả cuối cùng theo công thức: $A^{-1} = M^{-1}A^T$.