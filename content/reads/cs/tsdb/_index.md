+++
title = "Time-series storage engine"
+++

### Writing a Time Series Database from Scratch
#### Time series data
- Time series: identifier & stream of samples/data points as tuples `(timestamp: time, value: float64_t)`, e.g. `identifier -> (t0, v0), (t1, v1), (t2, v2), (t3, v3), ...`
- Identifier: metric name with dictionary of label dimensions, e.g. `requests_total{path="/status", method="GET", instance=”10.0.0.1:80”}` or `{__name__="requests_total", path="/status", method="GET", instance=”10.0.0.1:80”}`
- Query by selecting labels and time window
#### Writing pattern
```
series
  ^   
  │   . . . . . . . . . . . . . . . . .   . . . . .   {__name__="request_total", method="GET"}
  │     . . . . . . . . . . . . . . . . . . . . . .   {__name__="request_total", method="POST"}
  │         . . . . . . .
  │       . . .     . . . . . . . . . . . . . . . .                  ... 
  │     . . . . . . . . . . . . . . . . .   . . . .   
  │     . . . . . . . . . .   . . . . . . . . . . .   {__name__="errors_total", method="POST"}
  │           . . .   . . . . . . . . .   . . . . .   {__name__="errors_total", method="GET"}
  │         . . . . . . . . .       . . . . .
  │       . . .     . . . . . . . . . . . . . . . .                  ... 
  │     . . . . . . . . . . . . . . . .   . . . . 
  v
    <-------------------- time --------------------->
```
- Prometheus retrieves in batch from _targets_ concurrently as samples from each targets are independent. A Prometheus instance collects data points from tens of thousands of targets, each with hundreds to thousands of time series
- Batch writing larger chunks of data is needed. While SSDs are fast for random writes, they only write in pages of 4KiB—writing 16 byte is equivalent to full 4KiB—which is known as [write amplification](https://en.wikipedia.org/wiki/Write_amplification)
- Querying pattern ≠ writing pattern. We can query a single data point from a significantly large number of series. 
```
           +------+  +------+  +------+  +------+
           | t1   |  | t2   |  | t3   |  | t4   |
           |------|  |------|  |------|  |------|
series a:   | a1   |  | a2   |  | a3   |  | a4   |
series b:   | b1   |  | b2   |  | b3   |  | b4   |
series c:   | c1   |  | c2   |  | c3   |  | c4   |
series d:   | d1   |  | d2   |  | d3   |  | d4   |
           +------+  +------+  +------+  +------+
		   Batch 1   Batch 2   Batch 3   Batch 4
```
- Batch writes => vertical sets of data. Querying data points for a series over a time window is slow, since we're reading from random pages.
- Samples from same series should be stored sequentially => scanning with few reads.
- Problem: fast write from data to disk & efficient layout for queries
#### Prometheus's current storage
- Create one file per time series that contains all of its samples in sequential order
- Writing single samples is expensive => batch writing of 1KiB chunks of samples for a series in memory, then flush to files
- Sample changes very little with previous sample => enables compression format
- Gorilla TSDB's compression format: 16 byte => 1.37 byte sample on average
```
   ┌──────────┬─────────┬─────────┬─────────┬─────────┐           series A
   └──────────┴─────────┴─────────┴─────────┴─────────┘
          ┌──────────┬─────────┬─────────┬─────────┬─────────┐    series B
          └──────────┴─────────┴─────────┴─────────┴─────────┘ 
                              . . .
 ┌──────────┬─────────┬─────────┬─────────┬─────────┬─────────┐   series XYZ
 └──────────┴─────────┴─────────┴─────────┴─────────┴─────────┘ 
   chunk 1    chunk 2   chunk 3     ...
```
- Keeping a separate file for each series is problematic
- A lot more files are needed than the number of time series. Millions of files => run out of [inodes](https://en.wikipedia.org/wiki/Inode). Reformatting disks is disruptive.
- Every second, thousands of chunks might be filled => flushed to different places. So the number of writes is still high => slower.
- DB can't keep files opened as they use OS entries. Files are closed => querying old data must open thousands of files => slow. Caching hides slowness. Caching too aggressively => increases memory use.
- Old data has to be deleted by removing it from the front of the files => write intensive & further write amplification.
- Head chunk (not full) are held in memory => data loss if app crashes. Prevention by periodically checkpointing memory to disk => slow. Recovery from checkpoint is also slow.
#### Series Churn
- Series churn: inactive set of time series, i.e. receives no more data points
- For example, performing a rolling update on microservices instances that generate the time series introduces series churn
- This may happen frequently by systems like Kubernetes
```
series
  ^
  │   . . . . . .
  │   . . . . . .
  │   . . . . . .
  │               . . . . . . .
  │               . . . . . . .
  │               . . . . . . .
  │                             . . . . . .
  │                             . . . . . .
  │                                         . . . . .
  │                                         . . . . .
  │                                         . . . . .
  v
    <-------------------- time --------------------->
```
- Infrastructure remains constant while time series grows linearly
- No issues on collecting data, but bad query performance
---
### Prometheus TSDB
#### The Head Block
#### WAL and Checkpoint
#### Memory Mapping of Head Chunks from Disk
---
### Gorilla: A Fast, Scalable, In-Memory Time Series Database
#### Section 4.1, the compression section
#### The design goals list (in the introduction)
---
Sources:
1. https://fabxc.org/tsdb/ | https://web.archive.org/web/20210803115658/https://fabxc.org/tsdb/
2. https://ganeshvernekar.com/blog/prometheus-tsdb-the-head-block/
3. https://ganeshvernekar.com/blog/prometheus-tsdb-wal-and-checkpoint/
4. https://ganeshvernekar.com/blog/prometheus-tsdb-mmapping-head-chunks-from-disk/
5. https://www.vldb.org/pvldb/vol8/p1816-teller.pdf