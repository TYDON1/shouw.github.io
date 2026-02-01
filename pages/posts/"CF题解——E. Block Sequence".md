---
title: "CF题解——Block Sequence"
date: "2025-12-04 09:09:27"
katex: true
categories:
  - 算法竞赛相关
email: KijinSeija@shouw.blog
readmore: true
tags:
  - 编程
  - 算法竞赛
  - 题解
  - 动态规划
---

# E. Block Sequence 解题思路

### 核心问题分析与数学转化


本题要求找到使给定序列 $a$ 成为“美丽序列”所需的最小删除次数。一个美丽序列由一系列“块”构成，每个块以其<b>长度</b>开头，后跟该长度的元素。例如，$[L, e_1, e_2, \dots, e_L]$。


我们的目标是最大化保留下来的美丽子序列的长度 $\text{MaxLength}$。**最小删除次数** $\text{MinDeletions}$ 与最大保留长度的关系为：



$$
\text{MinDeletions} = N - \text{MaxLength}
$$




其中 $N$ 是原始序列的长度。因此，问题转化为：<b>计算原序列 $a$ 中最长的美丽子序列的长度。</b>


### 2. 动态规划状态设计

由于我们需要在 **$O(N)$ 复杂度**内求解最长子序列问题，我们选择使用**动态规划 (DP)**。

一个块 $[L, e_1, \dots, e_L]$ 的总长度是 $L+1$. 要构建最长的美丽序列，我们必须从当前位置 $i$ 开始，选择：

1. 跳过当前元素 $a_i$。
2. 将当前元素 $a_i$ 作为新块的**长度 $L$**，并检查该块是否合法。

我们定义 $\text{dp}[i]$ 为：

> <b>$\text{dp}[i]$：</b> 在原始序列中，从索引 <b>$i$</b> 到 $N-1$ 的后缀中，能够构建出的最长美丽子序列的长度。

#### 状态转移的机制分析

我们采用**从后向前**的递推方式，即从 $i = N-1$ 遍历至 $ 0$。

1. **跳过 $a_i$：**
   如果 $a_i$ 不作为任何块的开头（即被删除），则 $\text{dp}[i]$ 至少等于 $\text{dp}[i+1]$：
   
   
   $$
   \text{dp}[i] \ge \text{dp}[i+1]
   $$
   
   
2. **以 $a_i$ 为长度 $L$ 构成块：**
   设 $L = a_i$。这个块包含 $a_i$ 本身和接下来的 $L$ 个元素。
   
   * **块的结束索引：** $i + L$。
   * **块的总长度：** $L + 1$。
   * **下一个块的起始索引：** $j = i + L + 1$。
   
   **合法性检查：** 只有当整个块 $a_i, a_{i+1}, \dots, a_{i+L}$ 不越界时，这种选择才合法。即 $i + L < N$。
   
   如果合法，则新的子序列长度为当前块的长度，加上从 $j$ 开始的最长美丽子序列长度 $\text{dp}[j]$：
   
   
   $$
   \text{LengthJump} = (L + 1) + \text{dp}[i + L + 1]
   $$
   
   
   
   **最终转移：** $\text{dp}[i]$ 是两种选择（跳过 $a_i$ 或以 $a_i$ 构成新块）中的最大值：
   
   
   $$
   \text{dp}[i] = \max \left( \text{dp}[i+1], \quad (a_i + 1) + \text{dp}[i + a_i + 1] \right)
   $$
   
   
   其中，若 $i + a_i \ge N$，则第二个选项不参与 $\max$ 运算。

#### 边界条件

* 
  $\text{dp}[N]$ 到 $\text{dp}[N+6]$：由于索引 $i+L+1$ 可能超出 $N$，我们将 $\text{dp}$ 数组扩展到 $N+7$，并将 $\text{dp}[N] = 0$ 作为基本情况（空后缀的长度为 $0$）。
  
* **最终答案：** $\text{MinDeletions} = N - \text{dp}[0]$。

### CPP 代码实现

代码中采用了从后向前的线性 DP 求解，时间复杂度为 $O(N)$。

```cpp
#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

void solve() {

    int n;
    // 读取序列长度 N
    cin >> n;

    vector<int> a(n);
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }

    // dp[i]: 从索引 i 开始的最长美丽子序列的长度
    // 数组大小为 n + 7, 以确保 next_start_idx 不越界
    vector<int> dp(n + 7, 0);

    // 从后往前进行 DP 求解
    for (int i = n - 1; i >= 0; i--) {

        int L = a[i];
        // 下一个块的理论起始索引 j = i + L + 1
        int next_start_idx = i + L + 1;

        // 选项 1: 跳过 a[i]，长度为 dp[i+1]
        dp[i] = dp[i + 1];

        // 检查以 a[i] 为长度 L 的块是否合法 (块结束索引 i+L < n)
        if (i + L < n) {

            // 选项 2: 以 a[i] 构成新块。
            // 当前块总长度 (L + 1) + 从 next_start_idx 开始的最长长度 dp[j]
            int length_jump = (L + 1) + dp[next_start_idx];

            // 取两种选项的最大值
            dp[i] = max(dp[i], length_jump);
        }
    }

    // 最小删除次数 = 总长度 N - 最大保留长度 dp[0]
    cout << n - dp[0] << '\n';

}

int main() {

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
