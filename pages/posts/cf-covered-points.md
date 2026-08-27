---
title: "CF题解——Covered Points"
date: "2026-06-07 22:05:19"
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
 - 计算几何
 - 数论
 - 容斥
---

# E. Covered Points 解题思路

### 核心问题分析

题意：平面上给定 $n$ 条线段，端点都是整点。**保证没有两条线段共线**。问：一共有多少个**不同的整点**被至少一条线段覆盖。

$n \le 1000$，坐标绝对值 $\le 10^6$，时限 $2$ 秒。

$n$ 只有 $1000$，这个范围明晃晃地在说"$O(n^2)$ 甚至 $O(n^2 \log n)$ 都随便跑"。所以思路方向很清楚：**先分别数，再去重**。

### 1. 一条线段上有多少个整点？

这是一个经典结论。线段从 $(x_1, y_1)$ 到 $(x_2, y_2)$，令 $dx = |x_1 - x_2|$，$dy = |y_1 - y_2|$，那么线段上的整点个数是

$$ \gcd(dx, dy) + 1 $$

为什么？把方向向量 $(x_2 - x_1,\ y_2 - y_1)$ 除以 $g = \gcd(dx, dy)$，得到的**本原向量**（primitive vector）是能落在这条线段上的最小整点步长。从起点出发，走 $g$ 步刚好到终点，算上起点一共 $g+1$ 个整点。

```cpp
int dx = abs(a[i].x_1 - a[i].x_2);
int dy = abs(a[i].y_1 - a[i].y_2);
ans += gcd(dx, dy) + 1;
```

先把所有线段的整点数加起来，得到一个**带重复**的总数。剩下的工作就是把多算的部分减掉。

### 2. 重复只可能发生在交点上，而且每对线段最多交一次

关键的题目条件来了：**没有两条线段共线**。

这意味着任意两条线段最多只有**一个**公共点（如果共线，公共部分可能是一整段，那就彻底没法数了——题目替我们排除了这种噩梦）。

那么一个被 $k$ 条线段共同覆盖的整点，在第一步的总和里被数了 $k$ 次，我们需要减掉 $k - 1$。

怎么优雅地实现"减掉 $k-1$"？用一个非常好用的技巧：**按顺序处理，每个点只在它第一次出现之后的每一次重复出现时被扣掉一次**。

具体地，从 $i = 1$ 到 $n$ 依次处理每条线段，对当前的 $i$：

- 枚举所有 $j < i$，求线段 $i$ 与线段 $j$ 的交点，如果是整点且落在两条线段范围内，就丢进一个 `set`；
- 处理完所有 $j$ 后，`ans -= set.size()`。

为什么这样正好扣了 $k-1$ 次？考虑某个被 $k$ 条线段（下标从小到大是 $i_1 < i_2 < \dots < i_k$）覆盖的整点 $P$：

- 处理 $i_1$ 时，没有更小的下标含有 $P$，所以 $P$ 不进 set，不扣；
- 处理 $i_2, i_3, \dots, i_k$ 时，$P$ 都能在 $j < i$ 里找到至少一个含它的线段，所以每次都进 set——**但因为 set 会去重，每一轮只贡献 $1$**。

总共扣了 $k - 1$ 次，正好把重复消干净。这里的 `set` 是不可或缺的：如果 $P$ 同时被 $i$ 之前的好几条线段覆盖，不去重就会重复扣。

```cpp
set<pair<int, int>> points;
for (int j = 1; j < i; j++) {
    // 求交点，判合法，插入 points
}
ans -= sz(points);
```

### 3. 两条线段的交点：一般式 + 克拉默法则

把每条线段所在的直线写成一般式 $Ax + By + C = 0$。由两个端点可以直接得到系数：

$$ A = y_2 - y_1, \qquad B = x_1 - x_2, \qquad C = x_2 y_1 - x_1 y_2 $$

（可以代入验证 $(x_1, y_1)$ 和 $(x_2, y_2)$ 都满足方程。）

联立两条直线，用克拉默法则解：

$$ D = A_i B_j - B_i A_j,\qquad x = \frac{B_i C_j - B_j C_i}{D},\qquad y = \frac{A_j C_i - A_i C_j}{D} $$

$D = 0$ 意味着两条直线平行（因为题目保证不共线，所以平行就是真的没有交点），直接跳过。

