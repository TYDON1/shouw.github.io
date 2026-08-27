---
title: "自适应Simpson积分模版"
date: "2026-08-27 22:29:14"
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

## 自适应Simpson积分模版

```cpp
struct AdaptiveSimpson {
    function<double(double)> f;

    AdaptiveSimpson(function<double(double)> func) : f(func) {}

    double simpson(double l, double r) {
        double mid = (l + r) / 2;
        return (r - l) * (f(l) + 4 * f(mid) + f(r)) / 6;
    }

    // S: 区间 [l, r] 已算好的 simpson 估值，避免重复求值
    double solve(double l, double r, double eps, double S) {
        double mid = (l + r) / 2;
        double L = simpson(l, mid), R = simpson(mid, r);
        if (fabs(L + R - S) <= 15 * eps) return L + R + (L + R - S) / 15;
        return solve(l, mid, eps / 2, L) + solve(mid, r, eps / 2, R);
    }

    double integrate(double l, double r, double eps = 1e-8) {
        return solve(l, r, eps, simpson(l, r));
    }
};
```
