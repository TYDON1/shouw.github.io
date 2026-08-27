---
title: "CF题解——Fenwick Tree"
date: "2026-06-12 20:58:41"
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
 - 树状数组
 - 位运算
---

# C. Fenwick Tree 解题思路

### 核心问题分析

题意：定义 $\text{lowbit}(x)$ 为 $x$ 二进制最低位的值。对长度为 $n$ 的数组 $a$，定义它的**树状数组变换**

$$ f(a)_k = \Big(\sum_{i = k - \text{lowbit}(k) + 1}^{k} a_i\Big) \bmod 998244353 $$

再定义 $f^k$ 为把 $f$ 迭代作用 $k$ 次。现在给你 $b$ 和 $k$，要求还原出一个 $a$ 使得 $f^k(a) = b$。

$n \le 2 \times 10^5$，但是 $k \le 10^9$——这个 $k$ 大得离谱，明摆着不可能真的迭代 $k$ 次。多组数据，$\sum n \le 2\times 10^5$。

### 1. 把树状数组还原成一棵树

第一步是把 $f$ 这个看起来很"位运算"的东西还原成它的本来面目。众所周知，树状数组的下标之间存在一个天然的父子关系：

$$ \text{parent}(i) = i + \text{lowbit}(i) $$

在这个结构下，$s_k = \sum_{i = k - \text{lowbit}(k)+1}^{k} a_i$ 恰好就是「**$k$ 的子树内所有 $a_i$ 之和**」（包含 $k$ 自己）。

所以 $f$ 用矩阵语言写出来就是

$$ f = I + U $$

其中 $U_{k,i} = 1$ 当且仅当 $i$ 是 $k$ 的**真后代**。这是一个幂零（nilpotent）的严格下三角结构——树的深度有限，$U$ 乘若干次就变成零矩阵。

### 2. 关键性质：树上路径唯一，所以 $U^j$ 长得极其干净

一般矩阵的幂会很难看，但这里有个救命的性质：**每个点只有一个父亲**，所以从 $k$ 往下走 $j$ 步到达某个具体节点 $x$ 的路径，要么不存在，要么**恰好只有一条**。于是

$$ (U^j)_{k,x} = [\,x \text{ 是 } k \text{ 的后代，且深度恰好差 } j\,] $$

也就是说 $U^j$ 依然只是一个 01 矩阵，没有任何"路径计数"的爆炸。这就是这道题能做的根本原因。

### 3. 不求 $f^k$，直接求 $f^{-k}$

我们要的是 $a = f^{-k}(b)$，所以与其去算 $f^k$ 再解方程，不如直接把 $f^{-k}$ 求出来。

先看 $f^{-1}$ 长什么样。$s_k$ 是子树和，那么把 $s_k$ 减去它所有**直接儿子**的子树和，剩下的就是 $a_k$ 自己：

$$ f^{-1} = I - V, \qquad V_{k,c} = [\,c \text{ 是 } k \text{ 的直接儿子}\,] $$

于是用二项式定理（$I$ 和 $V$ 显然可交换）：

$$ f^{-k} = (I - V)^k = \sum_{j \ge 0} (-1)^j \binom{k}{j} V^j $$

而根据上一节的路径唯一性，$V^j$ 就是"深度恰好差 $j$ 的后代"关系。翻译成人话：

> $a_x = \sum_{j \ge 0} (-1)^j \dbinom{k}{j} \cdot \big(\text{$x$ 的所有深度为 } j \text{ 的后代的 } b \text{ 值之和}\big)$

$k$ 高达 $10^9$ 完全不是问题——它只出现在组合数 $\binom{k}{j}$ 里，而 $j$ 的范围很小。

### 4. $j$ 到底能有多大？

沿着 $i \to i + \text{lowbit}(i)$ 往上走，每走一步 $\text{lowbit}$ 至少翻倍，所以从任意节点走到根最多只需要 $O(\log n)$ 步。$n \le 2\times10^5$ 时这个上界不超过 $18$，代码里开到 $20$ 稳妥有余。

组合数 $\binom{k}{j}$ 也不用预处理阶乘——$j$ 只有 $20$ 个取值，用递推一路乘过去就行：

