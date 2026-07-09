## I. Review trị riêng, vector riêng
- Vector $x \neq 0$ là vector riêng của ma trận $A$ ứng với giá trị riêng $\lambda$ nếu thỏa mãn:
- **Cùng giá trị riêng:** Nếu hai ma trận $A$ và $B$ đồng dạng ($B = P^{-1}AP$), chúng sẽ có chung một đa thức đặc trưng và do đó có cùng một bộ giá trị riêng.
## II. Nội dung chính
### 1. Khối Jordan
- **Khối Jordan** : ma trận vuông có các phần tử trên đường chéo chính bằng $\lambda$, các phần tử ngay phía trên đường chéo chính bằng 1, và tất cả các phần tử còn lại bằng 0.
- VD:  $J_3(5)$ cỡ $3 \times 3$, $\lambda = 5$:

$$J_3(5) = \begin{bmatrix} 5 & 1 & 0 \\ 0 & 5 & 1 \\ 0 & 0 & 5 \end{bmatrix}$$
### 2. Khối Frobenius dạng 1
- Là một ma trận vuông, được dựng lên từ chính các hệ số của một đa thức cho trước sao cho đa thức đặc trưng của ma trận đúng bằng đa thức đó.
- Một khối Frobenius dạng 1 cỡ $r \times r$ có dạng:

$$C^{(r)} = \begin{bmatrix} -p_1 & -p_2 & \dots & -p_{r-1} & -p_r \\ 1 & 0 & \dots & 0 & 0 \\ 0 & 1 & \dots & 0 & 0 \\ \vdots & \vdots & \ddots & \vdots & \vdots \\ 0 & 0 & \dots & 1 & 0 \end{bmatrix}$$

- **Đa thức đặc trưng:** Biến đổi định thức $|C^{(r)} - \lambda I_r|$ bằng khai triển theo vết sẽ thu được trực tiếp:
$$(-1)^r [\lambda^r + p_1\lambda^{r-1} + \dots + p_{r-1}\lambda + p_r]$$

- VD: Xét đa thức đặc trưng bậc 3 cần tìm là: $P(\lambda) = (-1)^3 [\lambda^3 - 5\lambda^2 + 2\lambda - 8]$. Ở đây ta có các hệ số: $p_1 = -5$, $p_2 = 2$, $p_3 = -8$.

	- Khối Frobenius dạng 1 tương ứng cỡ $3 \times 3$ sẽ là:

$$C^{(3)} = \begin{bmatrix} 5 & -2 & 8 \\ 1 & 0 & 0 \\ 0 & 1 & 0 \end{bmatrix}$$

	- Hàng 1 là các hệ số đảo dấu: $-p_1 = 5$, $-p_2 = -2$, $-p_3 = 8$.
	- Dưới đường chéo chính có 2 số 1 để đẩy lũy thừa khi tính định thức.
	- Khi tính $\det(C^{(3)} - \lambda I_3)$, kết quả trả về chính xác là $-(\lambda^3 - 5\lambda^2 + 2\lambda - 8) = 0$.
### 3. Phương pháp Danilevsky
#### Phương pháp Danilevsky 
- Dùng để tìm đa thức đặc trưng của một ma trận vuông $A$ cỡ $n \times n$ bất kỳ. Dùng các phép biến đổi đồng dạng ($M A M^{-1}$) để đưa dần ma trận $A$ về ma trận đồng dạng dạng chuẩn Frobenius ($F$). 
#### Note ma trận hoán vị
- Đổi chỗ hai hàng hoặc hai cột của một ma trận có thể thực hiện thông qua phép nhân ma trận với một **ma trận hoán vị**. Ma trận hoán vị được tạo ra bằng cách đổi chỗ các hàng hoặc các cột của ma trận đơn vị $I$.
- Khi thực hiện phép biến đổi đồng dạng $C A C$, quy tắc tác động như sau:
	- Nhân ma trận hoán vị bên **trái** ($C \cdot A$): Làm đổi chỗ các **hàng** của $A$.
	- Nhân ma trận hoán vị bên **phải** ($A \cdot C$): Làm đổi chỗ các **cột** của $A$.
- Ký hiệu $[\begin{matrix} e_1 & \dots & e_{n-1} & \dots \end{matrix}]$ chính là cách viết biểu diễn ma trận bằng các vector cột đơn vị.
-  VD ma trận $4 \times 4$

$$A = \begin{bmatrix} 9 & -5 & 2 & 5 \\ 1 & 2 & -1 & 3 \\ 2 & 1 & 2 & 2 \\ 3 & 1 & 0 & 3 \end{bmatrix}$$

