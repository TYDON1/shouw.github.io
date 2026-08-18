---
title: "CF题解——A and B and Lecture Rooms"
date: "2026-05-17 22:31:09"
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
 - 树形结构
 - LCA
 - 倍增
---

# E. A and B and Lecture Rooms 解题思路

### 核心问题分析

题面包装得很文艺：一所大学是棵 $n$ 个点、$n-1$ 条边的树。每天 A 在房间 $x$ 出题、B 在房间 $y$ 出题，他俩想找一间房子开会，要求这间房**到 $x$ 和到 $y$ 的距离相等**。树上两点距离就是它们之间唯一路径的边数。每次询问 $(x, y)$，问有多少个点到 $x$、$y$ 等距。

数据范围 $n, m \le 10^5$，每次询问都暴力扫一遍 $O(n)$ 个点显然要爆。我们得把"到 $x, y$ 等距的点集"刻画成一个**能 $O(\log n)$ 算出大小**的几何对象。突破口在于：树上路径是唯一的，所谓"等距"本质上是绕着 $x, y$ 路径的**中点**做文章。

### 1. 先把三种平凡情形拍死

先把代码开头那几个 `continue` 解决掉，省得后面纠结边界：

```cpp
if (x == y) {
    cout << n << endl;
    continue;
}
int l = lca(x, y);
int dist = depth[x] + depth[y] - 2 * depth[l];
if (dist % 2 != 0) {
    cout << 0 << endl;
    continue;
}
```

* **$x = y$**：到自己距离 $0$、到对方也距离 $0$，那全树每个点到这两个"同一个点"的距离当然都相等，答案就是 $n$。
* **距离为奇数**：树上 $x$ 到 $y$ 的距离 $d = \mathrm{dep}(x) + \mathrm{dep}(y) - 2\,\mathrm{dep}(\mathrm{lca})$。如果 $d$ 是奇数，那根本不存在"正中间"那个点——任何点到 $x, y$ 的距离奇偶性必然一个奇一个偶，永远凑不成相等。直接输出 $0$。

只有 $d$ 为偶数时才有戏。设 $\text{half} = d / 2$，路径上从 $x$ 走 $\text{half}$ 步落到的那个点，就是这条路径的**中点 $M$**。所有等距点必然到 $M……$ 别急，我们慢慢看。

### 2. 倍增三件套：LCA、第 k 步、找中点

要快速做这些事，先把倍增祖先表 `fa[u][i]` 建好（$\mathrm{fa}[u][i]$ 表示 $u$ 往上跳 $2^i$ 步的祖先），同时记下每个点的深度 `depth`。`LOG = 20` 足够覆盖 $10^5$。

有了倍增表，`get_k(u, v, k)` 就能在 $O(\log n)$ 内求出 **$u$ 到 $v$ 路径上、从 $u$ 数第 $k$ 个点**：先求 LCA，判断第 $k$ 步落在 $u$ 这半边还是 $v$ 那半边，然后按 $k$ 的二进制位往上跳：

```cpp
auto get_k = [&](int u, int v, int k) -> int {
    int l = lca(u, v);
    int dist_u_to_lca = depth[u] - depth[l];
    int total_dist = depth[u] + depth[v] - 2 * depth[l];
    if (k > total_dist) return 0;
    if (k <= dist_u_to_lca) {
        int curr = u;
        for (int i = LOG - 1; i >= 0; --i)
            if ((k >> i) & 1) curr = fa[curr][i];
        return curr;
    } else {
        int steps_from_v = total_dist - k;
        ...
    }
};
```

如果 $k$ 还没跨过 LCA（$k \le$ $u$ 到 LCA 的距离），就直接从 $u$ 往上跳 $k$ 步；否则换个角度——从 $v$ 那头往回数 $\text{total\_dist} - k$ 步，等价地跳过去。这个小技巧避免了"从 LCA 往下走"的麻烦（树上往下走没有唯一方向，但往上跳是确定的）。

中点就是 `get_k(x, y, half)`，记作 $M$。

### 3. 核心几何观察：等距点都挂在中点 M 上

来到本题的灵魂。设中点为 $M$，它两侧路径上各有一个**贴着 $M$ 的邻居**：靠 $x$ 那侧的记 $\text{no\_x}$，靠 $y$ 那侧的记 $\text{no\_y}$。代码里用 `get_ans` 一把抓出来：

