---
title: "CF题解——Love-Hate"
date: "2026-06-10 21:36:24"
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
 - 位运算
 - 随机化
 - 高维前缀和
---

# D. Love-Hate 解题思路

### 核心问题分析

题意：$n$ 个朋友，$m$ 种货币。给出一个 $n \times m$ 的 01 矩阵，第 $i$ 行第 $j$ 列为 $1$ 表示朋友 $i$ 喜欢货币 $j$。保证**每个朋友最多只喜欢 $p$ 种货币**。要求找出一个**尽可能大**的货币子集 $S$，使得至少有 $\lceil n/2 \rceil$ 个朋友**同时喜欢 $S$ 里的每一种货币**，输出这个 $S$。

数据范围很有意思：$n \le 2 \times 10^5$ 很大，但 $m \le 60$、$p \le 15$ 特别小。$m \le 60$ 提示我们每个朋友的喜好可以压成一个 $64$ 位整数，而 $p \le 15$——那个 $2^{15} = 32768$ 简直是在明示状压。问题在于，直接在 $m = 60$ 个货币上枚举子集是 $2^{60}$，完全不可能。$p$ 这个约束到底怎么用上？

### 1. 关键观察：答案一定是某个朋友喜好集合的子集

先想一件很朴素的事：假设最优解是集合 $S$，它被至少 $\lceil n/2 \rceil$ 个朋友"全盘接受"。随便挑出这些朋友中的一个，记他的喜好集合为 $T$，那么必然有

$$ S \subseteq T $$

因为他喜欢 $S$ 里的每一种货币嘛。而 $|T| \le p \le 15$，所以

> **答案 $S$ 一定是某个朋友的喜好集合的子集，而那个集合最多只有 $15$ 个元素。**

这就把搜索空间从 $2^{60}$ 砍到了「枚举某个朋友 → 在他的 $\le 15$ 个货币里枚举子集」，即 $n \cdot 2^p$。但 $n = 2 \times 10^5$，$2 \times 10^5 \times 32768$ 还是太大了，不能对每个朋友都做一遍。

### 2. 随机化：随便抓一个人，他有一半概率"中奖"

这里就是这道题最漂亮的一步。我们并不需要枚举**所有**朋友，只需要找到**任意一个**接受最优解 $S$ 的朋友就够了。而根据题目条件，这样的朋友至少有 $\lceil n/2 \rceil$ 个——也就是说**至少占了一半**。

于是随机抽一个朋友，他"中奖"（即 $S \subseteq T$）的概率 $\ge \frac{1}{2}$。独立随机抽 $k$ 次，一次都不中的概率是 $\le 2^{-k}$。取 $k = 100$，失败概率是 $2^{-100}$——这个数小到什么程度呢，比你的代码在评测机上被宇宙射线打翻还要小得多。

```cpp
random_engine get(1, n);
for (int i = 1; i <= 100; i++) {
    string s = a[get()];  // 随机抓一个朋友，赌他包含最优解
    ...
}
```

这就是经典的 **Monte Carlo 随机化**思路：与其花 $O(n)$ 去确定性地找那个"对的人"，不如利用「对的人占了一半」这个性质，用几十次随机采样把正确率拉到几乎必然。

### 3. 对选中的朋友做子集计数：高维前缀和登场

现在固定了一个朋友，他喜欢的货币下标是 $v_0, v_1, \dots, v_{c-1}$（$c \le p \le 15$）。我们要对这 $c$ 个货币的**每一个子集** $S$，算出「有多少朋友喜欢 $S$ 里的所有货币」，然后取满足 $\ge \lceil n/2 \rceil$ 的最大子集。

第一步，把每个朋友的喜好**投影**到这 $c$ 个位置上，得到一个 $c$ 位的 mask，然后开桶统计：

```cpp
vector<int> dp(1 << c);
for (int j = 1; j <= n; j++) {
    int mask = 0;
    for (int k = 0; k < c; k++) {
        if (a[j][v[k]] == '1') mask |= 1 << k;
    }
    dp[mask]++;
}
```

此时 `dp[mask]` 的含义是：**恰好**喜欢 $mask$ 这个集合（在这 $c$ 个位置上）的朋友数。但我们要的是"至少喜欢 $S$ 的所有元素"的人数，也就是

