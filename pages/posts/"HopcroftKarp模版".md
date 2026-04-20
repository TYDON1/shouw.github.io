---
title: "HopcroftKarp模版"
date: "2026-04-20 15:51:19"
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
struct HopcroftKarp {
    const int INF = 1e9;

    int n, m; // n: 左部点数, m: 右部点数
    vector<vector<int>> adj; // 只需要存 左部点 -> 右部点 的有向边即可
    vector<int> match_u;     // 左部点 u 匹配到的右部点 v (为 0 表示未匹配)
    vector<int> match_v;     // 右部点 v 匹配到的左部点 u (为 0 表示未匹配)
    vector<int> dist;        // 跑分层图时的距离/层数

    // 默认点号从 1 开始：左侧集合 1~n，右侧集合 1~m
    HopcroftKarp(int n, int m) 
        : n(n), m(m), adj(n + 1), match_u(n + 1, 0), match_v(m + 1, 0), dist(n + 1) {}

    // 添加一条边：左部点 u 连向右部点 v
    void add_edge(int u, int v) {
        adj[u].push_back(v);
    }

    bool bfs() {
        queue<int> q;
        for (int u = 1; u <= n; ++u) {
            // 将所有未匹配的左部点作为起点放入队列，层数设为 0
            if (!match_u[u]) {
                dist[u] = 0;
                q.push(u);
            } else {
                dist[u] = INF;
            }
        }
        
        // 0 号点作为“虚拟未匹配点”（终点）
        dist[0] = INF;

        while (!q.empty()) {
            int u = q.front();
            q.pop();

            // 如果当前点所在的层数已经大于等于终点的层数，就没必要往下搜了
            if (dist[u] < dist[0]) {
                for (int v : adj[u]) {
                    // 如果这条边连向的右部点之前匹配的左部点 (match_v[v]) 还没被访问过
                    if (dist[match_v[v]] == INF) {
                        dist[match_v[v]] = dist[u] + 1;
                        q.push(match_v[v]);
                    }
                }
            }
        }
        // 如果终点 0 的距离被更新了，说明找到了至少一条增广路
        return dist[0] != INF;
    }

    bool dfs(int u) {
        if (u != 0) {
            for (int v : adj[u]) {
                // 必须严格满足层级关系
                if (dist[match_v[v]] == dist[u] + 1) {
                    // 递归寻找增广路
                    if (dfs(match_v[v])) {
                        match_v[v] = u;
                        match_u[u] = v;
                        return true;
                    }
                }
            }
            // 废点优化：和 Dinic 一样，如果把所有边都试了还找不到增广路，就把距离设为无穷大，封死这个点
            dist[u] = INF; 
            return false;
        }
        return true; // 走到了虚拟终点 0，说明成功找到增广路
    }

    int max_matching() {
        int matching = 0;
        // 只要还能通过 BFS 构建出含有增广路的分层图
        while (bfs()) {
            // 遍历所有未匹配的左部点，尝试通过 DFS 进行增广
            for (int u = 1; u <= n; ++u) {
                if (!match_u[u] && dfs(u)) {
                    matching++;
                }
            }
        }
        return matching;
    }
};
```