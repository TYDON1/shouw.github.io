---
title: "CF题解——Lucky Country"
date: "2026-04-23 21:17:20"
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
 - 并查集
 - 动态规划
 - 背包问题
 - 二进制分组
---

# E. Lucky Country 解题思路

### 核心问题分析

题目的故事很有趣：一个国家由很多岛屿组成，有路相连的岛屿构成一个“区域”。我们要在这个国家里找一个“幸运区域”（岛屿数量的十进制表示里只有 4 和 7）。
如果当前没有幸运区域，我们可以在不同区域之间**修路**，把它们连起来。问：最少修多少条路，能搞出一个幸运区域？

很多同学看到“岛屿”、“修路”，第一反应是去搞复杂的图论算法（比如最小生成树、最短路之类的）。但我们静下心来，剥开这道题的伪装，它其实是一个极其经典的**组合优化问题**。

### 1. 破局点：修路的本质是什么？

首先，图里原本就已经有了一些连通的区域。我们可以用**并查集 (DSU)** 轻松把这些连通块找出来，并求出每个连通块包含的岛屿数量（也就是这个连通块的 Size）。
* 如果一上来就有某个连通块的 Size 是幸运数字，那皆大欢喜，直接输出 `0`。

如果都没有呢？我们需要把几个连通块合并。
假设我们挑选了 $k$ 个独立的连通块，把它们连成一整块，我们需要修几条路？
因为它们原本是分离的，要连成一个整体，最少只需要修 **$k - 1$ 条路**（也就是把它们串成一棵树）。合并后，新连通块的 Size 就是这 $k$ 个连通块 Size 的总和。

**顿悟时刻：**
这道题的本质被彻底揭露：**给定一堆物品（连通块），每个物品的重量是它的 Size。我们要从中挑选出若干个物品，使得它们的总重量恰好等于一个“幸运数字”。在所有合法的挑选方案中，要求挑选的“物品数量 $k$”最少！**
这不就是大名鼎鼎的**背包问题**吗！

### 2. 模型转化：带价值的背包

我们把连通块转化为背包里的物品：
* **重量 (Weight)**：连通块的 Size。
* **价值 (Value)**：不管连通块多大，它作为一个独立的个体，被选中时消耗的个数就是 1。所以价值统统为 1。
* **背包容量**：所有可能构成答案的幸运数字（不超过总岛屿数 $10^5$）。

我们定义状态 `dp[j]` 表示：**拼凑出总 Size 为 $j$ 的区域，最少需要多少个连通块。**
那么最终的答案就是：在所有是幸运数字的 $j$ 中，找一个最小的 `dp[j]`，然后输出 `dp[j] - 1`。

### 3. 性能优化：二进制分组的多重背包

如果只是普通的 0-1 背包，我们有 $n$ 个连通块，容量最大是 $n$，时间复杂度是 $O(n^2)$。当 $n = 10^5$ 时，绝对会 TLE 到怀疑人生。

但注意到一个非常关键的性质：**连通块的 Size 是有很多重复的！**
比如有 100 个 Size 为 1 的孤岛，把它们当成 100 个独立的物品去跑 0-1 背包简直是暴殄天物。这就是经典的**多重背包问题**。
为了把时间复杂度降下来，我们必须祭出背包优化的杀手锏：**二进制分组优化**。

如果某一种 Size 的连通块有 $C$ 个，我们不要把它拆成 $C$ 个 1，而是把它打包成：$1$ 个、$2$ 个、$4$ 个、$\dots$ 以及最后剩下的一小撮。
这样，原本需要跑 $C$ 次的循环，被极其优雅地压缩到了 $\log_2(C)$ 次！
时间复杂度从 $O(n^2)$ 骤降至 $O(n \sqrt{n})$ 级别，对于 $10^5$ 的数据，一两百毫秒就能完美碾过评测机。

### CPP 代码实现

