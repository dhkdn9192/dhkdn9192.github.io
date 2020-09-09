---
title: PySpark의 py4j 호환성 오류
toc: true
toc_sticky: true
toc_label: 목차
categories:
- dev
tags:
- spark
- pyspark
- py4j
---

## 1. Py4JError
기존에 사용하던 Spark을 2.2.0 -> 2.4.6으로 변경했더니 Jupyter에서 PySpark이 정상적으로 동작하지 않는 오류가 발생했다.
실행한 코드는 아래와 같이 SparkSession을 생성하는 간단한 내용이다.

```scala
from pyspark.sql import SparkSession

spark = SparkSession.builder.getOrCreate()
```

SparkSession을 생성하려고 하면 다음과 같이 Py4JError가 발생한다.

```
Py4JError                                 Traceback (most recent call last)
<ipython-input-3-ce55329f3d67> in <module>()
----> 1 spark = SparkSession.builder.getOrCreate()
      2 spark

/opt/spark-2.4.6-bin-hadoop2.7/python/pyspark/sql/session.py in getOrCreate(self)
/opt/spark-2.4.6-bin-hadoop2.7/python/pyspark/context.py in getOrCreate(cls, conf)
/opt/spark-2.4.6-bin-hadoop2.7/python/pyspark/context.py in __init__(self, master, appName, sparkHome, pyFiles, environment, batchSize, serializer, conf, gateway, jsc, profiler_cls)
/opt/spark-2.4.6-bin-hadoop2.7/python/pyspark/context.py in _ensure_initialized(cls, instance, gateway, conf)
/opt/spark-2.4.6-bin-hadoop2.7/python/pyspark/java_gateway.py in launch_gateway(conf)
/opt/spark-2.4.6-bin-hadoop2.7/python/pyspark/java_gateway.py in _launch_gateway(conf, insecure)
/data/venv/lib64/python3.6/site-packages/py4j/java_gateway.py in java_import(jvm_view, import_str)
/data/venv/lib64/python3.6/site-packages/py4j/protocol.py in get_return_value(answer, gateway_client, target_id, name)
    321                 raise Py4JError(
    322                     "An error occurred while calling {0}{1}{2}. Trace:\n{3}\n".
--> 323                     format(target_id, ".", name, value))
    324         else:
    325             raise Py4JError(

Py4JError: An error occurred while calling None.None. Trace:
Authentication error: unexpected command. 
```

## 2. PySpark의 JVM 연동
위 현상은 새로 설치한 spark의 pyspark shell에서는 발생하지 않는다.
기존에 사용하던 python 가상환경에서 pyspark을 import하여 사용할 때에만 발생한다.

PySpark은 python으로 작성된 코드를 jvm에서 수행하기 위해 py4j 라이브러리를 사용한다.
```${SPARK_HOME}/python/pyspark/java_gateway.py```를 보면 
py4j의 java_import 함수를 사용하여 필요한 클래스들을 jvm에 import한다.

```python
    # Import the classes used by PySpark
    java_import(gateway.jvm, "org.apache.spark.SparkConf")
    java_import(gateway.jvm, "org.apache.spark.api.java.*")
    java_import(gateway.jvm, "org.apache.spark.api.python.*")
    java_import(gateway.jvm, "org.apache.spark.ml.python.*")
    java_import(gateway.jvm, "org.apache.spark.mllib.api.python.*")
    # TODO(davies): move into sql
    java_import(gateway.jvm, "org.apache.spark.sql.*")
    java_import(gateway.jvm, "org.apache.spark.sql.api.python.*")
    java_import(gateway.jvm, "org.apache.spark.sql.hive.*")
    java_import(gateway.jvm, "scala.Tuple2")
```

## 3. 원인과 해결책

여기서 오류가 발생한 이유는 정말 사소한 것 때문이었다.
기존에 사용하던 PySpark을 위해 py4j를 설치했었는데,
신규 설치한 Spark이 요구하는 버전과 달라서 오류가 발생했던 것이다.

기존 사용하던 python 가상환경에는 py4j 0.10.4 버전이 설치되어 있었다.
반면 ```${SPARK_HOME}/python/setup.py```에서 신규 설치한 pyspark이 요구하는 py4j 버전은 다음과 같다.
```python
install_requires=['py4j==0.10.7'],
```

요구하는 버전을 설치하여 정말 간단하게 해결할 수 있는 문제였다.
```bash
$ pip install py4j==0.10.7
```