- Xét hàng cuối  ($n=4$). Có phần tử $a_{4,3} = 0$, nhưng phần tử $a_{4,2} = 1 \neq 0$. Theo thuật toán Danilevsky, ta cần đổi chỗ cột 2 ($k=2$) với cột 3 ($n-1 = 3$), sau đó đổi chỗ hàng 2 với hàng 3 để đưa số $1$ về vị trí sát đường chéo chính.
	- Bước 1: Tạo ma trận hoán vị $C_{2 \leftrightarrow 3}$
	- Từ ma trận đơn vị $I_4$, ta đổi chỗ cột 2 và cột 3 (hoặc hàng 2 và hàng 3) để thu được $C_{2 \leftrightarrow 3}$:

$$C_{2 \leftrightarrow 3} = \begin{bmatrix} 1 & 0 & 0 & 0 \\ 0 & 0 & 1 & 0 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 0 & 1 \end{bmatrix}$$
	- Bước 2: Nhân bên trái để đổi chỗ hàng 2 và hàng 3

$$C_{2 \leftrightarrow 3} \cdot A = \begin{bmatrix} 1 & 0 & 0 & 0 \\ 0 & 0 & 1 & 0 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 0 & 1 \end{bmatrix} \begin{bmatrix} 9 & -5 & 2 & 5 \\ 1 & 2 & -1 & 3 \\ 2 & 1 & 2 & 2 \\ 3 & 1 & 0 & 3 \end{bmatrix} = \begin{bmatrix} 9 & -5 & 2 & 5 \\ 2 & 1 & 2 & 2 \\ 1 & 2 & -1 & 3 \\ 3 & 1 & 0 & 3 \end{bmatrix}$$
	- Bước 3: Nhân tiếp vào bên phải để đổi chỗ cột 2 và cột 3

$$A^{(1)} = (C_{2 \leftrightarrow 3} A) \cdot C_{2 \leftrightarrow 3} = \begin{bmatrix} 9 & -5 & 2 & 5 \\ 2 & 1 & 2 & 2 \\ 1 & 2 & -1 & 3 \\ 3 & 1 & 0 & 3 \end{bmatrix} \begin{bmatrix} 1 & 0 & 0 & 0 \\ 0 & 0 & 1 & 0 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 0 & 1 \end{bmatrix} = \begin{bmatrix} 9 & 2 & -5 & 5 \\ 2 & 2 & 1 & 2 \\ 1 & -1 & 2 & 3 \\ 3 & 0 & 1 & 3 \end{bmatrix}$$
#### Thuật toán: 
**1. Mục tiêu thuật toán**
- Sử dụng các ma trận chuyển cơ sở để biến đổi đồng dạng ma trận $A$ về dạng chuẩn Frobenius $F$. Biến đổi cuốn chiếu từ hàng $n$ ngược lên trên để đưa từng hàng về dạng $[\begin{matrix} 0 & \dots & 0 & 1 & 0 \end{matrix}]$ hoặc $[\begin{matrix} 0 & \dots & 0 & a_{nk} \end{matrix}]^t$.
- **Input:** Ma trận $A \in \mathbb{M}_{n \times n}$ và ma trận tích lũy khởi tạo $P = I_n$.
- **Output:** Ma trận $A^{(2)} \sim A$ có hàng $n$ đạt dạng $\begin{pmatrix} 0 & \dots & 0 & 1 & 0 \end{pmatrix}$ (số 1 ở cột $n-1$) và ma trận tích lũy $P$ tương ứng.
**2. Xử lý hàng thứ $n$**
**Trường hợp 1: $a_{n,n-1} = 0$, tồn tại $a_{n,k} \neq 0$ ($k < n-1$)**
- **Thao tác:** Đổi chỗ cột $k$ với cột $n-1$, sau đó đổi chỗ hàng $k$ với hàng $n-1$.
- **Ma trận hoán vị:**
$$C_{k \leftrightarrow n-1} = [\begin{matrix} e_1 & \dots & e_{k-1} & e_{n-1} & e_{k+1} & \dots & e_{n-2} & e_k & e_n \end{matrix}]$$
    $C_{k \leftrightarrow n-1}^{-1} = C_{k \leftrightarrow n-1}$.
- **Biến đổi:** $A^{(1)} := C_{k \leftrightarrow n-1} A^{(1)} C_{k \leftrightarrow n-1}$.
- **Cập nhật:** $P = P C_{k \leftrightarrow n-1}$.
- Chuyển sang Trường hợp 2.
**Trường hợp 2: $a_{n,n-1} \neq 0$**
- **Ma trận biến đổi $M_1$:**$$M_1 = [\begin{matrix} e_1 & \dots & e_{n-2} & a_n & e_n \end{matrix}]^t$$
	(Thay thế **Hàng $n-1$** của ma trận đơn vị bằng chính các hệ số tính toán từ hàng $n$ của ma trận $A$)
