---
title: "长链剖分模版"
date: "2026-08-27 21:48:33"
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

## 长链剖分模版

```cpp
// O(n log n) 预处理，O(1) 查询 k 级祖先
struct LongPathDecomp {
    int n, LOG;
    vector<vector<int>> adj, jump, up, down;
    vector<int> dep, len, big_son, top, par;

    LongPathDecomp(int n) : n(n), adj(n + 1), dep(n + 1), len(n + 1),
                             big_son(n + 1), top(n + 1), par(n + 1) {}

    void add_edge(int u, int v) {
        adj[u].push_back(v);
        adj[v].push_back(u);
    }

    void dfs1(int u, int p) {
        par[u] = p;
        len[u] = 0;
        big_son[u] = 0;
        for (int v : adj[u]) {
            if (v == p) continue;
            dep[v] = dep[u] + 1;
            dfs1(v, u);
            if (len[v] + 1 > len[u]) {
                len[u] = len[v] + 1;
                big_son[u] = v;
            }
        }
    }

    void dfs2(int u, int tp) {
        top[u] = tp;
        if (big_son[u]) dfs2(big_son[u], tp);
        for (int v : adj[u]) {
            if (v == par[u] || v == big_son[u]) continue;
            dfs2(v, v);
        }
    }

    void build(int root = 1) {
        dep[root] = 0;
        dfs1(root, 0);
        dfs2(root, root);

        LOG = 1;
        while ((1 << LOG) <= n) LOG++;
        jump.assign(n + 1, vector<int>(LOG, 0));
        for (int i = 1; i <= n; i++) jump[i][0] = par[i];
        for (int j = 1; j < LOG; j++)
            for (int i = 1; i <= n; i++)
                jump[i][j] = jump[jump[i][j - 1]][j - 1];

        // up[t]: 链顶 t 向上 len[t] 步的祖先序列；down[t]: 链顶 t 向下 len[t] 步的重链序列
        up.assign(n + 1, {});
        down.assign(n + 1, {});
        for (int u = 1; u <= n; u++) {
            if (top[u] != u) continue;
            up[u].resize(len[u] + 1);
            down[u].resize(len[u] + 1);
            int x = u;
            for (int j = 0; j <= len[u] && x; j++) {
                up[u][j] = x;
                x = par[x];
            }
            x = u;
            for (int j = 0; j <= len[u] && x; j++) {
                down[u][j] = x;
                x = big_son[x];
            }
        }
    }

    // 求 u 的 k 级祖先
    int kth_ancestor(int u, int k) {
        if (k == 0) return u;
        int i = __lg(k);
        u = jump[u][i];
        k -= (1 << i);
        if (k == 0) return u;

        int t = top[u], d = dep[u] - dep[t];
        if (k <= d) return down[t][d - k];
        return up[t][k - d];
    }
};
```
