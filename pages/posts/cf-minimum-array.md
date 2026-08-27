---
title: "CF题解——Minimum Array"
date: "2026-06-08 21:12:47"
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
 - 数据结构
 - 线段树
 - 贪心
---

# C. Minimum Array 解题思路

### 核心问题分析

题意：给定长度为 $n$ 的数组 $a$，依次对它执行 $q$ 次区间加操作——第 $k$ 次操作给定 $(l_k, r_k, x_k)$，把 $a[l_k..r_k]$ 整体加上 $x_k$。记 $b_j$ 为“只做了前 $j$ 次操作”之后的数组（$b_0$ 就是原始数组），$0 \le j \le q$。在这 $q+1$ 个数组 $b_0, b_1, \dots, b_q$ 里，找出**字典序最小**的那一个并输出。

多组数据，$1 \le n, q \le 5 \times 10^5$（$n, q$ 之和都有上界），$3$ 秒时限。数据范围友好地暗示我们要找一个 $O((n+q)\log(n+q))$ 左右的做法。

### 1. 拆开来看：每个位置其实是关于 $j$ 的一个阶梯函数

直接比较 $q+1$ 个完整数组显然不可能。先盯着单个位置 $i$：它在 $b_j$ 里的值是

$$ b_j[i] = a_i + \underbrace{\sum_{k \le j,\ l_k \le i \le r_k} x_k}_{f_i(j)} $$

$f_i(j)$ 只由“前 $j$ 次操作里，覆盖了位置 $i$ 的那些操作”决定，$j$ 每增大一次，$f_i(j)$ 要么不变、要么跳一下。也就是说，对每个固定的位置 $i$，$f_i(\cdot)$ 是一个关于 $j$ 的阶梯函数——这是后面所有优化的基础。

### 2. 字典序最小 = 贪心地逐位淘汰候选 $j$

字典序比较的规则很简单：先比第一位，谁小谁赢；平局才看第二位……以此类推。所以我们可以把这 $q+1$ 个 $j$ 值看成一群“候选人”，从位置 $1$ 开始逐位淘汰：

- 在位置 $i$，看所有**还活着**的候选 $j$，取 $\min_j f_i(j)$，这就是最终答案数组在位置 $i$ 上的取值（因为字典序最优的那个 $j$，在这一位上必然取到这个最小值，否则就会被取到更小值的候选打败）；
- 把所有在这一位上没能达到这个最小值的候选 $j$ 直接**判死刑**，它们已经不可能是字典序最小的那个了；
- 打平的候选留到下一位继续比。

一路比下去，比到最后活下来的（可能不止一个，随便选一个）就是答案对应的 $j$。这个过程本身就是 $O(n)$ 轮“求最小值 + 批量淘汰”，难点全部转移到怎么**维护 $f_i(j)$** 以及怎么**支持批量淘汰**上。

### 3. 用扫描线把 $f_i(j)$ 挂到线段树上

$f_i(j)$ 是关于两个变量 $(i, j)$ 的东西，直接存下来是 $O(nq)$，肯定不行。但注意到我们是按 $i = 1, 2, \dots, n$ 顺序扫过去的，而每次操作 $k$ 覆盖的是一段连续的位置 $[l_k, r_k]$——这就是经典的“扫描线 + 差分”套路：

- 扫到 $i = l_k$ 时，操作 $k$ 从这一位开始生效，于是对**所有** $j \ge k$，$f_i(j)$ 都要加上 $x_k$；
- 扫到 $i = r_k + 1$ 时，操作 $k$ 已经管不到这一位了，把刚才加的 $x_k$ 原样减回去。

也就是说，维护一棵下标为 $j \in [0, q]$ 的线段树，扫到位置 $l_k$ 时对区间 $[k, q]$ 做一次 $+x_k$ 的区间加，扫到位置 $r_k+1$ 时对区间 $[k, q]$ 做一次 $-x_k$ 的区间加抵消掉。这样任意时刻线段树里存的，就恰好是**当前位置 $i$ 对应的 $f_i(j)$**，对所有 $j$ 同时维护，全程摊下来只有 $O(q)$ 次区间加。

```cpp
for (int i = 1; i <= n; i++) {
    for (auto [idx, val] : events[i]) {
        sgt.modify(idx, q, val);
    }
    // 此刻线段树里存的就是 f_i(0..q)
}
```

### 4. 批量淘汰：线段树也能"判死刑"

有了 $f_i(j)$，每一步要做两件事：查全局最小值，把所有值 $> \min$ 的叶子永久剔除出局（赋成 $+\infty$，以后既不会被选中也不会再被更新影响结果）。这正是 **segment tree beats** 里最经典的一招：维护区间的 $\min$ 和 $\max$，剔除时如果某棵子树的 $\max \le limit$ 就直接跳过（这些人已经全部合格，不用管），否则递归下去，一路递归到叶子把不合格的枪毙掉。

