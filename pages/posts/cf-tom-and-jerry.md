---
title: "CF题解——Tom and Jerry"
date: "2026-06-15 22:12:48"
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
 - 博弈论
 - 树
 - 图论
---

# E. Tom and Jerry 解题思路

### 核心问题分析

题意：给一棵 $n$ 个点的树。Tom 和 Jerry 轮流操作，Tom 先手。第 $i$ 轮当前玩家选一条简单路径 $(x_i, y_i)$，要求：

1. $x_i \ne y_i$（路径至少一条边）；
2. 与之前所有选过的路径**不共边**；
3. $x_i$ 或 $y_i$ **必须是上一轮那条路径上的点**（$i \ge 2$ 时才有这条限制）。

不能行动者输。问 Tom 第一步有多少种选择能保证必胜。

多组数据，$\sum n \le 2\times10^5$，时限 $2$ 秒。

### 1. 从"删掉路径之后的度数"看问题

博弈题的第一步永远是找不变量。这里有个非常自然的量：**每个点还剩几条没被用过的边**。

假设 Tom 第一步选了路径 $P$ 从 $x$ 到 $y$。把 $P$ 的边从树上删掉，$P$ 上各点的度数怎么变？

- 两个**端点** $x, y$：各少了 $1$ 条边，度数**奇偶性翻转**；
- 所有**内部点**：路径从一边进、另一边出，各少了 $2$ 条边，度数**奇偶性不变**。

于是有一个漂亮的等价刻画：

> **删掉 $P$ 之后，$P$ 上的每个点剩余度数都是偶数**
> $\iff$ $\deg(x), \deg(y)$ 都是**奇数**，且路径上所有内部点的度数都是**偶数**。

先把这个条件记作"**偶性条件**"，接下来说明它就是必胜的充要条件。

### 2. 为什么"全偶"就是必胜态

**先证充分性。** 假设 Tom 第一步之后，他路径上的每个点剩余度数都是偶数。现在轮到 Jerry。

Jerry 必须从 Tom 路径上的某个点 $v$ 出发，选一条路径 $v \to w$。走出这一步之后，$v$ 少了一条边，剩余度数从偶变成**奇数**——而奇数 $\ge 1$，这意味着 **$v$ 一定还有没用过的边**！

于是 Tom 的应对策略呼之欲出：**从 $v$ 继续走**（$v$ 在 Jerry 的路径上，合法）。具体走到哪？走到**离 $v$ 最近的那个剩余度数为奇数的点** $z$。

这个选择有两个好处：

- 路径 $v \to z$ 上的内部点全都是偶数度（因为 $z$ 是最近的奇点，中间不可能再有奇点）；
- 走完之后，端点 $v$ 和 $z$ 的奇偶性各翻转一次，双双变成偶数，内部点保持偶数——**偶性条件被完美恢复**。

而这样的 $z$ 一定存在：在剩余的森林里，$v$ 所在连通块的奇度点个数必是偶数（握手定理），$v$ 自己是一个，所以至少还有另一个。

所以只要 Tom 建立了偶性条件，他就能**永远接得上招**：Jerry 每走一步都会制造出一个奇点，那个奇点必然还留着边，Tom 就顺着它走并再次恢复偶性。Tom 永远有棋走，先无棋可走的只能是 Jerry。

**再证必要性。** 反过来，如果 Tom 第一步之后，他路径上存在某个点 $u$ 剩余度数是奇数，那 Jerry 只要照抄上面这套策略——从 $u$ 出发走到最近的奇点——就能把偶性条件抢到自己手里，然后由同样的论证，赢的人变成 Jerry。

所以结论干净利落：

> **Tom 第一步 $(x,y)$ 必胜 $\iff$ $\deg(x)$ 与 $\deg(y)$ 均为奇数，且路径上所有内部点度数均为偶数。**

### 3. 剩下的就是数数了

现在问题变成纯计数：数有多少条路径满足"两端奇、中间全偶"。按路径长度分两类。

**长度为 $1$ 的路径**（即一条边，没有内部点）：直接枚举每条边，判断两个端点度数是否都是奇数。

```cpp
for (auto& it : edges) {
    if (deg[it.first] % 2 != 0 && deg[it.second] % 2 != 0) ans++;
}
```

