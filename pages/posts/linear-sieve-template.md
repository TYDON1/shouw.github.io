---
title: "欧拉线性筛模版"
date: "2026-11-27 17:27:10"
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

## 欧拉线性筛模版

一次 $O(n)$ 线性筛同时预处理素数表 `primes`、最小质因子 `spf`、欧拉函数 $\varphi(n)$、莫比乌斯函数 $\mu(n)$ 与约数个数 $d(n)$，并支持 $O(\log n)$ 快速质因数分解。

```cpp
struct LinearSieve {
    int n;
    vector<int> primes, spf; // spf[x]: x 的最小质因子
    vector<int> phi, mu;     // 欧拉函数 φ(x)、莫比乌斯函数 μ(x)
    vector<int> d, min_cnt;  // 约数个数 d(x)、最小质因子的指数

    LinearSieve(int n) : n(n), spf(n + 1, 0), phi(n + 1, 0),
                         mu(n + 1, 0), d(n + 1, 0), min_cnt(n + 1, 0) {
        phi[1] = mu[1] = d[1] = 1;
        for (int i = 2; i <= n; i++) {
            if (!spf[i]) {
                spf[i] = i;
                primes.push_back(i);
                phi[i] = i - 1;
                mu[i] = -1;
                d[i] = 2;
                min_cnt[i] = 1;
            }
            for (int p : primes) {
                if (i * p > n) break;
                spf[i * p] = p;
                if (i % p == 0) {
                    phi[i * p] = phi[i] * p;
                    mu[i * p] = 0;
                    min_cnt[i * p] = min_cnt[i] + 1;
                    d[i * p] = d[i] / (min_cnt[i] + 1) * (min_cnt[i] + 2);
                    break;
                } else {
                    phi[i * p] = phi[i] * (p - 1);
                    mu[i * p] = -mu[i];
                    min_cnt[i * p] = 1;
                    d[i * p] = d[i] * 2;
                }
            }
        }
    }

    // 利用最小质因子在 O(log x) 内分解质因数，返回 {质因子, 指数}
    vector<pair<int, int>> factorize(int x) const {
        vector<pair<int, int>> res;
        while (x > 1) {
            int p = spf[x], c = 0;
            while (x % p == 0) { x /= p; c++; }
            res.emplace_back(p, c);
        }
        return res;
    }
};
```
