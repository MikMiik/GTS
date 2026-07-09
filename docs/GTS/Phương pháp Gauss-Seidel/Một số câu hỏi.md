#### Nguyên nhân cốt lõi dẫn đến việc phân tách ma trận làm 3 phần

- Nguyên nhân kỹ thuật bắt buộc phải phân rã $A$ thành $D_A$, $-L_A$, $-U_A$ là do **tính bất đồng bộ về thời gian của dữ liệu trong thuật toán Gauss-Seidel**.

- Khi tính toán ẩn $x_i^{(n+1)}$, bộ nhớ máy tính đang chứa đồng thời hai thế hệ dữ liệu:
	- Dữ liệu mới (thế hệ $n+1$) của các ẩn từ $1$ đến $i-1$.
	- Dữ liệu cũ (thế hệ $n$) của các ẩn từ $i+1$ đến $m$.

- Vì một ma trận hệ số $A$ ban đầu chỉ là một khối số liệu tĩnh, nó không thể tự phân biệt được đâu là hệ số đi với "ẩn mới" và đâu là hệ số đi với "ẩn cũ". Do đó, ta bắt buộc phải dùng công cụ đại số để chia cắt ma trận $A$ thành 3 phần nhằm cô lập và gom tất cả các số hạng chứa ẩn mới ($n+1$) sang vế trái để tính toán, đồng thời đẩy tất cả các số hạng chứa ẩn cũ ($n$) sang vế phải.
- **Vế trái là nơi tập trung các thành phần thuộc thế hệ mới $(n+1)$:** Cả ẩn đang tìm $x_i^{(n+1)}$ và các ẩn đã tính xong trước đó $x_1^{(n+1)}, \dots, x_{i-1}^{(n+1)}$ đều mang cùng chỉ số thời gian là $(n+1)$. Việc gom cụm $(D_A - L_A)x^{(n+1)}$ ở vế trái giúp ta duy trì một hệ thức đại số đồng nhất theo biến số của thế hệ mới.
- **Vế phải là nơi chứa các thành phần thuộc thế hệ cũ $(n)$:** Do hệ số của $U_A$ nhân với các ẩn cũ $x^{(n)}$ mang chỉ số thời gian khác, chúng phải được tách riêng ra vế phải cùng với vector hằng số $b$ để làm điểm tựa dữ liệu (nền tảng số) cho vế trái tính toán.
VD:

Xét một hệ phương trình 3 ẩn cụ thể:

$$\begin{cases} 10x_1 + 5x_2 + 7x_3 = 11 \\ 2x_1 + 15x_2 + 3x_3 = 12 \\ -3x_1 + 1x_2 + 30x_3 = 19 \end{cases}$$

Giả sử ta đang ở vòng lặp thứ $n+1$ và đang thực hiện tính toán tại **phương trình thứ 2** để tìm giá trị cho $x_2^{(n+1)}$:

- **Ẩn đang tìm ($D_A$):** Là $x_2$. Hệ số $a_{22} = 15$ nằm trên ma trận đường chéo $D_A$. Ta giữ lại $15x_2^{(n+1)}$ ở vế trái để cô lập nó.
- **Ẩn mới ($L_A$):** Là $x_1$. Vì đây là phương trình thứ 2, ẩn $x_1$ ở hàng trên đã được tính xong trước đó và đã có giá trị mới là $x_1^{(n+1)}$. Hệ số của nó ($a_{21} = 2$) thuộc ma trận tam giác dưới $L_A$. Ta giữ hạng tử này ở vế trái cùng với ẩn đang tìm để tận dụng giá trị mới.
- **Ẩn cũ ($U_A$):** Là $x_3$. Ẩn này nằm ở hàng dưới, chưa được tính toán ở vòng này nên cấu trúc máy tính chỉ có giá trị cũ là $x_3^{(n)}$. Hệ số của nó ($a_{23} = 3$) thuộc ma trận tam giác trên $U_A$. Hạng tử này buộc phải chuyển vế sang vế phải cùng với hằng số $b_2 = 12$.

