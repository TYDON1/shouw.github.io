---
title: "CF题解——Fibonacci Paths"
date: "2025-12-15 08:21:21"
katex: true
categories:
  - 算法竞赛相关
email: KijinSeija@shouw.blog
readmore: true
tags:
  - 编程
  - 算法竞赛
  - 题解
  - 拓扑
  - 动态规划
---

# D. Fibonacci Paths 详细解题思路

## 核心问题与数学性质

本题要求找出有向图中所有长度 $k \ge 2$ 的简单路径 $v_0 \to v_1 \to \dots \to v_k$，使得路径上的顶点值序列 $x_0, x_1, \dots, x_k$ 构成广义斐波那契数列。

### 广义斐波那契定义



$$
x_i = x_{i-2} + x_{i-1} \quad \text{for } i \ge 2
$$



### 关键性质：隐式拓扑序

由于题目保证所有顶点值 $a_v \ge 1$，对于任何长度 $\ge 3$ 的合法路径，必然满足：

$$
a_{v_i} = a_{v_{i-1}} + a_{v_{i-2}} > a_{v_{i-1}}
$$

这意味着路径上的点权值是**严格递增**的（除了前两个点可能大小任意）。

* 这一性质保证了我们不需要担心“环”的问题（除了长度为 2 的路径）。
* 这也提示我们可以按照**点权值 $a_v$ 从小到大**的顺序来处理边，这相当于在一个隐式的 DAG（有向无环图）上进行动态规划。

---

## 1. 动态规划状态定义

我们需要知道路径的“末端”和“倒数第二个值”才能确定下一个值需要是多少。

* **状态定义 $DP[v][\text{pre}]$：
    表示以顶点 $v$ 为**终点**，且路径上**倒数第二个顶点的值**为 $\text{prev\_val}$ 的合法斐波那契路径的总数。
* **数据结构**：
    由于 $a_v$ 范围可达 $10^{18}$，且对于每个点 $v$，有效的入边数量有限，我们使用 `std::map<long long, long long>` 来存储每个点的 DP 状态，避免空间爆炸。

## 2. DP 转移与核心逻辑

我们按照边的终点权值 $a_v$ 对所有边进行排序。排序是为了保证当我们处理到点 $v$ 时，所有可能作为 $v$ 前驱的路径（权值更小的点）都已经计算完毕。

### 转移步骤（处理边 $u \to v$）

假设当前处理的边是 $u \to v$，当前路径的最后两项确定为 $[\dots, a_u, a_v]$。

1. **基础贡献（长度 $k=2$）**：
    边 $(u, v)$ 本身构成一条合法路径 $[a_u, a_v]$（题目允许前两项任意）。
    
    $$
    \text{count} = 1
    $$
2. **路径扩展（长度 $k \ge 3$）**：
    我们需要寻找一个前驱点 $prev$，使得路径 $prev \to u \to v$ 满足斐波那契性质。
    
    * **条件**：$a_v = a_{prev} + a_u$
    * **所需前驱值**：$\text{needed} = a_v - a_u$
    
    如果 $\text{needed} > 0$，我们查询 $u$ 的 DP 表，看有多少条以 $u$ 结尾且倒数第二个值为 $\text{needed}$ 的路径。
    
    $$
    \text{count} = (1 + DP[u][\text{needed}]) \pmod{MOD}
    $$
3. **状态更新**：
    
    * **更新总答案**：$\text{TotalAns} = (\text{TotalAns} + \text{count}) \pmod{MOD}$
    * **更新 DP 表**：这条新路径现在以 $v$ 结尾，倒数第二个值是 $a_u$。
        $$
        DP[v][a_u] = (DP[v][a_u] + \text{count}) \pmod{MOD}
        $$

### 复杂度分析

* **排序**：$O(M \log M)$
* **DP 转移**：遍历 $M$ 条边，每次在 Map 中查询和插入，耗时 $O(\log (\text{degree}))$ 或 $O(\log M)$。
* **总复杂度**：$O(M \log M)$，在 $M=2 \cdot 10^5$ 下完全可接受。

---

## 3. C++ 代码实现

```cpp
#include <bits/stdc++.h>

using namespace std;

const long long MOD = 998244353;

struct Edge {
    int u, v;
};

void solve() {
    int n, m;
    cin >> n >> m;

    // a[i] 存储顶点 i 的值 (1-indexed)
    vector<long long> a(n + 1);
    for (int i = 1; i <= n; ++i) {
        cin >> a[i];
    }

    vector<Edge> edges(m);
    for (int i = 0; i < m; ++i) {
        cin >> edges[i].u >> edges[i].v;
    }

    // 关键步骤：按照终点值 a[v] 排序
    // 这保证了类似拓扑序的处理顺序：值小的点先处理，
    // 从而保证处理 u->v 时，以 u 结尾且值更小的路径已经计算完成。
    sort(edges.begin(), edges.end(), [&](const Edge& x, const Edge& y) {
        return a[x.v] < a[y.v];
    });

    // DP 状态: dp_sum[v] 是一个 map
    // Key: 倒数第二个值 (prev_val)
    // Value: 路径数量
    vector<map<long long, long long>> dp_sum(n + 1);

    long long total_ans = 0;

    for (const auto& e : edges) {
        int u = e.u;
        int v = e.v;

        // 1. 基础路径：仅包含边 (u, v) 的路径，长度为 2，总是合法的
        long long current_paths = 1; 

        // 2. 尝试扩展：寻找形如 ... -> prev -> u -> v 的路径
        // 根据斐波那契定义: a[v] = a[u] + a[prev]
        // 所以我们需要的前驱值是:
        long long needed = a[v] - a[u];

        if (needed > 0) {
            // 在 u 的状态中查找倒数第二个值为 needed 的路径数量
            auto it = dp_sum[u].find(needed);
            if (it != dp_sum[u].end()) {
                current_paths = (current_paths + it->second) % MOD;
            }
        }

        // 累计答案
        total_ans = (total_ans + current_paths) % MOD;

        // 更新 v 的状态：
        // 新生成的路径以 v 结尾，倒数第二个值显然是 a[u]
        long long& entry = dp_sum[v][a[u]];
        entry = (entry + current_paths) % MOD;
    }

    cout << total_ans << "\n";
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t;
    cin >> t;
    while (t--) {
        solve();
    }
    return 0;
}
```
