---
title: "CF题解——Maximum Value"
date: "2026-05-16 21:42:09"
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
 - 数学
 - 二分
 - 调和级数
---

# B. Maximum Value 解题思路

### 核心问题分析

题意干净得不能再干净：给一个长度为 $n$ 的序列 $a$，要从里面挑两个数 $a_i, a_j$（下标可以相同），在满足 $a_i \ge a_j$ 的前提下，最大化取模的结果

$$ \max_{a_i \ge a_j}\ a_i \bmod a_j $$

数据范围是 $n \le 2 \times 10^5$，但是真正的命门在值域上：$1 \le a_i \le 10^6$。直接 $O(n^2)$ 枚举所有数对，$4 \times 10^{10}$ 次，想都别想。看到“值域小、要取模、要枚举倍数”这几个关键词凑在一起，脑子里应该立刻蹦出四个字——**调和级数**。

### 1. 把取模翻译成“区间里挑最大”

我们先盯死被除数 $a_j$（代码里循环变量叫 `it`）。固定了除数 $a_j$ 之后，$a_i \bmod a_j$ 这个值随 $a_i$ 怎么变？

把整个值域按 $a_j$ 切成一段一段：

$$ [a_j, 2a_j),\ [2a_j, 3a_j),\ [3a_j, 4a_j),\ \dots $$

在第 $k$ 段 $[k\cdot a_j,\ (k+1)a_j)$ 里，任意一个 $a_i$ 模 $a_j$ 的结果就是 $a_i - k\cdot a_j$。也就是说——**在同一段里，$a_i$ 越大，余数越大**！余数和 $a_i$ 在段内是严格线性递增的。

所以对每一段，我们只关心一件事：**这一段里实际存在的最大的那个 $a_i$ 是谁**。把它模一下 $a_j$，就是这一段能贡献的最大余数。把所有段、所有 $a_j$ 的贡献取个 max，就是答案。是不是一下子就清爽了？

### 2. 调和级数：为什么枚举倍数不会爆

有同学要担心了：对每个 $a_j$ 都把值域切成那么多段，会不会很慢？

来算笔账。对一个具体的 $a_j$，段数大约是 $\frac{10^6}{a_j}$ 个。把所有去重后的 $a_j$ 加起来，总段数大约是

$$ \sum_{a_j} \frac{V}{a_j} \le V \sum_{d=1}^{V} \frac{1}{d} = V\cdot H(V) = O(V \log V) $$

这就是经典的**调和级数求和**，$\sum_{d=1}^{V} \frac{1}{d} \approx \ln V$。$V = 10^6$ 时，$V\log V$ 大约是 $2 \times 10^7$ 量级，外加每段一次二分的 $\log$，完全在一秒内能跑完。注意代码开头先 `sort` 再 `unique` 去了重——这一步很关键，重复的 $a_j$ 没必要重复枚举，去重之后 $a_j$ 的种类数被压住了，调和级数的复杂度才稳。

```cpp
sort(all(a));
a.erase(unique(all(a)),a.end());
```

### 3. 用二分精准捞出“每段的最大 $a_i$”

知道了要找每段的最大 $a_i$，怎么找？数组已经排好序了，**二分**包打天下。

看代码这个精妙的小动作：

```cpp
int temp = it;
while (temp <= MAXN) {
    temp += it;
    int now = *prev(lower_bound(all(a), temp));
    max_n = max(max_n, now % it);
}
```

这里 `it` 是 $a_j$。循环里 `temp` 从 $2a_j$ 开始，每次加 $a_j$，依次取到每一段的**右端点** $2a_j, 3a_j, 4a_j, \dots$。对于右端点 `temp`：

* `lower_bound(all(a), temp)` 找到第一个 $\ge temp$ 的位置；
* `prev(...)` 往前退一格，拿到的就是**严格小于 `temp` 的那个最大的 $a_i$**——恰好是落在 $[\,\cdot,\ temp)$ 这一段（及更左）里的最大值；
* `now % it` 即是这个 $a_i$ 对 $a_j$ 的余数，拿去更新答案。

为什么 `temp` 从 $2a_j$ 起步（先 `temp += it` 再用）？因为 $[a_j, 2a_j)$ 这一段里所有数模 $a_j$ 的结果，最大的也就出现在右端点 $2a_j$ 的左边，正好被第一次循环的 `prev(lower_bound(..., 2a_j))` 捞到。每个段右端点都查一次最大值，所有段扫完，这个 $a_j$ 的最优贡献就稳稳到手了。

> 小俏皮提醒：`prev(begin())` 是会出事的。但这里因为 `temp` 至少是 $2a_j \ge 2$，而数组里一定有 $a_j$ 本身（它就是 `it`），所以 `lower_bound` 绝不会落在最开头，`prev` 永远有得退，丝毫不影响正确性。

### 4. 边界与初值的小心思

* `max_n` 初值设成 $0$。因为完全可以取 $a_i = a_j$，此时 $a_i \bmod a_j = 0$，答案天然下界就是 $0$（比如全部数都相等的退化情况，输出就是 $0$）。
* `while (temp <= MAXN)` 用 `MAXN = 1e6 + 10` 卡住值域上界，保证 `temp` 不会无限加下去，段数被值域天花板掐断。
* 拿样例 `3 4 5` 走一遍：去重还是 `{3,4,5}`。除数 $3$ 时，段右端点 $6$，`prev(lower_bound(...,6))` 拿到 $5$，$5\bmod 3 = 2$；除数 $4$、$5$ 同理算下来都不超过 $2$。最终答案 $2$，和样例对上了。

整体复杂度 $O(V \log V)$（值域调和级数求和），排序去重的 $O(n \log n)$ 完全被它盖过，对本题数据轻松通关。

### CPP 代码实现

```cpp
// B. Maximum Value

#include <bits/stdc++.h>
#define lg(x) (63 - __builtin_clzll(x))
#define all(x) (x).begin(), (x).end()
#define low_bit(x) ((x) & (-x))
#define pb push_back
#define db long double
// #define int long long
#define sz(x) (int)x.size()
#define endl "\n"

using namespace std;

const int MAXN = 1e6 + 10;

void solve() {

    int n;
    cin >> n;
    vector<int> a(n);
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }
    sort(all(a));
    a.erase(unique(all(a)),a.end());
    int max_n = 0;
    for (auto it : a) {
        int temp = it;
        while (temp <= MAXN) {
            temp += it;
            int now = *prev(lower_bound(all(a), temp));
            max_n = max(max_n, now % it);
        }
    }
    cout << max_n << endl;
    
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
