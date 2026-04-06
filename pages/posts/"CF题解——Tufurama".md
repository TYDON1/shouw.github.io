---
title: "CF题解——Tufurama"
date: "2026-04-06 20:30:19"
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
 - 主席树
 - 可持久化线段树
 - 二维偏序
---

# E. Tufurama 解题思路

### 核心问题分析

题目包装了一个很长且容易绕晕的故事：电视连续剧有 $n$ 季，第 $i$ 季有 $a_i$ 集。如果我们要搜“第 $x$ 季第 $y$ 集”，结果却弹出了“第 $y$ 季第 $x$ 集”，就会产生误导。我们要计算有多少对 $(x, y)$ 存在这样的误导。

遇到这种题，我们一定要第一时间拨开迷雾，把文字转化为纯粹的数学符号。
产生误导的条件是什么？
1.  首先题目要求统计的对满足 $x < y$。
2.  必须存在“第 $x$ 季第 $y$ 集” $\implies$ 第 $x$ 季的总集数 $a_x \ge y$。
3.  必须存在“第 $y$ 季第 $x$ 集” $\implies$ 第 $y$ 季的总集数 $a_y \ge x$。

综上所述，我们要找的是满足以下条件的数对 $(x, y)$ 的数量：
**$x < y \le a_x$ 且 $a_y \ge x$**

### 1. 降维打击：固定一维，寻找区间

这是一个非常典型的**二维偏序**问题。对于二维限制，最常规的思路就是**固定一维，考察另一维**。

我们假设当前枚举的变量是 $x$。
*   根据 $x < y \le a_x$，我们可以直接确定 $y$ 在原数组中的下标范围：$y \in [x+1, a_x]$。
*   由于 $y$ 作为下标不能超过总季数 $n$，所以 $y$ 实际的有效区间是：$y \in [x+1, \min(n, a_x)]$。

确定了 $y$ 的区间后，我们要在这个区间里寻找满足 $a_y \ge x$ 的元素有多少个。
这下问题就变得非常清晰了：**给定一个下标区间 $[L, R]$，查询在这个区间内，值 $\ge x$ 的数字个数。**

### 2. 效率考量与数据结构选择

要在静态数组的**任意区间**内进行**值域查询**，这简直就是把“我要用**主席树（可持久化线段树）**”写在了脸上！

*   **值域剪枝**：因为我们在查 $a_y \ge x$，而 $x$ 最大也就是 $n$。所以如果某个 $a_y$ 大于 $n$，它对后续所有的 $x$ 都必然满足大于等于的条件。因此，在把元素放入主席树时，我们直接取 $\min(a_i, n)$ 即可，这样既缩小了值域，又防止了线段树越界。
*   **前缀和思想**：主席树的精髓在于，第 $i$ 个版本的线段树维护了前 $i$ 个元素的权值信息。我们要查区间 $[L, R]$ 内值在 $[x, n]$ 的个数，只需要用第 $R$ 个版本的线段树中对应区间的值，减去第 $L-1$ 个版本中对应区间的值即可。单次查询的时间复杂度仅为 $O(\log n)$。

把所有的 $x$ 遍历一遍，累加查询结果，总复杂度 $O(N \log N)$，轻松跑过 $2 \cdot 10^5$ 的数据。

### CPP 代码实现

```cpp
// E. Tufurama

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

// 模块化原则：将主席树（可持久化权值线段树）独立封装
struct PST {
    struct Node {
        int count; // 当前值域区间内存在的数字个数
        int L, R;  // 左右子节点的编号（由于是动态开点，不再是简单的 2x 和 2x+1）
    };

    int n;          // 值域大小
    int node_cnt;   // 动态开点计数器
    vector<Node> tree; 
    vector<int> roots;// 记录每个历史版本的根节点编号

    // 预分配足够的空间，通常主席树需要 N * (logN + 1) 的空间，开 N * 45 足够安全
    PST(int range_n, int max_nodes) {
        n = range_n;
        node_cnt = 0;
        tree.resize(max_nodes);
        roots.push_back(0); // 初始第 0 个版本
    }

    // 在上一个版本 prev 的基础上，插入新值 val，生成新节点 curr
    int update(int prev, int l, int r, int val) {
        int curr = ++node_cnt;
        tree[curr] = tree[prev]; // 先完整复制历史版本的节点信息
        tree[curr].count++;      // 该值域区间数量 +1

        if (l == r) return curr;
        
        int mid = l + (r - l) / 2;
        // 只有修改的那一半需要新建节点，另一半直接沿用历史版本的指针
        if (val <= mid)
            tree[curr].L = update(tree[prev].L, l, mid, val);
        else
            tree[curr].R = update(tree[prev].R, mid + 1, r, val);
            
        return curr;
    }

    // 对外暴露的插入接口
    void insert(int val) {
        roots.push_back(update(roots.back(), 1, n, val));
    }

    // 经典的查询第 k 大（本题虽未使用，但保留作为完整模板是个好习惯）
    int query_kth(int u, int v, int l, int r, int k) {
        if (l == r) return l;

        int mid = l + (r - l) / 2;
        int left_size = tree[tree[v].L].count - tree[tree[u].L].count;

        if (k <= left_size) {
            return query_kth(tree[u].L, tree[v].L, l, mid, k);
        }
        return query_kth(tree[u].R, tree[v].R, mid + 1, r, k - left_size);
    }

    // 查询历史版本区间 [u, v] 内，值在 [ql, qr] 范围内的数字个数
    int query_count(int u, int v, int l, int r, int ql, int qr) {
        // 如果当前区间被查询区间完全覆盖，直接返回两个版本该区间 count 的差值
        if (ql <= l && r <= qr) {
            return tree[v].count - tree[u].count;
        }
        
        int mid = l + (r - l) / 2;
        int res = 0;
        if (ql <= mid) res += query_count(tree[u].L, tree[v].L, l, mid, ql, qr);
        if (qr > mid)  res += query_count(tree[u].R, tree[v].R, mid + 1, r, ql, qr);
        return res;
    }
};

void solve() {
    int n;
    cin >> n;
    vector<int> a(n + 1);
    
    // 初始化主席树，值域范围为 n
    PST pst(n, n * 45);

    for (int i = 1; i <= n; i++) {
        cin >> a[i];
        // 核心剪枝：所有大于 n 的集数对后续判断 x 的大小已经没有区别了
        // 和 n 取 min 可以把值域牢牢控制在 [1, n]
        pst.insert(min(a[i], n)); 
    }

    int sum = 0;
    // 枚举当前的 x
    for (int i = 1; i <= n; i++) {
        int q_val = a[i];
        
        // 确立 y 的搜索区间 [L, R]
        int L = i + 1;
        int R = min(n, q_val); 
        
        // 如果区间合法，则在对应的主席树历史版本中查询
        if (L <= R) {
            // 查询区间 [L, R] 中，值在 [i, n] 范围内的个数
            sum += pst.query_count(pst.roots[L - 1], pst.roots[R], 1, n, i, n);
        }
    }
    cout << sum << endl;
}

signed main() {
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    // cin >> t; // 本题仅单样例
    
    while (t--) {
        solve();
    }
}
```