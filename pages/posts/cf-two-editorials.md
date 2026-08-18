---
title: "CF题解——Two Editorials"
date: "2026-05-07 21:18:43"
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
 - 排序
 - 前缀和
---

# E. Two Editorials 解题思路

### 核心问题分析

题意拆开来其实很干净：有 $n$ 道题、$m$ 个观众。两位作者各自要讲**一段长度恰好为 $k$ 的连续区间**（两人独立选，区间可以重合、相交、完全错开）。第 $i$ 个观众只关心 $[l_i, r_i]$ 这段题，并且他只会去听**对他覆盖更多**的那一位作者，收益记为 $a_i$（即这位观众的区间与某一位作者区间的最大交集长度）。要让 $\sum a_i$ 最大。

每个观众都是“二选一”，而且选的是覆盖更长的那位。直接枚举两位作者的区间是 $O(n^2)$ 种组合，再对每种组合扫一遍 $m$ 个人，妥妥的 $O(n^2 m)$ 爆炸。我们需要一个能把“两位作者”解耦开的观察。

### 1. 关键引理：按区间中点排序后，最优解一定是“一刀切”

先抛出这道题的灵魂结论：

> **存在一种最优方案，使得：把所有观众按区间中点（等价地按 $l_i + r_i$）排序后，一位作者负责其中一个前缀，另一位作者负责剩下的后缀。**

为什么按中点排序就能“一刀两断”？用**交换论证**：假设最优方案里，作者 A 的窗口偏左、作者 B 的窗口偏右。如果存在两个观众 $i, j$，$i$ 的中点更靠左却被分给了右边的 B，$j$ 的中点更靠右却被分给了左边的 A——那么把这两个人的归属互换，覆盖长度的总和**不会变差**（靠左的人跟着靠左的窗口、靠右的人跟着靠右的窗口，只会更优或持平）。不断做这种交换，最终一定能整理成“左边一坨人归 A、右边一坨人归 B”的形态。

这条引理直接把问题降维：我们**不再需要关心两个窗口的相对位置**，只需要枚举那个分界点，让前一半人去找他们的最优单窗口、后一半人去找他们的最优单窗口。

### 2. 子问题：一群人共用一个窗口，最优收益是多少？

固定一批观众，只放一位作者的长度为 $k$ 的窗口 $[x, x+k-1]$，这批人的总收益是

$$ f(x) = \sum_{i} \max\big(0,\ \min(x+k-1, r_i) - \max(x, l_i) + 1\big) $$

也就是每个人的区间与窗口的交集长度之和。代码里那个 `cal(a, b, c, d)` 算的就是两段闭区间 $[a,b]$ 与 $[c,d]$ 的交集长度：

```cpp
int cal(int a, int b, int c, int d) {
    return max(0LL, min(b, d) - max(a, c) + 1);
}
```

我们要的是 $\max_x f(x)$。注意 $n, m \le 2000$，所以对一批人，直接枚举窗口左端点 $x$（共 $O(n)$ 个），每加进来一个人就把他对所有 $x$ 的贡献累进 `sum[x]` 数组里，是完全可以接受的。

### 3. 前缀 / 后缀双扫描：一次 $O(nm)$ 全搞定

有了引理，我们只要预处理两样东西：

* `pref[i]`：把排序后**前 $i$ 个**观众都交给一位作者时，能取到的最优单窗口收益。
* `suff[i]`：把排序后**第 $i$ 到第 $m$ 个**观众都交给一位作者时的最优单窗口收益。

求 `pref` 时，我们从前往后一个一个把观众“塞进”同一个 `sum[]` 桶里——`sum[x]` 始终维护“当前这批人在窗口起点 $x$ 处的总覆盖”，每塞一个人就顺手刷新一遍最大值，记进 `pref[i]`。`suff` 同理从后往前扫一遍（记得把 `sum[]` 清零再来）。

最后枚举分界点 $i$，答案就是

$$ \text{ans} = \max_{0 \le i \le m}\big(\text{pref}[i] + \text{suff}[i+1]\big) $$

含义是：前 $i$ 个人归作者一、后面的人归作者二。两位作者各自独立地选自己的最优窗口，互不干扰——这正是引理赋予我们的自由。

整体复杂度 $O(nm)$，$2000 \times 2000 = 4 \times 10^6$，轻松通过。

### CPP 代码实现

```cpp
// E. Two Editorials

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

struct Person {
    int l, r;
    bool operator<(const Person& other) const {
        return l + r < other.l + other.r;
    }
};

int cal(int a, int b, int c, int d) {
    return max(0LL, min(b, d) - max(a, c) + 1);
}

void solve() {

    int n, m, k;
    cin >> n >> m >> k;

    vector<Person> p(m);
    for (int i = 0; i < m; ++i) {
        cin >> p[i].l >> p[i].r;
    }

    sort(all(p));

    vector<int> pref(m + 1);
    vector<int> sum(n + 1);
    for (int i = 0; i < m; ++i) {
        int max_val = 0;
        for (int x = 1; x <= n - k + 1; ++x) {
            sum[x] += cal(x, x + k - 1, p[i].l, p[i].r);
            max_val = max(max_val, sum[x]);
        }
        pref[i + 1] = max_val;
    }
    vector<int> suff(m + 2, 0);
    fill(all(sum), 0);
    for (int i = m - 1; i >= 0; --i) {
        int max_val = 0;
        for (int x = 1; x <= n - k + 1; ++x) {
            sum[x] += cal(x, x + k - 1, p[i].l, p[i].r);
            max_val = max(max_val, sum[x]);
        }
        suff[i + 1] = max_val;
    }
    int ans = 0;
    for (int i = 0; i <= m; ++i) {
        ans = max(ans, pref[i] + suff[i + 1]);
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