$$ f(S) = \sum_{S \subseteq T} dp[T] $$

这是标准的**超集和**（superset sum），可以用**高维前缀和（SOS DP）**在 $O(2^c \cdot c)$ 内一次性算出所有 $S$ 的答案——每一维（每一个货币位）独立地做一次"把有这一位的加到没有这一位的上面"：

```cpp
for (int j = 0; j < c; j++) {
    for (int k = (1 << c) - 1; k > 0; k--) {
        if (!(k & (1 << j))) dp[k] += dp[k | (1 << j)];
    }
}
```

这一步做完，`dp[S]` 就直接是「喜欢 $S$ 中全部货币的朋友数」。相比暴力的 $O(3^c)$ 子集枚举，SOS DP 把它压到了 $O(2^c \cdot c)$，这在 $c = 15$ 时是 $32768 \times 15 \approx 5 \times 10^5$，非常轻。

### 4. 取答案

最后扫一遍所有子集，凡是 $dp[S] \ge \lceil n/2 \rceil$ 的就是合法解，在里面取 $\text{popcount}$ 最大的：

```cpp
for (int j = 0; j < (1 << c); j++) {
    if (dp[j] >= target) {
        int now = __builtin_popcount(j);
        if (now > ans) { ans = now; /* 把 j 映射回原来的 m 位下标 */ }
    }
}
```

注意最后要把 $c$ 位的 mask **映射回原始的 $m$ 位下标**再输出——$j$ 的第 $k$ 位对应的是原始货币 $v_k$。

### 5. 复杂度

一共随机 $100$ 轮，每轮的代价是：投影统计 $O(n \cdot p)$，SOS DP $O(2^p \cdot p)$，扫答案 $O(2^p)$。总复杂度

$$ O\big(100 \cdot (n p + 2^p p)\big) $$

代进 $n = 2\times10^5,\ p = 15$，大概是 $100 \times (3 \times 10^6 + 5 \times 10^5) \approx 3.5 \times 10^8$——看起来吓人，但这里全是极其简单的位运算和数组访问，缓存友好，$3$ 秒时限绰绰有余。实际上轮数取 $30 \sim 50$ 就已经足够稳了，$100$ 只是买个心安。

回头看这道 $*2400$ 的题，"$p \le 15$ 提示状压"是每个人都能看出来的，真正卡人的是**怎么把 $n$ 这一维消掉**。答案是那个漂亮的概率论小转身：既然合法答案的持有者占了全体的一半以上，那我就不必去"找"他，随手一抓再抓一百次，他跑不掉。这种"用随机化把确定性的枚举维度砍掉"的手法，在 CF 的中高难度题里出现频率相当高，值得单独记在脑子里。

### CPP 代码实现

```cpp
// D. Love-Hate

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

    int n, m, p;
    cin >> n >> m >> p;
    vector<string> a(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];

    int target = (n + 1) / 2, ans = 0;
    string res(m, '0');

    mt19937 rng(chrono::steady_clock::now().time_since_epoch().count());
    uniform_int_distribution<int> uni(1, n);

    for (int i = 1; i <= 100; i++) {
        string s = a[uni(rng)];
        vector<int> v;
        for (int j = 0; j < m; j++) {
            if (s[j] == '1') v.pb(j);
        }

        int c = sz(v);
        vector<int> dp(1 << c, 0);
        for (int j = 1; j <= n; j++) {
            int mask = 0;
            for (int k = 0; k < c; k++) {
                if (a[j][v[k]] == '1') mask |= 1 << k;
            }
            dp[mask]++;
        }

        for (int j = 0; j < c; j++) {
            for (int k = (1 << c) - 1; k > 0; k--) {
                if (!(k & (1 << j))) dp[k] += dp[k | (1 << j)];
            }
        }

        for (int j = 0; j < (1 << c); j++) {
            if (dp[j] >= target) {
                int now = __builtin_popcountll(j);
                if (now > ans) {
                    ans = now;
                    res = string(m, '0');
                    for (int k = 0; k < c; k++) {
                        if (j & (1 << k)) res[v[k]] = '1';
                    }
                }
            }
        }
    }

    cout << res << endl;

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
