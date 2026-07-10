# So sánh các phương pháp Giải Tích Số

---

## I. Nhóm tìm nghiệm phương trình $f(x) = 0$ (1 biến)

### 1.1 So sánh tổng quan 4 phương pháp

| Tiêu chí | Chia đôi | Dây cung | Tiếp tuyến (Newton) | Lặp đơn |
|---|---|---|---|---|
| **Điều kiện áp dụng** | $f(a) \cdot f(b) < 0$ | $f(a) \cdot f(b) < 0$, $m_1 > 0$ | $f(x_0) \cdot f''(x_0) > 0$, $m_1 > 0$, $f'$ không đổi dấu | $\vert\varphi'(x)\vert \le q < 1$ trên khoảng chứa nghiệm |
| **Tốc độ hội tụ** | Tuyến tính — chậm nhất, giảm đều $\frac{1}{2}$ mỗi bước | Tuyến tính — nhanh hơn chia đôi nhờ chọn cắt không đều | **Bậc 2 (siêu tuyến tính)** — rất nhanh | Tuyến tính, phụ thuộc $q$ |
| **Số bước ước tính** | $\sim 20$ bước để đạt 6 chữ số | Ít hơn chia đôi | Rất ít (~5 bước) | Phụ thuộc $q$, chậm khi $q \to 1$ |
| **Thông tin cần có** | $f(x)$ | $f(x)$, $m_1 = \min\|f'\|$ | $f(x)$, $f'(x)$, $f''(x)$, $m_1$ | $\varphi(x)$, hệ số co $q$ |
| **Tính chất dãy lặp** | $[a_n, b_n]$ thu hẹp đều, luôn chứa nghiệm | $d$ cố định, $x_k$ tiếp cận từ một phía | $\{x_n\}$ đơn điệu, tiến về nghiệm nhanh | Hội tụ khi $q < 1$, phân kỳ khi $q \ge 1$ |
| **Luôn hội tụ?** | ✅ Luôn hội tụ nếu $f$ liên tục và $f(a) \cdot f(b) < 0$ | ✅ Hội tụ khi $f$ lồi/lõm trên $[a, b]$ | ⚠️ Cần chọn $x_0$ đúng (điểm Fourier) | ⚠️ Cần đảm bảo $q < 1$ |
| **Cần điểm ban đầu** | Khoảng $[a, b]$ | Khoảng $[a, b]$ | Một điểm $x_0$ thỏa điều kiện Fourier | Một điểm $x_0$ tùy ý trong khoảng |
| **Ưu điểm** | Đơn giản, luôn hội tụ, không cần đạo hàm | Nhanh hơn chia đôi, không cần đạo hàm | Rất nhanh (bậc 2) | Đơn giản, chỉ cần $\varphi(x)$ và $q$ |
| **Nhược điểm** | Hội tụ chậm nhất | Cần xác định điểm Fourier, cần ước lượng $m_1$ | Cần $f', f''$, chọn $x_0$ khó, có thể phân kỳ | Không tự nhiên, cần biến đổi $f(x)=0 \to x=\varphi(x)$ |

### 1.2 Công thức ước lượng sai số

| Phương pháp | Sai số tiên nghiệm | Sai số hậu nghiệm |
|---|---|---|
| Chia đôi | $\|x^* - c_n\| \le \dfrac{b-a}{2^n}$ | $\|b - a\| < \varepsilon$ |
| Dây cung | — | $\dfrac{\|f(x_k)\|}{m_1} < \varepsilon$ |
| Tiếp tuyến | — | $\dfrac{\|f(x_n)\|}{m_1} < \varepsilon$ |
| Lặp đơn | $\dfrac{q^n}{1-q}\|x_1 - x_0\|$ | $\dfrac{q}{1-q}\|x_n - x_{n-1}\| < \varepsilon$ |

---

## II. Nhóm giải hệ phương trình tuyến tính $Ax = b$

### 2.1 Phương pháp trực tiếp vs Phương pháp lặp

