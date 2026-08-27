---
title: "Z函数模版"
date: "2026-08-27 22:15:53"
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

## Z函数模版

```cpp
struct ZFunction {
    vector<int> z;

    // z[i] = s 与 s 从下标 i 开始的后缀的最长公共前缀长度，z[0] = n
    ZFunction(const string& s) {
        int n = s.size();
        z.assign(n, 0);
        z[0] = n;
        int l = 0, r = 0;
        for (int i = 1; i < n; i++) {
            if (i < r) z[i] = min(r - i, z[i - l]);
            while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;
            if (i + z[i] > r) l = i, r = i + z[i];
        }
    }

    // 单模式串匹配：返回文本 t 中每个位置与模式串 s 的最长公共前缀长度
    static vector<int> match(const string& s, const string& t) {
        string combined = s + '\1' + t;
        ZFunction zf(combined);
        int n = s.size();
        vector<int> res(t.size());
        for (int i = 0; i < (int)t.size(); i++) res[i] = min(zf.z[n + 1 + i], n);
        return res;
    }
};
```
