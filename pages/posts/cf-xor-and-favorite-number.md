---
title: "CF题解——XOR and Favorite Number"
date: "2026-05-14 22:37:09"
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
 - 莫队
 - 前缀和
 - 位运算
---

# E. XOR and Favorite Number 解题思路

### 核心问题分析

题意很直白：给一个长度为 $n$ 的数组 $a$，以及 Bob 的幸运数 $k$。每个询问给定区间 $[l, r]$，问你：在这段区间里，有多少对 $(i, j)$ 满足 $l \le i \le j \le r$，且 $a_i \oplus a_{i+1} \oplus \cdots \oplus a_j = k$。一共 $m$ 个询问。

数据范围 $1 \le n, m \le 10^5$，$0 \le k, a_i \le 10^6$，时限给到了慷慨的 4 秒。

“连续子段的异或和”这种东西，看到就该条件反射——**前缀异或**。令 $p_0 = 0$，$p_i = a_1 \oplus a_2 \oplus \cdots \oplus a_i$，那么子段 $[i, j]$ 的异或和就是 $p_{i-1} \oplus p_j$。于是“子段异或等于 $k$”被翻译成：

$$ p_{i-1} \oplus p_j = k \quad\Longleftrightarrow\quad p_{i-1} = p_j \oplus k $$

问题瞬间变味：在前缀异或数组里，找有多少对**满足异或值为 $k$ 的下标对**。而多个区间询问、又没有修改、还能离线——这味儿太冲了，**莫队**它来了。

### 1. 把区间端点翻译成前缀下标：错位一格的小心机

先把题目里的“元素下标区间 $[l, r]$”和“前缀下标”的关系捋清楚，这是最容易翻车的地方。

子段 $[i, j]$（$l \le i \le j \le r$）对应的是前缀对 $(p_{i-1}, p_j)$。让 $i$ 取遍 $[l, r]$、$j$ 取遍 $[i, r]$，那么用到的前缀下标是谁？$i-1$ 最小到 $l-1$，$j$ 最大到 $r$。也就是说，我们真正要操作的是**前缀下标区间 $[l-1, r]$** 上的所有 $p$ 值，在这个集合里数“异或为 $k$ 的无序对”。

所以代码里 `add_query` 把询问的左端点悄悄往左挪了一格：

```cpp
void add_query(int id, int l, int r) {
    queries[id] = {l - 1, r, id, (l - 1) / block_size};
}
```

记住这个 `l - 1`，它就是把“元素区间”对齐到“前缀区间”的那个关键错位。后面莫队的指针 `curL`、`curR` 全程都在前缀下标这个语境里游走。

### 2. 莫队的灵魂：增删一个端点，答案怎么动？

莫队的本质是：把所有询问按一种巧妙的顺序排好，然后用两个指针 `[curL, curR]` 像毛毛虫一样缓慢挪动，每次只增删一个端点，分摊下来总移动量是 $O((n+m)\sqrt n)$。关键在于——**加入/删除一个前缀值时，当前答案怎么 $O(1)$ 更新？**

我们维护一个桶 `cnt[v]`，表示当前窗口里前缀值等于 $v$ 的出现次数。当前答案 `current_res` 是窗口内异或为 $k$ 的对数。

加入一个下标 `idx`、它的前缀值是 $x = p_{idx}$ 时：它能和窗口里**已经存在的、值为 $x \oplus k$ 的那些前缀**两两配对（因为 $x \oplus (x\oplus k) = k$）。所以先吃这份贡献，再把自己计入桶：

```cpp
void add(int idx) {
    int x = pref[idx];
    current_res += cnt[x ^ k];
    cnt[x]++;
}
```

删除是加入的严格逆操作——**顺序必须反过来**：先把自己从桶里抠掉，再扣掉它和剩下那些 $x \oplus k$ 的配对贡献。

```cpp
void del(int idx) {
    int x = pref[idx];
    cnt[x]--;
    current_res -= cnt[x ^ k];
}
```

为什么 add 是“先加贡献后入桶”、del 是“先出桶后减贡献”？因为我们要保证：计算某个元素与“别人”的配对时，桶里**不能把它自己也算进去**。add 时它还没进桶，正好；del 时先让它退场，剩下的才是“别人”。一进一出严丝合缝，互为逆操作。

这里还有个隐藏的彩蛋：当 $k = 0$ 时，$x \oplus k = x$，意味着任意两个相等的前缀值都构成一对——这恰好对应异或和为 $0$ 的子段，而上面的逻辑天然就把它处理对了，丝毫不用特判。

### 3. 奇偶块排序：莫队的提速玄学