Trực quan hóa phương trình thứ 2 khi áp dụng thuật toán lặp:

$$\underbrace{2x_1^{(n+1)}}_{\text{Ẩn mới } (L_A)} + \underbrace{15x_2^{(n+1)}}_{\text{Ẩn đang tìm } (D_A)} = \underbrace{-3x_3^{(n)}}_{\text{Ẩn cũ } (U_A)} + \underbrace{12}_{b}$$

#### Ví dụ tính q
Để làm rõ cách tính toán hệ số co $q$ và hằng số $s$, chúng ta sẽ thực hành trực tiếp trên hai ma trận cụ thể tương ứng với hai trường hợp chéo trội hàng và chéo trội cột.

---

### Ví dụ 1: Trường hợp ma trận $A$ chéo trội hàng ngặt

Xét ma trận hệ số:

$$A = \begin{pmatrix} 10 & 2 & 3 \\ 1 & 5 & 2 \\ -1 & 2 & 8 \end{pmatrix}$$

**Bước 1: Kiểm tra điều kiện chéo trội hàng ngặt**

- Hàng 1: $|10| > |2| + |3| = 5$ (Thỏa mãn)
    
- Hàng 2: $|5| > |1| + |2| = 3$ (Thỏa mãn)
    
- Hàng 3: $|8| > |-1| + |2| = 3$ (Thỏa mãn) Ma trận $A$ chéo trội hàng ngặt. Do đó, hằng số **$s = 0$**.
    

**Bước 2: Tính hệ số co $q$ theo từng hàng ($i = 1, 2, 3$)** Công thức áp dụng:

$$q_i = \frac{\sum_{j>i} |a_{ij}|}{|a_{ii}| - \sum_{j<i} |a_{ij}|}$$

- **Với hàng 1 ($i=1$):** Phía trước không có phần tử nào ($j<1$), phía sau có $a_{12}, a_{13}$ ($j>1$).
    
    $$q_1 = \frac{|2| + |3|}{|10| - 0} = \frac{5}{10} = 0.5$$
    
- **Với hàng 2 ($i=2$):** Phía trước có $a_{21}$ ($j<2$), phía sau có $a_{23}$ ($j>2$).
    
    $$q_2 = \frac{|2|}{|5| - |1|} = \frac{2}{4} = 0.5$$
    
- **Với hàng 3 ($i=3$):** Phía trước có $a_{31}, a_{32}$ ($j<3$), phía sau không có phần tử nào ($j>3$).
    
    $$q_3 = \frac{0}{|8| - (|-1| + |2|)} = \frac{0}{8 - 3} = 0$$
    

**Bước 3: Xác định giá trị $q$ cuối cùng**

$$q = \max(q_1, q_2, q_3) = \max(0.5, 0.5, 0) = 0.5$$

Hệ số co thu được là **$q = 0.5 < 1$**, đảm bảo tốc độ hội tụ rất ổn định.

---

### Ví dụ 2: Trường hợp ma trận $A$ chéo trội cột ngặt

Xét ma trận hệ số:

$$A = \begin{pmatrix} 8 & 1 & -1 \\ 2 & 10 & 1 \\ 3 & 2 & 6 \end{pmatrix}$$

**Bước 1: Kiểm tra điều kiện chéo trội cột ngặt**

- Cột 1: $|8| > |2| + |3| = 5$ (Thỏa mãn)
    
- Cột 2: $|10| > |1| + |2| = 3$ (Thỏa mãn)
    
- Cột 3: $|6| > |-1| + |1| = 2$ (Thỏa mãn) Ma trận $A$ chéo trội cột ngặt.
    

**Bước 2: Tính hằng số $s$** Công thức áp dụng:

$$s_j = \frac{1}{|a_{jj}|} \sum_{i>j} |a_{ij}| \implies s = \max(s_1, s_2, s_3)$$

- **Cột 1 ($j=1$):** Các phần tử phía dưới đường chéo là $a_{21}, a_{31}$ ($i>1$).
    
    $$s_1 = \frac{1}{|8|} (|2| + |3|) = \frac{5}{8} = 0.625$$
    
