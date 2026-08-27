---
title: "CF题解——Choose a Square"
date: "2026-06-06 21:47:33"
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
 - 线段树
 - 扫描线
 - 离散化
---

# F. Choose a Square 解题思路

### 核心问题分析

题意：平面上有 $n$ 个点，第 $i$ 个点在 $(x_i, y_i)$，权值为 $c_i$（**可以是负数**）。要求选一个正方形，边平行于坐标轴，且**左下角和右上角都落在直线 $y = x$ 上**，四个角都是整点。

得分 = 正方形**覆盖**（含边界）的所有点的权值和 $-$ 正方形的边长。边长允许为 $0$。求最大得分，并输出方案。

$n \le 5\times10^5$，坐标 $\le 10^9$，$|c_i| \le 10^6$，时限 $6$ 秒。

### 1. 先把"正方形"这个二维的壳剥掉

左下角在 $(l, l)$、右上角在 $(r, r)$，正方形就是 $[l, r] \times [l, r]$。一个点 $(x, y)$ 被覆盖，当且仅当

$$ l \le x \le r \quad \text{且} \quad l \le y \le r $$

这两个条件可以合并成一句话：

$$ l \le \min(x, y) \quad \text{且} \quad \max(x, y) \le r $$

于是每个点就退化成了**一维数轴上的一条线段** $[\min(x_i,y_i),\ \max(x_i,y_i)]$，而"点被正方形覆盖"就等价于"这条线段被区间 $[l, r]$ 完整包含"。二维一下子塌成了一维——这是这道题的第一层，也是最重要的一层化简。

目标函数变成：

$$ \max_{l \le r} \Big( \sum_{[L_i, R_i] \subseteq [l, r]} c_i \;-\; (r - l) \Big) $$

### 2. 离散化 + 一个哨兵

坐标高达 $10^9$ 但只有 $2n$ 个不同值，直接离散化。有两个容易漏的细节：

- 要把 $0$ 也塞进候选坐标里（题目允许 $x_1 = y_1 = 0$）；
- 要额外塞一个**比所有坐标都大**的哨兵值。因为最优解可能是"什么都不选"（当所有点权值都是负的时候，答案应该是 $0$）。如果最大坐标处恰好有一个负权点，那在原有的候选值里就找不到一个"能放下空正方形"的位置。多加一个哨兵就能保证空正方形一定可选，答案下界稳稳是 $0$。

```cpp
vals.pb(0);
sort(all(vals));
vals.erase(unique(all(vals)), vals.end());
vals.pb(vals.back() + 1);   // 哨兵：保证"空正方形"永远是合法方案
```

### 3. 从右往左扫 $l$，把"线段生效"变成区间加

现在要同时优化 $l$ 和 $r$ 两个变量。经典做法：**固定一个，用数据结构维护另一个**。

我们从大到小枚举 $l$（也就是从右往左扫）。当 $l$ 减小到某个点的 $L_i = \min(x_i, y_i)$ 时，这个点的"左端条件"就满足了，此后只要 $r \ge R_i$ 它就会被覆盖。也就是说：

> 扫到 $l = L_i$ 的时刻，把 $c_i$ 加到**所有 $r \ge R_i$ 的候选位置**上。

这正是一次**区间加**。所以把每个点挂到它的 $L_i$ 上，扫描线扫过去逐个触发：

```cpp
for (int i = m - 1; i >= 0; i--) {
    for (auto [r_now, val] : g[i]) {
        sgt.update(1, 0, m - 1, r_now, m - 1, val);  // 对 r >= R_i 的位置全部加上 c_i
    }
    ...
}
```

### 4. 线段树里到底存什么

线段树的下标是**候选的 $r$**。在位置 $j$ 上，我们希望存的是

$$ \Big(\text{当前 } l \text{ 下，选 } r = vals_j \text{ 时的权值和}\Big) - vals_j $$

也就是把 $-r$ **提前塞进初值**里，这样它就能跟后续的区间加自然地叠在一起：

```cpp
void build(int v, int l, int r, vector<int>& vals) {
    if (l == r) { d[v] = {-vals[l], l}; return; }   // 初值就是 -r
    ...
}
```

于是查询区间 $[l, m-1]$ 的最大值（只有 $r \ge l$ 才是合法正方形），再补上一个 $+l$，就是当前这个 $l$ 能拿到的最好得分：

```cpp
auto cur = sgt.query(1, 0, m - 1, i, m - 1);
if (cur.first + vals[i] > ans) {
    ans = cur.first + vals[i];
    ans_l = vals[i];
    ans_r = vals[cur.second];
}
```

注意线段树节点存的是 `pair<int, int>`——不仅要最大值，还要**取到最大值的那个下标**，因为题目要求输出方案。`pair` 的默认比较恰好是先比 first 再比 second，直接 `max` 就行，不用手写比较函数。

### 5. 为什么这样一定不重不漏

值得停下来确认一件事：扫到 $l$ 时，线段树位置 $j$ 上累加的，恰好是**所有满足 $L_i \ge l$ 且 $R_i \le vals_j$ 的点的 $c_i$ 之和**。

