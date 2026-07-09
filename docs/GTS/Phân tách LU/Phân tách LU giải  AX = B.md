#### Thuật toán
- **Input:** Ma trận $A_{n \times n}$, vectơ cột $B$ cấp $n$
    
- **Output:** Vectơ nghiệm $X$
    
- **Bước 1 ($B_1$): Phân tích $A = LU$**
    
    Khởi tạo $L$ là ma trận tam giác dưới, $U$ là ma trận tam giác trên với đường chéo chính $u_{ii} = 1$. Cho vòng lặp $k$ chạy từ $1$ đến $n$:
    
    - Tính cột $k$ của $L$: $l_{ik} = a_{ik} - \sum_{m=1}^{k-1} l_{im} u_{mk} \quad (i = k \dots n)$
        
    - Tính dòng $k$ của $U$: $u_{kj} = \frac{1}{l_{kk}} \left( a_{kj} - \sum_{m=1}^{k-1} l_{km} u_{mj} \right) \quad (j = k+1 \dots n)$
        
- **Bước 2 ($B_2$): Giải hệ phương trình $LY = B$**
    
    Tính các phần tử của vectơ $Y = [y_1, y_2 \dots y_n]^T$ theo chiều tiến (từ $1 \to n$):
    
    - $y_1 = \frac{b_1}{l_{11}}$
        
    - $y_i = \frac{1}{l_{ii}} \left( b_i - \sum_{j=1}^{i-1} l_{ij} y_j \right) \quad (i = 2 \dots n)$
        
- **Bước 3 ($B_3$): Giải hệ phương trình $UX = Y$**
    
    Tính các phần tử của vector $X = [x_1, x_2 \dots x_n]^T$ theo chiều lùi (từ $n \to 1$):
    
    - $x_n = y_n$
        
    - $x_i = y_i - \sum_{j=i+1}^n u_{ij} x_j \quad (i = n-1 \dots 1)$
**THUẬT TOÁN PHÂN TÁCH LU GIẢI PHƯƠNG TRÌNH AX = B**

- **Input:** Ma trận $A_{n \times n}$, vectơ cột $B$ cấp $n$
    
- **Output:** Vectơ nghiệm $X$
    
- **Bước 1 ($B_1$): Phân tích $A = LU$**
    
    Khởi tạo $L$ là ma trận tam giác dưới, $U$ là ma trận tam giác trên với đường chéo chính $u_{ii} = 1$. Cho vòng lặp $k$ chạy từ $1$ đến $n$:
    
    - Tính cột $k$ của $L$: $l_{ik} = a_{ik} - \sum_{m=1}^{k-1} l_{im} u_{mk} \quad (i = k \dots n)$
        
    - Tính dòng $k$ của $U$: $u_{kj} = \frac{1}{l_{kk}} \left( a_{kj} - \sum_{m=1}^{k-1} l_{km} u_{mj} \right) \quad (j = k+1 \dots n)$
        
- **Bước 2 ($B_2$): Giải hệ phương trình $LY = B$**
    
    Tính các phần tử của vector $Y = [y_1, y_2 \dots y_n]^T$ theo chiều tiến (từ $1 \to n$):
    
    - $y_1 = \frac{b_1}{l_{11}}$
        
    - $y_i = \frac{1}{l_{ii}} \left( b_i - \sum_{j=1}^{i-1} l_{ij} y_j \right) \quad (i = 2 \dots n)$
        
- **Bước 3 ($B_3$): Giải hệ phương trình $UX = Y$**
    
    Tính các phần tử của vector $X = [x_1, x_2 \dots x_n]^T$ theo chiều lùi (từ $n \to 1$):
    
    - $x_n = y_n$
        
    - $x_i = y_i - \sum_{j=i+1}^n u_{ij} x_j \quad (i = n-1 \dots 1)$
        

---

VD ma trận cấp 7

$A = \begin{bmatrix} 2 & 2 & 0 & 0 & 0 & 0 & 0 \\ 1 & 3 & 2 & 0 & 0 & 0 & 0 \\ 0 & 1 & 3 & 2 & 0 & 0 & 0 \\ 0 & 0 & 1 & 3 & 2 & 0 & 0 \\ 0 & 0 & 0 & 1 & 3 & 2 & 0 \\ 0 & 0 & 0 & 0 & 1 & 3 & 2 \\ 0 & 0 & 0 & 0 & 0 & 1 & 3 \end{bmatrix}, \quad B = \begin{bmatrix} 4 \\ 6 \\ 6 \\ 6 \\ 6 \\ 6 \\ 4 \end{bmatrix}$

**$B_1$: Phân tích $A = LU$**

$L = \begin{bmatrix} 2 & 0 & 0 & 0 & 0 & 0 & 0 \\ 1 & 2 & 0 & 0 & 0 & 0 & 0 \\ 0 & 1 & 2 & 0 & 0 & 0 & 0 \\ 0 & 0 & 1 & 2 & 0 & 0 & 0 \\ 0 & 0 & 0 & 1 & 2 & 0 & 0 \\ 0 & 0 & 0 & 0 & 1 & 2 & 0 \\ 0 & 0 & 0 & 0 & 0 & 1 & 2 \end{bmatrix}, \quad U = \begin{bmatrix} 1 & 1 & 0 & 0 & 0 & 0 & 0 \\ 0 & 1 & 1 & 0 & 0 & 0 & 0 \\ 0 & 0 & 1 & 1 & 0 & 0 & 0 \\ 0 & 0 & 0 & 1 & 1 & 0 & 0 \\ 0 & 0 & 0 & 0 & 1 & 1 & 0 \\ 0 & 0 & 0 & 0 & 0 & 1 & 1 \\ 0 & 0 & 0 & 0 & 0 & 0 & 1 \end{bmatrix}$

**$B_2$: Giải hệ $LY = B$**

- $2y_1 = 4 \Rightarrow y_1 = 2$
    
- $y_{i-1} + 2y_i = 6 \Rightarrow 2 + 2y_i = 6 \Rightarrow y_i = 2 \quad (\text{với } i = 2, 3, 4, 5, 6)$
    
- $y_6 + 2y_7 = 4 \Rightarrow 2 + 2y_7 = 4 \Rightarrow y_7 = 1$
    
    $\Rightarrow Y = [2, 2, 2, 2, 2, 2, 1]^T$
    

**$B_3$: Giải hệ $UX = Y$**

- $x_7 = y_7 = 1$
    
- $x_i + x_{i+1} = y_i \Rightarrow x_i + 1 = 2 \Rightarrow x_i = 1 \quad (\text{với } i = 6, 5, 4, 3, 2, 1)$
    
    $\Rightarrow X = [1, 1, 1, 1, 1, 1, 1]^T$