```cpp
void discard(int v, int l, int r, int limit) {
    if (tr[v].mx <= limit) return; // 整棵子树都合格，剪掉这一支
    if (l == r) { tr[v].mn = tr[v].mx = INF; return; } // 判死刑
    pushdown(v);
    int mid = (l + r) >> 1;
    discard(v * 2, l, mid, limit);
    discard(v * 2 + 1, mid + 1, r, limit);
    pushup(v);
}
```

因为每个叶子（每个候选 $j$）一辈子只会被判死一次，所以尽管单次 `discard` 看起来可能递归到很多叶子，但**均摊**下来整个扫描过程里 `discard` 的总代价是 $O(q \log q)$——这跟经典的势能分析（区间开方、区间取模那一套）是同一个道理。

### 5. 组装起来

对每个位置 $i$：先把这一位新生效/失效的操作差分更新打到线段树上，查一次全局最小值 $best$（就是答案在这一位的取值），令 $a_i \mathrel{+}= best$，再把所有当前值 $> best$ 的候选剔除。$n$ 个位置各做一遍，总复杂度

$$ O\big((n + q)\log q\big) $$

轻松跑进 $3$ 秒时限。

回头看这道 $*2400$ 的题，真正巧妙的地方在于把“字典序最小”翻译成了**逐位淘汰候选** —— 一旦想通这一点，剩下的“怎么维护 $f_i(j)$”交给差分扫描线，“怎么批量淘汰”交给 segment tree beats 式的势能剪枝，两个经典套路一拼就通关了。

### CPP 代码实现

```cpp
// C. Minimum Array

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

struct SGT {
    struct Node { int mn, mx, tag; };

    int n;
    vector<Node> tr;

    SGT(int n) : n(n), tr(4 * n + 4) {
        build(1, 0, n - 1);
    }

    void build(int v, int l, int r) {
        tr[v] = {0, 0, 0};
        if (l == r) return;
        int mid = (l + r) >> 1;
        build(v * 2, l, mid);
        build(v * 2 + 1, mid + 1, r);
    }

    void apply(int v, int val) {
        tr[v].mn += val;
        tr[v].mx += val;
        tr[v].tag += val;
    }

    void pushdown(int v) {
        if (tr[v].tag != 0) {
            apply(v * 2, tr[v].tag);
            apply(v * 2 + 1, tr[v].tag);
            tr[v].tag = 0;
        }
    }

    void pushup(int v) {
        tr[v].mn = min(tr[v * 2].mn, tr[v * 2 + 1].mn);
        tr[v].mx = max(tr[v * 2].mx, tr[v * 2 + 1].mx);
    }

    void update(int v, int l, int r, int L, int R, int val) {
        if (R < l || r < L) return;
        if (L <= l && r <= R) { apply(v, val); return; }
        pushdown(v);
        int mid = (l + r) >> 1;
        update(v * 2, l, mid, L, R, val);
        update(v * 2 + 1, mid + 1, r, L, R, val);
        pushup(v);
    }

    void discard(int v, int l, int r, int limit) {
        if (tr[v].mx <= limit) return;
        if (l == r) { tr[v].mn = tr[v].mx = INF; return; }
        pushdown(v);
        int mid = (l + r) >> 1;
        discard(v * 2, l, mid, limit);
        discard(v * 2 + 1, mid + 1, r, limit);
        pushup(v);
    }

    void modify(int L, int R, int val) { update(1, 0, n - 1, L, R, val); }
    int query_min() { return tr[1].mn; }
    void kill_worse_than(int limit) { discard(1, 0, n - 1, limit); }
};

void solve() {

    int n;
    cin >> n;
    vector<int> a(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];

    int q;
    cin >> q;
    vector<vector<pair<int, int>>> events(n + 2);
    for (int i = 1; i <= q; i++) {
        int l, r, x;
        cin >> l >> r >> x;
        events[l].pb({i, x});
        events[r + 1].pb({i, -x});
    }

    SGT sgt(q + 1);
    for (int i = 1; i <= n; i++) {
        for (auto [idx, val] : events[i]) {
            sgt.modify(idx, q, val);
        }
        int best = sgt.query_min();
        a[i] += best;
        sgt.kill_worse_than(best);
    }

    for (int i = 1; i <= n; i++) cout << a[i] << " ";
    cout << endl;

}

signed main() {

    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t;
    cin >> t;

    while (t--) {
        solve();
    }

}
```