- $L_i \ge l$：因为区间加是在扫到 $L_i$ 那一刻才触发的，$l$ 还没扫到的点根本没被加进去；
- $R_i \le vals_j$：因为区间加的范围是 $[R_i, m-1]$，只有 $j \ge R_i$ 的位置才吃到这份贡献。

两个条件合起来正好是"线段 $[L_i, R_i]$ 被 $[l, vals_j]$ 完整包含"。完美对应。

### 6. 复杂度

离散化 $O(n \log n)$；扫描线过程中每个点触发**恰好一次**区间加，共 $n$ 次；每个 $l$ 做一次区间最值查询，共 $O(n)$ 次。单次线段树操作 $O(\log n)$，总计

$$ O(n \log n) $$

$n = 5\times10^5$ 时大概 $10^7$ 级别的线段树操作，$6$ 秒时限非常宽裕（这么长的时限估计是给常数大的写法留的活路）。

回头看这道 $*2400$ 的题，难点其实分布得很均匀：先是"正方形覆盖 $\Rightarrow$ 线段包含"这一步降维，然后是"扫描线让 $l$ 单调、把点的生效变成区间加"，最后是"把 $-r$ 揉进线段树初值"这个小技巧——三步都不算特别难，但少任何一步都写不出来。另外别忘了那个哨兵坐标，不然会在"全是负权点"的数据上挂掉，这种边界才是真正的隐形杀手。

### CPP 代码实现

```cpp
// F. Choose a Square

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

struct SGT {

    int n;
    vector<pair<int, int>> d;   // {最大值, 取到最大值的下标}
    vector<int> tag;

    SGT(int n) : n(n) {
        d.assign(4 * n + 1, {0, 0});
        tag.assign(4 * n + 1, 0);
    }

    void build(int v, int l, int r, vector<int>& vals) {
        if (l == r) {
            d[v] = {-vals[l], l};   // 初值 -r，后续区间加自然叠上去
            return;
        }
        int mid = (l + r) >> 1;
        build(v * 2, l, mid, vals);
        build(v * 2 + 1, mid + 1, r, vals);
        d[v] = max(d[v * 2], d[v * 2 + 1]);
    }

    void push(int v, int l, int r) {
        if (tag[v] == 0) return;
        d[v].first += tag[v];
        if (l != r) {
            tag[v * 2] += tag[v];
            tag[v * 2 + 1] += tag[v];
        }
        tag[v] = 0;
    }

    void update(int v, int l, int r, int L, int R, int val) {
        push(v, l, r);
        if (L > R) return;
        if (l == L && r == R) {
            tag[v] += val;
            push(v, l, r);
            return;
        }
        int mid = (l + r) >> 1;
        update(v * 2, l, mid, L, min(mid, R), val);
        update(v * 2 + 1, mid + 1, r, max(mid + 1, L), R, val);
        d[v] = max(d[v * 2], d[v * 2 + 1]);
    }

    pair<int, int> query(int v, int l, int r, int L, int R) {
        push(v, l, r);
        if (L > R) return {LLONG_MIN, 0};
        if (l == L && r == R) return d[v];
        int mid = (l + r) >> 1;
        auto t1 = query(v * 2, l, mid, L, min(mid, R));
        auto t2 = query(v * 2 + 1, mid + 1, r, max(mid + 1, L), R);
        return max(t1, t2);
    }

};

struct Point {
    int x, y, v;
};

void solve() {

    int n;
    cin >> n;
    vector<Point> p(n + 1);
    vector<int> vals;
    for (int i = 1; i <= n; i++) {
        cin >> p[i].x >> p[i].y >> p[i].v;
        vals.pb(p[i].x);
        vals.pb(p[i].y);
    }
    vals.pb(0);
    sort(all(vals));
    vals.erase(unique(all(vals)), vals.end());
    vals.pb(vals.back() + 1);   // 哨兵，保证空正方形可选

    int m = sz(vals);
    vector<vector<pair<int, int>>> g(m);
    for (int i = 1; i <= n; i++) {
        int pos_x = lower_bound(all(vals), p[i].x) - vals.begin();
        int pos_y = lower_bound(all(vals), p[i].y) - vals.begin();
        int pos_L = min(pos_x, pos_y);
        int pos_R = max(pos_x, pos_y);
        g[pos_L].pb({pos_R, p[i].v});   // 线段 [L, R] 挂在左端点上
    }

    SGT sgt(m);
    sgt.build(1, 0, m - 1, vals);

    int ans = -1, ans_l = -1, ans_r = -1;
    for (int i = m - 1; i >= 0; i--) {
        for (auto it : g[i]) {
            sgt.update(1, 0, m - 1, it.first, m - 1, it.second);
        }
        auto cur = sgt.query(1, 0, m - 1, i, m - 1);
        if (cur.first + vals[i] > ans) {
            ans = cur.first + vals[i];
            ans_l = vals[i];
            ans_r = vals[cur.second];
        }
    }

    cout << ans << endl;
    cout << ans_l << ' ' << ans_l << ' ' << ans_r << ' ' << ans_r << endl;

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