| Tiêu chí | **Trực tiếp** (Gauss, LU, Cholesky) | **Lặp** (Jacobi, Gauss-Seidel) |
|---|---|---|
| **Bản chất** | Biến đổi đại số hữu hạn bước | Tính xấp xỉ qua chuỗi lặp vô hạn |
| **Độ chính xác** | Nghiệm chính xác (sai số do làm tròn) | Nghiệm xấp xỉ đến độ chính xác $\varepsilon$ yêu cầu |
| **Điều kiện hội tụ** | Không cần (luôn ra nghiệm nếu A không suy biến) | Ma trận $A$ phải chéo trội ngặt (hàng hoặc cột) |
| **Phù hợp với** | Ma trận đặc (dense), kích thước vừa | Ma trận thưa (sparse), kích thước lớn |
| **Khi đổi vế phải $b$** | Phải tính lại từ đầu (hoặc dùng lại $L, U$ nếu đã lưu) | Phải chạy lại thuật toán |
| **Ứng dụng điển hình** | Giải Ax=B nhiều vế, tìm $A^{-1}$, tính định thức | Bài toán kinh tế (Leontief), lưới điện, PDE lớn |

### 2.2 So sánh các phương pháp trực tiếp

| Tiêu chí | Gauss | Gauss-Jordan | LU (Doolittle) | Cholesky |
|---|---|---|---|---|
| **Yêu cầu đầu vào** | $A$ bất kỳ, $B$ nhiều cột | $A$ bất kỳ, $B$ nhiều cột | $A$ vuông không suy biến | $A$ đối xứng **xác định dương** |
| **Chiến lược** | Khử về tam giác trên, thế ngược | Khử về dạng bậc thang rút gọn (RREF) | Phân tách $A = LU$ một lần, dùng lại | Phân tách $A = LL^T$ một lần, dùng lại |
| **Đọc nghiệm** | Cần bước thế ngược | **Đọc trực tiếp** từ cột vế phải | Giải $Ly=b$ rồi $Ux=y$ | Giải $Ly=b$ rồi $L^Tx=y$ |
| **Giải nhiều $b$** | Ghép $[A\|B]$, giải đồng thời | Ghép $[A\|B]$, giải đồng thời | **Tốt nhất**: giải lại từng $b$ rất nhanh | **Tốt nhất**: giải lại từng $b$ rất nhanh |
| **Chi phí tính toán** | $O(n^3)$ | $O(n^3)$ | $O(n^3)$ phân tách + $O(n^2)$ mỗi $b$ | **$O(n^3/3)$** phân tách + $O(n^2)$ mỗi $b$ |
| **Xử lý vô số nghiệm** | ✅ Biểu diễn nghiệm tổng quát qua biến tự do | ✅ Biểu diễn trực tiếp | ❌ Không xử lý | ❌ Không xử lý |
| **Ưu điểm** | Đa năng nhất, hỗ trợ mọi dạng ma trận | Không cần thế ngược | Tái sử dụng $L, U$ khi đổi $b$ | Hiệu quả nhất cho ma trận SPD |
| **Nhược điểm** | Cần thế ngược | Chi phí hơi cao hơn Gauss | Không xử lý trường hợp đặc biệt | Chỉ áp dụng cho ma trận SPD |

### 2.3 So sánh Jacobi và Gauss-Seidel (phương pháp lặp)

