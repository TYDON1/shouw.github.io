---
title: "CF题解——Check Transcription"
date: "2026-05-22 20:47:11"
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
 - 字符串
 - 哈希
 - 枚举
---

# E. Check Transcription 解题思路

### 核心问题分析

题意非常浪漫：几十年前一台射电望远镜往外太空发了一段 01 串 $s$，最近收到了一段疑似外星人的回信 $t$（全是小写字母）。科学家想验证 $t$ 是不是 $s$ 的“转写”：把 $s$ 里**所有的 `0`** 替换成同一个字符串 $r_0$，把**所有的 `1`** 替换成同一个字符串 $r_1$，拼起来恰好等于 $t$。要求 $r_0$、$r_1$ **非空**且 **互不相同**。问有多少对合法的 $(r_0, r_1)$。

数据范围：$|s| \le 10^5$，$|t| \le 10^6$。设 $s$ 里有 $c_0$ 个 `0`、$c_1$ 个 `1`，$r_0$ 长 $L_0$、$r_1$ 长 $L_1$，那么拼出来的总长必须满足

$$ c_0 \cdot L_0 + c_1 \cdot L_1 = |t| $$

这一条等式就是整道题的命门——只要我们**枚举其中一个长度**，另一个就被锁死了。突破口在这。

### 1. 枚举一个长度，另一个白送

我们只枚举 $r_1$ 的长度 $L_1 = i$（代码里的 `one_len`），那么 $r_0$ 的长度立刻由那条等式解出来：

$$ L_0 = \frac{|t| - c_1 \cdot L_1}{c_0} $$

对应这两行：

```cpp
int one_len = i, zero_len = (n_2 - i * one_n) / zero_n;
if (zero_len <= 0) break;
if ((n_2 - i * one_n) % zero_n != 0) continue;
```

逻辑很干脆：分子算出来如果 $\le 0$，说明 $L_1$ 太大、再往后枚举只会更小，直接 `break` 收工；如果分子不能被 $c_0$ 整除，那 $L_0$ 不是整数，这个 $L_1$ 作废，`continue` 跳过。只有整除且为正，才是一个**长度合法的候选**，值得我们去真正校验。

### 2. 让出现次数多的那个去当“被枚举者”——复杂度的灵魂一笔

你可能会问：枚举一个长度 $O(|t|)$ 次，每次都要扫一遍 $s$ 校验 $O(|s|)$，那不就是 $O(|t|\cdot|s|)$ 起飞了吗？这里有一手非常漂亮的剪枝，藏在开头：

```cpp
if (zero_n > one_n) {
    swap(zero_n, one_n);
    for (char& c : s_1) {
        c = (c == '0' ? '1' : '0');
    }
}
```

它做的事是：**保证 $c_1 \ge c_0$**（如果 `0` 比 `1` 多，就把整个 $s$ 的 `0/1` 对调，反正这只是给两类位置换个名字，答案数量丝毫不影响）。

为什么这么干？因为我们枚举的是出现次数**更多**的那一类（这里统一成 `1`）的长度 $L_1$。出现次数多意味着 $c_1$ 大，而 $c_1 \cdot L_1 \le |t|$，所以 $L_1$ 能取的范围被压到 $\le |t| / c_1$。又因为 $c_1 \ge |s|/2$，于是有效的枚举次数大约是

$$ \frac{|t|}{c_1} \le \frac{2|t|}{|s|} $$

每个有效候选要花 $O(|s|)$ 去扫一遍，乘起来差不多 $O(|t|)$ 级别——这就是经典的“调和级数 / 出现次数最多者长度有界”技巧。挑次数多的来枚举，能取的长度就少，整体被牢牢摁住，丝毫不慌。

### 3. 用双哈希 $O(1)$ 验段，一遍扫穿整个 $t$

长度定下来之后，就该验证“按 $s$ 的模板拼出来到底对不对”了。我们对 $t$ 预处理一份**双哈希**（两个不同模数 $10^9+7$ 与 $10^9+9$，随机底数，最后把两段哈希拼成一个 64 位整数当指纹），这样任意子串 $t[l..r]$ 的指纹都能 $O(1)$ 取出：

```cpp
int get(int l, int r) {
    int v1 = (h1[r + 1] - h1[l] * p1[r - l + 1] % M1 + M1) % M1;
    int v2 = (h2[r + 1] - h2[l] * p2[r - l + 1] % M2 + M2) % M2;
    return (v1 << 32) | v2;
}
```

然后我们拿着指针 `j` 从 $t$ 的头开始，**照着 $s$ 一位一位地走**：遇到 `0` 就从 $t$ 里切下一段长 $L_0$ 的子串，遇到 `1` 就切一段长 $L_1$ 的：

