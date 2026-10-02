+++
title = "Time-series storage engine"
+++

1. Writing a Time Series Database from Scratch
	1. Time series data
		- Time series: identifier & stream of data points as tuples `(timestamp: time, value: float64_t)`, e.g. `identifier -> (t0, v0), (t1, v1), (t2, v2), (t3, v3), ...`
		- Identifier: metric name with dictionary of label dimensions, e.g. `requests_total{path="/status", method="GET", instance=”10.0.0.1:80”}` or `{__name__="requests_total", path="/status", method="GET", instance=”10.0.0.1:80”}`
		- Query by selecting labels and time window
2. Prometheus TSDB
	1. The Head Block
	2. WAL and Checkpoint
	3. Memory Mapping of Head Chunks from Disk
3. Gorilla: A Fast, Scalable, In-Memory Time Series Database
	1. Section 4.1, the compression section
	2. The design goals list (in the introduction)

Sources:
1. https://fabxc.org/tsdb/ | https://web.archive.org/web/20210803115658/https://fabxc.org/tsdb/
2. https://ganeshvernekar.com/blog/prometheus-tsdb-the-head-block/ | https://ganeshvernekar.com/blog/prometheus-tsdb-wal-and-checkpoint/ | https://ganeshvernekar.com/blog/prometheus-tsdb-mmapping-head-chunks-from-disk/
3. https://www.vldb.org/pvldb/vol8/p1816-teller.pdf
