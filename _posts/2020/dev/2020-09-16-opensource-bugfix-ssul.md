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
### 1-1. Crawling Workflow
Apache Nutch는 Hadoop 위에서 동작하는 분산형 웹 크롤러다.
([이전 포스트](https://dhkdn9192.github.io/apache-nutch/nutch-tuning/))
웹 페이지를 수집하기 위해 여러 단계를 거쳐 작업이 수행되며 아래와 같은 워크플로우를 형성한다.
(자세한 설명은 [링크](https://florianhartl.com/nutch-how-it-works.html) 참조)

![nutch_workflow](https://raw.githubusercontent.com/dhkdn9192/dhkdn9192.github.io/master/assets/images/posts/2020/09/16/2020-09-16-nutch-overall-workflow.png)

크롤링은 특정 웹 페이지에서 다른 페이지로 가는 링크들을 추출하고, 추출된 각 링크 페이지에 대해서 같은 작업을 반복하며 수행된다.
이러한 작업을 반복할수록 인터넷 웹을 깊이 탐색하며 크롤링하게 된다.
이 때 각 반복 작업에서 읽어들일 웹 페이지 url 목록을 생성하게 되는데 이를 **fetch list**라 한다.

### 1-2. FreeGenerator
Nutch는 각 반복 작업에서 **Generator** 모듈을 사용하여 fetch list를 생성한다.
Generator 모듈은 별도의 외부 입력을 받지 않고, 추출된 url들로만 fetch list를 자동 생성한다.

만약 임의의 url들로 fetch list를 생성하고 싶다면 Nutch가 제공하는 **FreeGenerator** 모듈을 이용해야 한다.
FreeGenerator는 사용자가 입력한 url 목록으로 fetch list를 생성한다.

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


### 1-3. Single Map Task
fetch list로 실제 수집 MapReduce Job을 수행할 때 몇 개의 Map task로 분산 수집할 것인지 설정할 수 있다.
FreeGenerator 모듈의 ```-numFetchers <n>``` 옵션으로 원하는 Map task 수를 정할 수 있다.
그러나 실제로 사용했을 때 ```-numFetchers <n>``` 값만큼 Map task가 생성되지 않고 항상 1개만 생성되어
분산 수집이 이뤄지지 않았다.

![nutch_2785](https://raw.githubusercontent.com/dhkdn9192/dhkdn9192.github.io/master/assets/images/posts/2020/09/16/2020-09-16-nutch-issue.png)

원인은 간단했다. [NUTCH-2785](https://github.com/apache/nutch/pull/519)에서 ```-numFetchers <n>```옵션이 추가되었는데
FreeGenerator.java  소스코드에서 옵션 값을 전달하는 구문이 실수로 생략됐던 것이다.
컨트리뷰터의 원래 의도는 위 이미지의 194 line을 ```job.setNumReduceTasks(numFetchers);```로 대체하는 것이었다.


## 2. 문제 해결과 공유
생략된 구문을 numFetchers 변수와 함께 추가하여 빌드한 결과 정상적으로 Map task가 생성되는 것을 확인했다.
해당 내용을 담당 컨트리뷰터에게 공유하여 조치가 이뤄졌다.

![issue_share](https://raw.githubusercontent.com/dhkdn9192/dhkdn9192.github.io/master/assets/images/posts/2020/09/16/2020-09-16-issue-share.png)

[NUTCH-2810](https://issues.apache.org/jira/browse/NUTCH-2810) 이슈가 생성되어 Nutch 1.18 release부터 해당 버그가 fix되어 배포되었다.

## 3. 결론
업무에 사용하던 오픈소스에서 버그를 발견하고 수정하고 컨트리뷰터에 공유해본 경험은 처음이었다.
간접적으로나마 오픈소스 bug-fix에 기여했다는게 나름 뿌듯한 경험이었다.


## References
- https://florianhartl.com/nutch-how-it-works.html
- https://cwiki.apache.org/confluence/pages/viewpage.action?pageId=122916819
- https://github.com/apache/nutch/pull/519
- https://issues.apache.org/jira/browse/NUTCH-2810
