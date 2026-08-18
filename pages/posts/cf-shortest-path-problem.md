---
title: "CF题解——Shortest Path Problem?"
date: "2026-05-10 21:42:11"
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
 - 位运算
 - 线性基
---

# G. Shortest Path Problem? 解题思路

### 核心问题分析

给一张带权无向连通图，一条路径的“长度”不是边权之和，而是这条路径上所有边权的**按位异或**。注意题目特别强调：**一条边可以重复走**，而重复走时它会被异或进去对应的次数。我们要求 $1$ 号点到 $n$ 号点的最小异或路径长度。

数据范围 $n, m \le 10^5$，边权 $0 \le w \le 10^8$（也就是不超过 $27$ 个二进制位，开 `long long` 完全够使）。

这个“题名带问号”的题目其实在暗示：它看着像最短路，其实**和经典最短路一毛钱关系都没有**。突破口全在“边可以重复走”和“异或”这两个性质的化学反应上——因为异或有一个性质：同一个东西异或两次就抵消了。这意味着我们可以**绕一个环再绕回来**，相当于给路径“叠加”上这个环的异或值，而不改变起点终点。这就是整道题的灵魂。

### 1. 顿悟时刻：答案 = 任意一条路径 异或 若干个环

先抛出核心结论：

> 设 $P_0$ 是从 $1$ 到 $n$ 的**任意一条**简单路径的异或值，设图中所有环的异或值构成集合 $\{c_1, c_2, \dots\}$。那么 $1 \to n$ 所有可达路径的异或值，恰好就是
> $$ \Big\{\; P_0 \oplus c_{i_1} \oplus c_{i_2} \oplus \cdots \;\Big|\; \text{任取若干个环} \;\Big\} $$

为什么任意一条路径都行、为什么环可以随便叠？两件事一起看：

- **任意两条 $1\to n$ 路径的异或值，相差恰好是一个环。** 把路径 $A$ 和路径 $B$ 拼起来（$1$ 沿 $A$ 走到 $n$，再沿 $B$ 倒着走回 $1$），就形成一个闭合回路，它的异或值是 $P_A \oplus P_B$。而闭合回路可以拆成若干个简单环的异或，所以 $P_A \oplus P_B$ 一定能由环异或值表示。换句话说，从 $P_0$ 出发，叠上环，就能跳到任何一条别的路径的值。
- **任何一个环都可以“免费”叠到当前路径上。** 走到环上某点，绕环一圈再回到这点，沿途用过的“去”和“回”的那段重复边因为异或两次抵消了，净效果就是把环的异或值叠进总答案，且不改变你最终停在哪。

所以问题被彻底转化成：**固定一个基准 $P_0$（取 $1\to n$ 的任意路径），再用一堆环异或值去对它做异或，使结果最小。** 这正是线性基的拿手好戏。

### 2. DFS 生成树：一棵树顺手把“路径”和“所有环”全抓出来

怎么同时拿到“一条 $1\to n$ 的路径”和“所有的环”？一次 DFS 生成树就够了，优雅得很。

我们从 $1$ 出发 DFS，给每个点记录一个 $d[u]$ —— 表示**从根 $1$ 沿生成树走到 $u$ 的路径异或值**。看代码里这段：

```cpp
auto dfs = [&](auto&& self, int now, int val) -> void {
    for (auto it : g[now]) {
        if (vis[it.v]) {
            lb.insert(d[it.v] ^ it.w ^ val);
            continue;
        }
        vis[it.v] = true;
        int temp = val ^ it.w;
        d[it.v] = temp;
        self(self, it.v, temp);
    }
};
vis[1] = true;
dfs(dfs, 1, 0);
```

逻辑分成两支，干净利落：

- **树边**（`it.v` 还没访问过）：往下递归，并把 $d[\text{子}] = d[\text{父}] \oplus w$ 记下来。$d[n]$ 自然就是 $1 \to n$ 在这棵树上的那条路径的异或值，也就是我们的基准 $P_0$。
- **非树边 / 返祖边**（`it.v` 已经访问过）：这条边和树上的路径会**凑成一个环**！这个环的异或值正是 $d[u] \oplus w \oplus d[v]$ —— 即从根到 $u$、走这条边到 $v$、再沿树边从 $v$ 回到根，三段拼起来。代码里写的就是 `d[it.v] ^ it.w ^ val`（这里 `val` 就是当前点 $u$ 的 $d[u]$）。把它直接 `insert` 进线性基。

顺带一提，题目里的**自环**（$x=x$ 的边）会怎样？它在 DFS 里也会被当成“指向已访问点”，于是 `d[u] ^ w ^ d[u] = w` 被塞进基里 —— 完全正确，自环本身就是一个异或值为 $w$ 的环，第二个样例 `1 1 3` 就靠它。这套写法对重边、自环、loop 一视同仁，丝毫不影响。

### 3. 线性基登场：把“随便叠环”变成“按位贪心压最小”

