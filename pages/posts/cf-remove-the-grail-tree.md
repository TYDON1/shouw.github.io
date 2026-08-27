---
title: "CF题解——Remove the Grail Tree"
date: "2026-06-09 21:34:02"
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
 - 树形DP
 - 构造
 - 位运算
---

# H. Remove the Grail Tree 解题思路

### 核心问题分析

给一棵 $n$ 个点的树，每个点有权值 $a_v$。每次操作可以选一个点 $v$，设 $S_v$ 为 $v$ **当前还存在的**邻居的权值之和（没有邻居就是 $0$），如果 $a_v$ 与 $S_v$ **奇偶性不同**，就可以把 $v$ 连同它的边一起删掉。问能不能把整棵树删空，如果能，输出一种删除顺序。

$1 \le n \le 2\times10^5$，多组数据 $n$ 之和不超过 $2\times10^5$，$3$ 秒时限——典型的树形 DP + 构造题，评分 $*2400$。

### 1. 唯一重要的东西：奇偶性

条件只关心 $a_v$ 和 $S_v$ 的奇偶性，跟具体数值大小完全无关。所以第一步永远是把 $a_i$ 直接对 $2$ 取模，把这道题变成一棵 $0/1$ 权值树，$S_v$ 也就退化成“剩余邻居的 $0/1$ 权值的异或和”。后面统统在模 $2$ 意义下思考。

### 2. 给树定根，删除顺序就变成了每条边的"方向"

以 $1$ 为根。考虑一条树边 $(u, v)$，$u$ 是 $v$ 的父亲。在最终的删除顺序里，$u$ 和 $v$ 谁先谁后，只有两种可能，而且这个先后关系恰好决定了这条边对 $S$ 的贡献方向：

- 如果 $v$ 排在 $u$ **之前**被删：那么 $v$ 删除的那一刻，$u$ 还在场，所以 $a_v$ 会被算进 $S_u$（"$v$ 贡献给 $u$"）；反过来 $u$ 删除时 $v$ 已经不在了，$a_u$ 不会贡献给 $S_v$。
- 如果 $v$ 排在 $u$ **之后**被删：则反过来，$u$ 的值会贡献给 $S_v$，而 $v$ 不贡献给 $S_u$。

每条边恰好用掉这两种情况之一，绝不会两头都贡献或者两头都不贡献。于是设计状态：

$$ dp[u][0] = \text{删除 } u \text{ 时父亲仍然在场是否可行（若 } u \text{ 是根，则父亲值视为 } 0\text{）} $$
$$ dp[u][1] = \text{删除 } u \text{ 时父亲已经被删除是否可行} $$

根节点没有父亲，天然对应 $dp[1][0]$（因为公式里父亲值取 $0$，正好和"没有父亲"一致），所以最终答案就是 $dp[1][0]$ 是否为真。

### 3. 每个儿子要么被"钦定"方向，要么是自由的螺丝

对 $u$ 的每个儿子 $v$，先递归求出 $dp[v][0], dp[v][1]$，再分情况讨论 $v$ 该排在 $u$ 前面还是后面：

- $dp[v][0]$ 和 $dp[v][1]$ 都是假：$v$ 这棵子树怎么排都删不完，直接判定整个 $u$ 子树失败。
- 只有 $dp[v][1]$ 为真（$dp[v][0]$ 为假）：$v$ 只能在"父亲已经不在"的情况下被删掉，所以 $v$ **必须**排在 $u$ 之后。此时 $v$ 删除时 $u$ 还没删（$v$ 在 $u$ 之后），$u$ 删除时 $v$ 还在场——$a_v$ 要计入 `sum`。
- 只有 $dp[v][0]$ 为真：$v$ 必须排在 $u$ **之前**，不贡献给 `sum`。
- 两边都为真，但 $a_v$ 是偶数：反正贡献是 $0$，放哪边都无所谓，直接默认放前面。
- 两边都为真，$a_v$ 是奇数，但**已经**有一个这样灵活的儿子被选走了：同样默认放前面（因为奇偶性调节的名额只有一个，见下一节）。
- 两边都为真，$a_v$ 是奇数，且还没选定灵活儿子：把它记成 `swap_child`，先不分配方向，留到最后按需决定。

```cpp
if (!dp[v][0] && !dp[v][1]) { dp[u][0] = dp[u][1] = 0; return; }
if (!dp[v][0]) {
    grp[u][0][1].pb(v); grp[u][1][1].pb(v);
    sum += a[v];
} else if (!dp[v][1]) {
    grp[u][0][0].pb(v); grp[u][1][0].pb(v);
} else if (a[v] == 0 || swap_child) {
    grp[u][0][0].pb(v); grp[u][1][0].pb(v);
} else {
    swap_child = v;
}
```

### 4. 一个节点最多只需要一颗"奇偶性螺丝"

为什么只需要留一个灵活儿子，而不是全部留着慢慢挑？因为我们要修的只是**一个二进制位**：`sum` 算完之后要么已经满足 $u$ 的删除条件，要么恰好差一位。如果差一位，把 `swap_child` 挪到贡献组（异或翻转一次）刚好补上；如果已经满足，那这个灵活儿子放哪边都不会破坏结果，干脆也不用它，随便塞进"前面"那一组。多出来的灵活奇数儿子永远没必要用——用两次等于白翻，用一次就够了。

处理完所有儿子后：

