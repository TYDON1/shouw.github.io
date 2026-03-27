---
title: "CF题解——Calendar Ambiguity"
date: "2026-03-27 18:24:46"
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
---

# E. Calendar Ambiguity 解题思路

### 核心问题分析

大家遇到这种跟日期、星期几相关的题目，第一反应可能是头皮发麻。题目中说：一个外星历法，一年有 $m$ 个月，每个月 $d$ 天，一周有 $w$ 天。我们要在合理的范围内找出一对 $(x, y)$ 且 $x < y$，使得“第 $y$ 个月的第 $x$ 天”和“第 $x$ 个月的第 $y$ 天”是星期几完全一样。

面对这种题，千万不要去试图写什么大模拟！我们的首要任务是：**把题目的文字游戏翻译成纯粹的数学公式。**

### 1. 翻译题意：化为同余方程

首先，怎么算某一天是这一年的第几天？
对于“第 $M$ 个月的第 $D$ 天”，因为前面有 $M-1$ 个完整的月（每个月 $d$ 天），再加上当月的 $D-1$ 天，所以距离这一年第一天的天数差是：
$$ \text{Days} = (M - 1)d + D - 1 $$

题目要求“第 $y$ 个月的第 $x$ 天”和“第 $x$ 个月的第 $y$ 天”星期相同。这就意味着，**这两天距离第一天的天数之差，必须是一周天数 $w$ 的整数倍**。
我们把上面的公式代入并相减：
$$ [ (y-1)d + x - 1 ] - [ (x-1)d + y - 1 ] \equiv 0 \pmod w $$

把式子展开并合并同类项：
$$ yd - d + x - xd + d - y \equiv 0 \pmod w $$
$$ (y - x)d - (y - x) \equiv 0 \pmod w $$
**$$ (y - x)(d - 1) \equiv 0 \pmod w $$**

你看！原本绕来绕去的文字，瞬间变成了一个极其清爽的同余式！

### 2. 数论降维：找出“步长”

上面的式子告诉我们，$(y - x)$ 乘以 $(d - 1)$ 必须是 $w$ 的倍数。
既然 $(d - 1)$ 里面本身就可能自带了 $w$ 的一些因子（即它们的最大公约数 $\gcd(d-1, w)$），那么 $(y - x)$ 只需要“补齐” $w$ 剩下的那部分因子就可以了。

因此，$(y - x)$ 必须是下面这个数字的整数倍：
$$ \text{step} = \frac{w}{\gcd(d-1, w)} $$
我们把这个必须的差值称为“步长” $step$。也就是说，$y - x = k \times step \ (k \ge 1)$。

### 3. 边界确定与等差数列求和

理清了差值的规律，我们还需要确定 $x$ 和 $y$ 的取值范围。
因为 $x$ 和 $y$ 既要当作“月份”，又要当作“天数”，所以它们**必须同时不超过 $m$ 和 $d$**。
换句话说，它们的上限 $n = \min(m, d)$。题目又要求 $1 \le x < y \le n$。

现在问题被彻底剥离成了一道小学奥数题：
**在 $1$ 到 $n$ 的数字中，任选两个数，使它们的差是 $step$ 的倍数，共有多少对？**

我们按照倍数 $k$ 来分类讨论：
* 当相差 $1 \times step$ 时，满足条件的有 $(1, 1+step), (2, 2+step) \dots$，一共 $n - step$ 对。
* 当相差 $2 \times step$ 时，一共 $n - 2 \times step$ 对。
* $\dots$
* 当相差 $k \times step$ 时，一共 $n - k \times step$ 对。

其中，最大的倍数 $k = \lfloor \frac{n - 1}{step} \rfloor$。

将上面所有的对数加起来：
$$ \sum_{i=1}^{k} (n - i \times step) = k \times n - step \times \frac{k(k+1)}{2} $$

直接套用等差数列求和公式！算法的时间复杂度从原本可能的 $O(N)$ 甚至 $O(N^2)$，瞬间降维打击到了 **$O(1)$**（求 $\gcd$ 的对数时间几乎可以忽略）。这才是算法最迷人的地方！

### CPP 代码实现

```cpp
// E. Calendar Ambiguity

#include <bits/stdc++.h>
#define lg(x) (63 - __builtin_clzll(x))
#define all(x) (x).begin(), (x).end()
#define low_bit(x) ((x) & (-x))
#define pb push_back
#define db long double
#define int long long
#define endl "\n"

using namespace std;

void solve() {
    int m, d, w;
    cin >> m >> d >> w;
    
    // x 和 y 既是月份又是天数，所以最大不能超过 m 和 d 的较小值
    int n = min(m, d);
    
    // 获取 (d-1) 和 w 的最大公约数
    // 这是为了算出 y-x 需要补齐的最小因子
    int g = gcd(d - 1, w);
    
    // step 就是 y 和 x 之间必须满足的最小差值（步长）
    int step = w / g;
    
    // k 表示在 1 到 n 的范围内，最大的差值能包含多少个 step
    // n-1 是因为差值最大只能是 n-1（比如从 1 到 n）
    int k = (n - 1) / step;
    
    // 如果 k <= 0，说明哪怕是最短的步长都超过了 n 的范围，没有合法的对数
    if (k <= 0) {
        cout << 0 << endl;
        return;
    }
    
    // 根据等差数列求和公式：
    // sum = (n - step) + (n - 2*step) + ... + (n - k*step)
    // 提取 n 得到 k * n
    // 提取 step 得到 step * (1 + 2 + ... + k) = step * (k * (k + 1) / 2)
    int ans = k * n - step * (k * (k + 1) / 2);
    
    cout << ans << endl;
}

signed main() {
    // 优化输入输出，竞技编程好习惯
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    cin >> t; 
    
    while (t--) {
        solve();
    }
}
```