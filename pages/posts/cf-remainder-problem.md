---
title: "CF题解——Remainder Problem"
date: "2026-05-27 22:41:09"
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
 - 根号分治
 - 数据结构
 - 前缀和
---

# F. Remainder Problem 解题思路

### 核心问题分析

题意非常干净利落：我们有一个长度 $500000$ 的数组 $a$，下标从 $1$ 到 $500000$，初始全是 $0$。然后要在线处理两种操作：

* `1 x y`：把 $a_x$ 加上 $y$（单点修改）；
* `2 x y`：求 $\sum_{i \in R(x,y)} a_i$，其中 $R(x,y)$ 是 $1 \sim 500000$ 里**模 $x$ 余 $y$** 的那些下标。

换句话说，第二种询问要的是 $a_y + a_{y+x} + a_{y+2x} + \dots$ 这样一条等差数列上所有元素的和（首项是 $y$，公差是 $x$）。

数据范围 $q \le 500000$，值域 $N = 500000$。先掂量一下两种朴素做法：

* 如果对每个询问都老老实实从 $y$ 开始、步长 $x$ 一路加过去，单次复杂度是 $O(N/x)$。当 $x$ 很小（比如 $x = 1$）时，一次就是 $5 \times 10^5$ 次加法，$q$ 个这种询问直接 $2.5 \times 10^{11}$，原地爆炸。
* 反过来，如果我们想"预存好每个 $(x, y)$ 的答案"，那修改操作 `1 x y` 一来，得更新所有模数 $x$ 下 $x$ 的归属——而模数有 $5 \times 10^5$ 种，单次修改又爆炸了。

两条路各走极端都死。一个走"询问慢"，一个走"修改慢"。**那能不能让它俩各管一段、井水不犯河水？** 这就是根号分治的味道了。

### 1. 一道分水岭：以 $\sqrt{N}$ 为界把模数劈成两半

核心 trick 就一句话：设一个阈值 $B$，把模数 $x$ 分成"小模数 $x \le B$"和"大模数 $x > B$"两类，**用完全不同的策略各自伺候**。

为什么 $\sqrt{N}$ 这个分水岭是黄金分割点？我们逐项算一下两类的开销：

* **大模数 $x > B$**：直接暴力跳。等差数列 $y, y+x, y+2x, \dots$ 在 $[1, N]$ 内最多有 $\lceil N/x \rceil$ 项，因为 $x > B$，所以一次询问最多跳 $O(N/B)$ 步。
* **小模数 $x \le B$**：我们提前把答案都存好。开一个二维数组 `ans[x][r]`，表示"模数为 $x$、余数为 $r$ 的那一坨下标，当前的元素之和"。每次修改 `1 x y`，只需要对所有 $x \le B$ 的模数，把这个下标归到对应余数桶里更新一下，单次修改是 $O(B)$；而小模数的询问就退化成 $O(1)$ 直接查表。

于是修改的代价是 $O(B)$，大模数询问的代价是 $O(N/B)$。两者相加，当 $B \approx \sqrt{N} \approx 707$ 时取到最优。这位 AC 老哥取的阈值是 $B = 450$（略微偏向让"小模数预处理桶"更紧凑、`ans` 数组开 $1000 \times 1000$ 刚好兜住），实测在 4s 时限内丝毫不影响通过。

### 2. 修改操作：一次更新喂饱所有小模数桶

来看修改那段，它干了两件事：

```cpp
if (ob == 1) {
    nums[x] += y;
    for (int i = 1; i <= 450; i++) {
        ans[i][x % i] += y;
    }
}
```

第一行 `nums[x] += y` 维护的是**真实数组**——这是给大模数询问暴力跳用的原始数据。第二行那个循环才是根号分治的精髓：对每一个小模数 $i \in [1, 450]$，这个下标 $x$ 在模 $i$ 意义下落在余数 $x \bmod i$ 这个桶里，所以把对应的 `ans[i][x % i]` 加上 $y$ 即可。

注意这里 `ans` 数组开成了 $1000 \times 1000$，第一维装模数（用到 $450$），第二维装余数（余数严格小于模数，所以也不超过 $450$），完全够用。单次修改就是这个长度 $450$ 的循环，$O(B)$ 妥妥的。

### 3. 询问操作：看模数大小走两条岔路

询问就是上面那盘棋的"收割时刻"，根据 $x$ 的大小走两条完全不同的路：

```cpp
} else {
    if (x <= 450) {
        cout << ans[x][y] << endl;
    } else {
        int res = 0;
        for (int i = y; i <= 500000; i += x) {
            res += nums[i];
        }
        cout << res << endl;
    }
}
```

* **小模数 $x \le 450$**：答案我们早在修改时就一笔一笔攒进 `ans[x][y]` 里了，直接 $O(1)$ 报出来，无脑得很。
* **大模数 $x > 450$**：从余数 $y$ 出发，步长 $x$ 在 $nums$ 上一路跳到 $500000$，把沿途的值累加。因为 $x > 450$，最多跳 $500000 / 450 \approx 1111$ 步，单次询问 $O(N/B)$。

两条路恰好互补：小模数怕暴力跳得慢（步多），我们就预存；大模数怕预存占空间又拖修改，我们就暴力跳（步少）。各取所长，皆大欢喜。

### 4. 复杂度结算

把账算清楚：每次修改 $O(B)$，每次询问最坏 $O(N/B)$。$q$ 个操作总复杂度是

$$ O\!\left(q \cdot \left(B + \frac{N}{B}\right)\right) $$

当 $B = \Theta(\sqrt{N})$ 时括号里取到最小值 $\Theta(\sqrt{N})$，于是整体是

$$ O\!\left(q\sqrt{N}\right) \approx 5\times 10^5 \times 707 \approx 3.5\times 10^8 $$

看着吓人，但这是纯加法、访存又连续（cache 友好），配上 4s 的宽松时限，跑起来轻轻松松。根号分治这套"用空间换平衡、把极端拉回中庸"的思想，在这道题上展现得淋漓尽致——记住这个 $B + N/B$ 的对勾函数，以后碰到"修改快 vs 询问快二选一"的窘境，它能包打天下。

### CPP 代码实现

```cpp
// F. Remainder Problem

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

    vector<int> nums(500010);
    vector<vector<int>> ans(1000, vector<int>(1000));
    int n;
    cin >> n;
    while (n--) {
        int ob, x, y;
        cin >> ob >> x >> y;
        if (ob == 1) {
            nums[x] += y;
            for (int i = 1; i <= 450; i++) {
                ans[i][x % i] += y;
            }
        } else {
            if (x <= 450) {
                cout << ans[x][y] << endl;
            } else {
                int res = 0;
                for (int i = y; i <= 500000; i += x) {
                    res += nums[i];
                }
                cout << res << endl;
            }
        }
    }
    
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
