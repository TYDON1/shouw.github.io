---
title: "CF题解——Sheriff's Defense"
date: "2026-03-27 18:51:10"
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
 - 动态规划
 - 贪心
---

# F. Sheriff's Defense 解题思路

### 核心问题分析

题目的背景很有意思：在由营地（节点）和相连小路（边）构成的一棵树上，我们可以选择“强化”一部分营地。
规则是：如果你强化了某个营地，它就可以被保留并计入最终的金币总和。但是，**它会从所有与它相连的相邻营地中各自偷走 $c$ 个金币**。没有被强化的营地会被摧毁，其金币不计入总和。

我们要在一个树形结构上做“选与不选”的决策，求最大收益。毫无疑问，这是一道非常典型的**树形 DP**。

### 1. 题意化简：拨开“偷金币”的迷雾

初看这个“偷走 $c$ 个金币”的设定会觉得非常复杂，因为我们要考虑相邻节点的连锁反应。但如果你静下心来仔细分析，把视角拉高到“全局收益”，就会发现一个极度优雅的结论：

假设有相邻的两个营地 $u$ 和 $v$：
1. **只强化 $u$，不强化 $v$：** $u$ 从 $v$ 偷走 $c$ 个金币。但是，$v$ 没有被强化，最后会被摧毁，它的死活和最终统计的总金币无关！也就是说，这 $c$ 个金币的损失**相当于白嫖**，对全局收益**没有惩罚**。
2. **$u$ 和 $v$ 都不强化：** 都不计入总和，无事发生。
3. **$u$ 和 $v$ 同时被强化：** $u$ 偷了 $v$ 的 $c$ 个金币（$v$ 的收益 $-c$），$v$ 也偷了 $u$ 的 $c$ 个金币（$u$ 的收益 $-c$）。因为 $u$ 和 $v$ 最后都会计入总和，所以**全局收益实打实地减少了 $2c$**！

**顿悟时刻：** 这道题的本质就是：在树上任选一个节点集合，初始收益为它们的原始金币之和。**如果集合中存在一条边连接了两个都被选中的节点，那么总收益就要扣除 $2c$。**

### 2. 定义状态与转移方程

正如我之前关于 DP 的文章里提到的，对于树上问题，我们直接根据“选或不选”来定义维度的状态：
* `dp[u].a` 表示：在以 $u$ 为根的子树中， **不强化（不选择）**节点 $u$ 时的最大金币收益。
* `dp[u].b` 表示：在以 $u$ 为根的子树中， **强化（选择）**节点 $u$ 时的最大金币收益。

接下来我们从下往上推导状态转移（假设 $v$ 是 $u$ 的子节点）：

* **如果当前节点 $u$ 不强化（求 `dp[u].a`）：**
  既然 $u$ 没被选中，那它和子节点 $v$ 之间绝对不可能产生 $2c$ 的扣费惩罚。所以，子节点 $v$ 想选就选，不想选就不选，直接挑 $v$ 的最大收益即可。
  $$ dp[u].a += \max(dp[v].a, \, dp[v].b) $$

* **如果当前节点 $u$ 强化（求 `dp[u].b`）：**
  这时候就要小心了。如果子节点 $v$ **不选**（`dp[v].a`），那相安无事，没有惩罚。
  如果子节点 $v$ **也选了**（`dp[v].b`），那 $u$ 和 $v$ 之间就触发了互相伤害机制，总收益必须扣除 $2c$。
  同样作为贪心的人，我们在这两种情况里挑个大的。最后别忘了加上 $u$ 营地原本的金币！
  $$ dp[u].b += \max(dp[v].a, \, dp[v].b - 2c) $$
  $$ dp[u].b += vals[u] $$

### CPP 代码实现

下面是代码实现，严格遵循了模块化原则，将 DP 转移逻辑完美封装在了一次 DFS 遍历中。

```cpp
// F. Sheriff's Defense

#include <bits/stdc++.h>
#define lg(x) (63 - __builtin_clzll(x))
#define all(x) (x).begin(), (x).end()
#define low_bit(x) ((x) & (-x))
#define pb push_back
#define db long double
#define int long long
#define endl "\n"

using namespace std;

// 封装 DP 状态节点
struct Node {
    int a; // a: 当前节点不被强化时的最大收益
    int b; // b: 当前节点被强化时的最大收益
};

// 树形 DP 核心搜索模块
// c: 题目给定的单次偷取惩罚值
// pre: 父节点，防止 DFS 往回走死循环
// cur: 当前遍历到的节点
void dfs(int c, int pre, int cur, vector<vector<int>> &g, vector<Node> &dp, vector<int> &vals) {

    // 遍历当前节点的所有子节点
    for (auto it : g[cur]) {
        // 树的遍历基本操作：不能回头访问父节点
        if (it == pre) continue;
        
        // 递归到底，先计算出子节点的 DP 状态（后序遍历思想）
        dfs(c, cur, it, g, dp, vals);
        
        // 状态转移 1：如果当前节点 cur 不被强化，无任何惩罚
        // 收益加上子节点 it 选或不选的最大值
        dp[cur].a += max(dp[it].a, dp[it].b);
        
        // 状态转移 2：如果当前节点 cur 被强化
        // 需要权衡子节点被强化时产生的 2c 惩罚
        dp[cur].b += max(dp[it].a, dp[it].b - 2 * c);
    }
    
    // 最后，如果当前节点被强化，别忘了加上它本身的初始金币
    dp[cur].b += vals[cur];
}

void solve() {
    int n, c;
    cin >> n >> c;
    
    vector<int> vals(n + 1);
    vector<Node> dp(n + 1);
    vector<vector<int>> g(n + 1); // 邻接表存树
    
    // 读取每个营地的初始金币
    for (int i = 1; i <= n; i++) cin >> vals[i];
    
    // 读取树的 n-1 条边
    for (int i = 1; i < n; i++) {
        int u, v;
        cin >> u >> v;
        g[u].pb(v);
        g[v].pb(u);
    }
    
    // 假设 1 号节点为根，启动 DFS
    dfs(c, 0, 1, g, dp, vals);
    
    // 全局最优解就是根节点 1 被强化和不被强化之间的最大值
    cout << max(dp[1].a, dp[1].b) << endl;
}

signed main() {
    // 优化输入输出
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    cin >> t; 
    
    while (t--) {
        solve();
    }
}
```