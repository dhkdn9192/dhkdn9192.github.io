var store = [{
        "title": "Spark Shell import 에러",
        "excerpt":"1. 문제 발견 Zeppelin에서 Spark을 사용하다가 이해할 수 없는 에러를 보게 되었다. 아래는 “9가지 사례로 익히는 고급 스파크 분석” 책의 예제코드이다. import com.esri.core.geometry.Geometry class RichGeometry(val geometry: Geometry, ...) { ... } 위 코드를 Zeppelin에서 수행하게 되면 아래와 같은 에러가 뜬다. 첫 줄의 java esri 라이브러리는 Zeppelin의 Spark interpreter 옵션에서 Dependencies...","categories": ["dev"],
        "tags": ["spark","zeppelin","scala"],
        "url": "http://localhost:4000/dev/sparkshell-import-error/",
        "teaser": null
      },{
        "title": "HDP 2.6에서 Spark 업그레이드하기",
        "excerpt":"1. Spark 2.2의 import 버그 현재 사용 중인 하둡 클러스터는 HDP 2.6이며 Spark은 2.2 버전을 제공하고 있다. 해당 버전은 spark-shell에서 정상적으로 import가 작동하지 않는 버그(SPARK-22393)가 존재하므로 Zeppelin에서 제대로 Spark 코드를 수행할 수가 없었다. 따라서 해당 버그가 수정된 버전인 Spark 2.4 버전을 HDP 2.6에 설치해 보고자 한다. 2. HDP에 외부 Spark...","categories": ["dev"],
        "tags": ["spark","scala","hdp","yarn"],
        "url": "http://localhost:4000/dev/hdp-spark-upgrade/",
        "teaser": null
      },{
        "title": "PySpark의 py4j 호환성 오류",
        "excerpt":"1. Py4JError 기존에 사용하던 Spark을 2.2.0 -&gt; 2.4.6으로 변경했더니 Jupyter에서 PySpark이 정상적으로 동작하지 않는 오류가 발생했다. 실행한 코드는 아래와 같이 SparkSession을 생성하는 간단한 내용이다. from pyspark.sql import SparkSession spark = SparkSession.builder.getOrCreate() SparkSession을 생성하려고 하면 다음과 같이 Py4JError가 발생한다. Py4JError Traceback (most recent call last) &lt;ipython-input-3-ce55329f3d67&gt; in &lt;module&gt;() ----&gt; 1 spark...","categories": ["dev"],
        "tags": ["spark","pyspark","py4j"],
        "url": "http://localhost:4000/dev/pyspark-py4j-error/",
        "teaser": null
      }]
