---
title: "CF题解——E. Power of Points"
date: "2025-11-29 21:17:20"
author: shouw
katex: true
email: shouw707@gmail.com
readmore: true
tags:
  - 编程
  - 算法竞赛
  - 题解
  - 差分
---

# E. Power of Points 解题思路

## 核心问题分析与数学转化

{% raw %}
本题要求对于给定的点集 $X = \{x_1, x_2, \dots, x_n\}$，对集合中每一个 $s \in X$，计算总功率和 $\sum_{p=1}^{10^9} f_p$。其中 $f_p$ 定义为与点 $p$ 相交的线段 $[s, x_i]$ 的数量。
{% endraw %}

### 1. 功率和与线段长度的关系

一个关键的观察是，一个线段 $[a, b]$ (不妨设 $a \le b$) 覆盖的整数点数量（即对总功率和 $\sum f_p$ 的贡献）恰好是其**长度** $b - a + 1$。

{% raw %}
线段 $[s, x_i]$ 的长度为：

$$
\text{Length}([s, x_i]) = |\max(s, x_i) - \min(s, x_i)| + 1 = |s - x_i| + 1
$$

{% endraw %}
{% raw %}
因此，总功率和 $\sum_{p=1}^{10^9} f_p$ 实际上等于所有 $n$ 条线段长度之和：

$$
\text{Total Power}(s) = \sum_{i=1}^{n} \text{Length}([s, x_i]) = \sum_{i=1}^{n} (|s - x_i| + 1)
$$

{% endraw %}
总和可以简化为：
{% raw %}

$$
\text{Total Power}(s) = n + \sum_{i=1}^{n} |s - x_i|
$$

{% endraw %}
{% raw %}
我们的核心任务，便转化成了对每一个 $s \in X$，高效计算 $\sum_{i=1}^{n} |s - x_i|$。
{% endraw %}

### 2. 离散化与结果缓存

由于输入点 $x_i$ 的坐标范围高达 $10^9$，但点的数量 $N$ 较小（$\le 2 \cdot 10^5$），我们采用以下策略来优化计算：

* **数据预处理**：对原始输入进行排序，以便进行差分计算。
* **结果缓存**：使用 `std::map<long long, long long> data_map` 存储每个**不重复**的 $s$ 坐标及其对应的总功率和，以应对原始输入中存在的重复点。

---

## 核心优化：差分递推计算 $|s - x_i|$ 之和

为了实现 $O(N \log N)$ 的时间复杂度（主要耗费在排序上），我们使用**差分**（Differential）思想。

{% raw %}
设 $S(s) = \sum_{j=1}^{n} |s - x_j|$。我们对排序后的去重点 $s_{i}$ 和 $s_{i+1}$ 进行分析，差值 $\Delta = s_{i+1} - s_i > 0$。通过已知的 $S_{curr}$ 来快速计算相邻点 $S_{next}$。
{% endraw %}

### 递推公式的建立

{% raw %}
当 $s$ 从 $s_i$ 变化到 $s_{i+1}$ 时，每个 $x_j$ 对总和的贡献变化量 $\Delta_j$ 为：

$$
\Delta_j = |s_{i+1} - x_j| - |s_i - x_j|
$$

{% endraw %}

1. {% raw %}对于 $x_j \le s_i$ (左侧)：
    
    $$
    \Delta_j = (s_{i+1} - x_j) - (s_i - x_j) = s_{i+1} - s_i = \Delta
    $$
    
    (贡献增加 $\Delta$){% endraw %}
2. {% raw %}对于 $x_j > s_{i+1}$ (右侧)：
    
    $$
    \Delta_j = (x_j - s_{i+1}) - (x_j - s_i) = s_i - s_{i+1} = -\Delta
    $$
    
    (贡献减少 $\Delta$){% endraw %}

**递推关系：**
{% raw %}

$$
S(s_{i+1}) = S(s_i) + \sum_{j=1}^{n} \Delta_j
$$

{% endraw %}
{% raw %}
设 $L$ 为 $x_j \le s_i$ 的点数，$R$ 为 $x_j > s_{i+1}$ 的点数。总和变化量 $\text{Diff}$ 为：

$$
\text{Diff} = L \cdot \Delta - R \cdot \Delta = (L - R) \cdot (s_{i+1} - s_i)
$$

{% endraw %}

### 3. 计算第一个点 $s_0$ 的初始值

{% raw %}
对于排序后的第一个点 $s_0 = data[0]$，所有 $x_j \ge s_0$，因此 $|s_0 - x_j| = x_j - s_0$。

$$
\sum_{j=1}^{n} |s_0 - x_j| = \sum_{j=1}^{n} (x_j - s_0) = \left(\sum_{j=1}^{n} x_j\right) - n \cdot s_0
$$

初始总功率和 $S_0$ 为：

$$
S_0 = n + \left(\sum_{j=1}^{n} x_j\right) - n \cdot s_0
$$

{% endraw %}

---

## C++ 代码实现

```cpp
#include <bits/stdc++.h>

using namespace std;

void solve() {

    // N: 数据点的数量
    long long data_number;
    // current_sum: 用于保存 Σ|s - x_i| 的当前值 (距离和)
    long long current_sum = 0;
    
    cin >> data_number;
    
    // data: 存储原始输入坐标，用于排序和递推
    vector<long long> data(data_number);
    // ans_order: 存储原始输入顺序，用于最后按原顺序输出
    vector<long long> ans_order(data_number); 
    
    // result_map: 存储去重后的 s 坐标及其对应的总功率和（结果）
    map<long long, long long> result_map;

    // 1. 读取数据并计算所有 x_i 的总和，同时保存原始顺序
    for (long long i = 0; i < data_number; i++) {
        cin >> data[i];
        ans_order[i] = data[i]; // 保存原始顺序
        current_sum += data[i]; // 累加所有 x_i (Σx_i)
    }

    // 2. 排序，为差分递推做准备
    sort(data.begin(), data.end());

    // 3. 计算第一个点 data[0] 的初始 Σ|s - x_i|
    // current_sum = (Σx_i) - n * data[0]
    current_sum = current_sum - data[0] * data_number; 
    
    // S_0 (总功率和) = Σ|s_0 - x_i| + n
    long long s0_total_power = data_number + current_sum; 
    
    // 将第一个点 data[0] 的结果存入 Map
    result_map[data[0]] = s0_total_power;

    // 4. 差分递推计算后续点 S_i 的结果
    for (long long i = 0; i < data_number - 1; i++) {
        if (data[i + 1] != data[i]) {
            // 变化量 Δ = data[i+1] - data[i]
            long long delta = data[i + 1] - data[i];
            
            // L: 左侧点数，即 x_j <= data[i] 的数量 (包含 data[0] 到 data[i])
            long long L = i + 1; 
            
            // R: 右侧点数，即 x_j > data[i+1] 的数量
            // R = 总点数 - (i + 2)
            long long R = data_number - (i + 2); 
            
            // 递推核心： S_next - S_curr = L * Δ - R * Δ
            long long diff = (L * delta) - (R * delta);

            // 更新 current_sum (Σ|s - x_i|)
            current_sum += diff;
            
            // 更新 S(s) 的总功率和 (Σ|s - x_i| + n)
            result_map[data[i + 1]] = current_sum + data_number;
        }
    }

    // 5. 按原始输入顺序输出结果
    for (long long i = 0; i < data_number; i++) {
        cout << result_map[ans_order[i]] << ' ';
    }

    cout << '\n';

}

int main() {

    // 优化 I/O 速度
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    long long test;
    cin >> test;

    while (test--) {
        solve();
    }
}
```
