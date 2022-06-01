// Filename: cookies.js
define(function(require){
	// Cookies
	var _Cookies = {
	    // set Cookies
	    set : function(name, value){
	        var argv = arguments;
	        var argc = argv.length;
	        var expires = (argc > 2) ? argv[2] : null;
	        var path = (argc > 3) ? argv[3] : '/';
	        var domain = (argc > 4) ? argv[4] : null;
	        var secure = (argc > 5) ? argv[5] : false;
	        document.cookie = name + "=" + escape (value) +
	            ((expires === null) ? "" : ("; expires=" + expires.toGMTString())) +
	            ((path === null) ? "" : ("; path=" + path)) +
	            ((domain === null) ? "" : ("; domain=" + domain)) +
	            ((secure === true) ? "; secure" : "");
	    },
	    // get Cookies
	    get : function(name, bUnescape){
	        var _ts = this;
	            bUnescape = (typeof(bUnescape)=="undefined")?true:false;
	        var arg = name + "=";
	        var alen = arg.length;
	        var dc = document.cookie;
	        var clen = dc.length;
	        var i = 0;
	        var j = 0;
	        while(i < clen){
	            j = i + alen;
	            if (dc.substring(i, j) == arg){
	                return _ts.getVal(j,bUnescape);
	            }
	            i = dc.indexOf(" ", i) + 1;
	            if(i === 0){
	                break;
	            }
	        }
	        return null;
	    },
	    getVal : function(offset,bUnescape){
	        var dc = document.cookie;
	        var endstr = dc.indexOf(";", offset);
	        if(endstr == -1){
	            endstr = dc.length;
	        }
	        if(bUnescape){
	            return unescape(dc.substring(offset, endstr));
	        }else{
	            return dc.substring(offset, endstr);
	        }
	    }
	};
	return _Cookies;
});
