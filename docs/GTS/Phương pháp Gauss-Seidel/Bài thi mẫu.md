![[Pasted image 20260709223046.png]]
Dưới đây là lời giải chi tiết cho bài toán hệ phương trình lặp theo phương pháp Seidel dựa trên hình ảnh bạn đã cung cấp:

### **Câu 1. a) Thuật toán cho phương pháp lặp Seidel**

**1. Công thức tổng quát:**

Hệ phương trình có dạng $x = Bx + d$. Để tìm nghiệm gần đúng, ta áp dụng phương pháp lặp Seidel. Đặc trưng của phương pháp Seidel là sử dụng ngay các giá trị $x_i$ vừa tính được ở bước lặp hiện tại để tính các $x$ tiếp theo.

Công thức lặp từng phần tử ở bước thứ $m+1$ là:

$$x_i^{(m+1)} = \sum_{j=1}^{i-1} B_{ij} x_j^{(m+1)} + \sum_{j=i}^{n} B_{ij} x_j^{(m)} + d_i \quad \text{với } i = 1, 2, ..., n$$

**2. Trình tự thuật toán:**

- **Bước 1 (Khởi tạo):** Khai báo ma trận $B$ kích thước $n \times n$, véc-tơ $d$ kích thước $n \times 1$. Khởi tạo véc-tơ nghiệm $x = x_0$.
    
- **Bước 2 (Vòng lặp ngoài):** Cho một biến đếm bước lặp $m$ chạy từ $1$ đến $k$.
    
- **Bước 3 (Vòng lặp trong):** Với mỗi bước lặp $m$, cho chỉ số $i$ chạy từ $1$ đến $n$.
    
    - Tính tổng: $S = \sum_{j=1}^{n} B_{ij} \cdot x_j$
        
    - Cập nhật ngay giá trị mới: $x_i = S + d_i$
        
        _(Lưu ý: Vì mảng $x$ được ghi đè trực tiếp, các $x_j$ với $j < i$ đã mang giá trị mới của bước $m$, còn các $x_j$ với $j \ge i$ mang giá trị cũ của bước $m-1$, đúng với định nghĩa phương pháp Seidel)._
        
- **Bước 4 (Kết thúc):** Sau khi hoàn thành $k$ vòng lặp, kết xuất kết quả véc-tơ $x$ là nghiệm gần đúng cần tìm.
    

### **Câu 1. b) Áp dụng thuật toán**

**1. Công thức lặp cụ thể cho bài toán:**

Áp dụng phương pháp Seidel cho ma trận cấp 5 đã cho với véc-tơ khởi tạo $x^{(0)} = [0, 0, 0, 0, 0]^T$. Ở mỗi vòng lặp $m$, thứ tự cập nhật các biến như sau:

- $x_1^{(m)} = 0.04x_1^{(m-1)} + 0.07x_2^{(m-1)} - 0.01x_3^{(m-1)} - 0.05x_5^{(m-1)} - 7$
    
- $x_2^{(m)} = -0.1x_1^{(m)} + 0.04x_2^{(m-1)} - 0.02x_3^{(m-1)} - 0.01x_4^{(m-1)} + 0.04x_5^{(m-1)} + 6$
    
- $x_3^{(m)} = -0.05x_1^{(m)} - 0.04x_2^{(m)} + 0.06x_3^{(m-1)} + 0.03x_4^{(m-1)} + 0.03x_5^{(m-1)} - 4$
    
- $x_4^{(m)} = -0.1x_1^{(m)} + 0.09x_2^{(m)} + 0.06x_3^{(m)} + 0.04x_4^{(m-1)} - 0.07x_5^{(m-1)} + 1$
    
- $x_5^{(m)} = -0.08x_1^{(m)} - 0.1x_2^{(m)} - 0.07x_3^{(m)} + 0.05x_4^{(m)} - 0.08x_5^{(m-1)} - 7$
    

**2. Các giá trị nghiệm gần đúng sau mỗi bước lặp (lấy tròn 5 chữ số thập phân):**

