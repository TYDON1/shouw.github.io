---
title: "莫比乌斯反演与杜教筛模版"
date: "2026-11-27 17:33:25"
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

## 莫比乌斯反演与杜教筛模版

### 核心反演公式

- 核心性质：$\sum_{d \mid n} \mu(d) = [n = 1]$，即 $\mu * 1 = \varepsilon$。
- **因数形式**：$f(n) = \sum_{d \mid n} g(d) \iff g(n) = \sum_{d \mid n} \mu(d) f\left(\frac{n}{d}\right)$。
- **倍数形式**：$f(n) = \sum_{n \mid d} g(d) \iff g(n) = \sum_{n \mid d} \mu\left(\frac{d}{n}\right) f(d)$。
- **杜教筛核心**：若 $h = f * g$，则 $g(1)S_f(n) = S_h(n) - \sum_{d=2}^{n} g(d) S_f\left(\lfloor \frac{n}{d} \rfloor\right)$。

```cpp
struct MobiusSieve {
    int limit;
    vector<int> primes, mu, phi, pre_mu, pre_phi;
    vector<bool> vis;
    unordered_map<int, int> memo_mu, memo_phi;

    // 预处理到 limit（若用杜教筛求 n <= 2e9 的前缀和，建议 limit = 1.5e6 ~ 2e6）
    MobiusSieve(int lim = 1000000) : limit(lim), mu(lim + 1), phi(lim + 1),
                                    pre_mu(lim + 1), pre_phi(lim + 1), vis(lim + 1) {
        mu[1] = phi[1] = 1;
        for (int i = 2; i <= limit; i++) {
            if (!vis[i]) {
                primes.push_back(i);
                mu[i] = -1;
                phi[i] = i - 1;
            }
            for (int p : primes) {
                if (i * p > limit) break;
                vis[i * p] = true;
                if (i % p == 0) {
                    mu[i * p] = 0;
                    phi[i * p] = phi[i] * p;
                    break;
                } else {
                    mu[i * p] = -mu[i];
                    phi[i * p] = phi[i] * (p - 1);
                }
            }
        }
        for (int i = 1; i <= limit; i++) {
            pre_mu[i] = pre_mu[i - 1] + mu[i];
            pre_phi[i] = pre_phi[i - 1] + phi[i];
        }
    }

    // 杜教筛：O(n^(2/3)) 求 ∑_{i=1..n} μ(i)（利用 μ * 1 = ε）
    int sum_mu(int n) {
        if (n <= limit) return pre_mu[n];
        auto it = memo_mu.find(n);
        if (it != memo_mu.end()) return it->second;
        int res = 1;
        for (int l = 2, r; l <= n; l = r + 1) {
            r = n / (n / l);
            res -= (r - l + 1) * sum_mu(n / l);
        }
        return memo_mu[n] = res;
    }

    // 杜教筛：O(n^(2/3)) 求 ∑_{i=1..n} φ(i)（利用 φ * 1 = id）
    int sum_phi(int n) {
        if (n <= limit) return pre_phi[n];
        auto it = memo_phi.find(n);
        if (it != memo_phi.end()) return it->second;
        int res = (__int128)n * (n + 1) / 2;
        for (int l = 2, r; l <= n; l = r + 1) {
            r = n / (n / l);
            res -= (r - l + 1) * sum_phi(n / l);
        }
        return memo_phi[n] = res;
    }

    // 整除分块 O(√n)：统计 1<=i<=n, 1<=j<=m 中 gcd(i, j) == k 的数对个数
    int count_gcd_eq(int n, int m, int k) {
        n /= k;
        m /= k;
        int up = min(n, m), ans = 0;
        for (int l = 1, r; l <= up; l = r + 1) {
            r = min(n / (n / l), m / (m / l));
            ans += (sum_mu(r) - sum_mu(l - 1)) * (n / l) * (m / l);
        }
        return ans;
    }

    // 整除分块 O(√n)：求 ∑_{i=1..n} ∑_{j=1..m} gcd(i, j)（利用 ∑_{d|g} φ(d) = g）
    int sum_gcd(int n, int m) {
        int up = min(n, m), ans = 0;
        for (int l = 1, r; l <= up; l = r + 1) {
            r = min(n / (n / l), m / (m / l));
            ans += (sum_phi(r) - sum_phi(l - 1)) * (n / l) * (m / l);
        }
        return ans;
    }
};
```
