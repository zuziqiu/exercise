 MPEG DASH作为三大流媒体协议之一，诞生的目的是为了统一标准，因此是兼容SmoothStreaming和HLS的，然而协议内容较多，相对复杂，从各自协议的页数对比就能看出。

 

MPD:Media Presentation Description.

    描述整个mpeg dash码流的构成，相当于HLS协议的m3u8文件，MPD是一个XML Document，通过MPD的内容可以构造出用于HTTP GET下载的URL。MPD文件可以被加密，请参考http://www.w3.org/TR/xmlenc-core/，可以使用数字签名和验证，请参考http://www.w3.org/TR/xmldsig-core/。

    注：XML标准是由W3C制定的，关于XML schema：http://www.w3.org/2001/XMLSchema。

 

Mpegdash和HLS，以及Smooth Streaming的对比：

    Smooth Streaming我自己不太了解。mpeg dash试图同时兼容这两种协议，因此显得更为复杂，同时支持TS profile和 ISO profile，支持节目观看等级控制，支持父母锁？mpeg dash支持的DRM类型包括PlayReady和Marlin，而HLS支持的是AES128（密钥长度为128位的高级加密标准Advanced Encryption Standard）加密类型。

 

Period:

    一条完整的mpeg dash码流可能由一个或多个Period构成，每个Period代表某一个时间段。比如某条码流有60秒时间，Period1从0-15秒，Period2从16秒到40秒，Period3从41秒到60秒。同一个Period内，意味着可用的媒体内容及其各个可用码率（Representation）不会发生变更。直播情况下，“可能”需要周期地去服务器更新MPD文件，服务器可能会移除旧的已经过时的Period,或是添加新的Period。新的Period中可能会添加新的可用码率或去掉上一个Period中存在的某些码率(Representation)。

 

Adaptationset:

    一个Period由一个或者多个Adaptationset组成。Adaptationset由一组可供切换的不同码率的码流（Representation)组成，这些码流中可能包含一个（ISO profile)或者多个(TS profile)media content components，因为ISO profile的mp4或者fmp4 segment中通常只含有一个视频或者音频内容，而TS profile中的TS segment同时含有视频和音频内容，当同时含有多个media component content时，每个被复用的media content component将被单独描述。

 

media content component：

    一个media content component表示表示一个不同的音视频内容，比如不同语言的音轨属于不同的media content component,而同一音轨的不同码率（mpeg dash中叫做Representation)属于相同的media content component。如果是TS profile，同一个码率可能包括多个media content components。

 

Representation:

    每个Adaptationset包含了一个或者多个Representations,一个Representation包含一个或者多个media streams，每个media stream对应一个media content component。为了适应不同的网络带宽，dash客户端可能会从一个Representation切换到另外一个Representation，如果不支持某个Representation的编码格式，在切换时可以忽略之。

 

media content component，Representation，media stream的关系：

    一个media content component可包含多个不同的编码版本（Encoded Versions），每一个编码版本都是一个media stream，每个Representation可包含1..N个media stream（TS profile ，在同一个Segment中复用了音频和视频。），每个media stream对应一个不同的media content component。

 

Sub-Representation:

    一个Representation可能包含多个Sub-Representation，这种情况还没遇到过。

 

Segment：

    与HLS协议的segment概念是一样的，每个Representation由一个或者多个segment组成，只由一个segment组成的形式不能应用于网络直播。每个segment由一个对应的URL指定，也可能由相同的URL+不同的byte range指定。dash 客户端可以通过HTTP协议来获取URL（+byte range）对应的分片数据。MPD中描述segment URL的形式有多种，如Segment list，Segment template，Single segment。

 

Initialization Segment：

    Representation的Segments一般都采用1个Init Segment+多个普通Segment的方式，还有一种形式就是Self Initialize Segment，这种形式没有单独的Init Segment，初始化信息包括在了各个Segment中。Init Segment中包含了解封装需要的全部信息，比如Representation中有哪些音视频流，各自的编码格式及参数。对于 ISO profile来说(容器为MP4)，包含了moov box,H264的sps/pps数据等关键信息存放于此（avCc box）。

    另外，同一个Adaptation set的多个Representation还可能共享同一个Init Segment，该种情况下，对于ISO profile来说，诸如stsd box，avCc box等重要的box会含有多个entry，每个entry对应一个Representation，第一个entry对应第一个Representation，第二个entry对应第二个Representation，以此类推。

 

Subsegment:

    Segment可能进一步划分为subsegment，每个subsegment由数个Acess Unit组成，Segment index提供了subsegment相对于Segment的字节范围和presentation time range 。客户端可以先下载Segment index。

 

Subset：

    每个Period可能包含多个Subset，Subset定义 了一个集合，该集合包含1个或者多个AdaptationSet。客户端在播放mpeg dash流时，要求任何时间播放的所有AdaptationSets必须是某个Subset包含的AdaptationSets的一个子集。

 

SAP和无缝切换以及SEEK

    SAP：Stream Acess Point，可以简单理解为I帧，每个Segment的第一个帧都是SAP，因此Seek时可直接Seek到某一个Segment的起始位置，利用Init Segment+Seek到的某个Segment的数据，在解封装后可实现完美解码。一般来说，同一个Adaptation set中的多个Representation是Segment Align的（当Adaptation set的属性@segmentAlignment不为false时），因此，当从Representation A切换到Representation B时，如果当前Representation A的第N个Segment已经下载完成，切换时直接下载Representation B的第N+1个Segment即可。
