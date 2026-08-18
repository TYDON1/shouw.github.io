---
title: "CF题解——Frog Jumping"
date: "2026-05-23 22:41:09"
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
 - 数论
 - 前缀和
---

# D. Frog Jumping 解题思路

### 核心问题分析

一只青蛙站在数轴的 $0$ 点，手里攥着两个正整数 $a$ 和 $b$。在位置 $k$，它可以跳到 $k+a$，也可以跳到 $k-b$。我们定义 $f(x)$ 为：在**全程不允许跳出 $[0,x]$ 这段区间**的前提下，青蛙从 $0$ 出发能触达的不同整数个数（注意是“能否到达”，不要求一趟跳完，反复横跳也算）。给定 $m$，要求

$$ \sum_{i=0}^{m} f(i) $$

数据范围是 $1 \le m \le 10^9$，$1 \le a,b \le 10^5$。$m$ 大到离谱，逐个去算 $f(i)$ 显然是送命。但 $a,b$ 很小——这就是突破口的味道：**$f(x)$ 不会一直“变着花样”地增长，迟早会进入一个干净的数论规律**。我们要做的就是抓住“小 $x$ 阶段”和“大 $x$ 阶段”这两段，分别用不同的武器收拾它们。

### 1. 大 $x$ 阶段：裴蜀定理一出，整个数轴瞬间通透

先看 $x$ 足够大的时候会发生什么。如果空间足够宽敞，青蛙能用 $+a$ 和 $-b$ 任意组合，能到达的位置就是所有形如 $pa - qb$（$p,q$ 为非负整数、且过程合法）的整数。由裴蜀定理，$a,b$ 的整数线性组合恰好是 $g = \gcd(a,b)$ 的倍数。所以**只要 $x$ 大到不会卡住青蛙的腾挪**，可达集合就是 $[0,x]$ 内所有 $g$ 的倍数：$0, g, 2g, \dots$，于是

$$ f(x) = \left\lfloor \frac{x}{g} \right\rfloor + 1 $$

那“足够大”到底是多大？代码给出的魔法阈值是

$$ T = a + b - g $$

当 $x \ge T$ 时，青蛙就有足够的“回旋余地”去把所有 $g$ 的倍数全部走遍，$f(x)$ 彻底退化成上面那个漂亮的闭式。这一段从 $T$ 一直延伸到 $m$，长度动辄上亿，绝不能逐个加，得用公式批量结算（见第 4 节）。

### 2. 小 $x$ 阶段：让青蛙自己“跑一圈”把答案抖出来

而当 $x < T$ 时，空间还不够大，可达集合是逐渐扩张的、不那么规律。这一段的 $x$ 至多只有 $T-1 = a+b-g-1 < a+b \le 2\times 10^5$ 个，规模很小，我们可以**老老实实把它模拟出来**。代码里限定了这段的上界：

```cpp
int limit = min(m, T - 1);
vector<int> count(limit + 1, 0);
```

关键问题是：一个点 $u$ 到底在 $x$ 取到多少的时候“第一次变得可达”？答案是——**取决于到达它的那条路径上，曾经踩过的最高点**。如果想摸到 $u$，路径上必经的最高位置是 $H$，那么必须 $x \ge H$ 这个点才被解锁。于是我们让青蛙按一条**固定的规范路线**把所有可达点遍历一遍，沿途记录“走到当前为止踩过的历史最高点 $H$”，那么每个点就在 $x = H$ 这一刻被点亮。

### 3. 规范贪心路线：能进就进，到顶才退

那条规范路线长这样——在位置 $u$：能往右就往右，逼到墙角再往左。具体地：

```cpp
while (true) {
    if (u < b) {
        u += a;
    } else {
        u -= b;
    }
    max_val = max(max_val, u);

    if (u == 0) break;

    if (max_val <= limit) {
        count[max_val]++;
    }
}
```

规则是：**当 $u < b$ 时执行 $+a$，否则执行 $-b$**。为什么这么走？因为 $u<b$ 意味着此刻没法安全地 $-b$（会跌破 $0$），那就只能往右冲；一旦 $u \ge b$，就先把欠的“左跳”还掉。这条路线会不重不漏地把一个周期里所有 $g$ 的倍数（落在 $[0, a+b-g)$ 区间内的那些）各访问一次，直到青蛙再次回到 $0$（`u == 0` 时 break）。

`max_val` 就是上文说的“历史最高点 $H$”，它单调不降。每当我们到达一个新点，它被解锁的临界正是当前的 `max_val`，于是 `count[max_val]++`——表示“当 $x$ 恰好等于 `max_val` 时，新增了一个可达点”。注意起点 $0$ 在循环外就被记了 `count[0] = 1`（$x=0$ 时青蛙原地不动，$f(0)=1$）。

