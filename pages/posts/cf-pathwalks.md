---
title: "CF题解——Pathwalks"
date: "2026-05-20 22:37:11"
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
 - DP
 - 数据结构
 - 图论
---

# F. Pathwalks 解题思路

### 核心问题分析

题意翻译成人话：给一张有向图，$n$ 个点、$m$ 条带权边（注意可以有重边、自环，图还可能不连通）。我们要挑出一条路径（点可以重复经过），让走过的这些边满足**两个条件同时成立**：

1. 边权**严格递增**；
2. 这些边在**输入里出现的先后顺序**也是递增的（即第 $i_1$ 条边、第 $i_2$ 条边……要满足 $i_1 < i_2 < \dots$）。

在所有满足条件的路径里，求**最多能用多少条边**。

数据范围 $n, m \le 10^5$，边权 $0 \le w \le 10^5$。条件 2 很关键——它告诉我们：**只要按输入顺序一条一条处理边，就天然满足了"输入顺序递增"**，因为我们处理到第 $i$ 条边时，前面已经处理过的边下标全都比 $i$ 小。这一下子就把"二维偏序（下标递增 + 权值递增）"砍掉一维，剩下的活儿只剩**权值严格递增**这一个约束了。

### 1. 把状态钉死在“终点 + 末边权值”上

我们按输入顺序扫边。处理第 $i$ 条边 $(u \to v, w)$ 时，问的是：**以这条边作为路径最后一条边，能接出多长的链？**

要把这条边接到前面的链尾，前一条边必须满足：它的**终点是 $u$**（这样才能从 $u$ 出发走这条边），并且它的**权值严格小于 $w$**（严格递增）。所以很自然地，状态定义为：

$$ dp[v][w] = \text{以终点 } v、末边权值恰为 } w \text{ 的合法路径的最大边数} $$

代码里就是一排 `map<int, int> dp[v]`——第 $v$ 个 map 的 key 是权值，value 是“以 $v$ 结尾、末边是这个权值时”的最长链长：

```cpp
vector<map<int, int>> dp(n + 1);
```

转移呢？处理边 $(u, v, w)$ 时，我们去 $u$ 的那张表里，找**权值严格小于 $w$** 的所有链，取它们的最大长度，再 $+1$（把当前这条边接上去）：

```cpp
int max_len = 0;
auto it_1 = dp[u].lower_bound(w);
if (it_1 != dp[u].begin()) {
    max_len = prev(it_1)->second;
}
int res = max_len + 1;
```

注意这里用的是 `lower_bound(w)` 再 `prev`，拿到的是“权值 $< w$ 中最靠右的那一项”。等等——为什么只看**最靠右那一项**就够了，而不是在 $[0, w)$ 这个区间里取最大值？这正是这道题最妙的地方，下一节揭晓。

### 2. 顿悟时刻：让每张表都是“权值越大、链越长”的单调表

我们希望 $dp[u]$ 这张 map 维护成一个**漂亮的单调结构**：

> 在同一张表里，key（权值）越大的项，value（链长）也越大；换句话说，按权值从小到大看，链长是**单调不减**的。

如果能保住这个性质，那么“在 $[0, w)$ 里求最大链长”就退化成“取权值 $< w$ 的**最后一项**”，也就是上面那句 `prev(lower_bound(w))`，$O(\log)$ 一步到位，根本不用区间扫描。

怎么保住它？关键在写入的时候做**支配剪枝**。当我们算出当前边的 `res = max_len + 1` 后：

- 先看 $dp[v]$ 里**权值 $< w$ 的现有最优** `best`（同样用 `prev(lower_bound)` 拿）。如果 `res <= best`，说明在 $v$ 这个终点上，已经存在一条“末边权值更小、却更长（或一样长）”的链——那当前这条 $(v, w)$ 是**废物点**：谁要接它，都不如去接那条更短权值的，留着它只会破坏单调性。直接丢弃，连写都不写。
- 反之 `res > best`，才把 `dp[v][w] = res` 写进去。

```cpp
int best = 0;
auto it_2 = dp[v].lower_bound(w);
if (it_2 != dp[v].begin()) {
    best = prev(it_2)->second;
}
if (res > best) {
    dp[v][w] = res;
    ...
}
```

光这样还不够：新插入的 $(w, res)$ 可能让它**右边**那些权值更大、链长却 $\le res$ 的旧项失去单调性（出现“权值更大反而更短”的逆序）。这些旧项现在也成了废物——任何能接它们的边，权值一定 $> w$，也就一定 $\ge$ 我们这条 $w$，那为啥不接更短权值、却同样长甚至更长的当前项呢？于是把它们**一并清除**：

```cpp
dp[v][w] = res;
auto it_3 = dp[v].upper_bound(w);
while (it_3 != dp[v].end() && it_3->second <= res) {
    it_3 = dp[v].erase(it_3);
}
```

