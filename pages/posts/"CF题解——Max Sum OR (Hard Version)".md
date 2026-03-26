---
title: "CF题解——Max Sum OR (Hard Version)"
date: "2026-03-26 17:08:09"
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
 - 位运算
 - 构造
---

# D2. Max Sum OR (Hard Version) 解题思路

### 核心问题分析

题目的要求是：给定一个连续的整数数组 $b = [l, l+1, \dots, r]$，我们需要构造它的一个排列 $a$，使得 $\sum_{i=1}^{n} (a_i | b_i)$ 的值最大。

遇到位运算求最大值的问题，我们的第一直觉必须是：**按位贪心，从高位到低位考虑。**
因为在二进制中，高位的权重永远大于所有低位权重的总和（比如 $10000_2 > 01111_2$）。为了让 OR 的和最大，我们要尽可能让每一次 OR 运算的结果在更高的位上产出 `1`。

### 1. 贪心策略：让 0 和 1 完美相遇

对于任意一个特定的二进制位（比如第 $i$ 位），如何才能让 OR 的结果出现最多的 `1` 呢？
答案很简单：**尽量把这一位是 `0` 的数，和这一位是 `1` 的数配对。** 因为 `0 | 1 = 1`。

由于初始数组是连续的一段数字 $[l, r]$，对于当前的最高有效位来说，这些数字在这个位上的表现一定是**“前面全是一坨 0，后面全是一坨 1”**（或者干脆全是 0 / 全是 1）。
这就为我们的“配对”提供了极大的便利。

### 2. 局部匹配：少数派优先原则

既然分成了“0阵营”和“1阵营”，必然有一方的数量较少（或者两边一样多）。
为了让最终的 OR 和最大，我们应该**把数量较少的那个阵营，全部与数量较多的阵营进行 1对1 交叉配对**。

假设当前我们在考察区间 `[start, last]`：
1. **如果 1 的数量 $\le$ 0 的数量（1 是少数派）：**
   因为 1 都集中在区间的右端，0 集中在左侧，所以我们就把右端所有的 1，和紧挨着它们的那些 0 进行**对称翻转配对**。配对完成后，这些数字的任务就圆满结束了，我们把它们移出考察区间（`last` 左移）。
2. **如果 1 的数量 $>$ 0 的数量（0 是少数派）：**
   说明 0 都在区间的左端。我们就把左端所有的 0，和紧挨着它们的那些 1 进行**对称翻转配对**。配对完后，同样把它们移出区间（`start` 右移）。

通过这样从最高位 `31` 一路向下扫到 `0`，每次剥离掉被完美配对的子集，剩下的区间再用次高位继续去匹配。这样不仅逻辑严密，而且能保证每一对的匹配都是当前位下的最优解。

### 3. 代码逻辑解析

这套思路在代码中体现为维护一个活跃区间 `[start, last]`。
* 先把所有数字转成二进制存入 `bits` 数组。
* 逆序遍历 31 到 0 位。统计区间尾部有多少个连续的 `1`，记作 `same`。
* 比较 `same`（1的数量）和当前区间长度 `cur` 的一半：
  * 若 $2 \times same \le cur$，说明 1 较少。取末尾 `same` 个元素与它们前面的 `same` 个元素对称交换。
  * 否则说明 0 较少（0的数量为 `cur - same`）。取开头 `cur - same` 个元素与它们后面的元素对称交换。

### CPP 代码实现

```cpp
// D2. Max Sum OR (Hard Version)

#include <bits/stdc++.h>
#define lg(x) (63 - __builtin_clzll(x))
#define all(x) (x).begin(), (x).end()
#define low_bit(x) ((x) & (-x))
#define pb push_back
#define db long double
#define int long long
#define endl "\n"

using namespace std;

// 辅助函数：将十进制数 x 转换为 32 位二进制，存入 bits[idx]
void cal(int x, int idx, vector<vector<int>> &bits) {
    int p = 0;
    while (x) {
        if (x & 1) bits[idx][p] = 1;
        p++;
        x >>= 1;
    }
}

void solve() {
    int l, r;
    cin >> l >> r;
    int n = r - l + 1;
    vector<int> a(n);
    vector<int> res(n);
    vector<vector<int>> bits(n, vector<int>(32));
    
    // 初始化数组 a 为 [l, l+1, ..., r]
    iota(a.begin(), a.end(), l);
    int idx = 0;
    for (auto it : a) {
        cal(it, idx, bits);
        idx++;
    }
    
    // start 和 last 维护当前还需要进行配对的区间 [start, last]
    int last = n - 1;
    int start = 0;
    int sum = 0;
    
    // 从最高位向最低位贪心
    for (int i = 31; i >= 0; i--) {
        // 如果区间已经完全配对完毕，提前结束
        if (last < start) break;
        // 如果区间只剩最后一个数，它只能自己和自己配对（不动）
        if (last == start) {
            res[last] = a[last];
            sum += res[last];
            break;
        }
        
        // 统计当前区间末尾有多少个数字在第 i 位上是 1
        int same = 0;
        for (int j = last; j >= start; j--) {
            if (bits[j][i]) same++;
            else break; // 因为是连续递增区间，遇到0说明1已经断了
        }
        
        int cur = last - start + 1; // 当前区间总长度
        
        // 分支 1：如果 1 的数量不多于一半（1 是少数派）
        if (same * 2 <= cur) {
            // 将末尾的 same 个 1 与 紧挨着它们前面的 same 个 0 进行对称配对互换
            for (int j = 0; j < same; j++) {
                // res存的是排列后的数组。此处进行交叉配对。
                res[last - j] = a[last - 2 * same + 1 + j];
                res[last - 2 * same + 1 + j] = a[last - j];
                // 累计配对后的 OR 值
                sum += (a[last - j] | res[last - j]);
                sum += (a[last - 2 * same + 1 + j] | res[last - 2 * same + 1 + j]);
            }
            // 配对成功的 2*same 个数字移出活跃区间（从右边缩减）
            last -= same * 2;
        } 
        // 分支 2：如果 1 的数量多于一半（0 是少数派）
        else {
            // cur - same 计算出左边 0 的数量，并覆写给 same
            same = cur - same;
            // 将开头的 same 个 0 与 紧挨着它们后面的 same 个 1 进行对称配对互换
            for (int j = 0; j < same; j++) {
                res[start + j] = a[start + 2 * same - 1 - j];
                res[start + 2 * same - 1 - j] = a[start + j];
                sum += (a[start + j] | res[start + j]);
                sum += (a[start + 2 * same - 1 - j] | res[start + 2 * same - 1 - j]);
            }
            // 配对成功的 2*same 个数字移出活跃区间（从左边缩减）
            start += same * 2;
        }
    }
    
    // 输出总的最大 OR 和
    cout << sum << endl;
    // 输出具体的构造排列
    for (auto it : res) {
        cout << it << ' ';
    }
    cout << endl;
}

signed main() {
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    cin >> t; 
    
    while (t--) {
        solve();
    }
}
```