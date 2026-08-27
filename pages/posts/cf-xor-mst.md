---
title: "CF题解——Xor-MST"
date: "2026-06-11 22:14:53"
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
 - 01Trie
 - 最小生成树
---

# G. Xor-MST 解题思路

### 核心问题分析

题意短得离谱：给定 $n$ 个数 $a_1, \dots, a_n$，把它们看成一张**完全图**的 $n$ 个点，点 $i$ 与点 $j$ 之间的边权定义为 $a_i \oplus a_j$。求这张完全图的最小生成树边权和。

$n \le 2 \times 10^5$，$0 \le a_i < 2^{30}$，时限 $2$ 秒。

麻烦在于这张图有 $\binom{n}{2} \approx 2 \times 10^{10}$ 条边——别说跑 Kruskal 了，光是把边列出来就已经原地爆炸。所以任何"先建图再求 MST"的路子都被彻底堵死，必须利用**异或**这个边权的特殊结构。

### 1. Boruvka？还是换个角度：按最高位劈开

异或问题的通用套路是**从高位往低位看**。考虑最高位（第 $29$ 位）：所有数按这一位是 $0$ 还是 $1$，被自然地分成两组 $A$ 和 $B$。

- 组**内**的两个数，第 $29$ 位相同，异或起来这一位是 $0$；
- 组**间**的两个数，第 $29$ 位不同，异或起来这一位是 $1$，也就是说任何一条跨组边的权值都 $\ge 2^{29}$。

而组内任何一条边的权值都 $< 2^{29}$。这意味着：**跨组边一定比所有组内边都贵**。

于是 MST 的形态就被锁死了：先在 $A$ 内部各自连成一棵树，在 $B$ 内部各自连成一棵树，最后**只用恰好一条**跨组边把两棵树缝起来——而且这条跨组边必须是所有跨组边里最便宜的那一条。

（如果 $A$ 或 $B$ 为空，那就完全没有跨组边，直接递归处理非空的那一边即可。）

这就是一个非常干净的**分治**结构：

$$ \text{MST}(S, bit) = \text{MST}(A, bit-1) + \text{MST}(B, bit-1) + \min_{x \in A,\, y \in B} (x \oplus y) $$

### 2. 分治的载体：01-Trie 天然就是这棵递归树

把所有数插进一棵 **01-Trie**（从第 $29$ 位到第 $0$ 位），你会发现上面那个"按位劈开"的分治过程，跟 Trie 的结构完全同构：

- Trie 上深度为 $d$ 的一个节点，恰好代表"最高 $d$ 位都相同的一群数"；
- 它的左儿子子树就是 $A$（下一位为 $0$），右儿子子树就是 $B$（下一位为 $1$）；
- 只有当一个节点**左右儿子都存在**时，才需要付出一条跨组边的代价；只有一个儿子时直接往下递归，不产生任何合并代价。

所以整个算法就是在 Trie 上做一遍 DFS：

```cpp
int solve_mst(int u, int bit) {
    if (bit < 0) return 0;
    int ls = trie[u][0], rs = trie[u][1];
    if (ls && rs) {
        int min_edge = ...; // 求两棵子树间的最小异或值
        return min_edge + solve_mst(ls, bit - 1) + solve_mst(rs, bit - 1);
    }
    if (ls) return solve_mst(ls, bit - 1);
    if (rs) return solve_mst(rs, bit - 1);
    return 0;
}
```

### 3. 剩下的问题：怎么求两棵子树之间的最小异或值

现在难点全部集中到一句话上：给定 Trie 上两棵兄弟子树，求 $\min_{x \in A, y \in B} (x \oplus y)$。

朴素做法是拿 $A$ 里的每个数去 $B$ 的子树里跑一次"最小异或"查询（贪心地每一位都尽量走相同的分支）：

```cpp
int query(int val, int u, int bit) {
    if (bit < 0) return 0;
    int b = (val >> bit) & 1;
    if (trie[u][b]) return query(val, trie[u][b], bit - 1); // 能走同位就走，这一位贡献 0
    return (1LL << bit) + query(val, trie[u][!b], bit - 1); // 否则被迫异或出 1
}
```

单次查询是 $O(\log V)$。但如果每次都拿**较大**的那棵子树去枚举，最坏情况会退化。

### 4. 启发式合并：永远拿小的那边去枚举

这里用一个非常经典的技巧：**每次只枚举两棵子树中较小的那一棵**，拿它的每个元素去大的那棵里查。

