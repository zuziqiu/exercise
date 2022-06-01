define(function(require){
    'use strict';
	require("./lame.min");
	
	var _worker = function(e){
		switch(e.cmd){
			case 'init':
				init(e.config);
				break;
			case 'encode':
				encode(e.buf);
				break;
			case 'finish':
				finish();
				break;
		}
	}
			//importScripts('lame.min.js');

		var mp3Encoder, maxSamples = 1152, samplesMono, lame, config, dataBuffer;

		var clearBuffer = function(){
			dataBuffer = [];
		};

		var appendToBuffer = function(mp3Buf){
			dataBuffer.push(new Int8Array(mp3Buf));
		};

		var init = function(prefConfig){
			config = prefConfig || {};
			lame = new lamejs();
			mp3Encoder = new lame.Mp3Encoder(1, config.sampleRate || 44100, config.bitRate || 128);
			clearBuffer();
			config.callback({
				cmd: 'init'
			});
		};

		var floatTo16BitPCM = function(input, output){
			for(var i = 0; i < input.length; i++){
				var s = Math.max(-1, Math.min(1, input[i]));
				output[i] = (s < 0 ? s * 0x8000 : s * 0x7FFF);
			}
		};

		var convertBuffer = function(arrayBuffer){
			var data = new Float32Array(arrayBuffer);
			var out = new Int16Array(arrayBuffer.length);
			floatTo16BitPCM(data, out);
			return out;
		};

		var encode = function(arrayBuffer){
			samplesMono = convertBuffer(arrayBuffer);
			var remaining = samplesMono.length;
			for(var i = 0; remaining >= 0; i += maxSamples){
				var left = samplesMono.subarray(i, i + maxSamples);
				var mp3buf = mp3Encoder.encodeBuffer(left);
				appendToBuffer(mp3buf);
				remaining -= maxSamples;
			}
		};

		var finish = function(){
			appendToBuffer(mp3Encoder.flush());
			config.callback({
				cmd: 'end',
				buf: dataBuffer
			});
			clearBuffer();
		};
	
	return _worker;
});
