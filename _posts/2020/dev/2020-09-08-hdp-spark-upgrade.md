---
title: HDP 2.6에서 Spark 업그레이드하기
toc: true
toc_sticky: true
toc_label: 목차
categories:
- apache-spark
tags:
- spark
- scala
- hdp
- yarn
comments: true
---

## 1. Spark 2.2의 import 버그
현재 사용 중인 하둡 클러스터는 HDP 2.6이며 Spark은 2.2 버전을 제공하고 있다.
해당 버전은 spark-shell에서 정상적으로 import가 작동하지 않는 버그([SPARK-22393](https://issues.apache.org/jira/browse/SPARK-22393))가 존재하므로 Zeppelin에서 제대로 Spark 코드를 수행할 수가 없었다.
따라서 해당 버그가 수정된 버전인 Spark 2.4 버전을 HDP 2.6에 설치해 보고자 한다.


## 2. HDP에 외부 Spark 연동하기 (yarn-client)
### 2-1. Spark 2.4.6 다운로드 및 설치

우선 Apache Ambari 관리모드에서 기존 Spark을 삭제한 뒤, Spark 신규 버전을 Master 노드에 다운로드하였다.
HDP 2.6에선 Hadoop 2.7을 사용하므로 **Pre-built for Apache Hadoop 2.7**을 선택한다.

![download-spark](https://raw.githubusercontent.com/dhkdn9192/dhkdn9192.github.io/master/assets/images/posts/2020/09/08/2020-09-08-download-spark.png)

### 2-2. spark-env.sh 및 SPARK_HOME 설정
원하는 곳에 압축 해제한 뒤 ```conf/spark-env.sh``` 파일을 열어 아래와 같이 수정한다.

```bash
export HADOOP_HOME=/usr/hdp/2.6.3.0-235/hadoop
export HADOOP_CONF_DIR=/etc/hadoop/conf
```

```HADOOP_HOME```은 HDP Hadoop이 설치된 경로이다.
Spark은 ```HADOOP_CONF_DIR}``` 하위의 ```yarn-site.xml``` 파일을 이용해 YARN과 연결할 수 있게 된다.

또한, ```~/.bashrc``` 파일을 열어 아래와 같이 ```SPARK_HOME```, ```PATH``` 환경변수를 설정해준다.

```bash
export SPARK_HOME={설치한 Spark 디렉토리 경로}
export PATH=$SPARK_HOME/bin:$PATH
```

### 2-3. spark-shell 실행

```bin/spark-shell```을 실행하면 REPL 환경에서 Spark 프로그래밍을 할 수 있다.
별도의 옵션 없이 수행하면 standalone 모드로 동작한다. YARN과 연동하여 하둡 클러스터를 이용하려면 yarn-client 모드로 동작해야 한다.

```bash
$ ./bin/spark-shell --master yarn --deploy-mode client
```

### 2-4. YARN timeline-service 이슈

hdp에서 위와 같이 yarn-client 모드를 수행하면 다음과 같은 에러가  발생한다.

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
- YARN은 디폴트로 timeline-service 기능이 켜져있으므로 **항상 jersey 호환성으로 인한 NoClassDefFoundError를 일으키게 된다**.


jira 이슈에서 제시되는 몇가지 해결책들이 있다.

- timeline-service를 중지하기 위해 YARN 설정에서 ```yarn.timeline-service.enabled``` 옵션을 false로 변경하거나
- spark-shell을 수행할 때 ```--conf spark.timeline-service.enabled=false``` 옵션을 추가해주거나
- spark의 jars 디렉토리에 jersey 1.9 라이브러리를 넣어서 버전을 통일시켜주는 방법이 있다.


YARN에 제출되는 다양한 애플리케이션들 중 오직 Spark만을 위해서 timeline-service 기능을 끄는 것은 다소 실용성이 떨어진다.
jersey의 버전을 강제적으로 통일했을 땐 부가적인 문제가 생길 가능성이 있으므로 여기서는 두번째 방안을 채택하기로 했다.
옵션을 디폴트로 설정하려면 ```conf/spark-defaults.conf``` 파일에 아래와 같이 추가해준다.
```
spark.hadoop.yarn.timeline-service.enabled   false
```

### 2-5. YARN application has already ended! (hdp.version 이슈)

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
  --conf spark.yarn.am.extraJavaOptions='-Dhdp.version=2.6.3.0-235' \
  --conf spark.executor.extraJavaOptions='-Dhdp.version=2.6.3.0-235'
```

여기까지 수행한 끝에 HDP 2.6에서 yarn-client 모드로 Spark 2.4 버전을 사용할 수 있게 되었다.

![result](https://raw.githubusercontent.com/dhkdn9192/dhkdn9192.github.io/master/assets/images/posts/2020/09/08/2020-09-08-spark-shell-result.jpeg)

해당 옵션을 디폴트로 사용하려면 ```conf/spark-defaults.conf```에 아래 라인들을 추가해준다.
참고로 ```spark.yarn.am.extraJavaOptions``` 옵션은 yarn-cluster 모드에선 효과가 없다.
```
spark.driver.extraJavaOptions    -Dhdp.version=2.6.3.0-235
spark.yarn.am.extraJavaOptions   -Dhdp.version=2.6.3.0-235
spark.executor.extraJavaOptions  -Dhdp.version=2.6.3.0-235
```

## 3. HDP에 Spark Cluster 설치하기 (yarn-cluster)
### 3-1. yarn-client vs. yarn-cluster

위처럼 yarn-client 모드로 사용할 땐 master 노드에만 spark을 설치하면 된다.
그러나 yarn-cluster 모드를 사용하려면 slave 노드들에도 spark이 설치되어야 한다.

- yarn-client

![yarn-client](https://raw.githubusercontent.com/dhkdn9192/dhkdn9192.github.io/master/assets/images/posts/2020/09/11/2020-09-11-yarn-client-mode.png)

- yarn-cluster

![yarn-cluster](https://raw.githubusercontent.com/dhkdn9192/dhkdn9192.github.io/master/assets/images/posts/2020/09/11/2020-09-11-yarn-cluster-mode.png)

위 이미지에서 보듯이, client 모드와 cluster 모드의 가장 큰 차이는 spark driver의 위치다.
cluster 모드에선 spark driver가 application master에서 동작한다.
즉 클러스터 내부에서 spark driver가 생성되어야 한다.
모든 slave 노드들에 spark을 설치해줘야 하는 이유다.


### 3-2. ssh 연결 설정

spark cluster가 구성되려면 각 노드의 spark 계정끼리 ssh로 연결 가능해햐 한다.
ssh 키가 없다면 아래 명령어로 생성해준다.

```bash
$ ssh-keygen
```

master 노드의 ssh public 키를 나머지 노드들에 복사해준다.
```bash
$ ssh-copy-id {계정}@{서버IP} -p {ssh포트번호}
```

그 후, 각 slave 장비에 접속하여 ```~/.ssh/authorized_keys``` 파일의 권한을 확인해준다.
```bash
$ chmod 600 ~/.ssh/authorized_keys
```


### 3-3. Spark Cluster를 위한 설정

slave 노드들에 spark을 설치해주기 전에 master 노드의 spark에 몇가지 설정을 변경해주어야 한다.

#### java-opts
```conf/java-opts``` 파일을 생성하고 아래 라인을 추가한다.
yarn-cluster 모드에서도 hdp.version을 맞추기 위한 설정파일이다.
```
-Dhdp.version=2.6.3.0-235
```


#### spark-env.sh
```conf/spark-env.sh``` 파일에 다음 라인들을 추가한다.

```bash
export SPARK_MASTER='{master 서버 IP}'
export SPARK_WORKER_PORT={ssh포트번호}
export SPARK_SSH_OPTS='-p {ssh포트번호}'
export JAVA_HOME={JAVA_HOME}
```

#### slaves
```conf/slaves.template``` 파일 이름을 ```conf/slaves```로 변경하고 아래 라인들을 추가한다.
```
{slave1 서버IP}
{slave2 서버IP}
{slave3 서버IP}
...(하략)...
```


#### spark_shuffle
이 부분은 Spark이 아니라 Ambari의 YARN 설정에서 수정해주어야 한다.

Spark이 dynamicAllocation을 사용하려면 YARN의 NodeManager 설정에서 spark_shuffle 옵션을 추가해주어야 한다.

그 다음 YARN이 spark_shuffle 기능을 사용할 수 있도록 class path를 입력해주어야 한다.
새로 설치한 Spark의 yarn 디렉토리에 spark-2.4.6-yarn-shuffle.jar 파일이 존재하므로
```${SPARK_HOME}/yarn/*``` 와 같이 classpath를 입력해준다.

![spark_shuffle_setting](https://raw.githubusercontent.com/dhkdn9192/dhkdn9192.github.io/master/assets/images/posts/2020/09/08/2020-09-08-yarn-spark-shuffle-setting.png)

설정 완료 후 YARN을 재시작한다.

### 3-4. Spark Cluster 설치

이제 master 노드의 spark을 압축하여 모든 slave 노드들의 동일한 경로에 복사/압축해제해준다.
각 노드의 ```~/.bashrc```파일에 master 노드와 동일한 설정을 추가해준다.

```bash
export SPARK_HOME={설치한 Spark 디렉토리 경로}
export PATH=$SPARK_HOME/bin:$PATH
```

끝으로 ```JAVA_HOME``` 역시 확인해준다.

```bash
$ echo $JAVA_HOME
```

### 3-5. Spark Cluster 실행

master 노드의 ```SPARK_HOME```에서 다음 명령어로 spark cluster를 실행해준다.

```bash
$ ./sbin/start-all.sh
```

기존에 개발된 spark 프로그램이 yarn-cluster 모드에서 정상 동작하는 것까지 확인하였다.
여기까지 수행하면 Spark 2.4.6 설치가 완료된 것이다.

웬만하면 Ambari나 Cloudera Manager가 제공해주는 버전을 그냥 쓰는게 정신건강에 이로울 것 같다.


### (부록) Zeppelin 설치
hdp 2.6에서 제공하는 Zeppelin의 Spark interpreter는 2.4.6 버전을 지원하지 않으므로 Zeppelin 역시 삭제하고 별도로 설치해야 한다.
최신 버전인 **0.9.0-preview2-bin-netinst** 으로 설치하고 ```conf/zeppelin-env.sh```에 아래와 같은 설정들을 추가해줬다.

```bash
export JAVA_HOME={Java home 경로}
export SPARK_MASTER=yarn-client
export ZEPPELIN_JAVA_OPTS="-Dhdp.version=2.6.3.0-235"
export SPARK_HOME={Spark 설치경로}
export HADOOP_CONF_DIR=/etc/hadoop/conf
```

## References
- https://issues.apache.org/jira/browse/SPARK-22393
- https://issues.apache.org/jira/browse/SPARK-15343
- https://stackoverflow.com/questions/55931970/how-can-i-run-spark-in-headless-mode-in-my-custom-version-on-hdp
- https://medium.com/@goyalsaurabh66/running-spark-jobs-on-yarn-809163fc57e2
- https://kb.informatica.com/solution/23/pages/71/577764.aspx