**我们只关心整点交点**，所以两个分子必须都能被 $D$ 整除，否则这个交点是分数坐标，压根不会跟"整点计数"扯上关系，直接忽略。这一步的好处是完全避开了浮点数——整道题从头到尾都是纯整数运算，没有任何精度问题。

```cpp
int D = line[i].A * line[j].B - line[i].B * line[j].A;
if (D == 0) continue;
int numX = line[i].B * line[j].C - line[j].B * line[i].C;
int numY = line[j].A * line[i].C - line[i].A * line[j].C;
if (numX % D == 0 && numY % D == 0) { ... }
```

### 4. 别忘了：直线的交点未必在线段上

上面解出来的是两条**直线**的交点，还得确认它确实落在两条**线段**内。因为交点必然在直线上，所以只需要检查它是否落在两条线段各自的**包围盒**里就够了：

```cpp
auto in_range = [&](int val, int v1, int v2) {
    return val >= min(v1, v2) && val <= max(v1, v2);
};
```

对 $X$ 和 $Y$、对线段 $i$ 和线段 $j$，四个判断全过才算数。

### 5. 溢出这件事得算一算

坐标到 $10^6$，那么 $|A|, |B| \le 2\times10^6$，$|C| = |x_2 y_1 - x_1 y_2| \le 2\times10^{12}$。分子里出现的乘积 $B_i C_j$ 量级是 $2\times10^6 \times 2\times10^{12} = 4\times10^{18}$，两项相减最坏到 $8\times10^{18}$——而 `long long` 的上界是约 $9.22\times10^{18}$。

**卡得相当紧，但是刚好不爆**。这种题一定要动手估一下量级，不然写完发现莫名其妙 WA 会很崩溃。

### 6. 复杂度

外层枚举 $i$，内层枚举 $j < i$，每对做 $O(1)$ 的交点计算，插入 set 是 $O(\log n)$。总计

$$ O(n^2 \log n) $$

$n = 1000$ 时约 $5\times10^5 \times 10 = 5\times10^6$，$2$ 秒轻松通过。

回头看这道 $*2400$ 的题，它把三样东西缝在了一起：$\gcd$ 数整点的数论结论、克拉默法则的整数解判定、以及"按下标顺序扣重"的容斥小技巧。单看每一件都不算难，但**"没有两条线段共线"这个条件必须被用上**——正是它保证了交点唯一，才让"每个重复点恰好扣 $k-1$ 次"这套逻辑成立。做几何题的时候，题面里那些看起来像废话的保证，往往才是整道题成立的地基。

### CPP 代码实现

```cpp
// E. Covered Points

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

struct Coord {
    int x_1, y_1, x_2, y_2;
};

struct G_Line {
    int A, B, C;    // Ax + By + C = 0
};

void solve() {

    int n;
    cin >> n;
    vector<Coord> a(n + 1);
    vector<G_Line> line(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i].x_1 >> a[i].y_1 >> a[i].x_2 >> a[i].y_2;

    for (int i = 1; i <= n; i++) {
        line[i].A = a[i].y_2 - a[i].y_1;
        line[i].B = a[i].x_1 - a[i].x_2;
        line[i].C = a[i].x_2 * a[i].y_1 - a[i].x_1 * a[i].y_2;
    }

    auto in_range = [&](int val, int v1, int v2) {
        return val >= min(v1, v2) && val <= max(v1, v2);
    };

    int ans = 0;
    for (int i = 1; i <= n; i++) {
        int dx = abs(a[i].x_1 - a[i].x_2);
        int dy = abs(a[i].y_1 - a[i].y_2);
        ans += gcd(dx, dy) + 1;

        set<pair<int, int>> points;
        for (int j = 1; j < i; j++) {
            int D = line[i].A * line[j].B - line[i].B * line[j].A;
            if (D == 0) continue;   // 平行（题目保证不共线）
            int numX = line[i].B * line[j].C - line[j].B * line[i].C;
            int numY = line[j].A * line[i].C - line[i].A * line[j].C;
            if (numX % D == 0 && numY % D == 0) {
                int X = numX / D;
                int Y = numY / D;
                if (in_range(X, a[i].x_1, a[i].x_2) && in_range(Y, a[i].y_1, a[i].y_2) &&
                    in_range(X, a[j].x_1, a[j].x_2) && in_range(Y, a[j].y_1, a[j].y_2)) {
                    points.insert({X, Y});
                }
            }
        }
        ans -= sz(points);
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