| Tiêu chí | **Lặp Jacobi** | **Lặp Gauss-Seidel** | **Lặp đơn dạng $x = Bx + d$** |
|---|---|---|---|
| **Điều kiện hội tụ** | $A$ chéo trội hàng hoặc cột | $A$ chéo trội hàng hoặc cột | $\|B\| < 1$ (chuẩn hàng hoặc cột) |
| **Sử dụng giá trị mới** | Dùng toàn bộ $X^{(k-1)}$ để tính $X^{(k)}$ | **Dùng ngay** $x_j^{(k)}$ vừa tính trong cùng bước | Dùng toàn bộ $X^{(k-1)}$ |
| **Tốc độ hội tụ** | Chậm hơn | **Nhanh hơn** Jacobi (thường gấp đôi) | Phụ thuộc $\|B\|$ |
| **Tính toán song song** | ✅ Có thể song song hóa | ❌ Không thể (phụ thuộc tuần tự) | ✅ Có thể song song hóa |
| **Tiết kiệm bộ nhớ** | ✅ Lưu cả $X^{(k-1)}$ và $X^{(k)}$ | ✅ Chỉ cần 1 vector $X$ duy nhất | ✅ Lưu cả $X^{(k-1)}$ và $X^{(k)}$ |
| **Ưu điểm** | Tính song song, tiết kiệm bộ nhớ | Hội tụ nhanh hơn, bộ nhớ thấp | Linh hoạt, dùng cho hệ tổng quát dạng $X = BX + d$ |
| **Nhược điểm** | Hội tụ chậm hơn Gauss-Seidel | Không song song được | Cần biến đổi hệ về dạng $X = BX + d$ |
| **Đặc điểm hệ số co** | $q = \max_i \dfrac{\sum_{j\ne i}\|a_{ij}\|}{\|a_{ii}\|}$ | Tính $s, q$ phức tạp hơn dựa trên tam giác dưới/trên | $q = \|B\|$ |

---

## III. Nhóm giải hệ phương trình phi tuyến $F(X) = 0$

| Tiêu chí | **Lặp đơn** (Fixed-point) | **Lặp Newton** |
|---|---|---|
| **Điều kiện áp dụng** | $\|\nabla\varphi\| \le q < 1$ trên miền $D$ | $J(X^{(0)})$ không suy biến |
| **Tốc độ hội tụ** | Tuyến tính, phụ thuộc $q$ | **Bậc 2** — rất nhanh |
| **Thông tin cần có** | Hàm $\varphi(X)$ và hệ số co $q$ | $F(X)$, ma trận Jacobi $J(X)$ (đạo hàm riêng) |
| **Chi phí mỗi bước** | Tính $\varphi(X)$ — đơn giản | Tính $F$, tính $J$, giải hệ $J\Delta X = -F$ — nặng |
| **Tự động** | Cần biến đổi $F(X)=0 \to X=\varphi(X)$ thủ công | Chỉ cần nhập các phương trình $f_i$ |
| **Ưu điểm** | Đơn giản, dễ cài đặt | Hội tụ rất nhanh (bậc 2), không cần biến đổi thủ công |
| **Nhược điểm** | Biến đổi về dạng lặp không phải lúc nào cũng dễ; hội tụ chậm | Cần tính đạo hàm (Jacobi), có thể phân kỳ nếu $X^{(0)}$ xa nghiệm |
| **Ứng dụng** | Hệ nhỏ, $\varphi$ đơn giản | Hệ lớn, cần độ chính xác cao |

---

## IV. Nhóm tìm giá trị riêng và phân rã ma trận

### 4.1 So sánh Lũy thừa, Xuống thang, Danilevsky

