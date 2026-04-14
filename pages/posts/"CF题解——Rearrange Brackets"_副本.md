---
title: "CF题解——Petya and Graph (最大权闭合子图经典模型)"
date: "2026-04-314 15:08:51"
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
 - 网络流
 - 最小割
 - 最大权闭合子图
---

# G. Petya and Graph 解题思路

### 核心问题分析

题目的要求很直白：在给定的图中挑出一个子图（选一些点和一些边）。
*   **收益（正权）**：选中一条边，就能获得它的权重 $w_i$。
*   **代价（负权）**：选中一个点，就要付出它的权重 $a_i$（在题目公式中体现为减去点的权重）。
*   **限制条件**：如果你想选中某条边，你**必须**同时选中这条边的两个端点！

我们需要在这些限制下，最大化“边权总和 $-$ 点权总和”。
（注意：如果什么都不选，收益为 0。所以最终答案最差也是 0）。

初看这道题，这是一个典型的**“选 A 就必须选 B”的捆绑依赖问题**，且带有正收益和负代价。在算法竞赛中，只要闻到了这股味道，就必须立刻条件反射地想到图论里最经典的核武器——**最大权闭合子图（Maximum Weight Closure of a Graph）**，也就是**网络流的最小割模型**。

### 1. 建模转化：将组合优化变为“割”

在最小割模型中，我们将全图所有的元素（无论边还是点）都看作网络流中的“节点”。我们要把它们分到两个阵营：
*   **源点 $S$ 阵营**：代表**“选中”**该元素。
*   **汇点 $T$ 阵营**：代表**“不选”**该元素。

我们如何通过连边，用“最小割（Min-Cut）”的代价来模拟题目的限制呢？
1.  **正收益（边）**：选它能赚钱。我们从源点 $S$ 连一条容量为 $w_i$ 的边到“原图的边节点 $e_i$”。
    *如果这条连线被割断，意味着我们放弃了这笔钱，产生 $w_i$ 的损失。*
2.  **负代价（点）**：选它要花钱。我们从“原图的点节点 $v_i$”连一条容量为 $a_i$ 的边到汇点 $T$。
    *如果这条连线被割断，意味着我们付出了代价买下了这个点，产生 $a_i$ 的损失。*
3.  **强制依赖关系**：选了边 $e_i$，就**必须**选它的端点 $u$ 和 $v$。
    我们从边节点 $e_i$ 连两条容量为 $\infty$（无穷大）的有向边，分别指向点节点 $u$ 和 $v$。
    *因为容量是无穷大，最小割绝对不可能去割这两条边！这就强制保证了：如果你不割断 $S \to e_i$（即你选了这条边拿了收益），由于 $\infty$ 边不能割，你为了把 $S$ 和 $T$ 分开，就必须去割断 $u \to T$ 和 $v \to T$（即你必须为这两个端点掏钱）！*

### 2. 顿悟时刻：答案怎么算？

根据上述建模，我们跑一次最大流（即最小割）。
这个“最小割”切掉的容量，实际上代表了什么？
它代表了：**我们为了满足条件，不得不放弃的“正收益”，加上不得不付出的“点代价”，这两者之和的最小值。**

那么，我们的最终最大收益就是：
$$ \text{最优收益} = \text{假设把所有钱都赚了（原图所有边权总和）} - \text{最小损失（网络流求出的最小割）} $$

这不仅逻辑完美闭环，而且由于 Dinic 算法在处理这种浅层二分图时速度极快，时间复杂度完全能够轻松跑过 $N, M \le 1000$ 的数据规模。

### CPP 代码实现

```cpp
// G. Petya and Graph

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

const int INF = 2e18;

// 标准的高效网络流 Dinic 模板
struct Dinic {
    struct Edge {
        int to;
        int cap;
        int rev;
    };

    vector<vector<Edge>> adj;
    vector<int> level;
    vector<int> ptr;

    Dinic(int n) : adj(n), level(n), ptr(n) {}

    // 加边操作，自带建反向边
    void add_edge(int u, int v, int c) {
        adj[u].push_back({v, c, (int)adj[v].size()});
        adj[v].push_back({u, 0, (int)adj[u].size() - 1});
    }

    // BFS 建立分层图
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

    // DFS 寻找增广路 (自带当前弧优化 ptr)
    int dfs(int v, int t, int pushed) {
        if (pushed == 0) return 0;
        if (v == t) return pushed;

        for (int& cid = ptr[v]; cid < adj[v].size(); ++cid) {
            auto& edge = adj[v][cid];
            int tr = edge.to;
            if (level[v] + 1 != level[tr] || edge.cap == 0) continue;

            int tr_pushed = dfs(tr, t, min(pushed, edge.cap));
            if (tr_pushed == 0) continue;

            edge.cap -= tr_pushed;
            adj[tr][edge.rev].cap += tr_pushed;
            return tr_pushed;
        }
        return 0;
    }

    // 核心跑最大流入口
    int max_flow(int s, int t) {
        int flow = 0;
        while (bfs(s, t)) {
            fill(ptr.begin(), ptr.end(), 0);
            while (int pushed = dfs(s, t, INF)) {
                flow += pushed;
            }
        }
        return flow;
    }
};

void solve() {
    int n, m;
    cin >> n >> m;
    
    // 网络流总节点数：源点 S(1个) + 汇点 T(1个) + 原图边节点(m个) + 原图点节点(n个)
    Dinic dinic(n + m + 2);
    int S = 0, T = n + m + 1;
    
    int sum = 0; // 记录如果所有边都选，能带来的理论最大收益

    // 处理“负代价（点）”
    // 原图的点编号为 1~n，我们在网络流图中将其映射为 m+1 ~ m+n
    for (int i = 1; i <= n; i++) {
        int temp;
        cin >> temp;
        // 点节点连向汇点 T，容量为选这个点需要付出的代价 a_i
        dinic.add_edge(i + m, T, temp);
    }

    // 处理“正收益（边）”及其“强制依赖关系”
    // 原图的边编号为 1~m，在网络流图中直接映射为 1~m
    for (int i = 1; i <= m; i++) {
        int u, v, w;
        cin >> u >> v >> w;
        sum += w; // 累加理论总收益
        
        // 收益入账：源点 S 连向边节点，容量为边的权重 w_i
        dinic.add_edge(S, i, w);
        
        // 强制依赖：选了边 i，就必须买下端点 u 和 v
        // 连向无穷大 INF 容量的边，防止最小割切断这种依赖
        dinic.add_edge(i, m + u, INF);
        dinic.add_edge(i, m + v, INF);
    }
    
    // 最大权闭合子图经典公式：
    // 最优解 = 全盘正收益之和 - 最小割(即最小总损失)
    cout << sum - dinic.max_flow(S, T) << endl;
}

signed main() {
    // 榨干最后一点 IO 性能
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    // cin >> t; // 本题只有单测数据
    
    while (t--) {
        solve();
    }
}
```