`upper_bound(w)` 跳到权值严格大于 $w$ 的第一项，一路往右把所有 value $\le res$ 的项 erase 掉，直到遇到一个比 $res$ 还大的为止（它能存活，因为它确实“权值更大且更长”，单调性成立）。这么一收拾，整张表又重新变成那条漂亮的、权值与链长**同向递增**的单调曲线。

### 3. 为什么这套剪枝既正确又高效

**正确性**：每条边只可能从“终点是它起点、权值更小”的链接出来，而那种链的最优值恰好被我们维护成“权值 $< w$ 的最后一项”。被剪掉的项全是**被支配**的——存在另一项权值不大于它、链长不小于它，任何后续转移用被支配项都不会比用支配项更优。所以剪掉它们一根毛都不影响最终答案。

**复杂度**：这就是经典的均摊分析了。每条边最多向各张 map 里**插入一次**；而 `while` 循环里的每次 `erase` 都对应着“某个曾经被插入的项被永久删除”。一个元素一生只能被插入一次、删除一次，所以所有 `erase` 加起来总量是 $O(m)$。每次 map 操作 $O(\log m)$，整体复杂度

$$ O(m \log m) $$

$10^5 \cdot \log 10^5$ 轻轻松松，1 秒时限绰绰有余。这其实就是“在权值这一维上做单点更新 + 前缀取 max”的活儿，可以用线段树/树状数组（值域 $w \le 10^5$）来干；而 shouw 这份提交用**按终点分桶的 `map` + 支配剪枝**实现了等价效果，代码还短，常数也漂亮，赞！

### 4. 收尾：答案就是全程见过的最长链

每处理完一条边，它本身就构成一条长度 $res$ 的合法路径尾，所以直接拿它去更新全局答案：

```cpp
ans = max(ans, res);
```

注意答案取的是 `res` 而不是写进表里的值——因为有些边算出来 `res` 不够大、被剪枝丢弃了根本没写进 map，但**它自己依然是一条合法路径**（哪怕只有它一条边），更新 `ans` 时一个都不能漏。扫完所有边，`ans` 就是答案。对照样例二：边按输入序是 $(1\to3,2),(3\to2,3),(3\to4,5),(5\to4,0),(4\to5,8)$，能找到 $2\to3\to5$ 的链（权值 $2<3<5$）长度为 $3$，输出 $3$，完美对上。

### CPP 代码实现

```cpp
// F. Pathwalks

#include <bits/stdc++.h>
#include <ext/pb_ds/assoc_container.hpp>
#include <ext/pb_ds/tree_policy.hpp>
#define lg(x) (63 - __builtin_clzll(x))
#define all(x) (x).begin(), (x).end()
#define low_bit(x) ((x) & (-x))
#define pb push_back
#define db long double
#define int long long
#define sz(x) (int)x.size()
#define endl "\n"

using namespace std;
using namespace __gnu_pbds;

struct custom_hash {
    static uint64_t splitmix64(uint64_t x) {
        x += 0x9e3779b97f4a7c15;
        x = (x ^ (x >> 30)) * 0xbf58476d1ce4e5b9;
        x = (x ^ (x >> 27)) * 0x94d049bb133111eb;
        return x ^ (x >> 31);
    }
    size_t operator()(uint64_t x) const {
        static const uint64_t FIXED_RANDOM = chrono::steady_clock::now().time_since_epoch().count();
        return splitmix64(x + FIXED_RANDOM);
    }
};

template<typename K, typename V> 
using hash_map = gp_hash_table<K, V, custom_hash>;
template<typename T> 
using ordered_set = tree<T, null_type, less<T>, rb_tree_tag, tree_order_statistics_node_update>;
template<typename T> 
using ordered_multiset = tree<T, null_type, less_equal<T>, rb_tree_tag, tree_order_statistics_node_update>;

struct Edge {
    int u, v, w;
};

void solve() {

    int n, m;
    cin >> n >> m;
    vector<Edge> edges(m + 1);
    vector<map<int, int>> dp(n + 1);
    for (int i = 1; i <= m; ++i) {
        cin >> edges[i].u >> edges[i].v >> edges[i].w;
    }
    int ans = 0;
    for (int i = 1; i <= m; ++i) {
        auto [u, v, w] = edges[i];
        int max_len = 0;
        auto it_1 = dp[u].lower_bound(w);
        if (it_1 != dp[u].begin()) {
            max_len = prev(it_1)->second;
        }
        int res = max_len + 1;
        int best = 0;
        auto it_2 = dp[v].lower_bound(w);
        if (it_2 != dp[v].begin()) {
            best = prev(it_2)->second;
        }
        if (res > best) {
            dp[v][w] = res;
            auto it_3 = dp[v].upper_bound(w);
            while (it_3 != dp[v].end() && it_3->second <= res) {
                it_3 = dp[v].erase(it_3);
            }
        }
        ans = max(ans, res);
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