| Tiêu chí | **Lũy thừa** (Power Method) | **Xuống thang** (Hotelling Deflation) | **Danilevsky** |
|---|---|---|---|
| **Mục tiêu** | Tìm **một** giá trị riêng trội $\lambda_1$ và véc-tơ riêng $v_1$ | Tìm **lần lượt** $\lambda_2, \lambda_3, \ldots$ sau khi đã có $\lambda_1, v_1$ | Tìm **đa thức đặc trưng** $p(\lambda)$; từ đó tìm **tất cả** giá trị riêng |
| **Phương pháp** | Lặp $y_{k+1} = Ax_k$, chuẩn hóa | Hạ bậc ma trận: $M_{k+1} = M_k - \lambda_k v_k v_k^T$ | Biến đổi về ma trận đồng hành (companion matrix) |
| **Yêu cầu** | Ma trận $A$, véc-tơ khởi tạo $x_0$ | Phải có sẵn $\lambda_1, v_1$ từ phương pháp lũy thừa | Ma trận $A$ vuông (phép biến đổi trực tiếp) |
| **Điều kiện hội tụ** | Phải có giá trị riêng trội duy nhất | Hội tụ tốt khi $\lambda_1 \gg \lambda_2$ | Luôn cho đa thức đặc trưng chính xác (không lặp) |
| **Tốc độ** | Phụ thuộc tỷ lệ $\|\lambda_2/\lambda_1\|$ | Mỗi bước Hotelling là 1 lần lũy thừa | Hữu hạn bước (không lặp) |
| **Kết quả** | $\lambda_1$ và $v_1$ | $\lambda_1, \lambda_2, \ldots, \lambda_r$ và các $v_i$ tương ứng | Đa thức đặc trưng → Nghiệm là tất cả $\lambda_i$ |
| **Ưu điểm** | Đơn giản, hiệu quả cho $\lambda_1$ | Mở rộng tự nhiên từ lũy thừa để tìm nhiều giá trị riêng | Tìm **tất cả** giá trị riêng trong một lần |
| **Nhược điểm** | Chỉ tìm được $\lambda_1$; chậm nếu $\lambda_2 \approx \lambda_1$ | Sai số tích lũy qua mỗi bước hạ | Nhạy cảm với sai số số học; phương trình bậc cao khó giải tay |
| **Kết hợp** | Dùng cùng Xuống thang để tìm tất cả $\lambda_i$ | Dùng sau Lũy thừa | Độc lập |

### 4.2 So sánh hai phương pháp phân rã SVD

| Tiêu chí | **SVD Phân tích (mathjs)** | **SVD Lũy thừa & Xuống thang** |
|---|---|---|
| **Cách thực hiện** | Tính trực tiếp qua thư viện số (mathjs `eigs`) | Tìm các giá trị riêng của $A^TA$ bằng lặp số |
| **Kết quả** | $U, \Sigma, V^T$ chính xác | $U, \Sigma, V^T$ xấp xỉ đến sai số $\varepsilon$ |
| **Xem chi tiết từng bước** | ❌ Không hiển thị quá trình | ✅ Hiển thị từng vòng lặp, hội tụ, hạ bậc |
| **Phù hợp với bài thi** | ❌ Dùng máy tính, không trình bày được tay | ✅ Phù hợp — trình bày từng bước như yêu cầu đề thi |
| **Bổ sung xấp xỉ ma trận** | ✅ Có (nhập $r$ hoặc $\%$ sai số) | ✅ Có (nhập $r$ hoặc $\%$ sai số) |
| **Ứng dụng** | Kiểm tra kết quả, ma trận lớn | Học thuật, trình bày lời giải thi |

---

## V. Nhóm tìm ma trận nghịch đảo $A^{-1}$

| Tiêu chí | **Gauss-Jordan** (đặt $B=I$) | **LU Solve** (đặt $B=I$) | **Cholesky Solve** (đặt $B=I$) | **Viền quanh** |
|---|---|---|---|---|
| **Yêu cầu ma trận** | $A$ vuông không suy biến | $A$ vuông không suy biến | $A$ đối xứng xác định dương | $A$ vuông, $a_{11} \ne 0$, các định thức con $\ne 0$ |
| **Phương pháp** | Khử đồng thời $[A\|I] \to [I\|A^{-1}]$ | Phân tách LU, giải $n$ cột của $I$ | Phân tách Cholesky, giải $n$ cột của $I$ | Mở rộng nghịch đảo từng cấp $1 \to 2 \to \ldots \to n$ |
| **Thể hiện quá trình** | ✅ Rõ ràng từng phép khử | ✅ Hiển thị từng bước thế | ✅ Hiển thị từng bước thế | ✅ Trực quan từng bước viền, phù hợp bài thi |
| **Khi ma trận đặc biệt** | Phát hiện vô nghiệm | Phát hiện suy biến | Phát hiện không SPD | **Tự động fallback** sang $M = A^TA$ |
| **Phù hợp với bài thi** | ⚠️ Nhiều bước khử | ⚠️ Cần phân tách trước | ⚠️ Chỉ dùng cho SPD | ✅ **Tốt nhất** — thiết kế riêng cho bài thi viền quanh |

