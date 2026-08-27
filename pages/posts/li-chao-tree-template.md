---
title: "李超线段树模版"
date: "2026-08-27 22:02:41"
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

## 李超线段树模版

```cpp
struct LiChaoTree {
    struct Line {
        int k, b;
        int eval(int x) { return k * x + b; }
    };

    int n;
    vector<Line> tree;
    vector<bool> has_line;

    // 值域为 [0, n)
    LiChaoTree(int n) : n(n), tree(4 * n + 1), has_line(4 * n + 1, false) {}

    void add_line(int v, int l, int r, Line line) {
        if (!has_line[v]) {
            tree[v] = line;
            has_line[v] = true;
            return;
        }
        int mid = (l + r) >> 1;
        bool left_better = line.eval(l) > tree[v].eval(l);
        bool mid_better = line.eval(mid) > tree[v].eval(mid);

        if (mid_better) swap(tree[v], line);
        if (l == r) return;

        if (left_better != mid_better) add_line(v * 2, l, mid, line);
        else add_line(v * 2 + 1, mid + 1, r, line);
    }

    void insert(Line line) {
        add_line(1, 0, n - 1, line);
    }

    int query(int v, int l, int r, int x) {
        if (!has_line[v]) return LLONG_MIN;
        int res = tree[v].eval(x);
        if (l == r) return res;
        int mid = (l + r) >> 1;
        if (x <= mid) res = max(res, query(v * 2, l, mid, x));
        else res = max(res, query(v * 2 + 1, mid + 1, r, x));
        return res;
    }

    // 求 x 处所有已插入直线的最大值
    int ask(int x) {
        return query(1, 0, n - 1, x);
    }
};
```
