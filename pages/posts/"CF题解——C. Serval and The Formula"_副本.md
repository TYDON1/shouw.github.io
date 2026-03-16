---
title: "CF题解——Small GCD"
date: "2026-03-16 14:24:28"
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
 - 欧拉函数
 - 组合数学
 - 排序
---

# D. Small GCD 解题思路

### 核心问题分析

题意看起来有些绕：在数组中任选三个数 $a_i, a_j, a_k$，按大小排个序后，取出**较小的两个数求 GCD（最大公约数）**，最大的那个数直接无视。我们要计算所有可能的三元组的这种 GCD 之和。

由于题目只是要求在集合中“任取三个数”，**这和它们在原数组中的初始位置 $i, j, k$ 毫无关系**。
遇到这种“位置无关且涉及大小比较”的题，我们的第一反应必须是：**先给数组从小到大排序！**

### 1. 组合数学的转换：剥离无用维度

假设数组已经从小到大排好序：$a_1 \le a_2 \le \dots \le a_n$。
当我们挑出任意三个数 $a_i \le a_j \le a_k$ （其中 $i < j < k$）时，按照规则，产生的贡献必然是 $\gcd(a_i, a_j)$。

你会发现，**作为最大值的 $a_k$ 到底是多少根本不重要，它纯粹只是一个“计数倍率”**。
对于固定的一对 $(a_i, a_j)$，在它后面有多少个合法的 $a_k$ 呢？因为数组排好序了，所以在下标 $j$ 之后，还有 $n - 1 - j$ 个元素。
也就是说，这对 $(a_i, a_j)$ 对总答案的贡献是：
$$ \gcd(a_i, a_j) \times (n - 1 - j) $$

因此，我们只需要枚举中间的那个数 $a_j$，并计算它与前面所有数产生的 GCD 之和，再乘上后面的剩余数字个数即可：
$$ \text{Total} = \sum_{j=1}^{n-2} \left( \sum_{i=0}^{j-1} \gcd(a_i, a_j) \right) \times (n - 1 - j) $$

### 2. 数论魔法：欧拉函数的反向应用

上面的推导让我们省去了一维，但计算 $\sum_{i=0}^{j-1} \gcd(a_i, a_j)$ 仍然需要 $O(N^2)$ 的时间，面对 $N = 8 \cdot 10^4$ 的数据依然会 TLE。

这就需要祭出数论中处理 GCD 求和问题的一个王牌恒等式——**利用欧拉函数 $\phi$**：
$$ \gcd(X, Y) = \sum_{d \, | \, \gcd(X,Y)} \phi(d) $$
（一个数的约数的欧拉函数之和，等于这个数本身）。

把它代入我们要算的式子里：
$$ \sum_{i} \gcd(a_i, a_j) = \sum_{i} \sum_{d | a_i, \, d | a_j} \phi(d) $$

接下来，我们**改变枚举顺序**，把对 $i$ 的枚举换成对约数 $d$ 的枚举。
对于当前的 $a_j$，我们遍历它的所有约数 $d$。对于每一个约数 $d$，它能产生多少次 $\phi(d)$ 的贡献呢？这完全取决于**在 $a_j$ 之前，有多少个 $a_i$ 是 $d$ 的倍数**！

### 3. 具体算法流程与数据结构

基于上面的推导，我们只需维护一个数组 `f[d]`，用来记录**当前遍历过的数中，包含约数 $d$ 的数有多少个**。

1. **预处理（打表）：**
   * 用类似埃氏筛的方法，预处理出 $1 \dots 10^5$ 内所有数的**欧拉函数值 $\phi$**。
   * 预处理出 $1 \dots 10^5$ 内每个数的**所有约数**保存在 `vector` 中。这一步非常关键，可以避免在主循环中 $O(\sqrt{V})$ 找约数，直接将查询降为 $O(\text{约数个数})$。
