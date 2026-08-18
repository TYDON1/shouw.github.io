---
title: "CF题解——Array Shrinking"
date: "2026-05-29 21:42:16"
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
 - 区间DP
 - 动态规划
---

# E. Array Shrinking 解题思路

### 核心问题分析

题意非常清爽：给一个数组 $a_1, a_2, \dots, a_n$，你可以反复做这样一件事——找到**相邻且相等**的一对 $a_i = a_{i+1}$，把它俩合并成一个值为 $a_i + 1$ 的新元素。每合一次，数组长度就少 $1$。问你折腾到底，数组**最短能压到多长**。

举个例子，$[4, 3, 2, 2, 3]$：先把那对 $2$ 合成 $3$，变成 $[4, 3, 3, 3]$；再把前两个 $3$ 合成 $4$，变成 $[4, 4, 3]$；再合前两个 $4$ 得 $[5, 3]$，长度 $2$，再也合不动了。答案就是 $2$。

数据范围 $n \le 500$，这个量级一看就在暗示我们：可以放心上 $O(n^3)$ 甚至带点常数的算法。注意一个关键观察——**合并永远发生在相邻位置之间**，一段被合并掉的元素，最终一定来自原数组里一段**连续的区间**。这就是区间 DP 的味道了。我们把整道题拆成两层：先搞清楚“一段区间能不能被压成一个数”，再用这个信息去拼最短长度。

### 1. 第一层：一段区间能不能塌缩成单值？

定义 `dp[l][r]` 表示：原数组的区间 $[l, r]$ **如果能被合并成一个单独的数**，那个数是多少；如果压根压不成一个数，就记为 $0$（题目保证 $a_i \ge 1$，所以 $0$ 是个安全的“非法”标记）。

边界显然——长度为 $1$ 的区间自己就是一个数，谁也不用合：

```cpp
for (int i = 1; i <= n; i++) {
    dp[i][i] = a[i];
}
```

接下来是这道题最妙的递推。一段 $[l, r]$ 想要塌成一个值，最后一步一定是**两个相等的数合并**。这两个数从哪来？它们必然分别来自把 $[l, r]$ 劈成两半 $[l, k]$ 和 $[k+1, r]$，左半边先各自压成一个数、右半边也各自压成一个数。而能合并的前提，是这两个数**恰好相等**：

$$ dp[l][r] = dp[l][k] + 1 \quad \text{当} \quad dp[l][k] = dp[k+1][r] \neq 0 $$

```cpp
for (int len = 2; len <= n; len++) {
    for (int l = 1; l <= n - len + 1; l++) {
        int r = l + len - 1;
        for (int k = l; k < r; k++) {
            if (dp[l][k] != 0 && dp[k + 1][r] == dp[l][k]) {
                dp[l][r] = dp[l][k] + 1;
                break;
            }
        }
    }
}
```

这里有个值得细品的小细节：找到第一个合法的 $k$ 就 `break` 了，根本不继续枚举。为什么这么任性也不出错？因为**一段区间如果能塌成单值，那个值是唯一确定的**——你想啊，$[l,r]$ 压成的数等于 $\log_2$ 量级的“总能量”，跟你怎么劈、从哪劈一点关系都没有，劈法只是过程，结果是命中注定的。所以只要找到一种可行的劈法，剩下的就没必要看了，省下不少常数。

### 2. 第二层：把整个数组切成尽量少的“可塌缩段”

有了 `dp[l][r]`，第二层就水到渠成了。最终留在数组里的每一个元素，都对应原数组的一段**能塌成单值的连续区间**，而且这些区间首尾相接、不重不漏地铺满整个 $[1, n]$。我们要的“最短长度”，本质就是：**把 $[1, n]$ 划分成最少的段数，使得每一段都能塌成一个单值。**

这是个经典的线性 DP。设 `f[i]` 为前 $i$ 个元素能压出的最短长度，枚举最后一段从哪里开始：

$$ f[i] = \min_{\substack{1 \le j \le i \\ dp[j][i] \neq 0}} \big( f[j-1] + 1 \big) $$

```cpp
for (int i = 1; i <= n; i++) {
    f[i] = f[i - 1] + 1;
    for (int j = 1; j <= i; j++) {
        if (dp[j][i] != 0) {
            f[i] = min(f[i], f[j - 1] + 1);
        }
    }
}
```

注意那行兜底的 `f[i] = f[i - 1] + 1`：它对应 $j = i$ 的情形，也就是“最后一段就是单个元素 $a_i$ 自己”——单元素必然能塌成单值（`dp[i][i] = a[i] != 0`），所以这个转移永远合法，保证 `f[i]` 一定有解、不会卡死。其余的 $j$ 则尝试把更长的一段 $[j, i]$ 整个塞成一个数，从而省下段数。取个 $\min$，`f[n]` 就是答案。

### 3. 复杂度小账本

第一层区间 DP，枚举区间长度、左端点、分割点，三重循环妥妥的 $O(n^3)$；第二层线性 DP 是 $O(n^2)$，被前者吊打可以忽略。总复杂度 $O(n^3)$，在 $n \le 500$ 下大约 $1.25 \times 10^8$ 量级，配上 $2$ 秒时限和那个 `break` 剪枝，跑得稳稳当当，丝毫不慌。

整道题的精髓，就在于**两层 DP 的接力**：第一层回答“这一段能不能变成一个数、变成几”，第二层拿着这份情报去做最省段数的切割。区间 DP 管局部、线性 DP 管全局，配合得天衣无缝。

### CPP 代码实现

```cpp
// E. Array Shrinking

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
    vector<int> a(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];
    vector<vector<int>> dp(n + 1, vector<int>(n + 1));
    for (int i = 1; i <= n; i++) {
        dp[i][i] = a[i];
    }
    for (int len = 2; len <= n; len++) {
        for (int l = 1; l <= n - len + 1; l++) {
            int r = l + len - 1;
            for (int k = l; k < r; k++) {
                if (dp[l][k] != 0 && dp[k + 1][r] == dp[l][k]) {
                    dp[l][r] = dp[l][k] + 1;
                    break;
                }
            }
        }
    }
    vector<int> f(n + 1);
    for (int i = 1; i <= n; i++) {
        f[i] = f[i - 1] + 1;
        for (int j = 1; j <= i; j++) {
            if (dp[j][i] != 0) {
                f[i] = min(f[i], f[j - 1] + 1);
            }
        }
    }
    cout << f[n] << endl;
    
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
