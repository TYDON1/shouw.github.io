---
title: "CF题解——OpenStreetMap"
date: "2026-05-26 21:42:09"
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
 - 数据结构
 - 单调队列
 - 滑动窗口
---

# E. OpenStreetMap 解题思路

### 核心问题分析

题意翻译成人话非常直白：给一张 $n \times m$ 的高度矩阵 $h$，再给定一个固定大小 $a \times b$ 的“屏幕窗口”。这个窗口可以放在矩阵里任何一个合法位置——左上角 $(i, j)$ 满足 $1 \le i \le n - a + 1$、$1 \le j \le m - b + 1$。对于**每一个**这样的窗口位置，我们要找出窗口里 $a \times b$ 个格子的**最小高度**，然后把所有窗口的这个最小值**全部加起来**输出。

矩阵本身不直接给你，而是用一个线性同余式现场生成：

$$ g_i = (g_{i-1} \cdot x + y) \bmod z, \qquad h_{i,j} = g_{(i-1) \cdot m + j - 1} $$

也就是按行优先把 $g$ 序列一个一个填进矩阵。这一步代码里就是老老实实两层循环边填边递推，没什么花头。

真正的难点在数据范围：$n, m \le 3000$，矩阵最多 $9 \times 10^6$ 个格子，窗口个数也是 $O(nm)$ 量级。如果对每个窗口都暴力扫一遍 $a \times b$ 个格子，那就是 $O(nm \cdot ab)$，妥妥的天文数字。我们要的是一个**整体 $O(nm)$** 的做法——这正是**二维滑动窗口最小值**的主场。

### 1. 降维打击：把二维最小值拆成“先压行，再压列”

二维窗口最小值看着吓人，但有一个非常优雅的拆解：一个 $a \times b$ 的矩形最小值，等于它内部那 $a$ 行、每行各取**长度为 $b$ 的横向最小值**之后，再对这 $a$ 个行最小值取一次**纵向最小值**。

换句话说，我们分两步走：

* **第一步（压行）**：对每一行单独做一次“长度为 $b$ 的一维滑动窗口最小值”，得到一个新数组 `min_row`。`min_row[i][j]` 的含义是：第 $i$ 行里，从第 $j$ 列开始、横向连续 $b$ 个格子的最小高度。这一步把原矩阵的列数从 $m$ 压成了 $m - b + 1$。
* **第二步（压列）**：在 `min_row` 上，对每一**列**再做一次“长度为 $a$ 的一维滑动窗口最小值”。因为 `min_row[i][j]` 已经替我们把横向的 $b$ 个格子吃掉了，现在纵向再连续吃 $a$ 个，合起来恰好就是那个 $a \times b$ 矩形的最小值！

每一步都是若干次一维滑窗，单次 $O(\text{长度})$，两步加起来就是 $O(nm)$。漂亮，问题就剩下“怎么把一维滑动窗口最小值写对”了。

### 2. 单调队列：滑动窗口最小值的不二法门

一维滑动窗口最小值的标配工具就是**单调队列**。代码里用一个普通的 `vector<int> q` 当作双端队列，配上手写的 `head`（队头下标）和 `tail`（队尾下标），队列里**存的是下标**，并且保证这些下标对应的值**单调递增**。

来看压行那段的核心循环：

```cpp
for (int j = 0; j < m; j++) {
    while (head < tail && q[head] <= j - b) {
        head++;
    }
    while (head < tail && h[i][q[tail - 1]] >= h[i][j]) {
        tail--;
    }
    q[tail++] = j;
    if (j >= b - 1) {
        min_row[i][j - b + 1] = h[i][q[head]];
    }
}
```

逐句拆开看，这三件事环环相扣：

1. **踢掉过期的队头**：`q[head] <= j - b` 说明队头那个下标已经滑出了当前以 $j$ 结尾、长度为 $b$ 的窗口（窗口的左边界是 $j - b + 1$），把它 `head++` 弹走。
2. **维护单调性**：新来的 $h[i][j]$ 如果比队尾的值还小（或相等），那队尾那些“又大又靠左”的家伙以后永远不可能成为最小值了——它们既不比新值小，又比新值先过期，留着是纯累赘，统统 `tail--` 弹掉。
3. **新元素入队**：`q[tail++] = j`，把当前下标塞到队尾。

每次循环结束后，队头 `q[head]` 永远指向当前窗口里的**最小值下标**。当 $j \ge b - 1$（窗口第一次填满）时，就可以把 $h[i][q[head]]$ 记录为以 $j - b + 1$ 为起点的那个窗口的行最小值。

