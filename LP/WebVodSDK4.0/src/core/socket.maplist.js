// Filename: socket.maplist.js
define(function(require) {
	// imports
	var tools = require("@tools");

	/**
	 * maplist 事件
	 * ================
	*/
	var maplist = {
		mapCaselist: [],
	    set: function(eventName, callback){
	    	var flag = tools.in_array(eventName, this.mapCaselist);
	    	if(flag){
	    		return false;
	    	}else{
	    		//this.mapCaselist.push(eventName);
	    		if(typeof callback === "function"){
	    			var ename = eventName;
	    			//console.error([ename, callback]);

	    			this.mapCaselist.push([eventName, callback]);
	    			//this.mapCaselist.eventName
	    		}
	    	}
	    	console.debug(this.mapCaselist);
	    },
	    get: function(eventName){
	        //console.log(this.mapCaselist);
	        var flag = tools.in_array(eventName, this.mapCaselist);
	        if(flag){
	        	return eventName;
	        }else{
	        	return null;
	        }
	    }
	};
	// exports
	return maplist;
});