现在我们手上有一个基准值 $P_0 = d[n]$，和一个装满了所有环异或值的线性基 `lb`。要做的就是：用线性基里这些向量的任意异或组合去异或 $P_0$，让结果尽可能小。

线性基的 `insert` 会把每个环值按最高位归约进 `p[]` 数组，自动消除线性相关、只保留张成整个环空间的那一组基。求最小值就是经典的从高位到低位贪心：

```cpp
int query_min(int res) {
    for (int i = MAX_L; i >= 0; --i) {
        if ((res ^ p[i]) < res) {
            res ^= p[i];
        }
    }
    return res;
}
```

从最高位往下扫，只要异或上某个基向量能让当前值**变小**就异或上去。因为基向量 `p[i]` 的最高位是第 $i$ 位且互不相同，所以高位一旦能被消成 $0$，就一定要消 —— 高位上省下的 $2^i$ 比所有低位加起来还多，贪心是正确的。最终

$$ \text{ans} = \min_{S}\Big( d[n] \oplus \bigoplus_{c \in S} c \Big) = \texttt{lb.query\_min}(d[n]) $$

一行 `cout << lb.query_min(d[n]) << endl;` 收工。

拿第一个样例验证一下：$1\to 3$ 直接走那条权 $2$ 的边，$d[3]=2$；图里有个环 $1\to2\to3\to1$ 异或值是 $3\oplus0\oplus2=1$。用基去压 $2$（二进制 `10`），异或上 $1$（`01`）得 `11`=3 反而更大，所以不动，答案就是 $2$，和样例一致。

### 4. 复杂度小结

DFS 遍历整张图是 $O(n+m)$；每插入一个环值进线性基是 $O(\log W)$（$W$ 是值域，这里 $\log W$ 不超过 $27$ 上下，代码里直接开到 $63$ 位也无所谓）；非树边数量是 $O(m)$。所以总复杂度

$$ O\big((n + m)\log W\big) $$

对 $10^5$ 的规模轻轻松松，$3$ 秒时限里跑得飞起。这道带问号的“最短路”，最后竟然连一次 Dijkstra 都没用上 —— 全靠**异或环空间 + 线性基**这套组合拳，妙不妙？

### CPP 代码实现

```cpp
// G. Shortest Path Problem?

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

struct LinearBasis {
    static const int MAX_L = 63;
    int p[MAX_L + 1];
    int d[MAX_L + 1];
    int cnt;
    bool has_zero;

    LinearBasis() {
        memset(p, 0, sizeof(p));
        memset(d, 0, sizeof(d));
        cnt = 0;
        has_zero = false;
    }

    bool insert(int x) {
        for (int i = MAX_L; i >= 0; --i) {
            if (!(x >> i)) continue;
            if (!p[i]) {
                p[i] = x;
                cnt++;
                return true;
            }
            x ^= p[i];
        }
        has_zero = true;
        return false;
    }

    int query_max(int res) {
        for (int i = MAX_L; i >= 0; --i) {
            if ((res ^ p[i]) > res) {
                res ^= p[i];
            }
        }
        return res;
    }

    int query_min(int res) {
        for (int i = MAX_L; i >= 0; --i) {
            if ((res ^ p[i]) < res) {
                res ^= p[i];
            }
        }
        return res;
    }

    void rebuild() {
        cnt = 0;
        for (int i = 0; i <= MAX_L; ++i) d[i] = 0;

        for (int i = MAX_L; i >= 0; --i) {
            for (int j = i - 1; j >= 0; --j) {
                if ((p[i] >> j) & 1) p[i] ^= p[j];
            }
        }
        for (int i = 0; i <= MAX_L; ++i) {
            if (p[i]) d[cnt++] = p[i];
        }
    }

    int query_kth(int k) {
        if (has_zero) k--;
        if (k == 0) return 0;
        if (k >= (1 << cnt)) return -1;

        int res = 0;
        for (int i = 0; i < cnt; ++i) {
            if ((k >> i) & 1) res ^= d[i];
        }
        return res;
    }
};

struct Edge {
    int v, w;
};

void solve() {

    int n, m;
    cin >> n >> m;
    vector<vector<Edge>> g(n + 1);
    vector<int> d(n + 1);
    vector<bool> vis(n + 1);
    for (int i = 1; i <= m; i++) {
        int u, v, w;
        cin >> u >> v >> w;
        g[u].push_back({v, w});
        g[v].push_back({u, w});
    }
    LinearBasis lb;
    auto dfs = [&](auto&& self, int now, int val) -> void {
        for (auto it : g[now]) {
            if (vis[it.v]) {
                lb.insert(d[it.v] ^ it.w ^ val);
                continue;
            }
            vis[it.v] = true;
            int temp = val ^ it.w;
            d[it.v] = temp;
            self(self, it.v, temp);
        }
    };
    vis[1] = true;
    dfs(dfs, 1, 0);
    cout << lb.query_min(d[n]) << endl;

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
