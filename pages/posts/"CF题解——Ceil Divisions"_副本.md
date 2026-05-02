---
title: "CF题解——MST Unification"
date: "2026-05-01 21:31:09"
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
 - 图论
 - 最小生成树
 - 并查集
---

# F. MST Unification 解题思路

### 核心问题分析

题目要求我们在一个无向连通图中，通过**增加某些边的权重（每次加 1）**，使得这幅图的**最小生成树（MST）唯一**。
并且有一个极其苛刻的前提条件：**原本 MST 的总权重 $k$ 绝对不能变！**

初看这道题，感觉无从下手。图里错综复杂，改了一条边的权重，会不会引起连锁反应导致整棵 MST 变掉？
其实，解决这道题的关键，在于我们对经典最小生成树算法——**Kruskal（克鲁斯卡尔）算法**的底层逻辑到底有多深的理解。

### 1. 破除迷雾：MST 何时才不唯一？

回忆一下 Kruskal 算法的工作流程：
1. 把所有边按权重从小到大排序。
2. 依次遍历每条边，如果它的两个端点不在同一个连通块里（用并查集判断），就把这条边加入 MST，并合并这两个端点。

在什么情况下，MST 会产生“多解”（不唯一）？
**唯有在“权重相同”的边之间发生竞争时！**

如果图里所有边的权重都不一样，Kruskal 算法每次挑边的顺序是绝对固定的，MST 必然唯一。
只有当出现了一批**权重完全相同**的边，且它们都能连接当前不连通的区块时，才会产生选择分支。比如有 3 条权重同为 $W$ 的边，它们构成了一个环，而我们只需要其中 2 条就能连通这几个点，那么选哪 2 条都可以，这就导致了 MST 不唯一！

**顿悟时刻：**
不同权重的边之间是**绝对不存在竞争**的！权重小的边有绝对优先权。竞争**只可能发生**在权重**完全相等**的同一批边内部！
因此，我们可以把边按权重分组，一批一批地单独审视。

### 2. 批处理与“备胎”剔除法则

假设我们按照 Kruskal 的流程，已经处理完了所有权重 $< W$ 的边，现在的图被连成了若干个连通块。
接下来，我们面对所有**权重恰好等于 $W$** 的这一批边。

对于这批边中的某一条边 $e = (u, v)$，有以下两种情况：
1. **纯纯的废物（提前连通）：** 节点 $u$ 和 $v$ 早就被前面那些权重 $< W$ 的边连通了。这条边连加入 MST 的资格都没有，直接无视。
2. **有潜力的候选者（跨连通块）：** 节点 $u$ 和 $v$ 目前还不连通。这条边是有资格进入 MST 的！

我们遍历这批权重同为 $W$ 的边，把所有“有潜力的候选者”的数量统计出来，记为 `cnt`。
但是！这 `cnt` 条边能**全部**加进 MST 吗？
不一定！因为它们内部可能互相构成环。
所以我们老老实实地对这批边跑一遍并查集合并，统计出**实际真正被加进 MST 的边数**，记为 `used`。

这说明什么？
这说明在这 `cnt` 条有潜力的边里，我们只需要 `used` 条就够了。剩下的 `cnt - used` 条边，虽然一开始看起来能用，但因为同伴的加入，它们变成了“备胎”，被挤出了局。
**正是这些“备胎”，导致了 MST 的不唯一！** 因为它们和那些被选中的边作用完全一样，随时可以上位替换掉它们！

为了让 MST 唯一，且不改变原 MST 的总权重，我们该怎么办？
**极其简单粗暴：给这些“备胎”加 1 块钱权重！**
只要它们的权重变成了 $W+1$，它们就丧失了和权重为 $W$ 的边竞争的资格，MST 在权重 $W$ 这一层瞬间变得唯一！而且因为我们没有动那些实际被选入 MST 的边，总权重 $k$ 丝毫不受影响。

### 3. 代码实现的优雅两遍扫描

根据上面的推导，代码逻辑呼之欲出：
* 按边权从小到大排序。
* 用 `while` 循环截取出一批权重相同的边。
* **第一遍扫描：** 只看不动。统计出这批边里，端点不在同一集合的边数 `cnt`。
* **第二遍扫描：** 动真格。把端点不在同一集合的边进行并查集合并，统计成功合并的次数 `used`。
* 累加这一批的“备胎数”：`ans += (cnt - used)`。

### CPP 代码实现

```cpp
// F. MST Unification

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

// 边的结构体，重载小于号方便 Kruskal 算法排序
struct Side {
    int w, u, v, id;
    auto operator<(const Side& a) const {
        return w < a.w;
    }
};

// 模块化并查集 DSU
struct DSU {
    vector<int> par;

    DSU(int n) {
        par.resize(n + 1);
        iota(par.begin(), par.end(), 0);
    }

    int find(int x) {
        if (par[x] == x) return x;
        return par[x] = find(par[x]); // 路径压缩
    }

    void unite(int x, int y) {
        x = find(x);
        y = find(y);
        if (x == y) return;
        par[x] = y;
    }

    // 判断两个点是否在同一个连通块中
    bool same(int x, int y) {
        return find(x) == find(y);
    }
};

void solve() {
    int n, m;
    cin >> n >> m;
    vector<Side> edges(m);
    for (int i = 0; i < m; i++) {
        cin >> edges[i].u >> edges[i].v >> edges[i].w;
    }

    // 核心第一步：按边权从小到大排序
    sort(edges.begin(), edges.end());

    DSU dsu(n);
    int ans = 0;

    // 核心第二步：按相同的权重分批处理
    for (int i = 0; i < m; ) {
        int j = i;
        // 找到一段连续的、权重相等的边 [i, j-1]
        while (j < m && edges[j].w == edges[i].w) {
            j++;
        }

        // 第 1 遍扫描：只看不动
        // 统计这批等权边中，有多少条边连接了两个不同的连通块（有潜力进入 MST）
        int cnt = 0;
        for (int k = i; k < j; k++) {
            if (!dsu.same(edges[k].u, edges[k].v)) {
                cnt++;
            }
        }

        // 第 2 遍扫描：执行实际的并查集合并
        // 统计这批边中，实际上最终有几条边被选入了 MST
        int used = 0;
        for (int k = i; k < j; k++) {
            if (!dsu.same(edges[k].u, edges[k].v)) {
                dsu.unite(edges[k].u, edges[k].v);
                used++;
            }
        }
        
        // 有潜力但没被实际选用的边，就是导致 MST 不唯一的“罪魁祸首”
        // 必须把它们的权重加 1，消除竞争
        ans += cnt - used;
        
        // 移动指针，处理下一批权重
        i = j;
    }
    
    cout << ans << endl;
}

signed main() {
    // 优化输入输出流
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    // cin >> t; // 本题仅一组数据
    
    while (t--) {
        solve();
    }
}
```