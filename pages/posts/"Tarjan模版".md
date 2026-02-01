---
title: "Tarjan模版"
date: "2026-02-01 14:23:35"
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

## Tarjan模版

```cpp
#include <bits/stdc++.h>
#define int long long
#define endl '\n'

using namespace std;

const int N = 107;

vector<vector<int>> g(N);
int dfn[N], low[N], step_count;
int stk[N], top;
bool in_stack[N];
int scc_cnt, id[N], sz[N];
int out_data[N];


void tarjan(int u) {

	dfn[u] = low[u] = ++step_count;
	stk[++top] = u;
	in_stack[u] = true;

	for (int v : g[u]) {
		if (!dfn[v]) {
			tarjan(v);
			low[u] = min(low[u], low[v]);
		} else if (in_stack[v]) {
			low[u] = min(low[u], dfn[v]);
		}
	}

	if (dfn[u] == low[u]) {

		++scc_cnt;
		while (true) {
			int t = stk[top--];
			in_stack[t] = false;
			id[t] = scc_cnt;
			sz[scc_cnt]++;
			if (t == u) break;
		}

	}

}
```