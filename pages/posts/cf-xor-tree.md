---
title: "CF题解——Xor Tree"
date: "2026-06-01 20:43:11"
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
 - 位运算
 - 树形DP
---

# C. Xor Tree 解题思路

### 核心问题分析

题目给了我们一个有点绕的"good 序列"定义，先把它翻译成人话。

对一个**两两不同**的非负整数序列 $(b_1, \dots, b_k)$，我们这样建图：对每个 $b_i$，去找一个 $b_j$（$j \neq i$），使得 $b_i \oplus b_j$ 在所有 $j$ 里**最小**，然后在 $b_i$ 和 $b_j$ 之间连一条无向边（重复的边只算一次）。如果最终得到的图恰好是一棵**树**（连通且无环），就说这个序列是 good 的。

现在给你一个长度为 $n$（$n \le 2 \times 10^5$，$0 \le a_i \le 10^9$）的序列，你可以删掉若干个元素，问**最少删几个**才能让剩下的序列变成 good 的。

突破口在哪？关键词是 **XOR 最小**。两个数异或最小，意味着它们在二进制下"高位尽量一致"——这天生就是 **01-Trie** 的主场。我们把所有数按二进制位从高到低插进一棵 01-Trie，整道题的结构就在这棵树上慢慢浮现出来了。

### 1. 在 01-Trie 上重新审视那些边

每个数从最高位（这里取 31 位）往下走，0 走左、1 走右，插进 Trie。那么"$b_i \oplus b_j$ 最小的 $j$"是谁？就是在 Trie 上**与 $b_i$ 在尽可能深的地方才分道扬镳**的那个数——也就是和 $b_i$ 共享最长公共前缀的那个伙伴。

于是连边的行为有了非常清爽的几何意义：每个数都会优先和"离自己最近的同伴"连边。把目光聚焦到 Trie 的任意一个**内部分叉节点** $u$（即它的 $0$ 子树和 $1$ 子树都非空），这个节点把它子树里的数劈成了两拨：走 $0$ 的一拨、走 $1$ 的一拨。

- 同一拨内部的数，彼此公共前缀更长，异或更小，所以它们会**优先在拨内部**互相连边；
- 只有当一拨里的某个数找遍同拨也得跨过这个分叉点 $u$ 才能找到最近伙伴时，才会产生一条**跨越 $u$ 的边**。

### 2. 关键引理：每个分叉点最多只能"伸出"一条跨界边

这就是整道题的灵魂。我们来想想：图要是一棵树，那它**没有环**。

考虑分叉点 $u$ 的两个子树，左边一拨记作 $L$、右边一拨记作 $R$。$L$ 里的每个数，它在 $R$ 里的"最近伙伴"是唯一的某个数（因为找的是 XOR 最小）；反过来 $R$ 里的数在 $L$ 里也各有最近伙伴。

现在假设 $L$ 里**有两个或更多**的数都想往 $R$ 连边，会发生什么？这两个数在 $L 内部$已经各自连通到了一片，再各拉一条边去 $R$，就等于在"$L$ 这一团"和"$R$ 这一团"之间架了**两座桥**——两座桥必然把两团并成一个环！有环就不是树了，直接判死刑。

所以我们得到一条铁律：

> **要让整张图是树，对每个分叉节点 $u$，跨越它的左右两子树之间，至多只能有一条边。** 而一条边只需要一边"伸出一个点"即可。等价地说：在分叉点 $u$ 处，左右两拨里**至少有一拨只能剩下 $1$ 个数**。

如果两拨都剩 $\ge 2$ 个数，那两拨之间至少会被各自的"最近跨界伙伴"拉出两条以上的边，成环，gg。

### 3. 顿悟时刻：把问题翻译成"每个分叉点砍掉小的那一侧"

铁律就位，删除策略也就呼之欲出了。我们要**最少删**，等价于**最多保留**。

设 $f(u)$ 表示"以 $u$ 为根的这棵子 Trie 里，最多能保留多少个数，使得这部分自身合法"：

