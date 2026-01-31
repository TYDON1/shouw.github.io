---
title: "CF题解——C. The Ancient Wizards' Capes"
date: "2025-11-30 15:07:50"
author: shouw
katex: true
email: shouw707@gmail.com
readmore: true
tags:
  - 编程
  - 算法竞赛
  - 题解
  - 枚举
  - 差分
---


# C. The Ancient Wizards' Capes 解题思路

## 核心问题分析与数学转化

{% raw %}
本题的本质是一个关于<b>相邻巫师斗篷朝向</b>的逻辑递推问题。我们关注的是每个巫师 $i$ 能看到的巫师数量 $a_i$。
{% endraw %}

### 1. 斗篷朝向与可见性

{% raw %}
 我们先假设 $x_i \in \{0, 1\}$ 表示第 $i$ 个巫师斗篷的朝向：

1. $x_i = 0$: 斗篷向左。
2. $x_i = 1$: 斗篷向右。
   {% endraw %}

{% raw %}
对于第 $i$ 个巫师来说，只有满足 $x_j = 1$ 的巫师 $j$ 才是<b>可见</b>的。

1. 如果 $x_j = 1$ (向右)，则 $j$ 对 $i$ <b>可见</b>。
2. 如果 $x_j = 0$ (向左)，则 $j$ 对 $i$ <b>不可见</b>（被自己或前面的巫师挡住）。
   {% endraw %}

{% raw %}
因此，巫师 $i$ 能看到的巫师数量 $a_i$ 实际上等于在他身后（$j > i$）斗篷朝向右（$x_j = 1$）的巫师数量：

$$
a_i = \sum_{j=i+1}^{n} x_j
$$

{% endraw %}

### 2. 相邻可见数的差分关系

{% raw %}
本题的关键在于利用 $a_i$ 和 $a_{i+1}$ 之间的关系来确定 $x_i$ 和 $x_{i+1}$ 之间的关系。
{% endraw %}

{% raw %}
我们将 $a_i$ 和 $a_{i+1}$ 的定义展开：

$$
a_i = \sum_{j=i+1}^{n} x_j \quad \text{和} \quad a_{i+1} = \sum_{j=i+2}^{n} x_j
$$

{% endraw %}

{% raw %}
两个相邻可见数的差值为：

$$
a_i - a_{i+1} = \left(\sum_{j=i+1}^{n} x_j\right) - \left(\sum_{j=i+2}^{n} x_j\right) = x_{i+1}
$$

{% endraw %}

{% raw %}
所以，我们得到一个重要的递推关系：<b>第 $i+1$ 个巫师的斗篷朝向 $x_{i+1}$ 恰好等于 $a_i$ 和 $a_{i+1}$ 的差值</b>。
{% endraw %}

{% raw %}

$$
x_{i+1} = a_i - a_{i+1}
$$

{% endraw %}

### 3. 可行性判断的充要条件

{% raw %}
从递推关系 $x_{i+1} = a_i - a_{i+1}$ 可以得出两个直接的<b>约束条件</b>：

1. <b>差值约束</b>：由于 $x_{i+1}$ 必须是 0 或 1，所以 $a_i - a_{i+1}$ 的值必须在 $\{0, 1\}$ 范围内。
2. <b>初始值约束</b>： $x_1$ 无法通过差分确定，需要通过枚举和验证来确定。
   {% endraw %}

## 核心算法：枚举 $x_1$ 并验证

### 1. 确定 $x_2$ 到 $x_n$ 的序列

{% raw %}
基于递推关系 $x_{i+1} = a_i - a_{i+1}$，从 $i=1$ 开始，我们可以依次计算出 $x_2, x_3, \dots, x_n$ 的朝向序列。
{% endraw %}

{% raw %}

1. <b>预先检查</b>：在计算前，必须检查所有 $i \in [1, n-1]$，是否满足 $0 \le a_i - a_{i+1} \le 1$。如果不满足，则不存在任何解，答案为 0。
   {% endraw %}

### 2. 枚举 $x_1$ 并进行完整性验证

{% raw %}
由于 $x_1$ 只有两种可能（0 或 1），我们对这两种情况分别进行假设和验证。

#### 假设 1: $x_1 = 0$ (左)

构造出序列 $X^{(0)} = \{0, x_2, x_3, \dots, x_n\}$。

#### 假设 2: $x_1 = 1$ (右)

构造出序列 $X^{(1)} = \{1, x_2, x_3, \dots, x_n\}$。
{% endraw %}

**验证函数 `validate_arrangement`：**

{% raw %}
对于一个完整的假设序列 $X = \{x_1, \dots, x_n\}$，验证的核心在于检查 <b>$X$ 序列计算出的可见数 $a'_i$ 是否完全等于原始输入 $a_i$</b>。

