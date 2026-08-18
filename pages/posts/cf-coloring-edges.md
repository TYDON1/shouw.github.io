---
title: "CF题解——Coloring Edges"
date: "2026-05-28 20:47:12"
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
 - 拓扑排序
 - 构造
---

# D. Coloring Edges 解题思路

### 核心问题分析

给一张 $n$ 个点、$m$ 条边的**有向图**（没有自环、没有重边）。我们要给每条边染上一种颜色，染色方案叫“好的”当且仅当——**不存在任何一个由同色边构成的环**。请你找出一种用颜色数 $k$ **最少**的好染色方案，并把每条边的颜色都打印出来。

数据范围 $2 \le n \le 5000$，$1 \le m \le 5000$，很小，所以这题的难点根本不在复杂度，而在那个灵魂拷问：**最少要几种颜色？** 答案出乎意料地干净——要么 $1$，要么 $2$，没有第三种可能。我们这篇题解就来把这件事讲透，并看看 shouw 的代码是怎么三下五除二把它干掉的。

### 1. 顿悟时刻：答案只可能是 1 或 2

先把结论摆出来，你会发现它简单到有点过分：

> * 如果原图本身**就是个 DAG（无环）**，那一种颜色就够了，$k = 1$。
> * 如果原图**有环**，那 $k = 2$，并且 $2$ 一定够。

第一种情况是废话：DAG 里压根没有任何环，那当然也不会有同色环，所有边一律涂成颜色 $1$，收工。

关键是第二种。原图既然有环，那把所有边涂成同一种颜色显然会留下一个同色环，$k = 1$ 直接出局——所以**有环时答案至少是 $2$**。剩下要证明的是：$2$ 种颜色**永远够用**。这才是这道 $*2100$ 的题真正的“构造”味道所在。

### 2. 魔法构造：按端点编号大小拆环

怎么用两种颜色拆掉所有的同色环？shouw 用了一个朴素到让人拍大腿的招数——**看边的两个端点编号谁大谁小**：

```cpp
if (a[i].first < a[i].second) {
    cout << 1 << ' ';
} else {
    cout << 2 << ' ';
}
```

也就是说：

* 对于边 $u \to v$，若 $u < v$（编号往大了走），涂**颜色 1**；
* 若 $u > v$（编号往小了走），涂**颜色 2**。

为什么这样就能保证两种颜色各自都不成环？我们来想：任何一个有向环 $v_1 \to v_2 \to \dots \to v_t \to v_1$，绕一圈最后要回到起点。既然要回到起点，环上**必然同时存在“编号变大的边”和“编号变小的边”**——你不可能一路只增不减还能转回来（那编号会越来越大永远回不去），也不可能一路只减不增。

* 颜色 1 的边全是 $u < v$，它们单独拎出来只会让编号严格递增，这种边构成的任何路径编号都在变大，**绝无可能成环**；
* 颜色 2 的边全是 $u > v$，同理编号严格递减，也**绝无可能成环**。

于是每个环都被“编号增”和“编号减”这两类边劈成了不同颜色，两种颜色各自内部都是“单调”的，自然全都拆掉了。$2$ 种颜色稳稳够用，构造成立！而且这个构造连判不判环都不挑——它对任何图都对，只是当图本身无环时我们能更省，用 $1$ 种就行。

### 3. 那么，到底有没有环？拓扑排序来拍板

既然“无环涂 1、有环涂 2”，那核心就剩一件事：**判这张有向图到底有没有环。** 经典手段就是拓扑排序，shouw 这里用的是 Kahn 算法（基于度数的 BFS 剥皮法），不过有个小细节值得拎出来说——他剥的是**出度**，不是常见的入度：

```cpp
for (int i = 1; i <= m; i++) {
    int u, v;
    cin >> u >> v;
    a[i] = {u, v};
    in[v]++;
    out[u]++;
    g[v].pb(u);          // 注意：存的是反向边 v -> u
}
queue<int> q;
for (int i = 1; i <= n; i++) {
    if (!out[i]) q.push(i);   // 从“出度为 0”的点（汇点）开始剥
}
```

注意他建图时存的是 `g[v].pb(u)`，也就是**反向邻接表**。配合“出度”一起看就顺了：他是从**汇点**（出度为 $0$、没有任何出边的点）开始往回剥的。

```cpp
while (!q.empty()) {
    auto it = q.front();
    q.pop();
    for (auto temp : g[it]) {
        out[temp]--;            // it 是汇点，删掉它，所有指向它的点出度 -1
        if (!out[temp]) q.push(temp);
    }
}
```

每弹出一个出度为 $0$ 的点 `it`，就顺着反向边找到所有“指向 `it`”的前驱 `temp`，把它们的出度减一；谁的出度被减到 $0$，谁就成了新的汇点，入队继续剥。这跟标准的“从入度为 $0$ 的源点开始剥入度”是完全对称的镜像写法，正确性一模一样。

剥完之后怎么判有没有环？看还有没有点的出度没被清零：

```cpp
bool flag = true;
for (int i = 1; i <= n; i++) {
    if (out[i]) flag = false;   // 还有点没被剥掉 -> 存在环
}
```

如果所有点都被成功剥掉（`flag` 仍为 `true`），说明整张图是 DAG，无环，输出 $k = 1$、全涂颜色 1；否则一定卡在某个环里剥不动了，`flag` 变 `false`，输出 $k = 2$、用第 2 节的编号大小法上色。逻辑闭环，干净利落。

### 4. 复杂度

读边 $O(m)$，拓扑排序每个点入队一次、每条边被遍历一次，是 $O(n + m)$，最后输出再扫一遍 $O(m)$。总复杂度

$$ O(n + m) $$

面对 $n, m \le 5000$ 简直是杀鸡用牛刀，这题真正的分值全压在“答案只有 1 或 2”和“按编号大小拆环”这两个观察上——一旦想通，代码就是个无脑拓扑排序。这也是构造题的魅力所在：思路价值千金，代码朴实无华。

### CPP 代码实现

```cpp
// D. Coloring Edges

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

    int n, m;
    cin >> n >> m;
    vector<pair<int, int>> a(m + 1);
    vector<vector<int>> g(n + 1);
    vector<int> in(n + 1);
    vector<int> out(n + 1);
    for (int i = 1; i <= m; i++) {
        int u, v;
        cin >> u >> v;
        a[i] = {u, v};
        in[v]++;
        out[u]++;
        g[v].pb(u);
    }
    queue<int> q;
    for (int i = 1; i <= n; i++) {
        if (!out[i]) q.push(i);
    }
    while (!q.empty()) {
        auto it = q.front();
        q.pop();
        for (auto temp : g[it]) {
            out[temp]--;
            if (!out[temp]) q.push(temp);
        }
    }
    bool flag = true;
    for (int i = 1; i <= n; i++) {
        if (out[i]) flag = false;
    }
    if (flag) {
        cout << 1 << endl;
        for (int i = 1; i <= m; i++) {
            cout << 1 << ' ';
        }
        cout << endl;
    } else {
        cout << 2 << endl;
        for (int i = 1; i <= m; i++) {
            if (a[i].first < a[i].second) {
                cout << 1 << ' ';
            } else {
                cout << 2 << ' ';
            }
        }
        cout << endl;
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
