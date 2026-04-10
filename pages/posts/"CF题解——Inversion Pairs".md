---
title: "CF题解——Inversion Pairs"
date: "2026-04-10 14:37:20"
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
 - 贪心
 - 逆序对
 - 二分查找
 - 状态转移
---

# F. Inversion Pairs 解题思路

### 核心问题分析

题意非常直白：给定一个只包含 `0`, `1`, `?` 的字符串。你需要把所有的 `?` 替换成 `0` 或 `1`，使得最终字符串里的**逆序对数量最多**。

在只包含 `0` 和 `1` 的序列中，什么是逆序对？
非常简单：**只要一个 `1` 出现在一个 `0` 的前面，这就构成了一个逆序对。**

### 1. 揭开贪心性质：完美的“分界线”

既然我们的目标是让“`1` 在 `0` 前面”的次数尽可能多，那么对于那些未知的 `?`，我们应该遵循怎样的填法策略？

贪心的直觉告诉我们：**尽量把 `1` 填在左边，把 `0` 填在右边。**
如果在最终填好的 `?` 序列中，出现了一个 `0` 在 `1` 前面（比如 `...0...1...`），我们只要把它们俩交换一下变成 `...1...0...`，总的逆序对数量一定会**严格增加**（或者至少不变）。

因此，所有 `?` 的填法一定呈现出一种极其单调的规律：
**前 $k$ 个 `?` 全部填 `1`，剩下的 `?` 全部填 `0`。**
我们只需要枚举这个分界点 $k$，找到能产生最大逆序对数量的那种情况即可。

### 2. 状态转移与动态维护

如果我们每次枚举分界点都重新算一遍逆序对，时间复杂度会爆炸。我们需要一种“滑动窗口”或“状态转移”的思想：

1.  **初始状态（极限情况）：** 我们假设一开始**所有的 `?` 都填 `0`**。
    在这种情况下，我们先算出总的逆序对数量 `sum`。怎么算？遍历原数组中每一个真正的 `1`，看看它后面有多少个 `0` 和多少个 `?`（因为 `?` 现在全当 `0` 看），加起来就行。
2.  **状态转移（从左到右翻转）：** 接下来，我们按照从左到右的顺序，依次遍历每一个 `?`，将其**从 `0` 翻转为 `1`**。
    当处于位置 `it` 的 `?` 从 `0` 变身成 `1` 时，逆序对数量会发生怎样的变化（Delta）？
    *   **失去的逆序对（变小）：** 因为它不再是 `0` 了，所以排在它前面的那些真正的 `1`，以及排在它前面已经被我们翻转成 `1` 的 `?`，都**失去**了与它组成的逆序对。
    *   **新增的逆序对（变大）：** 因为它变成了 `1`，所以排在它后面的那些真正的 `0`，以及排在它后面还没被翻转的 `?`（目前还是 `0`），都会与它**新组建**出逆序对。
3.  每次翻转后，我们将 `sum` 加上这个变化量，并用 `ans` 记录下遍历过程中的最大值。

### 3. 代码实现技巧：`lower_bound` 的妙用

为了快速知道某个位置 `it` 前面/后面有多少个 `0`、`1` 或 `?`，代码中非常巧妙地使用了 `std::lower_bound` 二分查找。
由于我们事先把所有 `0`、`1`、`?` 的下标分别存在了有序的 `vector` 中，通过二分查找下标，可以在 $O(\log N)$ 的时间内迅速得出前后的元素个数，思维非常清晰。

### CPP 代码实现

```cpp
// F. Inversion Pairs

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

void solve() {
    int n;
    cin >> n;
    string s;
    cin >> s;
    
    // 分别记录 1、0 和 ? 出现的所有下标（天然是有序的）
    vector<int> one, zero, none;
    for (int i = 0; i < n; i++) {
        if (s[i] == '1') {
            one.pb(i);
        } else if (s[i] == '0') {
            zero.pb(i);
        } else {
            none.pb(i);
        }
    }
    
    int sum = 0;
    
    // 阶段一：计算初始状态
    // 假设所有的 '?' 全部被填为 '0'
    // 遍历每一个真正的 '1'，计算它能和后面的哪些字符组成逆序对
    for (auto it : one) {
        // 找到该 '1' 之后第一个 '0' 和第一个 '?' 的位置
        auto temp_1 = lower_bound(all(zero), it);
        auto temp_2 = lower_bound(all(none), it);
        int dist_1 = 0, dist_2 = 0;
        
        // 统计该 '1' 后面的 '0' 的数量
        if (temp_1 != zero.end()) {
            dist_1 = sz(zero) - (temp_1 - zero.begin());
        }
        // 统计该 '1' 后面的 '?' 的数量（因为假设它们全是 '0'）
        if (temp_2 != none.end()) {
            dist_2 = sz(none) - (temp_2 - none.begin());
        }
        sum += dist_1 + dist_2;
    }
    
    int ans = sum;
    
    // 阶段二：状态转移
    // 按照从左到右的顺序，依次把 '?' 从 '0' 翻转成 '1'
    for (auto it : none) {
        auto temp_1 = lower_bound(all(one), it);
        auto temp_2 = lower_bound(all(zero), it);
        auto temp_3 = lower_bound(all(none), it);
        
        int dist_1 = 0, dist_2 = 0, dist_3 = 0, dist_4 = 0;
        
        // dist_1: 统计该 '?' 前面有多少个真正的 '1'
        if (temp_1 != one.begin()) {
            dist_1 = prev(temp_1) - one.begin() + 1;
        }
        
        // dist_2: 统计该 '?' 后面有多少个真正的 '0'
        if (temp_2 != zero.end()) {
            dist_2 = sz(zero) - (temp_2 - zero.begin());
        }
        
        // dist_3: 统计该 '?' 后面还有多少个没被翻转的 '?' (它们现在还是 '0')
        if (temp_3 != none.end()) {
            dist_3 = sz(none) - (temp_3 - none.begin()) - 1; // 减去自己
        }
        
        // dist_4: 统计该 '?' 前面有多少个已经被翻转成 '1' 的 '?'
        if (temp_3 != none.begin()) {
            dist_4 = prev(temp_3) - none.begin() + 1;
        }
        
        // 核心变化量公式：
        // 新增的逆序对：变成了 1，和后面的 0 (dist_2) 以及后面的 ? (dist_3) 组成新逆序对
        // 失去的逆序对：不再是 0，无法和前面的 1 (dist_1) 以及前面的 ? (dist_4) 组成逆序对了
        sum += dist_2 + dist_3 - dist_1 - dist_4;
        
        // 动态维护过程中的最大值
        ans = max(ans, sum);
    }
    
    cout << ans << endl;
}

signed main() {
    // 优化输入输出
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    cin >> t; 
    
    while (t--) {
        solve();
    }
}
```