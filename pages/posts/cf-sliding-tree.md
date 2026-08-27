---
title: "CF题解——Sliding Tree"
date: "2026-06-17 20:44:26"
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
 - 构造
 - 树
 - 树的直径
---

# D. Sliding Tree 解题思路

### 核心问题分析

题意：给一棵 $n$ 个点的树，定义一次 **sliding 操作**：

1. 选三个互不相同的点 $a, b, c$，要求 $b$ 与 $a$、$c$ **都直接相连**；
2. 对 $b$ 的**其余每个邻居** $d$（即 $d \ne a, c$），断开 $b$–$d$，改接成 $c$–$d$。

（可以证明操作后仍是一棵树。）要求用**最少**的操作次数把树变成一条链（所有点度数 $\le 2$）。只需输出某个最优方案的**第一步**；如果本来就是链，输出 $-1$。

$\sum n \le 2\times10^5$，时限 $2$ 秒。

### 1. 先看清这个操作到底干了什么

把操作换个说法：$b$ 原本有一堆邻居，操作之后它**只剩下 $a$ 和 $c$ 两个邻居**，其余分支统统被"甩"到了 $c$ 身上。

用图形化的语言：原本树在 $b$ 处分叉成好几支，现在强行规定"$a$ 走这边、剩下所有的走 $c$ 那边"，于是分叉点从 $b$ **滑动**到了 $c$——这大概就是题目名字 sliding 的由来。

关键在于，如果 $b$ 本来就在某条主链上（$a$ 是主链上 $b$ 的前驱），而 $c$ 是**挂在 $b$ 旁边的一个岔路点**，那么操作之后主链就变成了

$$ \cdots \to a \to b \to c \to (\text{原本 } b \text{ 的其它分支}) $$

也就是说，**原本不在主链上的 $c$，被硬生生插进了主链里**。

### 2. 猜一个答案公式

上面这个观察给了一个非常强的暗示：**一次操作，能让"最长链"恰好增长一个点**。

- 下界方向：每次操作只在 $b$、$c$ 两点附近改变了连边结构，直觉上（也可以严格验证）树的最长路径长度一次最多涨 $1$；
- 上界方向：按上一节的构造，只要还有点不在最长链上，就一定能找到这样的 $(a, b, c)$，让最长链吃掉一个新点。

而终止条件是"整棵树变成一条链"，也就是**所有 $n$ 个点都在最长链上**。所以：

$$ \text{最少操作次数} = n - (\text{树的直径上的点数}) $$

拿样例验算一下：

- 样例 $1$：$n = 6$，树是 $3$ 连着 $\{4,5,6,1\}$、$1$ 连着 $2$。直径是 $4 - 3 - 1 - 2$，共 $4$ 个点。$6 - 4 = 2$ —— 题目说的正是"至少 $2$ 次"。✓
- 样例 $4$：$n = 5$，直径 $5-4-2-3$ 共 $4$ 个点，$5 - 4 = 1$。✓
- 一个 $5$ 条腿的菊花（中心 + $5$ 个叶子，$n = 6$）：直径只有 $3$ 个点，需要 $6 - 3 = 3$ 次。手推一遍确实是 $3$ 次。✓
- 三条腿都长 $2$ 的蜘蛛（$n = 7$）：直径 $5$ 个点，答案 $2$。而且这题**一次绝对做不完**——唯一的三度点 $b$ 的三个邻居度数都是 $2$，操作后 $c$ 的度数必然变成 $3$，还是不合法。$7 - 5 = 2$，对上了。✓

公式确认。于是策略也就定了：**沿着直径走，把直径外的点一个一个吃进来**。

### 3. 具体怎么选 $(a, b, c)$

三步走：

**第一步：求直径。** 经典的两次 DFS：从任意点出发找最远点 $U$，再从 $U$ 出发找最远点 $V$，$U \to V$ 就是一条直径。沿着父指针回溯就能把整条路径拉出来。

```cpp
dfs(dfs, 1, 0, 1);
int U = 1;
for (int i = 1; i <= n; i++) if (dist[i] > dist[U]) U = i;

dfs(dfs, U, 0, 1);
int V = U;
for (int i = 1; i <= n; i++) if (dist[i] > dist[V]) V = i;

vector<int> path;
for (int curr = V; curr != 0; curr = par[curr]) path.pb(curr);
```

**第二步：打标记。** 用 `in_d[]` 记录哪些点在直径上。

**第三步：找分叉口。** 沿直径扫，找第一个满足"既有直径上的邻居 $a$、又有直径外的邻居 $c$"的点 $b$：

