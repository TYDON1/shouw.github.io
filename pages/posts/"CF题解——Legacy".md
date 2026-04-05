---
title: "CF题解——Legacy (线段树优化建图经典)"
date: "2026-04-05 18:57:30"
author: shouw
katex: true
categories:
  - 算法竞赛相关
email: KijinSeija@shouw.blog
readmore: true
tags:
 - 编程
 - 算法竞赛
 - 题解
 - 图论
 - 最短路
 - 线段树
 - 线段树优化建图
---

# B. Legacy 解题思路

### 核心问题分析

题目的背景非常有意思，Rick 要在一个包含 $n$ 个星球的宇宙中旅行。除了常规的两个星球之间的单向传送门（点到点），题目还提供了另外两种超强传送门：
* **点到区间**：从星球 $v$ 花费 $w$，传送到编号在 $[l, r]$ 之间的任意一个星球。
* **区间到点**：从编号在 $[l, r]$ 之间的任意一个星球花费 $w$，传送到星球 $v$。

我们要算的是从起始星球 $s$ 到所有星球的最小花费。这显然是一个**单源最短路问题（Dijkstra）**。

但如果按常规方法建图，对于“点到区间”或“区间到点”的操作，我们最坏情况下需要给 $O(N)$ 个星球连边。如果有 $Q$ 次操作，边数会爆炸到 $O(N \times Q)$（即 $10^{10}$ 级别），绝对会 TLE 和 MLE 到怀疑人生。

### 1. 破题神技：线段树优化建图

怎么才能把“向一个区间里的所有点连边”的时间复杂度降下来呢？
答案是利用**线段树（Segment Tree）**的区间性质！

线段树的每一个节点，天然就代表了一个连续的区间。如果我们把线段树的节点也当成图里的“虚拟星球”：
当我们需要向 $[l, r]$ 区间连边时，我们不需要向里面的每一个真实星球连边，而是**只需向线段树中覆盖 $[l, r]$ 的那 $O(\log N)$ 个区间节点连边即可**！
这样，单次操作的连边数量直接从 $O(N)$ 降维打击到了 $O(\log N)$。整体图的边数被完美控制在 $O(N \log N)$ 级别。

### 2. 为什么要建“两棵树”？（入树与出树）

这是本题最容易绕晕的地方。既然用线段树，为什么代码里会有 `id_in` 和 `id_out` 两个数组？

因为图中的边是**有向**的，且传送门的逻辑不对称！
1. **对于“点到区间”（Out-Tree / 出树）：**
   你到达了一个代表大区间的虚拟节点，意味着你可以免费（权值为 0）去往这个大区间内的所有小区间和最终的叶子节点（真实星球）。
   所以，出树的边是**从父节点指向子节点**的 0 权边。
   *操作逻辑*：点 $v \xrightarrow{w}$ 出树中的区间节点 $\xrightarrow{0}$ 子节点 $\dots \xrightarrow{0}$ 真实的叶子节点。

2. **对于“区间到点”（In-Tree / 入树）：**
   如果你在某个真实星球上，你随时可以免费宣告“我属于包含我的那个大区间”。
   所以，入树的边是**从子节点指向父节点**的 0 权边。
   *操作逻辑*：真实的叶子节点 $\xrightarrow{0}$ 它的父节点 $\dots \xrightarrow{0}$ 入树中的区间节点 $\xrightarrow{w}$ 点 $v$。

**顿悟时刻：** 这两棵虚拟的线段树，它们在最底层的叶子节点（1 到 $n$ 的真实星球）是**共通**的！通过这些真实的叶子节点，入树和出树完美地交织在了一起。

### 3. 具体算法流程

1. **分配节点编号**：前 $n$ 个编号留给真实的星球。接着用 `tot` 分配出树和入树的虚拟节点编号。
2. **初始化建树（`build`）**：
   * 在 `id_out` 树中，向两个子节点连 0 权边（自顶向下）。
   * 在 `id_in` 树中，从两个子节点向父节点连 0 权边（自底向上）。
   * 到了叶子节点时，令 `id_out[v] = id_in[v] = l`，把虚拟树的根基扎在真实星球上。
3. **处理操作建图**：
   * 碰到操作 1：直接真实星球之间连边。
   * 碰到操作 2：利用出树，让 $v$ 连向代表 $[l, r]$ 的 $O(\log N)$ 个虚拟节点。
   * 碰到操作 3：利用入树，让代表 $[l, r]$ 的 $O(\log N)$ 个虚拟节点连向 $v$。
4. **跑 Dijkstra**：在建好的包含虚拟节点的大图上跑标准的堆优化 Dijkstra 即可。

### CPP 代码实现