2. **扫描统计：**
   * 对原数组 $a$ 从小到大排序。
   * 从左到右遍历 $a[j]$：
     * 先查询：遍历 $a[j]$ 的所有约数 $d$，当前 $a[j]$ 和前面所有数构成的 GCD 之和就是 $\sum (\phi[d] \times f[d])$。
     * 计算总贡献：把这个 GCD 之和乘上它后面的元素个数 `cnt`，累加到总答案 `ans` 中。
     * 后更新：遍历 $a[j]$ 的所有约数 $d$，把 `f[d]` 的统计值加一，为下一个数的查询做准备。

时间复杂度降到了 $O(V \log V + N \log N + N \times D)$，其中 $D$ 是一个数的平均约数个数（非常小）。完美跑过！

### CPP 代码实现

下面是加上了详细注释的实现代码。

```cpp
// D. Small GCD

#include <bits/stdc++.h>
#define int long long
#define db double
#define endl "\n"

using namespace std;

const int MAXV = 100005;
vector<int> divs[MAXV]; // 存储每个数的所有约数
int phi[MAXV];          // 存储欧拉函数值
int f[MAXV];            // 统计桶：f[d]表示当前已经遍历过的数中，含有约数 d 的数的个数

// 预处理欧拉函数和约数表（空间换时间）
void cal() {
	// 1. 线性求欧拉函数 (利用埃氏筛思想)
	for (int i = 0; i < MAXV; i++) phi[i] = i;
	for (int i = 2; i < MAXV; i++) {
		// 如果 phi[i] == i，说明 i 是素数
		if (phi[i] == i) {
			for (int j = i; j < MAXV; j += i)
				phi[j] -= phi[j] / i; // 根据欧拉函数通项公式计算
		}
	}
	
	// 2. 预处理每个数的所有约数
	for (int i = 1; i < MAXV; i++) {
		for (int j = i; j < MAXV; j += i) {
			divs[j].push_back(i); // i 是 j 的约数
		}
	}
}

void solve() {
	int n;
	cin >> n;
	vector<int> a(n);
	int max_val = 0;
	
	for (int i = 0; i < n; i++) {
		cin >> a[i];
		max_val = max(max_val, a[i]);
	}

	// 核心步骤 1：从小到大排序
	sort(a.begin(), a.end());

	// 清空用到最大范围的桶（多测不清空，爆零两行泪）
	for (int i = 0; i <= max_val; i++) f[i] = 0;

	int ans = 0;
	// cnt 表示在当前数 a[i] 后面，还可以挑选出多少个作为第三个元素（最大的数）
	// 当 i = 1 (即数组的第二个数) 时，后面还有 n-2 个数
	int cnt = n - 2; 

	for (int i = 0; i < n; i++) {
		int x = a[i];
		int sum = 0;
		auto &b = divs[x]; // 取出当前数 x 的所有约数
		
		// 步骤 A：查询阶段 (计算 x 作为中间元素时，与前面所有元素产生的 GCD 之和)
		// gcd(X, Y) = sum(phi[d])，其中 d 是 X 和 Y 的公约数
		for (int d : b) {
			sum += phi[d] * f[d]; 
		}
		
		// 步骤 B：计算对总答案的贡献
		// a[i] 至少得是第二个数(i >= 1)，前面才有数跟它组 GCD
		if (i >= 1) {
			ans += sum * cnt; // (与前面数的GCD和) * (后面可作为最大值的数字个数)
			cnt--;            // 随着当前数字向右推移，后面的候选数字越来越少
		}
		
		// 步骤 C：更新阶段
		// 把当前数 x 的所有约数放入桶中，供后面的数查询
		for (int d : b) {
			f[d]++;
		}
	}
	
	cout << ans << endl;
}

signed main() {
	// 优化输入输出
	ios_base::sync_with_stdio(false);
	cin.tie(nullptr);

	// 提前打表
	cal();

	int t = 1;
	cin >> t;

	while (t--) {
		solve();
	}
}