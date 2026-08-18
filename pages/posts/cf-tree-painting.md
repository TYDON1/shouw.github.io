---
title: "CF题解——Tree Painting"
date: "2026-05-25 20:42:11"
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
 - 换根DP
---

# E. Tree Painting 解题思路

### 核心问题分析

给我们一棵 $n$ 个点的树，一开始全是白色。第一步任选一个点染黑；之后每一步，只能选一个**与某个黑点相邻的白点**把它染黑。每次染一个点（包括第一步那一下），都会得到一笔分数，分数等于**这个点所在的白色连通块的大小**。游戏直到全黑结束，问总分最大能是多少。

数据范围 $2 \le n \le 2 \cdot 10^5$，所以肯定不能去模拟“怎么一步步染”——那是指数级的方案。我们得先把这个游戏的本质看穿。

突破口在于：一旦你定下了第一步染哪个点（设为根 $r$），那么后面的染色顺序虽然有很多种，但**总分其实是固定的，而且等于一个非常优美的式子**。把这件事想明白，剩下的就是“枚举每个点当根、取最大”的换根 DP 了。

### 1. 顿悟时刻：选定起点后，总分就是“子树大小之和”

先把第一步染的点 $r$ 当成树根。我断言：

> 以 $r$ 为起点，无论后续怎么合法地一步步染下去，**总得分恒等于以 $r$ 为根时所有点的子树大小之和**：
> $$ \mathrm{score}(r) = \sum_{u=1}^{n} \mathrm{size}_r(u) $$

为什么？换个视角来数贡献。每染一个点，加的是“当前白连通块的大小”，等价于：**这个白连通块里的每个白点，各给你贡献 $1$ 分**。所以我们不按“步”来数，改按“点对”来数——某个白点 $w$ 在第 $k$ 步被计入了分数，当且仅当第 $k$ 步选的那个点 $x$ 和 $w$ 此刻处在同一个白连通块里。

关键观察：从根 $r$ 往下染，染色一定是**从根向叶子推进**的（每次只能挨着黑点扩展，而黑色区域始终是一个包含 $r$ 的连通块）。于是对任意一个点 $w$，考虑它头顶上的祖先（含它自己）$u$——在 $u$ 被染黑的那一步，$w$ 必然还是白的，并且 $w$ 和 $u$ 还连在同一个白连通块里（因为 $u$ 是 $w$ 的祖先，染到 $u$ 时 $u$ 子树整块都还没动）。也就是说：

$$ w \text{ 对 } u \text{ 那一步贡献 } 1 \iff u \text{ 是 } w \text{ 的祖先（含自身）} $$

反过来数：点 $u$ 这一步能从多少个白点身上各收 $1$ 分？正好是“以 $u$ 为根的子树里的点数”，即 $\mathrm{size}_r(u)$。把所有 $u$ 加起来，总分就是全树的子树大小之和。证毕，干净利落。

代码里 `dfs1` 干的就是这件事——一边算子树大小 `sons[u]`，一边把它累加到 `dp[1]` 上，得到“以 $1$ 为根”的总分：

```cpp
auto dfs1 = [&](auto&& self, int u, int fa) -> void {
    sons[u] = 1;
    for (int v : g[u]) {
        if (v == fa) continue;
        self(self, v, u);
        sons[u] += sons[v];
    }
    dp[1] += sons[u];
};
```

注意它先递归子节点、回来再 `sons[u] += sons[v]`，所以 `sons[u]` 是正确的子树大小；而 `dp[1] += sons[u]` 把每个点的子树大小都吃进去，最终 `dp[1]` 就是以 $1$ 号点为起点的答案。

### 2. 暴力的尽头：每个点都 DFS 一遍？太慢了

现在思路其实已经完整了：枚举每个点当起点 $r$，算一遍子树大小之和，取最大。但如果对每个 $r$ 都重新跑一次 DFS，单次 $O(n)$、总共 $O(n^2)$，在 $2\times 10^5$ 下直接原地爆炸。

我们需要的是：在已经知道 `dp[1]`（以 $1$ 为根的答案）之后，能不能 **$O(1)$ 地从父亲的答案推出儿子的答案**？这正是换根 DP 的灵魂——别重算，去“挪根”。

### 3. 换根的魔法：把根从 u 挪到相邻的 v，只动两个数

