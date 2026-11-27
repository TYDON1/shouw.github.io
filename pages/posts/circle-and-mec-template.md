---
title: "圆与最小圆覆盖模版"
date: "2026-11-27 18:23:36"
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

## 圆与最小圆覆盖模版

包含随机增量法期望 $O(n)$ 最小圆覆盖（Minimum Enclosing Circle）、两圆面积交以及直线与圆交点。

```cpp
struct CircleGeo {
    using db = long double;
    static constexpr db EPS = 1e-9;
    static constexpr db PI = 3.1415926535897932384626433832795L;

    struct P {
        db x, y;
        P operator+(const P& o) const { return {x + o.x, y + o.y}; }
        P operator-(const P& o) const { return {x - o.x, y - o.y}; }
        P operator*(db k) const { return {x * k, y * k}; }
        P operator/(db k) const { return {x / k, y / k}; }
    };
    struct Circle { P o; db r; };

    static db dot(const P& a, const P& b) { return a.x * b.x + a.y * b.y; }
    static db cross(const P& a, const P& b) { return a.x * b.y - a.y * b.x; }
    static db dist(const P& a, const P& b) { return hypotl(a.x - b.x, a.y - b.y); }
    static bool in_circle(const Circle& c, const P& p) { return dist(c.o, p) <= c.r + EPS; }

    static Circle circle_from_2(const P& a, const P& b) {
        return {(a + b) * 0.5L, dist(a, b) * 0.5L};
    }

    static Circle circle_from_3(const P& a, const P& b, const P& c) {
        db a1 = b.x - a.x, b1 = b.y - a.y, c1 = (a1 * a1 + b1 * b1) * 0.5L;
        db a2 = c.x - a.x, b2 = c.y - a.y, c2 = (a2 * a2 + b2 * b2) * 0.5L;
        db d = a1 * b2 - a2 * b1;
        if (fabsl(d) < EPS) {
            Circle c12 = circle_from_2(a, b);
            Circle c23 = circle_from_2(b, c);
            Circle c13 = circle_from_2(a, c);
            Circle best = c12.r > c23.r ? c12 : c23;
            return best.r > c13.r ? best : c13;
        }
        P o = {a.x + (c1 * b2 - c2 * b1) / d, a.y + (a1 * c2 - a2 * c1) / d};
        return {o, dist(o, a)};
    }

    // 随机增量法：期望 O(n) 求覆盖所有点的最小圆
    static Circle min_enclosing_circle(vector<P> pts) {
        if (pts.empty()) return {{0, 0}, 0};
        mt19937 rng(chrono::steady_clock::now().time_since_epoch().count());
        shuffle(pts.begin(), pts.end(), rng);
        Circle c = {pts[0], 0};
        int n = pts.size();
        for (int i = 1; i < n; i++) {
            if (in_circle(c, pts[i])) continue;
            c = {pts[i], 0};
            for (int j = 0; j < i; j++) {
                if (in_circle(c, pts[j])) continue;
                c = circle_from_2(pts[i], pts[j]);
                for (int k = 0; k < j; k++) {
                    if (in_circle(c, pts[k])) continue;
                    c = circle_from_3(pts[i], pts[j], pts[k]);
                }
            }
        }
        return c;
    }

    // 两圆面积交 O(1)
    static db circle_intersection_area(const Circle& a, const Circle& b) {
        db d = dist(a.o, b.o);
        if (d >= a.r + b.r - EPS) return 0;
        if (d <= fabsl(a.r - b.r) + EPS) {
            db r = min(a.r, b.r);
            return PI * r * r;
        }
        db ang1 = 2.0L * acosl(clamp((a.r * a.r + d * d - b.r * b.r) / (2.0L * a.r * d), -1.0L, 1.0L));
        db ang2 = 2.0L * acosl(clamp((b.r * b.r + d * d - a.r * a.r) / (2.0L * b.r * d), -1.0L, 1.0L));
        return 0.5L * a.r * a.r * (ang1 - sinl(ang1)) + 0.5L * b.r * b.r * (ang2 - sinl(ang2));
    }

    // 直线 ab 与圆 c 的交点（0、1 或 2 个）
    static vector<P> line_circle_inter(const P& a, const P& b, const Circle& c) {
        P v = b - a;
        db lv2 = dot(v, v);
        P proj = a + v * (dot(c.o - a, v) / lv2);
        db h2 = c.r * c.r - dot(c.o - proj, c.o - proj);
        if (h2 < -EPS) return {};
        if (h2 <= EPS) return {proj};
        P delta = v * sqrtl(h2 / lv2);
        return {proj - delta, proj + delta};
    }
};
```