```cpp
// E. Lucky Country

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

// 模块化封装并查集，并顺手维护每个集合的 Size
struct DSU {
    vector<int> par;
    vector<int> sz;

    DSU(int n) {
        par.resize(n + 1);
        sz.resize(n + 1, 1);
        iota(par.begin(), par.end(), 0);
    }

    int find(int x) {
        if (par[x] == x) return par[x];
        return par[x] = find(par[x]);
    }

    void unite(int x, int y) {
        int root_x = find(x);
        int root_y = find(y);
        if (root_x == root_y) return;
        // 按秩合并，把小的挂到大的上面
        if (sz[root_x] < sz[root_y]) swap(root_x, root_y);
        par[root_y] = root_x;
        sz[root_x] += sz[root_y];
    }

    bool connected(int x, int y) {
        return find(x) == find(y);
    }

    int get_sz(int x) {
        return sz[find(x)];
    }
};

// 检查一个数字是否是“幸运数字”（只包含 4 和 7）
bool check(int x) {
    while (x > 0) {
        int now = x % 10;
        if (now == 4 || now == 7) {
            x /= 10;
            continue;
        }
        return false;
    }
    return true;
}

void solve() {
    int n, m;
    cin >> n >> m;
    DSU dsu(n);
    
    // 建图，合并连通块
    for (int i = 1; i <= m; i++) {
        int u, v;
        cin >> u >> v;
        dsu.unite(u, v);
    }
    
    // cnt 记录每种 Size 的连通块各有多少个
    map<int, int> cnt;
    for (int i = 1; i <= n; i++) {
        // 只统计每个连通块的“代表元（根节点）”，避免重复计算
        if (dsu.find(i) == i) {
            int sz_n = dsu.get_sz(i);
            
            // 剪枝：如果本身就有现成的幸运连通块，直接修 0 条路搞定！
            if (check(sz_n)) {
                cout << 0 << endl;
                return;
            }
            cnt[sz_n]++;
        }
    }
    
    // 动态规划初始化：dp[j] 表示凑成总 Size 为 j 最少需要多少个连通块
    vector<int> dp(1e5 + 10, LLONG_MAX);
    dp[0] = 0; // 凑成 Size 为 0 需要 0 个连通块
    
    // 多重背包的二进制分组优化
    for (auto it : cnt) {
        int c = it.second; // 这种 Size 有 c 个
        int w = it.first;  // 这种 Size 的重量是 w
        int v = 1;         // 这种 Size 作为一个个体的价值是 1
        
        // 按照 1, 2, 4, 8... 进行打包
        for (int i = 1; i <= c; i <<= 1) {
            int ws = w * i; // 打包后的重量
            int vs = v * i; // 打包后的价值（包含了几个连通块）
            
            // 标准的 0-1 背包内层循环（倒序遍历防止重复取）
            for (int j = 1e5 + 7; j >= 0; j--) {
                if (j - ws < 0) break;
                if (dp[j - ws] == LLONG_MAX) continue;
                if (dp[j] > dp[j - ws] + vs) {
                    dp[j] = dp[j - ws] + vs;
                }
            }
            c -= i; // 扣除已经打包的数量
        }
        
        // 把最后剩下的一小撮打包
        if (c > 0) {
            int ws = w * c;
            int vs = v * c;
            for (int j = 1e5 + 7; j >= 0; j--) {
                if (j - ws < 0) break;
                if (dp[j - ws] == LLONG_MAX) continue;
                if (dp[j] > dp[j - ws] + vs) {
                    dp[j] = dp[j - ws] + vs;
                }
            }
        }
    }
    
    int ans = LLONG_MAX;
    
    // 遍历所有可能的幸运数字容量，找一个用到连通块数量最少的
    for (int i = 1; i <= 1e5 + 7; i++) {
        if (check(i)) {
            if (dp[i] != LLONG_MAX) {
                ans = min(ans, dp[i]);
            }
        }
    }
    
    // 如果所有的幸运数字都凑不出来，那就是没救了
    if (ans == LLONG_MAX) {
        cout << -1 << endl;
    } else {
        // ans 个连通块，只需要连 ans - 1 条路
        cout << ans - 1 << endl;
    }
}

signed main() {
    // 优化 IO
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    // cin >> t; // 单组数据
    
    while (t--) {
        solve();
    }
}