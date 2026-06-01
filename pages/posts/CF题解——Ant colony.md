---
title: "CF题解——Ant colony"
date: "2026-05-15 20:43:11"
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
 - 数学
 - 数据结构
 - 二分
---

# F. Ant colony 解题思路

### 核心问题分析

题面包了一层「饥饿游戏」的故事皮，咱们先把它剥干净。一排 $n$ 只蚂蚁，第 $i$ 只力量为 $s_i$。每次询问给一段区间 $[l, r]$，区间内的蚂蚁两两厮杀：蚂蚁 $i$ 打蚂蚁 $j$，**当且仅当 $s_i \mid s_j$（$s_i$ 整除 $s_j$）时 $i$ 得一分**。一只蚂蚁要想被释放（活下来），必须在它参与的每一场对决里都得分——也就是它的得分 $v_i = r - l$（区间内除自己外还有 $r-l$ 只蚂蚁）。最后没活下来的全被鼹鼠吃掉，问每次吃掉几只。

把「活下来」翻译成人话：蚂蚁 $i$ 要打赢区间里**所有**人，意味着 $s_i$ 必须整除区间里**每一个** $s_j$。能整除一堆数的数，最大能有多大？当然是它们的最大公约数 $\gcd$。而且 $s_i$ 自己也得是这堆数之一，所以——

> **一只蚂蚁能活下来，当且仅当 $s_i$ 恰好等于区间 $[l,r]$ 内所有力量值的 $\gcd$。**

数据范围 $n, t \le 10^5$，$s_i \le 10^9$，每次询问 $O(1)$ 或 $O(\log)$ 才扛得住。思路一下子就清晰了。

### 1. 顿悟时刻：能活的蚂蚁，力量正好等于区间 gcd

我们把上面的结论再咬死一点。设 $g = \gcd(s_l, s_{l+1}, \dots, s_r)$。

* 如果某只蚂蚁的力量 $s_i$ 能整除区间里所有数，那 $s_i$ 一定是这堆数的一个公约数，于是 $s_i \mid g$。
* 但 $s_i$ 自己也在区间里，所以 $g \mid s_i$。
* 两个整除关系一夹，逼出 $s_i = g$。

反过来也对：只要 $s_i = g$，因为 $g$ 整除区间每个数，这只蚂蚁就能横扫全场。所以「活下来的蚂蚁」与「力量值恰好等于区间 gcd 的蚂蚁」是**一一对应**的，一个不多一个不少。

于是被吃掉的数量就是一道减法题：

$$ \text{eaten} = (r - l + 1) \;-\; \#\{\, i \in [l, r] : s_i = g \,\} $$

剩下要解决的只有两件事：怎么快速求**区间 gcd**，怎么快速数**区间里等于 $g$ 的元素个数**。

### 2. 区间 gcd 交给 ST 表：可重复贡献的天选之子

求区间 $\gcd$ 用什么？这里没有修改，纯静态区间查询，而且 $\gcd$ 有一个美妙的性质——**可重复贡献**：$\gcd(a, a, b) = \gcd(a, b)$，重叠算两遍丝毫不影响结果。这正是 ST 表（稀疏表）大显身手的场景，预处理 $O(n \log n)$、单次查询 $O(1)$，比线段树还利索。

代码里把 ST 表写成了模板结构，`merge` 直接定义成 `gcd`：

```cpp
T merge(T a, T b) {
    return gcd(a, b);
}
```

查询时取两个长度为 $2^k$ 的块覆盖整个区间，重叠部分被 `gcd` 无痛吸收：

```cpp
T query(int L, int R) {
    if (L > R) return T();
    int k = lg[R - L + 1];
    return merge(st[L][k], st[R - (1 << k) + 1][k]);
}
```

一句 `st.query(l, r)` 就把这段区间的 $\gcd$（也就是 $g$，代码里叫 `tar`）拿到手了。

### 3. 数「等于 gcd 的个数」：值 → 位置列表 + 二分

知道了 $g$，还要数区间里有几个 $s_i = g$。直接扫一遍区间是 $O(n)$，$t$ 次询问就退化成 $O(nt)$，太慢。

