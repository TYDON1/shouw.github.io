---
title: "CF题解——One Occurrence"
date: "2026-05-08 20:42:11"
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
 - 离线
 - 数据结构
---

# F. One Occurrence 解题思路

### 核心问题分析

题意非常直白：给定长度为 $n$ 的数组，$q$ 次询问，每次问 $[l, r]$ 这段子数组里，**随便找一个恰好只出现一次的数**，找不到就输出 $0$。

注意数据范围：$n, q \le 5 \times 10^5$。询问之间没有强制在线（不需要异或上一次答案），这就是一个非常典型的**离线区间询问**信号。再看“恰好出现一次”这个性质——它不满足简单的可加性，线段树合并、主席树之类的当然能做，但既然允许离线，我们的老朋友**莫队算法**就够用了。（关于莫队的基础框架，可以翻我之前写的 [[莫队模版]]。）

### 1. 莫队能做的前提：增删一个元素，能 $O(1)$ 维护答案吗？

莫队的本质是：把询问离线后按块排序，让左右指针 $[curL, curR]$ 像两只蜗牛一样缓慢挪动，每次只**加入或删除一个端点元素**。它能用的唯一前提是——

> 加入 / 删除一个元素后，能否快速（最好 $O(1)$）地更新出“当前区间的答案”？

本题的答案是“任意一个只出现一次的数”。所以我们真正要维护的，是一个**动态集合**：当前窗口里所有出现次数恰好为 $1$ 的数值。只要这个集合非空，从里面随便掏一个出来就是答案；空了就输出 $0$。

### 2. 支持 $O(1)$ 增删 + 随机取元素的“可删数组”

普通的 `set` 当然能维护这个集合，但带个 $\log$，在 $5 \times 10^5$ 的莫队里容易被卡。这里用了一个非常经典的小 trick——**用数组模拟一个支持 $O(1)$ 插入、$O(1)$ 删除任意元素的集合**：

* `ones[]`：紧凑地存放当前“出现次数为 $1$”的所有数值。
* `pos[val]`：记录数值 `val` 在 `ones[]` 中的下标。
* `ones_sz`：当前集合大小。

插入就直接接到末尾；删除某个元素时，把**末尾元素搬过来填坑**，再把尺寸减一——这就是俗称的“**交换删除法**”，$O(1)$ 且不留空洞：

```cpp
inline void add_to_ones(int val) {
    pos[val] = ones_sz;
    ones[ones_sz++] = val;
}
inline void remove_from_ones(int val) {
    int p = pos[val];
    int last_val = ones[ones_sz - 1];
    ones[p] = last_val;   // 末尾顶上来填坑
    pos[last_val] = p;
    ones_sz--;
    pos[val] = -1;
}
```

### 3. 出现次数变化时，集合该怎么动？

剩下的就是把“出现次数 `cnt[val]` 的变化”翻译成对集合的操作。关键只看**跨越 $1$ 这条线**的瞬间：

* **加入**一个 `val`：`cnt[val]++`。
  * 若变成 $1$：它第一次成为“独苗”，加进集合。
  * 若变成 $2$：它不再独苗，从集合里删掉。
* **删除**一个 `val`：`cnt[val]--`。
  * 若变成 $1$：从 $2$ 掉回 $1$，重新成为独苗，加进集合。
  * 若变成 $0$：彻底消失，从集合删掉。

其它次数变化（比如 $2 \to 3$、$3 \to 2$）对“是否恰好为 $1$”毫无影响，直接无视即可。每次询问处理完，答案就是 `ones_sz == 0 ? 0 : ones[ones_sz - 1]`，掏末尾那个即可。

### 4. 工程细节：奇偶块排序 + 快读快写

$5 \times 10^5$ 的莫队是会卡常的，代码里上了两个常规但好用的优化：

1. **奇偶块排序**：同一块内，按 $r$ 升序还是降序取决于块号的奇偶。这样右指针在相邻块之间不用每次都“甩回原点”，少跑一大截路程。
2. **手写快读快写**：`getchar` / `putchar` 级别的 IO，避免被 `cin/cout` 拖死。

块长取 $n / \sqrt{2q/3}$ 这种带常数微调的经验值，整体复杂度 $O((n + q)\sqrt{n})$，配上轻量的 $O(1)$ 维护，稳稳通过。

### CPP 代码实现

```cpp
#include <bits/stdc++.h>
#define endl "\n"

using namespace std;

const int MAXN = 5e5 + 10;

int a[MAXN], ans[MAXN], cnt[MAXN], pos[MAXN];
int ones[MAXN];
int ones_sz = 0;

struct Query {
    int l, r, id, block;
    bool operator<(const Query& other) const {
        if (block != other.block) return block < other.block;
        return (block & 1) ? (r < other.r) : (r > other.r);
    }
} queries[MAXN];

int curL = 1, curR = 0;

inline int read() {
    int x = 0; char ch = getchar();
    while (ch < '0' || ch > '9') ch = getchar();
    while (ch >= '0' && ch <= '9') { x = x * 10 + (ch - '0'); ch = getchar(); }
    return x;
}

inline void write(int x) {
    if (x == 0) {
        putchar('0');
        return;
    }
    int stk[15], top = 0;
    while (x) {
        stk[++top] = x % 10;
        x /= 10;
    }
    while (top) putchar(stk[top--] + '0');
}

inline void add_to_ones(int val) {
    pos[val] = ones_sz;
    ones[ones_sz++] = val;
}

inline void remove_from_ones(int val) {
    int p = pos[val];
    int last_val = ones[ones_sz - 1];

    ones[p] = last_val;
    pos[last_val] = p;

    ones_sz--;
    pos[val] = -1;
}

inline void add(int idx) {
    int val = a[idx];
    cnt[val]++;
    if (cnt[val] == 1) {
        add_to_ones(val);
    } else if (cnt[val] == 2) {
        remove_from_ones(val);
    }
}

inline void del(int idx) {
    int val = a[idx];
    cnt[val]--;
    if (cnt[val] == 1) {
        add_to_ones(val);
    } else if (cnt[val] == 0) {
        remove_from_ones(val);
    }
}

int main() {

    for (int i = 0; i < MAXN; i++) pos[i] = -1;

    int n = read();
    for (int i = 1; i <= n; i++) a[i] = read();

    int q = read();
    int block_size = max(1.0, (double)n / sqrt(max(1.0, (double)q * 2.0 / 3.0)));

    for (int i = 0; i < q; i++) {
        queries[i].l = read();
        queries[i].r = read();
        queries[i].id = i;
        queries[i].block = queries[i].l / block_size;
    }

    sort(queries, queries + q);

    for (int i = 0; i < q; i++) {
        int L = queries[i].l;
        int R = queries[i].r;

        while (curL > L) add(--curL);
        while (curR < R) add(++curR);
        while (curL < L) del(curL++);
        while (curR > R) del(curR--);

        ans[queries[i].id] = (ones_sz == 0) ? 0 : ones[ones_sz - 1];
    }

    for (int i = 0; i < q; i++) {
        write(ans[i]);
        putchar('\n');
    }

}
```