```cpp
for (int b : path) {
    int a = -1, c = -1;
    for (int neg : g[b]) {
        if (in_d[neg]) a = neg;
        else c = neg;
    }
    if (a != -1 && c != -1) {
        cout << a << ' ' << b << ' ' << c << endl;
        return;
    }
}
```

有两个细节值得停一下：

- **这样的 $b$ 一定存在**（只要树不是链）：树是连通的，直径外一定有点，那么直径外的点集与直径之间必有连边，那条边在直径侧的端点就是我们要的 $b$；而直径上每个点当然都有直径上的邻居。
- **$b$ 一定是直径的内部点，不会是端点**：如果直径端点还有个直径外的邻居 $c$，那把 $c$ 接上去就得到了一条更长的路径，与"直径最长"矛盾。所以端点在这个循环里会因为 `c == -1` 被自然跳过，不需要特判。

### 4. 什么时候输出 $-1$

树本身就是链的充要条件是**叶子数 $\le 2$**：

```cpp
if (n == 1) { cout << -1 << endl; return; }   // 单点也是链
int cnt = 0;
for (int i = 1; i <= n; i++) if (degree[i] == 1) cnt++;
if (cnt == 2 || cnt == 1) { cout << -1 << endl; return; }
```

$n = 1$ 要单独拎出来（没有任何叶子，$cnt = 0$）；$n = 2$ 时两个点都是叶子，$cnt = 2$，走正常分支输出 $-1$。

### 5. 复杂度

两次 DFS 求直径 $O(n)$，回溯路径 $O(n)$，最后扫一遍直径上每个点的邻接表——每条边最多被访问常数次，$O(n)$。总计

$$ O(n) $$

$\sum n \le 2\times10^5$，飞快。

回头看这道 $*2300$ 的题，它的难度全部集中在**猜对那个公式**上：一旦意识到"每次操作最多把最长链拉长一个点"，答案 $n - |\text{直径}|$ 和"沿直径吃点"的构造就是一体两面，代码写起来毫无难度。反过来，如果一上来就去分析"度数 $\ge 3$ 的点有几个""叶子有几个"，会发现这些量都不能单独决定答案（两条腿长 $2$ 的蜘蛛和样例 $4$ 的叶子数、分叉点数完全一样，答案却是 $2$ 和 $1$），很容易在错误的方向上耗掉一场比赛。构造题就是这样，找到那个对的不变量，天就晴了。

### CPP 代码实现

```cpp
// D. Sliding Tree

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

void solve() {

    int n;
    cin >> n;
    if (n == 1) {
        cout << -1 << endl;
        return;
    }

    vector<vector<int>> g(n + 1);
    vector<int> degree(n + 1);
    for (int i = 1; i < n; i++) {
        int u, v;
        cin >> u >> v;
        g[u].pb(v);
        g[v].pb(u);
        degree[u]++;
        degree[v]++;
    }

    // 叶子数 <= 2 就已经是链了
    int cnt = 0;
    for (int i = 1; i <= n; i++) {
        if (degree[i] == 1) cnt++;
    }
    if (cnt == 2 || cnt == 1) {
        cout << -1 << endl;
        return;
    }

    vector<int> par(n + 1, -1), dist(n + 1);
    auto dfs = [&](auto self, int u, int v, int d) -> void {
        par[u] = v;
        dist[u] = d;
        for (auto it : g[u]) {
            if (it == v) continue;
            self(self, it, u, d + 1);
        }
    };

    // 两次 DFS 求直径
    dfs(dfs, 1, 0, 1);
    int U = 1;
    for (int i = 1; i <= n; i++) if (dist[i] > dist[U]) U = i;

    dfs(dfs, U, 0, 1);
    int V = U;
    for (int i = 1; i <= n; i++) if (dist[i] > dist[V]) V = i;

    vector<int> path;
    for (int curr = V; curr != 0; curr = par[curr]) path.pb(curr);

    vector<bool> in_d(n + 1, false);
    for (int node : path) in_d[node] = true;

    // 找直径上第一个有"岔路"的点
    for (int b : path) {
        int a = -1, c = -1;
        for (int neg : g[b]) {
            if (in_d[neg]) a = neg;
            else c = neg;
        }
        if (a != -1 && c != -1) {
            cout << a << ' ' << b << ' ' << c << endl;
            return;
        }
    }

}

signed main() {

    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    cin >> t;

    while (t--) {
        solve();
    }

}
```
