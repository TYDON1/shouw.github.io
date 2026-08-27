---
title: "树链剖分模版"
date: "2026-08-27 20:41:52"
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

## 树链剖分模版

```cpp
struct HLD {
    int n, timer;
    vector<vector<int>> adj;
    vector<int> par, dep, sz, top, dfn, big_son, rnk;

    HLD(int n) : n(n), timer(0), adj(n + 1), par(n + 1), dep(n + 1),
                 sz(n + 1), top(n + 1), dfn(n + 1), big_son(n + 1), rnk(n + 1) {}

    void add_edge(int u, int v) {
        adj[u].push_back(v);
        adj[v].push_back(u);
    }

    void dfs1(int u, int p, int d) {
        par[u] = p;
        dep[u] = d;
        sz[u] = 1;
        big_son[u] = 0;
        int max_sz = 0;
        for (int v : adj[u]) {
            if (v == p) continue;
            dfs1(v, u, d + 1);
            sz[u] += sz[v];
            if (sz[v] > max_sz) max_sz = sz[v], big_son[u] = v;
        }
    }

    void dfs2(int u, int tp) {
        top[u] = tp;
        dfn[u] = ++timer;
        rnk[timer] = u;
        if (big_son[u]) dfs2(big_son[u], tp);
        for (int v : adj[u]) {
            if (v == par[u] || v == big_son[u]) continue;
            dfs2(v, v);
        }
    }

    void build(int root = 1) {
        dfs1(root, 0, 1);
        dfs2(root, root);
    }

    int lca(int u, int v) {
        while (top[u] != top[v]) {
            if (dep[top[u]] < dep[top[v]]) swap(u, v);
            u = par[top[u]];
        }
        return dep[u] < dep[v] ? u : v;
    }

    // 将 u 到 v 路径拆成若干条重链，每条链对应 dfn 区间 [l, r]，交给 apply 处理（例如线段树区间操作）
    void path_query(int u, int v, function<void(int, int)> apply) {
        while (top[u] != top[v]) {
            if (dep[top[u]] < dep[top[v]]) swap(u, v);
            apply(dfn[top[u]], dfn[u]);
            u = par[top[u]];
        }
        if (dep[u] > dep[v]) swap(u, v);
        apply(dfn[u], dfn[v]);
    }

    // 子树 u 对应的 dfn 区间 [l, r]
    pair<int, int> subtree_range(int u) {
        return {dfn[u], dfn[u] + sz[u] - 1};
    }
};
```
