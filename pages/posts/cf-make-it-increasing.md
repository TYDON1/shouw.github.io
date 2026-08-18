---
title: "CF题解——Make It Increasing"
date: "2026-05-02 20:21:38"
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
 - 动态规划
 - 贪心
---

# E. Make It Increasing 解题思路

### 核心问题分析

题目要求我们对一个数组 $A$ 进行修改，使得它变成**严格递增**的。
规则是：每次可以把某个数字修改成任意整数。但是，题目给了一个下标集合 $B$，在 $B$ 里面的下标对应的数字**绝对不能被修改（被锁死了）**。
我们需要求出最少的修改次数，如果根本无法做到严格递增，就输出 `-1`。

既然有些位置被锁死了，整个数组实际上就被这些“锁死”的位置切分成了一段段的**独立区间**。
比如锁死了位置 $L$ 和位置 $R$，那么对于夹在中间的这一段数字 $[L+1, R-1]$：
1. 它们必须严格递增。
2. 它们必须大于 $A[L]$，且小于 $A[R]$。

因此，我们的总体思路非常清晰：**将大问题拆解成若干个子区间，在每个子区间内分别求“最少修改次数”，最后加起来即可。**

### 1. 数组严格递增的“终极转化”

在算法竞赛中，遇到**“修改最少元素使得数组严格递增”**，必须条件反射地想到一个极其经典的转化。

假设在一段区间内，我们要让两个保留下来的原元素 $A[i]$ 和 $A[j]$ ($i < j$) 满足严格递增。不仅要满足 $A[i] < A[j]$，还要考虑它们中间**是否有足够的“整数空间”来塞下其他数字**！
例如：$A[3] = 4, A[5] = 5$，虽然 $4 < 5$，但位置 $3$ 和位置 $5$ 之间还有一个位置 $4$。你根本无法在 $4$ 和 $5$ 之间塞入一个整数，所以 $A[3]$ 和 $A[5]$ **绝对不可能同时保留**！

为了满足能塞下足够的整数，必须满足：
$$ A[j] - A[i] \ge j - i $$
移项得到：
$$ A[j] - j \ge A[i] - i $$

**顿悟时刻：** 
只要我们把原数组的所有元素转化为 $A'[i] = A[i] - i$，那么“修改最少元素使得原数组严格递增”的问题，就完美等价于：
**“在 $A'$ 数组中找最长的不下降子序列（Non-decreasing Subsequence）”！**
因为你保留下来的元素越多（LIS 越长），你需要修改的元素就越少。
（最少修改次数 = 区间总长度 $-$ LIS 的长度）。

### 2. 区间判定与 LIS 求解

根据上述的转化，对于任意一个被锁死端点 $A[L]$ 和 $A[R]$ 夹住的子区间（里面有 $cnt$ 个可修改的元素）：
1. 首先计算 $A'[L] = A[L] - L$ 和 $A'[R] = A[R] - R$。
2. **无解判定**：如果 $A'[L] > A'[R]$，说明两端点之间的落差连它们自己都无法满足严格递增，直接输出 `-1` 结束程序。
3. 把区间内所有满足 $A'[L] \le A'[i] \le A'[R]$ 的元素挑出来，存入一个临时数组。（如果不在这范围里，说明这数字非改不可，直接无视）。
4. 对这个临时数组求**最长不下降子序列（LIS）**的长度 $len$。
5. 该区间的最小修改次数 = $cnt - len$。

为了方便处理头和尾的边界情况，我们可以人为地在数组最前面加一个 $A[0] = -\infty$，最后面加一个 $A[n+1] = \infty$，并且把它们也视作“被锁死”的端点。这样就完美统一了所有的区间逻辑。

### CPP 代码实现

```cpp
// E. Make It Increasing

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

const int INF = 2e18;

void solve() {
    int n, m;
    cin >> n >> m;
    
    // a[i].first 存原始值，a[i].second 存原始下标 i
    vector<pair<int, int>> a(n + 2);
    for (int i = 1; i <= n; ++i) {
        cin >> a[i].first;
        a[i].second = i;
    }
    
    // 增加超级哨兵，作为绝对不会被改动的左右边界
    a[0].first = -INF;
    a[0].second = 0;
    a[n + 1].first = INF;
    a[n + 1].second = n + 1;
    
    // b 数组用来标记哪些位置是可以修改的
    // b[i] = true 表示可以改，false 表示被锁死
    vector<bool> b(n + 2, true);
    for (int i = 1; i <= m; ++i) {
        int temp;
        cin >> temp;
        b[temp] = false;
    }
    // 哨兵自然是锁死的
    b[0] = false;
    b[n + 1] = false;
    
    int min_n = -INF; // 当前区间的左边界值 (A[L] - L)
    int max_n = -INF; // 当前区间的右边界值 (A[R] - R)
    
    // Lambda 函数：计算一个子区间内需要修改的最少元素数
    auto check = [&] (const vector<pair<int, int>>& c) -> int {
        int n_1 = sz(c); // 区间内总共可修改的元素数量
        vector<int> d;
        
        // 过滤出合法元素，同时进行 A[i] - i 的转化
        for (auto it : c) {
            int now = it.first - it.second;
            // 只有处在左右端点范围内的值才有资格被保留
            if (now >= min_n && now <= max_n) {
                d.pb(now);
            }
        }
        
        // 经典的 O(N log N) 求最长不下降子序列
        vector<int> all_nums;
        for (auto it : d) {
            auto temp = upper_bound(all(all_nums), it);
            if (temp != all_nums.end()) {
                *temp = it; // 替换操作
            } else {
                all_nums.pb(it); // 扩展操作
            }
        }
        
        int n_2 = sz(all_nums); // LIS 的长度，即最多能保留多少个不修改
        return n_1 - n_2;       // 总数 - 保留数 = 必须修改的最少数量
    };

    int ans = 0;
    vector<pair<int, int>> nums;
    
    // 从头到尾遍历整个数组，通过锁死的点将数组分段
    for (int i = 0; i <= n + 1; ++i) {
        if (b[i]) {
            // 如果可以修改，暂时丢进当前区间的缓存中
            nums.pb(a[i]);
        } else {
            // 遇到被锁死的点，意味着当前区间结束，开始结算
            min_n = max_n; // 上一个右边界变成了现在的左边界
            max_n = a[i].first - a[i].second; // 确立新的右边界
            
            // 无解判定：两端点挤压，中间连整数空间都没有了
            if (max_n < min_n) {
                cout << -1 << endl;
                return;
            }
            
            // 结算这段区间的最小修改次数
            ans += check(nums);
            nums.clear(); // 清空缓存，准备迎接下一段区间
        }
    }
    
    cout << ans << endl;
}

signed main() {
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    // cin >> t; // 本题仅单组数据

    while (t--) {
        solve();
    }
}
```