$$ \binom{k}{j} = \binom{k}{j-1} \cdot \frac{k-j+1}{j} $$

```cpp
int cur_C = 1;
cal[0] = 1;
for (int j = 1; j < max_j; j++) {
    if (k < j) break;                       // j > k 时组合数为 0，后面全是 0
    cur_C = cur_C * ((k - j + 1) % MOD) % MOD * inv(j) % MOD;
    cal[j] = (j & 1) ? (MOD - cur_C) % MOD : cur_C;   // 带上 (-1)^j
}
```

注意 $k$ 本身要先取模，但 $k < j$ 的判断必须用**取模前的原值**——否则 $k$ 很大时会误判。

### 5. 换个方向扫：与其"往下找后代"，不如"往上找祖先"

公式写的是"对每个 $x$，找它深度为 $j$ 的所有后代"。但直接实现这件事需要建出整棵树再做 DFS，比较麻烦。

反过来想：从每个 $i$ 出发**往上**走它的祖先链，走 $j$ 步到达的那个祖先 $x$，恰好就把 $b_i$ 贡献给了 $a_x$。因为祖先链是唯一的，这样扫一遍就不重不漏地覆盖了所有 $(x, i, j)$ 三元组：

```cpp
for (int i = 1; i <= n; i++) {
    int curr = i, j = 0;
    while (curr <= n && j < max_j) {
        if (!cal[j]) break;
        res[curr] = (res[curr] + a[i] * cal[j]) % MOD;
        curr += low_bit(curr);   // 往上跳一层
        j++;
    }
}
```

一行 `curr += low_bit(curr)` 就搞定了建树、找祖先、算深度三件事——这道题从头到尾根本不需要显式建出任何树结构，全靠 $\text{lowbit}$ 的代数性质。

### 6. 复杂度

外层枚举 $n$ 个位置，每个位置往上跳 $O(\log n)$ 步，组合数预处理是 $O(\log n \log P)$ 的常数级别。总复杂度

$$ O(n \log n) $$

$\sum n \le 2\times10^5$，$3$ 秒时限下随便跑。

回头看这道 $*2300$ 的题，题面把 $\text{lowbit}$ 摆在最显眼的位置，反而容易让人一头栽进位运算的细节里出不来。真正的破题点是那句"**树状数组本质是一棵树，$f$ 本质是 $I + U$**"——一旦把它写成矩阵，$k$ 次幂就变成了二项式展开，$10^9$ 这个吓人的数字瞬间蒸发成 $20$ 个组合数系数。而让整件事成立的技术前提，是树上**父亲唯一**导致的 $U^j$ 不会退化成路径计数。这三层（树结构 → 线性算子 → 二项式反演）串起来，题就通了。

### CPP 代码实现

```cpp
// C. Fenwick Tree

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

const int MOD = 998244353;

void solve() {

    int n, k;
    cin >> n >> k;
    vector<int> a(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];

    auto qpow = [&](int base, int exp) {
        int res = 1;
        base %= MOD;
        while (exp > 0) {
            if (exp & 1) res = res * base % MOD;
            base = base * base % MOD;
            exp >>= 1;
        }
        return res;
    };
    auto inv = [&](int x) { return qpow(x, MOD - 2); };

    // cal[j] = (-1)^j * C(k, j)，j 最多到树高 O(log n)
    int max_j = 20;
    vector<int> cal(max_j, 0);
    cal[0] = 1;
    int cur_C = 1;
    for (int j = 1; j < max_j; j++) {
        if (k < j) break;
        cur_C = cur_C * ((k - j + 1) % MOD) % MOD * inv(j) % MOD;
        cal[j] = (j & 1) ? (MOD - cur_C) % MOD : cur_C;
    }

    vector<int> res(n + 1, 0);
    for (int i = 1; i <= n; i++) {
        int curr = i, j = 0;
        while (curr <= n && j < max_j) {
            if (!cal[j]) break;
            res[curr] = (res[curr] + a[i] * cal[j]) % MOD;
            curr += low_bit(curr);
            j++;
        }
    }

    for (int i = 1; i <= n; i++) cout << res[i] << " ";
    cout << endl;

}

signed main() {

    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    cin >> t;

    while (t--) {
        solve();
    }

}
```