- **Ma trận nghịch đảo $M_1^{-1}$:**
$$M_1^{-1} = [\begin{matrix} e_1 - \frac{a_{n1}}{a_{n,n-1}}e_{n-1} & \dots & e_{n-2} - \frac{a_{n,n-2}}{a_{n,n-1}}e_{n-1} & \frac{e_{n-1}}{a_{n,n-1}} & e_n - \frac{a_{nn}}{a_{n,n-1}}e_{n-1} \end{matrix}]$$
- **Biến đổi:** $A^{(2)} = M_1 A^{(1)} M_1^{-1}$.
- **Cập nhật:** $P = P M_1^{-1}$.
- **Giá trị mới của ma trận $A^{(2)}$:**
    - $i \neq n-1, j \neq n-1$: $a_{ij}^{(2)} = a_{ij} - \frac{a_{i,n-1}a_{nj}}{a_{n,n-1}}$.
    - $j = n-1$: $a_{i,n-1}^{(2)} = \frac{a_{i,n-1}}{a_{n,n-1}}$.
    - Hàng $n$: $a_{nj}^{(2)} = 0$ (nếu $j \neq n-1$) và $a_{nj}^{(2)} = 1$ (nếu $j = n-1$).
**Trường hợp 3: $a_{nk} = 0, \forall k \le n-1$**
- **Cấu trúc phân rã:** Hàng $n$ đã đạt dạng Frobenius cấp 1.
$$A_n = \begin{bmatrix} A_{n-1} & \Box \\ \theta & a_{nn} \end{bmatrix}$$
- **Đa thức đặc trưng:**
  $$\det(A_n - \lambda I_n) = (a_{nn} - \lambda) \det(A_{n-1} - \lambda I_{n-1})$$
- **Thao tác:** Lặp lại thuật toán từ đầu đối với khối $A_{n-1}$.
**3. Khử khối $B$ (nếu ma trận bị phân tách)**
Khi thuật toán đang chạy gặp Trường hợp 3, ma trận tạo thành khối:

$$A^{(n)} = \begin{bmatrix} A_{n-m}^{(n)} & B_{(n-m) \times m} \\ 0_{m \times (n-m)} & F_1^{(m)} \end{bmatrix}$$
- **Thao tác:** Dùng ma trận $S_q$ khử lần lượt từng cột $q$ của $B$ từ trái qua phải về $0$:
$$A^{(n)} = S_q A^{(n)} S_q^{-1}$$
$$P = P S_q^{-1}$$
- Nếu cột cuối của $B \neq 0$, hoán vị cột $n$ và cột $n-m$, rồi khởi động lại giải thuật từ hàng $n$.
**4. Kết quả đầu ra**
- **Ma trận chuẩn Frobenius:**
$$F = \text{diag}(F_1, F_2, \dots, F_s)$$
- **Tìm giá trị riêng:** Giải $\prod \det(F_i - \lambda I) = 0$.
- **Tìm vector riêng:** * Vector riêng của khối Frobenius cỡ $m$: $u_{11} = [\begin{matrix} \lambda^{m-1} & \dots & \lambda & 1 \end{matrix}]^T$.
    - Vector riêng của ma trận $A$: Lấy ma trận biến đổi tích lũy $P$ nhân với vector ghép từ các $u_{11}$ và $0$.
#### VD TH 1,2
Ma trận gốc $A$ và ma trận tích lũy $P$ khởi tạo bằng ma trận đơn vị $I_4$:

$$A = \begin{bmatrix} 9 & -5 & 2 & 5 \\ 1 & 2 & -1 & 3 \\ 2 & 1 & 2 & 2 \\ 3 & 1 & 0 & 3 \end{bmatrix}, \quad P = \begin{bmatrix} 1 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 1 & 0 \\ 0 & 0 & 0 & 1 \end{bmatrix}$$

Bước 1: Xử lý hàng 4 - Gặp Trường hợp 1 ($a_{4,3} = 0$, có $a_{4,2} = 1 \neq 0$)

- **Thao tác:** Hoán vị cột 2 $\leftrightarrow$ cột 3 và hàng 2 $\leftrightarrow$ hàng 3 bằng ma trận hoán vị $C_{2 \leftrightarrow 3}$.
    

