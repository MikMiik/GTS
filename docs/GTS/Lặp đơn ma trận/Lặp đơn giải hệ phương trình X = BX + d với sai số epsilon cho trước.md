
#### Thuật toán
- **Input:** Ma trận $B$ cấp $n$, vector cột $D$ cấp $n$, sai số $\varepsilon$.
    
- **Output:** Vector nghiệm gần đúng $X^*$.
    

---

### Các bước thực hiện

- **Bước 1: Kiểm tra điều kiện hội tụ**
    
    - Tính chuẩn ma trận $q = ||B||$.
        
    - Nếu $q \ge 1$: Dừng thuật toán (không thỏa mãn điều kiện hội tụ).
        
    - Nếu $q < 1$: Chuyển sang Bước 2.
        
- **Bước 2: Khởi tạo**
    
    - Chọn vector lặp ban đầu $X^{(0)} \in \mathbb{R}^n$.
        
    - Gán biến đếm $k = 0$.
        
- **Bước 3: Lặp tính toán**
    
    - $X^{(k+1)} = B X^{(k)} + D$
        
- **Bước 4: Kiểm tra điều kiện dừng**
    
	- Tính sai số quy đổi: $\varepsilon' = \varepsilon \cdot \frac{1-q}{q}$
	    
	- Đánh giá sai số: $||X^{(k+1)} - X^{(k)}|| \le \varepsilon'$
	    
	- Nếu thỏa mãn: Dừng thuật toán $\to X^* = X^{(k+1)}$.
	    
	- Nếu không thỏa mãn: Gán $k = k + 1$, quay lại Bước 3.

---

### VD (Giải hệ $X = CX + D$ với sai số $\varepsilon = 10^{-4}$)

Cho $C = \begin{pmatrix} 0.2 & 0.15 & -0.3 \\ 0.4 & 0.1 & 0.1 \\ -0.15 & 0.2 & -0.25 \end{pmatrix}, \quad D = \begin{pmatrix} 3.7 \\ 3.8 \\ 4.5 \end{pmatrix}$

- **Bước 1: Kiểm tra hội tụ**
    
    - $q = ||C||_\infty = \max(0.65, 0.6, 0.6) = 0.65$
        
    - $q = 0.65 < 1 \to$ Hội tụ.
        
- **Bước 2: Khởi tạo**
    
    - Chọn $X^{(0)} = [3, 5, 7]^T$, $k = 0$.
        
    - Tính $\varepsilon' = \varepsilon \cdot \frac{1-q}{q} = 10^{-4} \cdot \frac{1 - 0.65}{0.65} \approx 5.38 \cdot 10^{-5}$
        
- **Bước 3 & 4: Lặp tính toán và kiểm tra sai số**
    
    _(Ghi chú: Bài toán trong vở xét chuẩn tương đối $\Delta^{(n)} = \frac{||X^{(n)} - X^{(n-1)}||_\infty}{||X^{(n)}||_\infty}$)_
    
    - $k = 0: X^{(0)} = [3, 5, 7]^T$
        
    - $k = 1: X^{(1)} = C X^{(0)} + D = [2.95, 5.2, 3.3]^T \quad \to \Delta^{(1)} = 0.7115 > \varepsilon'$
        
    - $k = 2: X^{(2)} = C X^{(1)} + D = [4.08, 4.83, 4.2725]^T \quad \to \Delta^{(2)} \approx 0.233954 > \varepsilon'$
        
    - $\dots$
        
    - $k = 11: X^{(11)} = [4.149521172, 5.39617891, 3.965078589]^T \quad \to \Delta^{(11)} \approx 1.806 \cdot 10^{-4} > \varepsilon'$
        
    - $k = 12: X^{(12)} = [4.149807494, 5.395934219, 3.9653795]^T \quad \to \Delta^{(12)} \approx 3.12864 \cdot 10^{-5} \le \varepsilon'$
        
- **Kết luận:**
    
    - Tại $k = 12$, sai số đã thỏa mãn $\Delta^{(12)} \le \varepsilon'$.
        
    - Vậy nghiệm xấp xỉ là $X^* \approx X^{(12)} = [4.149807494, 5.395934219, 3.9653795]^T$.