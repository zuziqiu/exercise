//分页插件
/**
2014-08-05 ch
**/
var  pagination = "" || {};

(function($){
	var ms = {
		init:function(obj,args){
			return (function(){
				ms.fillHtml(obj,args);
				ms.bindEvent(obj,args);
			})();
		},
		//填充html
		fillHtml:function(obj,args){
			return (function(){
				obj.empty();
				//上一页
				if(args.current > 1){
					/*obj.append('<a href="javascript:;" class="prevPage">上一页</a>');*/
				}else{
					obj.remove('.prevPage');
					/*obj.append('<span class="disabled">上一页</span>');*/
				}
				//中间页码
				if(args.current != 1 && args.current >= 4 && args.pageCount != 4){
					obj.append('<a href="javascript:;" class="tcdNumber">'+1+'</a>');
				}
				if(args.current-2 > 2 && args.current <= args.pageCount && args.pageCount > 5){
					obj.append('<span>...</span>');
				}
				var start = args.current -2,end = args.current+2;
				if((start > 1 && args.current < 4)||args.current == 1){
					end++;
				}
				if(args.current > args.pageCount-4 && args.current >= args.pageCount){
					start--;
				}
				for (;start <= end; start++) {
					if(start <= args.pageCount && start >= 1){
						if(start != args.current){
							obj.append('<a href="javascript:;" class="tcdNumber">'+ start +'</a>');
						}else{
							obj.append('<span class="current">'+ start +'</span>');
						}
					}
				}
				if(args.current + 2 < args.pageCount - 1 && args.current >= 1 && args.pageCount > 5){
					obj.append('<span>...</span>');
				}
				if(args.current != args.pageCount && args.current < args.pageCount -2  && args.pageCount != 4){
					obj.append('<a href="javascript:;" class="tcdNumber">'+args.pageCount+'</a>');
				}
				//下一页
				if(args.current < args.pageCount){
					/*obj.append('<a href="javascript:;" class="nextPage">下一页</a>');*/
				}else{
					obj.remove('.nextPage');
					/*obj.append('<span class="disabled">下一页</span>');*/
				}
			})();
		},
		//绑定事件
		bindEvent:function(obj,args){
			return (function(){
				obj.on("click","a.tcdNumber",function(){
					var current = parseInt($(this).text());
					ms.fillHtml(obj,{"current":current,"pageCount":args.pageCount});
					if(typeof(args.backFn)=="function"){
						args.backFn(current);
					}
				});
				//上一页
				obj.on("click","a.prevPage",function(){
					var current = parseInt(obj.children("span.current").text());
					ms.fillHtml(obj,{"current":current-1,"pageCount":args.pageCount});
					if(typeof(args.backFn)=="function"){
						args.backFn(current-1);
					}
				});
				//下一页
				obj.on("click","a.nextPage",function(){
					var current = parseInt(obj.children("span.current").text());
					ms.fillHtml(obj,{"current":current+1,"pageCount":args.pageCount});
					if(typeof(args.backFn)=="function"){
						args.backFn(current+1);
					}
				});

				//跳转
				obj.siblings('.comfirm_skip').on("click",function(){
					var current = parseInt(obj.siblings('input').val());
					if(current){
						ms.fillHtml(obj,{"current":current,"pageCount":args.pageCount});
						if(typeof(args.backFn)=="function"){
							args.backFn(current);
						}
					}
				});
			})();
		}
	}
	$.fn.createPage = function(options){
		var args = $.extend({
			pageCount : 10,
			current : 1,
			backFn : function(){}
		},options);
		ms.init(this,args);
	}
})(jQuery);

//代码整理：懒人之家 www.lanrenzhijia.com