```cpp
for (int j = 0; j < n_2;) {
    idx++;
    if (s_1[idx] == '0') {
        int temp = hash.get(j, j + zero_len - 1);
        j += zero_len;
        if (zero_s == -1) {
            zero_s = temp;
        } else {
            if (zero_s != temp) {
                flag = false;
                break;
            }
        }
    } else {
        // 同理切 one_len 长度的段，比对 one_s
    }
}
```

第一次遇到 `0` 时把这段的指纹记成 $r_0$ 的“标准答案” `zero_s`，以后每次遇到 `0` 都要求切出来的段指纹跟它**完全一致**；`1` 同理用 `one_s`。一旦哪段对不上，立刻 `flag = false` 并 `break`。注意这里因为长度是由那条等式精确解出来的，指针 `j` 走完整个 $t$ 时一定刚好对齐到末尾，不用额外操心越界。

### 4. 别忘了 $r_0 \neq r_1$ 这道紧箍咒

题目白纸黑字要求两个串**不同**。如果你算出来 $L_0 = L_1$ **并且** 它们的指纹也相等，那就是同一个串，这一对不合法，必须踢掉：

```cpp
if (zero_len == one_len && zero_s == one_s) {
    continue;
}
if (!flag) {
    continue;
}
ans++;
```

这里有个细节值得点一下：只有当**长度相同**时才可能撞成同一个串，所以判断条件里先卡 `zero_len == one_len`，再比指纹 `zero_s == one_s`，两者同时成立才算违规。长度不同的话天然就是两个不同的串，放心计数。非空也已经被前面的 `zero_len <= 0` `break`（以及 `one_len` 从 $1$ 起枚举）保证了。

跑完所有合法长度候选，`ans` 就是答案。总复杂度大约 $O(|t|)$，对 $10^6$ 的规模和 3 秒时限，稳稳的。

### CPP 代码实现

```cpp
// E. Check Transcription

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

struct DoubleHash {
    static const int M1 = 1e9 + 7, M2 = 1e9 + 9;
    static int b1, b2;
    static vector<int> p1, p2;
    vector<int> h1, h2;

    static void init(int n) {
        if (!b1) {
            mt19937 rng(chrono::steady_clock::now().time_since_epoch().count());
            b1 = rng() % (M1 - 131) + 131;
            b2 = rng() % (M2 - 13331) + 13331;
        }
        if (p1.empty()) { p1.assign(1, 1); p2.assign(1, 1); }
        while (p1.size() <= n) {
            p1.push_back(p1.back() * b1 % M1);
            p2.push_back(p2.back() * b2 % M2);
        }
    }

    template<typename T>
    DoubleHash(const T& s) {
        int n = s.size();
        init(n);
        h1.assign(n + 1, 0); h2.assign(n + 1, 0);
        for (int i = 0; i < n; i++) {
            h1[i + 1] = (h1[i] * b1 + s[i]) % M1;
            h2[i + 1] = (h2[i] * b2 + s[i]) % M2;
        }
    }

    int get(int l, int r) {
        int v1 = (h1[r + 1] - h1[l] * p1[r - l + 1] % M1 + M1) % M1;
        int v2 = (h2[r + 1] - h2[l] * p2[r - l + 1] % M2 + M2) % M2;
        return (v1 << 32) | v2;
    }
};

int DoubleHash::b1 = 0;
int DoubleHash::b2 = 0;
vector<int> DoubleHash::p1;
vector<int> DoubleHash::p2;

void solve() {

    string s_1, s_2;
    cin >> s_1 >> s_2;
    int n_2 = sz(s_2);
    int one_n = 0, zero_n = 0;
    for (auto it : s_1) {
        if (it == '1') one_n++;
        else zero_n++;
    }

    if (zero_n > one_n) {
        swap(zero_n, one_n);
        for (char& c : s_1) {
            c = (c == '0' ? '1' : '0');
        }
    }

    DoubleHash hash(s_2);
    int ans = 0;
    for (int i = 1; i < n_2; i++) {
        int one_len = i, zero_len = (n_2 - i * one_n) / zero_n;
        if (zero_len <= 0) break;
        if ((n_2 - i * one_n) % zero_n != 0) continue;
        int idx = -1;
        bool flag = true;
        int zero_s = -1, one_s = -1;
        for (int j = 0; j < n_2;) {
            idx++;
            if (s_1[idx] == '0') {
                int temp = hash.get(j, j + zero_len - 1);
                j += zero_len;
                if (zero_s == -1) {
                    zero_s = temp;
                } else {
                    if (zero_s != temp) {
                        flag = false;
                        break;
                    }
                }
            } else {
                int temp = hash.get(j, j + one_len - 1);
                j += one_len;
                if (one_s == -1) {
                    one_s = temp;
                } else {
                    if (one_s != temp) {
                        flag = false;
                        break;
                    }
                }
            }
        }
        if (zero_len == one_len && zero_s == one_s) {
            continue;
        }
        if (!flag) {
            continue;
        }
        ans++;
    }
    cout << ans << endl;

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