- **Cột 2 ($j=2$):** Phần tử phía dưới đường chéo là $a_{32}$ ($i>2$).
    
    $$s_2 = \frac{1}{|10|} (|2|) = \frac{2}{10} = 0.2$$
    
- **Cột 3 ($j=3$):** Không có phần tử nào phía dưới đường chéo ($i>3$).
    
    $$s_3 = 0$$
    
    $$\implies s = \max(0.625, 0.2, 0) = 0.625$$
    

**Bước 3: Tính hệ số co $q$** Công thức áp dụng:

$$q_j = \frac{\sum_{i<j} |a_{ij}|}{|a_{jj}| - \sum_{i>j} |a_{ij}|} \implies q = \max(q_1, q_2, q_3)$$

- **Cột 1 ($j=1$):** Không có phần tử phía trên đường chéo ($i<1$).
    
    $$q_1 = \frac{0}{|8| - (|2| + |3|)} = \frac{0}{8 - 5} = 0$$
    
- **Cột 2 ($j=2$):** Phần tử phía trên là $a_{12}$ ($i<2$). Phần tử phía dưới là $a_{32}$ ($i>2$).
    
    $$q_2 = \frac{|1|}{|10| - |2|} = \frac{1}{8} = 0.125$$
    
- **Cột 3 ($j=3$):** Các phần tử phía trên là $a_{13}, a_{23}$ ($i<3$). Không có phần tử phía dưới ($i>3$).
    
    $$q_3 = \frac{|-1| + |1|}{|6| - 0} = \frac{2}{6} \approx 0.333$$
    
    $$\implies q = \max(0, 0.125, 0.333) = 0.333$$
    

**Kết quả thu được:** **$s = 0.625$** và **$q = 0.333$**. Tất cả các tham số đã sẵn sàng để nạp vào công thức đánh giá sai số tiên nghiệm hoặc hậu nghiệm.

#### Trong vở ghi chép 1 quy trình làm khác với công thức trong LT, thực tế là một, chỉ là tách chi tiết từng bước thay vì áp dụng công thức.
### 1. Phân tích ma trận hệ số 

Hệ phương trình:

$$\begin{cases} 10x_1 + 5x_2 + 7x_3 = 11 \\ 2x_1 + 15x_2 + 3x_3 = 12 \\ -3x_1 + 1x_2 + 30x_3 = 19 \end{cases}$$

---

### 2. Cách thiết lập ma trận $C$, $L$, $U$ 

#### Bước 1: Thành lập ma trận lặp trực tiếp $C$ và vector $D$

Bằng cách chia mỗi hàng cho phần tử nằm trên đường chéo chính và chuyển các số hạng còn lại sang vế phải, ta được ma trận $C$ (có đường chéo chính bằng 0) và vector cột $D$:

$$C = \begin{pmatrix} 0 & -\frac{5}{10} & -\frac{7}{10} \\ -\frac{2}{15} & 0 & -\frac{3}{15} \\ \frac{3}{30} & -\frac{1}{30} & 0 \end{pmatrix}, \quad D = \begin{pmatrix} \frac{11}{10} \\ \frac{12}{15} \\ \frac{19}{30} \end{pmatrix}$$

#### Bước 2: Tách ma trận $C$ thành $L$ và $U$ 

Chia ma trận $C$ thành hai phần riêng biệt:

- **$L$ (Ma trận tam giác dưới):** Giữ lại các phần tử nằm phía dưới đường chéo chính của $C$, các vị trí khác bằng 0.
- **$U$ (Ma trận tam giác trên):** Giữ lại các phần tử nằm phía trên đường chéo chính của $C$, các vị trí khác bằng 0.


$$L = \begin{pmatrix} 0 & 0 & 0 \\ -\frac{2}{15} & 0 & 0 \\ \frac{3}{30} & -\frac{1}{30} & 0 \end{pmatrix}, \quad U = \begin{pmatrix} 0 & -\frac{5}{10} & -\frac{7}{10} \\ 0 & 0 & -\frac{3}{15} \\ 0 & 0 & 0 \end{pmatrix}$$

