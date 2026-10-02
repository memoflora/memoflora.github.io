+++
title = "Time-series storage engine"
+++

1. Writing a Time Series Database from Scratch
	- Time series data
		- Time series: identifier & stream of data points as tuples `(timestamp: time, value: float64_t)`, e.g. `identifier -> (t0, v0), (t1, v1), (t2, v2), (t3, v3), ...`
		- Identifier: metric name with dictionary of label dimensions, e.g. `requests_total{path="/status", method="GET", instance=”10.0.0.1:80”}` or `{__name__="requests_total", path="/status", method="GET", instance=”10.0.0.1:80”}`
		- Query by selecting labels and time window
	- Writing pattern
		- ```
		  series 
		  ^ 
		  │ . . . . . . . {__name__="request_total", method="GET"} 
		  │ . . . . . . . . . . . . . . . . . . . . .  {__name__="request_total", method="POST"} 
		  │ . . . . . . . 
		  │ . . . . . . . . . . . . . . . . . . . ... 
		  │ . . . . . . . . . . . . . . . . . . . . . 
		  │ . . . . . . . . . . . . . . . . . . . . . {__name__="errors_total", method="POST"} 
		  │ . . . . . . . . . . . . . . . . . {__name__="errors_total", method="GET"} 
		  │ . . . . . . . . . . . . . . 
		  │ . . . . . . . . . . . . . . . . . . . ... 
		  │ . . . . . . . . . . . . . . . . . . . . 
		  v 
			  <-------------------- time --------------------->
		  ```
		- Prometheus retrieves in batch from _targets_ concurrently as samples from each targets are independent. A Prometheus instance collects data points from tens of thousands of targets, each with hundreds to thousands of time series
		- Batch writing larger chunks of data is needed. While SSDs are fast for random writes, they only write in pages of 4KiB—writing 16 byte is equivalent to full 4KiB—which is known as [write amplification](https://en.wikipedia.org/wiki/Write_amplification)
		- Querying pattern ≠ writing pattern. We can query a single data point from a significantly large number of series. 
		- Batch writes => vertical sets of data. Querying data points for a series over a time window is slow (reading from lots of random places).
		- Samples from same series should be stored sequentially => scanning with few reads.
		- Problem: fast write from data to disk & efficient layout for queries
2. Prometheus TSDB
	- The Head Block
	- WAL and Checkpoint
	- Memory Mapping of Head Chunks from Disk
3. Gorilla: A Fast, Scalable, In-Memory Time Series Database
	- Section 4.1, the compression section
	- The design goals list (in the introduction)

Sources:
1. https://fabxc.org/tsdb/ | https://web.archive.org/web/20210803115658/https://fabxc.org/tsdb/
2. https://ganeshvernekar.com/blog/prometheus-tsdb-the-head-block/ | https://ganeshvernekar.com/blog/prometheus-tsdb-wal-and-checkpoint/ | https://ganeshvernekar.com/blog/prometheus-tsdb-mmapping-head-chunks-from-disk/
3. https://www.vldb.org/pvldb/vol8/p1816-teller.pdf
