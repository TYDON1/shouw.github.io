---
title: "CF题解——C. Restricted Sorting"
date: 2026-01-30 09:11:09
author: shouw
katex: true
email: KijinSeija@shouw.blog
readmore: true
tags:
  - 编程
  - 算法竞赛
  - 题解
  - 并查集
  - 二分答案
---

# C. Restricted Sorting 解题思路

### 核心问题分析

题目给定一个数组 $a$，并定义了一种交换操作：只有当 $|a_i - a_j| \ge k$ 时，才能交换 $a_i$ 和 $a_j$。
我们要寻找最大的整数 $k$（称为 "piggy"），使得数组可以通过任意次操作变为非降序排列。如果数组本身已经有序且 $k$ 可以任意大，则输出 -1。

### 1. 二分答案的单调性

首先考察 $k$ 的性质。
如果一个较大的 $k$ 是合法的（即能排序），那么比它小的 $k'$ 必然也是合法的。
这是因为 $k'$ 越小，限制条件 $|a_i - a_j| \ge k'$ 就越宽松，能进行的交换操作是 $k$ 时的超集。
因此，答案具有单调性，我们可以对 $k$ 进行 **二分查找**。

*   二分范围：$1$ 到 $\max(a) - \min(a) + 1$。
*   如果数组本身已经有序，根据题意输出 -1。这是特判情况。

### 2. Check 函数的设计 (基于连通性)

对于一个固定的 $k$，如何判断数组是否能被排序？
这是一个图论中的连通性问题。如果我们将可以交换的下标对 $(i, j)$ 之间连一条边，那么对于同一个连通分量内的元素，理论上可以通过中间节点进行位置交换。

然而，构建 $O(N^2)$ 的边是不现实的。我们需要找到关键的“枢纽”。
显然，数组中的 **全局最小值** ($min\_val$) 和 **全局最大值** ($max\_val$) 是最容易满足交换条件的元素。

*   如果一个元素 $a_i$ 能与 $min\_val$ 交换（即 $a_i - min\_val \ge k$），那么它可以借助 $min\_val$ 转移位置。
*   如果一个元素 $a_i$ 能与 $max\_val$ 交换（即 $max\_val - a_i \ge k$），同理。
*   如果 $max\_val - min\_val \ge k$，则最小值和最大值所在的连通块会合并。

**判断逻辑：**
我们使用 **并查集 (DSU)** 来维护连通性。在 `check(k)` 中：
1.  找出数组中的最小值下标 $idx\_min$ 和最大值下标 $idx\_max$。
2.  遍历所有 $i$，若 $a_i - a[idx\_min] \ge k$，则 `unite(i, idx_min)`。
3.  遍历所有 $i$，若 $a[idx\_max] - a_i \ge k$，则 `unite(i, idx_max)`。

**核心结论：**
如果一个元素 $i$ 在并查集中是 **孤立的**（`size == 1`），说明它既不能通过最小值移动，也不能通过最大值移动。
这种处于“中间值”且无法借助两端枢纽移动的元素，基本上是被“锁死”在原地的。
因此，对于所有孤立的 $i$，必须满足 $a_i$ 已经在其最终排序后的位置上（即 $a_i == b_i$，其中 $b$ 是 $a$ 排序后的数组）。
如果存在一个孤立点不在正确位置，则该 $k$ 不合法。

### 3. 为什么只考虑最值就足够？

或许有人会问，如果 $a_i$ 不能和最值交换，但能和中间某个数交换怎么办？
实际上，对于这类一维排序问题，如果一个数无法与极值（最容易满足条件的数）发生交互，它往往也无法通过其他“中间数”跳出其所在的“死锁区间”。
本题的限制实际上将数组分为了“可移动组”（连接到 Min/Max）和“固定组”（孤立点）。只要固定组都在正确位置，可移动组利用极值的“中转”能力通常足以完成排序。

### C++ 代码实现

代码中使用了并查集来维护连通块大小，并通过二分答案寻找最大 $k$。

```cpp
#include <bits/stdc++.h>
#define int long long
#define endl "\n"

using namespace std;

// 并查集结构体
struct DSU {
    vector<int> par;
    vector<int> sz;

    DSU(int n) {
        par.resize(n + 1);
        sz.resize(n + 1, 1);
        iota(par.begin(), par.end(), 0);
    }

    int find(int x) {
        if (par[x] == x) return x;
        return par[x] = find(par[x]);
    }

    void unite(int x, int y) {
        int root_x = find(x);
        int root_y = find(y);
        if (root_x == root_y) return;
        // 按大小合并，保证效率
        if (sz[root_x] < sz[root_y]) swap(root_x, root_y);
        par[root_y] = root_x;
        sz[root_x] += sz[root_y];
    }

    int get_size(int x) {
        return sz[find(x)];
    }
};

// 检查函数：判断是否存在一种排序方案
bool check(int k, int n, const vector<int>& a, const vector<int>& b, int idx_min, int idx_max) {
    DSU dsu(n);

    int val_min = a[idx_min];
    int val_max = a[idx_max];

    // 尝试将每个元素与全局最小值和最大值连接
    for (int i = 1; i <= n; i++) {
        if (a[i] - val_min >= k) {
            dsu.unite(i, idx_min);
        }
        if (val_max - a[i] >= k) {
            dsu.unite(i, idx_max);
        }
    }

    // 检查所有孤立点（无法借助极值移动的点）
    // 如果孤立点当前位置的值与排序后该位置应有的值不符，则无法排序
    for (int i = 1; i <= n; i++) {
        if (dsu.get_size(i) == 1) {
            if (a[i] != b[i]) return false;
        }
    }

    return true;
}

void solve() {
    int n;
    cin >> n;
    vector<int> a(n + 1);

    int idx_min = 1;
    int idx_max = 1;

    // 读入并寻找全局最小、最大值的下标
    for (int i = 1; i <= n; i++) {
        cin >> a[i];
        if (a[i] < a[idx_min]) idx_min = i;
        if (a[i] > a[idx_max]) idx_max = i;
    }

    // b 为排序后的目标数组
    vector<int> b = a;
    sort(b.begin() + 1, b.end());

    // 特判：如果原数组已经有序，根据题意输出 -1
    bool sorted = true;
    for(int i = 1; i <= n; i++){
        if(a[i] != b[i]){
            sorted = false;
            break;
        }
    }

    if (sorted) {
        cout << -1 << endl;
        return;
    }

    // 二分答案
    int l = 1;
    int r = a[idx_max] - a[idx_min] + 1; // 上界稍微放宽一点无所谓
    int ans = 1;

    while (l <= r) {
        int mid = l + (r - l) / 2;
        if (check(mid, n, a, b, idx_min, idx_max)) {
            ans = mid;
            l = mid + 1;
        } else {
            r = mid - 1;
        }
    }
    cout << ans << endl;
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