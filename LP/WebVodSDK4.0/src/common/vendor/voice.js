/**
 * js/voice.js
 * Author : Donson.Liu, Marko.Hoo
 * version : v0.0.2
 * LastEdit : 24/05/13 07:16:58
 * =============
 */
define(function(require){

    var _ajax = require("../utils/ajax");
    var $ = {
        ajax: _ajax
    }

    //input volume
    var CB_INPUT_VOLUME = 8000;
    var CB_OUTPUT_VOLUME = 8001;

    var Voice = {};

    //版本
    Voice.version = 1010;
    Voice.isStartUp = false;

    //配置
    Voice.config = {
        debug : true,
        host : 'http://127.0.0.1',
        //host : 'http://192.168.199.136',
        posts : ['8500', '8500', '8500', '8501', '8502'],
        post : '8500'
    };

    //ajax
    Voice.ajax = function(param, callback, error){
        param = JSON.stringify(param);
        param = encodeURIComponent(param);
        $.ajax({
            url: Voice.config.host+':'+Voice.config.post+'/maituo?json='+param,
            method: "GET",
            dataType: 'jsonp',
            timeout : 1000,
            success: callback || function(){},
            error : error || function(){}
        });
    };

    //工具
    Voice.tool = {
        debug : function(msg){
            if(typeof console !== 'undefined' && Voice.config.debug){
                console.debug(msg);
            }
        }
    };

    Voice.log = function(msg){
        if(typeof console !== 'undefined' && Voice.config.debug){
            msg = JSON.stringify(msg);
            console.log(msg);
        }
    };

    //检查语音
    Voice.check = {
        status : false,
        isChecked : false,
        isVoiceChecked: false,
        isPlugin : function(callback){
            var timer = function(){
                if(!Voice.check.isChecked){
                    //Voice.log('timer');
                    setTimeout(function(){
                        timer();
                    }, 100)
                }else{
                    if(Voice.check.isVoiceChecked){
                        callback(true);
                    }else{
                        callback(false);
                    }
                }
            }
            timer();
        },
        // 重复检查
        reCheckPlugins: function(){
            var post = Voice.config.posts[0],
                posts = Voice.config.posts,
                param = {
                    act : 'MC_GET_VERSION'
                },
                timer = {},
                i = 0,
                postTimer = null;

            //重复检测
            param = JSON.stringify(param);
            param = encodeURIComponent(param);

            timer = function(){
                if(i > 500){
                    clearInterval(postTimer);
                    return false;
                }
                $.ajax({
                    url: Voice.config.host+':'+post+'/maituo?json='+param,
                    dataType: 'jsonp',
                    timeout : 3500,
                    success: function(ret){
                        if(ret.code === 0){
                            window.location.reload();
                        }
                    },
                    error : function(ret){
                        Voice.log(ret);
                    }
                });
            };
            postTimer = setInterval(function(){
                timer();
            },1000);
        },
        checkVoice : function(posts){
            posts = posts || Voice.config.posts;
            var ajax = function(post, param, callback, error){
                param = JSON.stringify(param);
                param = encodeURIComponent(param);
                $.ajax({
                    url: Voice.config.host+':'+post+'/maituo?json='+param,
                    dataType: 'jsonp',
                    timeout : 500,
                    success: callback || function(){},
                    error : error || function(){}
                });
            };
            var i = 0;
            var check = function(){
                var post = posts[i];
                ajax(post, {
                    act : 'MC_GET_VERSION'
                }, function(ret){
                    Voice.log('VOICE PLUGINS CONNECTINO_SUCCESS', ret);
                    if(ret.code === 0){
                        Voice.config.post = post;
                        if(ret.value >= Voice.version){
                            Voice.check.isVoiceChecked = true;
                        }else{
                            Voice.check.isVoiceChecked = false;
                        }
                        Voice.check.isChecked = true;
                    }
                }, function(ret){
                    i++;
                    if((i+1) > posts.length){
                        Voice.check.isVoiceChecked = false;
                        Voice.check.isChecked = true;
                    }else{
                        check();
                    }
                });
            };
            check();
        },
        hasInit : false,
        init : function(conString, callback){
            if(!conString){
                return;
            }
            var _ts = this,
                tryInit = function(){
                    //status
                    Voice.ajax({
                        act : 'CONNECTION_STATUS'
                    }, function(ret){
                        if(ret.code == 0 && ret.value == 3){
                            Voice.log('CONNECTION_STATUS success!');
                            Voice.check.status = true;
                            Voice.check.hasInit = true;
                            callback();
                        }else{
                            setTimeout(function(){
                                tryInit();
                            }, 500);
                        }
                    })
                };
            //连接服务器
            Voice.ajax({
                    act : 'CONNECTION_OPEN',
                    url : conString,
                    location : window.location.href
            }, function(ret){
                //callback
                if(ret.code == 0){
                    Voice.log('CONNECTION_OPEN success!');
                    //capture
                    Voice.ajax({
                        act : 'CONNECTION_CAPTURE',
                        value : 0
                    }, function(ret){
                        if(ret.code == 0){
                            Voice.log('CONNECTION_CAPTURE success!');
                            tryInit();
                        }
                    });

                }else{
                    Voice.log('Voice init false.  This is for Test.');
                    alert('连接服务器失败,错误码：' + ret.code + ', url:'+conString);
                    //callback();
                }
            }, function(){
                //error
                try{
                    Voice.log('Voice init false.  This is for Test.');
                    alert('连接服务器失败,错误码：' + ret.code + ', url:'+conString);
                }catch(err){
                    Voice.log(err);
                }
                //callback();
            });
        }
    };

    //操作 
    Voice.op = {
        //获取输入设备（麦克风）音量
        getInputVolume : function(callback){
            if(Voice.check.status == true){
                Voice.ajax({
                    act : 'GET_INPUT_VOLUME'
                }, function(ret){
                    Voice.log(ret);
                    if(ret.code == 0){
                        $('#debug').prepend('<p>getInputVolume: ' + ret.value + '</p>');
                        callback(ret.value);
                    }else{
                        callback(0);
                    }
                });
            }
        },
        //设置输入设备音量[0 - 100]
        setInputVolume : function(val, callback){
            if(Voice.check.status == true){
                var num = parseInt(val, 10);
                if(num === NaN){
                    return false;
                }else if(num <0 ){
                    num = 0;
                }else if(num > 100){
                    num = 100;
                }

                Voice.ajax({
                    act : 'SET_INPUT_VOLUME',
                    value : num
                }, function(ret){
                    Voice.log(ret);
                    if(ret.code == 0){
                        callback(num);
                    }else{
                        callback(0);
                    }
                });
            }
        },
        //获取输出设备（扬声器）音量
        getOutVolume : function(callback){
            if(Voice.check.status == true){
                Voice.ajax({
                    act : 'GET_OUTPUT_VOLUME'
                }, function(ret){
                    Voice.log(ret);
                    if(ret.code == 0){
                        $('#debug').prepend('<p>getOutVolume: ' + ret.value + '</p>');
                        callback(ret.value);
                    }else{
                        callback(0);
                    }
                });
            }
        },
        //设置输出设备音量[0 - 100]
        setOutVolume : function(val, callback){
            if(Voice.check.status == true){
                var num = parseInt(val, 10);
                if(num === NaN){
                    return false;
                }else if(num <0 ){
                    num = 0;
                }else if(num > 100){
                    num = 100;
                }

                Voice.ajax({
                    act : 'SET_OUTPUT_VOLUME',
                    value : num
                }, function(ret){
                    Voice.log(ret);
                    if(ret.code == 0){
                        callback(num);
                    }else{
                        callback(0);
                    }
                });
            }
        },
        //开启语音设置面板
        setConfig : function(){
            if(Voice.check.status == true){
                Voice.ajax({
                    act : 'MC_OPEN_SETTING'
                });
            }
        },
        //获取说话声音大小
        getPower : function(callback){
            if(Voice.check.status == true){
                Voice.ajax({
                    act : 'CONNECTION_GET_POWER'
                }, function(ret){
                    //Voice.log(ret);
                    if(ret.code == 0){
                        callback(ret.value);
                    }else{
                        callback(0);
                    }
                });
            }
        },
        //谁在说话
        getSpeaking : function(callback){
            if(Voice.check.status == true){
                Voice.ajax({
                    act : 'CONNECTION_GET_SPEAKING'
                }, function(ret){
                    //Voice.log(ret);
                    if(ret.code == 0){
                        callback(ret.value);
                    }else{
                        callback(0);
                    }
                });
            }
        },
        //获取说话声音大小 & 谁在说话
        getPowerSpeaking : function(callback){
            if(Voice.check.status == true){
                Voice.ajax({
                    act : 'CONNECTION_GET_POWER_SPEAKING'
                }, function(ret){
                    //Voice.log(ret);
                    if(ret.code == 0){
                        callback(ret.power, ret.value);
                    }else{
                        // callback(0);
                    }
                });
            }
        },
        //开启语音
        setCapture : function(capture, callback){
            //Voice.log('capture:'+capture);
            if(Voice.check.status == true){
                Voice.ajax({
                    act : 'CONNECTION_CAPTURE',
                    value : capture
                }, function(ret){
                    //Voice.log(ret);
                    if(ret.code == 0){
                        if(typeof callback !== 'undefined'){
                            callback(true);
                        }
                    }
                });
            }
        },
        //设置伴奏    
        playSysSound : function(isOpen, callback){
            var val = isOpen ? 1 : 0,
                _ts = Voice.op; 
            if(Voice.check.status == true){
                Voice.ajax({
                    act : 'SET_MIX_HARD',
                    value : val
                }, function(ret){
                    Voice.log(ret);
                    if(ret.code == 0){
                        $('#debug').prepend('<p>mix_hard: '+val+'</p>');
                        Voice.ajax({
                            act : 'QUALITY_SET',
                            value : isOpen ? 'sing_high2' : 'normal'
                        });
                        callback(true);
                    }else{
                        callback(false);
                    }
                });
            }
        },    
        //设置屏蔽
        setIgnore : function(xid, isIgnore, callback){
            xid = parseInt(xid, 10);
            if(Voice.check.status == true){
                Voice.ajax({
                    act : 'IGNORE_XID_VOICE',
                    xid : xid,
                    value : isIgnore
                }, function(ret){
                    Voice.log(ret);
                    if(ret.code == 0){
                        $('#debug').prepend('<p>setIgnore --> xid: '+xid + ', isIgnore: '+isIgnore+'</p>');
                        callback(true);
                    }else{
                        callback(false);
                    }
                });
            }
        },
        checkStatus : function(xid, callback){
            xid = parseInt(xid, 10);
            //status
            Voice.ajax({
                act : 'CONNECTION_STATUS',
                xid : xid
            }, function(ret){
                //Voice.log(ret);
                if(ret.code == 0){
                    if(typeof ret.heartbeat != 'undefined' && ret.heartbeat == 1){
                        //Voice.check.status = false;
                        callback(false);
                    }else{
                        //Voice.check.status = true;
                        callback(true);
                    }
                }else{
                    //Voice.check.status = false;
                    callback(false);
                }
            }, function(){
                //Voice.check.status = false;
                callback(false);
            });
        }
    };

    // exports
    return Voice;
});