$$
\text{Check: } \forall i \in [1, n], \quad \sum_{j=i+1}^{n} x_j = a_i
$$

{% endraw %}

### 3. 计数结果

{% raw %}
最终答案即为通过验证的<b>不重复</b>序列数量。由于 $x_2, \dots, x_n$ 唯一确定，所以 $X^{(0)}$ 和 $X^{(1)}$ 只有在 $x_1$ 不同时才会存在差异。
{% endraw %}

## C++ 代码实现

```cpp
#include <bits/stdc++.h>

using namespace std;

// 验证函数：检查生成的斗篷朝向序列 X 是否与给定的可见数 A 完全匹配
// X: 斗篷朝向序列 (1-based)，X[i] = 0 或 1
// n: 巫师总数
// A: 原始输入的可见数序列 (1-based)，A[i]
bool validate_arrangement(const vector<int>& x, int n, const vector<int>& a) {

    // 1. 计算第一个巫师看到的数量 a'[1]
    // a'[1] 等于所有在他后面 (j > 1) 且斗篷向右 (x[j]=1) 的数量
    int actual_a1 = 0;
    for (int j = 2; j <= n; j++) {
        if (x[j] == 1) {
            actual_a1++;
        }
    }

    // 检查 a'[1] 是否匹配输入 a[1]
    if (actual_a1 != a[1]) {
        return false;
    }

    // 2. 差分验证后续 a'[i] 是否匹配 a[i]
    // current_visible_count 此时等于 a'[1]
    int current_visible_count = actual_a1; 
    
    // 从 i=1 开始，验证 a[2], a[3], ...
    for (int i = 1; i < n; i++) {
        // 根据定义，a[i+1] = a[i] - x[i+1]
        // 实际可见数 a'[i+1] = a'[i] - x[i+1]
        current_visible_count -= x[i+1]; 

        // 检查实际计算的 a'[i+1] 是否等于输入的 a[i+1]
        if (a[i+1] != current_visible_count) {
            return false;
        }
    }

    return true;
}

void solve() {
    int n;
    cin >> n;

    // arr[0] 闲置，从 arr[1] 开始存储 A 序列
    vector<int> arr(n + 1);
    for (int i = 1; i <= n; i++) {
        cin >> arr[i];
    }

    // sol1: 假设 x[1] = 0 的序列
    vector<int> sol1(n + 1);
    // sol2: 假设 x[1] = 1 的序列
    vector<int> sol2(n + 1);

    // 1. 设置初始假设
    sol1[1] = 0; // 假设 x[1] = 0
    sol2[1] = 1; // 假设 x[1] = 1

    bool possible_flag = true;

    // 2. 利用差分关系 x[i+1] = a[i] - a[i+1] 确定后续朝向
    for (int j = 1; j < n; j++) {
        // diff = a[j+1] - a[j]
        int diff = arr[j+1] - arr[j]; 

        // 差分约束检查：x[j+1] = a[j] - a[j+1] 必须是 0 或 1
        // 即 diff 必须是 -1 或 0
        if (diff > 0 || diff < -1) {
            possible_flag = false;
            break;
        }

        // x[j+1] = a[j] - a[j+1] = -diff
        int x_next = arr[j] - arr[j+1]; 

        // x_next 是唯一确定的，与 x[1] 的假设无关
        sol1[j+1] = x_next;
        sol2[j+1] = x_next;
    }

    // 如果差分约束失败，直接输出 0
    if (!possible_flag) {
        cout << 0 << '\n';
        return;
    }

    int count_ans = 0;

    // 3. 验证 sol1 (x[1]=0)
    if (validate_arrangement(sol1, n, arr)) {
        count_ans++;
    }

    // 4. 验证 sol2 (x[1]=1)
    if (validate_arrangement(sol2, n, arr)) {
        // n=1 的特殊处理：当 n=1, arr[1]=0 时，sol1 和 sol2 都会通过验证。
        if (n == 1 && arr[1] == 0) {
            // n=1 时，x[1]不受a[1]约束。count_ans应为 1。
            if (count_ans < 1) {
                count_ans = 1;
            }
        } else {
             // n >= 2 或 n=1 且 arr[1]!=0 (不可能通过差分约束)
             // 此时 sol2 必然是不同于 sol1 的有效序列，直接计数
             count_ans++;
        }
    }
    
    // n=1, arr[1]=0 的特殊输出处理
    if (n == 1 && arr[1] == 0) {
        cout << 1 << '\n';
    } else {
        cout << count_ans << '\n';
    }
}

int main() {

    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int test;
    cin >> test;

    while (test--) {
        solve();
    }

}
```
