---
title: "CF题解——Data Structures Fan"
date: "2025-12-29 16:12:42"
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
  - 前缀和
  - 位运算
---

# E. Data Structures Fan 解题思路

### 核心问题分析

题目给定一个数组 $a$ 和一个二进制字符串 $s$。
我们需要处理两种操作：
1.  **区间反转：** 给定区间 $[l, r]$，将字符串 $s$ 在该区间内的所有字符反转（$0 \to 1, 1 \to 0$）。
2.  **查询异或和：** 给定 $g \in \{0, 1\}$，计算所有满足 $s_i = g$ 的下标 $i$ 对应的 $a_i$ 的异或和。

数据范围 $n, q \le 10^5$，如果每次修改都遍历区间更新字符串，时间复杂度为 $O(n \cdot q)$，会超时。我们需要 $O(1)$ 或 $O(\log n)$ 的处理方式。

### 1. 异或运算的性质利用

异或运算（XOR, $\oplus$）有几个关键性质：
1.  $x \oplus x = 0$ （自反性）
2.  $x \oplus 0 = x$
3.  交换律与结合律

**维护全局变量：**
我们可以维护两个全局变量：
*   $X_0$：当前 $s_i=0$ 的所有 $a_i$ 的异或和。
*   $X_1$：当前 $s_i=1$ 的所有 $a_i$ 的异或和。

对于**查询操作（Type 2）**，直接输出对应的 $X_0$ 或 $X_1$ 即可，复杂度 $O(1)$。问题的关键在于如何快速处理**修改操作（Type 1）**。

### 2. 区间反转的快速更新

假设我们要反转区间 $[l, r]$。
令区间 $[l, r]$ 内所有元素的异或和为 $RangeXor(l, r)$。

**推导过程：**
在区间 $[l, r]$ 内：
*   一部分 $a_i$ 原本属于 $X_0$（因为 $s_i=0$）。反转后，它们将变成 $s_i=1$，应该从 $X_0$ 中移除，并加入到 $X_1$ 中。
*   另一部分 $a_i$ 原本属于 $X_1$（因为 $s_i=1$）。反转后，它们将变成 $s_i=0$，应该从 $X_1$ 中移除，并加入到 $X_0$ 中。

利用异或的性质：**从异或和中移除一个数等价于再异或一次该数**（因为 $A \oplus B \oplus B = A$）。

因此，对于区间 $[l, r]$ 内的任意 $a_i$：
*   无论它之前属于 $X_0$ 还是 $X_1$，在反转后，它的归属都会对调。
*   我们只需要将 $RangeXor(l, r)$ 异或到 $X_0$ 上，就能同时完成“移除原本属于 $X_0$ 的部分”和“加入原本属于 $X_1$ 的部分”。
*   同理，将 $RangeXor(l, r)$ 异或到 $X_1$ 上，也能完成对应的更新。

**结论：**
当执行区间 $[l, r]$ 反转时：

$$
X_0 \leftarrow X_0 \oplus RangeXor(l, r)
$$
$$
X_1 \leftarrow X_1 \oplus RangeXor(l, r)
$$


### 3. 前缀异或和数组

为了在 $O(1)$ 时间内求出 $RangeXor(l, r)$，我们需要预处理前缀异或和数组 $P$：
$P_i = a_1 \oplus a_2 \oplus \dots \oplus a_i$。

则：

$$
RangeXor(l, r) = P_r \oplus P_{l-1}
$$


### 4. C++ 代码实现细节

1.  **预处理：**
    *   计算 $a$ 的前缀异或数组 `data_vector`。
    *   根据初始字符串 $s$，计算初始的 `data_all_zero` ($X_0$) 和 `data_all_one` ($X_1$)。
2.  **处理 Query 1 (反转)：**
    *   计算区间异或和 `range_xor = data_vector[end] ^ data_vector[start - 1]`。
    *   `data_all_zero ^= range_xor`。
    *   `data_all_one ^= range_xor`。
3.  **处理 Query 2 (询问)：**
    *   根据输入直接输出 `data_all_zero` 或 `data_all_one`。

```cpp
#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

void solve() {

    int data_number, query_number;
    string data_string;
    cin >> data_number;
    
    // data_temp 用于存储原始数组
    // data_vector 用于存储前缀异或和
    vector<int> data_temp(data_number + 1);
    vector<int> data_vector(data_number + 1);
    
    int data_all_zero; // 对应 s[i] == '0' 的异或和
    int data_all_one;  // 对应 s[i] == '1' 的异或和

    for (int i = 1; i <= data_number; i++) {
        cin >> data_vector[i];
    }

    data_temp = data_vector; // 备份原始数据用于初始计算

    cin >> data_string;

    // 1. 预处理前缀异或和
    // data_vector[i] = a[1] ^ ... ^ a[i]
    for (int i = 1; i <= data_number; i++) {
        data_vector[i] = data_vector[i - 1] ^ data_vector[i];
    }

    // 2. 计算初始状态的 data_all_zero 和 data_all_one
    // 技巧：data_all_zero 可以先设为所有数的异或和 (即 data_vector[n])
    // 但下面的循环分别计算更直观
    data_all_zero = 0;
    data_all_one = 0;
    
    // 注意：题目中数组是 1-based，字符串是 0-based，需要注意下标对齐
    for (int i = 1; i <= data_number; i++) {
        if (data_string[i - 1] == '1') {
            data_all_one ^= data_temp[i];
        } else {
            data_all_zero ^= data_temp[i];
        }
    }

    cin >> query_number;

    for (int i = 1; i <= query_number; i++) {
        int object;
        cin >> object;
        if (object == 1) {
            // 区间反转操作
            int start, end;
            cin >> start >> end;
            // 计算区间 [start, end] 的异或和
            int range_val = data_vector[end] ^ data_vector[start - 1];
            
            // 核心逻辑：区间内所有数的状态反转
            // 意味着这部分异或和从 zero 集合移动到了 one 集合，反之亦然
            // 利用异或性质，直接异到两个变量上即可同时完成 增加/删除
            data_all_one ^= range_val;
            data_all_zero ^= range_val;
            
        } else if (object == 2) {
            // 查询操作
            int target;
            cin >> target;
            if (target == 1) {
                cout << data_all_one << ' ';
            } else if (target == 0) {
                cout << data_all_zero << ' ';
            }
        }
    }

    cout << endl;

}

int main() {

    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    cin >> t;

    while (t--) {
        solve();
    }

}
```