```cpp
auto get_ans = [&](int u, int v, int dist) -> pair<int, int> {
    if (dist <= 0) return {0, 0};
    int prev_u = get_k(u, v, dist - 1);   // 离中点最近、偏 u 一侧的点
    int prev_v = get_k(v, u, dist - 1);   // 离中点最近、偏 v 一侧的点
    return {prev_u, prev_v};
};
```

`get_k(x, y, half - 1)` 是从 $x$ 走 $\text{half}-1$ 步的点——也就是中点 $M$ 在 $x$ 这一侧的紧邻；同理另一边。

现在断言：**一个点 $p$ 到 $x, y$ 等距，当且仅当 $p$ 到 $x, y$ 的路径都恰好在 $M$ 处汇合**，再说直白点，$p$ 必须"挂"在 $M$ 上而**不能跑进 $\text{no\_x}$ 或 $\text{no\_y}$ 所代表的那两个分支里**。

为啥？任取一点 $p$，它到 $x$、到 $y$ 的两条路径，从 $p$ 出发一定会在某处并入 $x$–$y$ 主路径，记交汇点为 $c$。于是 $\mathrm{dist}(p,x) = \mathrm{dist}(p,c) + \mathrm{dist}(c,x)$、$\mathrm{dist}(p,y) = \mathrm{dist}(p,c) + \mathrm{dist}(c,y)$。两者相等 $\iff \mathrm{dist}(c,x) = \mathrm{dist}(c,y) \iff c = M$。也就是说，**所有等距点，到主路径的接入口必须正好是中点 $M$**。

### 4. 子树相减：把答案数出来

知道了"等距点 = 接入口为 $M$ 的点"，剩下就是计数。这分两种情况，恰好对应代码最后那个 `if`：

**情形一：$\mathrm{dep}(x) = \mathrm{dep}(y)$（$M$ 就是 LCA）。**

此时中点 $M$ 正是 $x, y$ 的最近公共祖先。以 $1$ 为根，整棵树有 $n$ 个点；要排除的是那些"接入口不是 $M$"的点——也就是会先拐进 $\text{no\_x}$ 子树或 $\text{no\_y}$ 子树的点。这两个子树里的点，到 $x$、$y$ 的距离一定不等（它们偏向了某一边）。所以答案是

$$ n - \mathrm{sons}(\text{no\_x}) - \mathrm{sons}(\text{no\_y}) $$

```cpp
if (depth[x] == depth[y]) {
    cout << n - sons[no_x] - sons[no_y] << endl;
}
```

这里 `sons[u]` 是以 $1$ 为根时 $u$ 的子树大小，提前一遍 DFS 求好。$\text{no\_x}, \text{no\_y}$ 是 $M$ 的两个孩子方向，它们的子树两两不交、也不含 $M$ 本身，所以减一减就把"会偏向 $x$ 一侧"和"会偏向 $y$ 一侧"的点干净地剔除了，剩下的全是合法等距点（包括 $M$ 自己，以及挂在 $M$ 其它分支上的点）。

**情形二：$\mathrm{dep}(x) \ne \mathrm{dep}(y)$（$M$ 不是 LCA，深的那侧在 $M$ 子树里）。**

代码先 `swap` 保证 $x$ 是更深的那个：

```cpp
if (depth[x] < depth[y]) {
    swap(x, y);
    swap(no_x, no_y);
}
cout << sons[now] - sons[no_x] << endl;
```

注意 `now` 就是中点 $M$（代码里 `int now = get_k(x, y, half);`）。既然 $x$ 更深，那中点 $M$ 一定落在 $x$ 到 LCA 这段上，是 LCA 的某个真后代。这时合法的等距点只可能藏在 **$M$ 的子树内部**——因为 $M$ 子树外的点接入主路径时根本到不了 $M$（会从 $M$ 上方接入，偏向 $y$）。而 $M$ 子树里，又要扣掉**偏向 $x$ 的那一支**，也就是 $\text{no\_x}$ 的子树。于是

$$ \mathrm{sons}(M) - \mathrm{sons}(\text{no\_x}) $$

这里 $\text{no\_x}$ 是 $M$ 在 $x$ 一侧的孩子，它的整棵子树都更靠近 $x$，必须排除；而 $y$ 一侧根本不在 $M$ 子树内，天然就不用管，所以这次只减一项。

### 5. 复盘一下整套流程

把上面拼起来，每次询问的逻辑就是：

