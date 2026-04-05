---
title: "CF题解——Juggling Keys"
date: "2026-04-05 18:46:09"
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
 - 贪心
 - 扫描线
 - 模拟
---

# J. Juggling Keys 解题思路

### 核心问题分析

这道题的背景非常贴近生活：一群人合租，但是钥匙不够。大家各自有出门和回家的计划。如果回家时家里有人，按门铃就行；如果回家时家里没人，那就必须得自己带钥匙。问你能不能给出一个合理的钥匙分配方案。

初看这道题，不同人的出门时间互相交叠，感觉是个非常复杂的区间调度问题。但只要我们回归现实生活的逻辑，用**贪心**的思维去想，这题其实非常直白。

### 1. 极致贪心：谁最需要钥匙？

我们要尽量节省钥匙的使用。那么，在什么情况下，一个人**绝对、必须、不得不**带钥匙出门？
答案只有一个：**当他回家的时候，屋子里一个人都没有！**

如果他回家时屋里有人，他完全可以“白嫖”室友来开门，把带钥匙的机会让给别人。
所以，我们的**贪心策略**就是：所有人默认都不带钥匙，**只有当发现某个人回家时屋子是空的，我们才“强行”让他出门时把钥匙带上。**

因为这是为了不被锁在门外的**最低限度要求**，如果连这种最省钥匙的方案都会导致钥匙不够用，那肯定就 `impossible` 了。

### 2. 时间轴上的舞蹈：扫描线思想

既然要模拟大家进进出出的过程，最适合的算法就是**扫描线（Sweepline）**。
题目保证了在任何一个时刻，最多只有一个人到达或离开。所以我们完全可以把所有的“出门（离开）”和“回家（到达）”动作全部打散，按照时间线排个序，然后顺着时间流逝去模拟。

* 维护一个变量 `people`，代表当前在屋子里的人数。初始时大家都还没出门，`people = n`。
* 遇到“出门”事件：`people--`。
* 遇到“回家”事件：
  * **在进门之前**，先看一眼屋里还有没有别人（`people == 0`？）。
  * 如果 `people == 0`，说明这是个倒霉蛋，他回家时家里没人。为了不被锁外面，他当年出门时必须带走了一把钥匙。我们标记他带了钥匙（答案设为 1），并记录下他占用钥匙的时间段。
  * 如果 `people > 0`，有人开门，不需要带钥匙（答案设为 0）。
  * 进屋之后，`people++`。

### 3. 最终校验：钥匙到底够不够？

通过上面一顿贪心操作，我们已经确定了哪些人**必须**带钥匙，也就确定了钥匙被带走的时间段。
最后，我们只需要再做一次小规模的扫描线模拟：
一开始手上有 $k$ 把钥匙。当有人必须带钥匙出门时，钥匙减一；当他回家时，钥匙还回来，加一。
如果在任何时刻，我们手里的钥匙数量变成了负数（`< 0`），说明哪怕是最优策略钥匙也不够用，直接输出 `impossible` 即可。

### CPP 代码实现

```cpp
// J. Juggling Keys

#include <bits/stdc++.h>
#define lg(x) (63 - __builtin_clzll(x))
#define all(x) (x).begin(), (x).end()
#define low_bit(x) ((x) & (-x))
#define pb push_back
#define db long double
#define int long long
#define endl "\n"

using namespace std;

// 原始结构体，用于存储每次行程的 编号、离开时间、返回时间
struct Node {
    int l, r, ob;
    auto operator<(const Node &a) -> bool {
        return l < a.l;
    }
};

void solve() {
    int n, k, q;
    cin >> n >> k >> q;
    vector<Node> a(q);
    for (int i = 0; i < q; i++) {
        cin >> a[i].ob >> a[i].l >> a[i].r;
    }
    
    // now 这个 map 充当扫描线的角色。由于 map 自动按 key（时间）升序排序
    // key: 时间点
    // value: {-1, i} 代表第 i 个行程在此时离开；{1, i} 代表在此时返回
    map<int, pair<int, int>> now;
    vector<int> ans(q, -1);
    
    for (int i = 0; i < q; i++) {
        now[a[i].l] = {-1, i};
        now[a[i].r] = {1, i};
    }
    
    // people 记录当前在屋子里的人数，一开始都在屋里
    int people = n;
    
    // key_st 用于记录“钥匙数量的变化”
    // key: 时间点
    // value: -1 代表钥匙被拿走一把，1 代表钥匙被还回一把
    map<int, int> key_st;
    
    // 第一阶段：按时间线扫描，判断每个人是否必须带钥匙
    for (auto &it : now) {
        if (it.second.first == -1) {
            // 事件：出门
            people--;
        } else {
            // 事件：回家
            // 在他进门前，看看屋里有没有人
            if (people == 0) {
                // 屋里没人，他当年出门时必须拿钥匙
                // 记录他占用了钥匙的时间区间 [l, r]
                key_st[a[it.second.second].l] = -1;
                key_st[a[it.second.second].r] = 1;
                ans[it.second.second] = 1; // 答案标记为带钥匙
            } else {
                // 屋里有人，不需要带钥匙
                ans[it.second.second] = 0;
            }
            // 进门之后，屋里人数 +1
            people++;
        }
    }

    // 第二阶段：校验最省钥匙的方案，是否会超过手头的 k 把钥匙
    int sum = k;
    // key_st 也是按时间顺序自动排好序的
    for (auto it : key_st) {
        sum += it.second; // 加上当前时刻钥匙的变化量
        // 如果某一刻钥匙被扣成了负数，说明不够分了
        if (sum < 0) {
            cout << "impossible" << endl;
            return;
        }
    }

    // 完美通关，输出分配方案
    for (auto it : ans) {
        cout << it;
    }
    cout << endl;
}

signed main() {
    // 优化输入输出，竞技编程好习惯
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    // cin >> t; // 题目只有单组测试数据
    
    while (t--) {
        solve();
    }
}
```