+++
title = "CS (WIP)"
+++

Here's a random sample code:
```cpp
int binpow(int x, int y) {
    int res = 1;
    while (y > 0) {
        if (y & 1) res *= x;
        x *= x;
        y >>= 1;
    }
    return res;
}
```

