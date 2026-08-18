---
title: "Tarjan模版"
date: "2026-02-01 14:23:35"
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

## Tarjan模版

```cpp
struct TarjanSCC {
    int n;                  // 节点总数
    int step_count;         // DFS 遍历的时间戳
    int scc_cnt;            // 强连通分量的数量
    vector<int> dfn;        // dfn[i]: 节点 i 被访问的时间戳
    vector<int> low;        // low[i]: 节点 i 能追溯到的最早的栈中节点的时间戳
    vector<int> id;         // id[i]: 节点 i 所属的强连通分量编号
    vector<int> sz;         // sz[i]: 第 i 个强连通分量包含的节点个数
    vector<bool> in_stack;  // in_stack[i]: 标记节点 i 是否在栈中
    stack<int> st;          // STL 栈，用于存储当前路径上的节点

    // 构造函数：初始化所有 vector 的大小，避免越界，默认 1-based 索引
    TarjanSCC(int n) {
        this->n = n;
        step_count = 0;
        scc_cnt = 0;
        dfn.assign(n + 1, 0);
        low.assign(n + 1, 0);
        id.assign(n + 1, 0);
        sz.assign(n + 1, 0);
        in_stack.assign(n + 1, false);
    }

    // 核心 DFS 逻辑
    void dfs(int u, const vector<vector<int>>& g) {
        dfn[u] = low[u] = ++step_count;
        st.push(u);
        in_stack[u] = true;

        for (int v : g[u]) {
            if (!dfn[v]) {
                // 如果 v 未被访问，继续 DFS，并用 v 的 low 值更新 u 的 low 值
                dfs(v, g);
                low[u] = min(low[u], low[v]);
            } else if (in_stack[v]) {
                // 如果 v 已经被访问且仍在栈中（说明存在返祖边），直接更新 low 值
                low[u] = min(low[u], dfn[v]);
            }
        }

        // 发现强连通分量的根节点
        if (dfn[u] == low[u]) {
            ++scc_cnt;
            while (true) {
                int t = st.top();
                st.pop();
                in_stack[t] = false;
                id[t] = scc_cnt;    // 记录节点所属的 SCC 编号
                sz[scc_cnt]++;      // 累加该 SCC 的节点大小
                if (t == u) break;  // 直到把根节点自己也弹出为止
            }
        }
    }

    // 外部调用接口：遍历所有节点，确保非连通图也能全部处理
    void build(const vector<vector<int>>& g) {
        for (int i = 1; i <= n; i++) {
            if (!dfn[i]) {
                dfs(i, g);
            }
        }
    }
};
```