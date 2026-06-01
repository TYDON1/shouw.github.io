---
title: "CF题解——Present"
date: "2026-05-30 21:42:11"
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
 - 位运算
 - 二分
 - 排序
---

# B. Present 解题思路

### 核心问题分析

题意干净得不能再干净：给你一个长度为 $n$ 的数组 $a$，让你求**所有两两之和的异或**

$$ \bigoplus_{1 \le i < j \le n} (a_i + a_j) $$

也就是把 $\binom{n}{2}$ 个无序对的和全部异或起来，输出这个值。

数据范围是 $n \le 4\times 10^5$，$a_i \le 10^7$。两两配对一共有大约 $8\times 10^{10}$ 对，**直接枚举所有对当场去世**。但是注意到异或是逐位独立的——异或结果的第 $i$ 位，只取决于有多少个对的和在第 $i$ 位上是 $1$。如果这样的对数是**偶数**，异或抵消，第 $i$ 位就是 $0$；如果是**奇数**，第 $i$ 位就是 $1$。

所以问题瞬间被拆成了 $26$ 个独立的小问题（$a_i \le 10^7 < 2^{24}$，两数之和 $< 2^{25}$，枚举到第 $25$ 位足矣）：**对每一位，求出有多少个对的和在这一位上是 $1$，看它的奇偶。** 突破口就在这儿。

### 1. 只看低位：第 $k$ 位的事，跟高位一毛钱关系都没有

要判断 $a_i + a_j$ 的第 $i$ 位（这里复用源码的循环变量 $i$ 表示当前位）是不是 $1$，我们其实**完全不关心它高于第 $i$ 位的部分**。加法的进位只会从低位往高位传，高位的值传不回来。

于是对当前正在处理的第 $i$ 位，我们把每个数都对 $2^{i+1}$ 取模，只保留它的最低 $i+1$ 位：

```cpp
for (int j = 1; j <= n; ++j) {
    b[j] = a[j] % (1LL << (i + 1));
}
sort(all(b));
```

取模之后每个 $b_j \in [0, 2^{i+1})$，因此任意两数之和 $b_i + b_j \in [0, 2^{i+2} - 2]$。我们只在这个被砍短的世界里数对子，对第 $i$ 位的真实情况**丝毫不影响**——因为更高的位本来就被加法的进位"隔离"在外面了。

### 2. 第 $i$ 位为 $1$ 的和长什么样？两段区间一网打尽

现在 $s = b_i + b_j$ 落在 $[0, 2^{i+2}-2]$ 里，我们要问：$s$ 的第 $i$ 位什么时候是 $1$？

把 $s$ 按第 $i$ 位为 $1$ 来枚举它可能的取值区间。第 $i$ 位是 $1$，意味着 $s$ 写成二进制时那一位点亮，对应到数值上就是两段连续区间：

$$ s \in [\,2^i,\ 2^{i+1}-1\,] \quad\text{或}\quad s \in [\,3\cdot 2^i,\ 2^{i+2}-2\,] $$

第一段是"第 $i$ 位是 $1$、第 $i+1$ 位是 $0$"（数值在 $2^i$ 到 $2^{i+1}-1$）；第二段是"第 $i$ 位是 $1$、第 $i+1$ 位也是 $1$"（数值从 $3\cdot 2^i$ 起，上界卡在和的最大可能值 $2^{i+2}-2$）。由于和最大不超过 $2^{i+2}-2$，更高的位根本到不了，这两段就把"第 $i$ 位为 $1$"的情况收得严严实实。

对应到代码里那行漂亮的异或：

```cpp
int cnt = tp(1LL << i, (1LL << (i + 1)) - 1) ^ tp(3LL << i, (1LL << (i + 2)) - 2);
if (cnt) {
    ans |= 1LL << i;
}
```

`tp(x, y)` 返回的是"和落在 $[x,y]$ 内的对数的奇偶"。两段区间各自数一遍奇偶，再异或起来，得到的就是"第 $i$ 位为 $1$ 的对数的总奇偶"。是奇数（结果为 $1$）就把答案的第 $i$ 位点亮。

### 3. `tp` 函数：排序 + 双指针，数出落在区间里的对数

`tp(x, y)` 要数的是有多少个**无序对** $(i, j)$ 满足 $b_i + b_j \in [x, y]$。$b$ 已经排好序，这就是经典的双指针套路：

```cpp
auto tp = [&] (int x, int y) -> int {
    if (x > y) return 0;
    int num = 0;
    for (int i = n, l = 1, r = 1; i >= 1; --i) {
        while (l <= n && b[i] + b[l] < x) l++;
        while (r <= n && b[i] + b[r] <= y) r++;
        num += r - l - (l <= i && i < r);;
    }
    return num >> 1 & 1;
};
```

