---
title: "BSGS与扩展BSGS模版"
date: "2026-08-27 21:10:29"
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

## BSGS与扩展BSGS模版

```cpp
struct BSGS {
    int exgcd(int a, int b, int& x, int& y) {
        if (b == 0) { x = 1; y = 0; return a; }
        int x1, y1;
        int g = exgcd(b, a % b, x1, y1);
        x = y1;
        y = x1 - (a / b) * y1;
        return g;
    }

    // 求 a^x ≡ b (mod p) 的最小非负解，p 为质数，无解返回 -1
    int solve(int a, int b, int p) {
        a %= p;
        b %= p;
        if (b == 1) return 0;
        int m = (int)ceil(sqrt((double)p));
        unordered_map<int, int> table;
        int cur = b;
        for (int j = 0; j < m; j++) {
            table[cur] = j;
            cur = cur * a % p;
        }
        int am = 1;
        for (int i = 0; i < m; i++) am = am * a % p;
        cur = am;
        for (int i = 1; i <= m; i++) {
            if (table.count(cur)) return i * m - table[cur];
            cur = cur * am % p;
        }
        return -1;
    }

    // 扩展 BSGS：a、p 不要求互质，求 a^x ≡ b (mod p) 的最小非负解
    int exsolve(int a, int b, int p) {
        a %= p;
        b %= p;
        if (p == 1) return 0;
        if (b == 1) return 0;
        int cur = 1 % p, cnt = 0;
        for (int g = __gcd(a, p); g != 1; g = __gcd(a, p)) {
            if (b % g != 0) return -1;
            cnt++;
            b /= g;
            p /= g;
            cur = (int)((__int128)cur * (a / g) % p);
            if (cur == b) return cnt;
        }
        int m = (int)ceil(sqrt((double)p));
        unordered_map<int, int> table;
        int base = b;
        for (int j = 0; j < m; j++) {
            table[base] = j;
            base = base * a % p;
        }
        int am = 1;
        for (int i = 0; i < m; i++) am = am * a % p;
        base = (int)((__int128)cur * am % p);
        for (int i = 1; i <= m; i++) {
            if (table.count(base)) return i * m - table[base] + cnt;
            base = base * am % p;
        }
        return -1;
    }
};
```