莫队的询问排序，最朴素的写法是“先按左端点所在块、块内按右端点”。但这份代码用了进阶的**奇偶块优化**：

```cpp
bool operator<(const Query& other) const {
    if (block != other.block) return block < other.block;
    return (block & 1) ? (r < other.r) : (r > other.r);
}
```

含义是：左端点块号不同就按块号排；同一块内，**偶数块按右端点升序、奇数块按右端点降序**。这样当 `curR` 扫完一个块冲到最右边后，进入下一块时不用再退回最左，而是直接掉头从右往左扫，省下大量回程移动。实测能稳定快上一截，是莫队党的标准配置。

块长的选取也颇讲究：

```cpp
block_size = max(1.0, (double)(n + 1) / sqrt(max(1.0, (double)q * 2.0 / 3.0)));
```

这不是拍脑袋的 $\sqrt n$，而是按 $n$ 与 $m$ 的相对规模做了平衡（理论最优块长约为 $\frac{n}{\sqrt{m}}$ 量级），让左右指针的总移动量更均衡。

### 4. 指针挪动的四连击与桶的大小

`solve` 里那段经典的四个 while，就是把窗口从 `[curL, curR]` 拖到目标 `[l, r]`：

```cpp
while (curL > qry.l) add(--curL);
while (curR < qry.r) add(++curR);
while (curL < qry.l) del(curL++);
while (curR > qry.r) del(curR--);
```

注意**先扩张后收缩**（先 add 再 del）的顺序——如果先收缩，窗口可能瞬间变成 `curL > curR` 的非法状态，导致重复删除把桶减成负数。先把两头撑开再往里收，全程窗口非空，稳。

还有个容易忽视的细节：桶开多大？因为 $a_i \le 10^6 < 2^{20}$，前缀异或值不会超过 $2^{20} - 1$，所以桶按 `1 << 20`（约 $10^6$）开就够覆盖所有可能的 $p_i$ 和 $p_i \oplus k$，主函数里那句 `MoSolver ms(n, m, k, 1 << 20)` 正是为此。

初始 `curL = 0, curR = -1` 表示空窗口，第一步 add 会把 $p_0$ 这个“起点前缀”也纳入考量——别忘了 $p_0 = 0$ 本身就是合法的一个前缀下标，前面那个 `l - 1` 的错位保证了它在该出现时一定被包含进来。

整体复杂度 $O\big((n + m)\sqrt n\big)$，对 $10^5$ 的规模配上 4 秒时限，轻轻松松通过。

### CPP 代码实现

```cpp
// E. XOR and Favorite Number

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

struct MoSolver {
    struct Query {
        int l, r, id, block;
        bool operator<(const Query& other) const {
            if (block != other.block) return block < other.block;
            return (block & 1) ? (r < other.r) : (r > other.r);
        }
    };

    int n, q, k, block_size;
    vector<int> pref;
    vector<Query> queries;
    vector<int> ans;
    vector<int> cnt;
    int curL = 0, curR = -1;
    int current_res = 0;

    MoSolver(int _n, int _q, int _k, int max_val) : n(_n), q(_q), k(_k) {
        queries.resize(q);
        ans.resize(q);
        cnt.assign(max_val + 1, 0);
        block_size = max(1.0, (double)(n + 1) / sqrt(max(1.0, (double)q * 2.0 / 3.0)));
    }

    void add(int idx) {
        int x = pref[idx];
        current_res += cnt[x ^ k];
        cnt[x]++;
    }

    void del(int idx) {
        int x = pref[idx];
        cnt[x]--;
        current_res -= cnt[x ^ k];
    }

    void add_query(int id, int l, int r) {
        queries[id] = {l - 1, r, id, (l - 1) / block_size};
    }

    void solve() {
        sort(queries.begin(), queries.end());
        curL = 0; curR = -1;
        current_res = 0;
        for (auto& qry : queries) {
            while (curL > qry.l) add(--curL);
            while (curR < qry.r) add(++curR);
            while (curL < qry.l) del(curL++);
            while (curR > qry.r) del(curR--);
            ans[qry.id] = current_res;
        }
    }
};

void solve() {

    int n, m, k;
    cin >> n >> m >> k;
    vector<int> a(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];
    MoSolver ms(n, m, k,  1 << 20);;
    vector<int> pref(n + 1);
    for (int i = 1; i <= n; i++) {
        pref[i] = pref[i - 1] ^ a[i];
    }
    ms.pref = pref;
    for (int i = 0; i < m; i++) {
        int l, r;
        cin >> l >> r;
        ms.add_query(i, l, r);
    }
    ms.solve();
    for (int i = 0; i < m; i++) {
        cout << ms.ans[i] << endl;
    }

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
