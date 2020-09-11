---
title: Spark Shell import 에러
toc: true
toc_sticky: true
toc_label: 목차
categories:
- dev
tags:
- spark
- zeppelin
- scala
comments: true
---

## 1. 문제 발견
Zeppelin에서 Spark을 사용하다가 이해할 수 없는 에러를 보게 되었다.
아래는 "[9가지 사례로 익히는 고급 스파크 분석](https://github.com/sryza/aas/blob/master/ch08-geotime/src/main/scala/com/cloudera/datascience/geotime/RichGeometry.scala)" 책의 예제코드이다.


```scala
import com.esri.core.geometry.Geometry

class RichGeometry(val geometry: Geometry, ...) {
  ...
}
```


위 코드를 Zeppelin에서 수행하게 되면 아래와 같은 에러가 뜬다.

![zeppelin-error](https://raw.githubusercontent.com/dhkdn9192/dhkdn9192.github.io/master/assets/images/posts/2020/09/07/2020-09-07-zeppelin-error.png)


첫 줄의 java esri 라이브러리는 Zeppelin의 Spark interpreter 옵션에서 Dependencies 항목에 jar 파일 경로로 추가했다.
import 자체는 문제 없이 수행된다.
문제는 import되었음에도 Spark interpreter가 인식을 못 하는 것이다. (심지어 같은 paragraph에서 실행했다!)

위 문제가 발생한 환경은 다음과 같다

| name | version |
| :---: | :---: |
| OpenJDK  | 1.8.0_191 |
| Scala     | 2.11.8     |
| Spark     | 2.2.0     |
| HDP    | 2.6.3.0-235 |
| Zeppelin | 0.7.3 |

## 2. StackOverflow 검색

Stackoverflow에서 검색을 하다 크게 2가지 해결 방법을 찾았다.

### 2-1. 세미콜론으로 라인 이어붙이기
*세미콜론*을 이용하여 import 구문과 class 선언 구문을 한 라인으로 이어 붙이는 방법이다. (...)
정상적으로 수행은 가능하지만 코드가 매우 기괴해진다.

```scala
import com.esri.core.geometry.Geometry;class RichGeometry(val geometry: Geometry,...)
```


### 2-2. 싱글톤으로 감싸기

import 구문부터 class 선언구문 전체를 하나의 싱글톤으로 감싼다.
싱글톤 내부에서 import하므로 정상적으로 class 선언이 가능해진다.
그러나 클래스를 직접 호출할 수 없고 싱글톤 내부에서 가져와야 한다.

```scala
object MM{
  import com.esri.core.geometry.Geometry

  class RichGeometry(val geometry: Geometry,
  ...
}

```

<br>
두 가지 모두 마음에 드는 해결책은 아니다.
구체적으로 원인이 무엇인지, 근본적인 해결책은 어떤건지 자세히 알아봐야겠다.

## 3. 근본적인 원인과 해결책
Zeppelin 상에서 발견해서 당연히 Zeppelin 상의 버그인 줄 알았는데 알고보니 Spark-Shell의 오류였다.
(좀 더 깊게 들어가면 Scala까지 가게 된다.)

[SPARK-22393](https://issues.apache.org/jira/browse/SPARK-22393) 이슈에 따르면 Spark 2.x대에 들어서면서 발생한 버그다.
Scala 언어에서 2.11~2.12 버전 사이에 importHandler 관련 버그 픽스([SI-9880](https://github.com/scala/bug/issues/9881))가 있었는데 해당 이슈로 인해 Spark에도 import 관련 버그가 발생한 것으로 보인다.

컨트리뷰터들 사이에서도 굉장히 난해한 버그였던 것 같다. 핵심만 정리하자면

- Scala 2.11 에서 동작하는 Spark에서 해당 버그 발생함
- Scala 2.12 에서는 importHandler 이슈가 해결됨에 따라 spark-shell 역시 정상적으로 동작함
- spark-shell의 버그를 고치기 위해 Scala까지 수정하는 것은 매우 큰 작업이고 리스크가 크므로 실용적이지 않음
- 따라서 Scala의 fix를 적절히 이용하여 ```SparkExprTyper``` 및 ```SparkILoopInterpreter```를 spark-shell에 추가하여 버그픽스함

즉, Spark 2.3부터는 해당 이슈가 해결되었다.
Spark의 버전을 업그레이드하는 것이 가장 합리적인 해결책이다.

문제가 있다면 내가 사용하는 HDP에서는 Spark 버전이 2.2라는 것이다.
HDP와는 별도로 Spark 최신버전을 설치하고 Zeppelin에 연동하는 방식으로 사용해야할 것 같다.
