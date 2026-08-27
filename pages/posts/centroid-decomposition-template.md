---
title: "点分治模版"
date: "2026-08-27 21:32:44"
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

## 点分治模版

```cpp
struct CentroidDecomp {
    int n;
    vector<vector<pair<int, int>>> adj; // {to, weight}
    vector<int> sz, max_sub;
    vector<bool> removed;

    CentroidDecomp(int n) : n(n), adj(n + 1), sz(n + 1), max_sub(n + 1), removed(n + 1, false) {}

    void add_edge(int u, int v, int w = 1) {
        adj[u].push_back({v, w});
        adj[v].push_back({u, w});
    }

    void get_size(int u, int p) {
        sz[u] = 1;
        for (auto [v, w] : adj[u]) {
            if (v == p || removed[v]) continue;
            get_size(v, u);
            sz[u] += sz[v];
        }
    }

    int get_centroid(int u, int p, int tot) {
        max_sub[u] = 0;
        int res = 0;
        for (auto [v, w] : adj[u]) {
            if (v == p || removed[v]) continue;
            int r = get_centroid(v, u, tot);
            if (r) res = r;
            max_sub[u] = max(max_sub[u], sz[v]);
        }
        max_sub[u] = max(max_sub[u], tot - sz[u]);
        if (max_sub[u] * 2 <= tot) res = u;
        return res;
    }

    // process(centroid) 处理以 centroid 为分治中心的子问题（例如统计经过 centroid 的路径）
    void decompose(int u, function<void(int)> process) {
        get_size(u, -1);
        int c = get_centroid(u, -1, sz[u]);
        removed[c] = true;
        process(c);
        for (auto [v, w] : adj[c]) {
            if (!removed[v]) decompose(v, process);
        }
    }
};
```
