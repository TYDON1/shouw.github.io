---
title: "NTT模版"
date: "2026-08-27 20:03:11"
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

## NTT模版

```cpp
struct NTT {
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

    void transform(vector<int>& a, bool inv) {
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

    // 返回 a、b 两个多项式的卷积（系数表示）
    vector<int> multiply(vector<int> a, vector<int> b) {
        int tot = a.size() + b.size() - 1, sz = 1;
        while (sz < tot) sz <<= 1;
        a.resize(sz);
        b.resize(sz);
        transform(a, false);
        transform(b, false);
        for (int i = 0; i < sz; i++) a[i] = a[i] * b[i] % MOD;
        transform(a, true);
        a.resize(tot);
        return a;
    }
};
```
