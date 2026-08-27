---
title: "CF题解——Game of the Year"
date: "2026-06-14 20:51:36"
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
 - 数论
 - 差分
 - 调和级数
---

# E. Game of the Year 解题思路

### 核心问题分析

题意：有 $n$ 个 boss。给定一个参数 $k$，两个人轮流打：Monocarp 打 $k$ 次，Polycarp 打 $k$ 次，Monocarp 再打 $k$ 次……如此往复。Monocarp 会在他自己的第 $a_i$ 次尝试上打死第 $i$ 个 boss，Polycarp 则是在他的第 $b_i$ 次尝试上。谁先打死就算谁的，然后进入下一个 boss，双方计数器清零。

问：$k$ 从 $1$ 到 $n$，有哪些值能让 Monocarp 打死**全部** boss。

多组数据，$\sum n \le 2\times10^5$，时限 $2$ 秒。

### 1. 先把"谁先打死"翻译成一个不等式

固定 $k$，看单个 boss。Monocarp 的第 $a_i$ 次尝试落在他的第几**轮**里？每轮 $k$ 次，所以是第

$$ \left\lceil \frac{a_i}{k} \right\rceil $$

轮。Polycarp 同理是第 $\lceil b_i / k \rceil$ 轮。而每一轮里 **Monocarp 先手**。所以：

$$ \text{Monocarp 拿下第 } i \text{ 个 boss} \iff \left\lceil \frac{a_i}{k} \right\rceil \le \left\lceil \frac{b_i}{k} \right\rceil $$

（轮数相同时，Monocarp 因为先手赢；轮数更小当然更赢。）

### 2. 只有 $a_i > b_i$ 的 boss 才值得操心

如果 $a_i \le b_i$，那 $\lceil a_i/k \rceil \le \lceil b_i/k \rceil$ 对**任何** $k$ 都成立，这个 boss 白送。

如果 $a_i > b_i$，那必然有 $\lceil a_i/k \rceil \ge \lceil b_i/k \rceil$，所以上面的条件退化成**必须取等**：

$$ \left\lceil \frac{a_i}{k} \right\rceil = \left\lceil \frac{b_i}{k} \right\rceil $$

也就是说，$a_i$ 和 $b_i$ 必须落在**同一个长度为 $k$ 的块**里。

### 3. 再翻译一次：块的边界就是 $k$ 的倍数

函数 $\lceil x/k \rceil$ 在 $x \in ((m-1)k,\ mk]$ 上取常值 $m$，块的分界线正好是 $k$ 的倍数。所以"$a_i$ 与 $b_i$ 同块"等价于：

> 区间 $[b_i,\ a_i - 1]$ 中**不存在** $k$ 的倍数。

（如果存在一个 $k$ 的倍数 $j$ 满足 $b_i \le j < a_i$，那 $b_i$ 在 $j$ 这条分界线的左侧或线上、$a_i$ 在右侧，两者必然被切开。）

于是整道题变成了一个非常清爽的形式：

> 每个满足 $a_i > b_i$ 的 boss 贡献一个**禁区** $[b_i,\ a_i - 1]$。
> $k$ 合法 $\iff$ $k, 2k, 3k, \dots$ 里没有任何一个数落进任何禁区。

### 4. 把所有禁区拍扁成一个数组

禁区可能有 $n$ 个，一个个查太慢。但我们其实不关心"是哪个禁区"，只关心"某个位置**是不是**被至少一个禁区盖住"。这就是标准的**差分 + 前缀和**：

```cpp
for (int i = 1; i <= n; i++) {
    if (min_b[i] <= n) {
        cnt[min_b[i]]++;
        cnt[i]--;          // 区间 [min_b[i], i-1] 整体 +1
    }
}
for (int i = 1; i <= n; i++) cnt[i] += cnt[i - 1];
```

这里还顺手做了一步压缩：对于**同一个 $a$ 值**，只有 $b$ 最小的那个禁区才有意义（它包含了其它所有同 $a$ 值的禁区）：

```cpp
vector<int> min_b(n + 1, n + 1);
for (int i = 1; i <= n; i++) {
    if (a[i] > b[i]) min_b[a[i]] = min(min_b[a[i]], b[i]);
}
```

这一步不是必须的（不压缩直接对每个 $i$ 做差分也对），但它把禁区的数量从 $n$ 个降到最多 $n$ 个**互不相同的右端点**，让后面的循环写起来干净不少。

前缀和跑完之后，`cnt[j] > 0` 就表示位置 $j$ 被至少一个禁区盖住，也就是 $j$ **不能**是 $k$ 的倍数。

### 5. 枚举倍数：调和级数救场

最后一步暴力得理直气壮：

```cpp
for (int k = 1; k <= n; k++) {
    bool ok = true;
    for (int j = k; j <= n; j += k) {
        if (cnt[j] > 0) { ok = false; break; }
    }
    if (ok) ans.pb(k);
}
```

看起来像双重循环，其实总操作数是

$$ \frac{n}{1} + \frac{n}{2} + \frac{n}{3} + \cdots + \frac{n}{n} = n H_n = O(n \log n) $$

这就是**调和级数**求和。$n = 2\times10^5$ 时大约 $2.4\times10^6$ 次，眨眼就过。

顺带一提，$j$ 只需要枚举到 $n$：因为 $a_i \le n$，所有禁区都落在 $[1, n-1]$ 内，超过 $n$ 的倍数不可能踩雷。

### 6. 复杂度

预处理差分 $O(n)$，枚举倍数 $O(n \log n)$，总计

$$ O(n \log n) $$

$\sum n \le 2\times10^5$，$2$ 秒时限绰绰有余。

回头看这道 $*2300$ 的题，题面裹了一层"打 boss 轮流出手"的皮，剥开之后是一串非常干净的等价变形：**先手规则 $\to$ 向上取整的不等式 $\to$ 同块 $\to$ 区间内无 $k$ 的倍数**。每一步都不难，但必须一步步推到底才能露出"差分 + 调和级数枚举倍数"这个标准工具箱。这类题的手感就是：不要急着想算法，先把题意榨干成一个纯数学条件，剩下的往往是模板。

### CPP 代码实现

```cpp
// E. Game of the Year

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

    int n;
    cin >> n;
    vector<int> a(n + 1), b(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];
    for (int i = 1; i <= n; i++) cin >> b[i];

    // 只有 a[i] > b[i] 才产生禁区；同一个 a 值只留最小的 b
    vector<int> min_b(n + 1, n + 1);
    for (int i = 1; i <= n; i++) {
        if (a[i] > b[i]) {
            min_b[a[i]] = min(min_b[a[i]], b[i]);
        }
    }

    // 差分标记禁区 [min_b[i], i - 1]
    vector<int> cnt(n + 2, 0);
    for (int i = 1; i <= n; i++) {
        if (min_b[i] <= n) {
            cnt[min_b[i]]++;
            cnt[i]--;
        }
    }
    for (int i = 1; i <= n; i++) cnt[i] += cnt[i - 1];

    vector<int> ans;
    for (int k = 1; k <= n; k++) {
        bool ok = true;
        for (int j = k; j <= n; j += k) {
            if (cnt[j] > 0) {
                ok = false;
                break;
            }
        }
        if (ok) ans.pb(k);
    }

    cout << sz(ans) << endl;
    for (int i = 0; i < sz(ans); i++) {
        cout << ans[i] << ' ';
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
