/**
 * 普通用户盒子
 */
(function(win){
     window.protocol = window.location.protocol + "//";
     var modUserBox = {
        voteUrl: protocol + window.location.host + '/live/liveEvent.php?', //投票
        voteListData: {},
        voteData: {},
        scrollTop: 0,
        timerOut: null,
        bindEvents: function () {
            var that = this;
            // 显示盒子
            $("#set_vote").on('click',function(){
                $('#user_pop_box').show();
            })  
            // 关闭弹框
            $("body").on('click','.box_close',function(){
                that.closePop();
            })

            // 返回
            $("body").on('click','.goback',function(){
                $('#user_pop_box').show();
                $('#vote_record_block').hide();
            })

            //刷新列表
            $("body").on('click', '.reload_btn', function () {
                that.getVoteList();
            })

            // 重新投票
            $("body").on('click', '.vote_ing', function () {
                var vid = $(this).data('vid')
                that.castVote(vid);
            })

            // 获取投票结果
            $("body").on('click', '.vote_end', function () {
                var vid = $(this).data('vid')
                var retval = that.voteListData[vid];
                retval.info.vid = retval.vid;
                //没有答案，不公布结果
                if(parseInt(retval.info.answer.length) === 0 &&  parseInt(retval.info.status) === 1) {
                    return false;
                }
                // 图片投票
                if (retval.info.imageUrl.length > 0) {
                    HTSDK.plugins.vote.showResult(retval);
                } else {
                    HTSDK.plugins.vote.getVoteDetail(vid);
                }	
            })

           //获取投票记录 
            $("#item_list").on('click',"li",function(){
                var op = $(this).data('op');
                switch(op) {
                    case "vote":
                      that.getVoteList();
                      break;
                }
                $('#user_pop_box').show();
            })
        },

        //将选项转换成数字
        switchNum: function(retval) {
            var letter = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
            str = [];
            if (retval.info.answer.length > 0) {
                var answer =  retval.info.answer.split(",");
            }else {
                return  false;
            }       
            for(var i =0; i < letter.length; i++ ) {
                for(var j= 0; j < answer.length; j++) {
                    if (letter[i] == answer[j]) {
                        str.push(i)
                    }
                }
            }
            retval.info.answer = str.join(',')
        },

        //投票
        castVote: function (vid) {
            var retval = this.voteListData[vid],
                that = this;
            if(parseInt(retval.voted) === 1) {
                return false;
            }
            HTSDK.plugins.vote.showVote(retval,true);
            that.getVoteList();
        },
        // 获取投票
        getVoteList: function () {
            //getDatalist
            var that = this,
                dataList = {};
            $.ajax({
                type: 'GET',
                data: 'access_token=' + window.access_token + '&type=vote' + '&time=-1'+'&status=-1',
                url: that.voteUrl,
                dataType: "jsonp",
                success: function (ret) {
                    if (ret.code === MT.CODE.SUCCESS) {
                        /* that.setVoteList(ret);*/
                        // 只有上课的情况下才五秒刷新一次
                        if (HTSDK.videoprivew.state === "start") {
                            that.voteData = ret;
                            that.getVoteListData(ret.data.votes)
                            that.renderVoteList(ret);
                        }else{
                            var ret = that.voteData;
                            if(!ret.data) {
                                ret.data = [];
                            }
                            that.renderVoteList(ret);
                        }
                        clearTimeout(that.timerOut)
                        that.timerOut = setTimeout (function () {
                            var isHide = $('#vote_record_block').is(':hidden');
                            if (!isHide && that.scrollTop < 66) {
                                that.getVoteList();
                            }else {
                                clearTimeout(that.timerOut);
                            }
                        }, 5000) 
                    }
                }
            });
        },
        // 用对象保存投票记录列表
        getVoteListData: function (data) {
            var that = this;
            for (var i=0; i<data.length; i++) {
                that.switchNum(data[i])
                that.voteListData[data[i].vid] = data[i]
            }
        },

        //关闭弹框
        closePop: function() {
            $('#user_pop_box').hide();
            $('#vote_record_block').hide();
        },
        // 渲染投票记录模板
        renderVoteList: function (ret) {
            // var data = ret.data;
            var that = this;
            var data = ret.data;
            $("#vote_record_block").remove();
            var templ =  template('mod_vote_record', data)
            $("body").append(templ);
            $("#vote_record_block").show();
            that.listenScroll(); 
        },

        // 盒子
        renderBox: function () {
            var boxTempl = template("user_pop_box_templ", {});
            $('body').append(boxTempl)
        },
        // scroll 截流
        throttle: function (method,context,scrollTop){
            clearTimeout(method.tId);
            method.tId=setTimeout(function(){
                var isHide = $('#vote_record_block').is(':hidden');
                if (!isHide && parseInt(scrollTop) < 66) {
                    method.call(context);
                } 
            },5000);
        },

        // 监听投票是滚动条是否滚动
        listenScroll: function () {
            var that = this;
            $("#vote_record_block ul").scroll(function() {
                var scrollTop =  $("#vote_record_block ul").scrollTop();
                modUserBox.scrollTop =  scrollTop;
                that.throttle(that.getVoteList, that,scrollTop)
            });   
        },
        // 初始化
        init: function () {
            this.renderBox();
            this.bindEvents();
        }
     }
      // 暴露
    var HTSDK = window.HTSDK || {};
    HTSDK.modUserBox = modUserBox;
})(window);