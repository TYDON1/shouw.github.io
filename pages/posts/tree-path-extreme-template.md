---
title: "树上两点最值模版"
date: "2026-04-23 22:17:27"
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

```cpp
struct TreePathQuery {
    int n, LOG;
    vector<int> dep;
    vector<vector<int>> fa, max_odd, max_even;

    // 构造函数传入节点数 n 和建好的树 adj (1-indexed)
    // adj 的格式为：vector<vector<pair<int, int>>>，存储 {子节点, 边权}
    TreePathQuery(int n, const vector<vector<pair<int, int>>>& adj, int root = 1) {
        this->n = n;
        this->LOG = 20; // 2^20 > 2e5，足够覆盖绝大多数题目

        dep.assign(n + 1, 0);
        fa.assign(n + 1, vector<int>(LOG + 1, 0));
        max_odd.assign(n + 1, vector<int>(LOG + 1, -1));
        max_even.assign(n + 1, vector<int>(LOG + 1, -1));

        // 内部 Lambda 函数进行 DFS 预处理
        auto dfs = [&](auto self, int u, int p, int w) -> void {
            dep[u] = dep[p] + 1;
            fa[u][0] = p;
            
            if (w % 2 != 0) max_odd[u][0] = w;
            else if (w != 0) max_even[u][0] = w; // 排除根节点的虚拟 0 边权

            for (int i = 1; i <= LOG; i++) {
                fa[u][i] = fa[ fa[u][i-1] ][i-1];
                max_odd[u][i] = max(max_odd[u][i-1], max_odd[ fa[u][i-1] ][i-1]);
                max_even[u][i] = max(max_even[u][i-1], max_even[ fa[u][i-1] ][i-1]);
            }

            for (auto edge : adj[u]) {
                int v = edge.first;
                int weight = edge.second;
                if (v != p) {
                    self(self, v, u, weight);
                }
            }
        };

        dfs(dfs, root, 0, 0);
    }

    // 查询 u 到 v 路径上的最值
    // 返回 pair<int, int> = {最大奇数边权, 最大偶数边权}，若不存在则对应值为 -1
    pair<int, int> query(int u, int v) {
        int res_odd = -1, res_even = -1;
        if (dep[u] < dep[v]) swap(u, v);

        for (int i = LOG; i >= 0; i--) {
            if (dep[u] - (1 << i) >= dep[v]) {
                res_odd = max(res_odd, max_odd[u][i]);
                res_even = max(res_even, max_even[u][i]);
                u = fa[u][i];
            }
        }

        if (u == v) return {res_odd, res_even};

        for (int i = LOG; i >= 0; i--) {
            if (fa[u][i] != fa[v][i]) {
                res_odd = max({res_odd, max_odd[u][i], max_odd[v][i]});
                res_even = max({res_even, max_even[u][i], max_even[v][i]});
                u = fa[u][i];
                v = fa[v][i];
            }
        }

        res_odd = max({res_odd, max_odd[u][0], max_odd[v][0]});
        res_even = max({res_even, max_even[u][0], max_even[v][0]});
        
        return {res_odd, res_even};
    }
};
```