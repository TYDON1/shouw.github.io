---
title: "CF题解——Destroy it! "
date: "2026-04-27 17:55:01"
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
 - 动态规划
 - 贪心
 - 状态机
---

# F. Destroy it! 解题思路

### 核心问题分析

题目的背景是一个卡牌游戏（Slay the Spire 杀戮尖塔的既视感）。
战斗分为 $n$ 个回合，每个回合你会拿到若干张牌，每张牌有费用 $c_i \in \{1, 2, 3\}$ 和伤害 $d_i$。
*   **回合限制**：每个回合你最多只能使用 **3 费**。没打出去的牌回合结束直接丢弃。
*   **强力神器**：你打出的**每第 10 张牌**，会造成**双倍伤害**！

我们的目标是：在 $n$ 个回合内合理安排出牌数量和顺序，使得打出的总伤害最大。

由于神器是在“每第 10 张牌”触发，所以我们每回合具体打出几张牌，会直接影响到后续回合触发双倍伤害的时机。这显然是一个**存在后效性的多阶段决策问题**，必须用动态规划（DP）来解决。

### 1. 状态定义：将“第 10 张牌”化作模 10 的状态机

为了消除后效性，我们需要在 DP 状态中记录“当前已经打出的牌数，距离触发下一次双倍还有多远”。
因为每 10 张一循环，我们只需要记录打出牌数**对 10 取模**的结果即可。

定义状态 `dp[i][j]`：
在结束了前 $i$ 个回合后，累计打出牌的数量 $\bmod 10 = j$ 时，能造成的**最大总伤害**。
其中 $i \in [1, n]$，$j \in [0, 9]$。

### 2. 回合内贪心：如何在 3 费内把伤害拉满？

DP 的核心是状态转移，也就是从第 $i-1$ 回合进入第 $i$ 回合时，我们在第 $i$ 回合应该打哪些牌？
因为每回合费用上限只有 **3 费**，而且牌的费用只能是 1、2、3。所以我们在单个回合内能打出的牌的数量，只有可能是 **1 张、2 张、3 张**（或者 0 张）。

为了让伤害最大化，我们要在这几种打牌张数的组合里，挑出伤害最高的：
*   **打 1 张牌 (1 费/2 费/3 费)**：很简单，直接在所有 1 费、2 费、3 费牌里，挑一张伤害最高的。
*   **打 2 张牌**：有两种可能：
    *   两张 1 费：挑伤害最大的两张 1 费牌。
    *   一张 1 费 + 一张 2 费：挑最大的 1 费牌和最大的 2 费牌。
*   **打 3 张牌**：只有一种可能，也就是全打 1 费牌。挑伤害最大的三张 1 费牌。

**神器的影响：**
如果在这一回合我们打出了 $k$ 张牌，使得总数跨越了 10 的边界（即 $j_{prev} + k \ge 10$），说明这回合打出的这 $k$ 张牌里，必定有一张能吃到**双倍伤害**！
因为出牌顺序是由我们自己决定的，为了贪心，我们一定会把这回合挑选出的 $k$ 张牌里，**单卡伤害最高**的那一张留在吃双倍的位置上打出。

### 3. 具体实现：分情况转移

我们在处理第 $i$ 回合之前，先用 `multiset` 或者降序排序的方式，提取出本回合的极值：
*   `n_1`：打 1 张牌的最大基础伤害。
*   `n_1_max`：打 1 张牌时，单卡最高伤害（显然和 `n_1` 相等）。
*   `n_2_1`：打 2 张 1 费牌的最大基础伤害。
*   `n_2_1_max`：这两张 1 费牌里单卡伤害最高的那张。
*   `n_2_2`：打 1 张 1 费 + 1 张 2 费的最大基础伤害。
*   `n_2_2_max`：这两张牌里单卡伤害最高的那张。
*   `n_3`：打 3 张 1 费牌的最大基础伤害。
*   `n_3_max`：这三张牌里单卡伤害最高的那张。

然后用前一层 `dp[i-1][j]` 的值，去加上这四种组合的伤害，更新 `dp[i][(j + 出牌数) % 10]`。
注意判断跨越边界时，要额外加上对应的 `_max` 值作为双倍收益。

### CPP 代码实现

