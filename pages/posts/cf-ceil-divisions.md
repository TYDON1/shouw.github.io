---
title: "CF题解——Ceil Divisions"
date: "2026-05-02 22:31:25"
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
 - 数学
 - 贪心
---

# D. Ceil Divisions 解题思路

### 核心问题分析

题意非常简单明了：有一个长度为 $n$ 的数组，初始值为 $1, 2, \dots, n$。每次操作你可以选两个位置 $x, y$，让 $a_x = \lceil a_x / a_y \rceil$。你的最终目的是把数组变成 $n-1$ 个 `1` 和 $1$ 个 `2`。
重点是操作次数的限制：**不能超过 $n+5$ 次**。

如果不看这个次数限制，我们脑子里会蹦出一个最朴素的贪心策略：
想要把一个数变成 $1$，最快的方法就是用一个比它大的数去除它（小数除以大数向上取整必定是 $1$）。
所以我们可以依次把 $3, 4, \dots, n-1$ 去除以 $n$。这样前 $n-1$ 个数全变成了 $1$（除了我们特意保留的 $2$）。这一步固定消耗 $n-3$ 次操作。
现在数组里只剩下 $1, 2, 1, \dots, 1, n$。我们只需要把 $n$ 变成 $1$ 就行了。怎么变？不断让 $n$ 除以 $2$ 即可。
这种做法的耗时是多少呢？$n \le 200000$，不断除以 $2$ 大概需要 $\lceil \log_2(200000) \rceil = 18$ 次。
总次数就是 $(n-3) + 18 = n+15$。这就遗憾地超过了题目规定的 $n+5$。

### 1. 突破口：寻找“黄金基石”

既然 $n$ 不断除以 $2$ 降级太慢了，我们会想：如果能用一个比 $2$ 大的数字去削弱 $n$ 呢？
假设我们在 $3 \dots n-1$ 中，特意**保留一个数字 $X$ 不把它变成 $1$**。
* 先把除了 $X$ 以外的数字变成 $1$（消耗 $n-4$ 步）。
* 然后让 $n$ 不断除以 $X$，直到 $n$ 变成 $1$。
* 最后让 $X$ 不断除以 $2$，直到 $X$ 变成 $1$。

这样总步数 = $(n-4) + (\text{n 除以 X 的次数}) + (\text{X 除以 2 的次数})$。
我们的目标是让后面两项之和 $\le 9$。

到底选哪个数作为 $X$ 呢？很多同学可能想着去根据 $n$ 动态求平方根，写出极度复杂的分类讨论。
但在算法竞赛的工程实现中，最高级的操作往往是**暴力常数降维打击**。

### 2. 魔法数字 8 的极致美学

其实我们完全不需要动态计算，**直接把 $X$ 定死为 8** 就能包打天下！

让我们来算一笔账：如果 $X = 8$
* 把 $8$ 不断除以 $2$ 需要几次？$\lceil 8/2 \rceil = 4, \lceil 4/2 \rceil = 2, \lceil 2/2 \rceil = 1$。**固定需要 3 次。**
* 把最大的 $n = 200000$ 不断除以 $8$ 需要几次？
  $200000 \to 25000 \to 3125 \to 391 \to 49 \to 7 \to 1$。**最多只需要 6 次！**

把它们代入总步数：
$$ (n-4) + 6 + 3 = n+5 $$
完美！严丝合缝地踩在了题目规定的 $n+5$ 次操作上！
只要 $n > 8$，我们无脑选用 8 作为基石，这道复杂的构造题瞬间变成了一道写 if-else 的水题。

### 3. 具体操作流程（链式清扫法）

在代码实现中，如何用最简单的代码把一段区间的数变成 $1$？
题目里初始数组是递增的。所以对于位置 $i$，我们直接让 $a_i = \lceil a_i / a_{i+1} \rceil$，因为它除以的是比自己大的数，一步就会变成 $1$，而且丝毫不影响后面的大数！这就是**链式清扫法**。

1. **当 $n \le 8$ 时**：图比较小，不需要基石。
   * 把 $3 \dots n-1$ 链式清扫成 $1$。
   * 把 $n$ 不断除以 $2$ 变成 $1$。
2. **当 $n > 8$ 时**：
   * 避开 8，把 $3 \dots 7$ 链式清扫成 $1$。
   * 把 $9 \dots n-1$ 链式清扫成 $1$。
   * 把 $n$ 连除 8 变成 $1$。
   * 把 8 连除 2 三次变成 $1$。

### CPP 代码实现

```cpp
// D. Ceil Divisions

#include <bits/stdc++.h>
#include <ext/pb_ds/assoc_container.hpp>
#include <ext/pb_ds/tree_policy.hpp>
#define lg(x) (63 - __builtin_clzll(x))
#define all(x) (x).begin(), (x).end()
#define low_bit(x) ((x) & (-x))
#define pb push_back
#define db long double
#define int long long
#define sz(x) (int)x.size()
#define endl "\n"

using namespace std;
using namespace __gnu_pbds;

struct custom_hash {
    static uint64_t splitmix64(uint64_t x) {
        x += 0x9e3779b97f4a7c15;
        x = (x ^ (x >> 30)) * 0xbf58476d1ce4e5b9;
        x = (x ^ (x >> 27)) * 0x94d049bb133111eb;
        return x ^ (x >> 31);
    }
    size_t operator()(uint64_t x) const {
        static const uint64_t FIXED_RANDOM = chrono::steady_clock::now().time_since_epoch().count();
        return splitmix64(x + FIXED_RANDOM);
    }
};

template<typename K, typename V> 
using hash_map = gp_hash_table<K, V, custom_hash>;
template<typename T> 
using ordered_set = tree<T, null_type, less<T>, rb_tree_tag, tree_order_statistics_node_update>;
template<typename T> 
using ordered_multiset = tree<T, null_type, less_equal<T>, rb_tree_tag, tree_order_statistics_node_update>;

void solve() {
    int n;
    cin >> n;
    
    // 记录每一步的操作对 (x, y)
    vector<pair<int, int>> a;
    
    if (n <= 8) {
        // 数据规模较小，无需使用 8 作为中间基石
        // 直接链式清扫 3 到 n-1
        for (int i = 3; i < n; i++) {
            a.pb({i, i + 1});
        }
        // 将 n 不断除以 2 直到变为 1
        int temp = n;
        while (temp != 1) {
            temp = (temp + 1) / 2; // 模拟向上取整
            a.pb({n, 2});
        }
    } else {
        // 数据规模大，祭出魔法数字 8 作为基石
        // 避开 8，清扫 3 到 7
        for (int i = 3; i < 8; i++) {
            a.pb({i, i + 1});
        }
        // 清扫 9 到 n-1
        for (int i = 9; i < n; i++) {
            a.pb({i, i + 1});
        }
        
        // 将 n 不断除以 8 直到变为 1
        int temp = n;
        while (temp != 1) {
            temp = (temp + 7) / 8; // 模拟向上取整
            a.pb({n, 8});
        }
        
        // 最后将基石 8 除以 2 三次，回归为 1
        a.pb({8, 2});
        a.pb({8, 2});
        a.pb({8, 2});
    }
    
    // 输出总操作次数
    cout << sz(a) << endl;
    // 输出具体操作路径
    for (auto it : a) {
        cout << it.first << " " << it.second << endl;
    }
}

signed main() {
    // 优化 IO 性能
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    cin >> t; 

    while (t--) {
        solve();
    }
}
```