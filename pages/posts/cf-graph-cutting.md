---
title: "CF题解——Graph Cutting"
date: "2026-06-13 21:29:07"
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
 - 树形DP
 - 树上背包
 - 计数
---

# E. Graph Cutting 解题思路

### 核心问题分析

题意：给定一棵 $n$ 个点的树。选三个互不相同的点 $a < b < c$，砍出**包含这三个点的最小连通子图**（也就是它们的斯坦纳树）。问有多少个三元组，使得砍出来的子图**恰好有 $d$ 个点**。

多组数据，$3 \le d \le n \le 2000$，$\sum n \le 2000$，时限 $2$ 秒。

$n \le 2000$ 且 $\sum n \le 2000$——这个范围几乎是在明说"$O(n^2)$ 的树上背包"。

### 1. 三个点的斯坦纳树长什么样

先想清楚要数的东西的形状。树上三个点 $a, b, c$ 的最小连通子图，一定是一个 **"Y" 字形**：存在一个"中心"点 $m$，从 $m$ 出发三条互不相交的路径分别通到 $a, b, c$。（如果某个点恰好在另外两个点的路径上，那么 $Y$ 退化成一条链，中心就是那个点本身，其中一条"路径"长度为 $0$。）

反过来看这个形状的**关键特征**：

> 这个子图的所有**叶子**，必须恰好是被选中的点。

因为如果有个叶子不是选中的点，把它删掉子图依然连通且依然包含 $a,b,c$，那它就不是"最小"的了。

所以问题变成：**数有多少个连通子图，它恰好有 $d$ 个点，且叶子恰好是 $3$ 个**（这 $3$ 个叶子就唯一确定了三元组）。

### 2. 设计状态：把"叶子数"塞进 DP

以 $1$ 为根做树形 DP。设

$$ dp[u][i][k] = \text{包含 } u \text{ 的连通子图，大小为 } i,\ \text{已经"钉住"了 } k \text{ 个选中点，且是这些点与 } u \text{ 的最小连通子图} $$

$k$ 只需要 $1, 2, 3$ 三档。初值很自然：

```cpp
sizes[u] = 1;
dp[u][1][1] = 1;   // u 自己就是一个选中点
```

现在合并一个儿子 $v$，有两种本质不同的方式。

### 3. 转移一：$u$ 处发生分叉

如果 $u$ 已经积累了 $y \ge 1$ 个选中点（来自之前的儿子或者 $u$ 自己），现在再从 $v$ 这边接上 $x - y \ge 1$ 个，那就是在 $u$ 处**分叉**：

```cpp
for (int i = sizes[u]; i >= 1; i--) {
    for (int j = sizes[v]; j >= 1; j--) {
        for (int x = 2; x <= 3; x++) {
            for (int y = 1; y < x; y++) {
                dp[u][i + j][x] += dp[u][i][y] * dp[v][j][x - y];
            }
        }
    }
}
```

注意两边都要求**至少有一个**选中点（$y \ge 1$ 且 $x - y \ge 1$）。这正是在保证"不能有白长的枝条"——每一个分叉出去的方向，末端都必须坐着一个选中点，否则这个子图就不是最小的了。

$i$ 和 $j$ 都必须**倒序**枚举。因为我们在读 $dp[u][i][\cdot]$ 的同时往 $dp[u][i+j][\cdot]$ 里写，而 $i + j > i$，倒序保证了被写入的位置在这一轮里已经"读过"了，不会把新算出来的东西再当成旧状态用一次（经典的 01 背包倒序）。

### 4. 转移二：$u$ 只是一根"传递棒"

另一种情况：$u$ 自己不是选中点，也没有别的分支，整个结构只是从 $v$ 的子树里长上来，顺路把 $u$ 串上：

```cpp
for (int j = 1; j <= sizes[v]; j++) {
    for (int k = 1; k <= 2; k++) {
        dp[u][j + 1][k] += dp[v][j][k];
    }
}
```

这里有个**非常要命的细节**：$k$ 只循环到 $2$，**绝对不能让 $k = 3$ 往上传**。

想想为什么。如果 $v$ 的子树里已经凑齐了三个选中点，那它们的最小连通子图**完全落在 $v$ 的子树内**，压根不包含 $u$。硬把 $u$ 加上去，得到的子图就不是最小的了——那是在数一个不存在的方案。这一行 `k <= 2` 就是整道题的正确性命门。

### 5. 统计答案：每个三元组恰好在一个点被数到

最后：

```cpp
int ans = 0;
for (int i = 1; i <= n; i++) ans += dp[i][d][3];
```

为什么直接对所有点求和不会重复？考虑某个三元组的斯坦纳树 $S$，令 $r$ 是 $S$ 中**深度最小**（最靠近根）的那个点。

