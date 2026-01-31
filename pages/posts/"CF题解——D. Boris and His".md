---
title: "CF题解——D. Boris and His Amazing Haircut"
date: 2026-01-10 17:25:59`
author: shouw
katex: true
email: shouw707@gmail.com
readmore: true
tags:
---

- 编程
- 算法竞赛
- 题解
- 贪心
- 数据结构

---

# D. Boris and His Amazing Haircut 解题思路

### 核心问题分析

本题要求判断是否可以通过给定数量和规格的剃刀，将初始发型高度数组 $A$ 修剪为目标发型高度数组 $B$。
操作规则是：选择一个区间 $[l, r]$ 和一个剃刀 $x$，将区间内所有 $a_i$ 变为 $\min(a_i, x)$。每个剃刀只能使用一次。

### 1. 基础判断与贪心策略

首先，我们可以得出一个显然的结论：

* 如果对于任意位置 $i$，存在 $A_i < B_i$，则无法完成修剪。因为剃刀只能让头发变短，不能变长。此时直接输出 "NO"。

对于 $A_i > B_i$ 的情况，我们需要在位置 $i$ 进行修剪。为了尽可能节省剃刀（贪心策略），当我们决定在位置 $i$ 使用一把规格为 $B_i$ 的剃刀时，我们希望这个操作能**尽可能地向右延伸**，直到由于某种限制不得不停止。

### 2. 维护“活跃”的修剪操作

当我们从左向右扫描数组时，可以维护一个集合（或单调栈），存储当前正在生效的剃刀规格。

假设当前扫描到位置 $i$，目标高度为 $B_i$。此时对于之前的某个活跃修剪操作（规格为 $X$）：

1. **冲突中断：** 如果 $X < B_i$，说明之前的这个修剪操作会让当前位置的高度变成 $X$，而我们需要的高度 $B_i$ 比 $X$ 更高。这产生了矛盾，因此规格为 $X$ 的修剪操作必须在位置 $i$ 之前结束。我们将其从集合中移除，并计入消耗。
2. **延续有效：** 如果 $X \ge B_i$，则之前的修剪操作不会破坏当前的 $B_i$ 限制（因为 $\min(\dots, X)$ 至少是 $B_i$ 或更大，允许我们再叠加更小的剃刀），该操作可以继续保持活跃。

### 3. 具体算法流程

我们使用一个 `std::set` 来维护当前所有“活跃”的修剪高度，并使用 `std::map` 来统计需要的剃刀数量。

1. 统计拥有的剃刀数量存入 `map<int, int> c`。
2. 遍历数组 $i$ 从 $0$ 到 $N-1$：
    * **判定非法：** 若 $A_i < B_i$，直接失败。
    * **清理失效操作：** 检查 `set` 中所有**小于** $B_i$ 的元素。这些操作无法覆盖到当前位置（否则会导致高度过低），因此它们必须在这里截止。将它们从 `set` 中移除，并在需求统计 `need` 中计数。
    * **开启新操作：** 若 $A_i > B_i$，说明需要一把规格为 $B_i$ 的剃刀。
        * 检查 `set` 中是否已存在 $B_i$。如果存在，说明之前的同规格剃刀可以延伸到这里，无需消耗新剃刀。
        * 如果不存在，将 $B_i$ 插入 `set`，表示开启一次新的修剪。
3. 遍历结束后，`set` 中剩余的所有元素也代表完成了一次修剪，将其加入 `need` 计数。
4. 最后对比 `need` 和拥有的剃刀 `c`，若任意规格的需求量大于拥有量，输出 "NO"，否则 "YES"。

### C++ 代码实现

代码中使用 `std::set` 自动排序的特性，配合 `lower_bound` 方便地找到小于 $B_i$ 的元素进行移除。

```cpp
#include <bits/stdc++.h>
using namespace std;

#define int long long

void solve() {

    int n;
    cin >> n;
    
    // 读取初始发型 A
    vector<int> a(n);
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }
    
    // 读取目标发型 B
    vector<int> b(n);
    for (int i = 0; i < n; i++) {
        cin >> b[i];
    }

    // 读取拥有的剃刀
    int k;
    cin >> k;
    map<int, int> available_razors;
    for (int i = 0; i < k; i++) {
        int temp;
        cin >> temp;
        available_razors[temp]++;
    }

    // data 存储当前活跃的剪发操作（剃刀规格）
    set<int> active_cuts;
    // need 存储最终需要的剃刀数量
    map<int, int> needed_razors;

    for (int i = 0; i < n; i++) {
        // 基础条件检查：无法将头发变长
        if (a[i] < b[i]) {
            cout << "NO" << endl;
            return;
        }

        // 清理中断的修剪操作：
        // 如果当前活跃的某个修剪高度 X < b[i]，则该修剪无法延伸到 i
        // 因为它会把头发剪得太短。
        // lower_bound 找到第一个 >= b[i] 的位置
        auto point = active_cuts.lower_bound(b[i]);
        auto it = active_cuts.begin();
        
        // 移除所有小于 b[i] 的活跃修剪，并记录消耗
        while (it != point) {
            needed_razors[*it]++;
            it = active_cuts.erase(it);
        }

        // 如果当前位置需要修剪
        if (a[i] > b[i]) {
            // 如果当前没有活跃的 b[i] 规格修剪，则开启一个新的
            if (active_cuts.find(b[i]) == active_cuts.end()) {
                active_cuts.insert(b[i]);
            }
        }
    }

    // 循环结束后，所有还在 active_cuts 里的操作也算作消耗了一次
    for (auto val : active_cuts) {
        needed_razors[val]++;
    }

    // 检查库存是否足够
    for (auto pair : needed_razors) {
        if (pair.second > available_razors[pair.first]) {
            cout << "NO" << endl;
            return;
        }
    }

    cout << "YES" << endl;
}

signed main() {
    
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    cin >> t;

    while (t--) {
        solve();
    }

}
```
