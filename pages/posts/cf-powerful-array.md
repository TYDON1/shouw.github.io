---
title: "CF题解——Powerful array"
date: "2026-05-13 20:47:12"
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
 - 莫队
 - 数据结构
---

# D. Powerful array 解题思路

### 核心问题分析

题意非常直白：给定一个长度为 $n$ 的正整数数组 $a_1, a_2, \dots, a_n$。对任意一个子区间 $[l, r]$，对每个正整数 $s$ 设 $K_s$ 为 $s$ 在这个子区间里出现的次数，那么这个区间的「能量值（power）」定义为

$$ \sum_{s} K_s^2 \cdot s $$

我们要回答 $t$ 个这样的区间询问。数据范围是 $1 \le n, t \le 2 \times 10^5$，$1 \le a_i \le 10^6$。

注意这玩意儿**不支持快速合并**：你知道 $[l, r]$ 的能量值，并不能 $O(1)$ 推出 $[l, r+1]$ 的能量值……等等，真的不能吗？其实是可以的！关键就在这个平方上——只要我们手里攥着每个数当前的出现次数 $K_s$，往区间里**加一个数 / 删一个数**时，对应的那一项 $K_s^2 \cdot s$ 是能 $O(1)$ 修正的。能 $O(1)$ 增删、又是离线一堆区间询问、还没有修改——这不就是**莫队算法**最爱吃的那一口嘛！可以呼应一下作者之前写过的 [[莫队模版]]。

### 1. 平方差的魔法：增删一个数只需 $O(1)$

莫队的灵魂在于「指针挪动时维护一个全局答案」。我们维护一个桶 `cnt[val]` 表示当前区间里 `val` 出现了几次，再维护当前区间的能量值 `current_res`。

现在思考：当区间里再塞进一个值为 $v$ 的数时，$v$ 的出现次数从 $k$ 变成 $k+1$，能量值里属于 $v$ 的那一项从 $k^2 v$ 变成 $(k+1)^2 v$。增量是多少？

$$ (k+1)^2 v - k^2 v = (2k + 1)\,v $$

漂亮！这就是代码里 `add` 干的事——**先用旧的 `cnt[val]` 算增量，再把计数 `++`**：

```cpp
void add(int idx) {
    int val = a[idx];
    current_res += (2 * cnt[val] + 1) * val;
    cnt[val]++;
}
```

删除是它严格的逆操作。次数从 $k$ 降到 $k-1$，减少量是 $k^2 v - (k-1)^2 v = (2k-1)\,v$。所以删除时要**先把计数 `--`，再用新的 `cnt[val]`（也就是 $k-1$）算减量**，正好对上 $(2(k-1)+1)\,v = (2k-1)\,v$：

```cpp
void del(int idx) {
    int val = a[idx];
    cnt[val]--;
    current_res -= (2 * cnt[val] + 1) * val;
}
```

`add` 和 `del` 里那个 `+1` / `-1` 的次序千万别搞反，这是莫队增删对称性的精髓所在——一加一减必须是完美的撤销。

### 2. 分块与排序：让指针别乱跑

莫队的核心思想是：把所有询问**离线**下来，按一个精心设计的顺序重新排序，使得相邻两个询问的左右端点挪动总量尽可能小，从而把暴力的 $O(nt)$ 摊成 $O((n+t)\sqrt{n})$。

排序规则是经典的「按左端点所在块为第一关键字，按右端点为第二关键字」。块长取多少？代码里没有无脑用 $\sqrt n$，而是用了理论最优的块长公式：

```cpp
block_size = max(1.0, (double)n / sqrt(max(1.0, (double)q * 2.0 / 3.0)));
```

这是莫队块长的「细究版」——当询问数 $q$ 和数组长度 $n$ 不匹配时，取 $\text{block} \approx \dfrac{n}{\sqrt{2q/3}}$ 能让左右指针的总移动次数更均衡，常数更小。背后是对 $O(n^2/B + qB)$ 这个移动代价的求导取极值，不是拍脑袋拍出来的。

### 3. 奇偶优化：右指针的「回头路」也别浪费

光按块排还不够秀。注意 `Query` 的比较函数里藏了一个小心机：

```cpp
bool operator<(const Query& other) const {
    if (block != other.block) return block < other.block;
    return (block & 1) ? (r < other.r) : (r > other.r);
}
```

同一块内，**偶数块的右端点升序、奇数块的右端点降序**。这就是著名的「奇偶优化」（莫队的回字形 / 蛇形排序）。

