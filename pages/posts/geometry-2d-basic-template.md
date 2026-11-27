---
title: "二维计算几何基础模版"
date: "2026-11-27 17:58:30"
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

## 二维计算几何基础模版

二维平面计算几何核心基础库：封装 `Point` / `Vec`、`Line` / `Seg`，涵盖点积、叉积、向量旋转、极角排序、直线交点、线段相交判定与点到直线/线段距离。

```cpp
namespace Geo {
    using db = long double;
    static constexpr db EPS = 1e-9;
    static constexpr db PI = 3.1415926535897932384626433832795L;

    inline int sgn(db x) { return x < -EPS ? -1 : (x > EPS ? 1 : 0); }
    inline int cmp(db a, db b) { return sgn(a - b); }

    struct Point {
        db x, y;
        Point(db x = 0, db y = 0) : x(x), y(y) {}
        Point operator+(const Point& o) const { return {x + o.x, y + o.y}; }
        Point operator-(const Point& o) const { return {x - o.x, y - o.y}; }
        Point operator*(db k) const { return {x * k, y * k}; }
        Point operator/(db k) const { return {x / k, y / k}; }
        bool operator==(const Point& o) const { return cmp(x, o.x) == 0 && cmp(y, o.y) == 0; }
        bool operator<(const Point& o) const {
            int c = cmp(x, o.x);
            return c != 0 ? c < 0 : cmp(y, o.y) < 0;
        }
    };
    using Vec = Point;

    inline db dot(const Vec& a, const Vec& b) { return a.x * b.x + a.y * b.y; }
    inline db cross(const Vec& a, const Vec& b) { return a.x * b.y - a.y * b.x; }
    inline db norm2(const Vec& a) { return dot(a, a); }
    inline db len(const Vec& a) { return sqrtl(norm2(a)); }
    inline db dist(const Point& a, const Point& b) { return len(a - b); }

    // 逆时针旋转 rad 弧度
    inline Vec rotate(const Vec& a, db rad) {
        db c = cosl(rad), s = sinl(rad);
        return {a.x * c - a.y * s, a.x * s + a.y * c};
    }

    // 上半平面判定（极角排序：无 atan2 精度损失）
    inline int half(const Vec& p) {
        return sgn(p.y) > 0 || (sgn(p.y) == 0 && sgn(p.x) > 0) ? 0 : 1;
    }
    inline bool polar_cmp(const Vec& a, const Vec& b) {
        int ha = half(a), hb = half(b);
        if (ha != hb) return ha < hb;
        return sgn(cross(a, b)) > 0;
    }

    // 点 p 是否在线段 ab 上（含端点）
    inline bool on_segment(const Point& p, const Point& a, const Point& b) {
        return sgn(cross(p - a, b - a)) == 0 && sgn(dot(p - a, p - b)) <= 0;
    }

    // 两线段 ab 与 cd 是否相交（含端点与共线重叠）
    inline bool seg_intersect(const Point& a, const Point& b, const Point& c, const Point& d) {
        int c1 = sgn(cross(b - a, c - a)), c2 = sgn(cross(b - a, d - a));
        int c3 = sgn(cross(d - c, a - c)), c4 = sgn(cross(d - c, b - c));
        if (c1 * c2 < 0 && c3 * c4 < 0) return true;
        return on_segment(c, a, b) || on_segment(d, a, b) ||
               on_segment(a, c, d) || on_segment(b, c, d);
    }

    // 两直线 (p + t*v) 与 (q + s*w) 的交点（需保证不平行：sgn(cross(v, w)) != 0）
    inline Point line_intersection(const Point& p, const Vec& v, const Point& q, const Vec& w) {
        db t = cross(q - p, w) / cross(v, w);
        return p + v * t;
    }

    // 点 p 在直线 ab 上的投影点
    inline Point proj_point(const Point& p, const Point& a, const Point& b) {
        Vec v = b - a;
        return a + v * (dot(p - a, v) / norm2(v));
    }

    // 点 p 到直线 ab 的距离
    inline db dist_point_line(const Point& p, const Point& a, const Point& b) {
        return fabsl(cross(b - a, p - a)) / len(b - a);
    }

    // 点 p 到线段 ab 的最短距离
    inline db dist_point_seg(const Point& p, const Point& a, const Point& b) {
        if (a == b) return dist(p, a);
        if (sgn(dot(b - a, p - a)) < 0) return dist(p, a);
        if (sgn(dot(a - b, p - b)) < 0) return dist(p, b);
        return dist_point_line(p, a, b);
    }
}
```
