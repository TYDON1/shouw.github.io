---
title: "DoubleHashMap模版"
date: "2026-04-16 15:57:17"
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
template <typename K1, typename K2>
struct DoubleHashPair {
    static const uint64_t M1 = 1e9 + 7, M2 = 1e9 + 9;
    static uint64_t b1, b2;

    static void init() {
        if (!b1) {
            mt19937_64 rng(chrono::steady_clock::now().time_since_epoch().count());
            b1 = rng() % (M1 - 131) + 131;
            b2 = rng() % (M2 - 13331) + 13331;
        }
    }

    size_t operator()(const pair<K1, K2>& p) const {
        init();

        uint64_t h_first = std::hash<K1>{}(p.first);
        uint64_t h_second = std::hash<K2>{}(p.second);
        uint64_t v1 = (h_first % M1 * b1 + h_second % M1) % M1;
        uint64_t v2 = (h_first % M2 * b2 + h_second % M2) % M2;

        return (v1 << 32) | v2;
    }
};
template <typename K1, typename K2> uint64_t DoubleHashPair<K1, K2>::b1 = 0;
template <typename K1, typename K2> uint64_t DoubleHashPair<K1, K2>::b2 = 0;
template <typename K1, typename K2, typename V>
using DoubleHashMap = unordered_map<pair<K1, K2>, V, DoubleHashPair<K1, K2>>;
```