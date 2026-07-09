### Phương pháp lặp Jacobi

**Đầu vào:** Ma trận vuông $A \in \mathbb{R}^{m \times m}$, véc-tơ $B \in \mathbb{R}^m$, sai số $\varepsilon$.

**Đầu ra:** Véc-tơ nghiệm xấp xỉ $X^*$.

**Bước 1: Kiểm tra tính chéo trội và thiết lập tham số**

- Tính $q_{hang} = \max_{1 \le i \le m} \frac{\sum_{j \neq i} |a_{ij}|}{|a_{ii}|}$.
    
- Tính $q_{cot} = \max_{1 \le j \le m} \frac{\sum_{i \neq j} |a_{ij}|}{|a_{jj}|}$.
    
- **Trường hợp 1 ($A$ chéo trội hàng):** Nếu $q_{hang} < 1$, chọn $q = q_{hang}$, dùng chuẩn $p = \infty$, gán $\lambda = 1$.
    
- **Trường hợp 2 ($A$ chéo trội cột):** Nếu $q_{cot} < 1$, chọn $q = q_{cot}$, dùng chuẩn $p = 1$, gán $\lambda = \frac{\max |a_{ii}|}{\min |a_{ii}|}$.
    

**Bước 2: Thiết lập ma trận lặp**

- Lập ma trận $C$: $c_{ij} = -\frac{a_{ij}}{a_{ii}}$ với $i \neq j$, và $c_{ii} = 0$.
    
- Lập véc-tơ $D$: $d_i = \frac{b_i}{a_{ii}}$.
    

**Bước 3: Khởi tạo và tính dãy lặp**

- Chọn véc-tơ khởi tạo $X^{(0)}$ (thường chọn $X^{(0)} = D$).
    
- Lặp với $n \ge 0$:
    
    - Tính véc-tơ mới: $X^{(n+1)} = C X^{(n)} + D$.
        
    - Tính khoảng cách: $\Delta = \|X^{(n+1)} - X^{(n)}\|_p$.
        
    - Kiểm tra điều kiện dừng: Nếu $\frac{\lambda q}{1-q} \Delta \le \varepsilon$, dừng lặp. Nghiệm $X^* \approx X^{(n+1)}$.
        
    - Nếu không thỏa mãn, tăng $n$ và lặp tiếp Bước 3.