为什么有用？普通莫队里，右指针在每个块内都从左扫到右，到下一个块又得「啪」地弹回最左边重新扫，这一下弹回去的代价被白白浪费了。而奇偶排序让右指针在相邻两块间走出一条**蛇形回路**：这块从左扫到右，下一块顺势从右扫回左，省掉那一次大跳。实测能砍掉将近一半的指针移动常数，对 $2 \times 10^5$ 这种卡常规模相当救命。

### 4. 四个 while：指针挪动的标准姿势

排好序后就是莫队万年不变的四连 `while`：

```cpp
for (auto& qry : queries) {
    while (curL > qry.l) add(--curL);
    while (curR < qry.r) add(++curR);
    while (curL < qry.l) del(curL++);
    while (curR > qry.r) del(curR--);
    ans[qry.id] = current_res;
}
```

这里有个**很容易写出 bug 的次序问题**：必须**先扩张（add）、后收缩（del）**。也就是先把左指针往左推、右指针往右拉（区间变大），再把多余的部分删掉。

为啥？因为 `cnt` 是无符号语义的计数，如果先 `del` 把某个本该存在的数减成负数（哪怕只是中间态），就可能在 `(2 * cnt[val] + 1)` 里算出错误的负贡献，把答案彻底带歪。先 add 后 del 能保证整个过程中区间始终是「真实区间的超集」，计数永远非负，稳稳当当。注意作者用的 `++curL` / `curL++` 这一组前后缀的搭配，正好让指针指向的位置和增删的元素严丝合缝。

算下复杂度：排序 $O(t \log t)$，指针总移动量 $O((n + t)\sqrt{n})$，每次移动是 $O(1)$ 的平方差更新。所以总复杂度

$$ O\big(t \log t + (n + t)\sqrt{n}\big) $$

对 $2 \times 10^5$ 的数据，配上块长优化和奇偶优化，5 秒时限里跑得轻轻松松。

### 5. 一个 CF 老题的历史小坑

题面末尾那句话值得单独拎出来：**「不要用 `%lld` 来读写 64 位整数，请用 `cout`（或者 `%I64d`）」**。这是一道古早 CF 题，那个年代的评测机是 Windows + 老版 MSVC，`%lld` 在上面是会翻车的。我们这份代码直接全程 `cin / cout`，配合 `#define int long long`，能量值最大约 $(2\times10^5)^2 \times 10^6 = 4 \times 10^{16}$，妥妥落在 `long long` 范围内，丝毫不用担心溢出，也完美绕开了这个历史坑。

### CPP 代码实现

```cpp
// D. Powerful array

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

struct MoSolver {
    struct Query {
        int l, r, id, block;
        // 奇偶优化排序
        bool operator<(const Query& other) const {
            if (block != other.block) return block < other.block;
            return (block & 1) ? (r < other.r) : (r > other.r);
        }
    };

    int n, q, block_size;
    vector<int> a;
    vector<Query> queries;
    vector<int> ans;
    vector<int> cnt; // 根据题目需求调整，这里是频次统计
    int curL = 1, curR = 0;
    int current_res = 0;

    // n: 数组大小, q: 询问个数, max_val: 数组中元素的最大可能值（用于开桶）
    MoSolver(int _n, int _q, int max_val) {
        n = _n; q = _q;
        a.resize(n + 1);
        queries.resize(q);
        ans.resize(q);
        cnt.assign(max_val + 1, 0);
        block_size = max(1.0, (double)n / sqrt(max(1.0, (double)q * 2.0 / 3.0)));
    }

    void add(int idx) {
        int val = a[idx];
        current_res += (2 * cnt[val] + 1) * val;
        cnt[val]++;
    }

    void del(int idx) {
        int val = a[idx];
        cnt[val]--;
        current_res -= (2 * cnt[val] + 1) * val;
    }

    void add_query(int id, int l, int r) {
        queries[id] = {l, r, id, l / block_size};
    }

    void solve() {
        sort(queries.begin(), queries.end());
        for (auto& qry : queries) {
            while (curL > qry.l) add(--curL);
            while (curR < qry.r) add(++curR);
            while (curL < qry.l) del(curL++);
            while (curR > qry.r) del(curR--);
            ans[qry.id] = current_res;
        }
    }
};

void solve() {

    int n, q;
    cin >> n >> q;
    vector<int> a(n + 1);
    int max_val = 0;
    for (int i = 1; i <= n; i++) {
        cin >> a[i];
        max_val = max(max_val, a[i]);
    }
    MoSolver ms(n, q, max_val);
    ms.a = a;
    for (int i = 0; i < q; i++) {
        int l, r;
        cin >> l >> r;
        ms.add_query(i, l, r);
    }
    ms.solve();
    for (int i = 0; i < q; i++) {
        cout << ms.ans[i] << endl;
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
