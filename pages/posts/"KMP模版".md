---
title: "KMP模版"
date: "2026-04-20 16:16:26"
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
struct KMP {
    string p;
    vector<int> nxt;

    // 构造函数：传入模式串 P 并预处理出 nxt 数组
    KMP(string _p) : p(_p) {
        int m = p.size();
        nxt.resize(m);
        // nxt[i] 表示 p[0...i] 中最长的相等前后缀的长度（不包括自身）
        for (int i = 1, j = 0; i < m; i++) {
            while (j > 0 && p[i] != p[j]) j = nxt[j - 1];
            if (p[i] == p[j]) j++;
            nxt[i] = j;
        }
    }

    // 在文本串 s 中查找所有匹配的位置，返回所有匹配成功的起始下标
    vector<int> match(string s) {
        vector<int> res;
        int n = s.size(), m = p.size();
        if (m == 0) return res;
        for (int i = 0, j = 0; i < n; i++) {
            while (j > 0 && s[i] != p[j]) j = nxt[j - 1];
            if (s[i] == p[j]) j++;
            if (j == m) {
                res.push_back(i - m + 1);
                j = nxt[j - 1]; // 继续匹配下一个可能的位置
            }
        }
        return res;
    }

    // KMP 进阶应用：求最小循环节
    // 如果 len % (len - nxt[len-1]) == 0，则最小循环节长度为 len - nxt[len-1]
    int get_min_period() {
        int n = p.size();
        int len = n - nxt[n - 1];
        if (n % len == 0) return len;
        return n; // 否则没有比原串更小的循环节
    }
};
```