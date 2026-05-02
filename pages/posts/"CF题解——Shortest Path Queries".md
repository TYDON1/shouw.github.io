---
title: "CF题解——Shortest Path Queries"
date: "2026-05-02 14:16:21"
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
 - 线段树
 - 线性基
 - 可撤销并查集
---

# G. Shortest Path Queries 解题思路

### 核心问题分析

题目的要求是：维护一个带权无向连通图，支持以下三种操作：
1. 添加一条权重为 $d$ 的边。
2. 删除一条边（保证删除后图依然连通）。
3. 查询从节点 $x$ 到节点 $y$ 的**最小异或最短路**（路径上的边权异或和最小，允许重复走边）。

在图论中，**“最小异或最短路”**有着一套极其标准且经典的解法：**线性基（Linear Basis） + DFS 树**。
因为异或操作的自反性（走过去再走回来，异或和为 0），两点之间的任意一条路径的异或和，必定等于：**两点在 DFS 树上的唯一简单路径的异或和 $\oplus$ 图中若干个环的异或和**。
所以我们只需要维护图里所有的“环”，把环的异或和全部扔进**线性基**里。查询时，先求出两点间的随便一条简单路径的异或和 `res`，然后用线性基去贪心地把 `res` 变得尽可能小（`query_min`）。

但本题的难点在于：**图是动态的！边会不断被添加和删除。**
线性基只支持插入，不支持删除。并查集如果使用了路径压缩，也不支持删除。
面对这种“只加不减好做，有加有减难做”的数据结构题，终极核武器就是：**线段树分治（Divide and Conquer on Segment Tree）离线处理**。

### 1. 线段树分治：把时间轴转化为区间

既然在线处理删除操作很困难，我们不妨换个视角。
由于所有的查询都已经提前给出了，我们可以把 $1 \dots Q$ 次操作看作一个时间轴。
对于图里的每一条边，它都有一个“存活时间段” $[L, R]$。
* 一条边在时刻 $L$ 被添加，在时刻 $R$ 被删除，它就存活了 $[L, R]$。
* 如果一条边一直没被删除，它就存活到了最后时刻 $Q$。

我们建立一棵覆盖时间轴 $[0, Q]$ 的线段树。对于每一条存活时间为 $[L, R]$ 的边，我们像普通的区间修改一样，把它“挂”在线段树上覆盖 $[L, R]$ 的那 $O(\log Q)$ 个节点上。

这样，所有的“删除”操作就彻底消失了！
我们只需要在时间线段树上做一次 DFS 遍历：
1. **进入节点**：把挂在这个节点上的所有边加入图中。
2. **递归子节点**：继续深入时间轴。
3. **到达叶子节点**：叶子节点代表一个具体的时间点 $t$。如果时刻 $t$ 有询问，说明此时图中的状态刚好是历史上此时的状态，我们直接回答询问！
4. **离开节点**：把进入该节点时添加的边“撤销”掉。

### 2. 状态维护：带权可撤销并查集 + 线性基的深拷贝

在线段树分治的 DFS 过程中，我们需要维护图的连通性、两点间的异或距离，以及所有的环。

* **带权可撤销并查集**：
  为了支持“撤销（离开节点）”操作，并查集绝对**不能使用路径压缩**，只能使用**按秩合并（启发式合并）**。
  我们用一个 `history` 栈记录下每次合并操作。当离开线段树节点时，弹栈并恢复父指针和集合大小，完美实现 $O(1)$ 的撤销。
  同时，并查集还要维护边权：`dist[i]` 表示节点 $i$ 到其父节点的边的权值。查询两点间的简单路径异或和时，只需一直跳到根节点，将沿途的 `dist` 异或起来即可。
* **线性基的值传递**：
  当并查集合并时，如果发现两个点已经在同一个集合里了，说明**产生了一个环**！这个环的异或和就是 `get_xor(u) ^ get_xor(v) ^ w`。我们把这个环的值扔进线性基。
  因为进入线段树下一层时，可能会增加新的环，而回溯时需要恢复原状。C++ 帮了我们一个大忙：我们直接在 DFS 函数签名里**传值调用（Pass by Value）**传递 `LinearBasis lb`。这样每一层递归都会自动拷贝一份线性基，回溯时天然恢复，免去了手写撤销线性基的痛苦。

### CPP 代码实现

