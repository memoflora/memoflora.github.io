+++
title = "CS (WIP)"
+++

I'm **currently**:
- building a ray tracer in C++
- learning C++ & Go
- reading [Functional Programming in Scala](https://www.oreilly.com/library/view/functional-programming-in/9781617299582/)

---

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

