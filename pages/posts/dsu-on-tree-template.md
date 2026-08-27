---
title: "树上启发式合并模版"
date: "2026-08-27 21:40:07"
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

## 树上启发式合并模版

```cpp
// 例题：统计每个点子树内不同颜色的个数
struct DsuOnTree {
    int n, timer, cur_ans;
    vector<vector<int>> adj;
    vector<int> sz, big_son, dfn, rnk, par, col, cnt;

    DsuOnTree(int n, vector<int>& color) : n(n), timer(0), cur_ans(0), adj(n + 1), sz(n + 1),
        big_son(n + 1), dfn(n + 1), rnk(n + 1), par(n + 1), col(color), cnt(n + 1, 0) {}

    void add_edge(int u, int v) {
        adj[u].push_back(v);
        adj[v].push_back(u);
    }

    void dfs1(int u, int p) {
        par[u] = p;
        sz[u] = 1;
        big_son[u] = 0;
        dfn[u] = ++timer;
        rnk[timer] = u;
        int max_sz = 0;
        for (int v : adj[u]) {
            if (v == p) continue;
            dfs1(v, u);
            sz[u] += sz[v];
            if (sz[v] > max_sz) max_sz = sz[v], big_son[u] = v;
        }
    }

    void add(int u) {
        cnt[col[u]]++;
        if (cnt[col[u]] == 1) cur_ans++;
    }

    // dfs2: keep 表示是否保留 u 子树的贡献（重儿子传 true，其余传 false）
    void dfs2(int u, int p, bool keep, vector<int>& ans) {
        for (int v : adj[u]) {
            if (v == p || v == big_son[u]) continue;
            dfs2(v, u, false, ans);
        }
        if (big_son[u]) dfs2(big_son[u], u, true, ans);

        add(u);
        for (int v : adj[u]) {
            if (v == p || v == big_son[u]) continue;
            for (int i = dfn[v]; i < dfn[v] + sz[v]; i++) add(rnk[i]);
        }

        ans[u] = cur_ans;

        if (!keep) {
            for (int i = dfn[u]; i < dfn[u] + sz[u]; i++) cnt[col[rnk[i]]]--;
            cur_ans = 0;
        }
    }

    vector<int> solve(int root = 1) {
        dfs1(root, 0);
        vector<int> ans(n + 1);
        dfs2(root, 0, false, ans);
        return ans;
    }
};
```
