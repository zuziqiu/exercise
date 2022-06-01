// Filename: iframe.js
define(function(require){
    // import libs
    var map = require("../../utils/map");
		
    // liveIframe
    var liveIframe = {
        on: function(cmd, callback) {
            map.put('talkfuniframe:'+cmd, callback);
        },
        trigger: function(cmd, args){
            map.get('talkfuniframe:'+cmd)(args);
        }
    };
    // exports
    return liveIframe;
});