**长度 $\ge 2$ 的路径**：它的内部点全是偶度点，而且在树上是连续的一段——所以这些内部点必然落在同一个"**偶点连通块**"里（把所有偶度点拿出来，它们之间的树边构成若干连通块）。

反过来看：固定一个偶点连通块 $C$，从 $C$ 连出去、通向奇度点的边有 $e_C$ 条。任取**两条**这样的边 $e_1 = (c_1, u_1)$、$e_2 = (c_2, u_2)$（$c_1, c_2 \in C$，$u_1, u_2$ 是奇度点），它们就唯一确定了一条路径

$$ u_1 \to c_1 \to (\text{在 } C \text{ 内部走}) \to c_2 \to u_2 $$

两端 $u_1, u_2$ 是奇度点，中间全部落在 $C$ 里所以全是偶度点——正是我们要的。而且树上两点间路径唯一，这个对应是**双射**。

（顺带一提：$u_1$ 和 $u_2$ 必然不同。否则同一个点通过两条不同的边连到 $C$，树上就出现环了。）

所以这一类的贡献是 $\dbinom{e_C}{2}$，对所有偶点连通块求和：

```cpp
for (int i = 1; i <= n; i++) {
    if (deg[i] % 2 == 0 && !vis[i]) {
        int odd = 0;
        // BFS 遍历这个偶点连通块
        while (head < sz(q)) {
            int u = q[head++];
            for (int v : adj[u]) {
                if (deg[v] % 2 != 0) odd++;          // 一条通向奇点的出边
                else if (!vis[v]) { vis[v] = true; q.pb(v); }
            }
        }
        ans += odd * (odd - 1) / 2;
    }
}
```

BFS 时对每个块内点扫一遍邻居：邻居是奇点就给 $e_C$ 加一（每条出边恰好被数一次），是偶点就继续扩展连通块。

### 4. 复杂度

读边 $O(n)$，第一类枚举边 $O(n)$，第二类是对整棵树做一遍并查集式的 BFS，每条边被访问常数次，$O(n)$。总计

$$ O(n) $$

$\sum n \le 2\times10^5$，随便跑。

另外注意开 `long long`：星形结构下 $e_C$ 能到 $2\times10^5$，$\binom{e_C}{2}$ 就是 $2\times10^{10}$ 量级，$32$ 位整数直接爆掉。

回头看这道 $*2300$ 的题，题面把规则写得又长又绕，但真正的解法只有一句话：**"删掉路径后全偶"就是必胜态**。而找到这个不变量的路径也很朴素——博弈题里"谁先没棋走"的问题，本质上都是在数边的奇偶；只要盯住"端点翻转、内部点不变"这个最基础的观察，剩下的策略论证和计数就都是顺水推舟。这种题最怕的是被冗长的规则吓住，其实一旦动手算一算度数，答案很快就自己浮出来了。

### CPP 代码实现

```cpp
// E. Tom and Jerry

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
    vector<int> deg(n + 1, 0);
    vector<pair<int, int>> edges;
    edges.reserve(n - 1);
    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < n - 1; i++) {
        int u, v;
        cin >> u >> v;
        deg[u]++;
        deg[v]++;
        edges.pb({u, v});
        adj[u].pb(v);
        adj[v].pb(u);
    }

    int ans = 0;

    // 第一类：长度为 1 的路径，两端都是奇度点
    for (auto& it : edges) {
        if (deg[it.first] % 2 != 0 && deg[it.second] % 2 != 0) {
            ans++;
        }
    }

    // 第二类：内部点全在某个偶点连通块里，任取两条出边
    vector<bool> vis(n + 1);
    vector<int> q;
    q.reserve(n);
    for (int i = 1; i <= n; i++) {
        if (deg[i] % 2 == 0 && !vis[i]) {
            int odd = 0;
            q.clear();
            q.pb(i);
            vis[i] = true;
            int head = 0;
            while (head < sz(q)) {
                int u = q[head++];
                for (int v : adj[u]) {
                    if (deg[v] % 2 != 0) {
                        odd++;
                    } else if (!vis[v]) {
                        vis[v] = true;
                        q.pb(v);
                    }
                }
            }
            ans += odd * (odd - 1) / 2;
        }
    }

    cout << ans << endl;

}

signed main() {

    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    cin >> t;

    while (t--) {
        solve();
    }

}
```
