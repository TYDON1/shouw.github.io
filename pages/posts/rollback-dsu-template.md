---
title: "可撤销并查集模版"
date: "2026-02-01 12:18:07"
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

## 并查集模版

```cpp
struct RollbackDSU {
    vector<int> parent;
    vector<int> sz;
    
    struct History {
        int u, v;
    };
    vector<History> history;

    RollbackDSU(int n) {
        parent.resize(n + 1);
        sz.resize(n + 1, 1);
        iota(parent.begin(), parent.end(), 0);
    }

    int find(int i) {
        while (i != parent[i]) i = parent[i];
        return i;
    }

    int get_state() {
        return history.size();
    }

    void unite(int u, int v) {
        int rootX = find(u);
        int rootY = find(v);
        if (rootX != rootY) {
            if (sz[rootX] < sz[rootY]) swap(rootX, rootY);
            history.push_back({rootY, rootX});
            parent[rootY] = rootX;
            sz[rootX] += sz[rootY];
        }
    }
    void rollback(int state) {
        while (history.size() > (size_t)state) {
            History last = history.back();
            history.pop_back();
            sz[last.v] -= sz[last.u];
            parent[last.u] = last.u;
        }
    }

    bool connected(int u, int v) {
        return find(u) == find(v);
    }
};
```