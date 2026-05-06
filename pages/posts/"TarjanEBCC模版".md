---
title: "TarjanEBCC模版"
date: "2026-05-06 13:21:41"
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
struct Edge {
    int to;
    int id; // 边的编号，非常重要，用于防止走回头路和记录桥
};

struct TarjanEBCC {
    int n;
    int m;
    int step_count;
    int ebcc_cnt;
    vector<int> dfn;
    vector<int> low;
    vector<int> id;         // id[i] 表示节点 i 所属的 e-BCC 编号
    vector<int> sz;         // sz[i] 表示第 i 个 e-BCC 包含的节点数
    vector<bool> is_bridge; // is_bridge[i] 表示编号为 i 的边是否为桥
    stack<int> st;

    // 注意：无向图不需要 in_stack 数组，因为不会产生有向图中的横叉边，
    // 遇到已经访问过的点必然是祖先节点，直接用 dfn 更新即可。

    TarjanEBCC(int n, int m) {
        this->n = n;
        this->m = m;
        step_count = 0;
        ebcc_cnt = 0;
        dfn.assign(n + 1, 0);
        low.assign(n + 1, 0);
        id.assign(n + 1, 0);
        sz.assign(n + 1, 0);
        is_bridge.assign(m + 1, false);
    }

    void dfs(int u, int edge_in, const vector<vector<Edge>>& g) {
        dfn[u] = low[u] = ++step_count;
        st.push(u);

        for (auto& edge : g[u]) {
            int v = edge.to;
            int e_id = edge.id;

            // 无向图核心：不通过刚刚进来的那条边走回头路
            if (e_id == edge_in) continue; 

            if (!dfn[v]) {
                dfs(v, e_id, g);
                low[u] = min(low[u], low[v]);
                
                // 顺手求桥：如果 v 能到达的最高点比 u 还要低（即 v 无法绕过 u 回到更早的点）
                // 说明连接 u 和 v 的这条边是桥
                if (low[v] > dfn[u]) {
                    is_bridge[e_id] = true;
                }
            } else {
                // 遇到返祖边，更新 low
                low[u] = min(low[u], dfn[v]);
            }
        }

        // 提取出一个完整的边双连通分量
        if (dfn[u] == low[u]) {
            ++ebcc_cnt;
            while (true) {
                int t = st.top();
                st.pop();
                id[t] = ebcc_cnt;
                sz[ebcc_cnt]++;
                if (t == u) break;
            }
        }
    }

    void build(const vector<vector<Edge>>& g) {
        for (int i = 1; i <= n; i++) {
            if (!dfn[i]) {
                dfs(i, 0, g); // 初始时进入的边编号设为 0
            }
        }
    }
};
```