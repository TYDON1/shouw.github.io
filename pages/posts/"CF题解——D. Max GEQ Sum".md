---
title: "CF题解——Max GEQ Sum"
date: "2026-01-31 14:10:22"
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
  - 单调栈
  - 线段树
---

# D. Max GEQ Sum 解题思路

### 核心问题分析

题目要求判断对于数组中所有的子区间 $[i, j]$，是否都满足：区间最大值 $\ge$ 区间和。
即：

$$
\max(a_i, \dots, a_j) \ge \sum_{k=i}^j a_k
$$

数据范围 $N \le 2 \cdot 10^5$，这意味着我们需要一个 $O(N \log N)$ 或 $O(N)$ 的解法。直接枚举所有区间 $O(N^2)$ 显然不可行。

### 1. 转换视角 (Contribution Technique)

与其枚举区间，不如枚举数组中的每个元素 $a_k$，假设它是某个区间的**最大值**。
对于固定的 $a_k$，我们需要找到它能作为最大值的最大范围 $(L_k, R_k)$。
在这个范围内，对于任意包含 $a_k$ 的子区间 $[i, j]$ ($L_k < i \le k \le j < R_k$)，都需要满足：

$$
a_k \ge \text{Sum}(i, j)
$$

### 2. 确定最大值的统治范围 (单调栈)

我们要找到 $a_k$ 向左和向右分别能延伸多远，且保持 $a_k$ 是最大值。
这可以通过**单调栈**在 $O(N)$ 时间内求出。

* $L_k$: 左边第一个**严格大于** $a_k$ 的位置。
* $R_k$: 右边第一个**大于** $a_k$ 的位置（处理相等元素时，一边取严格大于，一边取大于等于，以避免重复计算或遗漏，本题代码逻辑中处理的是只要 $\le$ 就弹栈，即找严格大于）。

在区间 $(L_k, R_k)$ 内，任何跨过 $k$ 的子数组都以 $a_k$ 为最大值。

### 3. 验证不等式 (前缀和与最值查询)

对于确定的 $k$ 和范围 $(L_k, R_k)$，我们需要验证是否对于所有合法的 $i, j$，都有 $\text{Sum}(i, j) \le a_k$。
如果存在一个反例 $\text{Sum}(i, j) > a_k$，则输出 NO。

我们知道 $\text{Sum}(i, j) = \text{Sum}(i, k) + \text{Sum}(k, j) - a_k$（因为 $a_k$ 被加了两次，需减去一次，或者理解为左半部分后缀和 + 右半部分前缀和）。

这里有一个关键的数学推导：
如果存在一个跨过 $k$ 的区间和大于 $a_k$，即 $\text{Sum}(i, j) > a_k$，那么必然满足以下**至少一个**条件：

1. $\text{Sum}(i, k) > a_k$ （以 $k$ 结尾的左侧子区间和超标）
2. $\text{Sum}(k, j) > a_k$ （以 $k$ 开始的右侧子区间和超标）

**证明：**
假设 $\text{Sum}(i, k) \le a_k$ 且 $\text{Sum}(k, j) \le a_k$。
那么 $\text{Sum}(i, j) = \text{Sum}(i, k) + \text{Sum}(k, j) - a_k \le a_k + a_k - a_k = a_k$。
这与假设 $\text{Sum}(i, j) > a_k$ 矛盾。
因此，我们只需要**独立检查**：

* 在范围 $(L_k, k]$ 内，以 $k$ 结尾的最大后缀和是否 $> a_k$。
* 在范围 $[k, R_k)$ 内，以 $k$ 开头的最大前缀和是否 $> a_k$。

### 4. 数据结构选择

为了快速查询范围内的最大前缀和/后缀和，我们可以利用**前缀和数组** $B$ ($B_i = \sum_{x=0}^{i-1} a_x$) 配合**线段树**。

* **右侧检查：** 我们需要找 $j \in [k+1, R_k]$ 使得 $\text{Sum}(k, j-1) = B_j - B_k$ 最大。即查询 $\max_{j \in [k+1, R_k]}(B_j) - B_k > a_k$。
* **左侧检查：** 我们需要找 $i \in [L_k+1, k]$ 使得 $\text{Sum}(i, k) = B_{k+1} - B_i$ 最大。即查询 $B_{k+1} - \min_{i \in [L_k+1, k]}(B_i) > a_k$。

线段树可以支持 $O(1)$ 或 $O(\log N)$ 的区间最大/最小值查询。

### 5. 代码实现细节