```cpp
// CF1176F Destroy it!

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
    
    // dp[i][j] 代表前 i 个回合，打出的卡牌数量模 10 为 j 时的最大伤害
    // 初始化为 -1 代表该状态不可达
    vector<vector<int>> dp(n + 1, vector<int>(10, -1));
    dp[0][0] = 0;
    
    for (int i = 1; i <= n; i++) {
        int k;
        cin >> k;
        
        // 记录本回合各种出牌张数组合的最大基础伤害，-1 表示牌不够无法达成
        int n_1 = -1, n_2_1 = -1, n_2_2 = -1, n_3 = -1;
        // 记录各种组合中，用于触发双倍的单卡最高伤害
        int n_1_max = -1, n_2_1_max = -1, n_2_2_max = -1, n_3_max = -1;
        
        multiset<int> all_3;
        multiset<int> all_2;
        multiset<int> all_1;
        
        // 收集本回合的牌，按费用分类
        for (int j = 1; j <= k; j++) {
            int x, y;
            cin >> x >> y; // x 是费用，y 是伤害
            if (x == 1) all_1.insert(y);
            if (x == 2) all_2.insert(y);
            if (x == 3) all_3.insert(y);
        }
        
        auto it_3 = all_3.end();
        auto it_2 = all_2.end();
        auto it_1 = all_1.end();
        
        // 提取打 1 张牌的最优解（在所有费用里挑最大的）
        if (sz(all_3) >= 1) {
            n_1 = max(n_1, *prev(it_3));
            n_1_max = max(n_1_max, n_1);
        }
        if (sz(all_2) >= 1) {
            n_1 = max(n_1, *prev(it_2));
            n_1_max = max(n_1_max, n_1);
        }
        if (sz(all_1) >= 1) {
            n_1 = max(n_1, *prev(it_1));
            n_1_max = max(n_1_max, n_1);
        }
        
        // 提取打 3 张牌的最优解（只能是三张 1 费）
        if (sz(all_1) >= 3) {
            n_3 = max(n_3, *prev(it_1) + *prev(it_1, 2) + *prev(it_1, 3));
            n_3_max = max({n_3_max, *prev(it_1), *prev(it_1, 2), *prev(it_1, 3)});
        }
        
        // 提取打 2 张牌的最优解（两张 1 费）
        if (sz(all_1) >= 2) {
            n_2_1 = max(n_2_1, *prev(it_1) + *prev(it_1, 2));
            n_2_1_max = max({n_2_1_max, *prev(it_1), *prev(it_1, 2)});
        }
        
        // 提取打 2 张牌的最优解（一张 1 费 + 一张 2 费）
        if (sz(all_1) >= 1 && sz(all_2) >= 1) {
            n_2_2 = max(n_2_2, *prev(it_2) + *prev(it_1));
            n_2_2_max = max({n_2_2_max, *prev(it_2), *prev(it_1)});
        }
        
        // 开始状态转移
        for (int j = 0; j <= 9; j++) {
            if (dp[i - 1][j] == -1) continue;
            
            // 策略 0：本回合一张牌都不打
            dp[i][j] = max(dp[i][j], dp[i - 1][j]);
            
            // 策略 1：打出 1 张最优的牌
            if (n_1 != -1) {
                int add = n_1;
                int now = j + 1;
                // 如果刚好跨越了 10 的倍数，触发双倍
                if (now >= 10) {
                    now %= 10;
                    add += n_1_max;
                }
                dp[i][now] = max(dp[i][now], dp[i - 1][j] + add);
            }
            
            // 策略 2：打出两张 1 费最优的牌
            if (n_2_1 != -1) {
                int now = j + 2;
                int add = n_2_1;
                if (now >= 10) {
                    now %= 10;
                    add += n_2_1_max;
                }
                dp[i][now] = max(dp[i][now], dp[i - 1][j] + add);
            }
            
            // 策略 3：打出 1张1费 + 1张2费 最优的牌
            if (n_2_2 != -1) {
                int now = j + 2;
                int add = n_2_2;
                if (now >= 10) {
                    now %= 10;
                    add += n_2_2_max;
                }
                dp[i][now] = max(dp[i][now], dp[i - 1][j] + add);
            }
            
            // 策略 4：打出三张 1 费最优的牌
            if (n_3 != -1) {
                int now = j + 3;
                int add = n_3;
                if (now >= 10) {
                    now %= 10;
                    add += n_3_max;
                }
                dp[i][now] = max(dp[i][now], dp[i - 1][j] + add);
            }
        }
    }
    
    // 遍历第 n 回合的所有可能余数状态，取最大伤害
    int ans = 0;
    for (int i = 0; i <= 9; i++) {
        ans = max(ans, dp[n][i]);
    }
    cout << ans << endl;
}

signed main() {
    // 优化输入输出
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    // cin >> t; // 单组测试数据
    
    while (t--) {
        solve();
    }
}
```