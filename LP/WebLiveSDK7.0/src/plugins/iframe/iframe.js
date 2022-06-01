// // Filename: iframe.js
// define(function(require){
//     // import libs
//     var map = require("../../utils/map");

//     // liveIframe
//     var liveIframe = {
//         on: function(cmd, callback) {
//             map.put('talkfuniframe:'+cmd, callback);
//         },
//         trigger: function(cmd, args){
//             map.get('talkfuniframe:'+cmd)(args);
//         }
//     };
//     // exports
//     return liveIframe;
// });
import eventStore from '../../eventStore'
let liveIframe = {
  on: function (cmd, callback) {
    eventStore.on(`talkfuniframe:${cmd}`, callback)
  },
  trigger: function (cmd, args) {
    eventStore.emit(`talkfuniframe:${cmd}`, args)
  }
};

export default liveIframe