---

### 3. Công thức lặp ma trận tổng quát 

Khi đã tách thành $L$ và $U$ từ ma trận $C$, phương trình trạng thái lặp Gauss-Seidel được viết chính xác như trong vở:

$$x^{(n+1)} = L x^{(n+1)} + U x^{(n)} + D$$

Biến đổi đại số để cô lập thế hệ nghiệm mới $x^{(n+1)}$:

$$x^{(n+1)} - L x^{(n+1)} = U x^{(n)} + D$$

$$(I - L)x^{(n+1)} = U x^{(n)} + D$$

$$\Rightarrow x^{(n+1)} = (I - L)^{-1}U x^{(n)} + (I - L)^{-1}D$$

Đồng nhất với công thức lặp tổng quát, ta được ma trận lặp Gauss-Seidel tính theo ký hiệu này là:

$$M = (I - L)^{-1}U$$

#### Cũng với ví dụ đó, ra 1 đề bài và trình bày lời giải cụ thể.

Cho hệ phương trình tuyến tính:

$$\begin{cases} 10x_1 + 5x_2 + 7x_3 = 11 \\ 2x_1 + 15x_2 + 3x_3 = 12 \\ -3x_1 + 1x_2 + 30x_3 = 19 \end{cases}$$

1. Chứng minh hệ phương trình trên hội tụ theo phương pháp Gauss-Seidel dựa vào điều kiện chéo trội. Tính hệ số co $q$.
    
2. Tìm ma trận lặp $M$.
    
3. Với vector xấp xỉ đầu $x^{(0)} = (0, 0, 0)^T$, tính các bước lặp $x^{(1)}, x^{(2)}$ bằng cách lập bảng số.
    
4. Đánh giá sai số hậu nghiệm của nghiệm xấp xỉ $x^{(2)}$.

#### Ý 1: Chứng minh hội tụ và tính hệ số co $q$

Xét ma trận hệ số $A = \begin{pmatrix} 10 & 5 & 7 \\ 2 & 15 & 3 \\ -3 & 1 & 30 \end{pmatrix}$. Kiểm tra điều kiện chéo trội hàng ngặt:

- Hàng 1: $|10| > |5| + |7| = 12 \rightarrow$ **Không thỏa mãn.**
    

Chuyển sang kiểm tra điều kiện chéo trội cột ngặt:

- Cột 1: $|10| > |2| + |-3| = 5$ (Thỏa mãn)
    
- Cột 2: $|15| > |5| + |1| = 6$ (Thỏa mãn)
    
- Cột 3: $|30| > |7| + |3| = 10$ (Thỏa mãn) Vậy ma trận $A$ chéo trội cột ngặt, phương pháp Gauss-Seidel chắc chắn hội tụ.
    

Tính các tham số sai số theo cột ($j=1,2,3$):

- **Hằng số $s$**:
    
    $$s_1 = \frac{|2|+|-3|}{|10|} = 0.5; \quad s_2 = \frac{|1|}{|15|} \approx 0.067; \quad s_3 = 0$$
    
    $$\implies s = \max(s_1, s_2, s_3) = 0.5$$
    
- **Hệ số co $q$**:
    
    $$q_1 = 0$$
    
    $$q_2 = \frac{|5|}{|15| - |1|} = \frac{5}{14} \approx 0.357$$
    
    $$q_3 = \frac{|7|+|3|}{|30| - 0} = \frac{10}{30} \approx 0.333$$
    
    $$\implies q = \max(q_1, q_2, q_3) = \frac{5}{14} \approx 0.357$$
    

---

#### Ý 2: Tìm ma trận lặp $M$

Biến đổi hệ phương trình về dạng điểm bất động $x = Cx + D$:

