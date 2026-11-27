---
title: "半平面交模版"
date: "2026-11-27 18:17:19"
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

## 半平面交模版

给定若干有向直线（默认保留每条直线左侧半平面），使用极角排序 + 双端队列在 $O(n \log n)$ 时间内求出半平面交构成的凸多边形（如多边形的核）。

```cpp
struct HalfPlaneIntersection {
    using db = long double;
    static constexpr db EPS = 1e-9;

    struct P {
        db x, y;
        P operator+(const P& o) const { return {x + o.x, y + o.y}; }
        P operator-(const P& o) const { return {x - o.x, y - o.y}; }
        P operator*(db k) const { return {x * k, y * k}; }
    };

    struct Line {
        P p, v; // 过点 p，方向向量 v，有效区域在其左侧
        db ang;
        Line(P a, P b) : p(a), v(b - a), ang(atan2l(v.y, v.x)) {}
    };

    static int sgn(db x) { return x < -EPS ? -1 : (x > EPS ? 1 : 0); }
    static db cross(const P& a, const P& b) { return a.x * b.y - a.y * b.x; }

    // 判断点 q 是否严格在有向直线 L 的右侧
    static bool on_right(const Line& L, const P& q) {
        return sgn(cross(L.v, q - L.p)) < 0;
    }

    static P intersect(const Line& a, const Line& b) {
        db t = cross(b.p - a.p, b.v) / cross(a.v, b.v);
        return a.p + a.v * t;
    }

    // 返回半平面交构成的逆时针凸多边形顶点；若交为空返回空 vector
    static vector<P> solve(vector<Line> lines) {
        sort(lines.begin(), lines.end(), [](const Line& a, const Line& b) {
            if (fabsl(a.ang - b.ang) > EPS) return a.ang < b.ang;
            // 平行同向直线，保留更靠左的一条排在后面以便去重覆盖
            return cross(a.v, b.p - a.p) > 0;
        });

        // 平行同向直线去重，仅留最左的一条
        vector<Line> uniq;
        for (const auto& L : lines) {
            if (!uniq.empty() && fabsl(uniq.back().ang - L.ang) <= EPS) {
                uniq.back() = L;
            } else {
                uniq.push_back(L);
            }
        }

        deque<Line> dq;
        deque<P> pts; // pts[i] = intersect(dq[i], dq[i + 1])
        for (const auto& L : uniq) {
            while (!pts.empty() && on_right(L, pts.back())) {
                dq.pop_back();
                pts.pop_back();
            }
            while (!pts.empty() && on_right(L, pts.front())) {
                dq.pop_front();
                pts.pop_front();
            }
            if (!dq.empty()) {
                // 检测反向平行且交为空的情况
                if (sgn(cross(dq.back().v, L.v)) == 0) {
                    if (sgn(cross(dq.back().v, L.p - dq.back().p)) <= 0) return {};
                }
                pts.push_back(intersect(dq.back(), L));
            }
            dq.push_back(L);
        }
        while (!pts.empty() && on_right(dq.front(), pts.back())) {
            dq.pop_back();
            pts.pop_back();
        }
        while (!pts.empty() && on_right(dq.back(), pts.front())) {
            dq.pop_front();
            pts.pop_front();
        }
        if (dq.size() < 3) return {};

        pts.push_back(intersect(dq.back(), dq.front()));
        return vector<P>(pts.begin(), pts.end());
    }

    static db area(const vector<P>& poly) {
        db s = 0;
        int n = poly.size();
        for (int i = 0; i < n; i++) s += cross(poly[i], poly[(i + 1) % n]);
        return fabsl(s) * 0.5L;
    }
};
```