1. 构建前缀和数组 `b`。
2. 利用单调栈计算每个 $i$ 的左右边界 $L[i]$ 和 $R[i]$。
3. 构建线段树维护 `b` 数组的区间最大值和最小值。
4. 遍历每个 $i$，查询线段树验证上述两个条件。如果任意条件违反，输出 "NO"。
5. 所有检查通过，输出 "YES"。

```cpp
#include <bits/stdc++.h>
#define int long long
#define endl "\n"

using namespace std;

// 线段树节点信息，维护区间最大值和最小值
struct Info {
    int max_v = -2e18; // 初始化为极小值
    int min_v = 2e18;  // 初始化为极大值

    Info() {}
    Info(int v) : max_v(v), min_v(v) {}

    // 合并两个节点的信息
    friend Info operator+(const Info &a, const Info &b) {
        Info res;
        res.max_v = std::max(a.max_v, b.max_v);
        res.min_v = std::min(a.min_v, b.min_v);
        return res;
    }
};

// 通用线段树模板
template<class Info>
struct Segment_Tree {
    int n;
    vector<Info> info;
    Segment_Tree(): n(0) {}

    Segment_Tree(int n_, Info v_ = Info()) {
        init(n_, v_);
    }

    template<class T>
    Segment_Tree(vector<T> init_) {
        init(init_);
    }

    void init(int n_, Info v_ = Info()) {
        init(vector<Info>(n_, v_));
    }

    template<class T>
    void init(vector<T> init_) {
        n = init_.size();
        info.assign(4 << bit_width(unsigned(n)), Info());

        function<void(int, int, int)> build = [&](int p, int l, int r) {
            if (l == r) {
                info[p] = init_[l];
                return;
            }
            int m = (l + r) >> 1;
            build(2 * p, l, m);
            build(2 * p + 1, m + 1, r);
            pull(p);
        };
        build(1, 0, n - 1);
    }

    void pull(int p) {
        info[p] = info[p * 2] + info[p * 2 + 1];
    }

    // 区间查询
    Info query(int p, int l, int r, int x, int y) {
        if (l > y || r < x) {
            return Info();
        }
        if (l >= x && r <= y) {
            return info[p];
        }
        int m = (l + r) >> 1;
        return query(2 * p, l, m, x, y) + query(2 * p + 1, m + 1, r, x, y);
    }

    Info query(int l, int r) {
        if (l > r) {
            return Info();
        }
        return query(1, 0, n - 1, l, r);
    }
};

void solve() {
    int n;
    cin >> n;
    vector<int> a(n);
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }

    // 计算前缀和数组 b，注意 b 的大小为 n+1
    // b[i] 表示 a[0]...a[i-1] 的和
    vector<int> b(n + 1);
    for (int i = 0; i < n; i++) {
        b[i + 1] = a[i] + b[i];
    }

    // 单调栈求左右边界
    vector<int> L(n), R(n);
    stack<int> s;

    // 求 L[i]: 左侧第一个 > a[i] 的位置
    for (int i = 0; i < n; i++) {
        while (!s.empty() && a[s.top()] <= a[i]) {
            s.pop();
        }
        if (!s.empty()) {
            L[i] = s.top();
        } else {
            L[i] = -1; // 边界
        }
        s.push(i);
    }

    while (!s.empty()) s.pop();

    // 求 R[i]: 右侧第一个 > a[i] 的位置
    for (int i = n - 1; i >= 0; i--) {
        while (!s.empty() && a[s.top()] <= a[i]) {
            s.pop();
        }
        if (!s.empty()) {
            R[i] = s.top();
        } else {
            R[i] = n; // 边界
        }
        s.push(i);
    }

    // 在前缀和数组上建立线段树
    Segment_Tree<Info> st(b);

    for (int i = 0; i < n; i++) {
        int val = a[i];
        
        // 检查右侧子段：Range [i, R[i]-1]
        // 对应的 b 索引范围是 [i+1, R[i]]
        // max(b[k]) - b[i] > a[i] ?
        Info r_res = st.query(i + 1, R[i]);
        if (r_res.max_v - b[i] > val) {
            cout << "NO" << endl;
            return;
        }

        // 检查左侧子段：Range [L[i]+1, i]
        // 对应的 b 索引范围是 [L[i]+1, i]
        // b[i+1] - min(b[k]) > a[i] ?
        Info l_res = st.query(L[i] + 1, i);
        if (b[i + 1] - l_res.min_v > val) {
            cout << "NO" << endl;
            return;
        }
    }

    cout << "YES" << endl;
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