1. 求 LCA、算距离 $d$；$x=y$ 输出 $n$，$d$ 为奇输出 $0$。
2. $\text{half} = d/2$，倍增找中点 $M$ 和它两侧紧邻 $\text{no\_x}, \text{no\_y}$。
3. 同深度 $\Rightarrow$ $n - \mathrm{sons}(\text{no\_x}) - \mathrm{sons}(\text{no\_y})$；否则让 $x$ 取深的一侧，输出 $\mathrm{sons}(M) - \mathrm{sons}(\text{no\_x})$。

预处理倍增表与子树大小是 $O(n \log n)$，每次询问几次倍增跳跃都是 $O(\log n)$，总复杂度

$$ O\big((n + m)\log n\big) $$

对 $10^5$ 的规模轻轻松松，2 秒时限里随便跑。一道看着吓人、其实把"中点 + 子树相减"想通就秒掉的好题。

### CPP 代码实现

```cpp
// E. A and B and Lecture Rooms

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

    int n;
    cin >> n;
    vector<vector<int>> g(n + 1);
    for (int i = 1; i < n; i++) {
        int u, v;
        cin >> u >> v;
        g[u].pb(v);
        g[v].pb(u);
    }
    const int LOG = 20;
    vector<int> depth(n + 1, 0);
    vector<vector<int>> fa(n + 1, vector<int>(LOG, 0));
    auto dfs = [&] (auto&& self, int u, int p) -> void {
        fa[u][0] = p;
        for (int i = 1; i < LOG; ++i) {
            fa[u][i] = fa[fa[u][i - 1]][i - 1];
        }
        for (auto it : g[u]) {
            if (it == p) continue;
            depth[it] = depth[u] + 1;
            self(self, it, u);
        }
    };
    dfs(dfs, 1, 0);
    auto lca = [&](int u, int v) -> int {
        if (depth[u] < depth[v]) swap(u, v);
        for (int i = LOG - 1; i >= 0; --i) {
            if (depth[fa[u][i]] >= depth[v]) {
                u = fa[u][i];
            }
        }
        if (u == v) return u;
        for (int i = LOG - 1; i >= 0; --i) {
            if (fa[u][i] != fa[v][i]) {
                u = fa[u][i];
                v = fa[v][i];
            }
        }
        return fa[u][0];
    };
    auto get_k = [&](int u, int v, int k) -> int {
        int l = lca(u, v);
        int dist_u_to_lca = depth[u] - depth[l];
        int total_dist = depth[u] + depth[v] - 2 * depth[l];

        if (k > total_dist) return 0;

        if (k <= dist_u_to_lca) {
            int curr = u;
            for (int i = LOG - 1; i >= 0; --i) {
                if ((k >> i) & 1) curr = fa[curr][i];
            }
            return curr;
        } else {
            int steps_from_v = total_dist - k;
            int curr = v;
            for (int i = LOG - 1; i >= 0; --i) {
                if ((steps_from_v >> i) & 1) curr = fa[curr][i];
            }
            return curr;
        }
    };
    auto get_ans = [&](int u, int v, int dist) -> pair<int, int> {
        if (dist <= 0) return {0, 0};
        int prev_u = get_k(u, v, dist - 1);
        int prev_v = get_k(v, u, dist - 1);

        return {prev_u, prev_v};
    };
    vector<int> sons(n + 1, 0);
    auto get_son = [&] (auto&& self, int u, int p) -> void {
        int sum = 1;
        for (auto it : g[u]) {
            if (it == p) continue;
            self(self, it, u);
            sum += sons[it];
        }
        sons[u] = sum;
    };
    get_son(get_son, 1, 0);
    int q;
    cin >> q;
    for (int i = 1; i <= q; i++) {
        int x, y;
        cin >> x >> y;
        if (x == y) {
            cout << n << endl;
            continue;
        }
        int l = lca(x, y);
        int dist = depth[x] + depth[y] - 2 * depth[l];
        if (dist % 2 != 0) {
            cout << 0 << endl;
            continue;
        }
        int half = dist / 2;
        auto temp = get_ans(x, y, half);
        int no_x = temp.first;
        int no_y = temp.second;
        int now = get_k(x, y, half); // 中点
        if (depth[x] == depth[y]) {
            cout << n - sons[no_x] - sons[no_y] << endl;
        } else {
            if (depth[x] < depth[y]) {
                swap(x, y);
                swap(no_x, no_y);
            }
            cout << sons[now] - sons[no_x] << endl;
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
