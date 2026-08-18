---
title: "CF题解——We Need More Bosses"
date: "2026-05-21 21:42:18"
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
 - 边双连通分量
 - 树的直径
---

# E. We Need More Bosses 解题思路

### 核心问题分析

你的朋友在做游戏：$n$ 个地点、$m$ 条双向通道，整张图**连通**（任意两点互达）。游戏起点 $s$、终点 $t$ 还没定。定好之后，他会在**每一条「无论怎么走都绕不开」的通道**上放一个 Boss——也就是说，删掉这条通道后 $s$ 和 $t$ 就断了。他想放尽可能多的 Boss，于是问你：在所有 $s, t$ 的选法里，这种「绕不开的通道」最多能有多少条？

把这句话翻译成图论黑话：对于固定的 $(s,t)$，一条边是 Boss 当且仅当它是 $s\to t$ 任意路径都必经的边——这正是 $s$ 与 $t$ 之间的**桥**。要让 Boss 最多，就是要在所有点对里，找一对 $(s,t)$ 使得它们之间夹着的桥最多。

数据范围 $n, m \le 3\times 10^5$，妥妥的线性算法题。突破口就藏在「桥」这个词里——一条边只要不是桥（即它处在某个环上），那么它两端的点必有「另一条退路」绕过它，永远当不了 Boss。所以真正能贡献 Boss 的，**只有桥**。

### 1. 先把「无所谓」的边揉成一团：边双缩点

既然非桥边永远成不了 Boss，那它们对答案毫无贡献，我们干脆把它们「焊死」。

把通过非桥边互相可达的点缩成一个团——这就是经典的**边双连通分量（E-BCC）**。一个边双内部任意两点之间都至少有两条边不相交的路径，谁也卡不住谁，内部一个 Boss 都放不了。缩点之后，原图里剩下的、横跨在不同边双之间的边，恰好就是全部的**桥**。

代码里 `TarjanEBCC` 干的就是这件事。用一遍 Tarjan，按 `dfn / low` 找桥，再用栈把每个边双弹出来打上编号：

```cpp
if (low[v] > dfn[u]) {
    is_bridge[e_id] = true;
}
...
if (dfn[u] == low[u]) {
    ++ebcc_cnt;
    while (true) {
        int t = st.top();
        st.pop();
        id[t] = ebcc_cnt;
        sz[ebcc_cnt]++;
        if (t == u) break;
    }
}
```

这里有个值得圈出来的小细节：判重边用的是**边的编号** `edge_in`，而不是父节点。`if (e_id == edge_in) continue;` 只跳过「来时走的那条边」。本题题面虽然保证没有重边，但用编号去重是最稳妥的写法，丝毫不影响正确性，还顺手把「有重边」的一般情形也覆盖了。

### 2. 缩点之后，图变成了一棵树

缩完点最关键的领悟来了：**把所有边双当作新的点、所有桥当作新的边，得到的新图一定是一棵树**（这里原图连通，所以是一棵树而不是森林）。

为什么是树？因为新图里任何一条边都是桥——而桥的定义就是「删了它就断开」，所以新图里**根本不可能有环**（环上的边都不是桥，早被揉进边双里了）。无环又连通，那就是树，这棵树我们管它叫**桥树（缩点树）**。代码里就是这段，遍历所有原边，只把跨边双的那些（即桥）连进新图 `g_now`：

```cpp
for (int i = 1; i <= m; i++) {
    int u = nums[i].first, v = nums[i].second;
    int id_u = ebcc.id[u];
    int id_v = ebcc.id[v];
    if (id_u != id_v) {
        g_now[id_u].pb(id_v);
        g_now[id_v].pb(id_u);
    }
}
```

到这一步，原问题被漂亮地改写了：选一对 $(s,t)$、数它们之间的桥，等价于在桥树上**选两个节点，数它们之间路径上的边数**。而我们要的是这个边数的最大值。

### 3. 顿悟时刻：答案就是桥树的直径

「树上任意两点路径边数的最大值」是什么？这不就是**树的直径**嘛！

到这里整道 \*2100 的题被我们扒得只剩一层窗户纸了：答案 $=$ 桥树的直径。剩下的就是无脑求直径，用最朴素的**两次 DFS**：

1. 从任意一点（代码取边双编号 $1$）出发，DFS 找到最远的点 $A$；
2. 再从 $A$ 出发 DFS，找到的最远距离就是直径。

代码里这个 lambda 递归地维护 `max_n = {当前最大深度, 对应节点}`：

```cpp
if (k > 0) {
    max_n = {-1, 0};
    dfs(dfs, 0, 1, 0);
    int A = max_n.second;
    max_n = {-1, 0};
    dfs(dfs, 0, A, 0);
    int dis = max_n.first;
    cout << dis << endl;
} else {
    cout << 0 << endl;
}
```

