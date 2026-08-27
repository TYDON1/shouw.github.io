---
title: "CF题解——Yet Another Minimization Problem"
date: "2026-06-03 21:34:52"
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
 - DP
 - 分治
 - 双指针
---

# F. Yet Another Minimization Problem 解题思路

### 核心问题分析

题意：给定长度为 $n$ 的数组 $a$，定义一个子段的“代价”为该子段内**值相同的无序数对个数**。要把整个数组切成 $k$ 个非空、不相交的连续子段（切完要覆盖每个元素恰好一次），最小化所有子段代价之和。

数据范围：$2 \le n \le 10^5$，$2 \le k \le \min(n, 20)$，$2$ 秒时限。$k$ 只有 $20$ 这个上界特别显眼——它几乎就是在暗示我们枚举“切了多少刀”的复杂度可以是线性甚至带 $\log$ 的，而不是指数级。

### 1. 朴素 DP：分层转移

设 $dp[p][i]$ 表示把前 $i$ 个数切成 $p$ 段的最小总代价，转移显然是

$$ dp[p][i] = \min_{p-1 \le j < i} \Big( dp[p-1][j] + cost(j+1, i) \Big) $$

其中 $cost(l, r)$ 就是子段 $a[l..r]$ 里相同值对的个数。这个 DP 本身是 $O(n^2 k)$ 的：$k$ 层，每层 $O(n^2)$ 个转移。$n = 10^5$ 的情况下这个复杂度直接爆炸，必须把每一层的转移从 $O(n^2)$ 降下来。

### 2. 决策单调性：分治优化 DP

注意到 $cost(l, r)$ 这个代价函数满足一个很好的性质：区间越长，代价具有“凸”的堆叠结构（四边形不等式那味儿），这类代价函数配合线性 DP 转移，几乎总能推出**决策单调性**——也就是说，如果记 $opt(i)$ 为 $dp[p][i]$ 取到最优值时对应的最优分割点 $j$，那么 $opt(i)$ 关于 $i$ 是单调不降的。

有了决策单调性，每一层转移就可以用经典的**分治优化 DP**来做：

```cpp
auto divide = [&](auto&& self, int l, int r, int opt_l, int opt_r) -> void {
    if (l > r) return;
    int mid = (l + r) >> 1;
    int best = INF, best_j = opt_l;
    for (int j = opt_l; j <= min(mid, opt_r); j++) {
        // 在允许的决策区间里暴力找 mid 的最优分割点
    }
    dp[p][mid] = best;
    self(self, l, mid - 1, opt_l, best_j);   // mid 左边的决策点不会超过 best_j
    self(self, mid + 1, r, best_j, opt_r);   // mid 右边的决策点不会小于 best_j
};
```

先算出中点 $mid$ 的最优决策点 $best\_j$，再利用单调性把左右两半的搜索范围都收窄，整体只需要 $O(n \log n)$ 次“决策点比较”，而不是 $O(n^2)$。$k$ 层下来就是 $O(nk \log n)$ 次比较——但这里还留了一个大坑没填：**每次比较都要算一次 $cost(j, mid)$，这个东西怎么求？**

### 3. 双指针维护 $cost$：把区间代价摊到滑动窗口上

如果每次都从头统计 $cost(j, mid)$，一次就是 $O(n)$，套在分治里complexity 直接失控。这里的关键观察是：分治优化 DP 递归下去的过程中，虽然 $j$ 和 $mid$ 在跳来跳去，但它们的**移动范围是有界的**——同一层递归里，各个子问题的 $[opt\_l, opt\_r]$ 区间互不重叠且总长为 $n$，所以可以用一对指针 $cur\_l, cur\_r$ 去逼近任意一次询问的 $[L, R]$，靠“移动一步，加一个数或删一个数”来增量维护代价：

```cpp
auto add = [&](int x) {
    cur_cost += cnt[a[x]]; // 新加进来的数，会跟窗口里所有和它相等的数各贡献一对
    cnt[a[x]]++;
};
auto del = [&](int x) {
    cnt[a[x]]--;
    cur_cost -= cnt[a[x]];
};
auto get_cost = [&](int L, int R) {
    while (cur_l > L) add(--cur_l);
    while (cur_r < R) add(++cur_r);
    while (cur_l < L) del(cur_l++);
    while (cur_r > R) del(cur_r--);
    return cur_cost;
};
```

这本质上就是莫队算法里那套“双指针加减貌似暴力、总移动次数却有界”的手感。结合分治优化 DP 的区间划分结构，可以证明单层递归里指针总移动距离是 $O(n \log n)$，于是整个 `get_cost` 的调用总代价也被摊到了 $O(n \log n)$ 上，而不是朴素地重新扫一遍。

### 4. 组装 + 复杂度

先用一次线性扫描把 $dp[1][i] = cost(1, i)$ 全部预处理出来（$j=0$ 到 $n$ 依次扩张窗口），然后对 $p = 2, \dots, k$ 依次跑一次 `divide(1, n, 1, n)`，每次都基于上一层的 $dp[p-1]$ 转移。整体复杂度是

$$ O(nk \log n) $$

$n = 10^5$，$k \le 20$，算下来也就是几百万到千万级别的操作，$2$ 秒轻松跑完。

回头看这道 $*2500$ 的题，真正的门槛不在于“想到分治优化 DP”——这是个相对成熟的套路——而在于配套地想到用**双指针增量维护代价**去填上转移里 $cost$ 函数的计算这个坑。两个经典技巧各自都不难，难的是意识到它们能拼在一起，而且指针移动的总代价恰好也能被分治的区间结构管住。

### CPP 代码实现

```cpp
// F. Yet Another Minimization Problem

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

const int INF = 4e18;

void solve() {

    int n, k;
    cin >> n >> k;
    vector<int> a(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];

    vector<vector<int>> dp(k + 1, vector<int>(n + 1, INF));
    vector<int> cnt(n + 1, 0);
    int cur_l = 1, cur_r = 0, cur_cost = 0;

    auto add = [&](int x) {
        cur_cost += cnt[a[x]];
        cnt[a[x]]++;
    };
    auto del = [&](int x) {
        cnt[a[x]]--;
        cur_cost -= cnt[a[x]];
    };
    auto get_cost = [&](int L, int R) {
        while (cur_l > L) add(--cur_l);
        while (cur_r < R) add(++cur_r);
        while (cur_l < L) del(cur_l++);
        while (cur_r > R) del(cur_r--);
        return cur_cost;
    };

    for (int i = 1; i <= n; i++) dp[1][i] = get_cost(1, i);

    for (int p = 2; p <= k; p++) {
        auto divide = [&](auto&& self, int l, int r, int opt_l, int opt_r) -> void {
            if (l > r) return;
            int mid = (l + r) >> 1;
            int best = INF, best_j = opt_l;
            for (int j = opt_l; j <= min(mid, opt_r); j++) {
                if (dp[p - 1][j - 1] == INF) continue;
                int cost = dp[p - 1][j - 1] + get_cost(j, mid);
                if (cost < best) best = cost, best_j = j;
            }
            dp[p][mid] = best;
            self(self, l, mid - 1, opt_l, best_j);
            self(self, mid + 1, r, best_j, opt_r);
        };
        divide(divide, p, n, p, n);
    }

    cout << dp[k][n] << endl;

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
