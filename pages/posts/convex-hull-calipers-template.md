---
title: "凸包与旋转卡壳模版"
date: "2026-11-27 18:11:02"
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

## 凸包与旋转卡壳模版

使用 Andrew 单调链在 $O(n \log n)$ 内求二维点集凸包（纯整数无精度误差），并用旋转卡壳在 $O(n)$ 内求凸包直径（最远点对平方距离）。

```cpp
struct ConvexHull {
    struct P {
        int x, y;
        P operator-(const P& o) const { return {x - o.x, y - o.y}; }
        bool operator<(const P& o) const { return x != o.x ? x < o.x : y < o.y; }
        bool operator==(const P& o) const { return x == o.x && y == o.y; }
    };

    static int cross(const P& a, const P& b) { return a.x * b.y - a.y * b.x; }
    static int cross(const P& o, const P& a, const P& b) { return cross(a - o, b - o); }
    static int dist2(const P& a, const P& b) {
        int dx = a.x - b.x, dy = a.y - b.y;
        return dx * dx + dy * dy;
    }

    // Andrew 单调链求逆时针严格凸包（不含边上共线点）
    static vector<P> build(vector<P> pts) {
        sort(pts.begin(), pts.end());
        pts.erase(unique(pts.begin(), pts.end()), pts.end());
        int n = pts.size();
        if (n <= 2) return pts;

        vector<P> h;
        // 下凸壳
        for (int i = 0; i < n; i++) {
            while (h.size() >= 2 && cross(h[h.size() - 2], h.back(), pts[i]) <= 0) {
                h.pop_back();
            }
            h.push_back(pts[i]);
        }
        // 上凸壳
        size_t lower_sz = h.size();
        for (int i = n - 2; i >= 0; i--) {
            while (h.size() > lower_sz && cross(h[h.size() - 2], h.back(), pts[i]) <= 0) {
                h.pop_back();
            }
            h.push_back(pts[i]);
        }
        h.pop_back(); // 去掉重复的起点
        return h;
    }

    // 旋转卡壳 O(n) 求凸包直径（返回最远点对距离的平方）
    static int diameter_sq(const vector<P>& h) {
        int n = h.size();
        if (n <= 1) return 0;
        if (n == 2) return dist2(h[0], h[1]);
        int ans = 0;
        for (int i = 0, j = 1; i < n; i++) {
            int ni = (i + 1) % n;
            while (abs(cross(h[i], h[ni], h[(j + 1) % n])) >= abs(cross(h[i], h[ni], h[j]))) {
                j = (j + 1) % n;
                if (j == i) break;
            }
            ans = max(ans, max(dist2(h[i], h[j]), dist2(h[ni], h[j])));
        }
        return ans;
    }
};
```
