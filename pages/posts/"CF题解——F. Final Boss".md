---
title: "CF题解——Final Boss"
date: "2025-12-02 10:27:47"
author: shouw
katex: true
email: KijinSeija@shouw.blog
readmore: true
tags:
  - 编程
  - 算法竞赛
  - 题解
  - 二分查找
---

# F. Final Boss 解题思路

### 核心问题分析与数学转化


本题要求找到击败生命值为 $H$ 的 Boss 所需的**最少回合数** $R$。我们有 $N$ 种攻击，第 $i$ 种攻击伤害为 $a_i$，冷却时间为 $c_i$。在回合 $R$ 时，该攻击能够被使用的次数 $K_i$ 决定了其贡献的总伤害。


### 1. 攻击次数与回合数的关系

一个关键的观察是，第 $i$ 种攻击在回合 $1, 1+c_i, 1+2c_i, \dots$ 时可以使用。在给定回合数 $R$ 时，其使用次数 $K_i$ 的计算公式如下：


该攻击在 $R$ 回合内能被使用的次数 $K_i$ 为：

$$
K_i = \left\lfloor \frac{R - 1}{c_i} \right\rfloor + 1
$$




因此，在 $R$ 个回合内，总共对 Boss 造成的伤害 $\text{TotalDamage}(R)$ 为所有攻击贡献的累加和：

$$
\text{TotalDamage}(R) = \sum_{i=1}^{N} a_i \cdot K_i = \sum_{i=1}^{N} a_i \cdot \left( \left\lfloor \frac{R - 1}{c_i} \right\rfloor + 1 \right)
$$



我们的核心任务，便转化成了找到满足 $\text{TotalDamage}(R) \ge H$ 的最小正整数回合数 $R$。


### 2. 单调性与二分查找优化


由于 $a_i$ 均为正数，回合数 $R$ 越大， $\text{TotalDamage}(R)$ 必定是**单调递增**的（非递减）。


* Boss 血量 $H$ 和攻击参数 $a_i, c_i$ 最大值约为 $2 \times 10^5$。
* 
  答案 $R$ 的范围可能非常大，根据示例和 $H \cdot c_{\max}$ 的上界估算， $R$ 接近 $4 \times 10^{10}$ 或更高。线性查找 $R$ 是不可行的。
  

这种单调性使得我们可以利用**二分查找**来寻找满足条件的最小 $R$，将 $O(R \cdot N)$ 的时间复杂度降低至 $O(N \cdot \log R_{\max})$。

---

## 核心优化：二分查找与溢出防护

### 递推公式的建立 (Check 函数)


我们定义 $\text{check}(R)$ 函数来计算 $R$ 回合内的总伤害并与 $H$ 比较。


1. **查找范围：** $R \in [\text{Start}, \text{End}]$。我们将 $\text{Start}=1$，并设定一个足够大的安全上界 $\text{End} = 2 \times 10^{14}$，确保包含所有可能的答案。
2. **溢出防护：** 由于总伤害 $\text{TotalDamage}(R)$ 可能超过 $ 64$ 位整数 (`long long`) 的上限 ($ 9 \times 10^{18}$)，在 `count_damage` 函数内部，必须对乘法 $a_i \cdot K_i$ 和累加 $\sum \text{Damage}_i$ 进行溢出检查。如果发生溢出，则表明伤害已达到极大值，足以击败 Boss。

**核心递推关系：**

设 $R_{mid}$ 为二分查找的中间值。

$$
\text{TotalDamage}(R_{mid}) = \sum_{i=1}^{N} a_i \cdot \left( \left\lfloor \frac{R_{mid} - 1}{c_i} \right\rfloor + 1 \right)
$$

如果 $\text{TotalDamage}(R_{mid}) \ge H$，则答案可能为 $R_{mid}$ 或更小；否则，答案在 $[R_{mid}+1, \text{End}]$ 区间。


### CPP 代码实现

代码中使用了 `SAFE_LARGE_DAMAGE` 常量作为溢出标记，并使用标准二分查找模板寻找满足条件的左边界（最小值）。

```cpp
#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

// 安全的溢出上界 (约 9 * 10^18)。如果总伤害超过此值，认为必定能击败 Boss。
constexpr ll SAFE_LARGE_DAMAGE = 9000000000000000000LL;

ll count_damage(ll R, const vector<ll>& damages, const vector<ll>& cooldowns) {
    ll total_damage = 0;
    size_t N = damages.size();

    for (size_t i = 0; i < N; ++i) {
        // 计算攻击 i 的使用次数 K_i = floor((R - 1) / c_i) + 1
        ll uses = (R - 1) / cooldowns[i] + 1;

        // 检查乘法溢出：a_i * uses
        if (damages[i] > 0 && uses > LLONG_MAX / damages[i]) {
            return SAFE_LARGE_DAMAGE;
        }

        ll damage_contribution = damages[i] * uses;

        // 检查累加溢出：total_damage + damage_contribution
        if (total_damage > LLONG_MAX - damage_contribution) {
            return SAFE_LARGE_DAMAGE;
        }
        
        total_damage += damage_contribution;

        // 如果 total_damage 已经超过 SAFE_LARGE_DAMAGE，提前返回
        if (total_damage >= SAFE_LARGE_DAMAGE) {
             return SAFE_LARGE_DAMAGE;
        }
    }
    return total_damage;
}


void solve() {

    ll H, N;
    // H: Boss血量，N: 攻击种类数
    cin >> H >> N;

    vector<ll> damages(N);
    vector<ll> cooldowns(N);

    // 读取伤害 A_i
    for (int i = 0; i < N; ++i) {
        cin >> damages[i];
    }
    // 读取冷却 C_i
    for (int i = 0; i < N; ++i) {
        cin >> cooldowns[i];
    }

    // 二分查找范围
    ll start = 1;
    // 设定一个足够大的上界，保守取 2 * 10^14
    ll end = 200000000000000LL; 
    ll ans = end;

    // 定义检查函数 check(R): 总伤害是否 >= H
    auto check_data = [&](ll R) -> bool {
        return count_damage(R, damages, cooldowns) >= H;
    };

    // 标准二分查找 (查找满足条件的最小左边界)
    while (start <= end) {
        ll mid = start + (end - start) / 2;

        if (check_data(mid)) {
            // mid 可以击败 Boss，记录 ans 并尝试更小的 R
            ans = mid;
            end = mid - 1;
        } else {
            // mid 不足以击败 Boss，需要更多的回合
            start = mid + 1;
        }
    }

    cout << ans << "\n";

}

int main() {
    // 优化 I/O 速度
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t;
    cin >> t;

    while (t--) {
        solve();
    }
}
```
