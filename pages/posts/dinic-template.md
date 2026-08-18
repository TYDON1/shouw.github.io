---
title: "Dinic模版"
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
struct Dinic {
    const int INF = 1e9; // int 范围内的无穷大

    struct Edge {
        int to;
        int cap; // 容量
        int rev; // 反向边在 adj[to] 中的下标
    };

    vector<vector<Edge>> adj;
    vector<int> level;
    vector<int> ptr;

    Dinic(int n) : adj(n), level(n), ptr(n) {}

    // 添加有向边 u -> v，容量为 c
    void add_edge(int u, int v, int c) {
        adj[u].push_back({v, c, (int)adj[v].size()});
        adj[v].push_back({u, 0, (int)adj[u].size() - 1});
    }

    bool bfs(int s, int t) {
        fill(level.begin(), level.end(), -1);
        level[s] = 0;
        queue<int> q;
        q.push(s);
        while (!q.empty()) {
            int v = q.front();
            q.pop();
            for (auto& edge : adj[v]) {
                if (edge.cap > 0 && level[edge.to] == -1) {
                    level[edge.to] = level[v] + 1;
                    q.push(edge.to);
                }
            }
        }
        return level[t] != -1;
    }

    int dfs(int v, int t, int pushed) {
        if (pushed == 0 || v == t) return pushed;

        int flow = 0; // 记录当前节点总共成功推出去的流量

        // 当前弧优化：ptr[v] 记录遍历到了哪条边，避免重复遍历榨干的边
        for (int& cid = ptr[v]; cid < adj[v].size(); ++cid) {
            auto& edge = adj[v][cid];
            int tr = edge.to;
            
            // 必须满足层级关系，且有剩余容量
            if (level[v] + 1 != level[tr] || edge.cap == 0) continue;

            // 向下一层传递的流量上限，是当前剩余的流量 (pushed - flow)
            int tr_pushed = dfs(tr, t, min(pushed - flow, edge.cap));
            if (tr_pushed == 0) continue;

            edge.cap -= tr_pushed;
            adj[tr][edge.rev].cap += tr_pushed;
            
            flow += tr_pushed; // 累加推出去的流量
            
            // 多路增广：如果传进来的流量已经全推空了，提前截断
            if (flow == pushed) break; 
        }
        
        // 废点优化：如果这个点一点流量都没推出去，把它标记为死路，后续不再访问
        if (flow == 0) level[v] = -1; 
        
        return flow;
    }

    // 计算最大流
    int max_flow(int s, int t) {
        int flow = 0;
        while (bfs(s, t)) {
            fill(ptr.begin(), ptr.end(), 0); // 每次分层图重置当前弧指针
            // 多路增广下，一次 dfs 就能榨干当前分层图的所有增广路
            flow += dfs(s, t, INF); 
        }
        return flow;
    }
};
```