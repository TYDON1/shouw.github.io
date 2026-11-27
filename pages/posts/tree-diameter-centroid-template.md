---
title: "树的直径与重心模版"
date: "2026-11-27 16:31:10"
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

## 树的直径与重心模版

封装非负权树两次 DFS 求直径（含完整路径还原）以及求树的全部重心（至多 2 个）。若存在负边权求直径，应改用树形 DP。

```cpp
struct TreeBasic {
    int n;
    vector<vector<pair<int, int>>> adj; // {v, w}, 1-based

    TreeBasic(int n) : n(n), adj(n + 1) {}

    void add_edge(int u, int v, int w = 1) {
        adj[u].emplace_back(v, w);
        adj[v].emplace_back(u, w);
    }

    // 两次 DFS 求非负权树直径，返回 {长度, 直径路径节点列表}
    pair<int, vector<int>> diameter_nonneg() const {
        vector<int> dist(n + 1, -1), parent(n + 1, 0);
        auto dfs = [&](auto& self, int u, int p, int d) -> int {
            dist[u] = d;
            parent[u] = p;
            int far = u;
            for (auto [v, w] : adj[u]) {
                if (v == p) continue;
                int cand = self(self, v, u, d + w);
                if (dist[cand] > dist[far]) far = cand;
            }
            return far;
        };
        int s = dfs(dfs, 1, 0, 0);
        fill(dist.begin(), dist.end(), -1);
        int t = dfs(dfs, s, 0, 0);
        vector<int> path;
        for (int cur = t; cur != 0; cur = parent[cur]) path.push_back(cur);
        reverse(path.begin(), path.end());
        return {dist[t], path};
    }

    // 树形 DP 求任意边权（可含负权）树的直径长度
    int diameter_dp() const {
        int ans = 0;
        auto dfs = [&](auto& self, int u, int p) -> int {
            int best1 = 0, best2 = 0;
            for (auto [v, w] : adj[u]) {
                if (v == p) continue;
                int d = self(self, v, u) + w;
                if (d > best1) { best2 = best1; best1 = d; }
                else if (d > best2) { best2 = d; }
            }
            ans = max(ans, best1 + best2);
            return best1;
        };
        dfs(dfs, 1, 0);
        return ans;
    }

    // 求树的全部重心（1 个或 2 个）
    vector<int> centroids() const {
        vector<int> sz(n + 1, 0), res;
        auto dfs = [&](auto& self, int u, int p) -> void {
            sz[u] = 1;
            int max_part = 0;
            for (auto [v, w] : adj[u]) {
                if (v == p) continue;
                self(self, v, u);
                sz[u] += sz[v];
                max_part = max(max_part, sz[v]);
            }
            max_part = max(max_part, n - sz[u]);
            if (max_part * 2 <= n) res.push_back(u);
        };
        dfs(dfs, 1, 0);
        return res;
    }
};
```
