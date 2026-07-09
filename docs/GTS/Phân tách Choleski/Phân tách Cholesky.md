#### Thuật toán
- **Input:** Ma trận đối xứng xác định dương $A$ cấp $n$. 
- **Output:** Ma trận tam giác dưới $L$ sao cho $A = L \cdot L^T$.
---
- **Bước 1: Khởi tạo**
    
    - Tạo ma trận $L$ cấp $n \times n$.
        
    - Gán $l_{ij} = 0$ với mọi $i < j$ (phía trên đường chéo chính).
        
- **Bước 2: Vòng lặp tính toán**
    
    - Duyệt cột $j$ chạy từ $1 \to n$:
        
        - **Tính phần tử đường chéo chính:**
            
            $$l_{jj} = \sqrt{a_{jj} - \sum_{k=1}^{j-1} l_{jk}^2}$$
            
        - **Tính các phần tử dưới đường chéo (Hàng $i$ chạy từ $j+1 \to n$):**
            
            $$l_{ij} = \frac{1}{l_{jj}} \left( a_{ij} - \sum_{k=1}^{j-1} l_{ik} \cdot l_{jk} \right)$$

---
### VD (Ma trận $A$ cấp 8, $a_{ij} = \min(i,j)$)

- **Cột $j = 1$:**
    
    - $l_{11} = \sqrt{a_{11}} = \sqrt{1} = 1$
        
    - $l_{i1} = \frac{a_{i1}}{l_{11}} = \frac{1}{1} = 1 \quad (\forall i \in [2, 8])$
        
- **Cột $j = 2$:**
    
    - $l_{22} = \sqrt{a_{22} - l_{21}^2} = \sqrt{2 - 1^2} = 1$
        
    - $l_{i2} = \frac{a_{i2} - l_{i1}l_{21}}{l_{22}} = \frac{2 - 1 \cdot 1}{1} = 1 \quad (\forall i \in [3, 8])$
        
- **Cột $j = 3$:**
    
    - $l_{33} = \sqrt{a_{33} - (l_{31}^2 + l_{32}^2)} = \sqrt{3 - (1+1)} = 1$
        
    - $l_{i3} = \frac{a_{i3} - (l_{i1}l_{31} + l_{i2}l_{32})}{l_{33}} = \frac{3 - (1+1)}{1} = 1 \quad (\forall i \in [4, 8])$
        
- **Từ cột $j = 4 \to 8$:** Lặp lại công thức trừ tích lũy $\to$ thu được $l_{ij} = 1$ với mọi $i \ge j$.
