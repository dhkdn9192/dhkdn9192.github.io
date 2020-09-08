---
title: HDP 2.6에서 Spark 업그레이드하기
toc: true
toc_sticky: true
toc_label: 목차
categories:
- dev
tags:
- spark
- scala
- HDP
- YARN
---

## 1. Spark 2.2의 import 버그
현재 사용 중인 하둡 클러스터는 HDP 2.6이며 Spark은 2.2 버전을 제공하고 있다.
해당 버전은 spark-shell에서 정상적으로 import가 작동하지 않는 버그([SPARK-22393](https://issues.apache.org/jira/browse/SPARK-22393))가 존재하므로 Zeppelin에서 제대로 Spark 코드를 수행할 수가 없었다.
따라서 해당 버그가 수정된 버전인 Spark 2.4 버전을 HDP 2.6에 설치해 보고자 한다.


## 2. Spark 업그레이드 하기

### 2-1. Spark 2.4 다운로드 및 설치

우선 Apache Ambari 관리모드에서 기존 Spark을 삭제한 뒤, Spark 신규 버전을 Master 노드에 다운로드하였다.
HDP 2.6에선 Hadoop 2.7을 사용하므로 **Pre-built for Apache Hadoop 2.7**을 선택한다.

![download-spark](https://raw.githubusercontent.com/dhkdn9192/dhkdn9192.github.io/master/assets/images/posts/2020/09/08/2020-09-08-download-spark.png)


### 2-2. spark-env.sh 설정
원하는 곳에 압축 해제한 뒤 ```conf/spark-env.sh``` 파일을 열어 아래와 같이 수정한다.

```bash
export HADOOP_HOME=/usr/hdp/2.6.3.0-235/hadoop
export HADOOP_CONF_DIR=/etc/hadoop/conf
```

Spark은 ```${HADOOP_CONF_DIR}/yarn-site.xml``` 파일로부터 YARN과 연결하기 위한 정보들을 가져오게 된다.

### 2-3. spark-shell 실행

```bin/spark-shell```을 수행하면 REPL 환경에서 Spark 프로그래밍을 할 수 있다.
별도의 옵션 없이 수행하면 standalone 모드로 동작한다. YARN과 연동하여 하둡 클러스터를 이용하려면 yarn-client 모드로 동작해야 한다.

```bash
$ ./bin/spark-shell --master yarn --deploy-mode client
```

### 2-4. YARN timeline-service 이슈

위와 같이 yarn-client 모드를 수행하면 다음과 같은 에러가  발생한다.

```
java.lang.NoClassDefFoundError: com/sun/jersey/api/client/config/ClientConfig
  at org.apache.hadoop.yarn.client.api.TimelineClient.createTimelineClient(TimelineClient.java:55)
  at org.apache.hadoop.yarn.client.api.impl.YarnClientImpl.createTimelineClient(YarnClientImpl.java:181)
  at org.apache.hadoop.yarn.client.api.impl.YarnClientImpl.serviceInit(YarnClientImpl.java:168)
  at org.apache.hadoop.service.AbstractService.init(AbstractService.java:163)
  at org.apache.spark.deploy.yarn.Client.submitApplication(Client.scala:161)
  at org.apache.spark.scheduler.cluster.YarnClientSchedulerBackend.start(YarnClientSchedulerBackend.scala:57)
  at org.apache.spark.scheduler.TaskSchedulerImpl.start(TaskSchedulerImpl.scala:188)
  at org.apache.spark.SparkContext.<init>(SparkContext.scala:501)
  at org.apache.spark.SparkContext$.getOrCreate(SparkContext.scala:2520)
  at org.apache.spark.sql.SparkSession$Builder$$anonfun$7.apply(SparkSession.scala:930)
  at org.apache.spark.sql.SparkSession$Builder$$anonfun$7.apply(SparkSession.scala:921)
  at scala.Option.getOrElse(Option.scala:121)
  at org.apache.spark.sql.SparkSession$Builder.getOrCreate(SparkSession.scala:921)
  at org.apache.spark.repl.Main$.createSparkSession(Main.scala:106)
  ... 62 elided
Caused by: java.lang.ClassNotFoundException: com.sun.jersey.api.client.config.ClientConfig
  at java.net.URLClassLoader.findClass(URLClassLoader.java:382)
  at java.lang.ClassLoader.loadClass(ClassLoader.java:424)
  at sun.misc.Launcher$AppClassLoader.loadClass(Launcher.java:349)
  at java.lang.ClassLoader.loadClass(ClassLoader.java:357)
  ... 76 more
```

다행히도 이 오류는 [SPARK-15343](https://issues.apache.org/jira/browse/SPARK-15343)에서 다뤄진 적이 있다.
이슈 내용을 정라하자면 핵심은 다음과 같다.

- YARN의 timeline-service 기능과 관련하여 jersey 라이브러리를 사용하고 있다.
- 기존에 사용하던 HDP 환경에선 YARN과 Spark 모두 jersey 1.9 버전을 사용하고 있었으나, **Spark 2.4는 2.22.2 버전을 사용하므로 서로 호환되지 않는다**.
- YARN은 디폴트로 timeline-service 기능이 켜져있으므로 항상 jersey 호환성으로 인한 NoClassDefFoundError를 일으키게 된다.


jira 이슈에서 제시되는 몇가지 해결책들이 있다.

- timeline-service를 중지하기 위해 YARN 설정에서 ```yarn.timeline-service.enabled``` 옵션을 false로 변경하거나
- spark-shell을 수행할 때 ```--conf spark.timeline-service.enabled=false``` 옵션을 추가해주거나
- spark의 jars 디렉토리에 jersey 1.9 라이브러리를 넣어서 버전을 통일시켜주는 방법이 있다.


YARN에 제출되는 다양한 애플리케이션들 중 오직 Spark만을 위해서 timeline-service 기능을 끄는 것은 다소 실용성이 떨어진다.
jersey의 버전을 강제적으로 통일했을 땐 부가적인 문제가 생길 가능성이 있으므로 여기서는 두번째 방안을 채택하기로 했다.


### 2-5. YARN application has already ended!

timeline-service 이슈를 해결했더니 이번에는 다음과 같은 에러가 발생했다.

```
20/09/08 19:42:53 ERROR cluster.YarnClientSchedulerBackend: The YARN application has already ended! Itmight have been killed or the Application Master may have failed to start. Check the YARN application logs for more details.
20/09/08 19:42:53 ERROR spark.SparkContext: Error initializing SparkContext.
org.apache.spark.SparkException: Application application_1599556837475_0006 failed 2 times due to AM Container for appattempt_1599556837475_0006_000002 exited with  exitCode: 1
For more detailed output, check the application tracking page: http://불라불라불라/cluster/app/application_1599556837475_0006 Then click on links to logs of each attempt.
Diagnostics: Exception from container-launch.
Container id: container_e16_1599556837475_0006_02_000001
Exit code: 1
```

YARN에 작업이 제출된 즉시 애플리케이션이 종료된다.
원인을 찾느라 한참 헤맸는데 사실은 정말 단순한 이유였다.
HDP에선 Spark job을 제출할 때 java 옵션으로 HDP 버전을 명시해줘야 하는데,
HDP와는 별개로 설치한 Spark 패키지여서 이 부분을 생략했던 것이다.

[스택오버플로우](https://stackoverflow.com/questions/55931970/how-can-i-run-spark-in-headless-mode-in-my-custom-version-on-hdp)에 올라온 답변을 참조하여 다음과 같이 옵션을 추가하였다.

```bash
$ ./bin/spark-shell \
  --master yarn \
  --deploy-mode client \
  --conf spark.hadoop.yarn.timeline-service.enabled=false \
  --conf spark.driver.extraJavaOptions='-Dhdp.version=2.6.3.0-235' \
  --conf spark.yarn.am.extraJavaOptions='-Dhdp.version=2.6.3.0-235'
```


여기까지 수행한 끝에 HDP 2.6에서 Spark 2.4 버전을 사용할 수 있게 되었다.
```-Dhdp.version``` 옵션은 설정 파일 등에 추가할 생각이다.

[result](https://raw.githubusercontent.com/dhkdn9192/dhkdn9192.github.io/master/assets/images/posts/2020/09/08/2020-09-08-spark-shell-result.jpeg)
