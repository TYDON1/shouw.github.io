---
title: "CF题解——Distance to Different"
date: "2026-05-12 22:37:11"
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
 - 组合数学
 - DP
 - 计数
---

# E. Distance to Different 解题思路

### 核心问题分析

题意翻译成人话：有一个长度为 $n$ 的数组 $a$，每个元素取值在 $1\sim k$ 之间，并且 $1\sim k$ 每个值都至少出现一次。然后根据 $a$ 造一个数组 $b$：$b_i$ 是「离位置 $i$ 最近的、值跟 $a_i$ 不一样的那个位置」的距离，即

$$ b_i = \min_{j\in[1,n],\,a_j\ne a_i} |i-j| $$

问：把所有合法的 $a$ 都跑一遍，能得到多少**本质不同**的 $b$，对 $998244353$ 取模。

数据范围很有意思：$n \le 2\times 10^5$ 大得吓人，但 $k \le \min(n,10)$ **小得可爱**。这俩放一起，几乎是在你脑门上贴了张纸条：**$O(nk)$ 的 DP 跑起来**。

但别急着写 DP，先得想清楚一件事：$b$ 到底由 $a$ 的什么决定？又是哪些不同的 $a$ 会撞出同一个 $b$？把这层窗户纸捅破，这题就塌方了。

### 1. $b$ 只认「段结构」，不认具体数值

观察一下 $b$ 的定义：$b_i$ 只关心「离我最近的不同值在哪」。那么把 $a$ 按连续相等的极大段（block）切开，比如 $a=[1,1,2,3,3,3,3,1]$ 切成 $[1,1]\,[2]\,[3,3,3,3]\,[1]$，**$b$ 完全由这些段的长度序列决定**，跟段里填的具体是哪个数字一点关系都没有。

对一个**内部段**（左右都有邻居、且邻居值都不同于它）来说，它内部的 $b$ 值是「从两端往中间数」：长度为 $L$ 的内部段，贡献 $b=[1,2,\dots,\lceil L/2\rceil,\dots,2,1]$ 这种对称的爬坡。而**最左、最右两个段**是单边的——它们只有一侧有不同值，$b$ 就是单调地从边界往里递增 $[L, L-1, \dots, 1]$ 这种。

所以问题第一步就被我们改写成了：**有多少种本质不同的「段长度序列」能产生本质不同的 $b$？** 注意是「本质不同的 $b$」，不是「本质不同的段序列」——这俩之间还藏着一次合并，正是这题的精髓。

### 2. 顿悟时刻：内部段「长度 1」和「长度 2」是一对孪生兄弟

来看一个内部段。长度 $1$ 时它的 $b$ 是 $[1]$；长度 $2$ 时是 $[1,1]$。乍一看不一样，但魔鬼藏在**接缝**里——$b_i$ 取的是「左右两侧最近不同值」的 $\min$。一个长度为 $1$ 或 $2$ 的小段，它内部每个格子的 $b$ 值，都会被**两侧邻段贴过来的距离**死死压在 $1$ 上，于是从整张 $b$ 的视角看，**「插入一个长度为 1 的内部段」和「插入一个长度为 2 的内部段」会被旁边的大段挤压成同一种 $b$ 形态**。

换句话说，在枚举内部段长度的时候，长度 $1$ 和长度 $2$ 是**会撞车的**。要去重，我们只需要保留一个代表：约定**内部段长度永远不取 $2$**（取 $1$ 当代表，其余长度 $\ge 3$ 照常），就能让每种 $b$ 恰好被数到一次。

这就是源码里那个看着莫名其妙的「减一项」的来历，下面我们就把它揪出来。

### 3. 把 DP 拆开：前缀和减一项 = 「长度可任意，但不许等于 2」

定义 `dp[i][j]` 表示：用 $j$ 个（去重后的）内部段，恰好铺满长度为 $i$ 的一段前缀，能产生多少种本质不同的 $b$ 片段。边界很自然：

```cpp
for (int i = 1; i <= n; i++) {
    dp[i][1] = 1;
}
```

一个段铺满长度 $i$，方案就一种，`dp[i][1] = 1`。

接下来是转移的灵魂。考虑往后接「第 $j$ 个段」、它的长度为 $L$、结束在位置 $i$，那么前面 $i-L$ 个格子由 $j-1$ 个段铺成：

$$ dp[i][j] = \sum_{L\ge 1,\;L\ne 2} dp[\,i-L\,][\,j-1\,] $$

如果允许所有 $L\ge 1$，那就是一个干净的前缀和 $\sum_{t=1}^{i-1} dp[t][j-1]$。而我们要**抠掉 $L=2$ 这一项**（去重！），它对应 $t=i-2$，于是

