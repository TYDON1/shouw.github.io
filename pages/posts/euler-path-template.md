---
title: "欧拉路径与欧拉回路模版"
date: "2026-11-27 17:02:18"
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

## 欧拉路径与欧拉回路模版

使用 Hierholzer 算法（迭代版防爆栈 + 当前弧优化）求解有向图与无向图的欧拉路径/欧拉回路，并保证输出字典序最小。

```cpp
struct EulerPath {
    int n, m;
    bool directed;
    vector<vector<pair<int, int>>> adj; // {to, edge_id}
    vector<int> in_deg, out_deg;

    EulerPath(int n, bool directed = true)
        : n(n), m(0), directed(directed), adj(n + 1), in_deg(n + 1, 0), out_deg(n + 1, 0) {}

    void add_edge(int u, int v) {
        adj[u].emplace_back(v, m);
        out_deg[u]++;
        in_deg[v]++;
        if (!directed) {
            adj[v].emplace_back(u, m);
            out_deg[v]++;
            in_deg[u]++;
        }
        m++;
    }

    // 返回字典序最小的欧拉路径节点序列；若不存在返回空 vector
    vector<int> solve() {
        int start = -1;
        if (directed) {
            int cnt_s = 0, cnt_t = 0;
            for (int i = 1; i <= n; i++) {
                int diff = out_deg[i] - in_deg[i];
                if (diff == 1) { cnt_s++; start = i; }
                else if (diff == -1) { cnt_t++; }
                else if (diff != 0) return {};
            }
            if (!((cnt_s == 0 && cnt_t == 0) || (cnt_s == 1 && cnt_t == 1))) return {};
        } else {
            int odd = 0;
            for (int i = 1; i <= n; i++) {
                if (out_deg[i] & 1) {
                    odd++;
                    if (start == -1) start = i;
                }
            }
            if (odd != 0 && odd != 2) return {};
        }

        // 若是欧拉回路，选编号最小的有出边节点作起点
        if (start == -1) {
            for (int i = 1; i <= n; i++) {
                if (!adj[i].empty()) { start = i; break; }
            }
        }
        if (start == -1) return {1};

        // 按终点编号排序保证字典序最小
        for (int i = 1; i <= n; i++) sort(adj[i].begin(), adj[i].end());

        vector<int> ptr(n + 1, 0), st, path;
        vector<bool> used(m, false);
        st.push_back(start);
        while (!st.empty()) {
            int u = st.back();
            while (ptr[u] < (int)adj[u].size() && used[adj[u][ptr[u]].second]) ptr[u]++;
            if (ptr[u] < (int)adj[u].size()) {
                auto [v, id] = adj[u][ptr[u]++];
                used[id] = true;
                st.push_back(v);
            } else {
                path.push_back(u);
                st.pop_back();
            }
        }
        if ((int)path.size() != m + 1) return {};
        reverse(path.begin(), path.end());
        return path;
    }
};
```
