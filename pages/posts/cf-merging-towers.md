---
title: "CF题解——Merging Towers"
date: "2026-03-23 16:16:25"
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
 - 启发式合并
 - 并查集
---

# E. Merging Towers 解题思路

### 核心问题分析

初看这道题，各种“汉诺塔”式的圆盘来回移动，还要维护从大到小的顺序，似乎非常头疼。题目要求我们求出将所有圆盘合并成**唯一一座塔**所需的“最少操作次数（难度）”。并且，由于每次都会合并两座塔，我们需要输出初始状态以及每次合并后的难度。

遇到这种繁琐的模拟题，我们一定要记住：**不要去模拟过程，要去寻找最终结果的本质特征！**

### 1. 拨开迷雾：重新定义“难度”

仔细思考一下，如果要组成一个完整的塔（从大到小排列，即从下到上是 $n, n-1, \dots, 1$），我们真正需要移动的是什么？

假设我们考察任意两个相邻大小的圆盘 $i$ 和 $i+1$：
*   **如果在同一个塔里：** 因为题目保证了初始塔里的元素都是合法排序的，所以 $i$ 必定已经乖乖地躺在 $i+1$ 的上面。在后续的任何合法移动中，我们都**不需要**把它们拆开，它们可以作为一个整体移动。
*   **如果在不同的塔里：** 那么在游戏结束前，我们**迟早有一次**要把圆盘 $i$ 所在的这一坨，搬到圆盘 $i+1$ 所在的塔上面。这一次操作是绝对跑不掉的。

**顿悟时刻：** 这意味着，所谓的“初始难度”，其实就是**满足圆盘 $i$ 和 $i+1$ 不在同一个塔里的数量！**
即初始操作次数 = $\sum_{i=1}^{n-1} [ \text{pos}[i] \neq \text{pos}[i+1] ]$。

### 2. 动态维护与“启发式合并”

明确了“难度”的定义后，合并两座塔（假设为 $A$ 和 $B$）会对难度产生什么影响呢？

当塔 $A$ 和塔 $B$ 合并成一座新塔时，原来分散在 $A$ 和 $B$ 中的相邻圆盘对 $(i, i+1)$，现在变成了**在同一个塔里**。这就意味着，我们**省去了一次必须的操作**，总难度 `ans` 需要减 1。
我们要做的就是找出所有满足“一个在 $A$，另一个在 $B$” 的相邻大小圆盘对 $(i, i-1)$ 或 $(i, i+1)$。

如果每次合并都暴力遍历 $A$ 和 $B$ 中的所有元素，时间复杂度会退化到 $O(NM)$，必然 TLE（超时）。这就引出了算法竞赛中极其优雅且实用的一种思想：**启发式合并（Union by Size）**。

*   **什么是启发式合并？** 每次合并时，我们**只遍历数量较少的那一座塔**，把小塔里的圆盘一个个拿出来，去大塔里找有没有它的“兄弟”（即大小相差 1 的圆盘）。
*   **为什么快？** 设想一个圆盘，它每次被遍历，必然是因为它所在的塔是“小塔”，合并后新塔的大小至少是原来的两倍。因此，一个圆盘最多被遍历 $\log M$ 次。整体的时间复杂度被死死地压在了 $O(N \log M)$，可以完美跑过 $2 \cdot 10^5$ 的数据！

### 3. 数据结构选择

为了配合启发式合并，我们需要：
1.  `vector<int> ns[]`：用来存储每座塔里当前包含哪些圆盘，方便我们遍历。
2.  `并查集 (DSU)`：用来快速查询某个圆盘当前到底归属于哪座塔的“大本营”。因为塔会不断合并，用并查集维护它们的代表元（root）最合适不过。

### CPP 代码实现

下面是代码实现，体现了“模块化”的原则，将并查集单独封装，逻辑非常清晰：

```cpp
// E. Merging Towers

#include <bits/stdc++.h>
#define lg(x) 63 - __builtin_clzll(x)
#define all(x) (x).begin(), (x).end()
#define low_bit(x) ((x) & (-x))
#define pb push_back
#define db long double
#define int long long
#define endl "\n"

using namespace std;

// 模块化：标准的并查集模板，用于维护塔的合并状态
struct DSU {
    vector<int> par;
    DSU(int n) {
        par.assign(n + 1, 0);
        iota(par.begin(), par.end(), 0);
    }
    int find(int x) {
        if (par[x] == x) return x;
        return par[x] = find(par[x]); // 路径压缩
    }
    // 注意：这里的 unite 并没有在主体直接用，因为我们需要手动把小集合加到大集合里
    void unite(int x, int y) {
        int root_x = find(x);
        int root_y = find(y);
        if (root_x == root_y) return;
        par[root_x] = root_y;
    }
};

void solve() {
    int n, m;
    cin >> n >> m;

    DSU dsu(m);
    vector<int> pos(n + 1);          // pos[i] 记录圆盘 i 初始所在的塔编号
    vector<vector<int>> ns(m + 1);   // ns[i] 记录第 i 座塔当前拥有的所有圆盘

    int ans = 0;
    for (int i = 1; i <= n; i++) {
        cin >> pos[i];
        ns[pos[i]].pb(i);
        
        // 核心逻辑 1：计算初始难度
        // 如果当前圆盘 i 和它前一个圆盘 i-1 不在同一个塔里，难度 +1
        if (i > 1 && pos[i] != pos[i-1]) {
            ans++;
        }
    }
    
    // 输出初始状态的难度
    cout << ans << endl;
    
    // 处理 m-1 次合并查询
    for (int q = 1; q < m; q++) {
        int x, y;
        cin >> x >> y;
        
        // 找到两座塔当前的真实“大本营”（根节点）
        int root_x = dsu.find(x);
        int root_y = dsu.find(y);
        
        // 核心逻辑 2：启发式合并（保证总是把小的往大的里合并）
        // 如果 x 的元素比 y 少，就交换它们，让 y 永远是那个比较小的集合
        if (ns[root_x].size() < ns[root_y].size()) {
            swap(root_x, root_y);
        }
        
        // 遍历小集合 y 中的每一个圆盘 temp
        for (int temp : ns[root_y]) {
            // 如果 temp 的兄弟 temp-1 已经在老大哥集合 root_x 里了
            // 说明合并后它们团聚了，所需的操作次数减少 1 次
            if (temp > 1 && dsu.find(pos[temp - 1]) == root_x) {
                ans--;
            }
            // 同理，检查兄弟 temp+1
            if (temp < n && dsu.find(pos[temp + 1]) == root_x) {
                ans--;
            }
        }
        
        // 暴力将小集合的元素倒进大集合中
        for (int temp : ns[root_y]) {
            ns[root_x].pb(temp);
        }
        
        // 清空小集合，释放内存
        ns[root_y].clear();
        
        // 在并查集中，将小集合的根节点指向大集合的根节点
        dsu.par[root_y] = root_x;
        
        // 输出本次合并后的难度
        cout << ans << endl;
    }
}

signed main() {
    // 实用至上：优化输入输出效率
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    // cin >> t; // 本题只有单测
    
    while (t--) {
        solve();
    }
}
```