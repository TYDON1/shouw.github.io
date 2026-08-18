---
title: "组合数模版"
date: "2026-03-30 13:04:21"
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

```cpp
struct Comb {

    int n, MOD;
    vector<int> fact, inv;

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

    Comb(int _n = 200000, int _MOD = 1000000007) : n(_n), MOD(_MOD) {
        fact.resize(n + 1);
        inv.resize(n + 1);
        fact[0] = 1;
        for (int i = 1; i <= n; i++) {
            fact[i] = fact[i - 1] * i % MOD;
        }
        inv[n] = qpow(fact[n], MOD - 2);
        for (int i = n - 1; i >= 0; i--) {
            inv[i] = inv[i + 1] * (i + 1) % MOD;
        }
    }

    int C(int n, int m) {
        if (m < 0 || m > n || n < 0) return 0;
        return fact[n] * inv[m] % MOD * inv[n - m] % MOD;
    }

    int A(int n, int m) {
        if (m < 0 || m > n || n < 0) return 0;
        return fact[n] * inv[n - m] % MOD;
    }

};
```