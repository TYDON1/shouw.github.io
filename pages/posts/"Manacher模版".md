---
title: "Manacher模版"
date: "2026-04-20 16:57:16"
author: shouw
katex: true
categories:
  - 模版
email: KijinSeija@shouw.blog
readmore: true
tags:
  - 编程
  - 算法竞赛
  - 模版
---

```cpp
struct Manacher {
    string t;
    vector<int> d; // d[i] 表示以 i 为中心的回文半径（包含 i 本身）

    Manacher(string s) {
        // 预处理字符串，将 "aba" 变为 "$#a#b#a#^"
        // $ 和 ^ 是边界哨兵，可以避免 while 循环时的越界检查，常数极小
        t = "$";
        for (char c : s) {
            t += "#";
            t += c;
        }
        t += "#^";

        int n = t.size();
        d.resize(n);
        int l = 1, r = 1; // 当前维护的最靠右的回文边界 [l, r]
        
        for (int i = 1; i < n - 1; i++) {
            // 算法核心：利用对称性初始化 d[i]
            d[i] = max(0, min(r - i, d[l + r - i]));
            
            // 暴力向左右扩展
            while (t[i - d[i]] == t[i + d[i]]) {
                d[i]++;
            }
            
            // 更新最右边界
            if (i + d[i] > r) {
                l = i - d[i];
                r = i + d[i];
            }
        }
    }

    // 查询原串中以 mid 为中心（下标从 0 开始）的最长回文长度
    // 如果是奇回文，mid 指向字符；如果是偶回文，mid 指向两个字符中间
    // 注意：在预处理后的字符串 t 中，对应的下标是 2 * mid + 2
    int get_max_len() {
        int max_r = 0;
        for (int x : d) max_r = max(max_r, x);
        return max_r - 1; // 预处理后的半径 - 1 正好是原串回文长度
    }

    // 判断原串区间 [L, R] 是否是回文 (0-indexed)
    bool is_palindrome(int L, int R) {
        int len = R - L + 1;
        int mid_in_t = (L + R + 2); // 映射到 t 串的中心位置
        return d[mid_in_t] > len;
    }
};
```