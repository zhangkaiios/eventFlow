# 埋点接入文档

#### 该项目使用原生JS监听fetch请求与地址栏变化实现埋点功能，不依赖任何框架。可以在vue、react、angular、JQuery、jsp等有js环境的项目内运行。可以统计不同项目的信息。后端需要开发一个存储数据的接口。

## 一、接入流程

### 方法一：

```js
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    </head>
  <body>
    
  </body>
  <script src="您的部署路径/eventFlow.js?systemCode=您的系统编码"></script>
</html>
```

### 方法二：

#### 在没有index.html入口文件的项目中，使用动态加载js的方式;

```js
const loadScript = function (url) {
  const script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', url);
  const head = document.getElementsByTagName('head');
  if (head.length) {
    head[0].appendChild(script);
  } else {
    document.documentElement.appendChild(script);
  }
};
loadScript('您的部署路径/eventFlow.js?systemCode=您的系统编码');
```

## 二、注册用户信息

#### 在用户登录后或已登录进入应用时调用方法注册用户信息，姓名、工号

```js
if (window['eventFlow']) {
    window['eventFlow'].registerUser('张三','21099999')
  } else {
    window.addEventListener('message', event => {
      if (event.data === 'eventFlowReady') {
          window['eventFlow'].registerUser('张三','21099999')
      }
    })
  }
```

## 自定义事件（拓展功能，按需使用）

### 发送自定义事件

#### 统计自定义事件，如用户点了哪个按钮，可通过sendEvent方法将数据保存到日志服务，参数为事件名，事件内容，格式为字符串；

```js
if (window['eventFlow']) {
    window['eventFlow'].sendEvent('clickBtn','{time: 2023-08-09, count: 2}')
  } else {
    window.addEventListener('message', event => {
      if (event.data === 'eventFlowReady') {
          window['eventFlow'].sendEvent('clickBtn','{time: 2023-08-09, count: 2}')
       }
    })
  }
```

### 停止数据采集

#### 如测试环境等不需要采集信息的，可根据配置的环境变量注册停止数据采集，停止后只有调用恢复方法才能继续采集

```js
if (window['eventFlow']) {
    window['eventFlow'].registerNotRecorded()
  } else {
    window.addEventListener('message', event => {
      if (event.data === 'eventFlowReady') {
          window['eventFlow'].registerNotRecorded()
      }
    })
  }
```

### 恢复采集

#### 本地环境localhost不被采集，或已调用2.2中registerNotRecorded停用的测试环境，可以调用本方法恢复采集

```js
if (window['eventFlow']) {
    window['eventFlow'].resumeOperation()
  } else {
    window.addEventListener('message', event => {
      if (event.data === 'eventFlowReady') {
          window['eventFlow'].resumeOperation()
      }
    })
  }
```

### 后端接口需要接受的数据

| 字段           | 说明                                          |
| ------------ | ------------------------------------------- |
| userCode     | 用户编码                                        |
| userName     | 用户名称                                        |
| system       | 系统编码                                        |
| module       | 模块名称 （备用是否要细分）                              |
| eventGroupId | 不传入则生成并返回，一套操作流程计入一组事件流，便于行为流程整理            |
| eventId      | 生成的事件id                                     |
| event        | 事件类型（点击 、页面链接访问 pageChange 、接口请求interface等） |
| data         | 事件内容（url、button名称）                          |
| ip           | 后台获取                                        |
| user-agent   |                                             |
| requestTime  | 请求时间                                        |


