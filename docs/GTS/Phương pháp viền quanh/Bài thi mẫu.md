![[Pasted image 20260709231552.png]]
**Đánh giá ban đầu:** Ma trận $A$ có phần tử $a_{11} = 0$. Theo thuật toán phương pháp viền quanh, ma trận không thỏa mãn điều kiện áp dụng trực tiếp. Cần kích hoạt **Bước 4 (Xử lý ngoại lệ)** của thuật toán.

**Bước 1: Tính ma trận đối xứng $M = A^TA$**

Để đảm bảo điều kiện viền quanh luôn thỏa mãn, tính ma trận $M$:

$$M = A^TA = \begin{bmatrix} 0 & 10 & -3 & 2 & -6 & 5 \\ -5 & 0 & 4 & 8 & 10 & 1 \\ -8 & -7 & -5 & 7 & -5 & 7 \\ -5 & 9 & -3 & -6 & -5 & 2 \\ -1 & -3 & 7 & 2 & 1 & 9 \\ -4 & 5 & 5 & -3 & 1 & -9 \end{bmatrix} \begin{bmatrix} 0 & -5 & -8 & -5 & -1 & -4 \\ 10 & 0 & -7 & 9 & -3 & 5 \\ -3 & 4 & -5 & -3 & 7 & 5 \\ 2 & 8 & 7 & -6 & 2 & -3 \\ -6 & 10 & -5 & -5 & 1 & 1 \\ 5 & 1 & 7 & 2 & 9 & -9 \end{bmatrix}$$

Trích xuất các phần tử góc trên bên trái của $M$ để thực hiện các bước lặp đầu tiên:

- $m_{11} = 0^2 + 10^2 + (-3)^2 + 2^2 + (-6)^2 + 5^2 = 174$
    
- $m_{12} = m_{21} = 0 + 0 - 12 + 16 - 60 + 5 = -51$
    
- $m_{22} = 25 + 0 + 16 + 64 + 100 + 1 = 206$
    

**Bước 2: Khởi tạo lặp trên $M$ (Cấp 1)**

- $M_1 = [174]$
    
- Khởi tạo ma trận nghịch đảo cấp 1: $M_1^{-1} = \begin{bmatrix} \frac{1}{174} \end{bmatrix}$
    

**Bước 3: Lặp viền quanh cấp 2 ($k=2$)**

- Trích xuất ma trận viền: $M_2 = \begin{bmatrix} 174 & -51 \\ -51 & 206 \end{bmatrix}$, với $\alpha_{1,1} = \begin{bmatrix} -51 \end{bmatrix}$
    
- Tính hệ số vô hướng $m_2$:
    
    $$m_2 = m_{22} - \alpha_{1,1}^T M_1^{-1} \alpha_{1,1} = 206 - (-51)\begin{bmatrix} \frac{1}{174} \end{bmatrix}(-51) = 206 - \frac{2601}{174} = \frac{33243}{174}$$
    
- Tính các khối con:
    
    1. $b_{22} = \frac{1}{m_2} = \frac{174}{33243}$
        
    2. $\beta_{1,1} = -b_{22} M_1^{-1} \alpha_{1,1} = -\frac{174}{33243} \cdot \frac{1}{174} \cdot (-51) = \frac{51}{33243}$
        
    3. $B_1 = M_1^{-1} - \beta_{1,1} \alpha_{1,1}^T M_1^{-1} = \frac{1}{174} - \frac{51}{33243} \cdot (-51) \cdot \frac{1}{174} = \frac{206}{33243}$
        
- Ghép thành ma trận nghịch đảo cấp 2:
    
    $$M_2^{-1} = \frac{1}{33243} \begin{bmatrix} 206 & 51 \\ 51 & 174 \end{bmatrix}$$
    

**Bước 4: Tiếp tục lặp viền quanh ($k=3 \to 6$)**

Quá trình tính toán lặp lại tính chất thuật toán cho đến cấp 6:

- **$k=3$:** Dùng $M_2^{-1}$ và cột/hàng 3 của $M$ (tính $\alpha_{2,1} = \begin{bmatrix} m_{13} \\ m_{23} \end{bmatrix}$), thu được $M_3^{-1}$.
    
- **$k=4$:** Dùng $M_3^{-1}$ và cột/hàng 4 của $M$, thu được $M_4^{-1}$.
    
- **$k=5$:** Dùng $M_4^{-1}$ và cột/hàng 5 của $M$, thu được $M_5^{-1}$.
    
- **$k=6$:** Dùng $M_5^{-1}$ và cột/hàng 6 của $M$, thu được ma trận nghịch đảo toàn phần $M_6^{-1} = M^{-1}$.
    

**Bước 5: Tính kết quả cuối cùng**

- Áp dụng công thức xử lý ngoại lệ từ thuật toán:
    
    $$A^{-1} = M^{-1}A^T$$
    
    Nhân ma trận $M^{-1}$ (vừa tìm được ở cấp 6) với ma trận chuyển vị $A^T$ để có ma trận nghịch đảo của hệ ban đầu.