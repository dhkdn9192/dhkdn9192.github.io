---
title: Big Sur에서 Jekyll 버전 업그레이드 하기
comments: true
toc: true
toc_sticky: true
toc_label: 목차
categories:
- etc
tags:
- blog
- jekyll
---

최근 Mac OS를 BigSur 11.4 버전으로 업데이트하면서 여러가지 문제들을 겪고 있다.
잘 쓰던 프로그램들이 버전 충돌이 나거나 먹통이 된 것들이 꽤 많다.
그 중에서도 Ruby와 Jekyll이 동작하지 않아서 github page 블로그를 쓰는데 애를 먹었다.
Big Sur 환경에서 Jekyll을 재설치하는 과정을 기록해본다.

## 1. Ruby 설치
Mac OS에선 시스템에서 사용하기 위한 Ruby가 설치되어 있다. 
root 계정으로 관리되기 때문에 gem install 명령어로 패키지를 설치하기가 어렵다.
따라서 rbenv를 이용해 별도로 Ruby를 설치하기로 했다.

```bash
$ brew update
$ brew install rbenv ruby-build
```

Ruby 버전은 2.5.x 이하는 지원이 중단되어 2.6.3으로 설치한다.

```bash
$ rbenv install 2.6.3
$ rbenv global 2.6.3
$ rbenv rehash
```

## 2. 환경변수 설정
나는 bash가 아닌 zsh을 사용하므로 ```~/.zshrc```에 아래와 같은 설정을 추가하고 source 해주었다.
```bash
$ vim ~/.zshrc
(아래 라인들을 추가)
if which rbenv > /dev/null; then eval "$(rbenv init -)"; fi
alias ruby=/Users/gimdonghyeog/.rbenv/shims/ruby
alias jekyll=/Users/gimdonghyeog/.rbenv/shims/jekyll
alias gem=/Users/gimdonghyeog/.rbenv/shims/gem

$ source ~/.zshrc
```

설치된 Ruby 및 Gem 버전을 확인해본다.
```bash
$ ruby -v
$ gem -v
```

## 3. Jekyll 설치
jekyll을 설치한다. 최신 릴리즈 버전 중 하나로 3.9.1를 선택했다.
```
$ gem update
$ gem install bundler
$ gem install jekyll -v 3.9.1
$ sudo bundle install
$ sudo bundle update jekyll
```


## 4. Jekyll 실행

github page 블로그 디렉토리에서 jekyll을 실행한다.
```bash
$ cd {github page dir}
$ jekyll serve
```


만약 버전 dependencies 문제가 생긴다면 ```bundle exec```으로 필요한 버전의 패키지만 사용하도록 할 수 있다.
```bash
$ bundle exec jekyll serve
```


## Reference
- https://smartbase.tistory.com/43
- https://www.freecodecamp.org/news/do-not-use-mac-system-ruby-do-this-instead/
- http://corecode.pe.kr/2020/08/21/ruby_jekyll_install/
- https://frhyme.github.io/others/jekyll_serve_not_work/
- https://jekyllrb.com/news/2021/04/08/jekyll-3-9-1-released/
