---
title: 오픈 소스 bug-fix에 기여한 소소한 썰
comments: true
toc: true
toc_sticky: true
toc_label: 목차
categories:
- apache-nutch
tags:
- java
- nutch
- jira
---

최근 웹 크롤러를 구축하기 위해 Apache Nutch를 사용하다가 소스코드 상의 버그를 발견하게 되었다.
이를 해결하고 contributor에게 공유했던 경험을 기록해보았다.

## 1. 문제의 발견
### 1-1. Nutch Workflow
Apache Nutch는 Hadoop 위에서 동작하는 분산형 웹 크롤러다.
([이전 포스트](https://dhkdn9192.github.io/apache-nutch/nutch-tuning/))
웹 페이지를 수집하기 위한 다양한 컴포넌트들로 구성되며 아래와 같은 워크플로우로 동작한다.

![nutch_workflow](https://raw.githubusercontent.com/dhkdn9192/dhkdn9192.github.io/master/assets/images/posts/2020/09/16/2020-09-16-nutch-overall-workflow.png)

- 워크플로우에서 웹 페이지의 수집은 **Fetcher**에 의해 이뤄진다.
- Fetcher는 수집할 url 목록(fetchlist)을 입력받아 동작하며 이 목록은 **Generator**가 생성한다.
- Generator는 url 메타정보를 가지고 있는 **crawldb**를 참조하여 수집한 적이 없는 url들로 목록을 구성한다.

즉 Nutch가 어느 url들을 수집할 것인지는 Generator에 의해서 결정된다.
Generator는 
*사용자가 특정 url들을 추가하거나 외부로부터 데이터를 입력받아 목록을 생성할 수가 없다*.
(regex-urlfilter나 blacklist 등의 기능으로 필터링하는 것은 가능하다)

### 1-2. FreeGenerator
이러한 불편함을 해소하기 위해 Nutch는 사용자가 직접 url 목록을 입력할 수 있도록 **FreeGenerator**라는 클래스를 제공하고 있다.

```
$ bin/nutch freegen --help
Usage: FreeGenerator <inputDir> <segmentsDir> [-filter] [-normalize] [-numFetchers <n>]
        inputDir        input directory containing one or more input files.
                        Each text file contains a list of URLs, one URL per line
        segmentsDir     output directory, where new segment will be created
        -filter         run current URLFilters on input URLs
        -normalize      run current URLNormalizers on input URLs
        -numFetchers <n>        number of generated fetch lists, determines number of fetcher tasks
```

```bin/nutch freegen``` 명령어로 동작하며 ```<inputDir>``` 옵션에 디렉토리 경로를 명시해주면
해당 경로의 텍스트 파일들을 읽어 url 목록을 생성한다.
즉, 내가 수집하고 싶은 url들로 목록을 생성할 수 있다.




## 2. 무엇이 원인이었나?

## 3. 고치기

## 4. 공유하기

## References
- https://florianhartl.com/nutch-how-it-works.html
- https://cwiki.apache.org/confluence/pages/viewpage.action?pageId=122916819
- https://github.com/apache/nutch/pull/519
- https://issues.apache.org/jira/browse/NUTCH-2810
