---
title: "欧拉序ST表LCA模版"
date: "2026-11-27 16:37:22"
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

## 欧拉序ST表LCA模版

采用 DFN 序 ST 表实现 $O(1)$ 在线查询 LCA：无需 $2n$ 长度的欧拉序，仅需 $n$ 长度的 ST 表，空间减半、常数极小。

```cpp
struct FastLCA {
    int n, LOG, timer;
    vector<vector<int>> adj;
    vector<int> dfn, dep;
    vector<vector<int>> st; // st[k][i] 存储 dfn 区间内父节点 dfn 最小的节点

    static int lg2(int x) { return 63 - __builtin_clzll(x); }

    FastLCA(int n) : n(n), LOG(lg2(max(1LL, n)) + 1), timer(0),
                     adj(n + 1), dfn(n + 1), dep(n + 1),
                     st(LOG, vector<int>(n + 1)) {}

    void add_edge(int u, int v) {
        adj[u].push_back(v);
        adj[v].push_back(u);
    }

    int better(int u, int v) const {
        return dfn[u] < dfn[v] ? u : v;
    }

    void dfs(int u, int p) {
        dfn[u] = ++timer;
        st[0][dfn[u]] = p;
        for (int v : adj[u]) {
            if (v == p) continue;
            dep[v] = dep[u] + 1;
            dfs(v, u);
        }
    }

    void build(int root = 1) {
        timer = 0;
        dep[root] = 0;
        dfs(root, root);
        for (int k = 1; k < LOG; k++) {
            int len = 1LL << (k - 1);
            for (int i = 1; i + (1LL << k) - 1 <= n; i++) {
                st[k][i] = better(st[k - 1][i], st[k - 1][i + len]);
            }
        }
    }

    // O(1) 查询 u 与 v 的最近公共祖先
    int lca(int u, int v) const {
        if (u == v) return u;
        int l = dfn[u], r = dfn[v];
        if (l > r) swap(l, r);
        l++; // 查询区间 [l + 1, r]
        int k = lg2(r - l + 1);
        return better(st[k][l], st[k][r - (1LL << k) + 1]);
    }

    int dist(int u, int v) const {
        return dep[u] + dep[v] - 2 * dep[lca(u, v)];
    }
};
```
