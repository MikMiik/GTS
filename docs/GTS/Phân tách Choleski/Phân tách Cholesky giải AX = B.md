#### Thuật toán

**Input:** Ma trận đối xứng xác định dương $A$ cấp $n$, vector hệ số tự do $B$ cấp $n$.

**Output:** Vector nghiệm $X$.

---

**Bước 1: Phân tách Cholesky $A = LL^T$**

Tìm ma trận tam giác dưới $L$ ($l_{ii} > 0$) sao cho $A = L \cdot L^T$.

Duyệt theo từng cột $j$ từ $1$ đến $n$:

- **Tính phần tử trên đường chéo:**
    
    $$l_{jj} = \sqrt{a_{jj} - \sum_{k=1}^{j-1} l_{jk}^2}$$
    
- **Tính các phần tử dưới đường chéo ($i = j+1 \dots n$):**
    
    $$l_{ij} = \frac{1}{l_{jj}} \left( a_{ij} - \sum_{k=1}^{j-1} l_{ik} \cdot l_{jk} \right)$$
    

**Bước 2: Giải hệ phương trình tam giác dưới $LY = B$**

Tính các phần tử của vector trung gian $Y = [y_1, y_2 \dots y_n]^T$ theo thứ tự từ trên xuống:

- $$y_1 = \frac{b_1}{l_{11}}$$
    
- $$y_i = \frac{1}{l_{ii}} \left( b_i - \sum_{j=1}^{i-1} l_{ij}y_j \right) \quad (i = 2 \dots n)$$
    

**Bước 3: Giải hệ phương trình tam giác trên $L^TX = Y$**

Tính các phần tử của vector nghiệm $X = [x_1, x_2 \dots x_n]^T$ theo thứ tự từ dưới lên trên. Chú ý ma trận $L^T$ có các phần tử $u_{ij} = l_{ji}$:

- $$x_n = \frac{y_n}{l_{nn}}$$
    
- $$x_i = \frac{1}{l_{ii}} \left( y_i - \sum_{j=i+1}^{n} l_{ji}x_j \right) \quad (i = n-1 \dots 1)$$
---
	### VD (Hệ phương trình cấp 7)

Cho $A$ là ma trận vuông cấp 7 với $a_{ij} = \min(i,j)$, vector $B = [7, 13, 18, 22, 25, 27, 28]^T$.

- **Bước 1: Phân tách $A = LL^T$**
    
    - Áp dụng thuật toán, thu được ma trận tam giác dưới $L$ cấp 7 với các phần tử $l_{ij} = 1 \quad (\forall i \ge j)$ và $l_{ij} = 0 \quad (\forall i < j)$.
        
- **Bước 2: Giải hệ $LY = B$**
    
    - $y_1 = \frac{7}{1} = 7$
        
    - $y_2 = \frac{13 - (1 \cdot 7)}{1} = 6$
        
    - $y_3 = \frac{18 - (1 \cdot 7 + 1 \cdot 6)}{1} = 5$
        
    - $y_4 = \frac{22 - (7 + 6 + 5)}{1} = 4$
        
    - $y_5 = \frac{25 - (7 + 6 + 5 + 4)}{1} = 3$
        
    - $y_6 = \frac{27 - (7 + 6 + 5 + 4 + 3)}{1} = 2$
        
    - $y_7 = \frac{28 - (7 + 6 + 5 + 4 + 3 + 2)}{1} = 1$
        
    - $\Rightarrow Y = [7, 6, 5, 4, 3, 2, 1]^T$
        
- **Bước 3: Giải hệ $L^TX = Y$**
    
    - $x_7 = \frac{1}{1} = 1$
        
    - $x_6 = \frac{2 - (1 \cdot 1)}{1} = 1$
        
    - $x_5 = \frac{3 - (1 \cdot 1 + 1 \cdot 1)}{1} = 1$
        
    - Tương tự, tính ngược lên thu được: $x_4 = 1, x_3 = 1, x_2 = 1, x_1 = 1$.
        
    - $\Rightarrow X = [1, 1, 1, 1, 1, 1, 1]^T$