$$C_{2 \leftrightarrow 3} = \begin{bmatrix} 1 & 0 & 0 & 0 \\ 0 & 0 & 1 & 0 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 0 & 1 \end{bmatrix}$$

- **Biến đổi $A^{(1)} = C_{2 \leftrightarrow 3} A C_{2 \leftrightarrow 3}$:**
$A^{(1)} = \begin{bmatrix} 9 & 2 & -5 & 5 \\ 2 & 2 & 1 & 2 \\ 1 & -1 & 2 & 3 \\ 3 & 0 & 1 & 3 \end{bmatrix}$$
- **Cập nhật $P = P \cdot C_{2 \leftrightarrow 3}$:**
 $$P = \begin{bmatrix} 1 & 0 & 0 & 0 \\ 0 & 0 & 1 & 0 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 0 & 1 \end{bmatrix}$$

Bước 2: Xử lý hàng 4 - Chuyển sang Trường hợp 2 ($a_{4,3} = 1 \neq 0$)

- **Thao tác:** Ép hàng 4 về cấu trúc Frobenius $\begin{bmatrix} 0 & 0 & 1 & 0 \end{bmatrix}$ bằng ma trận khử $M_1$.
    
- Hàng 4 hiện tại: $\begin{bmatrix} 3 & 0 & 1 & 3 \end{bmatrix}$, phần tử chia $a_{4,3} = 1$.
    

$$M_1 = \begin{bmatrix} 1 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 \\ 3 & 0 & 1 & 3 \\ 0 & 0 & 0 & 1 \end{bmatrix} \implies M_1^{-1} = \begin{bmatrix} 1 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 \\ -3 & 0 & 1 & -3 \\ 0 & 0 & 0 & 1 \end{bmatrix}$$

- **Biến đổi $A^{(2)} = M_1 A^{(1)} M_1^{-1}$:**
    
    $$A^{(2)} = \begin{bmatrix} 24 & 2 & -5 & 20 \\ -1 & 2 & 1 & -1 \\ 52 & 5 & -10 & 51 \\ \mathbf{0} & \mathbf{0} & \mathbf{1} & \mathbf{0} \end{bmatrix}$$
    
- **Cập nhật $P = P \cdot M_1^{-1}$:**
    
    $$P = \begin{bmatrix} 1 & 0 & 0 & 0 \\ -3 & 0 & 1 & -3 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 0 & 1 \end{bmatrix}$$
    

---

Bước 3: Cuốn chiếu lên hàng 3 - Xét vị trí $a_{3,2}^{(2)} = 5 \neq 0$ (Trường hợp 2)

- **Thao tác:** Ép hàng 3 về cấu trúc Frobenius $\begin{bmatrix} 0 & 1 & 0 & 0 \end{bmatrix}$ bằng ma trận khử $M_2$.
    
- Hàng 3 hiện tại (chỉ xét phần ma trận con tuyến tính): $\begin{bmatrix} 52 & 5 & -10 \end{bmatrix}$, phần tử chia $a_{3,2}^{(2)} = 5$.
    

$$M_2 = \begin{bmatrix} 1 & 0 & 0 & 0 \\ 52 & 5 & -10 & 51 \\ 0 & 0 & 1 & 0 \\ 0 & 0 & 0 & 1 \end{bmatrix} \implies M_2^{-1} = \begin{bmatrix} 1 & 0 & 0 & 0 \\ -10.4 & 0.2 & 2 & -10.2 \\ 0 & 0 & 1 & 0 \\ 0 & 0 & 0 & 1 \end{bmatrix}$$

- **Biến đổi $A^{(3)} = M_2 A^{(2)} M_2^{-1}$:**
    
    $$A^{(3)} = \begin{bmatrix} 1.2 & 0.4 & -1 & -0.4 \\ -201.6 & 12.8 & 24 & -231.8 \\ \mathbf{0} & \mathbf{1} & \mathbf{0} & \mathbf{0} \\ 0 & 0 & 1 & 0 \end{bmatrix}$$
    
- **Cập nhật $P = P \cdot M_2^{-1}$:**
    
    $$P = \begin{bmatrix} 1 & 0 & 0 & 0 \\ -3 & 0 & 1 & -3 \\ -10.4 & 0.2 & 2 & -10.2 \\ 0 & 0 & 0 & 1 \end{bmatrix}$$
    

---

Bước 4: Cuốn chiếu lên hàng 2 - Xét vị trí $a_{2,1}^{(3)} = -201.6 \neq 0$ (Trường hợp 2)

- **Thao tác:** Ép hàng 2 về cấu trúc Frobenius $\begin{bmatrix} 1 & 0 & 0 & 0 \end{bmatrix}$ bằng ma trận khử $M_3$.
    
