/**
 * tools 工具
 */

// 聚合工具🔧
var liveTools = {
    SDKTOOLS: MT.tools,
    // 字符字数检查
    charLength: function(string){
        var intLength = 0;
        for (var i = 0; i < string.length; i++) {
            if ((string.charCodeAt(i) < 0) || (string.charCodeAt(i) > 255)) 
                intLength = intLength + 2;
            else{
                intLength = intLength + 1;
            }   
        } 
        return intLength;
    },
    //转换url为可链接的
    textUrlLink: function(str){
        var reg = /(https?|ftp)\:[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/;
        return str.replace(reg,function(url){
            return '<a href="'+url+'" target="_blank">'+url+'</a>';
        });
    },

    // 转换链接
    text2link: function(_string){
        var reg = /(http:\/\/[\w.\/]+)(?![^<]+>)/gi;
        _string = _string.replace(reg, '<a href="$1" target="_blank">$1</a>');
        return _string;
    },
    // 转换QQ
    text2QQ: function(_string){
        var reg = /(QQ:^(\d)*$)/gi;
        _string = _string.replace(reg, '<a href="$1" target="_blank">$1</a>');
        return _string;
    },
    // UBB转表情(img)
    ubb2img: function(_package, _string){
        return MT.tools.ubb2img(_package, _string);
    },
    // 聊天区公告
    chatNotify: function(notify, isDiy){
        var $tg = $("#mod_chat_hall"),
            msg = "";
        if(!isDiy){
            msg = '<span class="mod_notify">'+notify+'</span>';
        }else{
            msg = notify;
        }
        $tg.append(msg);
        HTSDK.tools.scrollToBottom("chat");
    },
    // 公共提示标签
    showComtip: function (e, msg){
        var $t = e,
            that = this,
            pubtimer = that.pubtimer,
            $econ = $('#pop_tips');
        clearTimeout(that.pubtimer);
        if(!$t){
            return;
        }
        // reset
        $econ.css({
            "left": $t.offset().left - 6,
            "top": $t.offset().top - 35
        });
        $econ.show();
        // 插入信息
        $econ.find("p").html(msg);
        // 隐藏
        that.pubtimer = setTimeout(function (argument) {
            $econ.find("p").html("");
            $econ.hide();
        }, 2000);
    },
    // 滚到底
    scrollToBottom: function(type, xid){
        var that = this,
            isMe = false,
            $chatHall = $("#mod_chat_scroller"),
            $quesHall = $("#mod_questions_con");
        if(xid){
            isMe = (MT.me.xid == xid);
        }
        if(type === "chat"){
            if(!HTSDK.modChat.chatScrollLock || isMe){
                $chatHall.scrollTop($("#mod_chat_hall").height());
            }
        }else if(type === "question"){
            if(!HTSDK.modQuestion.quesScrollLock || isMe){
                $quesHall.scrollTop($("#mod_ques_scroller").height());
            }
        }
        return false;
    },
    // 滚动到头
    scrollToTop: function(type, xid){
        var that = this,
            isMe = false,
            $chatHall = $("#mod_chat_scroller"),
            $quesHall = $("#mod_questions_con");
        if(xid){
            isMe = (MT.me.xid == xid);
        }
        if(type === "chat"){
            if(!HTSDK.modChat.chatScrollLock || isMe){
                $chatHall.scrollTop(0);
            }
        }else if(type === "question"){
            if(!HTSDK.modQuestion.quesScrollLock || isMe){
                $quesHall.scrollTop(0);
            }
        }
        return false;
    },

    //HH:MM:SS
    setTimer:function(intDiff){
        var    day=0,
               hour=0,
               minute=0,
               second=0;//时间默认值                   
        HTSDK.room.liveTimer = setInterval(function(){
            if(intDiff > 0){
               day = Math.floor(intDiff / (60 * 60 * 24));
               hour = Math.floor(intDiff / (60 * 60)) - (day * 24);
               minute = Math.floor(intDiff / 60) - (day * 24 * 60) - (hour * 60);
               second = Math.floor(intDiff) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
            }
            if (hour <= 9){
                day =day;
            }
            if (hour <= 9){
                hour = '0' + hour;
            }
            if (minute <= 9){
                minute = '0' + minute;
            }
            if (second <= 9){
                second = '0' + second;
            } 
            //超时的情况下    
            if(HTSDK.room.defaults.state == "out"){
                if(MT.getLiveState() != "start"){
                    window.clearInterval(HTSDK.room.liveTimer); 
                }else{
                    intDiff++; 
                    $("#live_progress").show();
                }
                
            }
            //末开始和开始的情况下
            else{
                intDiff--;
            }
            
            HTSDK.room.courseMsg.srvTime++;

            //直播进度
            HTSDK.room.liveProgress();  
            if(intDiff > -1){
                $("#distance_time").html(hour+":"+minute+":"+second);
            }else{
                $("#distance_time").html("00:00:00");  
            }

        },1000);
    },    
    // 时间转换
    convertTimestamp: function(timestamp){
        var d = new Date(timestamp * 1000),   // timestamp 2 milliseconds
            yyyy = d.getFullYear(),
            mm = ('0' + (d.getMonth() + 1)).slice(-2),  // Months are zero based. Add leading 0.
            dd = ('0' + d.getDate()).slice(-2),         // Add leading 0.
            hh = d.getHours(),
            h = hh,
            min = ('0' + d.getMinutes()).slice(-2),     // Add leading 0.
            ampm = 'AM',
            time;

        // ie: 2013-02-18, 8:35 AM  
        //time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;
        time = h + ':' + min;
        return time;
    },
    // 转换时间格式
    dateFormat: function(date, format){
        // date
        date = new Date(date);
        var map = {
            "M": date.getMonth() + 1, //月份 
            "d": date.getDate(), //日 
            "h": date.getHours(), //小时 
            "m": date.getMinutes(), //分 
            "s": date.getSeconds(), //秒 
            "q": Math.floor((date.getMonth() + 3) / 3), //季度 
            "S": date.getMilliseconds() //毫秒 
        };
        format = format.replace(/([yMdhmsqS])+/g, function(all, t){
            var v = map[t];
            if(v !== undefined){
                if(all.length > 1){
                    v = '0' + v;
                    v = v.substr(v.length-2);
                }
                return v;
            }
            else if(t === 'y'){
                return (date.getFullYear() + '').substr(4 - all.length);
            }
            return all;
        });
        return format;
    },
    
    // Fix firefox css:prosition
    fixFirefoxProsition: function(){
        var ua = navigator.userAgent.toLocaleString().toLocaleLowerCase();
        if(ua.indexOf("firefox") > 0){
        (function($) {
            var div = document.createElement('div'),  
                rposition = /([^ ]*) (.*)/;
            if(div.style.backgroundPositionX !== '') {  
                $(['X', 'Y']).each(function( i, letter ) {  
                    var property = 'backgroundPosition' + letter,  
                        isX = letter == 'X';  
                    $.cssHooks[property] = {  
                        set: function(elem, value) {  
                            var current = elem.style.backgroundPosition;  
                            elem.style.backgroundPosition = (isX? value + ' ' : '' ) + (current? current.match(rposition)[isX+1] : '0') + (isX? '' : ' ' + value);  
                        },  
                        get: function(elem, computed) {  
                            var current = computed?  
                                $.css(elem, 'backgroundPosition') :  
                                elem.style.backgroundPosition;  
                            return current.match(rposition)[!isX+1];  
                        }  
                    };  
                    $.fx.step[property] = function(fx) {  
                        $.cssHooks[property].set(fx.elem, fx.now + fx.unit);  
                    }  
                });  
            }
            div = null;
            })(jQuery);
        }
    },

    //移动
    dragDrop:function(){
         var _move = false;
        //鼠标离控件左上角的相对位置 
        var _x,
            _y;
        $(".mbox_hd").mousedown(function(e) { 
            _move = true;
            _x = e.pageX-parseInt($(".cmod").css("left")); 
            _y = e.pageY-parseInt($(".cmod").css("top")); 
        }); 
        $(document).mousemove(function(e) {
            if(_move){ 
              var x = e.pageX-_x;//移动时鼠标位置计算控件左上角的绝对位置 
              var y = e.pageY-_y;
              $(".cmod").css({top:y,left:x});//控件新位置   
            } 
        }).mouseup(function() { 
          _move = false; 
        }); 
    }
};

// 暴露
var HTSDK = window.HTSDK || {};
HTSDK.tools = liveTools;
