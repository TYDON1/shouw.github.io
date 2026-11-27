---
title: "Tarjan割点与点双连通分量模版"
date: "2026-11-27 16:56:00"
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

## Tarjan割点与点双连通分量模版

无向图 Tarjan 算法求全部割点（Cut Vertices）、点双连通分量（VBCC），并直接支持构建圆方树（Block-Cut Tree）。

```cpp
struct TarjanVBCC {
    int n, timer;
    vector<vector<int>> adj;
    vector<int> dfn, low, st;
    vector<bool> is_cut;
    vector<vector<int>> vbcc; // 每个点双连通分量包含的节点集合

    TarjanVBCC(int n) : n(n), timer(0), adj(n + 1), dfn(n + 1, 0),
                        low(n + 1, 0), is_cut(n + 1, false) {}

    void add_edge(int u, int v) {
        if (u == v) return; // 忽略自环
        adj[u].push_back(v);
        adj[v].push_back(u);
    }

    void dfs(int u, int root) {
        dfn[u] = low[u] = ++timer;
        st.push_back(u);
        if (u == root && adj[u].empty()) {
            vbcc.push_back({u});
            st.pop_back();
            return;
        }
        int child = 0;
        for (int v : adj[u]) {
            if (!dfn[v]) {
                dfs(v, root);
                low[u] = min(low[u], low[v]);
                if (low[v] >= dfn[u]) {
                    child++;
                    if (u != root || child > 1) is_cut[u] = true;
                    vector<int> comp;
                    while (true) {
                        int x = st.back();
                        st.pop_back();
                        comp.push_back(x);
                        if (x == v) break;
                    }
                    comp.push_back(u);
                    vbcc.push_back(std::move(comp));
                }
            } else {
                low[u] = min(low[u], dfn[v]);
            }
        }
    }

    void build() {
        for (int i = 1; i <= n; i++) {
            if (!dfn[i]) {
                st.clear();
                dfs(i, i);
            }
        }
    }

    // 构建圆方树：圆点 1..n，方点 n+1..n+vbcc.size()
    vector<vector<int>> build_block_cut_tree() const {
        int m = vbcc.size();
        vector<vector<int>> tree(n + m + 1);
        for (int i = 0; i < m; i++) {
            int sq = n + i + 1;
            for (int u : vbcc[i]) {
                tree[sq].push_back(u);
                tree[u].push_back(sq);
            }
        }
        return tree;
    }
};
```
