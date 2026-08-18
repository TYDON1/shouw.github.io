---
title: "CF题解——Minimum spanning tree for each edge"
date: "2026-05-18 20:47:12"
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
 - 图论
 - 最小生成树
 - 倍增
---

# E. Minimum spanning tree for each edge 解题思路

### 核心问题分析

给一张 $n$ 个点、$m$ 条边的带权无向连通图（无自环、无重边）。对**每一条边** $(u, v)$，问：在所有**必须包含这条边**的生成树里，权值最小的那棵是多少？生成树权值就是它所有边权之和。

数据范围 $n, m \le 2 \times 10^5$，边权 $w \le 10^9$。一共要回答 $m$ 个询问，每个询问都是"强制选这条边的最小生成树"。

翻译成人话：我们都知道整张图有一棵全局最小生成树（MST），权值记作 $\text{sum}$。现在有人按着你的手说"第 $i$ 条边你必须选"，那这棵被绑架的生成树最小能做到多少？如果一条一条边重新跑 Kruskal，那就是 $O(m \cdot m \alpha)$，$2\times10^5$ 平方级别直接原地爆炸。我们要找的是一个**把 MST 算一次、然后每条边 $O(\log n)$ 回答**的姿势。

### 1. 关键观察：被迫选一条边，无非是"换边"

先把全局 MST 求出来，权值 $\text{sum}$。现在分两种情况看这条被强制的边 $(u, v, w)$：

* **它本来就是树边**：那它已经在 MST 里了，强制选它一点不亏，答案直接就是 $\text{sum}$。

* **它是非树边**：现在硬要把它塞进 MST。塞进去之后，$u$ 和 $v$ 在树上本来就有一条唯一路径，这条新边一加，就和这条路径**凑成了一个环**。一棵树里有了环就不是树了，所以必须从这个环上**删掉一条边**才能重新变回生成树。

为了让删完之后权值最小，我们当然要在环上删掉**那条最贵的边**。而新加的边 $(u,v)$ 是非删不可（题目强制要它），所以删的对象只能是 $u \to v$ 树上路径上的那些原有边。设这条路径上的最大边权是 $\text{mx}$，那么答案就是：

$$ \text{ans}_i = \text{sum} - \text{mx} + w $$

这就是整道题的灵魂公式：**减掉路径上最贵的那条树边，加上被迫选的这条新边**。注意一个温柔的小细节——因为 $w$ 是非树边，在 Kruskal 里它没被选中，必然有 $w \ge \text{mx}$，所以 $\text{ans}_i \ge \text{sum}$，答案永远不会比全局 MST 还小，符合直觉。

### 2. 树上路径最大边：祭出倍增

剩下唯一的硬骨头就是：给定树上两点 $u, v$，快速求出它们之间路径上的**最大边权**。一眼倍增 LCA 的变体。

我们对每个点 $u$ 维护：

* `fa[u][i]`：$u$ 往上跳 $2^i$ 步到达的祖先；
* 以及"$u$ 到 `fa[u][i]` 这段路径上的最大边权"。

预处理时，先一遍 DFS 把每个点的深度 `dep`、它到父亲那条边的边权记下来（这就是 $2^0$ 级别的信息），再用经典递推合并：

$$ \text{fa}[u][i] = \text{fa}[\,\text{fa}[u][i-1]\,][i-1] $$

最大边权同理，跳 $2^i$ 等于先跳前 $2^{i-1}$、再跳后 $2^{i-1}$，两段取 $\max$。

源码里这块用了一个 lambda 递归 DFS，在进入子节点前就地把倍增表填好：

```cpp
auto dfs = [&](auto self, int u, int p, int w) -> void {
    dep[u] = dep[p] + 1;
    fa[u][0] = p;

    if (w % 2 != 0) max_odd[u][0] = w;
    else if (w != 0) max_even[u][0] = w;

    for (int i = 1; i <= LOG; i++) {
        fa[u][i] = fa[ fa[u][i-1] ][i-1];
        max_odd[u][i] = max(max_odd[u][i-1], max_odd[ fa[u][i-1] ][i-1]);
        max_even[u][i] = max(max_even[u][i-1], max_even[ fa[u][i-1] ][i-1]);
    }
    ...
};
```

### 3. 奇偶双轨：一个有趣的"分桶"细节

眼尖的同学会发现：这里维护的不是一个 `max`，而是 `max_odd` 和 `max_even` 两套表——按边权的**奇偶性**分别记最大值！奇数边权进 `max_odd`，非零偶数边权进 `max_even`，初值都是 $-1$。

为什么要这么分？其实对**本题**而言，这是一个略显富余的写法：我们最后要的就是路径上的整体最大边，把它拆成"路径上奇数边的最大值"和"路径上偶数边的最大值"两条轨道分开维护，查询时再——

$$ \text{mx} = \max(\text{res\_odd},\ \text{res\_even}) $$

把两轨合并回来，结果和直接维护一个 `max` 是**完全一致**的。所以这套奇偶分桶丝毫不影响正确性，只是把同一个最大值拆开存了一遍。用 $-1$ 当初值也很安全——边权恒为正，真实边一进来就会盖掉 $-1$，而那些一步都没跳的空段保持 $-1$，参与 $\max$ 时自动被忽略。

查询函数 `query(u, v)` 就是标准倍增 LCA 流程：先把较深的点往上提到和另一个点同深度，一路顺手收集经过段的 `max_odd / max_even`；若此时已重合，直接返回；否则两点一起往上跳，跳到 LCA 的两个孩子为止，最后再补上它们各自连向 LCA 的那条边。

```cpp
auto temp = tpq.query(Sides[i].u, Sides[i].v);
int max_n = max(temp.first, temp.second);
cout << sum - max_n + Sides[i].w << endl;
```

