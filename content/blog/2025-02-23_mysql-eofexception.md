+++
title = "MySQL EOFException when streaming on AWS Aurora"

[taxonomies]
tags = [
    "aws",
    "java",
]
+++

In a Java application that uses Hibernate to access a MySQL database, I randomly encountered an `EOFException` when trying to stream a large result set from an AWS Aurora database cluster.
Streaming the results was set up using the fetch-size hint:

```java
TypedQuery<_> query = ...;
query.setHint(QueryHints.HINT_FETCH_SIZE, Integer.MIN_VALUE);
```

The exception encountered was:

```
java.io.EOFException: Can not read response from server. Expected to read 71 bytes, read 0 bytes before connection was unexpectedly lost.
```

While I was never able to pinpoint the actual root cause, one common point I identified is that the exception only occurred when the query was executed against a read-replica in the Aurora cluster, and never when executed against the writer.

This means that for us the fix was to force the query to run against the writer, which is not ideal but at least it works.