```cpp
sum &= 1;
int p_val = (p == 0 ? 0 : a[p]);

if ((sum ^ p_val) == a[u]) {          // 奇偶性相同，是"坏"情况，必须翻转
    if (swap_child) { grp[u][0][1].pb(swap_child); dp[u][0] = 1; }
    else dp[u][0] = 0;
} else {                              // 已经满足条件，不用动
    if (swap_child) grp[u][0][0].pb(swap_child);
    dp[u][0] = 1;
}
```

`dp[u][1]` 的算法完全一样，只不过 `p_val` 强制取 $0$（因为这个状态本身假设父亲已经不在场了）。

### 5. 从 DP 还原具体顺序

`grp[u][ctx][0]` 存的是"在 $u$ 之前删"的儿子，`grp[u][ctx][1]` 存的是"在 $u$ 之后删"的儿子。整棵树的输出就是一次先序/后序混合遍历：

```cpp
auto output = [&](auto&& self, int u, int ctx) -> void {
    for (int v : grp[u][ctx][0]) self(self, v, 0);
    cout << u << " ";
    for (int v : grp[u][ctx][1]) self(self, v, 1);
};
output(output, 1, 0);
```

注意递归进儿子时永远传 $0$：因为 $ctx$ 表示的是"这个点被删时它父亲在不在场"，而每个儿子在 `grp` 分组阶段就已经把自己的方向定死了，递归到 $v$ 之后要用的是 $v$ **自己**成立的那套方案——而根据构造过程，只要 $v$ 出现在某个 `grp[u][*][k]` 里，就说明 $dp[v][k \text{对应的那个 context}]$ 成立，代码里巧妙地统一用 $0$ 是因为分组时已经保证了合法性（`grp[u][0][0]`/`grp[u][1][0]` 放的都是 $dp[v][0]$ 成立的儿子，`[1]` 组放的都是 $dp[v][1]$ 成立的儿子，所以递归调用的第二个参数其实和放入哪个子列表是配套写死的，读代码时对应着看就好）。

### 6. 复杂度收尾

整个过程就是一遍树上 DFS 加一遍还原遍历，每个点、每条边都只处理常数次，复杂度 $O(n)$，多组数据总和依然是 $O(\sum n)$，$3$ 秒时限完全是绰绰有余。

这道 $*2400$ 的题最精彩的地方在于把"谁先谁后"直接翻译成了"这条边算不算进对方的奇偶和"，再发现每个节点修正自己奇偶性最多只需要一个"灵活儿子"当开关——想清楚这两层，剩下的双状态 DP 和顺序还原都是水到渠成的事。

### CPP 代码实现

```cpp
// H. Remove the Grail Tree

#include <bits/stdc++.h>
#define pb push_back
#define int long long
#define endl "\n"

using namespace std;

void solve() {

    int n;
    cin >> n;
    vector<int> a(n + 1);
    for (int i = 1; i <= n; i++) {
        cin >> a[i];
        a[i] &= 1;
    }

    vector<vector<int>> adj(n + 1);
    for (int i = 1; i < n; i++) {
        int u, v;
        cin >> u >> v;
        adj[u].pb(v);
        adj[v].pb(u);
    }

    // dp[u][0]: 删除 u 时父亲仍在场是否可行（根节点视为父亲值为 0）
    // dp[u][1]: 删除 u 时父亲已经被删除是否可行
    vector<array<int, 2>> dp(n + 1, {0, 0});
    // grp[u][ctx][0/1]: 在 dp[u][ctx] 这套方案下，哪些儿子排在 u 之前 / 之后删除
    vector<array<array<vector<int>, 2>, 2>> grp(n + 1);

    auto dfs = [&](auto&& self, int u, int p) -> void {
        int sum = 0, swap_child = 0;
        for (int v : adj[u]) {
            if (v == p) continue;
            self(self, v, u);
            if (!dp[v][0] && !dp[v][1]) { dp[u][0] = dp[u][1] = 0; return; }
            if (!dp[v][0]) {
                grp[u][0][1].pb(v);
                grp[u][1][1].pb(v);
                sum += a[v];
            } else if (!dp[v][1]) {
                grp[u][0][0].pb(v);
                grp[u][1][0].pb(v);
            } else if (a[v] == 0 || swap_child) {
                grp[u][0][0].pb(v);
                grp[u][1][0].pb(v);
            } else {
                swap_child = v;
            }
        }

        sum &= 1;
        int p_val = (p == 0 ? 0 : a[p]);

        if ((sum ^ p_val) == a[u]) {
            if (swap_child) { grp[u][0][1].pb(swap_child); dp[u][0] = 1; }
            else dp[u][0] = 0;
        } else {
            if (swap_child) grp[u][0][0].pb(swap_child);
            dp[u][0] = 1;
        }

        if (sum == a[u]) {
            if (swap_child) { grp[u][1][1].pb(swap_child); dp[u][1] = 1; }
            else dp[u][1] = 0;
        } else {
            if (swap_child) grp[u][1][0].pb(swap_child);
            dp[u][1] = 1;
        }
    };

    dfs(dfs, 1, 0);

    if (!dp[1][0]) {
        cout << "NO" << endl;
        return;
    }

    cout << "YES" << endl;
    auto output = [&](auto&& self, int u, int ctx) -> void {
        for (int v : grp[u][ctx][0]) self(self, v, 0);
        cout << u << " ";
        for (int v : grp[u][ctx][1]) self(self, v, 1);
    };
    output(output, 1, 0);
    cout << endl;

}

signed main() {

    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t;
    cin >> t;

    while (t--) {
        solve();
    }

}
```