- Hàng 2 hiện tại: $\begin{bmatrix} -201.6 & 12.8 & 24 & -231.8 \end{bmatrix}$, phần tử chia $a_{2,1}^{(3)} = -201.6$.

$$M_3 = \begin{bmatrix} -201.6 & 12.8 & 24 & -231.8 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 1 & 0 \\ 0 & 0 & 0 & 1 \end{bmatrix} \implies M_3^{-1} = \begin{bmatrix} -0.005 & 0.063 & 0.119 & -1.150 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 1 & 0 \\ 0 & 0 & 0 & 1 \end{bmatrix}$$

- **Biến đổi $A^{(4)} = M_3 A^{(3)} M_3^{-1}$ (Ma trận chuẩn Frobenius $F$):**
    
    $$F = \begin{bmatrix} \mathbf{14} & \mathbf{-69} & \mathbf{11} & \mathbf{-34} \\ \mathbf{1} & \mathbf{0} & \mathbf{0} & \mathbf{0} \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 1 & 0 \end{bmatrix}$$
- **Cập nhật $P = P \cdot M_3^{-1}$ (Ma trận chuyển cơ sở cuối cùng):**
    
    $$P = \begin{bmatrix} -0.005 & 0.063 & 0.119 & -1.150 \\ 0.015 & -0.190 & -0.257 & 0.449 \\ 0.052 & -0.459 & -1.238 & 1.758 \\ 0 & 0 & 0 & 1 \end{bmatrix}$$
Kết quả đầu ra từ ví dụ

1. **Đa thức đặc trưng:** Đọc trực tiếp từ hàng 1 của ma trận chuẩn $F$ (đổi dấu hệ số):
$$p_1 = -14, \quad p_2 = 69, \quad p_3 = -11, \quad p_4 = 34$$
$$\det(A - \lambda I) = (-1)^4 [\lambda^4 - 14\lambda^3 + 69\lambda^2 - 11\lambda + 34] = 0$$
2. **Véctơ riêng:** Nếu tìm được trị riêng $\lambda_i$, lập véctơ riêng dạng chuẩn $u = \begin{bmatrix} \lambda_i^3 & \lambda_i^2 & \lambda_i & 1 \end{bmatrix}^T$, sau đó nhân trái với ma trận tích lũy $P$ thu được ở Bước 4 để ra vector riêng gốc.
#### VD TH3
Xét ma trận $A$ cấp $4 \times 4$:

$$A = \begin{bmatrix} 1 & 2 & 3 & 4 \\ 5 & 6 & 7 & 8 \\ 9 & 10 & 11 & 12 \\ \mathbf{0} & \mathbf{0} & \mathbf{0} & \mathbf{5} \end{bmatrix}$$

Bước 1: Kiểm tra hàng 4
- Ta thấy: $a_{4,3} = 0, a_{4,2} = 0, a_{4,1} = 0$.
- Toàn bộ các phần tử bên trái đường chéo chính đều bằng 0.
Bước 2: 
Theo đúng thuật toán, ta không cần nhân ma trận khử $M$ cho hàng này nữa. Ma trận tự động phân rã thành dạng cấu trúc khối tam giác ô:

$$A = \left[ \begin{array}{ccc|c} 1 & 2 & 3 & 4 \\ 5 & 6 & 7 & 8 \\ 9 & 10 & 11 & 12 \\ \hline 0 & 0 & 0 & 5 \end{array} \right] = \begin{bmatrix} A_{3} & \Box \\ \theta & a_{44} \end{bmatrix}$$

- Ta bóc tách được ngay một trị riêng độc lập: $\lambda_1 = a_{4,4} = 5$.
- Đa thức đặc trưng giảm bậc: $\det(A - \lambda I) = (5 - \lambda) \cdot \det(A_3 - \lambda I_3)$.
Bước 3: Tiếp tục giải thuật

Cô lập hàng 4 lại. Hạ cấp bài toán và lặp lại toàn bộ quy trình thuật toán Danilevsky từ đầu cho ma trận con $A_3$ cấp $3 \times 3$ ở góc trên:

$$A_3 = \begin{bmatrix} 1 & 2 & 3 \\ 5 & 6 & 7 \\ 9 & 10 & 11 \end{bmatrix}$$

Lúc này, ta lại bắt đầu xét từ hàng cuối cùng của ma trận mới này (tức là hàng 3 của $A_3$). Vị trí sát đường chéo lúc này là $a_{3,2} = 10 \neq 0$, hệ thống lại quay về xử lý theo cấu trúc của **Trường hợp 2**.