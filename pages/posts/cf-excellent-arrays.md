---
title: "CF题解——Excellent Arrays"
date: "2026-06-16 21:34:52"
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
 - 数学
 - 构造
---

# D. Excellent Arrays 解题思路

### 核心问题分析

题意：称数组 $a_1, \dots, a_n$ 是 **good** 的，如果对每个 $i$ 都有 $a_i \ne i$。定义

$$ F(a) = \#\{(i, j) : 1 \le i < j \le n,\ a_i + a_j = i + j\} $$

称数组是 **excellent** 的，如果它 good、每个 $a_i \in [l, r]$、且 $F(a)$ 取到所有 good 数组中的**最大值**。给定 $n, l, r$，求 excellent 数组的个数，对 $10^9+7$ 取模。

$\sum n \le 2\times10^5$，$-10^9 \le l \le 1$，$n \le r \le 10^9$。

### 1. 换元：把 $a_i$ 变成 $b_i$

题目里 $a_i \ne i$ 和 $a_i + a_j = i + j$ 都在跟下标较劲，那就干脆做一步换元：

$$ b_i = a_i - i $$

两个条件立刻变得清爽无比：

- good $\iff$ 所有 $b_i \ne 0$；
- $a_i + a_j = i + j \iff b_i + b_j = 0$。

于是 $F(a)$ 就是"数组 $b$ 里有多少对数互为相反数"。

### 2. 最大的 $F$ 长什么样

现在问题是：所有 $b_i$ 非零，怎么让互为相反数的数对最多？

假设我们用了若干组数值 $\pm k_1, \pm k_2, \dots$，其中 $\pm k_t$ 这一组里有 $p_t$ 个正的、$q_t$ 个负的，那么

$$ F = \sum_t p_t q_t $$

而 $\sum_t (p_t + q_t) = n$。因为 $xy$ 这种乘积在"把资源集中到一组"时最大（$p_1q_1 + p_2q_2 \le (p_1+p_2)(q_1+q_2)$），所以**只用一个绝对值 $k$ 是最优的**：所有 $b_i \in \{+k, -k\}$。

设有 $p$ 个 $+k$、$n - p$ 个 $-k$，则 $F = p(n-p)$，在 $p = \lfloor n/2 \rfloor$ 或 $\lceil n/2 \rceil$ 时取最大。所以：

> excellent 数组 $\iff$ 存在某个 $k \ge 1$，使得每个 $b_i$ 都等于 $+k$ 或 $-k$，且 $+k$ 的个数是 $\lfloor n/2 \rfloor$ 或 $\lceil n/2 \rceil$。

（$n$ 为偶数时这两个值相同，只有一种；$n$ 为奇数时是两个不同的值，都要算。）

### 3. 值域限制翻译成对 $k$ 的限制

现在加上 $l \le a_i \le r$，也就是 $l \le i + b_i \le r$。分两种情况看：

**若 $b_i = +k$**：需要 $i + k \le r$，即 $k \le r - i$。（下界 $i + k \ge l$ 自动满足，因为 $l \le 1$ 而 $i + k \ge 2$。）

**若 $b_i = -k$**：需要 $i - k \ge l$，即 $k \le i - l$。（上界同理自动满足，因为 $i \le n \le r$。）

于是定义两个关键量：

$$ R = r - n \quad(\text{所有下标都能取 } +k \text{ 的上限}),\qquad L = 1 - l \quad(\text{所有下标都能取 } -k \text{ 的上限}) $$

因为 $+k$ 的最紧约束在 $i = n$（$k \le r - n$），$-k$ 的最紧约束在 $i = 1$（$k \le 1 - l$）。令 $M = \min(L, R)$。

### 4. 分两段：自由段和受限段

**第一段：$1 \le k \le M$。** 这时**每个下标都可以自由选正负**，方案数与 $k$ 无关：

$$ \text{cnt} = \begin{cases} \dbinom{n}{n/2}, & n \text{ 为偶数} \\[2mm] \dbinom{n}{\lfloor n/2 \rfloor} + \dbinom{n}{\lfloor n/2 \rfloor + 1}, & n \text{ 为奇数} \end{cases} $$

一共 $M$ 个这样的 $k$，直接乘起来：

```cpp
ans = (M % MOD) * temp % MOD;
```

注意 $M$ 可以到 $10^9$ 级别，要先取模。这一步把绝大部分的 $k$ 一口气算完了——这是本题能过的关键。

**第二段：$k > M$。** 此时开始有下标被"锁死"：

- 下标 $i$ 能取 $+k$ 需要 $i \le r - k$，所以 $i > r - k$ 的那些**只能取 $-k$**，个数是 $c_2 = k - R$；
- 下标 $i$ 能取 $-k$ 需要 $i \ge l + k$，所以 $i < l + k$ 的那些**只能取 $+k$**，个数是 $c_1 = k - L$。