第一次从 $1$ 跑出端点 $A$，第二次从 $A$ 跑出的最大深度 `dis` 就是直径，直接输出。这里的 `depth` 一路 $+1$ 数的正是**桥的条数**，所以 `dis` 就是 Boss 的最大数量，含义对得严丝合缝。

为什么两次 DFS 能保证求出直径？经典结论：从任意点出发能到达的最远点，必定是某条直径的一个端点；再从这个端点出发跑到最远，量出的就是整条直径。证明这里就不展开了，是树论的老朋友了。

顺带提一句那个 `else` 分支——理论上图连通时边双数 $k \ge 1$ 恒成立，`k > 0` 一定为真，这个 `else 输出 0` 只是个防御性的兜底，不会真正触发。

### 4. 复杂度小结

- Tarjan 求边双 + 缩点：$O(n + m)$；
- 建桥树：$O(m)$；
- 两次 DFS 求直径：$O(k) \le O(n)$。

总复杂度 $O(n + m)$，对着 $3\times 10^5$ 的数据随便跑。一道看起来唬人的图论题，被「桥 → 边双缩点 → 桥树 → 直径」这条链子一拆，瞬间就清爽了。

我们拿第一个样例验证一下：$5$ 个点、$5$ 条边，$1\text{-}2\text{-}3\text{-}1$ 构成一个三元环（一个边双），$4,5$ 通过桥挂上去。缩完点后桥树长度最长的路径夹着 $2$ 条桥，答案 $2$，和样例对上了。第二个样例是一条链，三条边全是桥，直径就是 $3$，同样对上。完美收工。

### CPP 代码实现

```cpp
// E. We Need More Bosses

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
    int to;
    int id;
};

struct TarjanEBCC {
    int n;
    int m;
    int step_count;
    int ebcc_cnt;
    vector<int> dfn;
    vector<int> low;
    vector<int> id;
    vector<int> sz;
    vector<bool> is_bridge;
    stack<int> st;
    TarjanEBCC(int n, int m) {
        this->n = n;
        this->m = m;
        step_count = 0;
        ebcc_cnt = 0;
        dfn.assign(n + 1, 0);
        low.assign(n + 1, 0);
        id.assign(n + 1, 0);
        sz.assign(n + 1, 0);
        is_bridge.assign(m + 1, false);
    }

    void dfs(int u, int edge_in, const vector<vector<Edge>>& g) {
        dfn[u] = low[u] = ++step_count;
        st.push(u);

        for (auto& edge : g[u]) {
            int v = edge.to;
            int e_id = edge.id;

            if (e_id == edge_in) continue;

            if (!dfn[v]) {
                dfs(v, e_id, g);
                low[u] = min(low[u], low[v]);

                if (low[v] > dfn[u]) {
                    is_bridge[e_id] = true;
                }
            } else {
                low[u] = min(low[u], dfn[v]);
            }
        }

        if (dfn[u] == low[u]) {
            ++ebcc_cnt;
            while (true) {
                int t = st.top();
                st.pop();
                id[t] = ebcc_cnt;
                sz[ebcc_cnt]++;
                if (t == u) break;
            }
        }
    }

    void build(const vector<vector<Edge>>& g) {
        for (int i = 1; i <= n; i++) {
            if (!dfn[i]) {
                dfs(i, 0, g);
            }
        }
    }
};

void solve() {
    
    int n, m;
    cin >> n >> m;
    vector<vector<Edge>> g(n + 1);
    vector<pair<int, int>> nums(m + 1);
    for (int i = 1; i <= m; i++) {
        int u, v;
        cin >> u >> v;
        g[u].pb({v, i});
        g[v].pb({u, i});
        nums[i].first = u, nums[i].second = v;
    }

    TarjanEBCC ebcc(n, m);
    ebcc.build(g);

    int k = ebcc.ebcc_cnt;
    vector<vector<int>> g_now(k + 1);
    for (int i = 1; i <= m; i++) {
        int u = nums[i].first, v = nums[i].second;
        int id_u = ebcc.id[u];
        int id_v = ebcc.id[v];
        if (id_u != id_v) {
            g_now[id_u].pb(id_v);
            g_now[id_v].pb(id_u);
        }
    }

    pair<int, int> max_n = {-1, 0};

    auto dfs = [&] (auto& self, int p, int u, int depth) -> void {
        if (depth > max_n.first) {
            max_n = {depth, u};
        }
        for (auto v : g_now[u]) {
            if (v == p) continue;
            self(self, u, v, depth + 1);
        }
    };

    if (k > 0) {
        max_n = {-1, 0};
        dfs(dfs, 0, 1, 0);
        int A = max_n.second;
        max_n = {-1, 0};
        dfs(dfs, 0, A, 0);
        int dis = max_n.first;
        cout << dis << endl;
    } else {
        cout << 0 << endl;
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