- 如果 $u$ 是**叶子**（没有任何孩子，对应一个具体的数走到了底），那它就是 $1$ 个数，$f(u) = 1$；
- 如果 $u$ **只有一个孩子**（不分叉），那这里不会产生跨界冲突，直接把唯一孩子的结果继承上来，$f(u) = f(\text{child})$；
- 如果 $u$ **两个孩子都有**（真正的分叉点），按第 2 节的铁律，两拨里必须有一拨被砍到只剩 $1$ 个。为了保留得最多，我们当然**保留更大的那一拨完整**，把另一拨**只留 $1$ 个代表、其余全删**。于是

$$ f(u) = \max\big(f(\text{left}),\ f(\text{right})\big) + 1 $$

那个 $+1$ 就是被砍那一侧留下的唯一幸存者。

这段逻辑和代码里的 `dfs` 一一对应，看得人神清气爽：

```cpp
int dfs(int u) {
    if (!tr[u][0] && !tr[u][1]) {
        return 1;
    }
    if (tr[u][0] && tr[u][1]) {
        return max(dfs(tr[u][0]), dfs(tr[u][1])) + 1;
    }
    if (tr[u][0]) return dfs(tr[u][0]);
    return dfs(tr[u][1]);
}
```

最后，从根 $0$ 跑一遍 $f(0)$ 就是**最多能保留的元素个数** `max_n`，答案就是

$$ \text{ans} = n - f(0) $$

干净利落，连排序都不用。

### 4. 实现里的小细节

代码用 `vector<vector<int>> tr` 手写了一棵 01-Trie，从第 $31$ 位插到第 $0$ 位，足够覆盖 $a_i \le 10^9 < 2^{30}$ 的范围（多留几位丝毫不影响正确性）。`insert` 里那个 `msg` 参数其实压根没用上——它本是想给每个数挂个编号，但本题只需要"还剩几个数"这个计数信息，所以可以完全无视它。

复杂度方面：插入 $n$ 个数、每个数 $32$ 位，建树是 $O(32n)$；`dfs` 把每个 Trie 节点恰好访问一次，节点总数也是 $O(32n)$ 级别。整体 $O(n \log a_i)$，对 $2 \times 10^5$ 的数据规模轻轻松松。

唯一要注意的是 Trie 的空间：`tr` 预分配了 $2 \times 10^5 \times 32$ 个节点，对应最坏情况下每个数独占一条路径，开够就稳了。

### CPP 代码实现

```cpp
// C. Xor Tree

#include <bits/stdc++.h>
#include <ext/pb_ds/assoc_container.hpp>
#include <ext/pb_ds/tree_policy.hpp>
#define lg(x) (63 - __builtin_clzll(x))
#define all(x) (x).begin(), (x).end()
#define low_bit(x) ((x) & (-x))
#define pb push_back
#define db long double
// #define int long long
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

struct trie_01 {
    const int MAX_N = 2e5 + 10;
    vector<vector<int>> tr;
    int tot = 0;
    trie_01() {
        tr.resize(MAX_N * 32, vector<int>(2));
    }

    void insert(int x, int msg) {
        int u = 0;
        for (int i = 31; i >= 0; i--) {
            int bit = x >> i & 1;
            if (!tr[u][bit]) {
                tr[u][bit] = ++tot;
            }
            u = tr[u][bit];
        }
    }

    int dfs(int u) {
        if (!tr[u][0] && !tr[u][1]) {
            return 1;
        }
        if (tr[u][0] && tr[u][1]) {
            return max(dfs(tr[u][0]), dfs(tr[u][1])) + 1;
        }
        if (tr[u][0]) return dfs(tr[u][0]);
        return dfs(tr[u][1]);
    }
};

void solve() {

    int n;
    cin >> n;
    trie_01 tr;
    vector<int> a(n + 1);
    for (int i = 1; i <= n; ++i) {
        cin >> a[i];
        tr.insert(a[i], i);
    }
    int max_n = tr.dfs(0);
    cout << n - max_n << endl;

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
