---
title: "exgcd与中国剩余定理模版"
date: "2026-08-27 21:03:47"
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

## exgcd与中国剩余定理模版

```cpp
struct ExGCD {
    int exgcd(int a, int b, int& x, int& y) {
        if (b == 0) { x = 1; y = 0; return a; }
        int x1, y1;
        int g = exgcd(b, a % b, x1, y1);
        x = y1;
        y = x1 - (a / b) * y1;
        return g;
    }

    // 求 a 在模 m 下的逆元，不存在返回 -1
    int inverse(int a, int m) {
        int x, y;
        int g = exgcd(a, m, x, y);
        if (g != 1) return -1;
        return (x % m + m) % m;
    }

    // 中国剩余定理：x ≡ r[i] (mod m[i])，要求 m[i] 两两互质
    int crt(vector<int>& m, vector<int>& r) {
        int n = m.size(), M = 1, res = 0;
        for (int x : m) M *= x;
        for (int i = 0; i < n; i++) {
            int Mi = M / m[i];
            res = (res + r[i] * Mi % M * inverse(Mi, m[i]) % M) % M;
        }
        return (res % M + M) % M;
    }

    // 扩展中国剩余定理：模数不要求互质，无解返回 -1
    int excrt(vector<int>& m, vector<int>& r) {
        int n = m.size();
        int M = m[0], R = r[0];
        for (int i = 1; i < n; i++) {
            int x, y;
            int g = exgcd(M, m[i], x, y);
            int diff = ((r[i] - R) % m[i] + m[i]) % m[i];
            if (diff % g != 0) return -1;
            int lcm = M / g * m[i];
            x = (int)((__int128)x * (diff / g) % (m[i] / g));
            R = (int)(((__int128)M * x + R) % lcm);
            M = lcm;
            R = (R % M + M) % M;
        }
        return R;
    }
};
```
