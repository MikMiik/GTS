### Phương pháp lặp Gauss-Seidel

**Đầu vào:** Ma trận vuông $A \in \mathbb{R}^{n \times n}$, véc-tơ $B \in \mathbb{R}^n$, véc-tơ khởi tạo $X^{(0)}$, sai số $\varepsilon$, số lặp tối đa $N$.

**Đầu ra:** Véc-tơ nghiệm xấp xỉ $X^*$ hoặc thông báo không hội tụ.

**Bước 1: Xác định hệ số co $q$ và $s$**

- **Trường hợp $A$ chéo trội hàng:** Gán $s = 0$ và tính:
    
    $$q = \max_{1 \le i \le n} \frac{\sum_{j > i} |a_{ij}|}{|a_{ii}| - \sum_{j < i} |a_{ij}|}$$
    
- **Trường hợp $A$ chéo trội cột:** Tính $s$ và $q$:
    
    $$s = \max_{1 \le j \le n} \frac{\sum_{i > j} |a_{ij}|}{|a_{jj}|} \quad \text{và} \quad q = \max_{1 \le j \le n} \frac{\sum_{i < j} |a_{ij}|}{|a_{jj}| - \sum_{i > j} |a_{ij}|}$$
    

**Bước 2: Chuẩn hóa sai số**

- Tính ngưỡng sai số chuẩn hóa: $\varepsilon' = \frac{\varepsilon(1-s)(1-q)}{q}$.
    

**Bước 3: Lặp tính nghiệm**

- Khởi tạo bước lặp $k = 1$.
    
- **Lặp khi $k \le N$:**
    
    1. Với mỗi $i = \overline{1,n}$, tính tức thì (sử dụng ngay $x_j^{(k)}$ vừa tính):
        
        $$x_i^{(k)} = \frac{1}{a_{ii}} \left( b_i - \sum_{j=1}^{i-1} a_{ij} x_j^{(k)} - \sum_{j=i+1}^{n} a_{ij} x_j^{(k-1)} \right)$$
        
    2. Tính sai số: $\delta = \max_{1 \le i \le n} |x_i^{(k)} - x_i^{(k-1)}|$.
        
    3. Kiểm tra điều kiện dừng:
        
        - Nếu $\delta \le \varepsilon'$: Dừng lặp. Thu được nghiệm $X^* = X^{(k)}$.
            
        - Nếu $\delta > \varepsilon'$: Tăng $k \leftarrow k + 1$ và quay lại đầu Bước 3.
            
- Nếu $k > N$: Dừng chương trình, xuất cảnh báo "Không đạt hội tụ sau $N$ bước lặp".