
//author: lianghua
//time: 2016-08-22
//用途：章节模块
define(function(require, exports, module){
	
    // 模版
    var TMOD = require("TMOD"),
        scrollTo = require("scrollTo")
        plugins = require("./plugins");

        
	var chapter = {
		// 章节
        chaptersData : [],
        chapterList : {},//存储章节列表
        chaptersDataObj : {},
        chaptersTimePoints : [],
        cp_wait : null,
        chapterCurPoint : 0,
        tmpLoad : false,
        isLoad : false,
        isShow: true,
        MT : null,
        isFirst : false,
        timePoints : [],
        seeker : document.querySelector("#seek_range"),
        // seek锁定
        seekLock : false, 
        // 点击事件(注意：ios9.x+ 不能使用touchstart触发事件)
        __Event : "touchend",

        // 时间节点
        __currentTime : 0,
        __crTimer : 0,
        onTouch : true, // 触摸
        scrollSection : null,
        totalDuration: 0,
        seekDuration: 0,

		//初始化
		init: function(HTSDK){

		},

        //总时间长度
        totalTime: function(live){
            this.live = live;
            this.totalDuration = parseInt(live.duration, 10);
            $("#total_time").html(plugins.second2HMS(live.duration,"total"));
        },
        
        //seek到某个时间点
        seekTimePoint: function(duration){
            var _that = this;
            // $('#seekAmount').html("当前进度: "+chapter.__currentTime + ' / ' + duration + chapter.seekLock); 
        },

        // 播放结束
        isPlayEnd: function(currentTime){
            if(currentTime >= this.totalDuration){
                // stop
                return true;
            }else{
                return false;
            }
        },

        // 当前时间
        currentTime: function(currentTime){
            var _that = this,
                _pcurTime = parseInt(currentTime, 10);

            if(_that.isPlayEnd(_pcurTime)){
                _that.MT.stop();
                _that.seekDuration = 0;
                $("#click_play").show();
                chapter.seeker.noUiSlider.set(this.totalDuration);
                $("#cur_time").html(plugins.second2HMS(currentTime,"cur"));
                return false;
            }

            //loading hide
            if(chapter.timePoints.length>0){
                if(_pcurTime > chapter.timePoints[0]){
                    $("#load_mask").hide();
                }
            }
            _that.__crTimer = _pcurTime;

            // 是否播放状态
            if(_pcurTime > 0){
                $("#modules_shadow").hide();
            }else{
                return false;
            }
            // playing ...
            if(!chapter.seekLock && currentTime > 0){
                if(currentTime > _that.seekDuration){
                    chapter.seeker.noUiSlider.set(currentTime);
                    $("#cur_time").html(plugins.second2HMS(currentTime,"cur"));
                }
            }

            var $chatPost = $("#chat_pos_"+_pcurTime);
            chapter.__currentTime = _pcurTime;

            // 滚动章节
            if(chapter.chaptersDataObj[_pcurTime]){
                if(chapter.chapterCurPoint === chapter.chaptersDataObj[_pcurTime]){
                    return false;
                }
                $("#chapter_ul li").find(".playing").hide();
                chapter.chapterCurPoint = chapter.chaptersDataObj[_pcurTime];
                if(_that.tmpLoad){
                   chapter.goChapter(currentTime);
                }
            }
        },
         
        //播放进度 
        currentProgress: function(currentTime, duration, currentPercent,HTSDK){
            var _that = this;

            //播放1s后自动隐藏进度条
            if(currentTime > 1){
                if(!chapter.isFirst){
                    // $("#controls").hide(100);
                }
                chapter.isFirst =  true;
            }
            
            // $('#seekAmount').html("当前进度: "+currentTime + ' / ' + duration + chapter.seekLock);  
            _that.MT = HTSDK; 
            _that.currentTime(currentTime);     
        }, 


        //事件绑定
        bindEvent: function(){
            var _that = this;

            // 章节选择
            $("#chapter_ul").on("click", "li", function(){
                var stime = $(this).data("time");
                $("#load_mask").show();
                _that.MT.seek(stime);
            });

            // view tools
            $("#mod_main_player").on(_that.__Event, function(e){
                var $control = $("#controls");
                if(!chapter.isShow){
                    $control.fadeIn(100);
                    chapter.isShow = true;
                }else{
                    $control.fadeOut(100);
                    chapter.isShow = false;
                }
            }); 
        },

        // Seek(进度条拖动)绑定
        seekEvent: function(live){
            var seekTimer = null,
                _that = this;     
            // seek..
            noUiSlider.create(chapter.seeker, {
                start: 0,
                step: 1,
                range: {
                    min: 0,
                    max: Number(live.duration)
                }
            });

            // seek on Change.
            chapter.seeker.noUiSlider.on("change", function(that){
                clearTimeout(seekTimer);
                var _duration = parseInt(chapter.timePoints[0], 10),
                    _closestPoint = plugins.closest(chapter.chaptersTimePoints, _duration);
                if(_that.tmpLoad){
                    //当前tab为章节时
                    if($("#tab_chapter").hasClass("selected")){
                        chapter.goChapter(_closestPoint);
                    }  
                }
                var _time = parseInt(that[0], 10);
                if(_that.isPlayEnd(_time)){
                    // _that.MT.seek(_duration - 1);
                    _that.MT.stop();
                    _that.seekDuration = 0;
                }else{
                    _that.MT.seek(_duration);
                    _that.seekDuration = _duration;
                }
                chapter.seekLock = false;
                $("#load_mask").show();

            });
            
            // seek on Update
            chapter.seeker.noUiSlider.on("update", function(that){
                $("#load_mask").hide();
                // $(".reload").html(that);
                // $("#cur_time").html(plugins.second2HMS(that[0], "cur"));
            });

            // seek on Slide
            chapter.seeker.noUiSlider.on("slide", function(that){
                chapter.seekLock = true;
                chapter.timePoints = that;
                var _time = parseInt(that[0], 10);
                $("#cur_time").html(plugins.second2HMS(that[0],"cur"))
            });
        },

        //存储章节时间点
        chapterTimePoint: function(chapters){
            var _that = this;
            _that.chaptersData = chapters;
            for(var i = 0; i < _that.chaptersData.length; i++) {
                var _time = parseInt(_that.chaptersData[i].starttime, 10);
                _that.chaptersDataObj[_time] = _that.chaptersData[i];
                _that.chaptersTimePoints.push(_time);
            };
        },

        //渲染章节列表
        renderChapterList: function(list) {
            if(!list){
                return;
            }
            //目标
            var _that = this,
                $chapter_list = $("#chapter"),
                $chapter_ul = $("#chapter_ul");
            
            var chapter_list = list,
                chapterRender = "";

            //只允许加载一次数据
            if(!chapter.isLoad){
                // 数据迭代
                for (var i = 0, ilen = chapter_list.length; i<ilen; i++) {
                    chapter_list[i].sn = "chapter_"+i;
                    if (i == 0) {
                        chapter_list[i].index = 1;
                    }
                    // 读取模版
                    chapterRender += _that.chaptersList(chapter_list, i);
                }

                _that.chapterLength = list.length;

                // 插入模版
                $chapter_ul.append(chapterRender);

                $("#chapter_ul li").first().find(".playing").show();
                $("#chapter_ul li").first().addClass("cur");

                chapter.tmpLoad = true;
                chapter.isLoad = true;
            }
            var _d =  _that.__crTimer || 0;
                               
            _that.goChapter(_d);

        },

        //章节模板export
        chaptersList: function(ret, i) {
            var chapters = ret,
                that = this;
            // data
            var data = {
                chapters: ret[i]
            };

            var tpl = TMOD("tpl_section_list", data);
            return tpl;
        },

        //滚动到指定章节
        goChapter: function(duration){
            chapter.seekLock = false;
            var _that = this;
            var chapterPoint = plugins.closest(_that.chaptersTimePoints, duration),
                $chapterScroller = $("#chapter_ul li");

                //删除最近对象的激活状态
                $targetElement = $("#"+_that.chaptersDataObj[chapterPoint].sn);
                    
                $chapterScroller.removeClass("cur");
                $chapterScroller.find(".playing").hide();
                // 设置当前
                $targetElement.addClass("cur");
                $targetElement.find(".playing").show(); 
                //滚动
                if($chapterScroller.eq(1).length > 0){
                    var offTop = $chapterScroller.eq(1).offset().top;
                    $("#chapter").scrollTo({
                        toT: $targetElement.offset().top-offTop
                    });
                }
        }
	}
	//暴露
	module.exports = chapter;
});