$$ dp[i][j] = \Big(\sum_{t=1}^{i-1} dp[t][j-1]\Big) \;-\; dp[\,i-2\,][\,j-1\,] $$

看代码就是这么实现的——`temp` 一路滚动维护前缀和 $\sum_{t=1}^{i-1} dp[t][j-1]$，再减去 `prev_2`（也就是 $dp[i-2][j-1]$，那个被禁掉的「长度 2」）：

```cpp
int prev_1 = 0;
if (i - 1 >= 1) {
    if (j < k) {
        prev_1 = dp[i - 1][j - 1];
    } else {
        prev_1 = (dp[i - 1][k - 1] + dp[i - 1][k]) % MOD;
    }
    temp = (temp + prev_1) % MOD;   // 滚成前缀和
}
int prev_2 = 0;
if (i - 2 >= 1) {
    if (j < k) {
        prev_2 = dp[i - 2][j - 1];
    } else {
        prev_2 = (dp[i - 2][k - 1] + dp[i - 2][k]) % MOD;
    }
}
dp[i][j] = (temp - prev_2 + MOD) % MOD;   // 抠掉「长度 2」
```

`temp` 每次只把 `dp[i-1][j-1]` 累进来，循环结束时它恰好是 $\sum_{t=1}^{i-1}$，这是把 $O(n^2k)$ 的暴力前缀和优化成 $O(nk)$ 的关键手法，丝毫不浪费。

### 4. 收尾的两个边界段与那个「$k-1$ 与 $k$ 合并」

还记得最左、最右两个段是**单边段**吗？它俩跟内部段的计数逻辑不一样，得单独处理。源码里那个 `j == k` 的分支 `dp[i-1][k-1] + dp[i-1][k]`，干的就是把「内部已经用满 $k-1$ 个段」和「用满 $k$ 个段」这两种情形并到一起——因为到了最后一层，剩下的段可以被合并归并到边界里，再往后接的内部段无须区分到底是第 $k-1$ 个还是第 $k$ 个，统一并账即可。

最后统计答案：枚举**最左那个单边段**的长度 $i$（从 $1$ 到 $n-1$，因为右边至少还得留一个格子给别的段），把对应的内部 + 右边界计数 `dp[i][k-1] + dp[i][k]` 累加起来：

```cpp
int ans = 0;
for (int i = 1; i <= n - 1; i++) {
    int term = (dp[i][k - 1] + dp[i][k]) % MOD;
    ans = (ans + term) % MOD;
}
cout << ans << endl;
```

这里的 $i$ 扮演「第一个段吃掉多少长度」的角色，剩下的部分由 `dp` 数好的内部结构 + 右边界来补齐，两个单边段的不对称性就这么被妥帖地吸收进了求和里。

要验证它对不对，最稳的办法是写个暴力：枚举所有合法的 $a$、算出 $b$、丢进 `set` 去重数个数。我拿 $(n,k)=(5,3)$ 暴力得 $7$、$(7,4)$ 得 $19$、$(8,3)$ 得 $57$，跟这份 DP 一字不差地对上了，样例里 `133 7 -> 336975971` 也稳稳命中，可以放心。

整份代码就两层循环，复杂度 $O(nk)$，对着 $n\le 2\times 10^5$、$k\le 10$ 的规模，连眼睛都不用眨。这题评 $\*2300$，难就难在前面那两步「$b$ 只认段结构」「长度 1 与 2 撞车去重」的观察——一旦想通，DP 本身就是个无脑活儿。

### CPP 代码实现

```cpp
// CF1989E Distance to Different

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

const int MOD = 998244353;

void solve() {

    int n, k;
    cin >> n >> k;

    vector<vector<int>> dp(n + 1, vector<int>(k + 1, 0));

    for (int i = 1; i <= n; i++) {
        dp[i][1] = 1;
    }

    for (int j = 2; j <= k; j++) {
        int temp = 0;
        for (int i = 1; i <= n; i++) {
            int prev_1 = 0;
            if (i - 1 >= 1) {
                if (j < k) {
                    prev_1 = dp[i - 1][j - 1];
                } else {
                    prev_1 = (dp[i - 1][k - 1] + dp[i - 1][k]) % MOD;
                }
                temp = (temp + prev_1) % MOD;
            }
            int prev_2 = 0;
            if (i - 2 >= 1) {
                if (j < k) {
                    prev_2 = dp[i - 2][j - 1];
                } else {
                    prev_2 = (dp[i - 2][k - 1] + dp[i - 2][k]) % MOD;
                }
            }
            dp[i][j] = (temp - prev_2 + MOD) % MOD;
        }
    }

    int ans = 0;
    for (int i = 1; i <= n - 1; i++) {
        int term = (dp[i][k - 1] + dp[i][k]) % MOD;
        ans = (ans + term) % MOD;
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
