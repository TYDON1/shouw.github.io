---
title: "CF题解——Graph Composition"
date: "2025-12-18 17:03:21"
katex: true
categories:
  - 算法竞赛相关
email: KijinSeija@shouw.blog
readmore: true
tags:
  - 编程
  - 算法竞赛
  - 题解
  - 并查集
---

# E. Graph Composition 解题思路

## 核心问题分析与转化

这道题的目标是让图 $F$ 的连通性变得和图 $G$ 完全一样。所谓“连通性一样”，意思就是：如果在图 $G$ 里点 $u$ 和点 $v$ 是能连通的，那么在图 $F$ 里它们也得连通；反之，如果 $G$ 里不连通，$F$ 里也绝对不能连通。

我们要找的是最小操作步数（加边或删边）。

### 1. 删边的必要性：防止“过度连通”

如果图 $F$ 里有一条边连接了 $u$ 和 $v$，但在图 $G$ 中这两个点根本不在同一个连通分量里，那这条边就是“非法”的。如果不删掉它，$F$ 的连通性就会比 $G$ 强，不符合题目要求。

* **策略**：先看 $G$ 的连通情况，再遍历 $F$ 的所有边。如果某条边连接的两个点在 $G$ 里不连通，直接删掉。
* **代价**：删掉几条边，操作数就加几。

### 2. 加边的必要性：补齐“连通不足”

删掉所有非法边后，图 $F$ 现在的每一个连通块肯定都是图 $G$ 某个连通块的子集。这时候 $F$ 可能拆得太散了，我们需要把原本属于同一个 $G$ 分量的 $F$ 碎片给连起来。

---

## 核心优化：利用并查集（DSU）计算贡献

我们可以用并查集（Disjoint Set Union）来高效维护这种连通关系。

### 1. 公式推导

设删完非法边后：

* $C_G$ 是图 $G$ 的连通分量个数。
* $C_F$ 是图 $F$ 剩余部分形成的连通分量个数。

因为 $F$ 的连通分量必须合并到和 $G$ 一样，而合并 $k$ 个块最少需要 $k-1$ 条边，所以：



$$
\text{加边数} = \sum (\text{该 G 分量下的 F 碎片数} - 1) = C_F - C_G
$$



### 2. 最终操作数公式



$$
\text{Total Operations} = \text{删边数} + (C_F - C_G)
$$



---

## CPP 代码实现

```cpp
#include <bits/stdc++.h>

using namespace std;

// 标准并查集结构
struct DSU {
    vector<int> parent;
    int blocks; // 记录当前连通分量数量

    DSU(int n) {
        parent.resize(n + 1);
        for (int i = 1; i <= n; i++) parent[i] = i;
        blocks = n;
    }

    int find(int x) {
        if (parent[x] == x) return x;
        return parent[x] = find(parent[x]); // 路径压缩
    }

    void unite(int x, int y) {
        int rootX = find(x);
        int rootY = find(y);
        if (rootX != rootY) {
            parent[rootX] = rootY;
            blocks--; // 每次成功合并，分量数减一
        }
    }
};

void solve() {
    int n, m1, m2;
    cin >> n >> m1 >> m2;

    vector<pair<int, int>> edges_f(m1);
    for (int i = 0; i < m1; i++) {
        cin >> edges_f[i].first >> edges_f[i].second;
    }

    // 1. 先用并查集处理图 G，确定最终的连通基准
    DSU dsu_g(n);
    for (int i = 0; i < m2; i++) {
        int u, v;
        cin >> u >> v;
        dsu_g.unite(u, v);
    }

    // 2. 处理图 F，同时统计必须删除的边
    DSU dsu_f(n);
    int remove_cnt = 0;
    for (int i = 0; i < m1; i++) {
        int u = edges_f[i].first;
        int v = edges_f[i].second;

        // 如果 G 里面这两个点不连通，F 里的这条边必须删掉
        if (dsu_g.find(u) != dsu_g.find(v)) {
            remove_cnt++;
        } else {
            // 如果 G 里连通，F 就可以保留并维护自己的并查集
            dsu_f.unite(u, v);
        }
    }

    // 3. 计算结果：删边步数 + 合并碎片的步数 (C_F - C_G)
    cout << remove_cnt + (dsu_f.blocks - dsu_g.blocks) << endl;
}

int main() {
    // 关同步流加速 I/O
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t;
    cin >> t;
    while (t--) {
        solve();
    }
    return 0;
}
```
