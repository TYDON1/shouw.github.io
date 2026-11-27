---
title: "多边形与点定位模版"
date: "2026-11-27 18:04:45"
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

## 多边形与点定位模版

包含多边形有向面积、重心计算、任意简单多边形点定位（绕数法 $O(n)$），以及逆时针凸多边形 $O(\log n)$ 二分点定位。

```cpp
struct PolygonGeo {
    using db = long double;
    static constexpr db EPS = 1e-9;

    struct P {
        db x, y;
        P operator+(const P& o) const { return {x + o.x, y + o.y}; }
        P operator-(const P& o) const { return {x - o.x, y - o.y}; }
        P operator*(db k) const { return {x * k, y * k}; }
    };

    static int sgn(db x) { return x < -EPS ? -1 : (x > EPS ? 1 : 0); }
    static db dot(const P& a, const P& b) { return a.x * b.x + a.y * b.y; }
    static db cross(const P& a, const P& b) { return a.x * b.y - a.y * b.x; }
    static bool on_seg(const P& p, const P& a, const P& b) {
        return sgn(cross(p - a, b - a)) == 0 && sgn(dot(p - a, p - b)) <= 0;
    }

    // 多边形有向面积（逆时针为正）
    static db signed_area(const vector<P>& poly) {
        db s = 0;
        int n = poly.size();
        for (int i = 0; i < n; i++) {
            s += cross(poly[i], poly[(i + 1) % n]);
        }
        return s * 0.5L;
    }

    // 均质多边形重心
    static P centroid(const vector<P>& poly) {
        db s = 0, cx = 0, cy = 0;
        int n = poly.size();
        for (int i = 0; i < n; i++) {
            const P& a = poly[i], &b = poly[(i + 1) % n];
            db c = cross(a, b);
            s += c;
            cx += (a.x + b.x) * c;
            cy += (a.y + b.y) * c;
        }
        return {cx / (3.0L * s), cy / (3.0L * s)};
    }

    // 任意简单多边形点定位（绕数法 O(n)）：2=在边界，1=在内部，0=在外部
    static int point_in_polygon(const P& p, const vector<P>& poly) {
        int wn = 0, n = poly.size();
        for (int i = 0; i < n; i++) {
            const P& a = poly[i], &b = poly[(i + 1) % n];
            if (on_seg(p, a, b)) return 2;
            int k = sgn(cross(b - a, p - a));
            int d1 = sgn(a.y - p.y), d2 = sgn(b.y - p.y);
            if (k > 0 && d1 <= 0 && d2 > 0) wn++;
            if (k < 0 && d2 <= 0 && d1 > 0) wn--;
        }
        return wn != 0 ? 1 : 0;
    }

    // 逆时针严格凸多边形点定位（O(log n) 二分）：2=在边界，1=在内部，0=在外部
    static int point_in_convex(const P& p, const vector<P>& h) {
        int n = h.size();
        if (n < 3) {
            for (int i = 0; i < n; i++) if (on_seg(p, h[i], h[(i + 1) % n])) return 2;
            return 0;
        }
        int s1 = sgn(cross(h[1] - h[0], p - h[0]));
        int s2 = sgn(cross(h[n - 1] - h[0], p - h[0]));
        if (s1 < 0 || s2 > 0) return 0;
        if (s1 == 0) return on_seg(p, h[0], h[1]) ? 2 : 0;
        if (s2 == 0) return on_seg(p, h[0], h[n - 1]) ? 2 : 0;
        int l = 1, r = n - 2;
        while (l < r) {
            int mid = (l + r + 1) >> 1;
            if (sgn(cross(h[mid] - h[0], p - h[0])) >= 0) l = mid;
            else r = mid - 1;
        }
        int c = sgn(cross(h[l + 1] - h[l], p - h[l]));
        if (c < 0) return 0;
        return c == 0 ? 2 : 1;
    }
};
```
