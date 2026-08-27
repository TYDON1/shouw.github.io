---
title: "拉格朗日插值模版"
date: "2026-08-27 20:18:22"
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

## 拉格朗日插值模版

```cpp
struct Lagrange {
    const int MOD = 1000000007;

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

    // 一般点值插值：O(n^2)，给定 n 个点 (x[i], y[i])，求 f(k)
    int solve(vector<int>& x, vector<int>& y, int k) {
        int n = x.size(), res = 0;
        for (int i = 0; i < n; i++) {
            int num = y[i], den = 1;
            for (int j = 0; j < n; j++) {
                if (i == j) continue;
                num = num * ((k - x[j]) % MOD + MOD) % MOD;
                den = den * ((x[i] - x[j]) % MOD + MOD) % MOD;
            }
            res = (res + num * qpow(den, MOD - 2)) % MOD;
        }
        return res;
    }

    // 连续点值插值：x[i] = 1, 2, ..., n，O(n)，求 f(k)（k > n，否则直接返回 y[k-1]）
    int solve_consecutive(vector<int>& y, int k) {
        int n = y.size();
        if (k <= n) return y[k - 1];

        vector<int> pre(n + 2), suf(n + 2), fact(n + 1), inv_fact(n + 1);
        pre[0] = 1;
        for (int i = 1; i <= n; i++) pre[i] = pre[i - 1] * ((k - i) % MOD + MOD) % MOD;
        suf[n + 1] = 1;
        for (int i = n; i >= 1; i--) suf[i] = suf[i + 1] * ((k - i) % MOD + MOD) % MOD;

        fact[0] = 1;
        for (int i = 1; i <= n; i++) fact[i] = fact[i - 1] * i % MOD;
        inv_fact[n] = qpow(fact[n], MOD - 2);
        for (int i = n - 1; i >= 0; i--) inv_fact[i] = inv_fact[i + 1] * (i + 1) % MOD;

        int res = 0;
        for (int i = 1; i <= n; i++) {
            int coef = pre[i - 1] * suf[i + 1] % MOD * inv_fact[i - 1] % MOD * inv_fact[n - i] % MOD;
            if ((n - i) & 1) coef = (MOD - coef) % MOD;
            res = (res + y[i - 1] * coef) % MOD;
        }
        return res;
    }
};
```
