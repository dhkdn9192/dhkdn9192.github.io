---
title: Apache Nutch 튜닝하기
toc: true
toc_sticky: true
toc_label: 목차
categories:
- apache-nutch
comments: true
tags:
- nutch
- java
- crawler
---

## 1. Apache Nutch
Apache Nutch는 Java 언어로 만들어진 분산형 웹 크롤러다.
현재는 널리 쓰이고 있는 Hadoop이 바로 이 Nutch의 하위 프로젝트에서 시작되었다.
최근 Nutch로 웹 크롤러를 구축하면서 소소하게 경험해본 것들을 기록해본다.

![nutch-logo](https://raw.githubusercontent.com/dhkdn9192/dhkdn9192.github.io/master/assets/images/posts/2020/09/14/2020-09-14-nutch-logo.png)

| name |  version |
| -------- | -------- |
| Nutch     | 1.17 |
| OpenJDK | 1.8.0_265 |
| Hadoop | 2.7.3 (hdp 2.6.3) |


## 2. What to crawl
구축할 웹 크롤러의 목적은 주요 해외 사이트들을 주기적으로 수집하는 것이다.
특정 뉴스들을 제공해주는 소스 사이트들이 존재하는데,
이들을 seed로 하여 페이지 내의 뉴스 링크들을 수집하는 것이다.

Nutch는 방대한 인터넷 세계를 깊이 탐색하며 수집할 수 있도록 설계된 범용성 있는 크롤러다.
때문에 내 요구사항에 그대로 맞춰 사용하기에는 어려운 점들이 많아 일부 튜닝이 필요했다.

## 3. Tunning
### 3-1. 이전 페이지의 url 저장하기
Nutch는 웹 페이지를 저장(indexing)할 때 해당 페이지로 연결되는 "*이전 페이지의 링크 텍스트(anchor)*"를 함께 기록한다.
아래처럼 뉴스 타이틀에 하이퍼링크가 걸려있어서 뉴스 페이지로 연결될 경우, anchor 필드에 뉴스 타이틀이 들어오게 된다.
혹은 "다음 기사"와 같이 버튼을 눌러 뉴스 페이지로 연결될 수도 있다.

```json
{
  "tstamp":"2020-06-30T01:58:26.987Z", 
  "anchor":[
	"Facebook Sales at Risk as Starbucks Bails",
	"Next Article"
	],
  "title":"Facebook Sales at Risk as Starbucks Bails", 
  "url":"https://...",
	...
}
```

여기서 내가 수집하고 싶은 정보는 링크 텍스트가 아니라 "*이전 페이지의 url*"이다.
즉 아래처럼 anchor 필드에는 현재 페이지로 연결되는 url들이 들어와야 한다.
```json
{
  "tstamp":"2020-06-30T01:58:26.987Z", 
  "anchor":[
	"https://first.link.url/quote.ashx?q=facebook",
	"https://second.link.url/quote.ashx?q=facebook"
	],
  "title":"Facebook Sales at Risk as Starbucks Bails", 
  "url":"https://...",
	...
}
```

위처럼 이전페이지 url을 넣는 방법은 간단하다.
```org.apache.nutch.crawl.Inlinks.java``` 코드에서 
Inlinks 클래스의 getAnchors 메소드를 수정해주면 된다.
while문의 마지막 if문에서 anchor 대신 fromUrl을 results에 입력해준다.

```java
  public String[] getAnchors() {
    HashMap<String, Set<String>> domainToAnchors = new HashMap<>();
    ArrayList<String> results = new ArrayList<>();
    Iterator<Inlink> it = inlinks.iterator();
    while (it.hasNext()) {
      Inlink inlink = it.next();
      String anchor = inlink.getAnchor();
      String fromUrl = inlink.getFromUrl();

      if (anchor.length() == 0) // skip empty anchors
        continue;
      String domain = null; // extract domain name
      try {
        domain = new URL(fromUrl).getHost();
      } catch (MalformedURLException e) {
      }
      Set<String> domainAnchors = domainToAnchors.get(domain);
      if (domainAnchors == null) {
        domainAnchors = new HashSet<>();
        domainToAnchors.put(domain, domainAnchors);
      }
      if (domainAnchors.add(fromUrl)) { // new anchor from domain
        results.add(fromUrl); // collect fromurl, not anchor text
      }
    }
    return results.toArray(new String[results.size()]);
  }
```

소스코드 수정 후 Nutch를 다시 빌드해준다.
이제부턴 anchor 필드에 이전 페이지 url이 입력될 것이다.
```bash
$ ant runtime
```

### 3-2. 원본 html 저장하기
Nutch는 자체 parser로 html의 텍스트를 추출/파싱해준다.
하지만 파싱되지 않은 원본 그대로의 html을 저장하고 싶을 경우,
```-addBinaryContent``` 옵션을 사용하면 된다.

```bash
$ nutch index \
{crawldb 경로} \
-linkdb {linkdb 경로} \
{대상 segment 경로} \
-filter \
-normalize \
-deleteGone \
-addBinaryContent \
-base64
```

인코딩 문제를 방지하기 위해 ```-base64``` 인코딩 옵션을 함께 사용하는 것이 좋다.
주의할 점은, 1.15 버전에선 버그로 인하여 해당 옵션을 사용할 경우 에러가 발생하게 된다는 것이다.
이 버그는 1.16 버전부터는 개선되었으며 최신 버전을 사용한다면 문제 없다.
자세한 사항은 [NUTCH-2706](https://issues.apache.org/jira/browse/NUTCH-2706) 이슈를 참고

### 3-3. batch 수행간 중복 url 제거
Nutch는 실행되는 동안 한 번이라도 수집된 페이지는 다시 수집하지 않는다.
timeout을 설정하면 수집된 페이지도 일정 시간 뒤 재수집이 가능하지만 특정 페이지만 재수집하는 것은 불가능하다.

나의 개발요건은 seed url들을 주기적으로 반복 수집하며 신규 페이지들을 수집하는 것이다.
그러나 Nutch의 특성상 seed url들만 재수집할 수는 없으므로,
매번 crawldb를 리셋시키고 처음부터 crawling을 수행해야 했다.

그 결과, 매번 crawldb가 리셋되므로 각 Nutch 배치잡은 이전 배치에서 수집했던 페이지들을 중복으로 수집했다.
Nutch가 페이지를 저장하는 과정에서 중복 페이지는 알아서 제거되지만,
문제는 불필요한 중복 페이지 수집 때문에 fetch time이 너무 오래걸린다는 것이다.
(Nutch는 politeness를 최대한 준수하기 위해 동일 서버에 대해 기본적으로 5초의 idle time을 갖는다.)

아래는 Nutch의 워크플로우 구조다.
**Inject** > \[ **generate** > **fetch** > **parse** > **update** \] x ? > **invert links** > **index** 순서로 작업이 진행된다.
![nutch-workflow](https://raw.githubusercontent.com/dhkdn9192/dhkdn9192.github.io/master/assets/images/posts/2020/09/14/2020-09-14-nutch-workflow.png)

- 출처 : https://www.slideshare.net/sebastian_nagel/aceu2014-snagelwebcrawlingnutch

```
- inject : seed url을 crawldb에 입력
- generate : fetch할 url 리스트 생성
- fetch : html 수집
- parse : 수집된 html 파싱
- update : crawldb 갱신
- invert links : 페이지간 연결정보 갱신
- index : 수집된 페이지 저장
```

여기서 각 Nutch 배치가 이전 배치의 수집 url들을 제거하여 fetch list를 줄일 수 있도록 워크플로우를 수정했다.
\[ **generate** > **fetch** > **parse** > **update** \] 의 사이클을 1회만 수행한다.
그 후, 갱신된 crawldb를 읽어(**readdb**) 이전 배치에서 수집한 url들을 제거하고 (**remove_existing**) 중복 제거된 fetch list를 생성한다(**freegen**).
**readdb**, **freegen**은 Nutch 명령어이며 **remove_existing**은 파이썬으로 직접 구현했다.

![my-workflow](https://raw.githubusercontent.com/dhkdn9192/dhkdn9192.github.io/master/assets/images/posts/2020/09/14/2020-09-14-my-workflow.png)


수정된 워크플로우에선 중복 fetch가 모두 사라지면서 수집시간이 2시간에서 30분 내외로 획기적으로 줄었다.
(그동안 중복 페이지들을 얼마나 많이 수집했던건지...ㄷㄷ)


### 3-4. MapReduce 병렬처리 문제
위의 freegen 명령어를 사용하다가 Nutch 소스코드에 버그가 있다는 것을 발견했다.
Nutch의 github 이슈에 댓글을 달았더니 담당 개발자분이 알려줘서 고맙다고 답글을 달았다.
금새 이슈가 생성됐고 지금은 해결되었다.
이 부분은 다른 포스트로 자세히 다뤄볼 생각이다.
해당 이슈는 (NUTCH-2810){https://issues.apache.org/jira/browse/NUTCH-2810}를 참고


### 3-5. 배치 작업 스케줄링
Nutch 배치작업은 Apache Airflow로 스케줄링하고 있다.