设当前根在 $u$，我们想把根挪到它的邻居 $v$。换根前后，**整棵树的点没变，变的只是每个点子树的归属**。仔细看：当根从 $u$ 滑向 $v$ 时——

* $v$ 那一侧（原来的 $v$ 子树，共 $\mathrm{size}(v)$ 个点）：现在它们离根更近了，每个点的子树**恰好变大了** $\,?$；更准确地说，这部分整体的子树大小之和会发生变化。
* $u$ 那一侧（除去 $v$ 子树后剩下的 $n - \mathrm{size}(v)$ 个点）：它们现在挂到了 $v$ 底下。

把账算细一点：从 $u$ 为根换到 $v$ 为根，**唯一发生变化的两块**是“$v$ 子树”和“其余部分”。$v$ 子树里的 $\mathrm{size}(v)$ 个点，每个的子树都因为根远离而**少算了一层**，整体贡献减少 $\mathrm{size}(v)$；而其余 $n - \mathrm{size}(v)$ 个点现在都被 $v$ “收编”，整体贡献增加 $n - \mathrm{size}(v)$。合起来：

$$ \mathrm{dp}[v] = \mathrm{dp}[u] + \big(n - \mathrm{size}(v)\big) - \mathrm{size}(v) = \mathrm{dp}[u] + n - 2\,\mathrm{size}(v) $$

这就是代码里那行神来之笔，`sons[v]` 是 dfs1 里算好的、**以 $1$ 为根时** $v$ 的子树大小（在换根过程中我们始终用这个固定的子树大小，因为我们只沿着“$1$ 为根”的树边往下推，每条边的 $v$ 都在 $u$ 的下方）：

```cpp
auto dfs2 = [&](auto&& self, int u, int fa) -> void {
    for (int v : g[u]) {
        if (v == fa) continue;
        dp[v] = dp[u] + n - 2 * sons[v];
        self(self, v, u);
    }
};
```

从 `dp[1]` 出发，沿着原树一路 DFS 下去，每条边用一次上面的 $O(1)$ 公式，就能把**所有** `dp[v]` 全部填好。是不是很爽？

### 4. 收尾：扫一遍取最大

两遍 DFS 跑完，`dp[i]` 就是“以第 $i$ 个点为起点”的总得分。答案无脑取个最大值即可：

```cpp
int ans = 0;
for (int i = 1; i <= n; i++) {
    ans = max(ans, dp[i]);
}
```

拿样例 $1$（$n=9$）验一下感觉：标准答案是 $36$，正是某个最优起点对应的子树大小之和。整个算法两遍线性 DFS，复杂度 $O(n)$，空间 $O(n)$，对 $2\times 10^5$ 轻轻松松。

顺带提一句实现细节：因为答案是 $O(n^2)$ 级别（子树大小之和最坏接近 $\frac{n(n+1)}{2}$，约 $2\times 10^{10}$），妥妥爆 `int`。代码顶上那句 `#define int long long` 一开始就把这个坑填平了，丝毫不用操心溢出。

### CPP 代码实现

```cpp
// E. Tree Painting

#include <bits/stdc++.h>
#define lg(x) (63 - __builtin_clzll(x))
#define all(x) (x).begin(), (x).end()
#define low_bit(x) ((x) & (-x))
#define pb push_back
#define sz(x) (int)(x).size()
#define db long double
#define int long long
#define endl "\n"

using namespace std;

void solve() {

    int n;
    cin >> n;
    vector<vector<int>> g(n + 1);

    for (int i = 1; i < n; i++) {
        int u, v;
        cin >> u >> v;
        g[u].pb(v);
        g[v].pb(u);
    }

    vector<int> sons(n + 1, 0);
    vector<int> dp(n + 1, 0);

    auto dfs1 = [&](auto&& self, int u, int fa) -> void {
        sons[u] = 1;
        for (int v : g[u]) {
            if (v == fa) continue;
            self(self, v, u);
            sons[u] += sons[v];
        }
        dp[1] += sons[u];
    };

    auto dfs2 = [&](auto&& self, int u, int fa) -> void {
        for (int v : g[u]) {
            if (v == fa) continue;
            dp[v] = dp[u] + n - 2 * sons[v];
            self(self, v, u);
        }
    };
    dfs1(dfs1, 1, 0);
    dfs2(dfs2, 1, 0);
    int ans = 0;
    for (int i = 1; i <= n; i++) {
        ans = max(ans, dp[i]);
    }
    cout << ans << endl;

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