有了 `count[]`，含义就清晰了：`count[i]` 是“恰好在 $x=i$ 时新解锁的点数”。那么对它做**前缀和**，得到的 `cur` 就是 $f(i)$ 本身——窗口放宽到 $i$ 时累计可达的点数；再把 `cur` 一路累加，就是这段的 $\sum f(i)$：

```cpp
int ans = 0;
int cur = 0;

for (int i = 0; i <= limit; i++) {
    cur += count[i];
    ans += cur;
}
```

一个前缀和套一个前缀和，干净利落。这段循环只跑 $O(a+b)$ 次，毫无压力。

### 4. 大 $x$ 阶段的批量结算：$\sum \lfloor x/g \rfloor$ 的整除求和术

现在回头收拾第 1 节留下的大尾巴。当 $m \ge T$ 时，$x$ 从 $T$ 到 $m$ 这一整段每个 $f(x) = \lfloor x/g \rfloor + 1$，要求的是

$$ \sum_{x=T}^{m} \left( \left\lfloor \frac{x}{g} \right\rfloor + 1 \right) = \left( \sum_{x=T}^{m} \left\lfloor \frac{x}{g} \right\rfloor \right) + (m - T + 1) $$

那个 $+1$ 累加起来就是项数 `terms = R - L + 1`，无脑加上即可。麻烦的是前面那坨 $\sum \lfloor x/g \rfloor$。代码用了个辅助函数 `sum_floor(R, g)`，它算的是从 $0$ 到 $R$ 的前缀和 $\sum_{x=0}^{R} \lfloor x/g \rfloor$，再用差分 `sum_floor(R) - sum_floor(L-1)` 取出 $[L, R]$ 这一段：

```cpp
int sum_floor(int R, int g) {
    if (R < 0) return 0;
    int q = R / g;
    int rem = R % g;
    int pairs = (q % 2 == 0) ? (q / 2) * (q - 1) : q * ((q - 1) / 2);
    return g * pairs + q * (rem + 1);
}
```

它的原理是：在 $[0,R]$ 里，$\lfloor x/g \rfloor$ 取值为 $0$ 的有 $g$ 个、取值为 $1$ 的有 $g$ 个……一直到取值为 $q-1$ 的有 $g$ 个，最后取值为 $q$ 的有 $rem+1$ 个（这里 $q = \lfloor R/g \rfloor$，$rem = R \bmod g$）。所以

$$ \sum_{x=0}^{R} \left\lfloor \frac{x}{g} \right\rfloor = g\cdot\big(0+1+\cdots+(q-1)\big) + q\cdot(rem+1) = g\cdot\frac{q(q-1)}{2} + q\,(rem+1) $$

代码里那个 `pairs` 就是在算 $\dfrac{q(q-1)}{2}$，但它特意按 $q$ 的奇偶**先约分再相乘**——$q$ 是偶数就用 $(q/2)\cdot(q-1)$，$q$ 是奇数就用 $q\cdot\big((q-1)/2\big)$——目的是在 `long long` 范围内尽量压住中间结果，防止溢出（毕竟 $q$ 能到 $10^9$ 量级）。这是个很地道的小细节。

最后把两段合并：

```cpp
if (m >= T) {
    int L = T;
    int R = m;
    int sum_div = sum_floor(R, g) - sum_floor(L - 1, g);
    int terms = R - L + 1;

    ans += sum_div + terms;
}
```

整体复杂度就是模拟那一圈的 $O(a+b)$ 加上整除求和的 $O(1)$，写成

$$ O(a + b) $$

面对 $m \le 10^9$ 也好、$a,b \le 10^5$ 也罢，全程稳如老狗。我们拿样例 `7 5 3` 验一下：$g=1$，$T=5+3-1=7$，小段把 $[0,6]$ 的 $f$ 累出来，大段补上 $x=7$，最终输出 $19$，对得上！

### CPP 代码实现

```cpp
// D. Frog Jumping

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

int sum_floor(int R, int g) {
    if (R < 0) return 0;
    int q = R / g;
    int rem = R % g;
    int pairs = (q % 2 == 0) ? (q / 2) * (q - 1) : q * ((q - 1) / 2);
    return g * pairs + q * (rem + 1);
}

void solve() {
    int m, a, b;
    cin >> m >> a >> b;

    int g = gcd(a, b);
    int T = a + b - g;

    int limit = min(m, T - 1);
    vector<int> count(limit + 1, 0);

    int u = 0;
    int max_val = 0;
    count[0] = 1;

    while (true) {
        if (u < b) {
            u += a;
        } else {
            u -= b;
        }
        max_val = max(max_val, u);

        if (u == 0) break;

        if (max_val <= limit) {
            count[max_val]++;
        }
    }

    int ans = 0;
    int cur = 0;

    for (int i = 0; i <= limit; i++) {
        cur += count[i];
        ans += cur;
    }

    if (m >= T) {
        int L = T;
        int R = m;
        int sum_div = sum_floor(R, g) - sum_floor(L - 1, g);
        int terms = R - L + 1;

        ans += sum_div + terms;
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