```cpp
// G. Shortest Path Queries

#include <bits/stdc++.h>
#define lg(x) (63 - __builtin_clzll(x))
#define all(x) (x).begin(), (x).end()
#define low_bit(x) ((x) & (-x))
#define pb push_back
#define db long double
#define int long long
#define sz(x) (int)x.size()
#define endl "\n"

using namespace std;

// 经典线性基，用于维护所有的环异或和
struct LinearBasis {
    static const int MAX_L = 30;
    int p[MAX_L + 1];
    int d[MAX_L + 1];
    int cnt;
    bool has_zero;

    LinearBasis() {
        memset(p, 0, sizeof(p));
        memset(d, 0, sizeof(d));
        cnt = 0;
        has_zero = false;
    }

    // 插入新元素
    bool insert(int x) {
        for (int i = MAX_L; i >= 0; --i) {
            if (!(x >> i)) continue;
            if (!p[i]) {
                p[i] = x;
                cnt++;
                return true;
            }
            x ^= p[i];
        }
        has_zero = true;
        return false;
    }

    // 给定一个初始值 res，利用线性基贪心将其异或到最小
    int query_min(int res) {
        for (int i = MAX_L; i >= 0; --i) {
            if ((res ^ p[i]) < res) {
                res ^= p[i];
            }
        }
        return res;
    }
};

// 带权可撤销并查集（不能路径压缩，只能按秩合并）
struct RollbackDSU {
    vector<int> parent;
    vector<int> sz;
    vector<int> dist; // 记录到父节点的异或边权

    struct History {
        int u, v; // 记录挂载关系：u 挂在 v 下面
    };
    vector<History> history; // 历史栈，用于回滚

    RollbackDSU(int n) {
        parent.resize(n + 1);
        sz.resize(n + 1, 1);
        dist.resize(n + 1, 0);
        iota(parent.begin(), parent.end(), 0);
    }

    // 获取节点 i 到当前根节点的异或距离
    int get_xor(int i) {
        int res = 0;
        while (i != parent[i]) {
            res ^= dist[i];
            i = parent[i];
        }
        return res;
    }

    // 寻找根节点（绝对不能压缩路径）
    int find(int i) {
        while (i != parent[i]) i = parent[i];
        return i;
    }

    // 合并操作
    void unite(int u, int v, int w, LinearBasis &lb) {
        int rootX = find(u);
        int rootY = find(v);
        // u 到 v 的那条神秘边产生的闭合回路异或值
        int val = get_xor(u) ^ get_xor(v) ^ w;
        
        if (rootX != rootY) {
            // 不在同一集合，按秩合并
            if (sz[rootX] < sz[rootY]) swap(rootX, rootY);
            history.push_back({rootY, rootX});
            parent[rootY] = rootX;
            dist[rootY] = val; // 维护新认的爹的异或边权
            sz[rootX] += sz[rootY];
        } else {
            // 已经在同一集合，说明形成了一个环，扔进线性基
            lb.insert(val);
        }
    }

    // 撤销合并操作，恢复到 state 大小的历史记录
    void rollback(int state) {
        while (sz(history) > state) {
            History last = history.back();
            history.pop_back();
            sz[last.v] -= sz[last.u];
            parent[last.u] = last.u; // 恢复孤立状态
            dist[last.u] = 0;        // 恢复边权
        }
    }
};

struct Edge {
    int u, v, w;
};
struct Query {
    int type, u, v;
};

vector<Edge> tree[800005]; // 线段树，节点上挂着这个时间段内存在的边
Query qs[200005];          // 存储所有的询问

// 将边插入到时间线段树中
void add_to_sgt(int v, int l, int r, int L, int R, Edge e) {
    if (L > R) return;
    if (l == L && r == R) {
        tree[v].pb(e);
        return;
    }
    int mid = (l + r) >> 1;
    add_to_sgt(v * 2, l, mid, L, min(mid, R), e);
    add_to_sgt(v * 2 + 1, mid + 1, r, max(mid + 1, L), R, e);
}

RollbackDSU dsu(200005);

// 线段树分治核心 DFS
// 注意：lb 必须是传值调用，这样才能天然实现线性基的“撤销”回溯
void solve_sgt(int v, int l, int r, LinearBasis lb) {

    // 记录进入本节点前的并查集历史状态，以便离开时回滚
    int state = dsu.history.size();
    
    // 把挂载在这个线段树节点上的所有边加入并查集/线性基
    for (auto &e : tree[v]) {
        dsu.unite(e.u, e.v, e.w, lb);
    }

    if (l == r) {
        // 到达叶子节点，代表当前的时间点 l
        // 如果此刻恰好是一个查询操作，计算答案
        if (qs[l].type == 3) {
            // 两点间的一条基础路径异或和
            int path_xor = dsu.get_xor(qs[l].u) ^ dsu.get_xor(qs[l].v);
            // 用积累的环（线性基）把它贪心变小
            cout << lb.query_min(path_xor) << endl;
        }
    } else {
        // 递归进入左右子树的时间段
        int mid = (l + r) >> 1;
        solve_sgt(v * 2, l, mid, lb);
        solve_sgt(v * 2 + 1, mid + 1, r, lb);
    }
    
    // 离开节点前，把进入该节点时做的合并操作全部撤销
    dsu.rollback(state);
}

void solve() {
    int n, m;
    cin >> n >> m;

    map<pair<int, int>, pair<int, int>> active_edges; // 记录每条边的 (起点时刻, 权值)
    
    auto get_pair = [](int u, int v) {
        if (u > v) swap(u, v);
        return make_pair(u, v);
    };

    // 读取初始的 m 条边（时刻 0 插入）
    for (int i = 0; i < m; ++i) {
        int u, v, w;
        cin >> u >> v >> w;
        active_edges[get_pair(u, v)] = {0, w};
    }

    int q;
    cin >> q;
    for (int i = 1; i <= q; ++i) {
        cin >> qs[i].type;
        if (qs[i].type == 1) {
            int u, v, w; cin >> u >> v >> w;
            qs[i].u = u; qs[i].v = v;
            active_edges[get_pair(u, v)] = {i, w}; // 时刻 i 插入
        } else if (qs[i].type == 2) {
            int u, v; cin >> u >> v;
            auto p = get_pair(u, v);
            auto info = active_edges[p];
            // 时刻 i 被删除，说明这条边存活时间是 [info.first, i - 1]
            add_to_sgt(1, 0, q, info.first, i - 1, {p.first, p.second, info.second});
            active_edges.erase(p);
        } else {
            cin >> qs[i].u >> qs[i].v;
        }
    }

    // 处理那些活到了最后时刻 q 都没有被删除的边
    for (auto const& [nodes, info] : active_edges) {
        add_to_sgt(1, 0, q, info.first, q, {nodes.first, nodes.second, info.second});
    }

    // 初始化并查集并启动线段树分治
    dsu = RollbackDSU(n);
    LinearBasis lb;
    solve_sgt(1, 0, q, lb);
}

signed main() {
    // 优化 IO 效率
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    // cin >> t; // 仅单次测试数据

    while (t--) {
        solve();
    }
}