返回的 `{res_odd, res_even}` 取个 $\max$ 就是路径最大边，套进灵魂公式即得答案。

### 4. 主流程：Kruskal + 标记树边

主函数的节奏非常清爽：

1. 读入所有边，全塞进一个**大根堆**（`Side` 的 `operator<` 写的是 `w > a.w`，所以优先队列里边权小的先弹出，等价于按权升序——这就是 Kruskal）。
2. 配合并查集 `DSU` 跑 Kruskal：每弹出一条边，若两端不连通就合并、累加进 `sum`、并用 `vis[id] = true` 标记"这是树边"，同时把它加进邻接表 `adj` 建出 MST 这棵树。
3. 用建好的树构造 `TreePathQuery`（即倍增表）。
4. 最后按**输入顺序**枚举每条边：是树边（`vis[i]` 为真）就直接输出 `sum`；否则查路径最大边，输出 $\text{sum} - \text{mx} + w$。

注意所有 `id` 和 `vis` 都是按输入下标存的，所以最终能严格按"第 $1$ 到第 $m$ 条边的出现顺序"作答，不会串行。

复杂度方面：Kruskal 是 $O(m \log m)$，倍增预处理 $O(n \log n)$，每条非树边一次查询 $O(\log n)$，总共 $O((n + m)\log n)$，对 $2 \times 10^5$ 的规模轻轻松松。

### CPP 代码实现

```cpp
// CF609E Minimum spanning tree for each edge

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

struct TreePathQuery {
    int n, LOG;
    vector<int> dep;
    vector<vector<int>> fa, max_odd, max_even;

    TreePathQuery(int n, const vector<vector<pair<int, int>>>& adj, int root = 1) {
        this->n = n;
        this->LOG = 20;

        dep.assign(n + 1, 0);
        fa.assign(n + 1, vector<int>(LOG + 1, 0));
        max_odd.assign(n + 1, vector<int>(LOG + 1, -1));
        max_even.assign(n + 1, vector<int>(LOG + 1, -1));

        auto dfs = [&](auto self, int u, int p, int w) -> void {
            dep[u] = dep[p] + 1;
            fa[u][0] = p;

            if (w % 2 != 0) max_odd[u][0] = w;
            else if (w != 0) max_even[u][0] = w;

            for (int i = 1; i <= LOG; i++) {
                fa[u][i] = fa[ fa[u][i-1] ][i-1];
                max_odd[u][i] = max(max_odd[u][i-1], max_odd[ fa[u][i-1] ][i-1]);
                max_even[u][i] = max(max_even[u][i-1], max_even[ fa[u][i-1] ][i-1]);
            }

            for (auto edge : adj[u]) {
                int v = edge.first;
                int weight = edge.second;
                if (v != p) {
                    self(self, v, u, weight);
                }
            }
        };

        dfs(dfs, root, 0, 0);
    }

    pair<int, int> query(int u, int v) {
        int res_odd = -1, res_even = -1;
        if (dep[u] < dep[v]) swap(u, v);

        for (int i = LOG; i >= 0; i--) {
            if (dep[u] - (1 << i) >= dep[v]) {
                res_odd = max(res_odd, max_odd[u][i]);
                res_even = max(res_even, max_even[u][i]);
                u = fa[u][i];
            }
        }

        if (u == v) return {res_odd, res_even};

        for (int i = LOG; i >= 0; i--) {
            if (fa[u][i] != fa[v][i]) {
                res_odd = max({res_odd, max_odd[u][i], max_odd[v][i]});
                res_even = max({res_even, max_even[u][i], max_even[v][i]});
                u = fa[u][i];
                v = fa[v][i];
            }
        }

        res_odd = max({res_odd, max_odd[u][0], max_odd[v][0]});
        res_even = max({res_even, max_even[u][0], max_even[v][0]});

        return {res_odd, res_even};
    }
};

struct Side {
    int u, v, w, id;
    auto operator<(const Side& a) const {
        return w > a.w;
    }
};

struct DSU {
    vector<int> par;

    DSU(int n) {
        par.resize(n + 1);
        iota(par.begin(), par.end(), 0);
    }

    int find(int x) {
        if (par[x] == x) return x;
        return par[x] = find(par[x]);
    }

    void unite(int x, int y) {
        x = find(x);
        y = find(y);
        if (x == y) return;
        par[x] = y;
    }

    bool connected(int x, int y) {
        return find(x) == find(y);
    }
};

void solve() {

    int n, m;
    cin >> n >> m;
    vector<vector<pair<int, int>>> adj(n + 1);
    vector<Side> Sides(m + 1);
    vector<bool> vis(m + 1);
    priority_queue<Side> pq;
    for (int i = 1; i <= m; i++) {
        int u, v, w;
        cin >> u >> v >> w;
        pq.push({u, v, w, i});
        Sides[i].u = u, Sides[i].v = v, Sides[i].w = w, Sides[i].id = i;
    }
    DSU dsu(n);
    int sum = 0;
    while (!pq.empty()) {
        auto it = pq.top();
        pq.pop();
        int u = it.u, v = it.v;
        if (!dsu.connected(u, v)) {
            dsu.unite(u, v);
            vis[it.id] = true;
            sum += it.w;
            adj[it.u].pb({it.v, it.w});
            adj[it.v].pb({it.u, it.w});
        }
    }
    TreePathQuery tpq(n, adj);
    for (int i = 1; i <= m; i++) {
        if (vis[i]) {
            cout << sum << endl;
        } else {
            auto temp = tpq.query(Sides[i].u, Sides[i].v);
            int max_n = max(temp.first, temp.second);
            cout << sum - max_n + Sides[i].w << endl;
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
