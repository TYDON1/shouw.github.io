---
title: "CF题解——Dogeforces"
date: "2026-05-11 20:42:10"
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
 - 构造
 - 分治
 - 树形结构
---

# D. Dogeforces 解题思路

### 核心问题分析

Dogeforces 公司有 $k$ 个员工，组织结构是一棵树：除底层员工外，每个上司**至少有 $2$ 个直接下属**；除老板外，每人**恰好有一个直接上司**；而且——这是最关键的一条性质——**上司的薪资严格大于他所有下属的薪资**。

现在结构是保密的，我们只知道底层员工的数量 $n$，以及一张 $n \times n$ 的矩阵 $a$：$a_{i,j}$ 表示底层员工 $i$ 和 $j$ 的**公共上司里薪资最小的那一位**的薪资（也就是树上 $\mathrm{LCA}(i,j)$ 的薪资）。特别地 $a_{i,i}$ 就是员工 $i$ 自己的薪资。要我们把整棵树**还原出来**：员工总数 $k$、每人薪资、老板编号、以及所有的“下属 → 上司”父子边。

翻译成人话：给你一张“两两 LCA 薪资表”，反推出原树。数据范围温柔得很，$n \le 500$，薪资 $\le 5000$，这意味着哪怕来个 $O(n^2)$ 甚至更高的递归构造都稳稳能过。突破口在于：薪资严格递增这条性质，让薪资值天然地就是树的“层次标尺”——薪资越大的节点越靠上。我们就顺着这把标尺，**从根往叶子一层层劈开**。

### 1. 顿悟时刻：整组叶子的“天花板”就是它们的根

先抓住一个朴素却致命的观察。假设现在手上攥着一**组**底层员工 $\mathrm{ls}$，我们想知道：能同时罩住这一整组人的、薪资最小的那个公共上司，薪资是多少？

答案就是这组人两两 LCA 薪资里的**最大值**。直觉上很好理解：要想覆盖组里所有人，这个上司必须站得足够高，高到压过组内任意一对人的 LCA。所以它的薪资必然 $\ge$ 组内每一对的 $a$ 值，取到下界就是那个最大值。

代码里偷了个懒但完全正确——它不去遍历所有 $O(|\mathrm{ls}|^2)$ 对，只拿组里**第一个人** $\mathrm{ls}[0]$ 当锚点，扫一遍他与组内每个人的 LCA 薪资取最大：

```cpp
int res = -1;
for (int u : ls) {
    res = max(res, a[ls[0]][u]);
}
```

为什么只看 $\mathrm{ls}[0]$ 就够？因为整组人的“天花板”节点 $R$（薪资为 $\mathrm{res}$）必定是这组所有人的共同祖先，那么对任意 $u$，$\mathrm{LCA}(\mathrm{ls}[0], u)$ 一定在 $R$ 的子树里（不会比 $R$ 还高），故 $a[\mathrm{ls}[0]][u] \le \mathrm{res}$；而这组里至少存在某个 $u$，使得 $\mathrm{ls}[0]$ 和 $u$ 的 LCA 恰好就是 $R$ 本身——否则 $R$ 就不是“最小”的公共上司了。两边一夹，最大值正好等于 $\mathrm{res}$。漂亮。

于是这个 $\mathrm{res}$ 就是当前这一整组人对应子树的**根的薪资**。我们要做的，就是新建这个根节点，然后把这组人**继续往下分**。

### 2. 分组的魔法：LCA 不等于天花板的，必在同一个孩子里

新建的根 $R$ 薪资为 $\mathrm{res}$。它下面挂着若干个直接孩子（每个孩子是一棵子树），我们要把当前组里的叶子按“归属哪个孩子子树”重新切成几堆。

判据极其干净：对组里两个叶子 $u, v$，它们落在 $R$ 的**同一个孩子子树**里 $\iff$ 它们的 LCA 比 $R$ **更低**，即 $a[u][v] \ne \mathrm{res}$；反过来，如果 $a[u][v] = \mathrm{res}$，说明它们的 LCA 就是 $R$ 自己，那它俩必然分属 $R$ 的**不同孩子**。

代码就照着这个判据，用每堆的第一个元素 $\mathrm{ch}[j][0]$ 当代表，给新来的 $v$ 找位置——只要 $v$ 和某堆代表的 LCA 薪资 $\ne \mathrm{res}$，就说明它俩同属一个孩子，塞进去；谁都不匹配就自立门户开一堆：

```cpp
vector<vector<int>> ch;
ch.pb({ls[0]});

for (int i = 1; i < sz(ls); ++i) {
    int v = ls[i];
    int group = -1;
    for (int j = 0; j < sz(ch); ++j) {
        if (a[v][ch[j][0]] != res) {
            group = j;
            break;
        }
    }
    if (group == -1) {
        group = sz(ch);
        ch.pb({});
    }
    ch[group].pb(v);
}
```

