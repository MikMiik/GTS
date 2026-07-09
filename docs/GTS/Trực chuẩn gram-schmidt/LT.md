**Input:** Tập hợp các vector độc lập tuyến tính $V = \{v_1, v_2, \dots, v_n\}$ trong không gian $\mathbb{R}^m$.

**Output:** Tập hợp các vector trực chuẩn $E = \{e_1, e_2, \dots, e_n\}$.

1. **Bước 1: Tìm hệ vector trực giao $U = \{u_1, u_2, \dots, u_n\}$**
    
    - $u_1 = v_1$
        
    - Với mỗi $k$ từ $2$ đến $n$, tính $u_k$ bằng cách lấy $v_k$ trừ đi hình chiếu của $v_k$ lên các vector $u_i$ (với $i < k$) đã tìm được trước đó:
        
        $$u_k = v_k - \sum_{i=1}^{k-1} \text{proj}_{u_i}(v_k)$$
        
        Trong đó, công thức hình chiếu là:
        
        $$\text{proj}_{u_i}(v_k) = \frac{\langle v_k, u_i \rangle}{\langle u_i, u_i \rangle} u_i$$
        
        _(Ghi chú: $\langle x, y \rangle$ là tích vô hướng của hai vector $x$ và $y$)_
        
2. **Bước 2: Chuẩn hóa hệ vector $U$ thành $E$**
    
    - Với mỗi vector $u_i \in U$, chia vector đó cho độ dài (chuẩn) của chính nó để thu được vector độ dài bằng 1:
        
        $$e_i = \frac{u_i}{\|u_i\|}$$
        
        Trong đó, $\|u_i\| = \sqrt{\langle u_i, u_i \rangle}$.
```
// Tính tích vô hướng của 2 vector
function dotProduct(v1, v2) {
    return v1.reduce((sum, val, i) => sum + val * v2[i], 0);
}

// Trừ 2 vector
function subtract(v1, v2) {
    return v1.map((val, i) => val - v2[i]);
}

// Nhân vector với 1 vô hướng (scalar)
function scale(v, scalar) {
    return v.map(val => val * scalar);
}

// Tính độ dài (chuẩn) của vector
function norm(v) {
    return Math.sqrt(dotProduct(v, v));
}

// Thuật toán Gram-Schmidt
function gramSchmidt(vectors) {
    const u = []; // Lưu các vector trực giao
    const e = []; // Lưu các vector trực chuẩn

    // Bước 1: Trực giao hóa
    for (let i = 0; i < vectors.length; i++) {
        let ui = vectors[i];
        
        for (let j = 0; j < i; j++) {
            // Tính proj_{u_j}(v_i) = (<v_i, u_j> / <u_j, u_j>) * u_j
            const projScalar = dotProduct(vectors[i], u[j]) / dotProduct(u[j], u[j]);
            const projVector = scale(u[j], projScalar);
            
            // Trừ đi hình chiếu
            ui = subtract(ui, projVector);
        }
        u.push(ui);
    }

    // Bước 2: Trực chuẩn hóa
    for (let i = 0; i < u.length; i++) {
        const magnitude = norm(u[i]);
        
        // Tránh lỗi chia cho 0 nếu tập vector đầu vào phụ thuộc tuyến tính
        if (magnitude === 0) {
            e.push(u[i]);
        } else {
            e.push(scale(u[i], 1 / magnitude));
        }
    }

    return e;
}
`