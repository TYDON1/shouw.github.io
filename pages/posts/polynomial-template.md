---
title: "多项式全家桶模版"
date: "2026-08-27 20:11:47"
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

## 多项式全家桶模版

```cpp
struct Poly {
    const int MOD = 998244353, G = 3, GI = 332748118;

    int qpow(int a, int b) {
        int res = 1;
        a %= MOD;
        while (b > 0) {
            if (b & 1) res = res * a % MOD;
            a = a * a % MOD;
            b >>= 1;
        }
        return res;
    }

    void ntt(vector<int>& a, bool inv) {
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

    vector<int> multiply(vector<int> a, vector<int> b) {
        int tot = a.size() + b.size() - 1, sz = 1;
        while (sz < tot) sz <<= 1;
        a.resize(sz);
        b.resize(sz);
        ntt(a, false);
        ntt(b, false);
        for (int i = 0; i < sz; i++) a[i] = a[i] * b[i] % MOD;
        ntt(a, true);
        a.resize(tot);
        return a;
    }

    // 多项式求逆：求 b 使得 a * b ≡ 1 (mod x^n)，要求 a[0] != 0
    vector<int> inverse(const vector<int>& a, int n) {
        if (n == 1) return {qpow(a[0], MOD - 2)};
        vector<int> b = inverse(a, (n + 1) / 2);
        int sz = 1;
        while (sz < 2 * n) sz <<= 1;
        vector<int> ta(a.begin(), a.begin() + min((int)a.size(), n));
        ta.resize(sz);
        b.resize(sz);
        ntt(ta, false);
        ntt(b, false);
        for (int i = 0; i < sz; i++) b[i] = b[i] * (2 - ta[i] * b[i] % MOD + MOD) % MOD;
        ntt(b, true);
        b.resize(n);
        return b;
    }

    vector<int> derivative(const vector<int>& a) {
        int n = a.size();
        if (n <= 1) return {0};
        vector<int> res(n - 1);
        for (int i = 1; i < n; i++) res[i - 1] = a[i] * i % MOD;
        return res;
    }

    vector<int> integral(const vector<int>& a) {
        int n = a.size();
        vector<int> res(n + 1), inv(n + 2);
        inv[1] = 1;
        for (int i = 2; i <= n + 1; i++) inv[i] = (MOD - MOD / i) * inv[MOD % i] % MOD;
        for (int i = 0; i < n; i++) res[i + 1] = a[i] * inv[i + 1] % MOD;
        return res;
    }

    // 多项式 ln，要求 a[0] == 1
    vector<int> ln(const vector<int>& a, int n) {
        vector<int> b = derivative(a);
        b = multiply(b, inverse(a, n));
        b.resize(n - 1);
        b = integral(b);
        b.resize(n);
        return b;
    }

    // 多项式 exp，要求 a[0] == 0
    vector<int> exp(const vector<int>& a, int n) {
        if (n == 1) return {1};
        vector<int> b = exp(a, (n + 1) / 2);
        b.resize(n);
        vector<int> lnb = ln(b, n);
        for (int i = 0; i < n; i++) {
            int ai = i < (int)a.size() ? a[i] : 0;
            lnb[i] = (ai - lnb[i] + MOD) % MOD;
        }
        lnb[0] = (lnb[0] + 1) % MOD;
        b = multiply(b, lnb);
        b.resize(n);
        return b;
    }
};
```