```cpp
if (R_idx[ls] - L_idx[ls] <= R_idx[rs] - L_idx[rs]) {
    for (int i = L_idx[ls]; i <= R_idx[ls]; i++)
        min_edge = min(min_edge, (1LL << bit) + query(d[i], rs, bit - 1));
} else {
    for (int i = L_idx[rs]; i <= R_idx[rs]; i++)
        min_edge = min(min_edge, (1LL << bit) + query(d[i], ls, bit - 1));
}
```

这就是**启发式合并**（小的合并到大的）的势能分析：把数组**排好序**之后再插入 Trie，每棵子树里的元素恰好是原数组的一个**连续区间**（这也是代码里用 `L_idx`/`R_idx` 记录每个 Trie 节点覆盖的区间左右端点、而不用真的存一个 vector 的原因，省下大量内存）。每个元素每被"作为小的一方枚举"一次，它所在的集合大小至少翻倍，所以每个元素最多被枚举 $O(\log n)$ 次。

注意跨组边的权值里，第 $bit$ 位是必然贡献 $2^{bit}$ 的（这正是两组的区分位），所以要写成 `(1LL << bit) + query(...)`。

另外别忘了先 `sort` + `unique`：重复的数之间异或为 $0$，直接去重不影响答案，还能让"子树对应连续区间"这个性质成立。

### 5. 复杂度

- 建 Trie：$O(n \log V)$；
- 分治求 MST：每个元素被枚举 $O(\log n)$ 次，每次查询 $O(\log V)$，总计 $O(n \log n \log V)$。

代进 $n = 2 \times 10^5$、$\log V = 30$：大约 $2\times10^5 \times 18 \times 30 \approx 10^8$，全是位运算和数组跳转，$2$ 秒时限稳稳的。

回头看这道 $*2300$ 的题，思维的关键转折只有一个：**放弃"建图跑 MST"，改从最高位把点集劈成两半**。一旦意识到"跨组边必然比所有组内边贵，所以只需要一条最便宜的跨组边把两半缝起来"，MST 就退化成了 Trie 上一次自然的 DFS。剩下的启发式合并只是为了让复杂度好看——这道题真正的美，在于那个"最高位一刀切"的结构洞察。

### CPP 代码实现

```cpp
// G. Xor-MST

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

const int MAXN = 200005;
const int MAX_NODE = MAXN * 31;

int n;
int d[MAXN];
int trie[MAX_NODE][2], L_idx[MAX_NODE], R_idx[MAX_NODE], total;

void insert(int val, int id) {
    int u = 0;
    for (int i = 29; i >= 0; i--) {
        int bit = (val >> i) & 1;
        if (!trie[u][bit]) {
            trie[u][bit] = ++total;
            L_idx[total] = id;
        }
        u = trie[u][bit];
        R_idx[u] = id;
    }
}

// 在以 u 为根的子树里，找与 val 异或最小的值
int query(int val, int u, int bit) {
    if (bit < 0) return 0;
    int b = (val >> bit) & 1;
    if (trie[u][b]) return query(val, trie[u][b], bit - 1);
    return (1LL << bit) + query(val, trie[u][!b], bit - 1);
}

int solve_mst(int u, int bit) {
    if (bit < 0) return 0;

    int ls = trie[u][0];
    int rs = trie[u][1];

    if (ls && rs) {
        int min_edge = (1LL << 60);

        // 启发式合并：拿元素少的那棵子树去枚举
        if (R_idx[ls] - L_idx[ls] <= R_idx[rs] - L_idx[rs]) {
            for (int i = L_idx[ls]; i <= R_idx[ls]; i++) {
                min_edge = min(min_edge, (1LL << bit) + query(d[i], rs, bit - 1));
            }
        } else {
            for (int i = L_idx[rs]; i <= R_idx[rs]; i++) {
                min_edge = min(min_edge, (1LL << bit) + query(d[i], ls, bit - 1));
            }
        }
        return min_edge + solve_mst(ls, bit - 1) + solve_mst(rs, bit - 1);
    }

    if (ls) return solve_mst(ls, bit - 1);
    if (rs) return solve_mst(rs, bit - 1);
    return 0;

}

void solve() {

    cin >> n;

    for (int i = 0; i <= total; i++) trie[i][0] = trie[i][1] = L_idx[i] = R_idx[i] = 0;
    total = 0;

    for (int i = 1; i <= n; i++) cin >> d[i];

    sort(d + 1, d + n + 1);
    int m = unique(d + 1, d + n + 1) - (d + 1);

    for (int i = 1; i <= m; i++) insert(d[i], i);

    cout << solve_mst(0, 29) << endl;

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
