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
        "excerpt":"최근 웹 크롤러를 구축하기 위해 Apache Nutch를 사용하다가 소스코드 상의 버그를 발견하게 되었다. 이를 해결하고 contributor에게 공유했던 경험을 기록해보았다. 1. 문제의 발견 1-1. Nutch Workflow Apache Nutch는 Hadoop 위에서 동작하는 분산형 웹 크롤러다. (이전 포스트) 웹 페이지를 수집하기 위한 다양한 컴포넌트들로 구성되며 아래와 같은 워크플로우로 동작한다. 워크플로우에서 웹 페이지의 수집은...","categories": ["apache-nutch"],
        "tags": ["java","nutch","jira"],
        "url": "http://localhost:4000/apache-nutch/opensource-bugfix-ssul/",
        "teaser": null
      }]