---

## VI. So sánh theo bài toán thực tế

### 6.1 Bài toán kinh tế Leontief $(I - C)x = d$

**Đề xuất:** Gauss-Seidel hoặc Lặp đơn dạng $x = Cx + d$.

| Phương pháp | Lý do phù hợp |
|---|---|
| Gauss-Seidel | Ma trận $(I-C)$ thỏa chéo trội cột (tổng mỗi cột của $C < 1$); hội tụ nhanh hơn Jacobi |
| Lặp đơn ($x = Cx + d$) | Nhập trực tiếp $C$ và $d$; phù hợp khi đề cho dạng $x = Cx + d$ |
| LU hoặc Gauss | Khi cần nghiệm chính xác và không muốn lặp |

### 6.2 Bài toán tìm $\sigma_1$ và vector kỳ dị

**Đề xuất:** SVD Lũy thừa & Xuống thang (`/svd-power`).
- Tìm $\sigma_i = \sqrt{\lambda_i(A^TA)}$ qua Lũy thừa trên $A^TA$.
- Log output tường minh: $\sigma_1$, $v_1$ (vector kỳ dị phải), $u_1$ (vector kỳ dị trái).

### 6.3 Bài toán xấp xỉ ma trận (SVD Truncation)

$$\hat{A}_r = \sum_{i=1}^{r} \sigma_i u_i v_i^T, \quad \frac{\|A - \hat{A}_r\|_F}{\|A\|_F} \le \varepsilon\%$$

- **Nhập $r$ cố định:** Hệ thống tái tạo ngay ma trận bậc $r$.  
- **Nhập $\%$ sai số:** Hệ thống tự tìm $r$ nhỏ nhất thỏa mãn sai số Frobenius.

---

## VII. Tổng hợp: Chọn phương pháp theo bài toán

| Bài toán | Phương pháp ưu tiên | Lưu ý |
|---|---|---|
| Tìm nghiệm $f(x)=0$ — đơn giản | **Chia đôi** | Luôn hội tụ, không cần đạo hàm |
| Tìm nghiệm $f(x)=0$ — nhanh | **Tiếp tuyến (Newton)** | Cần $f', f'', x_0$ thỏa điều kiện Fourier |
| Tìm nghiệm $f(x)=0$ — không cần đạo hàm, nhanh hơn chia đôi | **Dây cung** | Cần ước lượng $m_1$ |
| Giải $Ax=b$ — ma trận đặc biệt (SPD) | **Cholesky** | Hiệu quả nhất cho ma trận đối xứng xác định dương |
| Giải $Ax=b$ — ma trận tổng quát, một lần | **Gauss** hoặc **LU** | LU tốt hơn khi cần dùng lại với nhiều $b$ |
| Giải $Ax=b$ — ma trận lớn, thưa | **Gauss-Seidel** | Cần ma trận chéo trội; nhanh hơn Jacobi |
| Giải hệ phi tuyến $F(X)=0$ | **Newton hệ** | Hội tụ bậc 2; cần Jacobi |
| Tìm $\lambda_1, v_1$ | **Lũy thừa** | Đơn giản, hội tụ khi $\lambda_1$ trội |
| Tìm $\lambda_1, \lambda_2, \ldots$ | **Lũy thừa + Xuống thang** | Dùng kết hợp |
| Tìm tất cả $\lambda_i$ (đa thức đặc trưng) | **Danilevsky** | Không lặp, ra đa thức trực tiếp |
| Tìm $\sigma_i$ và phân rã SVD | **SVD Lũy thừa** | Phù hợp bài thi — từng bước rõ ràng |
| Tìm $A^{-1}$ theo từng bước | **Viền quanh** | Phù hợp bài thi — log chi tiết từng cấp |
| Trực chuẩn hóa hệ vector | **Gram-Schmidt** | — |