注意一个小细节：`q` 数组开成 `max(n, m) + 5` 大小，是因为它要被**复用**——压行时按列长 $m$ 用，压列时按行长 $n$ 用，取个较大者就够装下了。每开始处理新的一行/一列，`head` 和 `tail` 都重新清零，干干净净从头来过。

### 3. 第二刀落下：在 min_row 上沿列再切一次

压完行之后，`min_row` 是一个 $n \times (m - b + 1)$ 的矩阵。第二步要对它的**每一列** $j$ 做长度为 $a$ 的纵向滑窗，逻辑和第一步几乎一模一样，只是把“行内沿列扫”换成了“列内沿行扫”：

```cpp
for (int j = 0; j <= m - b; j++) {
    int head = 0, tail = 0;
    for (int i = 0; i < n; i++) {
        while (head < tail && q[head] <= i - a) {
            head++;
        }
        while (head < tail && min_row[q[tail - 1]][j] >= min_row[i][j]) {
            tail--;
        }
        q[tail++] = i;
        if (i >= a - 1) {
            ans += min_row[q[head]][j];
        }
    }
}
```

这里队列里存的是**行下标 $i$**，比较的值是 `min_row[i][j]`，过期条件换成 `q[head] <= i - a`（窗口高度为 $a$）。当 $i \ge a - 1$ 时，`min_row[q[head]][j]` 就是这一列里从第 $i - a + 1$ 行开始、纵向 $a$ 个行最小值的最小者——也就是左上角落在 $(i - a + 1, j)$ 的那个 $a \times b$ 窗口的整体最小值。直接 `ans +=` 累加进答案就行，连中间数组都不用再开。

外层枚举列 $j$ 的范围是 $0 \le j \le m - b$，恰好覆盖所有合法的横向起点；内层 $i$ 跑完整个 $n$ 行。每个合法窗口被不重不漏地数到一次，求和即为最终答案。

### 4. 别忘了 long long：和能大到离谱

这题还有个朴素但要命的坑：高度 $h_{i,j}$ 可以接近 $z \le 10^9$，而窗口数量是 $O(nm) \approx 9 \times 10^6$ 个，最坏情况下答案能逼近 $9 \times 10^{15}$，`int` 早就爆穿了。所幸代码顶上一句 `#define int long long` 直接把全场的 `int` 全换成了 64 位，`ans`、`h`、`g` 乃至 LCG 递推中间量统统安全——这种“无脑全开 long long”的写法在这种到处是大数求和的题里属实是包打天下，省心。

整体复杂度：生成矩阵 $O(nm)$，压行 $O(nm)$，压列 $O(nm)$，合计

$$ O(nm) = O(3000 \times 3000) = O(9 \times 10^6) $$

两秒时限下轻轻松松。我们拿样例 `3 4 2 1 / 1 2 3 59` 验一下：生成出矩阵后，每个 $2 \times 1$ 窗口取最小再求和，结果正是 $111$，完美对上。

### CPP 代码实现

```cpp
// E. OpenStreetMap

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

    int n, m, a, b;
    cin >> n >> m >> a >> b;
    int g0, x, y, z;
    cin >> g0 >> x >> y >> z;

    vector<vector<int>> h(n, vector<int>(m));
    int g = g0;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
            h[i][j] = g;
            g = (g * x + y) % z;
        }
    }

    vector<vector<int>> min_row(n, vector<int>(m - b + 1));
    vector<int> q(max(n, m) + 5);

    for (int i = 0; i < n; i++) {
        int head = 0, tail = 0;
        for (int j = 0; j < m; j++) {
            while (head < tail && q[head] <= j - b) {
                head++;
            }
            while (head < tail && h[i][q[tail - 1]] >= h[i][j]) {
                tail--;
            }
            q[tail++] = j;
            if (j >= b - 1) {
                min_row[i][j - b + 1] = h[i][q[head]];
            }
        }
    }

    int ans = 0;

    for (int j = 0; j <= m - b; j++) {
        int head = 0, tail = 0;
        for (int i = 0; i < n; i++) {
            while (head < tail && q[head] <= i - a) {
                head++;
            }
            while (head < tail && min_row[q[tail - 1]][j] >= min_row[i][j]) {
                tail--;
            }
            q[tail++] = i;
            if (i >= a - 1) {
                ans += min_row[q[head]][j];
            }
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
