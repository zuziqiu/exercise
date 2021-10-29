/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/dist";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/_dashjs@4.0.0-npm@dashjs/dist/dash.all.debug.js":
/*!**********************************************************************!*\
  !*** ./node_modules/_dashjs@4.0.0-npm@dashjs/dist/dash.all.debug.js ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var dashjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! dashjs */ \"./node_modules/_dashjs@4.0.0-npm@dashjs/dist/dash.all.debug.js\");\n/* harmony import */ var dashjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(dashjs__WEBPACK_IMPORTED_MODULE_0__);\n// window.onload = function () {\r\n//   var video = document.querySelector('video');\r\n\r\n//   var assetURL = 'asset/stream.mpd';\r\n//   // Need to be specific for Blink regarding codecs\r\n//   // ./mp4info frag_bunny.mp4 | grep Codec\r\n//   var mimeCodec = 'video/mp4; codecs=\"avc1.42E01E, mp4a.40.2\"';\r\n\r\n//   if ('MediaSource' in window && MediaSource.isTypeSupported(mimeCodec)) {\r\n//     var mediaSource = new MediaSource;\r\n//     //console.log(mediaSource.readyState); // closed\r\n//     video.src = URL.createObjectURL(mediaSource);\r\n//     mediaSource.addEventListener('sourceopen', sourceOpen);\r\n//   } else {\r\n//     console.error('Unsupported MIME type or codec: ', mimeCodec);\r\n//   }\r\n\r\n//   function sourceOpen(_) {\r\n//     //console.log(this.readyState); // open\r\n//     var mediaSource = this;\r\n//     var sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);\r\n//     fetchAB(assetURL, function (buf) {\r\n//       sourceBuffer.addEventListener('updateend', function (_) {\r\n//         mediaSource.endOfStream();\r\n//         video.play();\r\n//         //console.log(mediaSource.readyState); // ended\r\n//       });\r\n//       sourceBuffer.appendBuffer(buf);\r\n//     });\r\n//   };\r\n\r\n//   function fetchAB(url, cb) {\r\n//     console.log(url);\r\n//     var xhr = new XMLHttpRequest;\r\n//     xhr.open('get', url);\r\n//     xhr.responseType = 'arraybuffer';\r\n//     xhr.onload = function () {\r\n//       cb(xhr.response);\r\n//     };\r\n//     xhr.send();\r\n//   };\r\n// }\r\n\r\n\r\nwindow.onload = function () {\r\n  var url = \"./assets/output/stream.mpd\";\r\n  var player = Object(dashjs__WEBPACK_IMPORTED_MODULE_0__[\"MediaPlayer\"])().create();\r\n  player.initialize(document.querySelector(\"video\"), url, true);\r\n}\n\n//# sourceURL=webpack:///./src/index.js?");

/***/ }),

/***/ 0:
/*!****************************!*\
  !*** multi ./src/index.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("module.exports = __webpack_require__(/*! ./src/index.js */\"./src/index.js\");\n\n\n//# sourceURL=webpack:///multi_./src/index.js?");

/***/ })

/******/ });