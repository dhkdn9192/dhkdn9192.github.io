var store = [{
        "title": "Spark Shell import 에러",
        "excerpt":"1. 문제 발견 Zeppelin에서 Spark을 사용하다가 이해할 수 없는 에러를 보게 되었다. 아래는 “9가지 사례로 익히는 고급 스파크 분석” 책의 예제코드이다. import com.esri.core.geometry.Geometry class RichGeometry(val geometry: Geometry, ...) { ... } 위 코드를 Zeppelin에서 수행하게 되면 아래와 같은 에러가 뜬다. 첫 줄의 java esri 라이브러리는 Zeppelin의 Spark interpreter 옵션에서 Dependencies...","categories": ["apache-spark"],
        "tags": ["spark","zeppelin","scala"],
        "url": "http://localhost:4000/apache-spark/sparkshell-import-error/",
        "teaser": null
      },{
        "title": "HDP 2.6에서 Spark 업그레이드하기",
        "excerpt":"1. Spark 2.2의 import 버그 현재 사용 중인 하둡 클러스터는 HDP 2.6이며 Spark은 2.2 버전을 제공하고 있다. 해당 버전은 spark-shell에서 정상적으로 import가 작동하지 않는 버그(SPARK-22393)가 존재하므로 Zeppelin에서 제대로 Spark 코드를 수행할 수가 없었다. 따라서 해당 버그가 수정된 버전인 Spark 2.4 버전을 HDP 2.6에 설치해 보고자 한다. 2. HDP에 외부 Spark...","categories": ["apache-spark"],
        "tags": ["spark","scala","hdp","yarn"],
        "url": "http://localhost:4000/apache-spark/hdp-spark-upgrade/",
        "teaser": null
      },{
        "title": "PySpark의 py4j 호환성 오류",
        "excerpt":"1. Py4JError 기존에 사용하던 Spark을 2.2.0 -&gt; 2.4.6으로 변경했더니 Jupyter에서 PySpark이 정상적으로 동작하지 않는 오류가 발생했다. 실행한 코드는 아래와 같이 SparkSession을 생성하는 간단한 내용이다. from pyspark.sql import SparkSession spark = SparkSession.builder.getOrCreate() SparkSession을 생성하려고 하면 다음과 같이 Py4JError가 발생한다. Py4JError Traceback (most recent call last) &lt;ipython-input-3-ce55329f3d67&gt; in &lt;module&gt;() ----&gt; 1 spark...","categories": ["apache-spark"],
        "tags": ["spark","pyspark","py4j"],
        "url": "http://localhost:4000/apache-spark/pyspark-py4j-error/",
        "teaser": null
      },{
        "title": "Apache Nutch 튜닝하기",
        "excerpt":"1. Apache Nutch Apache Nutch는 Java 언어로 만들어진 분산형 웹 크롤러다. 현재는 널리 쓰이고 있는 Hadoop이 바로 이 Nutch의 하위 프로젝트에서 시작되었다. 최근 Nutch로 웹 크롤러를 구축하면서 소소하게 경험해본 것들을 기록해본다. name version Nutch 1.17 OpenJDK 1.8.0_265 Hadoop 2.7.3 (hdp 2.6.3) 2. What to crawl 구축할 웹 크롤러의 목적은 타겟...","categories": ["apache-nutch"],
        "tags": ["nutch","java","crawler","airflow"],
        "url": "http://localhost:4000/apache-nutch/nutch-tuning/",
        "teaser": null
      },{
        "title": "오픈 소스 bug-fix에 기여한 소소한 썰",
        "excerpt":"최근 웹 크롤러를 구축하기 위해 Apache Nutch를 사용하다가 소스코드 상의 버그를 발견하게 되었다. 이를 해결하고 contributor에게 공유했던 경험을 기록해보았다. 1. 문제의 발견 1-1. Crawling Workflow Apache Nutch는 Hadoop 위에서 동작하는 분산형 웹 크롤러다. (이전 포스트) 웹 페이지를 수집하기 위해 여러 단계를 거쳐 작업이 수행되며 아래와 같은 워크플로우를 형성한다. (자세한 설명은...","categories": ["apache-nutch"],
        "tags": ["java","nutch","jira"],
        "url": "http://localhost:4000/apache-nutch/opensource-bugfix-ssul/",
        "teaser": null
      },{
        "title": "CPU 코어 할당을 위한 YARN 스케줄러 설정",
        "excerpt":"1. YARN의 초기 CPU 스케줄링 문제 Hadoop 클러스터를 처음 구축하면 애플리케이션을 제출할 때 CPU 코어 수가 원하는대로 할당되지 않는 문제를 겪게 된다. 아래와 같이 yarn-client 모드로 SparkSession을 생성하는 예시를 보자. spark = SparkSession \\ .builder \\ .appName(\"Spark_Example\") \\ .master(\"yarn-client\") \\ .config(\"spark.executor.instances\", \"3\") \\ .config(\"spark.executor.memory\", \"10g\") \\ .config(\"spark.executor.cores\", \"5\") \\ .getOrCreate()...","categories": ["apache-hadoop"],
        "tags": ["yarn","spark"],
        "url": "http://localhost:4000/apache-hadoop/yarn-resource-allocation/",
        "teaser": null
      },{
        "title": "Spark Executor의 메모리 구조",
        "excerpt":"Spark 1.6 이상부턴 메모리 관리가 UnifiedMemoryManager class에 의해 이뤄진다. 1. Reserved Memory 시스템에 의해 관리되는 메모리 영역으로 크기가 300MB로 고정되어 있다. Spark의 internal object들이 저장된다. Executor에 할당해준 메모리가 Reserved Memory 크기의 1.5배 미만이면 “please use larger heap size“라는 문구와 함께 에러가 발생한다. 메모리 사이즈 : 300 MB (고정) 2. User...","categories": ["apache-spark"],
        "tags": ["spark","java","jvm"],
        "url": "http://localhost:4000/apache-spark/spark_executor_memory_structure/",
        "teaser": null
      },{
        "title": "Garbage Collection 개념 정리",
        "excerpt":"Java에선 메모리 관리를 Garbage Collector가 수행한다. 메모리 상의 불필요한 객체를 찾아 해제하는 역할을 수행한다. GC가 발생하는 예시로, Java의 String 연산을 빈번하게 수행하면 불필요한 객체가 많이 생성되므로 잦은 GC를 유발하게 되고 성능이 저하될 수 있다. 1. JVM의 Runtime Data Area JVM의 Runtime Data Area는 다음과 같이 크게 5가지 요소로 구성된다. method...","categories": ["computer_science"],
        "tags": ["jvm","gc","java"],
        "url": "http://localhost:4000/computer_science/garbage-collection/",
        "teaser": null
      },{
        "title": "효율적인 Spark Join 전략",
        "excerpt":"Spark에서 join을 수행하는 경우는 크게 두 가지로 나눌 수 있다. (1) 큰 테이블과 작은 테이블을 조인 또는 (2) 큰 테이블과 큰 테이블을 조인. Spark은 join을 수행하기 위해 Sort Merge Join, Broadcast Join, Shuffle Hash Join 등의 방법을 제공한다. 핵심 키워드 : sort merge join, shuffle hash join, broadcast join, straggler...","categories": ["apache-spark"],
        "tags": ["spark","jvm"],
        "url": "http://localhost:4000/apache-spark/spark-join-strategy/",
        "teaser": null
      },{
        "title": "Python의 GIL",
        "excerpt":"CPython에서의 GIL은 여러개의 thread로 Python 코드(bytecode)를 실행할 결우, 단 하나의 thread만이 Python Object에 접근할 수 있도록 제한하는 mutex이다. 이 lock이 필요한 이유는 CPython의 메모리 관리가 thread-safe하지 않기 때문이다. 핵심 키워드: mutex, thread-safe, synchronized, race-condition 1. CPython의 메모리 관리: Reference Counting CPython은 각 object별로 reference count를 기록하는 방식으로 메모리를 관리한다. reference...","categories": ["computer_science"],
        "tags": ["python","gil"],
        "url": "http://localhost:4000/computer_science/python-gil/",
        "teaser": null
      },{
        "title": "Kafka + Spark Streaming Integration",
        "excerpt":"Spark Streaming과 Kafka를 연동하는 방법에는 크게 2가지가 있다. Receiver-based Approach Direct Approach (No Receivers) 1. Receiver-based Approach 이 통합 방식에서는 데이터 전달 과정에서 더 나은 Fault-tolerance 수준을 보장하기 위해 Spark 1.2부터 도입된 Write Ahead Log (WAL)를 사용한다. Spark Executor에 존재하는 Receiver가 Kafka로부터 데이터를 consume한다. Kafka의 high-level consumer API를 사용한다. 수신된...","categories": ["apache-spark","apache-kafka"],
        "tags": ["spark","kafka","spark-streaming"],
        "url": "http://localhost:4000/apache-spark/apache-kafka/kafka-sparkstreaming-integration/",
        "teaser": null
      },{
        "title": "Java : String vs StringBuffer, StringBuilder",
        "excerpt":"Java String으로 문자열 연산을 수행하기 위해 아래와 같은 쿼리를 수행한다고 가정해보자 String myQuery = \"\"; myQuery += \"select * \"; myQuery += \"from atable \"; myQuery += \"limit 100; \"; 최종적으로 myQuery 문자열에 저장되는 값은 “select * from atable limit 100;” 이라는 sql 쿼리문이다. 그러나 각 라인을 수행하면서 각각의 부분...","categories": ["computer_science"],
        "tags": ["jvm","gc","java"],
        "url": "http://localhost:4000/computer_science/java-stringbuffer-stringbuilder/",
        "teaser": null
      },{
        "title": "Spark Streaming에서 Kafka 메시지를 효율적으로 읽으려면?",
        "excerpt":"컨슈머는 Kafka로부터 메시지를 subscribe하고 처리하여 원하는 저장소에 전달한다. 만약 프로듀서가 토픽에 메시지를 입력하는 속도가 컨슈머의 처리 속도를 초과한다면 어떻게 해야할까? 이 경우엔 여러 컨슈머가 같은 토픽을 subscribe할 수 있도록 컨슈머 그룹를 확장해야 한다. 모든 컨슈머는 특정 컨슈머 그룹에 소속된다. 만약 같은 그룹의 컨슈머들이 같은 토픽을 subscribe한다면 각 컨슈머는 서로 겹치지...","categories": ["apache-kafka"],
        "tags": ["spark","kafka"],
        "url": "http://localhost:4000/apache-kafka/kafka-consuming-in-sparkstreaming/",
        "teaser": null
      },{
        "title": "Kafka's exactly-once delivery",
        "excerpt":"Kafka에서 메시지를 중복이나 누락 없이 순서대로 전달되도록 보증하려면 어떻게 해야할까? 1. Messaging sementics 카프카와 같은 메시징 시스템은 특정 수준의 메시지 보증 전략을 가지고 있다. at-most-once : 실패나 타임아웃 등이 발생하면 메시지를 버릴 수 있다. 데이터가 일부 누락되더라도 영향이 없는 경우엔 대량처리 및 짧은 주기의 전송 서비스에 유용할 수 있다. exactly-once...","categories": ["apache-kafka"],
        "tags": ["kafka"],
        "url": "http://localhost:4000/apache-kafka/kakfa-exactly-once-delivery/",
        "teaser": null
      },{
        "title": "CPU 스케줄링 알고리즘",
        "excerpt":"스케줄링(scheduling)은 다중 프로그래밍을 가능하게 하는 운영 체제의 동작 기법이다. 운영 체제는 프로세스들에게 CPU 등의 자원 배정을 적절히 함으로써 시스템의 성능을 개선할 수 있다. 1. 스케줄링 알고리즘 평가 기준 항목 설명 CPU 사용률(CPU Utilization) 전체 시스템 시간 중 CPU가 작업을 처리하는 시간의 비율 처리량(Throughput) CPU가 단위 시간당 처리하는 프로세스의 개수 응답...","categories": ["computer_science"],
        "tags": ["os","cpu-scheduling"],
        "url": "http://localhost:4000/computer_science/cpu-scheduling-algorithm/",
        "teaser": null
      },{
        "title": "페이지 교체 알고리즘",
        "excerpt":"페이지 교체 알고리즘은 페이징 기법으로 메모리를 관리하는 운영체제에서, Page Fault가 발생 하여 새로운 페이지를 할당하기 위해 현재 할당된 페이지 중 어느 것과 교체할지를 결정하는 방법이다. 이 알고리즘이 사용되는 시기는 Page Fault가 발생해 새로운 페이지를 적재 해야하나 페이지를 적재할 공간이 없어 이미 적재되어 있는 페이지 중 교체할 페이지를 정할 때 사용된다....","categories": ["computer_science"],
        "tags": ["os","virtual-memory"],
        "url": "http://localhost:4000/computer_science/page-replacement-algorithm/",
        "teaser": null
      },{
        "title": "교착상태의 개념과 발생조건",
        "excerpt":"교착상태(Deadlock)은 프로세스가 자원을 얻지 못해 다음 처리를 하지 못하는 상태를 의미한다. 시스템적으로 한정된 자원을 여러 곳에서 사용하려고 할 때 발생한다. 1. 교착상태 발생 조건 1-1. 상호배제 (Mutual Exclusion) 한 자원에 대해 동시에 한 프로세스만 접근 가능 1-2. 점유와 대기 (Hold and Wait) 자원을 점유한 상태에서 다른 프로세스의 자원이 반납되기를 기다림...","categories": ["computer_science"],
        "tags": ["os","deadlock"],
        "url": "http://localhost:4000/computer_science/",
        "teaser": null
      }]
