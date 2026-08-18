---
title: "CF题解——Eliminating Balls With Merging (Easy Version)"
date: "2026-03-12 13:40:01"
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
  - 分治
  - ST表
  - 前缀和
  - 贪心
---

# E1. Eliminating Balls With Merging (Easy Version) 解题思路

### 核心问题分析

本题的 Easy Version 中，$x = n$，这意味着我们只需要找出在整个初始数组 $A[1 \dots n]$ 中，有多少个位置的球可以通过不断吞并相邻的球，最终成为**全场唯一剩下**的那个球。

吞并规则很简单：
1. 大数可以吞并小数（相加）。
2. 相等大小的数可以互相吞并。

### 1. 基础判断与贪心/分治策略

我们如何判断一个球能否存活到最后？

首先，考虑整个数组中的**最大值**（设其下标为 $M$）。显然，这个最大值一定能存活到最后，因为它比其他所有球都大，它可以无脑向左和向右吞并所有较小的球。

那么，除了最大值 $M$ 之外，其他球有没有可能存活？
假设我们要判断 $M$ **左侧**的某个球能否存活，基于贪心策略，它必须**集结左侧所有的力量**才能与 $M$ 抗衡。换句话说，左侧区间 $[1, M-1]$ 内的所有球必须先互相吞并，形成一个大球。
- 如果这个大球的总和 $\ge a[M]$：那么它就可以反杀吞并 $M$，进而吞并右侧所有球。这意味着左侧区间 $[1, M-1]$ 中**有可能**存在能够存活到最后的球。
- 如果这个大球的总和 $< a[M]$：那么即使左侧所有球全加起来，也无法越过 $M$ 这座大山。这意味着左侧区间 $[1, M-1]$ 中的**任何球都不可能**赢到最后。

同理，对于 $M$ **右侧**的区间 $[M+1, n]$，只有当它们的总和 $\ge a[M]$ 时，右侧区间才有可能诞生最终的赢家。

### 2. 递归的分治逻辑

上面的分析揭示了一个非常标准的分治（Divide and Conquer）结构。我们可以定义一个递归函数 `check(L, R, ok)`：
- `[L, R]` 表示当前考察的区间。
- `ok` 是一个布尔值，表示从全局来看，当前区间 $[L, R]$ **是否还有资格**诞生最终赢家。（如果它的父区间已经被外面的极大值卡死了，那 `ok` 就是 `false`）。

在区间 $[L, R]$ 内部：
1. 找到区间内的最大值，记其下标为 $M$。
2. 因为 $M$ 是区间霸主，所以 $M$ 能否赢到最后，完全取决于 `ok` 的值：`can_win[M] = ok`。
3. 检查左半区 $[L, M-1]$：如果 `ok` 为真，且左半区的**前缀和**总和 $\ge a[M]$，则左半区保有存活希望（传下 `true`），否则传下 `false`。继续递归 `check(L, M-1, left_ok)`。
4. 检查右半区 $[M+1, R]$：同理，如果右半区总和 $\ge a[M]$，传下 `true`，否则 `false`。继续递归 `check(M+1, R, right_ok)`。

### 3. 具体算法与数据结构

为了让分治能够高效运行，我们需要快速完成两件事：
1. **快速求区间和**：预处理前缀和数组 `s[]`，可以在 $O(1)$ 时间内得到任意区间 $[L, R]$ 的总和。
2. **快速求区间最大值的下标**：由于涉及到频繁的区间最值查询，且没有修改操作，建立一个 **ST表 (Sparse Table)** 是最完美的选择。预处理 $O(n \log n)$，单次查询 $O(1)$。

最终总时间复杂度为 $O(n \log n)$，能够轻松跑过 $n = 2 \cdot 10^5$ 的数据。

### CPP 代码实现

下面是代码实现，使用了 `ST表` 进行 RMQ (Range Minimum/Maximum Query)，并利用前缀和进行快速判断。

```cpp
// E1. Eliminating Balls With Merging (Easy Version)

#include <bits/stdc++.h>
#define int long long
#define db double
#define endl "\n"

using namespace std;

const int MAXN = 200010;
const int LOGN = 20;

int n, x_val;
int a[MAXN], s[MAXN];     // a为原数组, s为前缀和数组
int st[MAXN][LOGN];       // ST表，存的是最大值的下标
bool can_win[MAXN];       // 记录每个位置是否能成为最后赢家

// 比较两个下标所对应的值，返回较大值的下标
// 若值相等，代码中默认返回下标较大的那个（向右倾斜），不影响正确性
int get_max_idx(int i, int j) {
	if (a[i] > a[j]) return i;
	if (a[i] < a[j]) return j;
	return max(i, j);
}

// 构建 ST 表：时间复杂度 O(n log n)
void build_st() {
	for (int i = 1; i <= n; i++) st[i][0] = i;
	for (int j = 1; j < LOGN; j++) {
		for (int i = 1; i + (1 << j) - 1 <= n; i++) {
			st[i][j] = get_max_idx(st[i][j - 1], st[i + (1 << (j - 1))][j - 1]);
		}
	}
}

// O(1) 查询区间 [L, R] 的最大值下标
int query(int L, int R) {
	int k = __lg(R - L + 1);
	return get_max_idx(st[L][k], st[R - (1 << k) + 1][k]);
}

// 分治核心逻辑
// L, R: 当前考察区间
// ok: 该区间是否具备产生最终赢家的潜力
void check(int L, int R, bool ok) {
	if (L > R) return;

	// 找到当前区间的最大值下标 M
	int M = query(L, R);
	
	// 当前区间最大值能否最终存活，取决于外部限制 ok
	can_win[M] = ok;

	// 判断左边区间 [L, M-1] 能否存活：
	// 前提是当前 ok 为 true，且左区间的总和大于等于 a[M]
	bool left_ok = ok && M > L && (s[M - 1] - s[L - 1] >= a[M]);
	check(L, M - 1, left_ok);

	// 判断右边区间 [M+1, R] 能否存活：
	// 前提是当前 ok 为 true，且右区间的总和大于等于 a[M]
	bool right_ok = ok && M < R && (s[R] - s[M] >= a[M]);
	check(M + 1, R, right_ok);
}

void solve() {
	cin >> n >> x_val;

	// 初始化读取与前缀和
	for (int i = 1; i <= n; i++) {
		cin >> a[i];
		s[i] = s[i - 1] + a[i];
		can_win[i] = false;
	}

	build_st();

	// 初始全量区间 [1, n]，显然具有产生赢家的潜力 (true)
	check(1, n, true);

	// 统计并输出能赢到最后的球的数量
	int count = 0;
	for (int i = 1; i <= n; i++) {
		if (can_win[i]) count++;
	}
	cout << count << endl;
}

signed main() {
	// 优化输入输出
	ios_base::sync_with_stdio(false);
	cin.tie(nullptr);

	int t = 1;
	cin >> t;
	
	while (t--) {
		solve();
	}
}
```