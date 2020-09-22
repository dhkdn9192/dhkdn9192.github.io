---
title: "[YARN] CPU 코어 할당을 위한 스케줄러 설정"
comments: true
toc: true
toc_sticky: true
toc_label: 목차
categories: []
tags:
- yarn
- spark
---

## 1. YARN의 초기 CPU 스케줄링 문제
Hadoop 클러스터를 처음 구축하면 애플리케이션을 제출할 때 CPU 코어 수가 원하는대로 할당되지 않는 문제를 겪게 된다.
아래와 같이 yarn-client 모드로 SparkSession을 생성하는 예시를 보자.

```python
spark = SparkSession \
	.builder \
	.appName("Spark_Example") \
	.master("yarn-client") \
	.config("spark.executor.instances", "3") \
	.config("spark.executor.memory", "10g") \
	.config("spark.executor.cores", "5") \
	.getOrCreate()
```

```spark.executor.cores``` 설정으로 executor 당 5개 코어를 쓰도록 설정했다.
그러나 실제로 executor별로 할당된 코어수는 1개 뿐이다.

![yarn-cores-before](https://raw.githubusercontent.com/dhkdn9192/dhkdn9192.github.io/master/assets/images/posts/2020/09/22/2020-09-22-yarn-cores-before.jpeg)

코어가 설정값대로 할당되지 않는 이유는 YARN의 디폴트 스케줄러 설정이 CPU 스케줄링을 지원하지 않기 때문이다.
YARN의 스케줄링과 리소스 할당을 간단하게 살펴보자.


## 2. YARN 스케줄링
YARN은 애플리케이션의 요청에 따라 클러스터의 자원을 할당해주어야 한다.
이러한 역할은 YARN 스케줄러가 수행한다.
YARN은 다음 이미지와 같이 3가지 스케줄러 옵션을 제공한다.

![yarn_scheduling](https://raw.githubusercontent.com/dhkdn9192/dhkdn9192.github.io/master/assets/images/posts/2020/09/22/2020-09-22-yarn-scheduling.png)

### (a) FIFO Scheduler
모든 잡은 큐에 들어운 순서대로 실행되고 자기 차례가 될 때까지 대기해야 한다.
간단하고 이해하기 쉽지만 하나의 잡이 모든 자원을 차지해버릴 수 있기 때문에 
대규모 클러스터에서 사용하기에 적합하진 않다.

### (b) Capacity Scheduler
각각의 잡은 서로 구분되는 전용 큐에서 처리된다.
잡을 위한 자원을 미리 예약해두어야 하므로 전체 클러스터 관점에선 자원 효율성이 떨어진다.
보통 이 capacity scheduler를 기본적으로 사용하게 된다.

### (c) Fair Scheduler
실행 중인 모든 잡에 대해 자원을 동적으로 할당해준다.
이미 잡이 실행 중일 때 다른 잡이 추가되면 각 잡은 클러스터 자원을 절반씩 할당받는다.
즉, 잡들이 공평하게 자원을 나눠가질 수 있다.


## 3. YARN Resource Allocation
언급한대로 Capacity Scheduler를 디폴트로 사용한다.
스케줄링의 기본 단위는 큐이며 각 잡은 전용 큐에서 처리된다.
각 큐의 용량은 클러스터 가용 자원 중 애플리케이션이 제출한 비율만큼을 할당하여 정해진다.

이 과정에서 클러스터 자원 할당을 위해 Resource Calculator가 사용된다.
YARN이 디폴트로 사용하는 것은 **DefaultResourceCalculator**이다.
DefaultResourceCalculator는 오직 메모리만을 기준으로 하여 자원을 할당한다.
즉, CPU 코어 수는 스케줄링하지 않는다.
처음 Hadoop 클러스터를 구성했을 때 YARN 애플리케이션에 CPU 코어 수를 원하는대로 할당할 수 없는 이유가 바로 이것이다.

CPU 자원을 할당하는 방법은 Resource Calculator를 **DominantResourceCalculator**로 변경하는 것이다.
YARN의 ResourceManager와 각 NodeManager에서 Hadoop 설정 파일 중 ```capacity-scheduler.xml```를 열어보자.

```bash
# vim /etc/hadoop/conf/capacity-scheduler.xml
```

여러 property들 중에서 resource-calaulator 항목을 찾을 수 있다.
최초 설치 시 DefaultResourceCalculator로 설정되어 있는데 이를 다음처럼 DominantResourceCalculator로 변경한다.

```xml
<property>
	<name>yarn.scheduler.capacity.resource-calculator</name>
	<value>org.apache.hadoop.yarn.util.resource.DominantResourceCalculator</value>
</property>
```

HDP의 경우엔 Ambari에서 CPU Scheduling 설정을 Enabled로 변경하면 모든 YARN 컴포넌트 서버들에 대해 ```capacity-scheduler.xml```을 수정해준다.

![yarn_cpu_scheduling_config](https://raw.githubusercontent.com/dhkdn9192/dhkdn9192.github.io/master/assets/images/posts/2020/09/22/2020-09-22-yarn-cpu-scheduling-config.jpeg)


## References
- https://towardsdatascience.com/schedulers-in-yarn-concepts-to-configurations-5dd7ced6c214
- https://docs.cloudera.com/HDPDocuments/HDP2/HDP-2.6.3/bk_yarn-resource-management/content/about_yarn_resource_allocation.html
