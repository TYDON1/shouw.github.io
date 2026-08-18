---
title: "MCMF模版"
date: "2026-04-14 11:51:18"
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
struct MCMF {
    const int INF = 1e9;
    struct Edge {
        int to, cap, cost, rev;
    };

    vector<vector<Edge>> adj;
    vector<int> dist;      // 距离数组，跑 SPFA 用
    vector<int> ptr_edge;  // 记录路径：前驱边
    vector<int> ptr_node;  // 记录路径：前驱节点
    vector<bool> in_que;   // SPFA 队列标记

    MCMF(int n) : adj(n), dist(n), ptr_edge(n), ptr_node(n), in_que(n) {}

    // 添加有向边：u -> v, 容量 c, 单位费用 w
    void add_edge(int u, int v, int c, int w) {
        adj[u].push_back({v, c, w, (int)adj[v].size()});
        adj[v].push_back({u, 0, -w, (int)adj[u].size() - 1}); // 反向边费用为负
    }

    // 用 SPFA 寻找单位费用最低的路径
    bool spfa(int s, int t) {
        fill(dist.begin(), dist.end(), INF);
        fill(in_que.begin(), in_que.end(), false);
        queue<int> q;

        dist[s] = 0;
        q.push(s);
        in_que[s] = true;

        while (!q.empty()) {
            int u = q.front();
            q.pop();
            in_que[u] = false;

            for (int i = 0; i < adj[u].size(); i++) {
                Edge &e = adj[u][i];
                if (e.cap > 0 && dist[e.to] > dist[u] + e.cost) {
                    dist[e.to] = dist[u] + e.cost;
                    ptr_node[e.to] = u;
                    ptr_edge[e.to] = i;
                    if (!in_que[e.to]) {
                        q.push(e.to);
                        in_que[e.to] = true;
                    }
                }
            }
        }
        return dist[t] != INF;
    }

    // 返回一个 pair: {最大流量, 最小费用}
    pair<int, int> solve(int s, int t) {
        int max_flow = 0, min_cost = 0;
        while (spfa(s, t)) {
            // 找到当前路径上的最小剩余容量
            int push = INF;
            for (int curr = t; curr != s; curr = ptr_node[curr]) {
                push = min(push, adj[ptr_node[curr]][ptr_edge[curr]].cap);
            }

            // 更新流量和费用
            max_flow += push;
            for (int curr = t; curr != s; curr = ptr_node[curr]) {
                Edge &e = adj[ptr_node[curr]][ptr_edge[curr]];
                e.cap -= push;
                adj[curr][e.rev].cap += push;
                min_cost += push * e.cost;
            }
        }
        return {max_flow, min_cost};
    }
};
```