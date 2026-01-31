---
title: "CF题解——C. Serval and The Formula"
date: "2025-12-26 15:41:22"
author: shouw
katex: true
email: shouw707@gmail.com
readmore: true
tags:
  - 编程
  - 算法竞赛
  - 题解
  - 构造
---

# C. Serval and The Formula 解题思路

### 核心问题分析与数学转化

本题要求找到一个非负整数 $k$，使得：

{% raw %}
$$
(x+k) + (y+k) = (x+k) \oplus (y+k)
$$
{% endraw %}

*   **位运算性质：** 对于任意非负整数 $a, b$，都有 $a+b = (a \oplus b) + 2(a \mathbin{\&} b)$。
*   **条件转化：** 题目中的等式 $(x+k) + (y+k) = (x+k) \oplus (y+k)$ 等价于 $2((x+k) \mathbin{\&} (y+k)) = 0$。即：
    {% raw %}
    $$
    (x+k) \mathbin{\&} (y+k) = 0
    $$
    {% endraw %}
    这意味着 $x+k$ 和 $y+k$ 在二进制表示下，**没有任何一位同时为 1**。

### 1. 变量代换与简化

不妨设 $x \le y$（若 $x > y$ 则交换）。
令 $A = x+k$，则 $y+k = y - x + x + k = (y-x) + A$。
设差值 $D = y - x$。

我们的目标转化为找到一个 $A$（且 $A \ge x$），使得：
{% raw %}
$$
A \mathbin{\&} (A + D) = 0
$$
{% endraw %}
最后求出 $k = A - x$。

**特殊情况：**
如果 $x = y$，则 $D=0$，条件变为 $A \mathbin{\&} A = 0 \Rightarrow A=0$。但题目给定 $x \ge 1$，且 $A = x+k \ge 1$，因此 $A$ 不可能为 0，故此时无解，输出 -1。

### 2. 构造策略 (利用进位消除)

我们要构造一个数 $A$，使得它和 $A+D$ 没有公共的 1。
观察加法进位的特性：如果 $A$ 的某一位是 1，且 $D$ 的对应位也是 1，那么相加时该位会变成 0 并产生进位。

**核心思路：**
我们找到 $D$ 的**最高有效位 (MSB)**，设其位置为 $p$（即 $2^p$）。

1.  **构造 $A$：** 让 $A$ 从第 $p$ 位开始，一直到更高的位（比如第 40 位），全部置为 1。低于第 $p$ 位的全部置为 0。
    *   $A$ 的形式：`...11111000...` （最低的 1 在第 $p$ 位）。
    *   $D$ 的形式：`...00001xxx...` （最高的 1 在第 $p$ 位）。
2.  **验证 $A \mathbin{\&} (A+D) = 0$：**
    *   **在第 $p$ 位：** $A$ 是 1，$D$ 也是 1。相加 $1+1=10_{(2)}$，结果位为 0，向 $p+1$ 位进 1。
    *   **在第 $p+1$ 位及以上：** $A$ 依然是 1，$D$ 在这些位全是 0（因为 $p$ 是 $D$ 的最高位）。加上进位，$1+0+1=10_{(2)}$，结果位为 0，继续向高位进 1。
    *   **结论：** 这种连锁反应会使得 $A+D$ 在所有 $A$ 为 1 的位置上都变成了 0。而在 $A$ 为 0 的低位上，$A+D$ 等于 $D$，两者自然没有交集。

### 3. C++ 代码实现细节

代码中使用 `std::bitset` 方便地处理二进制串。
需要注意的是 `bitset::to_string()` 生成的字符串，索引 0 对应的是**最高位**。

1.  计算 $D = y - x$。
2.  将 $D$ 转为 bitset 字符串，找到第一个 '1' 的位置（即最高位）。
3.  构造 $A$ 的字符串：从最高位开始直到 $D$ 的最高位位置，全部填 '1'。
4.  将构造的字符串转回 `long long` 得到 $A$。
5.  输出 $k = A - x$。

由于 $A$ 的构造方式保证了其值远大于 $D$，且通常大于 $x$，所以计算出的 $k$ 为非负数。

```cpp
#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

void solve() {

    ll data_one, data_two;
    cin >> data_one >> data_two;

    // 保证 data_one <= data_two
    if (data_one > data_two) {
        swap(data_one, data_two);
    } else if (data_one == data_two) {
        // x = y 时，(x+k) & (x+k) = x+k，不为0（因x>=1），无解
        cout << -1 << endl;
        return;
    }

    ll target = data_two - data_one; // 差值 D

    // 使用 bitset 处理二进制，大小 40 足够覆盖 10^9 和构造出的答案
    bitset<40> bits_target(target);
    string bits_target_string = bits_target.to_string();

    // 初始化构造的 A 的 bitset，初始全 0
    bitset<40> bits_ans(0);
    string ans_string = bits_ans.to_string();

    // 找到 target (D) 最高位的 1 在字符串中的下标
    // 注意：to_string 后，下标 0 是最高位 (MSB)
    size_t index_data = bits_target_string.find('1');
    
    // 构造 A：将 A 的最高位到 D 的最高位对应位置全部置 1
    // 逻辑上相当于构造了一个掩码：111...100...
    if (index_data != string::npos) {
        for (int i = 0; i <= index_data; i++) {
            ans_string[i] = '1';
        }
    }

    // 将构造的二进制字符串转回数值 A，计算 k = A - x
    ll ans_val = stoll(ans_string, nullptr, 2);
    ll k = ans_val - data_one;

    cout << k << endl;

}

int main() {

    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t;
    cin >> t;

    while (t--) {
        solve();
    }

}
```