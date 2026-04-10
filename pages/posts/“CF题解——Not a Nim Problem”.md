---
title: "CF题解——Not a Nim Problem"
date: "2026-04-11 17:42:26"
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
 - 博弈论
 - SG定理
 - 数论
 - 欧拉筛
---

# E. Not a Nim Problem 解题思路

### 核心问题分析

看到题目名字“不是一个 Nim 游戏”，但实际上这题就是一个披着数论外衣的 **Nim 游戏变种**。

规则是：从一堆数量为 $x$ 的石头中拿走 $y$ 个，必须满足 $\gcd(x, y) = 1$。
谁不能操作谁输，这是极其标准的**公平组合游戏（ICG）**。对付这种游戏，我们的终极核武器就是 **SG 定理（Sprague-Grundy Theorem）**。只要我们能算出每种石头数量 $x$ 对应的 $SG(x)$ 函数值，把所有堆的 $SG$ 值异或（XOR）起来：
* 异或和不为 $0$，先手（Alice）必胜。
* 异或和为 $0$，后手（Bob）必胜。

### 1. 抽丝剥茧：状态转移与 SG 值的规律

首先，理清转移状态。
假设我们从 $x$ 个石头里拿走 $y$ 个，剩下 $z$ 个。即 $z = x - y$。
题目要求 $\gcd(x, y) = 1$。根据辗转相除法的基本原理：$\gcd(x, y) = \gcd(x, x-y) = \gcd(x, z) = 1$。
**这意味着：一个状态 $x$，可以转移到任何满足 $z < x$ 且 $\gcd(x, z) = 1$ 的状态 $z$。**

SG 函数的定义是：$SG(x) = \text{mex}(\{SG(z) \mid z < x, \gcd(x, z) = 1\})$。
（`mex` 表示集合中未出现的最小非负整数）。

让我们来“手玩”一下前几个数字，找找规律：
* **偶数的逆袭**：如果 $x$ 是偶数，那么与它互质的 $z$ 必须是奇数。也就是说，**偶数只能转移到奇数状态**。如果我们假设所有偶数的 $SG$ 值为 $0$，那么奇数的 $SG$ 值肯定 $>0$，这就保证了偶数的转移集合里永远没有 $0$，它的 $\text{mex}$ 必然是 $0$！所以，**所有偶数的 $SG$ 值都是 0**。
* **特殊值 $1$**：$SG(1)$ 只能转移到 $0$。$SG(0) = 0$（因为偶数），所以 $SG(1) = \text{mex}(\{0\}) = 1$。
* **质数的攀升**：对于质数 $p$，它与所有小于它的正整数都互质。所以它可以转移到所有小于它的状态！
  * $SG(3)$：可以到 $1, 2$。对应的 SG 值是 $\{1, 0\}$，$\text{mex}$ 为 $2$。
  * $SG(5)$：可以到 $1, 2, 3, 4$。对应的 SG 值是 $\{1, 0, 2, 0\}$，$\text{mex}$ 为 $3$。
  * 以此类推，**第 $k$ 个奇数质数的 $SG$ 值就是 $k+1$**。

**顿悟时刻：奇合数怎么办？**
假设 $x$ 是一个奇合数，它的**最小质因数**是 $p$。
因为我们要找的转移状态 $z$ 必须满足 $\gcd(x, z) = 1$，所以 $z$ **绝对不能是 $p$ 的倍数**！
这意味着，从 $x$ 出发，我们**永远无法转移到**那些“最小质因数也是 $p$”的状态（因为那些状态都是 $p$ 的倍数）。
既然无法转移到它们，那么 $SG(p)$ 这个值在转移集合中就成了“缺失的最小项”。
因此得出终极结论：**一个奇合数 $x$ 的 $SG$ 值，等于它的最小质因数的 $SG$ 值！**

### 2. 算法实现：线性筛（欧拉筛）

总结一下我们推导出的牛逼规律：
1. 偶数的 $SG$ 值为 $0$。
2. $SG(1) = 1$。
3. 第 $k$ 个奇质数的 $SG$ 值为 $k+1$。
4. 奇合数的 $SG$ 值等于其**最小质因数**的 $SG$ 值。

题目中 $a_i \le 10^7$。要在极短的时间内求出 $10^7$ 范围内所有数字的最小质因数，这不就是**欧拉筛（线性筛）**的拿手好戏吗？
我们在跑欧拉筛的时候，内层循环 `i * p` 就是在利用质数 `p` 去筛掉合数，而且欧拉筛的精髓就在于**每个合数只会被它的最小质因数筛掉一次**！
这完美契合了我们的规律 4！我们只需要在筛的时候顺手赋值 `g[i * p] = g[p]` 即可。

### CPP 代码实现

```cpp
// E. Not a Nim Problem

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

const int MAXA = 10000005; // 值域 1e7
int g[MAXA];               // g 数组用来存储每个数字的 SG 值
vector<int> primes;        // 存储找出的奇质数

// 核心预处理：使用欧拉筛（线性筛）同时求出所有数的 SG 值
void cal() {
    g[1] = 1;         // 规律 2：SG(1) = 1
    int prime_idx = 1;// 奇质数的编号，从 1 开始（因为 1 给了数字 1）

    for (int i = 2; i < MAXA; i++) {
        // 规律 1：所有偶数的 SG 值均为 0
        if (i % 2 == 0) {
            g[i] = 0;
            continue;
        }

        // 如果 g[i] 还是 0，说明它是没被筛掉的数，即奇质数
        if (g[i] == 0) {
            prime_idx++;
            g[i] = prime_idx; // 规律 3：第 k 个奇质数的 SG 值为 k+1
            primes.push_back(i);
        }

        // 欧拉筛的标准内层循环，用当前数 i 去乘已有的质数 p
        for (int p : primes) {
            if (i * p >= MAXA) break;
            
            // 规律 4：合数的 SG 值等于其最小质因数 p 的 SG 值
            g[i * p] = g[p]; 
            
            // 欧拉筛的灵魂：保证每个合数只被其最小质因数筛掉
            if (i % p == 0) break;
        }
    }
}

void solve() {
    int n;
    cin >> n;
    int xor_sum = 0;
    
    // SG 定理应用：所有堆的 SG 值异或起来
    for (int i = 0; i < n; i++) {
        int a;
        cin >> a;
        xor_sum ^= g[a];
    }

    // 异或和不为 0，先手（Alice）必胜
    if (xor_sum != 0) {
        cout << "Alice" << endl;
    } else {
        cout << "Bob" << endl;
    }
}

signed main() {
    // 优化输入输出，竞技编程好习惯
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    // O(M) 预处理打表，极速跑过多组测试数据
    cal();

    int t;
    cin >> t;
    while (t--) {
        solve();
    }
}
```