- 对于 $S$ 里除 $r$ 以外的点，$k=3$ 的状态永远凑不齐：要在某点凑齐 $3$，必须在那里做转移一的分叉，而 $S$ 中只有 $r$ 是"三个方向的汇合处"（严格说是 $S$ 在有根意义下唯一的顶点）；
- 对于 $r$ **严格上方**的点 $u$：三个选中点全在 $u$ 的同一个儿子子树里，没法拆成两个都含选中点的分支，所以转移一用不上；而转移二又被 $k \le 2$ 挡住了。$dp[u][\cdot][3] = 0$。

所以每个三元组**恰好**在 $u = r$ 处被数一次，求和不重不漏。

### 6. 一个反直觉的坑：这题必须把 `#define int long long` 关掉

`dp` 是一个 $(n+1) \times (n+1) \times 4$ 的三维数组。$n = 2000$ 时有 $2001 \times 2001 \times 4 \approx 1.6 \times 10^7$ 个格子。

- 用 $32$ 位 `int`：$64$ MB 数据；
- 用 $64$ 位 `long long`：$128$ MB 数据。

内存限制只有 $256$ MB，后者加上容器开销必炸。所以这道题的模板宏里，`#define int long long` **必须注释掉**。

那会不会溢出？答案上界是 $\binom{2000}{3} \approx 1.33\times10^9$，而 `int` 的上界是 $2.147\times10^9$——**刚好塞得下**，而且中间状态数的是"子结构方案数"，同样被这个上界卡住。惊险过关。

另外强烈建议把最内层写成 `array<int, 4>` 而不是 `vector<int>(4)`：后者会产生 $4\times10^6$ 次独立堆分配，光是 vector 头部和分配器元数据就能把内存拉到 $225$ MB 的悬崖边上（我第一发交上去实测就是这个数）。换成 `array` 之后内存直接砍掉一大半。

### 7. 复杂度

树上背包的经典结论：形如 `for i in [1, sizes[u]] for j in [1, sizes[v]]` 的合并，**总代价是 $O(n^2)$**（每一对点 $(x, y)$ 只会在它们的 LCA 处被枚举到恰好一次）。状态里 $(x, y)$ 的组合只有 $3$ 种，是常数。所以

$$ O(n^2) $$

$\sum n \le 2000$，$4\times10^6$ 级别的运算，跑了 $484$ ms，稳。

回头看这道 $*2300$ 的题，DP 的骨架是标准的树上背包，真正的思维含量集中在两个地方：一是把"最小连通子图"翻译成"**所有叶子都是选中点**"这个可以被 DP 直接刻画的条件；二是想明白 $k=3$ 不能向上传递——这两件事都是"看懂了觉得理所当然，没看懂就完全写不出来"的类型。至于那个 `long long` 的内存坑，则是纯粹的工程经验了。

### CPP 代码实现

```cpp
// E. Graph Cutting

#include <bits/stdc++.h>
#define lg(x) (63 - __builtin_clzll(x))
#define all(x) (x).begin(), (x).end()
#define low_bit(x) ((x) & (-x))
#define pb push_back
#define db long double
// #define int long long   <- 这题内存卡得死，必须关掉
#define sz(x) (int)x.size()
#define endl "\n"

using namespace std;

void solve() {

    int n, d;
    cin >> n >> d;
    vector<vector<int>> g(n + 1);
    vector<int> sizes(n + 1);
    // dp[u][i][k]: 含 u、大小为 i、钉住 k 个选中点的最小连通子图方案数
    vector<vector<array<int, 4>>> dp(n + 1, vector<array<int, 4>>(n + 1, {0, 0, 0, 0}));

    for (int i = 1; i < n; i++) {
        int u, v;
        cin >> u >> v;
        g[u].pb(v);
        g[v].pb(u);
    }

    auto dfs = [&](auto& self, int u, int fa) -> void {

        sizes[u] = 1;
        dp[u][1][1] = 1;

        for (auto v : g[u]) {
            if (v == fa) continue;
            self(self, v, u);

            // 转移一：在 u 处分叉，两边都必须含选中点
            for (int i = sizes[u]; i >= 1; i--) {
                for (int j = sizes[v]; j >= 1; j--) {
                    for (int x = 2; x <= 3; x++) {
                        for (int y = 1; y < x; y++) {
                            dp[u][i + j][x] += dp[u][i][y] * dp[v][j][x - y];
                        }
                    }
                }
            }

            // 转移二：u 只是把 v 的结构往上串，k = 3 绝对不能传上来
            for (int j = 1; j <= sizes[v]; j++) {
                for (int k = 1; k <= 2; k++) {
                    dp[u][j + 1][k] += dp[v][j][k];
                }
            }

            sizes[u] += sizes[v];
        }
    };

    dfs(dfs, 1, 0);

    int ans = 0;
    for (int i = 1; i <= n; i++) ans += dp[i][d][3];
    cout << ans << endl;

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