```cpp
// B. Legacy

#include <bits/stdc++.h>
#define lg(x) 63 - __builtin_clzll(x)
#define all(x) (x).begin(), (x).end()
#define low_bit(x) ((x) & (-x))
#define pb push_back
#define int long long
#define db double
#define endl "\n"

using namespace std;

const int INF = 1e18;

// 因为线段树最多 4N 个节点，加上入树和出树，大约需要 8N-9N 的空间
const int MAX_NODES = 900005;
vector<pair<int, int>> adj[MAX_NODES];
int tot; // 节点编号分配器

// 将线段树操作封装在结构体中，非常模块化
struct SGT {
    int n;
    vector<int> id_in, id_out; // 记录线段树每个节点对应的“入树虚拟编号”和“出树虚拟编号”

    SGT(int n) : n(n) {
        id_in.assign(4 * n + 1, 0);
        id_out.assign(4 * n + 1, 0);
    }

    void build(int v, int l, int r) {
        // 递归到叶子节点，叶子节点就是真实的星球 1~n
        if (l == r) {
            id_in[v] = id_out[v] = l;
            return;
        }

        // 给当前的非叶子区间分配虚拟的全局节点编号
        id_in[v] = ++tot;
        id_out[v] = ++tot;

        int mid = (l + r) >> 1;
        build(v * 2, l, mid);
        build(v * 2 + 1, mid + 1, r);

        // 核心：构建出树（Out-Tree）
        // 边方向：父区间 -> 子区间 (权值为 0)
        // 含义：你能到达大区间，自然免费能到达它包含的小区间
        adj[id_out[v]].pb({id_out[v * 2], 0});
        adj[id_out[v]].pb({id_out[v * 2 + 1], 0});

        // 核心：构建入树（In-Tree）
        // 边方向：子区间 -> 父区间 (权值为 0)
        // 含义：你在小区间里，自然也免费算作在它所属的大区间里
        adj[id_in[v * 2]].pb({id_in[v], 0});
        adj[id_in[v * 2 + 1]].pb({id_in[v], 0});
    }

    // 处理操作 2：点 u 到 区间 [L, R]
    void link_out(int v, int l, int r, int L, int R, int u, int w) {
        if (L > R) return;
        // 如果当前线段树节点被目标区间完全覆盖
        if (l == L && r == R) {
            // 直接从点 u 连向当前区间的出树节点
            adj[u].pb({id_out[v], w});
            return;
        }
        int mid = (l + r) >> 1;
        link_out(v * 2, l, mid, L, min(mid, R), u, w);
        link_out(v * 2 + 1, mid + 1, r, max(mid + 1, L), R, u, w);
    }

    // 处理操作 3：区间 [L, R] 到 点 u
    void link_in(int v, int l, int r, int L, int R, int u, int w) {
        if (L > R) return;
        // 如果当前线段树节点被目标区间完全覆盖
        if (l == L && r == R) {
            // 从当前区间的入树节点，直接连向点 u
            adj[id_in[v]].pb({u, w});
            return;
        }
        int mid = (l + r) >> 1;
        link_in(v * 2, l, mid, L, min(mid, R), u, w);
        link_in(v * 2 + 1, mid + 1, r, max(mid + 1, L), R, u, w);
    }
};

void solve() {
    int n, q, s;
    cin >> n >> q >> s;

    // 前 n 个编号留给真实的星球
    tot = n;
    SGT tree(n);
    tree.build(1, 1, n);

    for (int i = 0; i < q; i++) {
        int type;
        cin >> type;
        if (type == 1) {
            int v, u, w;
            cin >> v >> u >> w;
            adj[v].pb({u, w}); // 点到点，直接常规建边
        } else if (type == 2) {
            int v, l, r, w;
            cin >> v >> l >> r >> w;
            tree.link_out(1, 1, n, l, r, v, w); // 点到区间，使用出树
        } else if (type == 3) {
            int v, l, r, w;
            cin >> v >> l >> r >> w;
            tree.link_in(1, 1, n, l, r, v, w); // 区间到点，使用入树
        }
    }

    // 标准的堆优化 Dijkstra 跑最短路
    // 注意数组大小必须开到总节点数 tot + 1
    vector<int> dist(tot + 1, INF);
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;

    dist[s] = 0;
    pq.push({0, s});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();

        if (d > dist[u]) continue;

        for (auto edge : adj[u]) {
            int v = edge.first;
            int weight = edge.second;

            if (dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                pq.push({dist[v], v});
            }
        }
    }

    // 输出前 n 个真实星球的最短路即可
    for (int i = 1; i <= n; i++) {
        if (dist[i] == INF) cout << -1 << ' ';
        else cout << dist[i] << ' ';
    }
    cout << endl;
}

signed main() {
    // 实用至上：优化输入输出效率
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    // cin >> t; // 本题仅一组数据

    while (t--) {
        solve();
    }
}
```