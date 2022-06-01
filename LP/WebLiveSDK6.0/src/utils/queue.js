"use strict";
// Filename: queue.js
define(function(require){
	var tools = require("./tools");
	
	//队列
	var queue = {
		storage: {},
		timmer:{},
		//默认配置，max_queue_time单位用毫秒
		defaultConfig:{"min_run_num":1,"now_num":0,"max_queue_time":30000,"max_queue_len":1000,"callback":function(){}},
		config:{},
		queueRunRate:200,//ms队列执行频率，毫秒

		//初始化队列，需传入参数，或在上面config里手动指定队列名称的配置
		init: function(key,config){
			if(typeof this.storage[key] == 'undefined'){
				this.storage[key] = [];
				if(!this.config[key]){
					this.config[key] = {};
				}
				for(var i in this.defaultConfig){
					//如果已经手动写死了配置，则不要用默认的覆盖
					if(!this.config[key][i]){
						this.config[key][i] = this.defaultConfig[i];
					}
				}
				//覆盖写死或默认的配置
				if(config){
					for(var i in config){
						this.config[key][i] = config[i];
					}
				}

				this.start(key);
			}
		},
		//入列
		add: function(key, item){
			if(this.storage[key].length >= this.config[key].max_queue_len){
				return false;
			}
			this.storage[key].push(item);
		},
		addBat: function(key, items){
			for(var i in items){
				this.add(key, items[i]);
			}
		},
		//执行
		run: function(key){
			var _ts = this;
			var len = _ts.storage[key].length;
			var maxNumPerTime = parseInt(len/(_ts.config[key].max_queue_time/_ts.queueRunRate));
			var num = Math.min(Math.max(_ts.config[key].min_run_num,maxNumPerTime,_ts.config[key].now_num),len);

			//维持一段时间内的执行数，以免len越小导致越跑越慢
			if(num > _ts.config[key].min_run_num && num > _ts.config[key].now_num){
				//clearTimeout(_ts.timmer[key+'_now_num']);
				_ts.config[key].now_num = num;
				_ts.timmer[key+'_now_num'] = setTimeout(function(){
					_ts.config[key].now_num = 0;
				},_ts.config[key].max_queue_time);
			}

			//console.log('queue ['+key+'] len:'+len);

			for(var i=1;i<=num;i++){
				var tmp = _ts.storage[key].shift();
				_ts.config[key].callback(tmp);
			}
		},
		// 销毁
		destroy: function () {
			tools.debug('Queue on destroy...')
			let keys = Object.keys(this.timmer)
			keys.forEach(item => {
				this.stop(item)
			})
		},
		start: function(key){
			var _ts = this;
			//执行
			_ts.timmer[key] = setInterval(function(){
				_ts.run(key);
			},_ts.queueRunRate);
		},
		stop: function(key){
			if(this.timmer[key]){
				tools.debug('remove queue =>', key)
				clearInterval(this.timmer[key]);
				this.timmer[key] = null;
			}
		}
	};
	
	return queue;
});