我们让外层固定一个 $b_i$（从大到小扫），用两个指针找出"能和 $b_i$ 凑出和在 $[x,y]$ 范围内"的那一段 $b$：

* `l` 是第一个使 $b_i + b_l \ge x$ 的位置（再小和就低于下界了）；
* `r` 是第一个使 $b_i + b_r > y$ 的位置（即合法区间的右开端点）。

于是与 $b_i$ 搭配合法的下标区间是 $[l, r)$，里面有 $r - l$ 个。这里有个精妙的细节：随着外层 $i$ 从 $n$ 递减、$b_i$ 单调变小，要凑够下界 $x$ 需要更大的搭档，所以 $l$、$r$ 这两个指针**全程只增不减**，整轮均摊下来是 $O(n)$ 的，不会退化。

`- (l <= i && i < r)` 这一手是**剔除自己跟自己配对**的情形：如果下标 $i$ 本身就落在合法区间 $[l, r)$ 里，说明 $b_i + b_i$ 也被算进去了，但我们只要 $i \ne j$ 的对，得减掉它。

最后注意：上面这样数，每个无序对 $(i, j)$ 会在"外层取 $i$"和"外层取 $j$"时**各被统计一次**，所以 `num` 是真实对数的两倍。`num >> 1` 还原成无序对数，再 `& 1` 取奇偶返回。整个 `tp` 是一趟 $O(n)$ 的扫描（外加输入已排序）。

### 4. 把账算清楚：总复杂度

外层枚举 $26$ 个位，每个位要：对 $b$ 数组取模重填（$O(n)$）、排序（$O(n\log n)$）、跑两次 $O(n)$ 的 `tp`。所以每位的瓶颈是那次排序，总复杂度

$$ O\big(26 \cdot n \log n\big) $$

$n = 4\times 10^5$ 时，$26 \cdot n\log n$ 大约是 $4\times 10^8$ 量级，常数小、$3$ 秒时限，稳稳通过。整个思路的灵魂就是：**异或逐位独立 → 每位只看低位 → 取模后排序数对的奇偶**，环环相扣，一气呵成。

### CPP 代码实现

```cpp
// B. Present

#include <bits/stdc++.h>
#include <ext/pb_ds/assoc_container.hpp>
#include <ext/pb_ds/tree_policy.hpp>
#define lg(x) (63 - __builtin_clzll(x))
#define all(x) (x).begin(), (x).end()
#define low_bit(x) ((x) & (-x))
#define pb push_back
#define db long double
#define int long long
#define sz(x) (int)x.size()
#define endl "\n"

using namespace std;
using namespace __gnu_pbds;

struct custom_hash {
    static uint64_t splitmix64(uint64_t x) {
        x += 0x9e3779b97f4a7c15;
        x = (x ^ (x >> 30)) * 0xbf58476d1ce4e5b9;
        x = (x ^ (x >> 27)) * 0x94d049bb133111eb;
        return x ^ (x >> 31);
    }
    size_t operator()(uint64_t x) const {
        static const uint64_t FIXED_RANDOM = chrono::steady_clock::now().time_since_epoch().count();
        return splitmix64(x + FIXED_RANDOM);
    }
};

template<typename K, typename V> 
using hash_map = gp_hash_table<K, V, custom_hash>;
template<typename T> 
using ordered_set = tree<T, null_type, less<T>, rb_tree_tag, tree_order_statistics_node_update>;
template<typename T> 
using ordered_multiset = tree<T, null_type, less_equal<T>, rb_tree_tag, tree_order_statistics_node_update>;

void solve() {

    int n;
    cin >> n;
    vector<int> a(n + 1);
    for (int i = 1; i <= n; ++i) cin >> a[i];
    vector<int> b(n + 1);
    int ans = 0;
    
    auto tp = [&] (int x, int y) -> int {
        if (x > y) return 0;
        int num = 0;
        for (int i = n, l = 1, r = 1; i >= 1; --i) {
            while (l <= n && b[i] + b[l] < x) l++;
            while (r <= n && b[i] + b[r] <= y) r++;
            num += r - l - (l <= i && i < r);;
        }
        return num >> 1 & 1;
    };

    for (int i = 0; i <= 25; ++i) {
        for (int j = 1; j <= n; ++j) {
            b[j] = a[j] % (1LL << (i + 1));
        }
        sort(all(b));
        int cnt = tp(1LL << i, (1LL << (i + 1)) - 1) ^ tp(3LL << i, (1LL << (i + 2)) - 2);
        if (cnt) {
            ans |= 1LL << i;
        }
    }
    cout << ans << endl;

}

signed main() {

    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    // cin >> t;

    while (t--) {
        solve();
    }
    
}
```
