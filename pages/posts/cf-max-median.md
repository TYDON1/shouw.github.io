---
title: "CF题解——Max Median"
date: "2026-06-02 21:37:12"
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
 - 二分
 - 前缀和
---

# D. Max Median 解题思路

### 核心问题分析

题意很短：给定一个长度为 $n$ 的数组 $a$，在所有**长度至少为 $k$** 的连续子数组里，找出**中位数最大**的那个，输出这个最大中位数。

这里的中位数定义要看清楚：长度为 $len$ 的数组排好序后，取第 $\lfloor \frac{len+1}{2} \rfloor$ 个元素（也就是偏左的那个中位数）。比如 $median([1,2,3,4]) = 2$，$median([2,1,2,1]) = 1$。

数据范围 $1 \le k \le n \le 2 \cdot 10^5$，$1 \le a_i \le n$。如果我们老老实实枚举每个子数组再求中位数，那是 $O(n^2 \log n)$ 起步，妥妥超时。突破口在于：**“最大中位数”这种问题，几乎是在你脸上写着“二分答案”四个大字。**

### 1. 顿悟时刻：与其求中位数，不如猜中位数

直接求“最大中位数”很难，因为中位数这玩意儿不好直接优化。但是反过来——我们去**猜**一个值 $mid$，然后问自己一个判定性的问题：

> 存不存在一个长度 $\ge k$ 的子数组，它的中位数 $\ge mid$？

这个问题如果能回答，那答案就好办了：因为“中位数 $\ge mid$ 是否可行”关于 $mid$ 是**单调**的——$mid$ 越小越容易满足，$mid$ 越大越难满足。于是直接在值域 $[1, n]$ 上二分这个 $mid$，找最大的、仍然可行的那个值即可。代码里这一段就是典型的二分答案框架：

```cpp
int l = 1, r = n, ans = 1;
while (l <= r) {
    int mid = l + (r - l) / 2;
    if (check(mid)) {
        ans = mid;
        l = mid + 1;
    } else {
        r = mid - 1;
    }
}
```

`check(mid)` 返回真就说明 $mid$ 还能更大，往右收；否则往左收。整个二分是 $O(\log n)$ 层。

### 2. 关键转化：把“中位数 ≥ mid”翻译成 +1/-1 的游戏

现在所有的难度都压到了 `check(mid)` 上。怎么判断“某个子数组的中位数 $\ge mid$”？

这里有个特别漂亮的小技巧。我们对原数组做一次**重新染色**：

$$ b_i = \begin{cases} +1, & a_i \ge mid \\ -1, & a_i < mid \end{cases} $$

代码里就是这一行：

```cpp
b[i] = (a[i] >= mid ? 1 : -1);
```

为什么这么干？想一想：一个子数组的中位数（偏左中位数）$\ge mid$，**等价于**这个子数组里 “$\ge mid$ 的元素个数”严格多于 “$< mid$ 的元素个数”。

简单验证一下：长度为 $len$，中位数在第 $\lfloor \frac{len+1}{2} \rfloor$ 位。要让这一位 $\ge mid$，就得保证排序后从它往右（含它）那一段全是 $\ge mid$ 的，这段的长度是 $len - \lfloor \frac{len+1}{2} \rfloor + 1 = \lceil \frac{len+1}{2} \rceil > \frac{len}{2}$。也就是说 $\ge mid$ 的个数必须**超过一半**。

而一旦超过一半，把每个 $\ge mid$ 记成 $+1$、每个 $< mid$ 记成 $-1$，这个子数组的 $b$ 之和就一定是**正数**！反之亦然。于是问题被彻底翻译成：

> 存不存在一个长度 $\ge k$ 的子数组，使得 $b$ 的区间和 $> 0$？

中位数的烦恼一下子蒸发了，只剩下纯粹的“区间和”问题。

### 3. 前缀和 + 前缀最小值：一次扫描搞定最大区间和

区间和，第一反应当然是前缀和。令 $pref_i = b_1 + b_2 + \cdots + b_i$（$pref_0 = 0$），那么子数组 $a[l..r]$ 的 $b$ 之和就是 $pref_r - pref_{l-1}$。

```cpp
for (int i = 1; i <= n; i++) {
    b[i] = (a[i] >= mid ? 1 : -1);
    pref[i] = pref[i - 1] + b[i];
}
```

我们要找一对 $(l, r)$ 满足两个条件：长度 $r - l + 1 \ge k$，且 $pref_r - pref_{l-1} > 0$。

固定右端点 $r = i$，长度 $\ge k$ 意味着左端点 $l - 1$ 最大只能取到 $i - k$（也就是 $l \le i - k + 1$）。要让区间和最大，我们当然希望被减掉的那个 $pref_{l-1}$ **越小越好**。所以只要维护“到目前为止、所有合法左端点里 $pref$ 的最小值”，再拿当前 $pref_i$ 一减，看看是不是正的就行：

```cpp
int min_pref = 1e9;
for (int i = k; i <= n; i++) {
    min_pref = min(min_pref, pref[i - k]);

    if (pref[i] > min_pref) {
        return true;
    }
}
return false;
```

注意这里指针的精妙之处：$i$ 从 $k$ 开始扫，每到一个 $i$，就先把 $pref_{i-k}$ 纳入候选最小值池子（这恰好对应“长度刚好为 $k$”的左端点），然后再用 $pref_i$ 去比。这样 `min_pref` 里装的永远是“与当前 $i$ 距离 $\ge k$ 的所有 $pref$ 的最小值”，一个都不会漏、一个也不会越界。一旦 $pref_i > min\_pref$，说明找到了一个和为正、长度 $\ge k$ 的子数组，立刻返回真。

这个 `check` 是一遍线性扫描，$O(n)$。

### 4. 复杂度收尾

整体结构就是：外层二分答案 $O(\log n)$，每次 `check` 做一遍 $O(n)$ 的前缀和扫描，总复杂度

$$ O(n \log n) $$

对 $n \le 2 \cdot 10^5$ 来说轻轻松松，$2$ 秒时限里跑得飞起。

回头看这道 $*2100$ 的题，真正的灵魂只有两步：**“最大中位数”想到二分答案**，再把**“中位数 $\ge mid$” 转成 “+1/-1 区间和为正”**。一旦这层窗户纸捅破，剩下的前缀和 + 前缀最小值简直就是无脑送分。漂亮的转化往往就是这样，把一个看着吓人的问题，揉成一个你初学时就会的小水题。

### CPP 代码实现

```cpp
// G. Call During the Journey

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

    int n, k;
    cin >> n >> k;
    vector<int> a(n + 1);
    for (int i = 1; i <= n; i++) {
        cin >> a[i];
    }

    auto check = [&](int mid) {

        vector<int> b(n + 1, 0);
        vector<int> pref(n + 1, 0);

        for (int i = 1; i <= n; i++) {
            b[i] = (a[i] >= mid ? 1 : -1);
            pref[i] = pref[i - 1] + b[i];
        }

        int min_pref = 1e9;
        for (int i = k; i <= n; i++) {
            min_pref = min(min_pref, pref[i - k]);

            if (pref[i] > min_pref) {
                return true;
            }
        }
        return false;
    };

    int l = 1, r = n, ans = 1;
    while (l <= r) {
        int mid = l + (r - l) / 2;
        if (check(mid)) {
            ans = mid;
            l = mid + 1;
        } else {
            r = mid - 1;
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
