---
title: "拉格朗日反演模版"
date: "2026-11-27 17:52:15"
author: shouw
katex: true
categories:
  - 模版
email: KijinSeija@shouw.blog
readmore: true
tags:
  - 编程
  - 算法竞赛
  - 模版
---

## 拉格朗日反演模版

### 核心公式

设形式幂级数 $F(x), G(x)$ 满足 $F(0) = G(0) = 0$、$F'(0) \neq 0$，且互为复合逆 $F(G(x)) = G(F(x)) = x$：

- **拉格朗日反演**：
  $$[x^n] G(x) = \frac{1}{n} [x^{n-1}] \left(\frac{x}{F(x)}\right)^n$$
- **扩展拉格朗日反演**（对任意幂级数 $H(x)$）：
  $$[x^n] H(G(x)) = \frac{1}{n} [x^{n-1}] \left(H'(x) \left(\frac{x}{F(x)}\right)^n\right)$$
- **常见应用场景**：给定递推方程 $G(x) = x \cdot \Phi(G(x))$，即 $F(x) = \frac{x}{\Phi(x)}$，此时 $\frac{x}{F(x)} = \Phi(x)$，直接得 $[x^n] G(x) = \frac{1}{n}[x^{n-1}] \Phi(x)^n$（卡特兰数、$k$ 叉树计数、有标号树计数等）。

```cpp
struct LagrangeInversion {
    static constexpr int MOD = 998244353, G = 3, GI = 332748118;

    static int qpow(int a, int b) {
        int res = 1;
        a = (a % MOD + MOD) % MOD;
        while (b > 0) {
            if (b & 1) res = res * a % MOD;
            a = a * a % MOD;
            b >>= 1;
        }
        return res;
    }

    static void ntt(vector<int>& a, bool inv) {
        int n = a.size();
        for (int i = 1, j = 0; i < n; i++) {
            int bit = n >> 1;
            for (; j & bit; bit >>= 1) j ^= bit;
            j ^= bit;
            if (i < j) swap(a[i], a[j]);
        }
        for (int len = 2; len <= n; len <<= 1) {
            int w = qpow(inv ? GI : G, (MOD - 1) / len);
            for (int i = 0; i < n; i += len) {
                int wn = 1;
                for (int j = 0; j < len / 2; j++) {
                    int u = a[i + j], v = a[i + j + len / 2] * wn % MOD;
                    a[i + j] = (u + v) % MOD;
                    a[i + j + len / 2] = (u - v + MOD) % MOD;
                    wn = wn * w % MOD;
                }
            }
        }
        if (inv) {
            int n_inv = qpow(n, MOD - 2);
            for (int& x : a) x = x * n_inv % MOD;
        }
    }

    static vector<int> mul(vector<int> a, vector<int> b, int lim = -1) {
        int tot = (int)a.size() + (int)b.size() - 1, sz = 1;
        while (sz < tot) sz <<= 1;
        a.resize(sz); b.resize(sz);
        ntt(a, false); ntt(b, false);
        for (int i = 0; i < sz; i++) a[i] = a[i] * b[i] % MOD;
        ntt(a, true);
        a.resize(lim == -1 ? tot : min(tot, lim));
        return a;
    }

    static vector<int> inv_poly(const vector<int>& a, int n) {
        if (n == 1) return {qpow(a[0], MOD - 2)};
        vector<int> b = inv_poly(a, (n + 1) / 2);
        int sz = 1;
        while (sz < 2 * n) sz <<= 1;
        vector<int> ta(a.begin(), a.begin() + min((int)a.size(), n));
        ta.resize(sz); b.resize(sz);
        ntt(ta, false); ntt(b, false);
        for (int i = 0; i < sz; i++) b[i] = b[i] * (2 - ta[i] * b[i] % MOD + MOD) % MOD;
        ntt(b, true);
        b.resize(n);
        return b;
    }

    static vector<int> deriv(const vector<int>& a) {
        int n = a.size();
        if (n <= 1) return {0};
        vector<int> r(n - 1);
        for (int i = 1; i < n; i++) r[i - 1] = a[i] * i % MOD;
        return r;
    }

    static vector<int> integ(const vector<int>& a) {
        int n = a.size();
        vector<int> r(n + 1), iv(n + 2, 1);
        for (int i = 2; i <= n + 1; i++) iv[i] = (MOD - MOD / i) * iv[MOD % i] % MOD;
        for (int i = 0; i < n; i++) r[i + 1] = a[i] * iv[i + 1] % MOD;
        return r;
    }

    static vector<int> ln(const vector<int>& a, int n) {
        auto b = mul(deriv(a), inv_poly(a, n), n - 1);
        b = integ(b);
        b.resize(n);
        return b;
    }

    static vector<int> exp(const vector<int>& a, int n) {
        if (n == 1) return {1};
        auto b = exp(a, (n + 1) / 2);
        b.resize(n);
        auto lnb = ln(b, n);
        for (int i = 0; i < n; i++) {
            int ai = i < (int)a.size() ? a[i] : 0;
            lnb[i] = (ai - lnb[i] + MOD) % MOD;
        }
        lnb[0] = (lnb[0] + 1) % MOD;
        b = mul(b, lnb, n);
        b.resize(n);
        return b;
    }

    // 多项式快速幂：求 a(x)^k mod x^n，要求 a[0] != 0
    static vector<int> pow_poly(vector<int> a, int k, int n) {
        a.resize(n);
        int c0 = a[0], inv_c0 = qpow(c0, MOD - 2);
        for (int& x : a) x = x * inv_c0 % MOD;
        auto lna = ln(a, n);
        int km = k % MOD;
        for (int& x : lna) x = x * km % MOD;
        auto res = exp(lna, n);
        int scale = qpow(c0, k);
        for (int& x : res) x = x * scale % MOD;
        return res;
    }

    // 构造 B(x) = (x / F(x))^n mod x^n（要求 F[0] == 0, F[1] != 0）
    static vector<int> build_core(const vector<int>& F, int n) {
        vector<int> A(n, 0); // A(x) = F(x) / x
        for (int i = 0; i < n && i + 1 < (int)F.size(); i++) A[i] = F[i + 1];
        auto invA = inv_poly(A, n);
        return pow_poly(invA, n, n);
    }

    // 1. 普通拉格朗日反演：求 [x^n] G(x)，其中 F(G(x)) = x，n >= 1
    static int coeff(const vector<int>& F, int n) {
        if (n == 0) return 0;
        auto P = build_core(F, n);
        return P[n - 1] * qpow(n, MOD - 2) % MOD;
    }

    // 2. 扩展拉格朗日反演：求 [x^n] H(G(x))，其中 F(G(x)) = x，n >= 1
    static int extended_coeff(const vector<int>& F, const vector<int>& H, int n) {
        if (n == 0) return H.empty() ? 0 : H[0] % MOD;
        auto P = build_core(F, n); // (x / F(x))^n mod x^n
        auto dH = deriv(H);
        int sum = 0;
        for (int i = 0; i < n && i < (int)dH.size(); i++) {
            sum = (sum + dH[i] * P[n - 1 - i]) % MOD;
        }
        return sum * qpow(n, MOD - 2) % MOD;
    }

    // 3. 特例：求 [x^n] G(x)^k（即 H(x) = x^k）
    static int kth_power_coeff(const vector<int>& F, int k, int n) {
        if (n < k) return 0;
        if (k == 0) return n == 0 ? 1 : 0;
        auto P = build_core(F, n);
        return k % MOD * P[n - k] % MOD * qpow(n, MOD - 2) % MOD;
    }
};
```