pagination.page = {

	pnum: 0,
	//投票的分页
	init:function(total,vid){
		if(total == undefined){
			$("#pagination").hide();
		}
		var pageCount =  Math.ceil(total/1);
		$("#pagination").createPage({
	        pageCount: pageCount,
	        current:1,
	        backFn:function(p){
	        	$("#vote_list").empty();
	            pagination.page.doAjax(p,vid);
	        }
   		});
	},

	//用户列表分页
	userInit: function(total){
		if(total == undefined){
			$("#user_page_btn").hide();
		}else{
			$("#user_page_btn").show();
		}
		var pageCount =  Math.ceil(total/10);
		if(!pagination.page.isInit){
			$("#user_page_btn").createPage({
		        pageCount: pageCount,
		        current:1,
		        backFn:function(p){
		        	var num = $("#user_page_btn .current").text();
		        	if(num == 1){
		        		$(".user_back").hide();
		        	}else{
		        		$(".user_back").show();
		        	}
		        	if(pagination.page.pnum !== p){
		        		pagination.page.userDoAjax(p);
		        	}
		        	pagination.page.pnum = p;
		        	
		        }
	   		});
	   	}
	},

	//用户分页请求
	userDoAjax: function(p){
		var postUrl = protocol+window.location.host+'/live/userlist.php';
		var searchVal = $(".search_input input").val();
		if(searchVal.length > 0 && MTSDK.admin.adminBox.isClickSearch) {
			var op = $(".user_search .search_title").data('op');
			if(op == 0){
				dataUrl = 'access_token='+window.access_token+'&act=info'+'&page='+p+'&name='+searchVal;
			}else if(op == 1){
				dataUrl = 'access_token='+window.access_token+'&act=info'+'&page='+p+'&uid='+searchVal;
			}
			
		}else{
			dataUrl = 'access_token='+window.access_token+'&act=info'+'&page='+p;
		}
		$.ajax({
	         url : postUrl,
	         type :"get",
	         data: dataUrl,
	         dataType : 'jsonp',               
	         success:function(data) {
		         	if(data){
		         		if(data.code== 0){
		         			$("#user_list").empty();
		         			var userTmp= template("tpl_user_list",data); 
                    		$("#user_list").append(userTmp);
		         		}
		         	}
		         	
	         },
	         error : function(){

	          }
        });
	},


	//请求
	doAjax: function(p,vid){
		var postUrl = protocol+"open.talk-fun.com/live/vote.php?action=getVoteList";
		$.ajax({
	         url : postUrl,
	         type :"get",
	         dataType : 'jsonp',
	         data : {
	         	vid: vid,
	            page: p
	         },                
	         success:function(data) {
	         	    var temple = "";
		         	for(var i=0;i<data.user.length;i++){
		         		temple += '<li>'+data.user[i].nickname+'<span>投了'+data.user[i].option+'</span><em>('+data.user[i].time+')</em></li>';
		         	}
		         	$("#vote_list").append(temple);
	         },
	         error : function(){

	          }
        });
	},

	// 问答列表分页
	questionPageInit: function(){
		if(typeof this.res.count === 'undefined'){
			return false;
		}
		var total = this.res.count,
			pageCount =  Math.ceil(total/8);
		if(!pagination.page.isInit){
			$(".quest_page_manage").createPage({
		        pageCount: pageCount,
		        current:1,
		        backFn:function(p){
		        	// var num = $("#user_page_btn .current").text();
		        	// if(num == 1){
		        	// 	$(".user_back").hide();
		        	// }else{
		        	// 	$(".user_back").show();
		        	// }
		        	if(pagination.page.pnum !== p){
		        		pagination.page.questionPageDoAjax(p);
		        	}
		        	pagination.page.pnum = p;
		        	
		        }
	   		});
	   	}
	},

	// 问答列表每一页的请求数据
	questionPageDoAjax: function(p){
		var that = this;
		$.ajax({
            type: 'GET',
            data: {
                //通用别的接口，其实不需要传时间，写死
                start_duration: 0,
                end_duration: 86400,
                // 有用字段
                access_token: window.access_token,
                page: p?p:1,
                rows: 8
            },
            url: '//open.talk-fun.com/live/questions.php',
            dataType: "jsonp",
            success: function(response){
                if(response.code === 0){
                    this.res = response;
                    that.question_rander(response);
                    // that.questionPageInit(response);
                }
            }
        });
	},
	// 问答列表渲染
	question_rander: function(_res){
        var _data = "",
            i= "",
            tpl= "";
        //来自分页请求的数据
		if(typeof _res != 'undefined'){
			_data = _res.data
		}
		// 来自初始化的数据
		else if(typeof this.res.data != 'undefined'){
			_data = this.res.data
		}
		// return false
		else{
			return false;
		}

        for(i in _data){
            var questionData= {
                avatar: _data[i].avatar,
                chat: _data[i].chat,
                content: _data[i].content,
                course_id: _data[i].course_id,
                gid: _data[i].gid,
                liveid: _data[i].liveid,
                nickname: _data[i].nickname,
                qid: _data[i].qid,
                replies: _data[i].replies,
                replyId: _data[i].replyId,
                role: _data[i].role,
                sn: _data[i].sn,
                status: _data[i].status,
                time: HTSDK.tools.convertTimestamp(_data[i].time),
                uid: _data[i].uid,
                xid: _data[i].xid
            }
            if(_data[i].answer){
                questionData.answer = [];
                _data[i].answer.forEach(function(item, index){
                    var item_data = "",
                        j= "",
                        answer_data= {};
                    for(j in item){
                        answer_data[j]= item[j]
                    }
                    answer_data.time = HTSDK.tools.convertTimestamp(answer_data.time),
                    questionData.answer.push(answer_data)
                })
            }
            tpl += template("question_management_content", questionData);
        }
        $(".question_management_content").html(tpl);
    }
}