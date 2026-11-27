---
title: "树哈希模版"
date: "2026-11-27 16:43:30"
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

## 树哈希模版

使用随机 `splitmix64` 混合函数计算有根树哈希，并通过换根 DP 在 $O(n)$ 时间内求出以每个点为根的哈希值，支持无根树同构判定。

```cpp
struct TreeHash {
    using u64 = uint64_t;

    int n;
    u64 mask;
    vector<vector<int>> adj;
    vector<u64> sub;  // sub[u]: 以 1 为根时 u 的子树哈希
    vector<u64> full; // full[u]: 以 u 为整棵树根时的树哈希

    TreeHash(int n, u64 seed = 0) : n(n), adj(n + 1), sub(n + 1), full(n + 1) {
        if (seed == 0) {
            seed = chrono::steady_clock::now().time_since_epoch().count();
        }
        mask = splitmix64(seed);
    }

    static u64 splitmix64(u64 x) {
        x += 0x9e3779b97f4a7c15ULL;
        x = (x ^ (x >> 30)) * 0xbf58476d1ce4e5b9ULL;
        x = (x ^ (x >> 27)) * 0x94d049bb133111ebULL;
        return x ^ (x >> 31);
    }

    u64 shift(u64 x) const {
        x ^= mask;
        x ^= x << 13;
        x ^= x >> 7;
        x ^= x << 17;
        x ^= mask;
        return x;
    }

    void add_edge(int u, int v) {
        adj[u].push_back(v);
        adj[v].push_back(u);
    }

    void dfs1(int u, int p) {
        sub[u] = 1;
        for (int v : adj[u]) {
            if (v == p) continue;
            dfs1(v, u);
            sub[u] += shift(sub[v]);
        }
    }

    void dfs2(int u, int p) {
        for (int v : adj[u]) {
            if (v == p) continue;
            // 从 full[u] 中剥离 v 的贡献，得到 u 侧子树哈希
            u64 up = full[u] - shift(sub[v]);
            full[v] = sub[v] + shift(up);
            dfs2(v, u);
        }
    }

    // 计算有根树哈希 sub[] 与换根后的全节点哈希 full[]
    void build(int root = 1) {
        dfs1(root, 0);
        full[root] = sub[root];
        dfs2(root, 0);
    }

    // 返回整棵无根树的规范哈希（可用于直接比较两棵无根树是否同构，需用同一 seed）
    u64 unrooted_canonical_hash() const {
        u64 res = 0;
        for (int i = 1; i <= n; i++) res ^= splitmix64(full[i]);
        return res;
    }
};
```
