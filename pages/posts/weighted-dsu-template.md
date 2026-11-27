---
title: "带权并查集模版"
date: "2026-11-27 16:18:40"
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

## 带权并查集模版

维护每个节点到根节点的势能差 `w[x] = val[x] - val[root]`，支持一致性检验、查询任意两点差值，以及异或/模意义种类关系。

```cpp
struct WeightedDSU {
    vector<int> fa;
    vector<int> w; // w[x] = pot[x] - pot[fa[x]]

    WeightedDSU(int n = 0) : fa(n + 1), w(n + 1, 0) {
        iota(fa.begin(), fa.end(), 0);
    }

    int find(int x) {
        if (fa[x] == x) return x;
        int r = find(fa[x]);
        w[x] += w[fa[x]];
        return fa[x] = r;
    }

    // 返回 pot[x] - pot[find(x)]
    int weight(int x) {
        find(x);
        return w[x];
    }

    bool connected(int u, int v) {
        return find(u) == find(v);
    }

    // 添加约束：pot[u] - pot[v] = d；若矛盾返回 false
    bool unite(int u, int v, int d) {
        int ru = find(u), rv = find(v);
        if (ru == rv) {
            return (w[u] - w[v] == d);
        }
        // 使 pot[ru] - pot[rv] = d - w[u] + w[v]
        fa[ru] = rv;
        w[ru] = d - w[u] + w[v];
        return true;
    }

    // 查询 pot[u] - pot[v]（调用前需保证 connected(u, v)）
    int diff(int u, int v) {
        find(u);
        find(v);
        return w[u] - w[v];
    }
};
```
