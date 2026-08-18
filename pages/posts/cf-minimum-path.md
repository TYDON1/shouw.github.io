---
title: "CF题解——Minimum Path"
date: "2026-05-09 22:05:37"
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
 - 分层图
---

# E. Minimum Path 解题思路

### 核心问题分析

给一张带权无向连通图，定义一条经过 $k$ 条边 $e_1, \dots, e_k$ 的路径的权值为

$$ \sum_{i=1}^{k} w_{e_i} \;-\; \max_{i=1}^{k} w_{e_i} \;+\; \min_{i=1}^{k} w_{e_i} $$

求从 $1$ 号点到每个 $i$ 号点（$2 \le i \le n$）的最小路径权值。

翻译成人话：在普通的路径长度（边权之和）基础上，你可以**白嫖掉最大的那条边**（减去它），同时要**额外多付一次最小的那条边**（加上它）。如果直接套 Dijkstra，状态里既要记最大值又要记最小值，状态爆炸。我们需要一个更聪明的建模。

### 1. 把“减最大、加最小”拆成两个独立的开关

直接维护 max 和 min 太重了。换个角度想：与其在路径确定后再去找最大、最小边，不如**在走每条边的时候，主动决定**这条边扮演什么角色。我们手里握着两张“一次性卡券”：

* **减最大卡**：在某一条边上使用，这条边的费用不算（相当于把它当作那个被减掉的 max）。
* **加最小卡**：在某一条边上使用，这条边要**多付一遍**（相当于把它当作那个被加上的 min）。

于是路径权值可以重写为：正常累加所有边权，但其中**有一条边免费**，**有一条边付双倍**。我们枚举所有“哪条边免费、哪条边双倍”的方案取最小——这恰好等价于原式。

为什么这样取 $\min$ 不会算错？因为：

* 把**真正的最大边**设成免费、把**真正的最小边**设成双倍，得到的值恰好等于题目定义的权值；
* 而把任何别的边当作“免费”，省下的钱只会**更少**（免费的不是最大边）；把别的边当作“双倍”，多付的钱只会**更多**（双倍的不是最小边）。
* 我们求的是**最小值**，所以那些“不是真 max / 真 min”的错误指派，算出来的结果都 $\ge$ 正确值，绝不会把答案带偏。最优一定落在“免费真 max、双倍真 min”上。

### 2. 分层图 Dijkstra：用两个二进制位记录卡券状态

既然有两张卡券，每张“用过 / 没用过”，那就是 $2 \times 2 = 4$ 种状态。把它编码成两个二进制位，开一个 `dist[u][state]`，`state ∈ {0,1,2,3}`：

| state | 减最大卡 | 加最小卡 | 含义 |
|:---:|:---:|:---:|:---:|
| 0 | 未用 | 未用 | 起点状态 |
| 1 | **已用** | 未用 | 已经免费过一条边 |
| 2 | 未用 | **已用** | 已经双倍过一条边 |
| 3 | 已用 | 已用 | 两张卡都用完 |

我们从 `dist[1][0] = 0` 出发跑 Dijkstra，最终每个点的答案就是 `dist[i][3]`——**必须两张卡都用掉**，因为一条合法路径一定有它的 max 和 min。

### 3. 转移：在每条边上枚举它扮演的角色

走一条权为 $w$ 的边 $u \to v$，根据当前状态有这些转移（对应代码里那一坨 `if`）：

* **正常付费**：任意状态 $s$，`dist[v][s] = d + w`。
* **用减最大卡**（费用 $+0$）：`0 → 1`，`2 → 3`。即这条边免费。
* **用加最小卡**（费用 $+2w$）：`0 → 2`，`1 → 3`。即这条边多付一遍。
* **一条边同时当 max 又当 min**（费用 $+w$）：`0 → 3`。这是为了处理“路径只有一条边”的情形——此时 $\max = \min = w$，权值 $= w - w + w = w$，正好对应一步从状态 0 跳到状态 3 且只付一份 $w$。

把这些转移塞进优先队列里跑就行。状态数 $4n$，边数 $4m$，复杂度 $O\big(4(n+m)\log n\big)$，对 $2 \times 10^5$ 的规模绰绰有余。

### 4. 一个容易踩的小坑

注意答案取的是 `dist[i][3]` 而**不是** `dist[i][0]`。哪怕某个点用普通最短路距离更小，也不能作数——因为题目权值里强制要“减一个 max、加一个 min”，必须把两张卡都消费掉才是合法的路径权值。初值统一设成 `INF = 1e18`，避免没走到的状态污染答案。

### CPP 代码实现

```cpp
// E. Minimum Path

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

const int INF = 1e18;

struct State {
    int u, state, dist;
    bool operator>(const State& other) const {
        return dist > other.dist;
    }
};

void solve() {

    int n, m;
    cin >> n >> m;

    vector<vector<pair<int, int>>> adj(n + 1);
    for (int i = 0; i < m; ++i) {
        int u, v, w;
        cin >> u >> v >> w;
        adj[u].pb({v, w});
        adj[v].pb({u, w});
    }

    vector<vector<int>> dist(n + 1, vector<int>(4, INF));
    priority_queue<State, vector<State>, greater<State>> pq;

    dist[1][0] = 0;
    pq.push({1, 0, 0});

    while (!pq.empty()) {
        auto [u, s, d] = pq.top();
        pq.pop();
        if (d > dist[u][s]) continue;

        for (auto& edge : adj[u]) {
            int v = edge.first;
            int w = edge.second;

            if (dist[v][s] > d + w) {
                dist[v][s] = d + w;
                pq.push({v, s, dist[v][s]});
            }

            if (s == 0 && dist[v][1] > d) {
                dist[v][1] = d;
                pq.push({v, 1, dist[v][1]});
            }
            if (s == 2 && dist[v][3] > d) {
                dist[v][3] = d;
                pq.push({v, 3, dist[v][3]});
            }

            if (s == 0 && dist[v][2] > d + 2 * w) {
                dist[v][2] = d + 2 * w;
                pq.push({v, 2, dist[v][2]});
            }
            if (s == 1 && dist[v][3] > d + 2 * w) {
                dist[v][3] = d + 2 * w;
                pq.push({v, 3, dist[v][3]});
            }

            if (s == 0 && dist[v][3] > d + w) {
                dist[v][3] = d + w;
                pq.push({v, 3, dist[v][3]});
            }
        }
    }

    for (int i = 2; i <= n; ++i) {
        cout << dist[i][3] << ' ';
    }
    cout << endl;

}

signed main() {
    
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    // cin >> t;

    while (t--) {
        solve();
    }

}
```
