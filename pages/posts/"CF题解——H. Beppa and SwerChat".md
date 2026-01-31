---
title: "CF题解——Beppa and SwerChat"
date: "2025-12-05 14:12:51"
author: shouw
katex: true
email: KijinSeija@shouw.blog
readmore: true
tags:
  - 编程
  - 算法竞赛
  - 题解
  - 最长公共子序列
---

# H. Beppa and SwerChat 解题思路

### 核心问题分析与数学转化

本题要求计算在 9:00 和 22:00 之间，**至少上线过一次**的其他成员的**最少人数**。

设 $A$ 是 9:00 时成员的列表， $B$ 是 22:00 时成员的列表。列表按照**最后一次上线时间递减**排序。

* **关键观察：** 如果一个成员 $X$ 在 9:00 到 22:00 之间**没有上线**，那么他在 22:00 时的最后上线时间就是他在 9:00 时的最后上线时间（或者更早）。
* **排序推论：** 对于所有**没有上线**的成员构成的子集 $U$，他们在列表 $A$ 中的相对顺序和在列表 $B$ 中的相对顺序必须是**完全相同**的。

因此，**最少上线过的人数** $\text{MinOnline}$ 对应于 **最多没有上线的人数** $\text{MaxOffline}$：



$$
\text{MinOnline} = N - \text{MaxOffline}
$$




我们的目标转化为：<b>从 $A$ 和 $B$ 中找到能够保持相对顺序的最长公共子序列，这个子序列代表了 $\text{MaxOffline}$ 的长度。</b>


### 1. 相对顺序的转换与简化

序列 $A$ 和 $B$ 都是 ID 列表。我们首先需要将 $B$ 列表转化为基于 $A$ 列表的**排名**或**索引**。

1. **定义 $A$ 的排名：** 在 9:00 的列表 $A$ 中，成员 $a_i$ 的排名定义为其在 $A$ 中的位置索引 $i+1$ (即 $1$ 到 $N$)。
2. **转换 $B$ 列表：** 将 22:00 的列表 $B$ 中的每个 ID 替换为该 ID 在 $A$ 列表中的**排名**。设转换后的列表为 $B'$。
    
    * $B'$ 的含义：列表中 $B'_j = k$ 表示在 22:00 排在第 $j$ 位的成员，在 9:00 是排在第 $k$ 位的。
3. **寻找 $\text{MaxOffline}$：** 如果成员集合 $U$ 没有上线，那么：
    
    * 他们在 $A$ 中的顺序是递减的排名 $k_1 > k_2 > \dots$。
    * 他们在 $B$ 中的顺序也必须是递减的排名 $k_1' > k_2' > \dots$。
    
    由于我们已经将 $B$ 转换成了 $A$ 的排名 $B'$，我们现在只需要在 $B'$ 中寻找一个子序列，使得**索引递增**，且**元素值递增**（即 $A$ 的排名递增）。
    
    **推论：** 最多没有上线的人数 $\text{MaxOffline}$ 等于 $B'$ 列表（已转换成 $A$ 排名）中，从后向前找到的**最长连续递增子序列的长度**。

### 2. 动态规划思路 (等效于线性扫描)


在 $B'$ 中，我们要找一个最长的后缀子序列 $B'_{i}, B'_{i+1}, \dots, B'_{N-1}$，满足 $B'_j < B'_{j+1}$。

我们从 $B'_{N-2}$ 的倒数第二个元素开始向前扫描：

* **初始化：** 最长连续递增后缀长度 $\text{Length} = 1$ (包含 $B'_{N-1}$ 本身)。
* **递推：** 当我们遍历到索引 $i$ 时，如果 $B'_i < B'_{i+1}$，说明当前成员 $B'_i$ 比后面的 $B'_{i+1}$ 在 9:00 时排名靠前，且在 22:00 时也排在 $B'_{i+1}$ 前面。这保持了相对顺序， $\text{Length} \leftarrow \text{Length} + 1$。
* **中断：** 如果 $B'_i \ge B'_{i+1}$，则相对顺序发生变化，说明 $B'_i$ 或之前的某个成员一定上线过。我们在此中断，得到最大长度 $\text{MaxOffline} = \text{Length}$。

<br>
<b>最终答案：</b>

$\text{MinOnline} = N - \text{Length}$。


### CPP 代码实现

代码中，我们首先使用 `map` 将 $A$ 列表的 ID 映射到其排名（1到N），然后用这些排名构建 $B'$ 列表，最后通过线性扫描计算最长连续递增后缀的长度。

```cpp
#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

int calculate_max_offline(const vector<long long> &data_vector, int all_number) {
    if (all_number == 0) {
        return 0;
    }

    int length = 1;

    // 从倒数第二个元素开始向前扫描
    for (int i = all_number - 2; i >= 0; --i) {
        // 如果当前元素的 A 排名小于后面元素的 A 排名，则相对顺序未变
        if (data_vector[i] < data_vector[i + 1]) {
            length++;
        } else {
            // 相对顺序发生变化，中断
            break;
        }
    }

    // MaxOffline = length
    return all_number - length;
    
}

void solve() {

    int data_length;
    cin >> data_length;
    
    // 读取 A 列表
    vector<ll> a_list(data_length);
    // data_map: 存储 ID -> A 列表排名 (1-indexed)
    map<ll, ll> data_map;

    for (int i = 0; i < data_length; i++) {
        cin >> a_list[i];
        data_map[a_list[i]] = i + 1; // 排名从 1 开始
    }

    // 读取 B 列表，并将其原地转换为 B' (A 排名列表)
    vector<ll> b_prime_list(data_length);
    for (int i = 0; i < data_length; i++) {
        int id;
        cin >> id;
        b_prime_list[i] = data_map[id]; // 将 ID 替换为 A 排名
    }

    // 计算最少上线人数 = 总人数 - 最多没上线人数 (MaxOffline)
    cout << calculate_max_offline(b_prime_list, data_length) << '\n';

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
