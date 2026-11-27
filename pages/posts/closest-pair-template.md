---
title: "平面最近点对模版"
date: "2026-11-27 18:29:50"
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

## 平面最近点对模版

经典分治算法在 $O(n \log n)$ 时间内求解二维平面 $n$ 个点的最近欧氏距离（返回距离平方，纯整数无精度误差）。

```cpp
struct ClosestPair {
    struct P {
        int x, y;
    };

    static int dist2(const P& a, const P& b) {
        int dx = a.x - b.x, dy = a.y - b.y;
        return dx * dx + dy * dy;
    }

    // 返回平面最近点对距离的平方（n >= 2）
    static int solve(vector<P> pts) {
        int n = pts.size();
        sort(pts.begin(), pts.end(), [](const P& a, const P& b) {
            return a.x != b.x ? a.x < b.x : a.y < b.y;
        });
        vector<P> tmp(n);
        int best = 4e18;

        auto dc = [&](auto& self, int l, int r) -> void {
            if (r - l <= 1) return;
            int mid = (l + r) >> 1;
            int mid_x = pts[mid].x;
            self(self, l, mid);
            self(self, mid, r);

            // 按 y 坐标归并排序
            merge(pts.begin() + l, pts.begin() + mid,
                  pts.begin() + mid, pts.begin() + r,
                  tmp.begin(),
                  [](const P& a, const P& b) { return a.y < b.y; });
            copy(tmp.begin(), tmp.begin() + (r - l), pts.begin() + l);

            // 筛选距离中线 x 距离小于 sqrt(best) 的条带点
            int cnt = 0;
            for (int i = l; i < r; i++) {
                int dx = pts[i].x - mid_x;
                if (dx * dx < best) tmp[cnt++] = pts[i];
            }
            for (int i = 0; i < cnt; i++) {
                for (int j = i + 1; j < cnt; j++) {
                    int dy = tmp[j].y - tmp[i].y;
                    if (dy * dy >= best) break;
                    best = min(best, dist2(tmp[i], tmp[j]));
                }
            }
        };

        dc(dc, 0, n);
        return best;
    }
};
```