**Vòng lặp 1 ($m = 1$):** Sử dụng các giá trị của $x^{(0)} = [0, 0, 0, 0, 0]^T$

- $x_1^{(1)} = -7$
    
- $x_2^{(1)} = -0.1(-7) + 6 = 6.7$
    
- $x_3^{(1)} = -0.05(-7) - 0.04(6.7) - 4 = -3.918$
    
- $x_4^{(1)} = -0.1(-7) + 0.09(6.7) + 0.06(-3.918) + 1 = 2.06792$
    
- $x_5^{(1)} = -0.08(-7) - 0.1(6.7) - 0.07(-3.918) + 0.05(2.06792) - 7 = -6.73234$
    

$$x^{(1)} = \begin{bmatrix} -7.00000 \\ 6.70000 \\ -3.91800 \\ 2.06792 \\ -6.73234 \end{bmatrix}$$

**Vòng lặp 2 ($m = 2$):**

$$x^{(2)} = \begin{bmatrix} -6.43521 \\ 6.69991 \\ -4.32125 \\ 2.54122 \\ -6.18705 \end{bmatrix}$$

**Vòng lặp 3 ($m = 3$):**

$$x^{(3)} = \begin{bmatrix} -6.43585 \\ 6.72512 \\ -4.31585 \\ 2.52463 \\ -6.23434 \end{bmatrix}$$

**Vòng lặp 4 ($m = 4$):**

$$x^{(4)} = \begin{bmatrix} -6.43181 \\ 6.72388 \\ -4.31761 \\ 2.52666 \\ -6.23053 \end{bmatrix}$$

**Vòng lặp 5 ($m = 5$):**

$$x^{(5)} = \begin{bmatrix} -6.43190 \\ 6.72401 \\ -4.31753 \\ 2.52650 \\ -6.23086 \end{bmatrix}$$

Kết quả nghiệm gần đúng sau $k = 5$ lần lặp là véc-tơ $x^{(5)}$.

Question: Thuật toán bạn áp dụng có vẻ khác với file md [[GTS/Phương pháp Gauss-Seidel/Thuật toán]] này ?
- **Dạng phương trình đầu vào:**
    
    - Thuật toán đã áp dụng giải hệ phương trình được biến đổi sẵn về dạng lặp $x = Bx + d$.
        
    - Thuật toán trong file `.md` giải hệ tuyến tính ban đầu $Ax = B$. Công thức lặp có thêm thao tác chia cho phần tử trên đường chéo chính $\frac{1}{a_{ii}}$. Về bản chất toán học, $\frac{-a_{ij}}{a_{ii}}$ chính là $B_{ij}$, và $\frac{b_i}{a_{ii}}$ chính là $d_i$.
        
- **Điều kiện dừng (Tiêu chuẩn hội tụ):**
    
    - Thuật toán đã áp dụng dừng vòng lặp dựa trên số lần lặp $k$ cố định.
        
    - Thuật toán trong file `.md` dừng vòng lặp dựa trên đánh giá sai số $\varepsilon$. Phương pháp này bắt buộc phải tính hệ số co $q$, $s$ và so sánh sai số $\delta$ giữa hai bước lặp với sai số chuẩn hóa $\varepsilon'$.

Question: Nếu áp dụng cách như trong file md thì input sẽ biến đổi như thế nào để phù hợp ?
Từ hệ phương trình gốc dạng $x = Bx + d$, cần biến đổi về dạng $Ax = B_{md}$ ($B_{md}$ là ký hiệu véc-tơ B trong file `.md` để tránh nhầm lẫn với ma trận $B$).

- Phương trình biến đổi:

	$x = Bx + d \Leftrightarrow x - Bx = d \Leftrightarrow (I - B)x = d$ (với $I$ là ma trận đơn vị).

- **Ma trận $A$:** Bằng $I - B$.
    
    - Phần tử trên đường chéo chính: $a_{ii} = 1 - b_{ii}$
        
    - Phần tử ngoài đường chéo chính: $a_{ij} = -b_{ij}$
        
- **Véc-tơ $B$:** Gán bằng véc-tơ $d$.
