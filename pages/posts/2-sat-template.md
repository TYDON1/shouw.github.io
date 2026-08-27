---
title: "2-SAT模版"
date: "2026-08-27 21:17:52"
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

## 2-SAT模版

```cpp
struct TwoSAT {
    int n;
    vector<vector<int>> adj, radj;
    vector<int> order, comp;
    vector<bool> vis;

    // n: 变量个数，节点 2*i 表示 xi = false，2*i+1 表示 xi = true
    TwoSAT(int n) : n(n), adj(2 * n), radj(2 * n), comp(2 * n, -1), vis(2 * n, false) {}

    void add_edge(int u, int v) {
        adj[u].push_back(v);
        radj[v].push_back(u);
    }

    // 添加子句：xi 取值 vi 或 xj 取值 vj 至少一个成立
    void add_clause(int i, bool vi, int j, bool vj) {
        add_edge(2 * i + !vi, 2 * j + vj);
        add_edge(2 * j + !vj, 2 * i + vi);
    }

    void dfs1(int u) {
        vis[u] = true;
        for (int v : adj[u]) if (!vis[v]) dfs1(v);
        order.push_back(u);
    }

    void dfs2(int u, int c) {
        comp[u] = c;
        for (int v : radj[u]) if (comp[v] == -1) dfs2(v, c);
    }

    // 返回是否有解，有解时 assign[i] 即为 xi 的取值
    bool solve(vector<bool>& assign) {
        for (int i = 0; i < 2 * n; i++) if (!vis[i]) dfs1(i);
        int c = 0;
        for (int i = 2 * n - 1; i >= 0; i--) {
            int u = order[i];
            if (comp[u] == -1) dfs2(u, c++);
        }
        assign.resize(n);
        for (int i = 0; i < n; i++) {
            if (comp[2 * i] == comp[2 * i + 1]) return false;
            assign[i] = comp[2 * i + 1] > comp[2 * i];
        }
        return true;
    }
};
```