（都要跟 $0$ 和 $n$ 取 $\max/\min$ 夹一下。）

如果 $c_1 + c_2 > n$，说明有下标同时被两边锁死，彻底无解，直接停。否则剩下 $cnt = n - c_1 - c_2$ 个自由下标，还需要从中再挑出 $\lfloor n/2 \rfloor - c_1$ 个当正号：

```cpp
int cnt = n - c1 - c2;
if (n % 2 == 0) cur = get_C(cnt, n / 2 - c1);
else cur = (get_C(cnt, n / 2 - c1) + get_C(cnt, n / 2 + 1 - c1)) % MOD;
```

### 5. 第二段最多跑多少轮？

这是最容易担心的地方：$k$ 会不会一直加到 $10^9$？

不会。从 $k = M + 1$ 开始，$c_1$ 和 $c_2$ 里**至少有一个**（对应 $\min$ 的那一边）会随 $k$ 严格递增，每次加 $1$。而组合数 $\binom{cnt}{n/2 - c_1}$ 变成 $0$ 的条件是 $c_1 > \lfloor n/2 \rfloor$（下指标为负）或者 $c_2 > \lfloor n/2 \rfloor$（下指标超过 $cnt$）。所以最多跑

$$ O\!\left(\frac{n}{2}\right) $$

轮就会因为 `cur == 0` 或 `c1 + c2 > n` 而退出。这就是代码里那两个 `break` 的意义——它们不只是优化，而是复杂度正确性的保证。

### 6. 复杂度

阶乘和逆元预处理 $O(\text{MAX})$ 一次搞定。每组数据：第一段 $O(1)$，第二段 $O(n)$。总计

$$ O\!\left(\sum n\right) $$

$\sum n \le 2\times10^5$，$2$ 秒随便过。

回头看这道 $*2300$ 的题，$b_i = a_i - i$ 这一步换元几乎是决定性的：换完之后"最大化 $F$"立刻退化成一个初中难度的均值不等式，"所有 $b_i$ 只能是 $\pm k$"这个极强的结构也就自己冒出来了。剩下的难点在于 $k$ 的范围高达 $10^9$——但只要注意到"当 $k$ 足够小的时候方案数根本不随 $k$ 变化"，就能把无穷无尽的枚举压缩成"一段乘法 + $O(n)$ 段暴力"。这种"大部分情况同质、只有边界附近才需要精细讨论"的分段技巧，在计数题里非常常见。

### CPP 代码实现

```cpp
// D. Excellent Arrays

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

const int MOD = 1e9 + 7;
const int MAX = 200005;

int fact[MAX], invf[MAX];

int quick_power(int a, int b) {
    int res = 1;
    a %= MOD;
    while (b > 0) {
        if (b & 1) res = res * a % MOD;
        a = a * a % MOD;
        b >>= 1;
    }
    return res;
}

void init() {
    fact[0] = 1;
    invf[0] = 1;
    for (int i = 1; i < MAX; i++) fact[i] = fact[i - 1] * i % MOD;
    invf[MAX - 1] = quick_power(fact[MAX - 1], MOD - 2);
    for (int i = MAX - 2; i >= 1; i--) invf[i] = invf[i + 1] * (i + 1) % MOD;
}

int get_C(int n, int m) {
    if (m < 0 || m > n || n < 0) return 0;
    return fact[n] * invf[m] % MOD * invf[n - m] % MOD;
}

void solve() {

    int n, l, r;
    cin >> n >> l >> r;

    int L = 1 - l;      // 所有下标都能取 -k 的上限
    int R = r - n;      // 所有下标都能取 +k 的上限
    int M = min(L, R);

    int ans = 0, temp = 0;

    if (n % 2 == 0) {
        temp = get_C(n, n / 2);
    } else {
        temp = (get_C(n, n / 2) + get_C(n, n / 2 + 1)) % MOD;
    }

    // 第一段：k <= M，每个下标自由选正负
    ans = (M % MOD) * temp % MOD;

    // 第二段：k > M，部分下标被锁死
    for (int k = M + 1; ; k++) {
        int c1 = max(0LL, min(n, k - L));   // 被迫取 +k
        int c2 = max(0LL, min(n, k - R));   // 被迫取 -k

        if (c1 + c2 > n) break;

        int cnt = n - c1 - c2;
        int cur = 0;

        if (n % 2 == 0) {
            cur = get_C(cnt, n / 2 - c1);
        } else {
            cur = (get_C(cnt, n / 2 - c1) + get_C(cnt, n / 2 + 1 - c1)) % MOD;
        }

        if (cur == 0) break;

        ans = (ans + cur) % MOD;
    }

    cout << ans << endl;

}

signed main() {

    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    init();

    int t = 1;
    cin >> t;

    while (t--) {
        solve();
    }

}
```
