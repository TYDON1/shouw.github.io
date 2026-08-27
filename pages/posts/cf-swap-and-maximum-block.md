---
title: "CF题解——Swap and Maximum Block"
date: "2026-06-04 21:18:36"
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
 - 分治
 - DP
 - 线段树
---

# E. Swap and Maximum Block 解题思路

### 核心问题分析

题意：给定一个长度为 $2^n$ 的数组 $a$。允许的操作是：任选一个 $k$（$0 \le k < n$），把数组按长度 $2^{k+1}$ 分块之后，在某一块内部，把它的**前半 $2^k$ 个数**和**后半 $2^k$ 个数**整体交换位置。可以执行任意次这样的操作。问操作完之后，数组的**最大子段和**最多能是多少。

看到“长度是 $2^n$”“按 $2^{k+1}$ 分块、交换前后两半”这种描述，脑子里应该立刻弹出一棵**满二叉树**：把数组看成线段树的叶子，每一个内部节点管辖一段 $2^k$ 长度的区间，而“允许交换前后两半”，翻译过来就是——**每个内部节点都可以自由决定：它的左右两个子树，谁排在前面、谁排在后面**。这是一道包裹在“数组操作”外壳下的树形 DP 题。

### 1. 把问题搬到线段树上

既然每个节点都能独立决定自己两个子树的左右顺序，那这道题本质上就是：给一棵满二叉树的每个内部节点各发一个开关（不翻转 / 翻转），求把所有开关调到最优状态后，整个数组的最大子段和。

线段树维护最大子段和是经典操作，每个节点要维护四个量：区间和 $sum$、最大前缀和 $pre$、最大后缀和 $suf$、最大子段和 $best$。正常的（不能交换的）合并公式是：

$$ sum = sum_L + sum_R,\quad pre = \max(pre_L,\ sum_L + pre_R),\quad suf = \max(suf_R,\ sum_R + suf_L) $$
$$ best = \max(best_L,\ best_R,\ suf_L + pre_R) $$

现在这道题给了我们一个额外的自由度：**每个节点在合并左右儿子时，可以选择先放右儿子、再放左儿子**（把 $L, R$ 互换）。

### 2. 关键洞察：四个量各自独立地选最优方向

乍一看会担心：如果 $pre$ 想要“不交换”、$suf$ 想要“交换”，那这个节点到底该处于哪种状态？——但仔细想想会发现**根本不需要纠结**。因为 $pre_L, suf_L, best_L$（以及右边同理）都已经是子树内部**自由选择所有内部开关后能达到的最优值**，它们本身互不冲突（子树内部的开关是子树自己的事，跟父节点无关）。父节点只是站在这些"子树已经调到最优"的四元组上面，再做一次合并，而这次合并本身也有"顺序"这一个额外自由度，所以只需要对 $pre, suf, best$ 各自分别在“不交换”和“交换”两种合并方式里取最大值即可：

```cpp
// 不交换：sum_L + pre_R 或 sum_R + suf_L 这类；交换：把 L R 互换再算一次
sum   = sumL + sumR; // 加法交换律，其实这个不受交换影响
pre   = max({preL, sumL + preR, preR, sumR + preL});
suf   = max({sufR, sumR + sufL, sufL, sumL + sufR});
best  = max({bestL, bestR, sufL + preR, sufR + preL});
```

$sum$ 显然跟顺序无关，直接跳过讨论；$pre$ 是“不交换时的前缀”和“交换时的前缀”取更大值；$suf$ 同理；$best$ 除了继承左右子树内部的最优子段和，还要考虑跨越左右分界的那一段——不交换时是 $suf_L + pre_R$，交换后是 $suf_R + pre_L$，两者取更大的即可。

### 3. 自底向上合并，答案就是根节点的 $best$

于是整棵线段树可以用标准的自底向上方式构建：叶子节点四元组都是 $(a_i, a_i, a_i, a_i)$，每个内部节点用上面这套“双向合并取最大”的公式从两个儿子推出来。递归到根节点后，$best_{root}$ 就是答案。

```cpp
Node merge(Node L, Node R) {
    Node res;
    res.sum = L.sum + R.sum;
    res.pre = max({L.pre, L.sum + R.pre, R.pre, R.sum + L.pre});
    res.suf = max({R.suf, R.sum + L.suf, L.suf, L.sum + R.suf});
    res.best = max({L.best, R.best, L.suf + R.pre, R.suf + L.pre});
    return res;
}
```

每个节点的合并是 $O(1)$，整棵树一共 $O(2^n)$ 个节点，所以总复杂度就是

$$ O(2^n) $$

对 $n \le 18$（数组长度到 $2^{18} \approx 2.6 \times 10^5$）来说轻松通过，甚至不需要卡常。

回头看这道 $*2500$ 的题，最容易卡住的地方其实不是"想到线段树维护最大子段和"（这是老套路），而是敢于相信**“子树内部先各自调到最优，父节点再对合并方式做一次独立的双向取最大”这件事是合法的**——一旦意识到子树的四个统计量之间没有相互牵制的耦合关系，剩下的就是把线段树的合并公式抄一遍、每处加个 $\max$。

### CPP 代码实现

```cpp
// E. Swap and Maximum Block

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

struct Node {
    int sum, pre, suf, best;
};

Node merge_node(const Node& L, const Node& R) {
    Node res;
    res.sum = L.sum + R.sum;
    res.pre = max({L.pre, L.sum + R.pre, R.pre, R.sum + L.pre});
    res.suf = max({R.suf, R.sum + L.suf, L.suf, L.sum + R.suf});
    res.best = max({L.best, R.best, L.suf + R.pre, R.suf + L.pre});
    return res;
}

int n;
vector<int> a;

Node build(int l, int r) {
    if (l == r) return {a[l], a[l], a[l], a[l]};
    int mid = (l + r) >> 1;
    Node L = build(l, mid);
    Node R = build(mid + 1, r);
    return merge_node(L, R);
}

void solve() {

    cin >> n;
    int len = 1 << n;
    a.assign(len, 0);
    for (int i = 0; i < len; i++) cin >> a[i];

    Node root = build(0, len - 1);
    cout << root.best << endl;

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
