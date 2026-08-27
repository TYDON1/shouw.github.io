---
title: "虚树模版"
date: "2026-08-27 21:25:18"
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

## 虚树模版

```cpp
struct VirtualTree {
    int n, timer, LOG;
    vector<vector<int>> adj, vadj, anc;
    vector<int> dfn, dep, touched;

    VirtualTree(int n) : n(n), timer(0), adj(n + 1), vadj(n + 1), dfn(n + 1), dep(n + 1) {
        LOG = 1;
        while ((1 << LOG) < n) LOG++;
        anc.assign(n + 1, vector<int>(LOG + 1, 0));
    }

    void add_edge(int u, int v) {
        adj[u].push_back(v);
        adj[v].push_back(u);
    }

    void dfs(int u, int p) {
        dfn[u] = ++timer;
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

    int lca(int u, int v) {
        if (dep[u] < dep[v]) swap(u, v);
        int diff = dep[u] - dep[v];
        for (int i = 0; i <= LOG; i++) if (diff & (1 << i)) u = anc[u][i];
        if (u == v) return u;
        for (int i = LOG; i >= 0; i--) {
            if (anc[u][i] != anc[v][i]) {
                u = anc[u][i];
                v = anc[v][i];
            }
        }
        return anc[u][0];
    }

    void add_vedge(int u, int v) {
        vadj[u].push_back(v);
        touched.push_back(u);
    }

    // 给定关键点集合和树根，建出虚树，返回虚树的根；vadj[u] 存放虚树上 u 的儿子
    int build_virtual(vector<int> key_points, int root = 1) {
        for (int u : touched) vadj[u].clear();
        touched.clear();

        sort(key_points.begin(), key_points.end(), [&](int a, int b) {
            return dfn[a] < dfn[b];
        });

        vector<int> stk = {root};
        for (int u : key_points) {
            if (u == root) continue;
            int l = lca(u, stk.back());
            if (l != stk.back()) {
                while (stk.size() >= 2 && dep[stk[stk.size() - 2]] >= dep[l]) {
                    add_vedge(stk[stk.size() - 2], stk.back());
                    stk.pop_back();
                }
                if (stk.back() != l) {
                    add_vedge(l, stk.back());
                    stk.back() = l;
                }
            }
            stk.push_back(u);
        }
        while (stk.size() >= 2) {
            add_vedge(stk[stk.size() - 2], stk.back());
            stk.pop_back();
        }
        return root;
    }
};
```
