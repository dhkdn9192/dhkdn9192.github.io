var store = [{
        "title": "Spark Shell import 에러",
        "excerpt":"1. 문제 발견 Zeppelin에서 Spark을 사용하다가 이해할 수 없는 에러를 보게 되었다. 아래는 “9가지 사례로 익히는 고급 스파크 분석” 책의 예제코드이다. import com.esri.core.geometry.Geometry class RichGeometry(val geometry: Geometry, ...) { ... } 위 코드를 Zeppelin에서 수행하게 되면 아래와 같은 에러가 뜬다. 첫 줄의 java esri 라이브러리는 Zeppelin의 Spark interpreter 옵션에서 Dependencies...","categories": ["dev"],
        "tags": ["spark","zeppelin","scala"],
        "url": "http://localhost:4000/dev/sparkshell-import-error/",
        "teaser": null
      },{
        "title": "HDP 2.6에서 Spark 업그레이드하기",
        "excerpt":"1. Spark 2.2의 import 버그 현재 사용 중인 하둡 클러스터는 HDP 2.6이며 Spark은 2.2 버전을 제공하고 있다. 해당 버전은 spark-shell에서 정상적으로 import가 작동하지 않는 버그(SPARK-22393)가 존재하므로 Zeppelin에서 제대로 Spark 코드를 수행할 수가 없었다. 따라서 해당 버그가 수정된 버전인 Spark 2.4 버전을 HDP 2.6에 설치해 보고자 한다. 2. Spark 업그레이드 하기...","categories": ["dev"],
        "tags": ["spark","scala","HDP","YARN"],
        "url": "http://localhost:4000/dev/hdp-spark-upgrade/",
        "teaser": null
      }]
