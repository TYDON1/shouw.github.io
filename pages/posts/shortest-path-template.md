---
title: "最短路全家桶模版"
date: "2026-11-27 16:49:45"
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

## 最短路全家桶模版

汇总竞赛最常用的四大最短路算法：堆优化 Dijkstra（非负权）、0-1 BFS（0/1 边权）、SPFA 判负环与 Floyd 全源最短路 / 最小环。

```cpp
struct ShortestPath {
    static constexpr int INF = 4e18;
    int n;
    vector<vector<pair<int, int>>> adj; // {v, w}, 1-based

    ShortestPath(int n) : n(n), adj(n + 1) {}

    void add_edge(int u, int v, int w) {
        adj[u].emplace_back(v, w);
    }

    // 1. 堆优化 Dijkstra（非负边权）
    vector<int> dijkstra(int s) const {
        vector<int> dist(n + 1, INF);
        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;
        dist[s] = 0;
        pq.emplace(0, s);
        while (!pq.empty()) {
            auto [d, u] = pq.top();
            pq.pop();
            if (d > dist[u]) continue;
            for (auto [v, w] : adj[u]) {
                if (dist[u] + w < dist[v]) {
                    dist[v] = dist[u] + w;
                    pq.emplace(dist[v], v);
                }
            }
        }
        return dist;
    }

    // 2. 0-1 BFS（边权仅为 0 或 1），O(n + m)
    vector<int> bfs01(int s) const {
        vector<int> dist(n + 1, INF);
        deque<int> dq;
        dist[s] = 0;
        dq.push_front(s);
        while (!dq.empty()) {
            int u = dq.front();
            dq.pop_front();
            for (auto [v, w] : adj[u]) {
                if (dist[u] + w < dist[v]) {
                    dist[v] = dist[u] + w;
                    if (w == 0) dq.push_front(v);
                    else dq.push_back(v);
                }
            }
        }
        return dist;
    }

    // 3. SPFA 检测全图是否存在负环（超级源点：所有点初始入队）
    bool has_neg_cycle() const {
        vector<int> dist(n + 1, 0), cnt(n + 1, 0);
        vector<bool> inq(n + 1, true);
        queue<int> q;
        for (int i = 1; i <= n; i++) q.push(i);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            inq[u] = false;
            for (auto [v, w] : adj[u]) {
                if (dist[u] + w < dist[v]) {
                    dist[v] = dist[u] + w;
                    cnt[v] = cnt[u] + 1;
                    if (cnt[v] >= n) return true;
                    if (!inq[v]) {
                        inq[v] = true;
                        q.push(v);
                    }
                }
            }
        }
        return false;
    }

    // 4. Floyd 全源最短路 + 无向正权图最小环（传入邻接矩阵 g[1..n][1..n]，无边设为 INF）
    static pair<vector<vector<int>>, int> floyd_min_cycle(int n, const vector<vector<int>>& g) {
        auto d = g;
        int min_cycle = INF;
        for (int k = 1; k <= n; k++) {
            for (int i = 1; i < k; i++) {
                if (g[i][k] >= INF) continue;
                for (int j = i + 1; j < k; j++) {
                    if (g[k][j] < INF && d[i][j] < INF) {
                        min_cycle = min(min_cycle, d[i][j] + g[i][k] + g[k][j]);
                    }
                }
            }
            for (int i = 1; i <= n; i++) {
                if (d[i][k] >= INF) continue;
                for (int j = 1; j <= n; j++) {
                    if (d[k][j] < INF) d[i][j] = min(d[i][j], d[i][k] + d[k][j]);
                }
            }
        }
        return {d, min_cycle};
    }
};
```