这里有个值得品一下的细节：用“和代表的 LCA $\ne \mathrm{res}$”来判同堆，靠的是**同一个孩子子树内任意两点的 LCA 都严格低于 $R$**（薪资 $< \mathrm{res}$），而**跨孩子的两点 LCA 恰好是 $R$**（薪资 $= \mathrm{res}$）。所以拿任一代表去比都一致，不会把人分错。$n \le 500$，这个 $O(|\mathrm{ls}|^2)$ 的暴力分组毫无压力。

### 3. 递归收网：每分一层就长出一个节点

分好堆之后，剧情就顺理成章了。我们**先建好根** $R$（拿一个新编号、记上薪资 $\mathrm{res}$），然后对切出来的**每一堆孩子组**递归调用 `calc`，递归返回的是那一堆对应子树的根编号 $u$，我们把边 $(u, R)$ 连上就行：

```cpp
curr_id++;
int v = curr_id;
c[v] = res;
for (int i = 0; i < sz(ch); ++i) {
    int u = calc(ch[i]);
    e.pb({u, v});
}
return v;
```

递归的边界是“这一堆只剩一个人”——那它就是底层员工本人，直接把它的编号还回去，连边的事交给上一层：

```cpp
if (sz(ls) == 1) {
    return ls[0];
}
```

注意这个**编号分配**的小巧思：底层员工的编号是题目钦定的 $1 \sim n$，所以一开始 `curr_id = n`，每新建一个内部节点就 `curr_id++`，自然而然落在 $n+1$ 及以后，完美契合题目“内部节点编号从 $n+1$ 起”的要求。最外层 `calc(ls)`（$\mathrm{ls}$ 是全体 $1 \sim n$）返回的就是整棵树的老板，也就是 `root`。

整个过程的形状是：**从根这一层切一刀，分成几个孩子组；对每个孩子组再切一刀、再分……** 递归深度不超过树高，每一层处理一组人的分组是平方级别。整体复杂度被分组主导，宽松地估计是 $O(n^3)$ 量级（实际远跑不满），在 $n \le 500$ 下轻松通过。

### 4. 顺手验证一下样例

题目样例那张矩阵：

$$ a = \begin{pmatrix} 2 & 5 & 7 \\ 5 & 1 & 7 \\ 7 & 7 & 4 \end{pmatrix} $$

对全体 $\{1,2,3\}$ 调用 `calc`：拿 $\mathrm{ls}[0]=1$ 当锚点，$\max(a_{11}, a_{12}, a_{13}) = \max(2,5,7) = 7$，所以根 $R$ 薪资 $7$，分到新编号（$n=3$，故为 $4$）。再分组：$2$ 与代表 $1$ 的 LCA 是 $a_{12}=5 \ne 7$，同堆，得 $\{1,2\}$；$3$ 与 $1$ 的 LCA 是 $a_{13}=7=\mathrm{res}$，另起一堆 $\{3\}$。于是 $4$ 号节点挂两个孩子：递归 $\{1,2\}$ 会再建一个薪资 $\max(a_{11},a_{12})=5$ 的节点（编号 $5$），其下接叶子 $1$、$2$；递归 $\{3\}$ 直接返回叶子 $3$。最终薪资数组 $c = [2,1,4,7,5]$、老板是 $4$，和样例输出一字不差。收工！

### CPP 代码实现

```cpp
// D. Dogeforces

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

const int N = 1005;
int a[N][N];
int c[N];
vector<pair<int, int>> e;
int curr_id;

int calc(vector<int> ls) {
    if (sz(ls) == 1) {
        return ls[0];
    }

    int res = -1;
    for (int u : ls) {
        res = max(res, a[ls[0]][u]);
    }

    vector<vector<int>> ch;
    ch.pb({ls[0]});

    for (int i = 1; i < sz(ls); ++i) {
        int v = ls[i];
        int group = -1;
        for (int j = 0; j < sz(ch); ++j) {
            if (a[v][ch[j][0]] != res) {
                group = j;
                break;
            }
        }
        if (group == -1) {
            group = sz(ch);
            ch.pb({});
        }
        ch[group].pb(v);
    }

    curr_id++;
    int v = curr_id;
    c[v] = res;
    for (int i = 0; i < sz(ch); ++i) {
        int u = calc(ch[i]);
        e.pb({u, v});
    }
    return v;
}

void solve() {

    int n;
    cin >> n;
    curr_id = n;

    for (int i = 1; i <= n; ++i) {
        for (int j = 1; j <= n; ++j) {
            cin >> a[i][j];
        }
        c[i] = a[i][i];
    }

    vector<int> ls(n);
    iota(all(ls), 1);

    int root = calc(ls);

    cout << curr_id << endl;
    for (int i = 1; i <= curr_id; ++i) {
        cout << c[i] << ' ';
    }
    cout << endl;
    cout << root << endl;
    for (auto it : e) {
        cout << it.first << ' ' << it.second << endl;
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
