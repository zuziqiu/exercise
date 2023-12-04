    <script type="text/javascript">  
            var fileMd5;  
            //监听分块上传过程中的三个时间点  
            WebUploader.Uploader.register({  
                "before-send-file":"beforeSendFile",  
                "before-send":"beforeSend",  
                "after-send-file":"afterSendFile",  
            },{  
                //时间点1：所有分块进行上传之前调用此函数  
                beforeSendFile:function(file){  
                    var deferred = WebUploader.Deferred();  
                    //1、计算文件的唯一标记，用于断点续传  
                    (new WebUploader.Uploader()).md5File(file,0,10*1024*1024)  
                        .progress(function(percentage){  
                            $('#item1').find("p.state").text("正在读取文件信息...");  
                        })  
                        .then(function(val){  
                            fileMd5=val;  
                            $('#item1').find("p.state").text("成功获取文件信息...");  
                            //获取文件信息后进入下一步  
                            deferred.resolve();  
                        });  
                    return deferred.promise();  
                },  
                //时间点2：如果有分块上传，则每个分块上传之前调用此函数  
                beforeSend:function(block){  
                    var deferred = WebUploader.Deferred();  
                      
                    $.ajax({  
                        type:"POST",  
                        url:"<%=basePath%>Video?action=checkChunk",  
                        data:{  
                            //文件唯一标记  
                            fileMd5:fileMd5,  
                            //当前分块下标  
                            chunk:block.chunk,  
                            //当前分块大小  
                            chunkSize:block.end-block.start  
                        },  
                        dataType:"json",  
                        success:function(response){  
                            if(response.ifExist){  
                                //分块存在，跳过  
                                deferred.reject();  
                            }else{  
                                //分块不存在或不完整，重新发送该分块内容  
                                deferred.resolve();  
                            }  
                        }  
                    });  
                      
                    this.owner.options.formData.fileMd5 = fileMd5;  
                    deferred.resolve();  
                    return deferred.promise();  
                },  
                //时间点3：所有分块上传成功后调用此函数  
                afterSendFile:function(){  
                    //如果分块上传成功，则通知后台合并分块  
                    $.ajax({  
                        type:"POST",  
                        url:"<%=basePath%>Video?action=mergeChunks",  
                        data:{  
                            fileMd5:fileMd5,  
                        },  
                        success:function(response){  
                            alert("上传成功");  
                            var path = "uploads/"+fileMd5+".mp4";  
                            $("#item1").attr("src",path);  
                        }  
                    });  
                }  
            });  
              
            var uploader = WebUploader.create({  
                // swf文件路径  
                swf: '<%=basePath%>scripts/webuploader-0.1.5/Uploader.swf',  
                // 文件接收服务端。  
                server: '<%=basePath%>UploadVideo',  
                // 选择文件的按钮。可选。  
                // 内部根据当前运行是创建，可能是input元素，也可能是flash.  
                pick: {id: '#add_video',   <span style="background-color: rgb(255, 204, 0);">//这个id是你要点击上传文件的id，自己设置就好</span>  
                multiple:false},  
                // 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！  
                resize: true,  
                auto:true,  
                //开启分片上传  
                chunked: true,  
                chunkSize:10*1024*1024,  
                  
                accept: {  
                //限制上传文件为MP4  
                    extensions: 'mp4',  
                    mimeTypes: 'video/mp4',  
                }  
            });  
                      
            // 当有文件被添加进队列的时候  
            uploader.on( 'fileQueued', function( file ) {  
                  
                $('#item1').empty();  
                $('#item1').html('<div id="' + file.id + '" class="item">'+  
                    '<a class="upbtn" id="btn" onclick="stop()">[取消上传]</a>'+  
                    '<p class="info">' + file.name + '</p>' +  
                    '<p class="state">等待上传...</p></div>'  
                );  
            });  
              
            // 文件上传过程中创建进度条实时显示。  
            uploader.on( 'uploadProgress', function( file, percentage ) {  
                $('#item1').find('p.state').text('上传中 '+Math.round(percentage * 100) + '%');  
            });  
              
            uploader.on( 'uploadSuccess', function( file ) {  
                $( '#'+file.id ).find('p.state').text('已上传');  
            });  
              
            uploader.on( 'uploadError', function( file ) {  
                $( '#'+file.id ).find('p.state').text('上传出错');  
            });  
              
            uploader.on( 'uploadComplete', function( file ) {  
                $( '#'+file.id ).find('.progress').fadeOut();  
            });  
            
            function start(){  
                uploader.upload();  
                $('#btn').attr("onclick","stop()");  
                $('#btn').text("取消上传");  
            }  
              
            function stop(){  
                uploader.stop(true);  
                $('#btn').attr("onclick","start()");  
                $('#btn').text("继续上传");  
            }  
              
        </script>  