漂亮的小技巧来了：读入时用一个 `map<int, vector<int>>` 把**每种力量值出现的所有下标**记下来，而且因为是从左到右扫的，每个值对应的下标 `vector` 天然**单调递增、已经有序**。

```cpp
map<int, vector<int>> mps;
for (int i = 1; i <= n; i++) {
    cin >> a[i];
    mps[a[i]].pb(i);
}
```

那么「区间 $[l, r]$ 里值等于 $g$ 的个数」，就是在 `mps[g]` 这个有序下标数组里，数出落在 $[l, r]$ 之间的元素个数——经典的二分查找区间计数：

```cpp
int tar = st.query(l, r);
auto it_1 = lower_bound(all(mps[tar]), l);
auto it_2 = upper_bound(all(mps[tar]), r);
int len = distance(it_1, it_2);
cout << r - l + 1 - len << endl;
```

`lower_bound` 找到第一个 $\ge l$ 的位置，`upper_bound` 找到第一个 $> r$ 的位置，两者之间的距离就是落在区间内的下标数，也就是能活下来的蚂蚁数 `len`。用区间长度 $r - l + 1$ 一减，正是被吃掉的数量。

拿样例 `1 3 2 4 2`、询问 `2 5`（即 `[3, 2, 4, 2]`）验一下：这段的 $\gcd = 1$，但值里没有 $1$，`len = 0`，吃掉 $4 - 0 = 4$ 只，和样例输出对上了；再看询问 `4 5`（即 `[4, 2]`），$\gcd = 2$，区间里值为 $2$ 的下标有 $\{3, 5\}$，落在 $[4,5]$ 的只有第 $5$ 个，`len = 1`，吃掉 $2 - 1 = 1$ 只。完美。

### 4. 复杂度小结

* ST 表预处理 $\gcd$：$O(n \log n)$，单次区间 $\gcd$ 查询 $O(1)$（其中每次 $\gcd$ 自带 $O(\log V)$ 的辗转相除开销）。
* 每次询问一次 ST 查询 + 两次二分：$O(\log n)$。

总复杂度大约 $O\big((n + t)\log n \log V\big)$，对 $10^5$ 的规模轻轻松松。一道把「整除链 ⇒ 区间 gcd」这层窗户纸捅破之后就瞬间变水题的好题。

### CPP 代码实现

```cpp
// F. Ant colony

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

template <typename T>
struct ST {
    int n;
    int max_log;
    vector<vector<T>> st;
    vector<int> lg;

    T merge(T a, T b) {
        return gcd(a, b);
    }

    ST(const vector<T>& a) {
        n = a.size();
        max_log = (n > 0) ? lg(n) + 1 : 0;

        st.assign(n, vector<T>(max_log));
        lg.assign(n + 1, 0);

        for (int i = 2; i <= n; i++) {
            lg[i] = lg[i / 2] + 1;
        }

        for (int i = 0; i < n; i++) {
            st[i][0] = a[i];
        }

        for (int j = 1; j < max_log; j++) {
            for (int i = 0; i + (1 << j) - 1 < n; i++) {
                st[i][j] = merge(st[i][j - 1], st[i + (1 << (j - 1))][j - 1]);
            }
        }
    }

    T query(int L, int R) {
        if (L > R) return T();
        int k = lg[R - L + 1];
        return merge(st[L][k], st[R - (1 << k) + 1][k]);
    }
};

void solve() {

    int n;
    cin >> n;
    vector<int> a(n + 1);
    map<int, vector<int>> mps;
    for (int i = 1; i <= n; i++) {
        cin >> a[i];
        mps[a[i]].pb(i);
    }
    ST st(a);
    int m;
    cin >> m;
    for (int i = 1; i <= m; i++) {
        int l, r;
        cin >> l >> r;
        int tar = st.query(l, r);
        auto it_1 = lower_bound(all(mps[tar]), l);
        auto it_2 = upper_bound(all(mps[tar]), r);
        int len = distance(it_1, it_2);
        cout << r - l + 1 - len << endl;
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