$$C = \begin{pmatrix} 0 & -\frac{5}{10} & -\frac{7}{10} \\ -\frac{2}{15} & 0 & -\frac{3}{15} \\ \frac{3}{30} & -\frac{1}{30} & 0 \end{pmatrix}, \quad D = \begin{pmatrix} \frac{11}{10} \\ \frac{12}{15} \\ \frac{19}{30} \end{pmatrix} = \begin{pmatrix} 1.1 \\ 0.8 \\ 0.6333 \end{pmatrix}$$

Tách ma trận $C = L + U$:

$$L = \begin{pmatrix} 0 & 0 & 0 \\ -\frac{2}{15} & 0 & 0 \\ \frac{3}{30} & -\frac{1}{30} & 0 \end{pmatrix}, \quad U = \begin{pmatrix} 0 & -\frac{5}{10} & -\frac{7}{10} \\ 0 & 0 & -\frac{3}{15} \\ 0 & 0 & 0 \end{pmatrix}$$

Phương trình lặp tổng quát: $(I - L)x^{(n+1)} = Ux^{(n)} + D$. Ma trận lặp Gauss-Seidel:

$$M = (I - L)^{-1}U = \begin{pmatrix} 1 & 0 & 0 \\ -0.1333 & 1 & 0 \\ 0.1 & -0.0333 & 1 \end{pmatrix}^{-1} \begin{pmatrix} 0 & -0.5 & -0.7 \\ 0 & 0 & -0.2 \\ 0 & 0 & 0 \end{pmatrix}$$

Sử dụng máy tính Casio thực hiện phép nhân ma trận:

$$M = \begin{pmatrix} 0 & -0.5 & -0.7 \\ 0 & 0.0667 & -0.1067 \\ 0 & -0.0478 & -0.0736 \end{pmatrix}$$

---

#### Ý 3: Lập bảng số tính các bước lặp $x^{(1)}, x^{(2)}$

Công thức lặp từng dòng (đã sửa đúng dấu):

$$\begin{cases} x_1^{(n+1)} = -0.5x_2^{(n)} - 0.7x_3^{(n)} + 1.1 \\ x_2^{(n+1)} = -0.1333x_1^{(n+1)} - 0.2x_3^{(n)} + 0.8 \\ x_3^{(n+1)} = 0.1x_1^{(n+1)} - 0.0333x_2^{(n+1)} + 0.6333 \end{cases}$$

**Bảng kết quả lặp số (làm tròn 4 chữ số thập phân):**

| **Bước lặp (k)** | **x1(k)​** | **x2(k)​** | **x3(k)​** |
| ---------------- | ---------- | ---------- | ---------- |
| **0**            | 0          | 0          | 0          |
| **1**            | 1.1000     | 0.6533     | 0.7216     |
| **2**            | 0.2683     | 0.6201     | 0.6395     |

#### Ý 4: Đánh giá sai số hậu nghiệm cho $x^{(2)}$

Sử dụng chuẩn vô hạn cho vector (vị trí có trị tuyệt đối hiệu lớn nhất):

$$\|x^{(2)} - x^{(1)}\|_\infty = \max(|0.2683 - 1.1000|, |0.6201 - 0.6533|, |0.6395 - 0.7216|)$$

$$\|x^{(2)} - x^{(1)}\|_\infty = \max(0.8317, 0.0332, 0.0821) = 0.8317$$

Áp dụng công thức sai số hậu nghiệm trường hợp chéo trội cột:

$$\|x^{(2)} - x^*\|_\infty \le \frac{q}{(1-s)(1-q)} \|x^{(2)} - x^{(1)}\|_\infty$$

Thế các giá trị $s = 0.5$, $q = 0.3571$ vào hệ thức:

$$\|x^{(2)} - x^*\|_\infty \le \frac{0.3571}{(1 - 0.5)(1 - 0.3571)} \times 0.8317$$

$$\|x^{(2)} - x^*\|_\infty \le \frac{0.3571}{0.32145} \times 0.8317 \approx 0.9239$$

**Kết luận:** Sai số của nghiệm xấp xỉ ở bước lặp thứ 2 không vượt quá $0.9239$.