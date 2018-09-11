/**
 * @name question.js
 * @note 问答模块
 * @author [liagh]
 * @version [v1.0.1]
 */

define(function(require, exports, module) {

    // 模版
    var TMOD = require("TMOD"),
    	plugins = require("./plugins");
   /* var room = require("./room");*/
    // 问答模块
    var question = {
    	_MT : null,

        isLoad : false,

    	questionList : {},
		// 初始化问答
		init: function(HTSDK){
			 question._MT = HTSDK;
			 plugins.helper();
		},
		//问答列表
		renderQuestion: function(questions){
            _that =  this;
			var d = {
                    data: questions
                };
            if(!_that.isLoad){
                _that.isLoad = true;
                var tpl = TMOD("tpl_qulist", d);
                $("#question_inner_hall").append(tpl);
            }    
            	
		}

    };

    // 暴露接口
    module.exports = question;
});

