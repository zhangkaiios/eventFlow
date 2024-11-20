var prodUrl = 'https://aaaa.com';
var devUrl = 'https://bbbbb.com';
try {
    class FlowSight {
        
        constructor() {
            this.systemCode = ''
            this.myInterval = null
            this.oldUrl = ''
            this.baseUrl = location.href.indexOf('https://') === 0 ? prodUrl : devUrl
            this.userCode = this.generateUniqueId()
            this.userName = '临时用户'
            this.requestQueue = []
            this.canWork = true // 是否可以工作，比如本地不行，测试禁用
            this.requestQueneCount = 0 // 定时器循环当前次数，requestQueneMaxCount次后触发接口请求
            this.requestQueneMaxCount = 40 // 定时器循环最大
            try {
                // 本地不记录
                if (location.href.indexOf('http://localhost') === -1 || localStorage.getItem('eventFlowNotWork')) {
                    this.canWork = true
                    this.init();
                }
            } catch (err) {
                console.log('错误：', err)
            }
        }
    
        /** 初始化 */
        init() { 
            try {
                if (!sessionStorage.getItem('eventFlowUserName')) {
                    sessionStorage.setItem('eventFlowUserName', '临时用户')
                    sessionStorage.setItem('eventFlowUserCode', this.generateUniqueId())
                }
                if (!sessionStorage.getItem('eventFlowEventGroupId')) {
                    sessionStorage.setItem('eventFlowEventGroupId', this.generateUniqueId())
                }
                this.getTheTopWindow().requestQueue = []
                for (var i=0; i<document.scripts.length; i++) {
                    if (document.scripts[i].src.indexOf('/eventFlow.min.js') > -1) {
                        // 创建 URL 对象来解析 URL
                        var url = new URL(document.scripts[i].src);
                        // 获取查询参数
                        this.systemCode = url.searchParams.get('systemCode');
                        if (url.searchParams.get('isTest')) {
                            this.baseUrl = devUrl
                        }
                    }
                }

                // 在这里执行即将离开页面时的操作
                window.addEventListener('beforeunload', function(event) {
                    try {
                        clearInterval(this.myInterval)
                    } catch (err) {
                        console.log('错误：', err)
                    }
                });
                this.listenNetWork()
                // 使用一个循环完成多项任务
                this.listenUrlChange()
                this.myInterval = setInterval(() => {
                    try {
                        if (!this.canWork) {
                            clearInterval(this.myInterval)
                            return
                        }
                        this.listenUrlChange()
                        this.requestQueneCount++
                        if (this.requestQueneCount >= this.requestQueneMaxCount) {
                            this.request()
                        }
                    } catch (err) {
                        console.log('错误：', err)
                    }
                }, 50);
                
            } catch (err) {
                console.log('错误：', err)
            }
        }
    
        /**  注册不记录信息（如：测试环境） */
        registerNotRecorded() {
            try {
                localStorage.setItem('eventFlowNotWork', true)
                this.canWork = false
            } catch (err) {
                console.log('错误：', err)
            }
        }

        /** 判断当前域是否被另一个域嵌入返回不同的window */
        getTheTopWindow() {
            try {
                // 如果没有抛出错误，那么窗口是同域的
                return window.top;
            } catch (e) {
                // 如果访问顶层窗口的属性时抛出错误，那么窗口是不同域的
                return window;
            }
        }
    
        /**  恢复运行 */
        resumeOperation() {
            try {
                localStorage.removeItem('eventFlowNotWork')
                this.canWork = true
                this.init()
            } catch (err) {
                console.log('错误：', err)
            }
        }
    
        /**  注册用户信息 */
        registerUser(name, code) {
            try {
                if (name) {
                    sessionStorage.setItem('eventFlowUserName', name)
                    sessionStorage.setItem('eventFlowUserCode', code)
                }
            } catch (err) {
                console.log('错误：', err)
            }
        }
    
        /** 发送事件（客户端主动发送） */
        sendEvent(event, data) {
            try {
                this.request({ event, data })
            } catch (err) {
                console.log('错误：', err)
            }
        }
    
        /**  生成基于时间戳和随机数的唯一标识符 */
        generateUniqueId() {
            try {
                const timestamp = Date.now().toString(16);
                const randomStr = Math.random().toString(16).substring(2);
                return `${timestamp}-${randomStr}`;
            } catch (err) {
                console.log('错误：', err)
            }
        }
    
        /** 定时监听URL变化 */
        listenUrlChange() {
            try {
                if (this.oldUrl !== window.location.href) {
                    this.oldUrl = window.location.href
                    this.postUrlChange()
                }
            } catch (err) {
                console.log('错误：', err)
            }
        }
    
        /** 发送链接变化请求 */
        postUrlChange() {
            try {
                this.request({
                    event: 'pageChange',
                    data: this.getPageUrl()
                })
            } catch (err) {
                console.log('错误：', err)
            }
        }

        getPageUrl() {
            try {
                return location.href.split('?')[0];
            } catch (err) {
                console.log('错误：', err)
            }
        }
    
        listenNetWork() {
            try {
                // 保存原始的 XMLHttpRequest 和 fetch 方法
                var originalXMLHttpRequestOpen = XMLHttpRequest.prototype.open;
                var originalFetch = window.fetch;
                var _this = this
                // 重写 XMLHttpRequest 的 open 方法
                XMLHttpRequest.prototype.open = function(method, url) {
                    try {
                        checkUrl(url)
                        return originalXMLHttpRequestOpen.apply(this, arguments);
                    } catch (err) {
                        console.log('错误：', err)
                    }
                };
        
                // 重写 fetch 方法
                window.fetch = function(url, body) {
                    try {
                        checkUrl(url)
                        return originalFetch.apply(this, arguments);
                    } catch (err) {
                        console.log('错误：', err)
                    }
                };
                function checkUrl (url) {
                    try {
                        if (url.indexOf(_this.baseUrl) === -1 && url.indexOf('.css') === -1 && url.indexOf('.js') === -1 && url.indexOf('.jpg') === -1 ) {
                            _this.request({
                                event: 'interface',
                                data: url.split('?')[0]
                            })
                        }
                    } catch (err) {
                        console.log('错误：', err)
                    }
                }
            } catch (err) {
                console.log('错误：', err)
            }
        }
    
        /** 获取当前时间 */
        getCurrentFormattedDateTime() {
            try {
                const now = new Date();
                
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const seconds = String(now.getSeconds()).padStart(2, '0');
                
                const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                return formattedDateTime;
            } catch (err) {
                console.log('错误：', err)
            }
        }
    
        /** 网络请求封装 */
        request(data) {
            try {
                if (!this.canWork) {
                    return
                }
                // 立即触发请求
                if (!data && this.requestQueneMaxCount === this.requestQueneCount) {
                    this.requestQueneCount = 0
                    if (this.getTheTopWindow().requestQueue.length === 0) {
                        return
                    }
                } else {
                    this.getTheTopWindow().requestQueue.push({
                        ...data,
                        system: this.systemCode,
                        requestTime: this.getCurrentFormattedDateTime()
                    })
                    return
                }
                const name = sessionStorage.getItem('eventFlowUserName')
                const code = sessionStorage.getItem('eventFlowUserCode')
                const groupId = sessionStorage.getItem('eventFlowEventGroupId')
                if (name === '临时用户') {
                    return
                }
                 // 去除完全相同的项
                this.getTheTopWindow().requestQueue = this.getTheTopWindow().requestQueue.filter((item, index, self) =>
                    index === self.findIndex(obj =>
                        JSON.stringify(obj) === JSON.stringify(item)
                    )
                );
                this.getTheTopWindow().requestQueue = this.getTheTopWindow().requestQueue.map(item => {
                    item.userCode = code;
                    item.userName = name;
                    item.system = this.systemCode;
                    item.eventGroupId = groupId;
                    return item
                })
                // 请求配置对象
                const options = {
                    method: "POST", // 请求方法为 POST
                    headers: {
                        "Content-Type": "application/json", // 设置请求头为 JSON 格式
                    },
                    body: JSON.stringify(this.getTheTopWindow().requestQueue), // 将数据转为 JSON 字符串并作为请求体
                };
                // 提前清空，在网络请求过程会有新数据进入，请求之后再清空会把新数据也删掉， 无论失败与否，只请求一次
                this.getTheTopWindow().requestQueue = []
                // 使用 fetch 发起 POST 请求
                return fetch(this.baseUrl, options)
                    .then((response) => {
                        try {
                            if (!response.ok) {
                                throw new Error("Network response was not ok");
                            }
                            return response.json(); // 解析响应为 JSON
                        } catch (err) {
                            console.log('错误：', err)
                        }
                    })
                    .then((res) => {
                        // 接口请求成功
                        try {
                            if (res.code === 200) {
        
                            }
                        } catch (err) {
                            console.log('错误：', err)
                        }
                    })
                    .catch((error) => {
        
                    });
                } catch (err) {
                    console.log('错误：', err)
                }
        }
    }
    var flowsight = new FlowSight();
    window.eventFlow = flowsight;
    var url = window.location.protocol+'//'+window.location.hostname
    if (window.location.port) {
        url += ':' + window.location.port
    }
    try {
        window.postMessage('eventFlowReady', url)
    } catch (err) {
        console.log('错误：', err)
    }
} catch (err) {
    console.log('错误：', err)
}
