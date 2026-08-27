---
title: "Miller-Rabin与Pollard-rho模版"
date: "2026-08-27 20:26:05"
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

## Miller-Rabin与Pollard-rho模版

```cpp
struct PrimeFactor {
    // n 可能超出 int 的乘法范围（int 已是 64 位），用 __int128 防止 mulmod 溢出
    int mulmod(int a, int b, int mod) {
        return (int)((__int128)a * b % mod);
    }

    int qpow(int a, int b, int mod) {
        int res = 1;
        a %= mod;
        while (b > 0) {
            if (b & 1) res = mulmod(res, a, mod);
            a = mulmod(a, a, mod);
            b >>= 1;
        }
        return res;
    }

    // Miller-Rabin 素性测试，对 int 范围内的数完全正确
    bool is_prime(int n) {
        if (n < 3) return n == 2;
        if (n % 2 == 0) return false;
        int d = n - 1, r = 0;
        while (d % 2 == 0) d /= 2, r++;
        for (int a : {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37}) {
            if (n == a) return true;
            if (n % a == 0) return false;
            int x = qpow(a, d, n);
            if (x == 1 || x == n - 1) continue;
            bool composite = true;
            for (int i = 0; i < r - 1; i++) {
                x = mulmod(x, x, n);
                if (x == n - 1) { composite = false; break; }
            }
            if (composite) return false;
        }
        return true;
    }

    // Pollard-rho 找到 n 的一个非平凡因子
    int pollard_rho(int n) {
        if (n % 2 == 0) return 2;
        int c = rand() % (n - 1) + 1;
        int x = rand() % n, y = x, d = 1;
        while (d == 1) {
            x = (mulmod(x, x, n) + c) % n;
            y = (mulmod(y, y, n) + c) % n;
            y = (mulmod(y, y, n) + c) % n;
            d = __gcd(abs(x - y), n);
        }
        return d == n ? pollard_rho(n) : d;
    }

    // 分解 n 的所有质因数（含重复），结果不保证有序
    void factorize(int n, vector<int>& res) {
        if (n == 1) return;
        if (is_prime(n)) {
            res.push_back(n);
            return;
        }
        int d = n;
        while (d == n) d = pollard_rho(n);
        factorize(d, res);
        factorize(n / d, res);
    }
};
```
