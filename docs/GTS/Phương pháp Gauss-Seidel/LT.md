### Tóm tắt phương pháp
#### Bản chất của phương pháp Gauss-Seidel
- Bản chất của Gauss-Seidel: **Sử dụng ngay lập tức các giá trị nghiệm vừa mới tính được** ở bước hiện tại để tính các nghiệm tiếp theo, thay vì phải đợi đến hết vòng lặp như phương pháp Jacobi.
- Từ hệ $Ax = b$, ta tách ma trận $A$ thành 3 phần:

	- $D_A$: Ma trận đường chéo (Diagonal).
	    
	- $L_A$: Ma trận tam giác dưới (Lower), đổi dấu.
	    
	- $U_A$: Ma trận tam giác trên (Upper), đổi dấu.
	    

- Công thức lặp tổng quát:

$$x^{(n+1)} = (D_A - L_A)^{-1} U_A x^{(n)} + (D_A - L_A)^{-1} b$$

- Ma trận lặp của phương pháp này là $M = (D_A - L_A)^{-1} U_A$.
#### Điều kiện hội tụ 
- **Điều kiện cần và đủ:** Dãy lặp hội tụ khi và chỉ khi bán kính phổ của ma trận lặp nhỏ hơn 1: $\rho(M) = \max_i |\lambda_i| < 1$, hoặc tương đương với việc $\lim_{n \to \infty} \|M\|^n = 0$.
- **Điều kiện đủ (Thực hành):** Nếu ma trận $A$ là **chéo trội hàng** (hoặc **chéo trội cột**), thì phương pháp Gauss-Seidel chắc chắn hội tụ. Hơn nữa, nó thường hội tụ nhanh hơn phương pháp Jacobi.
#### Đánh giá sai số (Tiên nghiệm và Hậu nghiệm)

**Trường hợp 1: Ma trận $A$ chéo trội hàng ngặt**

Ta có $s = 0$ và hệ số co $q$ được tính bằng:

$$q = \max_{1 \le i \le m} \frac{\sum_{j>i} |a_{ij}|}{|a_{ii}| - \sum_{j<i} |a_{ij}|}$$

**Trường hợp 2: Ma trận $A$ chéo trội cột ngặt**

$$s = \max_{1 \le j \le m} \frac{1}{|a_{jj}|} \sum_{i>j} |a_{ij}|$$

$$q = \max_{1 \le j \le m} \frac{\sum_{i<j} |a_{ij}|}{|a_{jj}| - \sum_{i>j} |a_{ij}|}$$

**Công thức sai số chung:**

- **Sai số tiên nghiệm** (Đánh giá trước khi lặp đến bước $k$):
    $$\|x^{(k)} - x^*\| \le \frac{q^k}{(1-s)(1-q)} \|x^{(1)} - x^{(0)}\|$$
    
- **Sai số hậu nghiệm** (Đánh giá sau khi vừa tính xong bước $k$):
    $$\|x^{(k)} - x^*\| \le \frac{q}{(1-s)(1-q)} \|x^{(k)} - x^{(k-1)}\|$$
Đây là một sự tinh chỉnh rất thông minh! Về mặt kỹ thuật lập trình, việc bạn đưa phép chia hệ số ra ngoài vòng lặp (pre-computation) để tạo ra $\varepsilon'$ (Epsilon phẩy) không chỉ giúp đối chiếu bảng số dễ dàng hơn bằng mắt thường, mà còn giúp máy tính tiết kiệm được phép tính nhân/chia dư thừa trong mỗi vòng lặp.

Dưới đây là phiên bản thuật toán giữ y nguyên cấu trúc chuẩn, chỉ bổ sung bước chuẩn hóa $\varepsilon'$ theo yêu cầu của bạn:

---
### Thuật toán Gauss–Seidel 

**INPUT:** $n$, ma trận $A = (a_{ij})_{n \times n}$, vector $B$, xấp xỉ đầu $X^{(0)}$, sai số $\varepsilon > 0$, số lặp tối đa $N$.

**OUTPUT:** Nghiệm xấp xỉ $X = (x_1, x_2, \dots, x_n)^T$ hoặc thông báo không hội tụ.

**Bước 1. Kiểm tra, xác định hệ số co và chuẩn hóa sai số**

- Nếu $A$ chéo trội hàng ngặt: đặt $s=0$ và tính
    
    $$q = \max_{1 \le i \le n} \frac{\displaystyle\sum_{j > i} |a_{ij}|}{|a_{ii}| - \displaystyle\sum_{j < i} |a_{ij}|}$$
    
- Nếu $A$ chéo trội cột ngặt: tính
    
    $$s = \max_{1 \le j \le n} \frac{1}{|a_{jj}|} \sum_{i > j} |a_{ij}|, \qquad q = \max_{1 \le j \le n} \frac{\displaystyle\sum_{i < j} |a_{ij}|}{|a_{jj}| - \displaystyle\sum_{i > j} |a_{ij}|}$$
    

Lý thuyết đảm bảo $q < 1$ khi chéo trội ngặt.

**Bước 2. Khởi tạo vòng lặp**

Đặt $k=1$.

**Bước 3. Tính vector nghiệm mới (khi $k \le N$)**

Với mỗi $i = 1, 2, \dots, n$, tính tức thì (dùng ngay giá trị mới vừa tính được):

$$x_i^{(k)} = \frac{1}{a_{ii}} \left( b_i - \sum_{j=1}^{i-1} a_{ij}\, x_j^{(k)} - \sum_{j=i+1}^{n} a_{ij}\, x_j^{(k-1)} \right)$$

**Bước 4. Kiểm tra điều kiện dừng**

Tính chuẩn sai số giữa hai bước liên tiếp (khoảng cách cực đại):

$$\delta = \|X^{(k)} - X^{(k-1)}\|_\infty = \max_{1 \le i \le n} |x_i^{(k)} - x_i^{(k-1)}|$$

Kiểm tra:
$$\frac{q}{(1-s)(1-q)} \cdot \delta \le \varepsilon$$

$$\varepsilon' = \frac{\varepsilon}{C} = \frac{\varepsilon(1-s)(1-q)}{q}$$

$$\delta \le \varepsilon'$$

- **ĐÚNG** $\rightarrow$ xuất $X^{(k)}$, dừng vòng lặp.
    
- **SAI và $k < N$** $\rightarrow$ đặt $k \leftarrow k + 1$, quay lại Bước 3.
    
- **SAI và $k = N$** $\rightarrow$ xuất cảnh báo _"Không đạt hội tụ sau $N$ bước lặp"_, dừng chương trình.