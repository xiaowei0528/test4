PlaygameaAPI = {
    showCount: 0,
    //初始化
    init: function () {
        GSDK.init();
    },

    APIAds: {
        show: function (...args) { //第一个参数是回调函数，第四个参数也可能是回到函数
            const callback = args.filter(arg => typeof arg === 'function')[0];
            if (PlaygameaAPI.showCount > 0) {
                GSDK.showNextAd({
                    adBreakDone: callback
                });
            }
            else {
                GSDK.showStartAd({
                    adBreakDone: callback
                });
            }
            PlaygameaAPI.showCount++
        }
    },
    GEvents: {
        reward: function (canShowReward, rewardSuccess) {
            GSDK.showRewardAd({
                beforeReward: (showAdFn) => {
                    canShowReward(true, showAdFn)
                },
                adDismissed: () => {
                    rewardSuccess(false)
                },
                adViewed: () => {
                    rewardSuccess(true)
                },
            });

        },
        start: function (callback) {
            PlaygameaAPI.showCount++
            GSDK.showStartAd({
                adBreakDone: callback
            });
        },
        next: function (callback) {
            PlaygameaAPI.showCount++
            GSDK.showNextAd({
                adBreakDone: callback
            });
        },
    },
    //成就
    Achievements: {
        save: function (_, callback) {
            callback({ success: true });
        },
        show: function () {

        }
    },
    //分数
    Scores: {
        save: function (_, callback) {
            callback({ success: true });
        },
        load: function (_, callback) {
            callback({ score: 0 })
        }
    },
    //用户
    User: {
        get: function (callback) {
            callback({
                user: {
                    id: 1,
                    name: 'Player',
                    avatar: ''
                }
            });
        }
    }
}


GSDK = {
    inited: false,
    gameName: '',
    init: function (channel) {
        if (GSDK.inited) {
            return;
        }
        GSDK.inited = true;
        const url = new URL(window.location.href);
        const path = url.pathname.split('/').filter(Boolean);
        // 检查最后一个路径片段是否包含文件扩展名
        GSDK.gameName = path[path.length - 1];
        if (GSDK.gameName.includes('.')) {
            // 如果包含文件扩展名，则取倒数第二个路径片段
            GSDK.gameName = path[path.length - 2];
        }

        const adScript = document.createElement('script');
        adScript.async = true;
        adScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=abcdefg';
        adScript.crossOrigin = 'anonymous';
        adScript.setAttribute('data-adbreak-test', 'on');
        if (channel) {
            adScript.setAttribute('data-ad-channel', channel);
        }
        adScript.setAttribute('data-ad-frequency-hint', '30s');
        document.head.appendChild(adScript);

        //游戏里直接调用的包一层方便后面修改配置
        adBreak = adConfig = function (config) {
            GSDK.showAd(config)
        }

    },

    //游戏加载前的 'preroll'（界面呈现之前）
    showPrerollAd: function (config = {}) {
        GSDK.showAd({
            ...config,
            type: 'preroll'
        })
    },
    //游戏开始前的 'start'（界面呈现之后）
    showStartAd: function (config = {}) {
        GSDK.showAd({
            ...config,
            type: 'start'
        })

    },
    //玩家暂停游戏
    showPauseAd: function (config = {}) {
        GSDK.showAd({
            ...config,
            type: 'pause'
        })

    },
    //玩家进入下一关
    showNextAd: function (config = {}) {
        GSDK.showAd({
            ...config,
            type: 'next'
        })

    },
    //玩家在游玩间隙浏览其他选项
    showBrowseAd: function (config = {}) {
        GSDK.showAd({
            ...config,
            type: 'browse'
        })

    },
    //激励广告
    showRewardAd: function (config = {}) {
        GSDK.showAd({
            ...config,
            type: 'reward'
        })
    },
    //显示广告
    showAd: function (config) {
        console.log('广告配置:', config);
        if (config.type) {
            config.name = GSDK.gameName;
        }
        (window.adsbygoogle = window.adsbygoogle || []).push(config);
    },
    //广告配置
    adConfig: function (config) {
        GSDK.showAd(config)
    }
}


// 当文档加载完成
document.addEventListener('DOMContentLoaded', () => {
    GSDK.init();
});