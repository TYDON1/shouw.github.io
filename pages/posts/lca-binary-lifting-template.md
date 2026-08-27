---
title: "LCA倍增模版"
date: "2026-08-27 20:47:36"
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

## LCA倍增模版

```cpp
struct LCA {
    int n, LOG;
    vector<vector<int>> adj, anc;
    vector<int> dep;

    LCA(int n) : n(n), adj(n + 1), dep(n + 1) {
        LOG = 1;
        while ((1 << LOG) < n) LOG++;
        anc.assign(n + 1, vector<int>(LOG + 1, 0));
    }

    void add_edge(int u, int v) {
        adj[u].push_back(v);
        adj[v].push_back(u);
    }

    void dfs(int u, int p) {
        anc[u][0] = p;
        for (int i = 1; i <= LOG; i++) anc[u][i] = anc[anc[u][i - 1]][i - 1];
        for (int v : adj[u]) {
            if (v == p) continue;
            dep[v] = dep[u] + 1;
            dfs(v, u);
        }
    }

    void build(int root = 1) {
        dep[root] = 0;
        dfs(root, 0);
    }

    // 求 u 的 k 级祖先，若跳出树外返回 0
    int kth_ancestor(int u, int k) {
        for (int i = 0; i <= LOG && u; i++) {
            if (k & (1 << i)) u = anc[u][i];
        }
        return u;
    }

    int lca(int u, int v) {
        if (dep[u] < dep[v]) swap(u, v);
        u = kth_ancestor(u, dep[u] - dep[v]);
        if (u == v) return u;
        for (int i = LOG; i >= 0; i--) {
            if (anc[u][i] != anc[v][i]) {
                u = anc[u][i];
                v = anc[v][i];
            }
        }
        return anc[u][0];
    }

    int dist(int u, int v) {
        return dep[u] + dep[v] - 2 * dep[lca(u, v)];
    }
};
```
