---
title: "CF题解——D. Shohag Loves GCD"
date: 2025-12-29 14:36:41
author: shouw
katex: true
email: shouw707@gmail.com
readmore: true
tags:
  - 编程
  - 算法竞赛
  - 题解
  - 数论
  - 贪心
---

# D. Shohag Loves GCD 解题思路

### 核心问题分析

题目要求我们构造一个字典序最大的数组 $a$，使得对于任意 $1 \le i < j \le n$，满足：
{% raw %}
$$
a_{\gcd(i, j)} \neq \gcd(a_i, a_j)
$$
{% endraw %}
且所有 $a_i$ 都必须来自给定的集合 $S$。

### 1. 条件转化与数学推导

我们先考察最特殊的整除情况。
假设 $i \mid j$（即 $i$ 是 $j$ 的因数），那么 $\gcd(i, j) = i$。
此时题目条件转化为：
{% raw %}
$$
a_i \neq \gcd(a_i, a_j)
$$
{% endraw %}
因为 $\gcd(a_i, a_j)$ 一定是 $a_i$ 的约数，要使得它不等于 $a_i$，唯一的办法就是 $\gcd(a_i, a_j) \neq a_i$。这意味着 **$a_i$ 不能整除 $a_j$**。

**推论：**
如果在索引上存在整除关系 $i \mid j$，则在数值上必须满足 $a_i \nmid a_j$。

为了构造字典序最大的数组，我们希望前面的数尽可能大。对于 $i \mid j$，最简单且有效的满足 $a_i \nmid a_j$ 的方式是强制让 **$a_i > a_j$**。
因为如果 $a_i > a_j$，显然 $a_i$ 不可能整除 $a_j$（$a_i, a_j$ 均为正整数）。

### 2. 构造策略 (基于除数链的深度)

基于上述“若 $i \mid j$ 则 $a_i > a_j$”的贪心策略，我们需要为每个下标 $i$ 定义一个“层级”或“深度”。

定义 $depth[i]$ 为以 $i$ 结尾的最长整除链的长度。
即存在序列 $d_1, d_2, \dots, d_k$ 使得 $d_1 \mid d_2 \mid \dots \mid d_k = i$，则 $depth[i] = k$。
例如：
*   $depth[1] = 1$ （序列：1）
*   $depth[2] = 2$ （序列：1 -> 2）
*   $depth[4] = 3$ （序列：1 -> 2 -> 4）
*   $depth[6] = 3$ （序列：1 -> 2 -> 6 或 1 -> 3 -> 6）

**贪心分配：**
如果我们按照 $depth[i]$ 的值来分配 $S$ 中的元素：
*   $depth$ 越小（越接近根节点 1），分配 $S$ 中越大的值。
*   $depth$ 越大（越接近末端），分配 $S$ 中越小的值。

具体做法是：
1.  计算所有 $1 \dots n$ 的 $depth$ 值。
2.  将集合 $S$ 从大到小排序。
3.  令 $a_i = S[depth[i] - 1]$ （注意 $S$ 也是 0-indexed）。

### 3. 正确性验证

我们验证一下这种构造是否满足题目原本的条件。
设 $g = \gcd(i, j)$。显然 $g \mid i$ 且 $g \mid j$。

根据 $depth$ 的定义，整除关系意味着层级的增加，即 $depth[g] < depth[i]$ 且 $depth[g] < depth[j]$（当 $g \neq i$ 且 $g \neq j$ 时）。

由于我们将 $S$ 降序排列并按 $depth$ 分配：
*   $a_g$ 对应较小的 $depth$，所以 $a_g$ 的值较大。
*   $a_i$ 和 $a_j$ 对应较大的 $depth$，所以值较小。
*   即 $a_g > a_i$ 且 $a_g > a_j$。

**判断：**

{% raw %}
因为 $a_g$ 严格大于 $a_i$ 和 $a_j$，所以 $a_g$ 必然严格大于 $\gcd(a_i, a_j)$（因为 $\gcd(x, y) \le \min(x, y)$）。
所以 $a_{\gcd(i, j)} \neq \gcd(a_i, a_j)$ 恒成立。
{% endraw %}

**无解判定：**
如果算出的最大深度 $\max(depth)$ 超过了集合 $S$ 的大小 $m$，说明我们没有足够的数来区分这么长的整除链，此时输出 -1。

### 4. C++ 代码实现细节

代码中使用类似于埃氏筛（Sieve）的方法来快速计算所有数的 $depth$。
*   初始化所有 $depth[i] = 1$。
*   对于每个 $i$，更新其倍数 $j$：$depth[j] = \max(depth[j], depth[i] + 1)$。
*   这种递推保证了 $depth[j]$ 正确记录了最长链。

### C++ 代码实现

使用每个数字的深度去寻找它当前所能填入的最大数字。

```cpp

#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

const int MAXN = 100005;
int depth[MAXN];

// 预处理：计算每个数字的深度（最长除数链长度）
// 类似于埃氏筛，时间复杂度 O(N log N) 或 O(N log log N) 取决于具体实现，这里是调和级数求和 O(N log N)
void create() {
    // 初始化深度为 1 (链: 1->i 本身至少长度为1，虽然题目中由1开始，但逻辑一致)
    // 实际上这里 depth[1]=1, depth[2]=2...
    for (int i = 1; i < MAXN; i++) depth[i] = 1;

    for (int i = 1; i < MAXN; i++) {
        // 枚举 i 的倍数，更新倍数的深度
        for (int j = 2 * i; j < MAXN; j += i) {
            depth[j] = max(depth[j], depth[i] + 1);
        }
    }
}

void solve() {

    int data_number, data_object;
    cin >> data_number >> data_object; // n 和 m
    vector<int> data(data_number + 1);
    vector<int> objects(data_number);

    // 读入集合 S
    for (int i = 0; i < data_object; i++) {
        cin >> objects[i];
    }

    // 将 S 从大到小排序，以便贪心地将大数分配给低深度的位置
    sort(objects.begin(), objects.end(), greater<int>());

    for (int i = 1; i <= data_number; i++) {
        // 如果当前数字需要的深度超过了集合 S 的大小，说明无法构造
        // 因为一条长为 K 的除数链至少需要 K 个不同的数字
        if (depth[i] > data_object) {
            cout << -1 << endl;
            return;
        }
        // 分配数值：深度越小，索引越小，值越大
        data[i] = objects[depth[i] - 1];
    }

    // 输出结果
    for (int i = 1; i <= data_number; i++) {
        cout << data[i] << " ";
    }

    cout << endl;

}

int main() {

    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    // 预处理 depth 数组
    create();

    int t = 1;
    cin >> t;

    while (t--) {
        solve();
    }

}
```