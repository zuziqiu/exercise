//鐧惧害缁熻
var _hmt = _hmt || [];
(function() {
	var hm = document.createElement("script");
	hm.src = "//hm.baidu.com/hm.js?33e18e31d25f8b4c111f643cbbf4f1fe";
	var s = document.getElementsByTagName("script")[0];
	s.parentNode.insertBefore(hm, s);
})();

$(function(){

	$(document).on("beforePageSwitch", function(e, pageId, $page) {
		$.closeModal();
		$(".picker").picker("close");
		$.hideIndicator();
	});

	//鎴戠殑閽卞寘鍒濆鍖�
	$(document).on("pageInit", "#wallet", function(e, pageId, $page) {

		//deposits
		var numberUp = setInterval(function () {
			var num = parseInt($('.deposits-val  > span').text());
			if (num < deposits) {
				$('.deposits-val  > span').text(num + 20);
			} else {
				$('.deposits-val  > span').text(formatMoney(deposits, 2));
				clearInterval(numberUp);
			}
		}, 5);

		var $content = $page.find(".content").on('refresh', function(event) {

			var wecha_token = $('#wecha_token').val();
			var wecha_id = $('#wecha_id').val();
			$.get('/index.php',
				{'g':'Wap', 'm':'Ychcard', 'a':'lg_value', 'token':wecha_token, 'wecha_id':wecha_id},
				function (response){
					response =  JSON.parse(response);
					if(response.status == 1){
						var ticketNum, deposit, token, colorTicket, integral, gold;

						ticketNum	= 0;
						deposit		= 0.0;
						token 		= 0;
						colorTicket = 0;
						integral 	= 0;
						gold 		= 0;
						//濂楃エ鏁�
						ticketNum = response.data.PackageTicketValues;
						for(row in response.data.rows){

							if(response.data.rows[row].ValueCode == 402){
								token = formatMoney(response.data.rows[row].Value, 0);
							}else if(response.data.rows[row].ValueCode == 1){
								deposit = formatMoney(response.data.rows[row].Value, 2);
							}else if(response.data.rows[row].ValueCode == 403){
								colorTicket = formatMoney(response.data.rows[row].Value, 0);
							}else if(response.data.rows[row].ValueCode == 3){
								integral = formatMoney(response.data.rows[row].Value, 0);
							}else if(response.data.rows[row].ValueCode == 401){
								gold = formatMoney(response.data.rows[row].Value, 0);
							}

							$('#packages > span:first-child').html(ticketNum);
							$('#color-ticket > span:first-child').html(colorTicket);
							$('#token > span:first-child').html(token);
							$('#integral > span:first-child').html(integral);
							$('#gold > span:first-child').html(gold);

							$('.deposits-val > span').html(deposit);
						}
					}else{
						$.toast("鍒锋柊澶辫触!");
					}
				// 鍔犺浇瀹屾瘯闇€瑕侀噸缃�
				$.pullToRefreshDone($content);
			});

		});

	});

	//浠ｅ竵鍒濆鍖�
	$(document).on("pageInit", "#token", function(e, pageId, $page) {
		//棰勮閲戦妗嗙偣鍑�
		$('#token .col-33').unbind('click').bind('click',  function(){
			//娣诲姞宸查€夋嫨鏍峰紡
			$(this).addClass('selected');
			$(this).siblings().removeClass('selected');

			$('#token .full span').text($(this).children().eq(0).text());

			//婵€娲绘敮浠樻寜閽苟娣诲姞閫変腑閲戦
			tokenChangePayBtnstatus(true, $(this));

		});

		$('#token .pay').unbind('click').bind('click', function(){
			var payHref = $(this).attr('pay-href');

			if(payHref){
				$.showIndicator();
				$.get(payHref, '', function(data){
					data = JSON.parse(data);
					if(data.status){
						$.toast(data.info);
						setTimeout(function(){
							$.router.load(data.url, true);
						}, 2000);

						setTimeout(function(){
							$.hideIndicator();
						}, 2100);
					}else{
						$.hideIndicator();
						$.alert(data.info);
					}
				});
			}
		})

		//淇敼鏀粯鎸夐挳鏀粯鐘舵€�
		function tokenChangePayBtnstatus(status, obj){

			if (status) {
				var price, goodsId, businessId, wechat_id, wechat_token, url, parameters;

				price = $(obj).attr('_price');
				goodsId = $(obj).attr('_goodsId');
				businessId = $(obj).attr('_businessId');
				wechat_id = $('#wechat-id').val();
				wechat_token = $('#wechat-token').val();

				parameters = [
					'g=Wap',
					'm=Ychcard',
					'a=pay',
					'token=' + wechat_token,
					'wecha_id=' + wechat_id,
					'goodsId=' + goodsId,
					'businessID=' + businessId,
					'price=' + price,
					'goodstype=101',
					'total=1'
				];

				parametersStr = parameters.join('&');

				url = '/index.php?' + parametersStr;

				$('.button-group > p:first-child > a').attr('pay-href', url).css('background-color', '#00ccff');
				$('.button-group > p:first-child > a').html('绔嬪嵆鏀粯: 锟�' + price);
			}else {
				$('.button-group > p:first-child > a').attr('pay-href', '').css('background-color', '#dedede');
				$('.button-group > p:first-child > a').html('绔嬪嵆鏀粯');
			}

		}



	});

	//杞处鍒濆鍖�
	$(document).on("pageInit", "#transfer", function(e, pageId, $page) {
		//鍒ゆ柇杈撳叆妗嗘槸鍚︿负绌猴紝鑰屾敼鍙樻寜閽殑鐘舵€�
		$('#number').bind('keyup', function(){
			var number = $('#number').val();
			if (number != 0 && number != '') {
				$('.button').css('background-color', '#00ccff');
				$('.button').attr('href', $('.button').attr('jump_href'))
			}else{
				$('.button').css('background-color', '#dedede');
				$('.button').attr('href', 'javascript:;');

			}
		});

	});

	//涓汉璧勬枡鍒濆鍖�
	$(document).on("pageInit", "#personal-data", function(e, pageId, $page) {

		//鎬у埆閫夋嫨
		$('#sex').unbind('click').bind('click', function () {
			var sexBtn = [
				{
					text: '璇烽€夋嫨',
					label: true
				},
				{
					text: '鐢�',
					onClick: function() {
						$('#sex > .item-inner > .item-after').html('鐢�').attr('_value', 1);
					}
				},
				{
					text: '濂�',
					onClick: function() {
						$('#sex > .item-inner > .item-after').html('濂�').attr('_value', 0);
					}
				}
			];

			var cancle = [
				{
					text: '鍙栨秷',
					color: "danger"
				}
			]

			var sexGroups = [sexBtn, cancle];
			//璋冪敤鎿嶄綔琛�
			$.actions(sexGroups);
		});

		//涓婁紶澶村儚
		$('#upload-img').unbind('click').bind('click', function(){
			uploadImg('compressed', 'album');
		});

		$('#personal-data .pull-right').unbind('click').bind('click', function(){

			var userName = $('#name .item-after').text();
			var userSex  = $('#sex .item-after').attr('_value');
			var date     = $('#date input').val();

			if(!userName){
				$.toast("鏄电О涓嶈兘涓虹┖");
				return;
			}

			if(!userSex){
				$.toast("鎬у埆涓嶈兘涓虹┖");
				return;
			}
			if(!date){
				$.toast("鐢熸棩鏃ユ湡涓嶈兘涓虹┖");
				return;
			}

			var url = window.location.href;
			$.showIndicator();
			$.post(url, {'sex':userSex, 'truename':userName, 'birthday':date},function(data){
				$.hideIndicator();

				data = JSON.parse(data);

				if(data.status){
					$.toast("淇濆瓨鎴愬姛");
				}else{
					$.toast(data.info);
				}


			});

		})

		//鐐瑰嚮閬僵灞傚叧闂搷浣滆〃
		$('#personal-data').on('click', '.modal-overlay', function(){
			$.closeModal('.actions-modal');
		});

		$("#birthday").unbind().calendar({
			maxDate: new Date()
		});

		//鎬у埆閫夋嫨
		$('#signOut').unbind('click').bind('click', function () {
			var outBtn = [
				{
					text: '閫€鍑哄悗涓嶄細鍒犻櫎鍘嗗彶鏁版嵁,涓嬫鐧诲綍渚濈劧鍙互浣跨敤鏈处鍙枫€�',
					label: true
				},
				{
					text: '閫€鍑虹櫥褰�',
					onClick: function() {
						$.showIndicator();
						$.post(signOutUrl, {}, function(data){
							$.hideIndicator();
							data = JSON.parse(data);
							if(data.status == 1){
								$.router.load(data.url, true);
							}
						});
					}
				},
			];

			var cancle = [
				{
					text: '鍙栨秷',
					color: "danger"
				}
			]

			var outGroups = [outBtn, cancle];
			//璋冪敤鎿嶄綔琛�
			$.actions(outGroups);
		});

	});

	//濂楃エ鍒楄〃鍒濆鍖�
	$(document).on("pageInit", "#packages-list", function(e, pageId, $page) {

		//鍒ゆ柇鏄惁鐐瑰嚮浜嗗姞鍑忓彿鎸夐挳
		var isClickBtn = false;

		//鐐瑰嚮鍔犲噺鍙蜂箣鍚庣殑杩愮畻鏂规硶
		//type 1:鍔  2锛氬噺锛� number: 闇€瑕佽繍绠楃殑鏁�
		//obj 鐐瑰嚮鐨勫璞�
		function sum(type, obj){
			var total, price, number, totalNumber;
			//鍟嗗搧鍗曚环
			price = parseFloat($(obj).parent().prev().attr('_data'));
			//鎬讳环鏍�
			total = parseFloat($('#total-price').attr('_total'));
			totalNumber = parseFloat($('#total-price').attr('_number'));
			isClickBtn = true;

			//鍒ゆ柇鏄惁涓烘暟瀛�
			//if (!(!!total)) return;

			//鍒ゆ柇绫诲瀷
			if (type == 1) {
				//褰撳墠鍟嗗搧鏁伴噺
				number = parseFloat($(obj).prev().html());
				number++;
				totalNumber++;
				//鏀瑰彉璐拱涓暟
				$(obj).prev().html(number);
				total += price;
			}else if(type == 2){
				//褰撳墠鍟嗗搧鏁伴噺
				number = parseFloat($(obj).next().html());
				//鍒ゆ柇鏁伴噺-1鍚庢槸鍚﹀皬涓庣瓑浜�0
				number = (--number) >= 0 ? number : 0;
				totalNumber = (--totalNumber) >= 0 ? totalNumber : 0;
				$(obj).next().html(number);

				total -= price;
				//鑻ユ€绘暟閲忎负0鏃讹紝鐩存帴杩斿洖
				if (totalNumber < 0 || total < 0) return;
			}else{//涓婅堪涓ょ鎯呭喌閮戒笉鏄�
				return;
			}
			//鏀瑰彉鍟嗗搧鏍规爣绛剧殑鏁伴噺璁℃暟
			$(obj).parents('.item-link').attr('_number', number);

			if (totalNumber > 0) {
				$('#total-price').html('<span>锟�</span>' + total.toFixed(2));
				$('#total-price').removeClass('default');
				$('#payBtn').removeClass('disabled');
				$('#payBtn').attr('disabled', '');
			}else{
				$('#total-price').html('璇烽€夋嫨');
				$('#total-price').addClass('default');
				$('#payBtn').addClass('disabled');
				$('#payBtn').attr('disabled', 'disabled');
			}

			$('#total-price').attr('_total', total.toFixed(2));
			$('#total-price').attr('_number', totalNumber);
		}


		$('#payBtn').unbind('click').bind('click', function(){
			$.showIndicator();
			if ($(this).attr("disabled") != 'disabled'){
				var payHref, ticketItems, jsonStr, itemArr, totalPrice;
				//鏀粯閾炬帴
				payHref = $(this).attr('pay-href');
				//濂楃エ瀵硅薄鏁扮粍
				ticketItems = $('li > div');
				//鎬讳环鏍�
				totalPrice = $('#total-price').attr('_total');
				//瀹氫箟涓€涓狫SON瀵硅薄
				jsonStr = {};

				ticketItems.each(function(index,e){
					var number = $(e).attr('_number');
					if (number > 0){
						jsonStr[$(e).attr('_goodsid')] = number;
					}
				});

				$.post(payHref+'&price='+totalPrice,{'goodsId':JSON.stringify(jsonStr)}, function(data){
					data = JSON.parse(data);
					if(data.status){
						$.toast(data.info);
						setTimeout(function(){
							$.router.load(data.url, true);
						}, 2000);

						setTimeout(function(){
							$.hideIndicator();
						}, 2100);
					}else{
						$.hideIndicator();
						$.alert(data.info);
					}



				});

				//postForm(payHref+'&price='+totalPrice, {'goodsId':JSON.stringify(jsonStr)});
			}

		});

		//鐐瑰嚮鍔犲彿浜嬩欢
		$('#packages-list .add').unbind('click').bind('click', function(){

			sum(1, this);
		});

		//鐐瑰嚮鍑忓彿浜嬩欢
		$('#packages-list .cut').unbind('click').bind('click', function(){

			sum(2, this);
		});

		$('.item-link').unbind('click').bind('click', function(){
			//闃叉鐐瑰嚮绌块€忛棶棰�
			if (isClickBtn) {
				isClickBtn = false;
				return;
			}

			$.router.load($(this).attr('_href'), true);
		});


	});

	//濂楃エ璇︽儏鍒濆鍖�
	$(document).on("pageInit", "#packages-detail", function(e, pageId, $page) {

		//鍔犲彿鐐瑰嚮
		$('#packages-detail #add').unbind('click').bind('click', function(){
			var number = parseFloat($(this).next().html()) + 1;
			var total = parseFloat($('#prics').attr('_prics')) * number;

			$(this).next().html(number);
			$('#total-price').attr('_total',total.toFixed(2));
			$('#total-price > span:last-child').html(total.toFixed(2));
		});
		//鍑忓彿鐐瑰嚮
		$('#packages-detail #cut').unbind('click').bind('click', function(){
			var number = parseFloat($(this).prev().html());
			var total = parseFloat($('#prics').attr('_prics')) ;

			if (number > 1) {
				number -= 1;
				$(this).prev().html(number);
				$('#total-price').attr('_total',(total * number).toFixed(2));
				$('#total-price > span:last-child').html((total * number).toFixed(2));
			}

		});

		$('#button').unbind('click').bind('click', function(){
			var payHtml, price, total;
			$.showIndicator();
			payHtml = $(this).attr('_href');
			price 	= $('#total-price').attr('_total');
			total	= $('.number').html();

			$.get(payHtml, {'total':total, 'price':price}, function(data){
				data = JSON.parse(data);

				if(data.status){
					$.toast(data.info);
					setTimeout(function(){
						$.router.load(data.url, true);
					}, 2000);

					setTimeout(function(){
						$.router.load(data.url, true);
					}, 2100);
				}else{
					$.hideIndicator();
					$.alert(data.info);
				}
			});

		});



	});

	//鍏戞崲鍒楄〃鍒濆鍖�
	$(document).on("pageInit", "#exchange-list", function(e, pageId, $page) {
		//鏌ヨ鍌ㄥ€煎悕绉板埆鍚�
		var alias = valueAlias();

		$.attachInfiniteScroll($('#tab1'));

		//鏍囩浠ヤ笅鐨勫睆骞曢珮搴�
		var tabContentHeight = $('#tab-content').height();
		//涓€涓猧tem鐨勯珮搴�
		var liHeight = $('#tab1 li:first-child').height();

		//璁＄畻绗竴涓鏍囩椤靛唴瀹圭殑楂樺害, 鍑忓幓20鏄洜涓鸿竟绾跨殑宸€肩殑澶ф鍊�
		if ((liHeight * $('#tab1').find('li').length) < (tabContentHeight - 20)) {
			$.detachInfiniteScroll($('#tab1'));
			$('#tab1').find('.infinite-scroll-preloader').hide();
		}

		//澶氫釜鏍囩椤典笅鐨勬棤闄愭粴鍔�
		var loading = false;
		//椤电爜
		var pageIndex = 0;
		//鎺掑簭瀛楁
		var IsLotteryTicketAsc = '';
		var IsPointsAsc = '';
		var IsTimeAsc = '';
		//鍒嗙被
		var giftCategory = '';

		$page.on('infinite', function() {

			// 濡傛灉姝ｅ湪鍔犺浇锛屽垯閫€鍑�
			if (loading) return;
			//鑾峰彇瑙﹀彂鍔犺浇浜嬩欢tab 鐨処D
			var tabID = $(this).find('.infinite-scroll.active').attr('id');
			var tabIndex = 0;
			if(tabID == "tab1"){
				tabIndex = 0;
				IsLotteryTicketAsc = 'ASC';
				IsPointsAsc = null;
				IsTimeAsc = null;
				giftCategory = null;
			}
			if(tabID == "tab2"){
				tabIndex = 1;
				IsLotteryTicketAsc = null;
				IsPointsAsc = 'ASC';
				IsTimeAsc = null;
				giftCategory = null;
			}
			if(tabID == "tab3"){
				tabIndex = 2;
				IsLotteryTicketAsc = null;
				IsPointsAsc = null;
				IsTimeAsc = 'ASC';
				giftCategory = null;
			}

			////鑾峰彇#tabContent 鐨勯珮搴︼紝鐢ㄤ綔璺熷綋鍓嶆爣绛鹃〉鍐呭鐨勯珮搴︿綔瀵规瘮
			//var tabContentHeight = $('#tab-content').height();
			//console.log(tabContentHeight);
			//if ($('#' + tabID).height() < tabContentHeight) {
			//	console.log(1);
			//	$('.infinite-scroll-preloader').eq(tabIndex).hide();
			//	return;
			//}else{
			//	console.log(2);
			//	$('.infinite-scroll-preloader').eq(tabIndex).show();
			//}
			// 璁剧疆flag
			loading = true;

			var pageIndex = parseInt($('.list-container').eq(tabIndex).attr('page')) + 1;
			$('.list-container').eq(tabIndex).attr('page', pageIndex);

			$.get(getGiftUrl, {'PageIndex':pageIndex, 'IsLotteryTicketAsc':IsLotteryTicketAsc, 'IsPointsAsc':IsPointsAsc, 'IsTimeAsc':IsTimeAsc, 'GiftClass':giftCategory}, function(data){
				data = JSON.parse(data);
				//閲嶇疆鍔犺浇flag
				loading = false;

				if(!data){
					pageIndex--;
					$('.list-container').eq(tabIndex).attr('page', pageIndex);
					$.toast("鍔犺浇澶辫触");
					return;
				}else if(!data.List.length){
					$.toast("娌℃湁鏇村");
					////鍒犻櫎鏃犻檺婊氬姩鍔犺浇浜嬩欢
					$.detachInfiniteScroll($('.infinite-scroll').eq(tabIndex));
					$('.infinite-scroll-preloader').eq(tabIndex).html('娌℃湁鏇村');
					return;
				}
				//鎷兼帴HTML
				addExchangeItems('add', data);

				$.refreshScroller();
			});

		});

		//tab3 鏍囩鐐瑰嚮鍔犺浇鍟嗗搧
		$('.col-33').unbind('click').bind('click',function () {
			$.showIndicator();

			$('.list-container').eq(2).attr('page',0);

			//鑾峰彇鐐瑰嚮鐨勫垎绫籌D
			var cateId = $(this).attr('cate-id');
			//淇濆瓨ID
			$('#tab3').attr('cate-id', cateId);

			$.get(getGiftUrl, {'GiftClass':cateId, 'PageIndex':pageIndex}, function(data){
				if(data){
					data = JSON.parse(data);
					if(data.List.length == 0){
						var robotHtml = robot('鏆傛棤姝ょ被鍟嗗搧');
						$('.list-container').eq(2).html(robotHtml);
						$('.infinite-scroll-preloader').eq(2).hide();
					}else{
						//鏍囩椤靛鍣ㄧ殑楂樺害
						var tabContentH = $('#tab-content').height();
						var listH = $('#tab3 .content-block').height();
						addExchangeItems('update', data);
						if(listH > tabContentH) {
							$('.infinite-scroll-preloader').eq(2).html('<div class="preloader"></div>');

							$.attachInfiniteScroll($('#tab3'));
							$('.infinite-scroll-preloader').eq(2).show();
						}
					}
				}else{
					$.toast("鍔犺浇澶辫触");
				}
				$.hideIndicator();
			})

		});

		$('.tab-link').unbind('click').bind('click', function(){
			var tabId = $(this).attr('href');

			if ((liHeight * $(tabId).find('li').length) < (tabContentHeight - 20)) {
				$.detachInfiniteScroll($(tabId));
				$(tabId).find('.infinite-scroll-preloader').hide();
			}

			//绛涢€夌殑tab椤电壒娈婂鐞�
			if (tabId == '#tab3'){

				if($(tabId).find('.list-container').html().replace(/\s+/g,"")){
					if($(tabId).find('.preloader').length){
						$.attachInfiniteScroll($(tabId));
					}
				}
				$.detachInfiniteScroll($(tabId));
				return;
			}

			if($(tabId).find('.preloader').length){
				$.attachInfiniteScroll($(tabId));
			}

		})

		function addExchangeItems(method, data) {
			// 鐢熸垚鏂版潯鐩殑HTML
			var html = '';
			for (var i = 0; i < data.List.length; i++) {
				if (data.List[i].ExchangeValuePrice1 || data.List[i].ExchangeValuePrice2) {
					html += '<li><a href="' + giftDetail + '&giftID=' + data.List[i].ID + '" class="item-link item-content"><div class="item-media">';
					if (data.List[i].S_Photo) {
						html += '<img class="ui-border-radius" src="data:image/jpg;base64, ' + data.List[i].S_Photo + '" style="width: 4rem;">\
							  </div>';
					} else {
						html += '<img class="ui-border-radius" src="/tpl/static/weilin/img/gift-default.png" style="width: 4rem;">\
							  </div>';
					}
					html += '<div class="item-inner">\
							<div class="item-title-row">\
							  <div class="item-title">' + data.List[i].GoodName + '</div>\
							</div>';
					if (data.List[i].ExchangeValuePrice1) {
						html += '<div class="item-subtitle integral">绉垎锛�' + data.List[i].ExchangeValuePrice1 + '</div>';
					} else {
						html += '<div class="item-subtitle integral line-through">绉垎锛�' + data.List[i].ExchangeValuePrice1 + '</div>';
					}
					if (data.List[i].ExchangeValuePrice2) {
						html += '<div class="item-subtitle color-tiket">' + alias.caipiao + '锛�' + data.List[i].ExchangeValuePrice2 + '</div>';
					} else {
						html += '<div class="item-subtitle color-tiket line-through">' + alias.caipiao + '锛�' + data.List[i].ExchangeValuePrice2 + '</div>';
					}

					html += '</div></a></li>';
				}
			}

			if (method == 'add') {
				// 娣诲姞鏂版潯鐩�
				$('.infinite-scroll.active .list-container').append(html);
			}else if(method == 'update'){
				// 鏇存柊鏉＄洰
				$('.infinite-scroll.active .list-container').html(html);
			}
		}


	});

	//鍏戞崲绀煎搧璇︽儏鍒濆鍖�
	$(document).on("pageInit", "#exchange-detail", function(e, pageId, $page) {
		$(".swiper-container").swiper({
			autoplay: 0,//鍙€夐€夐」锛岃嚜鍔ㄦ粦鍔�
		});
	});

	//鍏戞崲绀煎搧纭鍒濆鍖�
	$(document).on("pageInit", "#confirm-exchange", function(e, pageId, $page) {

		var alias = valueAlias();

		//鏍规嵁鍏戞崲鏂瑰紡璁＄畻鍑轰笉鍚岀殑鎬讳环
		//exchangeType 1:绉垎 2:褰╃エ
		function sum(){
			var exchangeType = $('#exchange-way').attr('_type');
			//鍏戞崲鐨勬€绘暟
			var total = $('#total span').html();

			//鑾峰彇琚€変腑閰嶉€佹柟寮忕殑璐圭敤锛屽苟寮哄埗瑁呮崲鎴恑nt
			var wayPrice = 0; //parseInt($(obj).attr("_data"));
			if ($('#post').parent().attr('_selected') == 2) {
				if (exchangeType == 1) {
					wayPrice = $('#post').attr('_data-integral');
				}else if (exchangeType == 2) {
					wayPrice = $('#post').attr('_data-color-ticket');
				}
			}

			//绀煎搧鐨勫崟浠�
			var price = 0;
			if(exchangeType == 1){
				price = $('.integral span').html();
			}else if(exchangeType == 2){
				price = $('.color-tiket span').html();
			}
			//璁＄畻鍚庣殑鎬讳环
			$('#total-price span').first().html(parseInt(price) * parseInt(total) + parseInt(wayPrice));
		}
		//鍔犲彿
		$('#add').unbind('click').bind('click', function(){

			$('#total > span').html(parseInt($('#total > span').html()) + 1);
			$('.number').html(parseInt($('.number').html()) + 1);

			sum();
		});

		//鍑忓彿
		$('#cut').unbind('click').bind('click', function(){
			//鑾峰彇鍑忎箣鍓嶆暟閲�
			var total = parseInt($('.number').html());
			//鍏戞崲鐨勬暟閲忎笉鑳藉皯浜�1涓�
			if (total == 1) return;

			$('#total > span').html(parseInt($('#total > span').html()) - 1);
			$('.number').html($('.number').html() - 1)

			sum();
		});

		//淇敼
		$('#exchange-way').unbind('click').bind('click', function(){
			//鍏戞崲鏂瑰紡
			var exchangeType = $(this).attr('_type');
			//鍏戞崲鎵€闇€绉垎鏁伴噺
			var integral = $('.integral > span').text();
			//鍏戞崲鎵€闇€褰╃エ鏁伴噺
			var colorTiket = $('.color-tiket > span').text();
			//閫夋嫨鎸夐挳缁�
			var buttons1 = [
				{
					text: '璇烽€夋嫨',
					label: true
				}
			];

			//鍒ゆ柇绉垎鏄惁涓�0,鑻ヤ负0鍒欎笉鏄剧ず绉垎鎸夐挳
			if(integral != '0'){
				buttons1.push({
						text: '绉垎',
						onClick: function() {//鐐瑰嚮鍥炶皟鏂规硶
							if (exchangeType == 1) return;	//濡傛灉閫夋嫨鍚屾牱鐨勫厬鎹㈡柟寮忕洿鎺ヨ繑鍥�
							//淇敼鍏戞崲鏂瑰紡
							$('#exchange-way').attr('_type', '1');
							//鑾峰彇鍏戞崲绀煎搧鎵€闇€绉垎鏁伴噺
							var postPrice = $('#post').attr('_data-integral');
							//淇敼瀵瑰簲鐨勫€�
							$('#exchange-way .item-after').html('绉垎');
							$('#post-price span').html(postPrice + '绉垎');
							$('#total-price span').last().html('绉垎');
							//閲嶆柊璁＄畻鎬昏垂鐢�
							sum();
						}
					}
				)
			}
			//鍒ゆ柇褰╃エ鏄惁涓�0,鑻ヤ负0鍒欎笉鏄剧ず褰╃エ鎸夐挳
			if(colorTiket != '0'){
				buttons1.push({
					text: alias.caipiao,
					onClick: function() {
						if (exchangeType == 2) return;

						$('#exchange-way').attr('_type', '2');

						var postPrice = $('#post').attr('_data-color-ticket');

						$('#exchange-way .item-after').html(alias.caipiao);
						$('#post-price span').html(postPrice + alias.caipiao);
						$('#total-price span').last().html(alias.caipiao);

						sum();
					}
				});
			}

			var cancle = [
				{
					text: '鍙栨秷',
					color: 'danger'
				}
			]

			var groups = [buttons1, cancle];
			$.actions(groups);
		});

		//鎻愪氦鍏戞崲淇℃伅
		$('#confirm-exchange .exchange-submit').unbind('click').bind('click', function(){
			//鍏戞崲鏂瑰紡
			var exchangeType = $('#exchange-way').attr('_type');
			//閰嶉€佹柟寮�
			var logisticsId = $('#delivery').attr("logistics-id");
			//鍦板潃ID
			var addressId = $('#address').attr("address-id");
			//鍏戞崲鏂瑰紡鐮�
			var payValueType = exchangeType == 1 ? '3' : '403';
			//鍏戞崲涓暟
			var number = $('.number').text();
			var way	= $('[name="way"]:checked').val();

			if(!addressId && way != 1){
				$.toast('璇烽€夋嫨鏀惰揣鍦板潃');
				return;
			}

			submitUrl += '&logisticsTypeID=' + logisticsId + '&receiveAddressID=' + addressId + '&giftNumber=' + number + '&payValueType=' + payValueType;
			$.showIndicator();
			$.get(
				submitUrl,
				{
					'logisticsTypeID':logisticsId,
					'receiveAddressID':addressId,
					'giftNumber':number,
					'payValueType':payValueType,
				},
				function(data){
					data = JSON.parse(data);
					if(data.status){
						$.toast("鍏戞崲鎴愬姛,鑷姩杩斿洖");
						setTimeout(function(){
							$.router.load(ticketDetail);
						}
						, 2000);

						setTimeout(function(){
							$.hideIndicator();
						}, 2100);
					}else{
						$.hideIndicator();
						$.toast(data.msg);
					}
				}
			);
		});

		//閰嶉€佹柟寮忛€変腑浜嬩欢
		$('.popup li').unbind('click').bind('click', function(){
			//鑾峰彇涔嬪墠琚€変腑鐨勭被鍨婭D
			var beforeType = $(this).parent().attr('_selected');
			//鑾峰彇琚€変腑鐨勭被鍨�
			var currentType = $(this).attr("_type");
			//閰嶉€佹柟寮忕殑ID
			var logisticsId = $(this).attr("logistics-id");
			//濡傛灉鍓嶅悗涓よ€呯浉鍚岋紝涓嶅啀鎵ц
			if (beforeType == currentType) {
				$.closeModal('.popup');
				return;
			}
			//淇敼瀛樻斁閰嶉€佹柟寮廔D鐨勫睘鎬�
			$(this).parent().attr('_selected', currentType);

			$("#delivery").attr("logistics-id", logisticsId);

			$('#way'+currentType).attr('checked', true);
			$('#way'+beforeType).attr('checked', false);
			var way = currentType == 1 ? '鑷彇' : '閭瘎';

			$('#delivery .item-after').html(way);

			sum();
			//鍏抽棴popup绐�
			$.closeModal('.popup');
		});

		//鐐瑰嚮閬僵灞傚叧闂璦ction modal
		$('#exchange-way').on('click', '.modal-overlay',  function(){
			$.closeModal('.actions-modal');
		});


		//寮瑰嚭popup绐楅厤閫佹柟寮�
		$("#confirm-exchange").on('click', '#delivery', function(){
			$.popup('.popup');
		});

		//閬僵灞傜偣鍑讳簨浠�
		$('#exchange-way').on('click', '.popup-overlay', function(){
			$.closeModal('.popup');
		});
	});

	//璐﹀崟椤靛垵濮嬪寲
	$(document).on("pageInit", "#bill-query", function(e, pageId, $page) {
		var activeID;
		//鑾峰彇url鐨刟ctive鍙傛暟
		activeID = getQueryString('active');
		//鍒ゆ柇鍙傛暟鏄惁涓虹┖
		if (activeID) {
			var activeTab = $('#' + activeID);
			var activeContent = $('[href ="#' + activeID + '"]');

			activeTab.addClass('active');
			activeContent.addClass('active');

			activeTab.siblings().removeClass('active');
			activeContent.siblings().removeClass('active');
		}

	});

	//鍦板潃淇敼
	$(document).on("pageInit", "#address-edit", function(e, pageId, $page) {
		//鍒濆鍖栧煄甯傞€夋嫨鍣�
		$page.find("#city-picker").cityPicker({
			toolbarTemplate: '<header class="bar bar-nav">\
	    <button class="button button-link pull-right close-picker">纭畾</button>\
	    <h1 class="title">閫夋嫨鏀惰揣鍦板潃</h1>\
	    </header>'
		});

		$page.find('#city-picker').val('');

		//淇濆瓨
		$page.find('.edit-submit').unbind().bind('click',function(){

			var addressId, 		//鍦板潃ID
				address,		//璇︾粏鍦板潃
				area,			//鍖哄煙
				addressName,	//鏀惰揣浜�
				phone,			//鑱旂郴鐢佃瘽
				url;			//瀹屾暣鐨刄RL

			addressId = $('[name = "addressId"]').val();
			if(addressId){
				return;
			}
			address = $('[name = "address"]').val();
			area = $('[name = "area"]').val();
			addressName = $('[name = "addressname"]').val();
			phone = $('[name = "phone"]').val();
			var reg = new RegExp("^[0-9]{11}$");
			if(!address){
				$.toast("璇︾粏鍦板潃涓嶈兘涓虹┖");
				return;
			}else if(!area){
				$.toast("鍦板尯涓嶈兘涓虹┖");
				return;
			}else if(!addressName){
				$.toast("鏀惰揣浜轰笉鑳戒负绌�");
				return;
			}else if(!reg.test(phone)){
				$.toast("璇疯緭鍏ユ纭殑鑱旂郴鐢佃瘽");
				return;
			}

			url = href + '&addressId=' + addressId
				+ '&address=' + address+ '&area=' + area+ '&addressname=' + addressName+ '&phone=' + phone;

			//location.href = url;
			$.showIndicator();
			$.get(url, {}, function(data){

				if(data == 1){
					$.toast('淇濆瓨鎴愬姛,鑷姩杩斿洖!');
					setTimeout(function(){
						$.router.load(upPage, true);
						$.hideIndicator();
					}, 2000);
				}else{
					$.hideIndicator();
					$.toast('淇濆瓨澶辫触');
				}
			});

		});


	});

	//鍦板潃淇敼
	$(document).on("pageInit", "#address-update", function(e, pageId, $page) {
		//鍒濆鍖栧煄甯傞€夋嫨鍣�
		$page.find("#city-picker").cityPicker({
			toolbarTemplate: '<header class="bar bar-nav">\
	    <button class="button button-link pull-right close-picker">纭畾</button>\
	    <h1 class="title">閫夋嫨鏀惰揣鍦板潃</h1>\
	    </header>'
		});

		//淇濆瓨
		$page.find('.update-submit').unbind().bind('click', function(){
			var addressId, 		//鍦板潃ID
				address,		//璇︾粏鍦板潃
				area,			//鍖哄煙
				addressName,	//鏀惰揣浜�
				phone,			//鑱旂郴鐢佃瘽
				url;			//瀹屾暣鐨刄RL

			addressId = $('[name = "addressId"]').val();
			if(!addressId){
				return;
			}
			address = $('[name = "address"]').val();
			area = $('[name = "area"]').val();
			addressName = $('[name = "addressname"]').val();
			phone = $('[name = "phone"]').val();
			var reg = new RegExp("^[0-9]{11}$");
			if(!address){
				$.toast("璇︾粏鍦板潃涓嶈兘涓虹┖");
				return;
			}else if(!area){
				$.toast("鍦板尯涓嶈兘涓虹┖");
				return;
			}else if(!addressName){
				$.toast("鏀惰揣浜轰笉鑳戒负绌�");
				return;
			}else if(!reg.test(phone)){
				$.toast("璇疯緭鍏ユ纭殑鑱旂郴鐢佃瘽");
				return;
			}

			url = href + '&addressId=' + addressId
				+ '&address=' + address+ '&area=' + area+ '&addressname=' + addressName+ '&phone=' + phone;

			$.showIndicator();
			$.get(url, {}, function(data){
				$.hideIndicator();
				if(data == 1){
					$.toast('淇濆瓨鎴愬姛,鑷姩杩斿洖!');
					setTimeout(function(){
						$.router.load(addressManage, true);
					}, 2000);
				}else{
					$.toast('淇濆瓨澶辫触');
				}
			});

		});

		$page.find('#city-picker').val(area);
	});

	//鍦板潃绠＄悊
	$(document).on("pageInit", "#address-mg", function(e, pageId, $page){
		$(".label-checkbox").bind("click", function(){
			$.showIndicator();
			//鍒ゆ柇褰撳墠琚偣鍑诲崟閫夋鏄惁宸茶閫変腑
			var isChecked = $(this).children('input').attr('checked');

			if(!isChecked){
				var addressId = $(this).children('input').val();

				$.get(setDefaultAddress,{'addressId' : addressId}, function(data){
					data ? $.toast("璁剧疆鎴愬姛") : $.toast("璁剧疆澶辫触");
					$.hideIndicator();
				});
			}
		})
	});

	//绛惧埌
	$(document).on("pageInit", "#sign", function(e, pageId, $page){
		var signFun = function () {

			var $dateBox = $("#js-qiandao-list"),
				$currentDate = $(".current-date"),
				$qiandaoBnt = $("#js-just-qiandao"),
				_html = '',
				_handle = true,
				myDate = new Date();
			$currentDate.text(myDate.getFullYear() + '/' + parseInt(myDate.getMonth() + 1) + '/' + myDate.getDate());

			var monthFirst = new Date(myDate.getFullYear(), parseInt(myDate.getMonth()), 1).getDay();

			var d = new Date(myDate.getFullYear(), parseInt(myDate.getMonth() + 1), 0);
			var totalDay = d.getDate(); //鑾峰彇褰撳墠鏈堢殑澶╂暟

			var remainder = (totalDay % 7) == 0 ? 0 : (7 - (totalDay % 7));

			for (var i = 0; i <= totalDay + remainder; i++) {
				_html += ' <li><div class="qiandao-icon"></div></li>'
			}
			$dateBox.html(_html) //鐢熸垚鏃ュ巻缃戞牸

			var $dateLi = $dateBox.find("li");
			for (var i = 0; i < totalDay; i++) {
				$dateLi.eq(i + monthFirst).append("<span>" + parseInt(i + 1) + "</span>");

			} //鐢熸垚褰撴湀鐨勬棩鍘嗕笖鍚凡绛惧埌

			$(".date" + myDate.getDate()).addClass('able-qiandao');

		}();

		loadLogsData();

		rankingList();

		$('.sign-btn').unbind('click').bind('click',function(){
			var disabled = $(this).attr('disabled');
			if (disabled != 'disabled'){
				signIn();
			}

		})

		$('.tab-page').unbind('click').bind('click',function(){
			var tabPage = $(this).attr('_tab');

			switch (tabPage) {
				case 'ranklist' :
					$('.ranklist').show();
					$('.select').hide();
					$(this).addClass('tab-active');
					$(this).siblings().removeClass('tab-active');

					break;
				case 'select' :
					$('.ranklist').hide();
					$('.select').show();
					if(!$('.select > ul:last-child > div').children().length){
						//鎴愬氨
						mySignInCount();
						//涓汉绛惧埌鏃ュ織
						mySignInLogs();
					}

					$(this).addClass('tab-active');
					$(this).siblings().removeClass('tab-active');
					break;
			}

		});
	})

	//绾㈠寘
	$(document).on("pageInit", "#red-packet", function(e, pageId, $page){

		//涓绾綍椤电爜
		var pageIndex=1;
		//鍔犺浇鏇村涓璁板綍
		$('#select-more').unbind('click').bind('click', function(){
			$.showIndicator();

			$(this).text("姝ｅ湪鍔犺浇锛岃绋嶅€�..");
			pageIndex++;

			$.get(loadUrl, {'PageIndex' : pageIndex}, function(data){
				$.hideIndicator();
				data = JSON.parse(data);
				if (data.IsSuccess) {
					if (data.List != null && data.List.length > 0) {
						var str="";
						for (var i = 0; i < data.List.length; i++) {
							str += '<div class="list-item"><div class="item-value">';
							str += '<span>'+data.List[i].PrizeLevelName+' </span>';
							str += '<span>'+data.List[i].LeaguerName+' </span>';
							str += '<span>'+data.List[i].LogTime+'</span>';
							str +="</div></div>";
						}
						$(".bottom-3 .list").append(str);
						$('.bottom-3 a').text("鏌ョ湅鏇村");
					}
					else {
						$('.bottom-3 a').text("宸茬粡鍒板簳鍜�");
						$.toast("宸茬粡鍒板簳鍜�");
						$('.bottom-3 a').unbind();
					}
				}
				else {
					$.toast(data.ResponseStatus.Message);
				}
			})
		});

		//璁板綍鏄惁宸茬偣鍑绘娊绾㈠寘
		var isClick = false;
		$('.content-top a').unbind('click').bind('click', function(){
			if(!isClick){
				isClick = true;
				//鏀瑰彉绾㈠寘鍥剧墖
				$('.content-top img').attr('src', '/tpl/static/weilin/img/red-open.png');
				$.showIndicator();
				$.get(drawUrl1, {}, function(data){
					data = JSON.parse(data);
					$.hideIndicator();
					var str;
					if (data.IsSuccess) {
						//ych_alert_close();
						if (data.IsWinning) {
							str = "鎭枩鎮▇鎶㈠埌鍟�";

							$.get(drawUrl2, {'LuckDrawLogID':data.LuckDrawLogID,'ActivityItemID':data.LuckDrawActivityItemID}, function(result){
								result = JSON.parse(result);

								if (result.ResponseStatus.ErrorCode != 0) {
									$.alert(result.ResponseStatus.Message);
								}
							});

							$.alert(str, data.PrizeAlias, function(){
								isClick = false;
								//鏀瑰彉绾㈠寘鍥剧墖
								$('.content-top img').attr('src', '/tpl/static/weilin/img/red-close.png');
								window.location.reload();
							});

						}else{
							str = "寰堥仐鎲緙娌℃湁鎶㈠埌";
							$.alert(str, function(){
								isClick = false;
								//鏀瑰彉绾㈠寘鍥剧墖
								$('.content-top img').attr('src', '/tpl/static/weilin/img/red-close.png');
							});
						}

					}else{
						str = data.ResponseStatus.Message;
						$.alert(str, function(){
							isClick = false;
							$('.content-top img').attr('src', '/tpl/static/weilin/img/red-close.png');
						})
					}
				})
			}
		});

	});

	//鏀粯椤甸潰
	$(document).on("pageInit", "#pay", function(e, pageId, $page){
		$('#confirm').unbind('click').click(function(){

			var checkedParentObj, href, payment, wechatId, wechatToken;

			wechatId = $('#wechat-id').val();
			wechatToken = $('#wechat-token').val();

			//琚€変腑鐨勫璞�
			checkedParentObj = $("input[name='payment']:checked").parents('li');

			href = $(checkedParentObj).attr('_href');
			//琚€変腑鐨勬敮浠樻柟寮�
			payment = $(checkedParentObj).attr('_type');
			//鍒ゆ柇鏄惁閫夋嫨浜嗛瀛樻鏀粯
			if (payment == 1){
				//
				checkPassword(wechatId, wechatToken);
			}else{

				window.location.href = href;
			}

		});

		function checkPassword(wechatId, wechatToken){
			$.prompt('瀵嗙爜楠岃瘉', '', function(value){
				$.post("/index.php?g=Wap&m=Alipay&a=check_password&token=" + wechatToken + "&wecha_id=" + wechatId,{"pw" :  value},function(result) {
					if (result == 'true') {

						$.showIndicator();
						if(yckPay){
							$.get(yckPay, '', function(data){
								data = JSON.parse(data);
								if(data.status){
									$.toast(data.info);
									setTimeout(function(){
										$.router.load(data.url, true);
										$.hideIndicator();
									}, 2000);
								}else{
									$.hideIndicator();
									$.alert(data.info);
								}
							});
						}

						//window.location.href = yckPay;
					}else{
						$.confirm('瀵嗙爜閿欒', '', function () {
							checkPassword(wechatId,wechatToken);tabId
						});

						$('.modal-button:last-child').html('閲嶈緭');
					}
				});
			});
			$('.modal-text-input').attr('type', 'password');
		}

	});

	//棰勫瓨娆�
	$(document).on("pageInit", "#recharge", function(e, pageId, $page){

		$('#recharge .col-33').unbind('click').bind('click',function(){
			//娣诲姞宸查€夋嫨鏍峰紡
			$(this).addClass('selected');
			$(this).siblings().removeClass('selected');
			$('#recharge .full span').text($(this).children().eq(0).text());

			//婵€娲绘敮浠樻寜閽苟娣诲姞閫変腑閲戦
			rechargechangePayBtnstatus(true, $(this));

		});

		$('#recharge .pay').unbind('click').bind('click',function(){
			var href = $(this).attr('recharge-href');


			if(href){
				$.showIndicator();
				$.get(href, '', function(data){
					data = JSON.parse(data);
					if(data.status){
						$.toast(data.info);
						setTimeout(function(){
							$.router.load(data.url, true);
						}, 2000);

						setTimeout(function(){
							$.hideIndicator();
						}, 2100);
					}else{
						$.hideIndicator();
						$.alert(data.info);
					}
				});
			}
		})

		//淇敼鏀粯鎸夐挳鏀粯鐘舵€�
		function rechargechangePayBtnstatus(status, obj){

			if (status) {
				$('.button-group > p:first-child > a').attr('recharge-href', $(obj).attr('_href')).css('background-color', '#00ccff');
				$('.button-group > p:first-child > a').html('绔嬪嵆鏀粯: 锟�' + $(obj).attr('_price'));
			}

		}

	});

	//鎴戠殑濂楃エ
	$(document).on("pageInit", "#my-packages", function(e, pageId, $page){
		$("#my-packages li").unbind('click').bind("click", function(){
			var ticketID = $(this).attr('_id');
			$.router.load(detailUrl + '&ticketID=' + ticketID);
		});

		//$("#ticketImg").unbind('click').bind("click",function(){
		//	$("#ticketImg").toggle();
		//	$("#layer").toggle();
		//})
        //
		//$("#layer").unbind('click').bind("click", function(){
		//	$("#ticketImg").toggle();
		//	$("#layer").toggle();
		//})
	});

	$(document).on("pageInit", "#packages", function(e, pageId, $page){
		var qrCode = imgUrl + '&ticketID=' + ticketID;
		$('.qrcode > img').attr('src', qrCode);
	});

	//缁戝崱
	$(document).on("pageInit", "#bind", function(e, pageId, $page){
		$('#submit').unbind('click').bind('click', function(){
			if (!$('#submit').hasClass('disabeld-btn')){
				var lPhone = $('[name="phonenumber"]').val();
				var lCode = $('[name="LeaguerCode"]').val();
				var lPasswrod = $('[name="LeaguerPassword"]').val();
				var businessName = $('[name="business"]').val();

				if (lPhone.length < 11){
					$.toast("鎵嬫満鍙风爜鏍煎紡涓嶆纭�!");
					return;
				}

				var params = {'phonenumber':lPhone, 'LeaguerCode':lCode, 'LeaguerPassword':lPasswrod, 'businessName':businessName};

				postForm(postUrl, params);

			}
		});

		var businessNameArr = business.split(',');

		$("#bind-picker").unbind().picker({
			toolbarTemplate: '<header class="bar bar-nav">\
  <button class="button button-link pull-right close-picker">纭畾</button>\
  <h1 class="title">閫夋嫨娉ㄥ唽闂ㄥ簵</h1>\
  </header>',
			cols: [
				{
					textAlign: 'center',
					values: businessNameArr,
				}
			]
		});

	})

	//鐧诲綍
	$(document).on("pageInit", "#login", function(e, pageId, $page){
		$('#submit').unbind('click').bind('click', function(){
			if (!$('#submit').hasClass('disabeld-btn')){
				var lPhone = $('[name="phonenumber"]').val();
				var lPasswrod = $('[name="LeaguerPassword"]').val();

				if (lPhone.length < 11){
					$.toast("鎵嬫満鍙风爜鏍煎紡涓嶆纭�!");
					return;
				}

				var params = {'phone':lPhone, 'password':lPasswrod};

				postForm(postUrl, params);

			}
		});
	})

	//娉ㄥ唽
	$(document).on("pageInit", "#register", function(e, pageId, $page){

		//鑾峰彇楠岃瘉鐮�
		$('.btn-verify').unbind('click').bind('click', function(){
			//鍊掕鏃�
			var number = $('.btn-verify b').text();

			if(number != '' || ($(this).attr("disabled") == 'disabled')){
				return;
			}

			var phone = $('[name="phonenumber"]').val();
			var business = $('[name="business"]').val();

			if(phone.length != 11){
				$.toast("璇疯緭鍏ユ纭殑鎵嬫満鍙风爜!");
				return;
			}else if(!business){
				$.toast("璇烽€夋嫨娉ㄥ唽闂ㄥ簵!");
				return;
			}else{
				//鏀瑰彉鑾峰彇楠岃瘉鐮佹寜閽殑鐘舵€�
				$(this).attr("disabled", "disabled");

				$.post(getCodeUrl, {phoneNumber:phone, business:business}, function(data){
					data = JSON.parse(data);

					if (data.error == 0){
						$('.btn-verify b').text('60');
						$('.btn-verify span').text('鍚庨噸鏂拌幏鍙�');
						$('.btn-verify').addClass('btn-verify-disabled');
						$('#leaguertempid').val(data.info);
						count_down();
					}else{
						//鏀瑰彉鎸夐挳鐘舵€�
						$('.btn-verify').attr('disabled', '');
						//鎻愮ず閿欒淇℃伅
						$.alert(data.info, function(){
							if(data.url){
								$.router.load(data.url + '&phone=' + phone);
							}
						});
					}
				});
			}
		});

		$('#submit').unbind('click').bind('click', function(){
			var tel, verifyCode, password, confirmPassword, tempID, busniessName;
			//鍒ゆ柇鏄惁瀛樺湪绂佹鎸夐挳鐨勬牱寮�
			if($(this).hasClass('disabeld-btn')) return;

			tel = $('[name="phonenumber"]').val();
			verifyCode = $('[name="verify"]').val();
			password = $('[name="password1"]').val();
			confirmPassword = $('[name="password2"]').val();
			tempID = $('[name="leaguertempid"]').val();
			busniessName = $('[name="business"]').val();

			if (!tempID){
				$.toast("璇疯幏鍙栭獙璇佺爜!");
				return;
			}
			//楠岃瘉鍏綅绾暟瀛楁鍒�
			var reg = new RegExp("^[0-9]{6}$");
			if (!reg.test(password)){
				$.toast("璇蜂娇鐢�6浣嶇函鏁板瓧瀵嗙爜!");
				return;
			}

			if (password != confirmPassword){
				$.toast("瀵嗙爜涓嶄竴鑷�");
				return;
			}

			if(!busniessName){
				$.toast("璇烽€夋嫨娉ㄥ唽闂ㄥ簵");
				return;
			}

			//鍔ㄦ€佸垱寤� post 琛ㄥ崟 骞舵彁浜�
			postForm('', {'new_number':tel, 'leaguertempid':tempID, 'LeaguerPassword':password, 'Password':confirmPassword, 'code':verifyCode, 'busniessName':busniessName});

		});

		$('[name="password2"]').on('change', function(){
			if($(this).val() != $('[name="password1"]').val())
				$.toast("瀵嗙爜涓嶄竴鑷�");
		});

		var businessNameArr = business.split(',');

		$("#register-picker").unbind().picker({
			toolbarTemplate: '<header class="bar bar-nav">\
  <button class="button button-link pull-right close-picker">纭畾</button>\
  <h1 class="title">閫夋嫨娉ㄥ唽闂ㄥ簵</h1>\
  </header>',
			cols: [
				{
					textAlign: 'center',
					values: businessNameArr,
				}
			]
		});

		//璁℃椂鍣�
		function count_down() {
			var down = setInterval(function () {
				var num = parseInt($('.btn-verify b').text());
				if (num > 0) {
					$('.btn-verify b').text(--num);
				} else {
					$('.btn-verify b').text('');
					$('.btn-verify span').text('閲嶆柊鑾峰彇');
					//鏀瑰彉鎸夐挳鐘舵€�
					$('.btn-verify').attr('disabled', '');
					$('.btn-verify').removeClass('btn-verify-disabled');
					clearInterval(down);
				}
			}, 1000);
		}
	});

	//杞洏
	$(document).on("pageInit", "#draw", function(e, pageId, $page){

		loadPrize();

		var _aList;
		function loadPrize() {
			//瑕佽ˉ鐨勮阿璋㈠弬涓庣殑涓暟
			var thanksNumber = 12 - prizeObj.length;
			var data = [];
			for (var item in prizeObj) {
				data.push({ Name: prizeObj[item].PrizeAlias, Class: prizeObj[item].ID });
			}
			for (var i = 0; i < thanksNumber; i++) {
				data.push({ Name: "璋㈣阿鍙備笌", Class: "thanks" });
			}
			//椤哄簭鎵撲贡
			data.sort(function () { return 0.5 - Math.random()})
			_aList = $(".content-top .item");
			for (var i = 0; i < _aList.length; i++) {
				$(_aList[i]).find("span").text(data[i].Name).addClass(data[i].Class);
			}

		}

		var times=4, index=1, speed=400, cycle=0, roll=0, _prize="";

		//閲嶇疆寮€濮�
		function reset() {
			speed = 400;
			cycle = 0;
			_prize="";
			run();
		}

		//寮€濮�
		function run() {
			for (var i = 0; i < _aList.length;) {
				$(_aList[i]).css("background", "#E85240");
				i++;
			}

			$(".item-"+index).css("background", "#f4a99e");
			var prizeName =  $(".item-"+index).find("span").text();
			var prizeId =  $(".item-"+index).find("span").attr("class");
			//鎻愰€�
			if (cycle < 2 && speed > 100) {
				speed -= index * 10;
				clearInterval(roll);
				roll = setInterval(run,speed);
			}
			//闄嶉€�
			if (index == 12) {
				cycle += 1;
			}
			if (cycle > times - 1 && speed < 400) {
				speed += 20;
				clearInterval(roll);
				roll = setInterval(run, speed);
			}
			//鍒ゆ柇鍦堟暟鏄惁瓒呰繃鏈€灏戝湀鏁板苟涓斿綋鍓峱eizeId鏄惁绛変簬prize
			if (cycle > times && _prize == prizeId) {
				clearInterval(roll);
				$("#btn-begin").removeAttr("disabled");
				setTimeout(function () {
					$.alert( _desc,_str,function(){
						window.location.reload();
					});

				}, 500);
			}
			index++;
			index = index == 13 ? 1 : index;
		}

		var _str, _desc;

		//鎶藉
		$("#btn-begin").unbind('click').bind("click",function(){
			_str="";
			//鏀瑰彉寮€濮嬫寜閽姸鎬�
			$("#btn-begin").attr("disabled","disabled");
			$.get(luckDrawUrl, {}, function(data){
				data = JSON.parse(data);
				_desc = null;

				if(data.IsSuccess){
					if (data.IsWinning) {
						_prize = data.LuckDrawActivityItemID;
						_str = "鎭枩鎮ㄦ娊涓簡!";
						_desc =  data.PrizeName + "-" + data.PrizeAlias;


						$.get(receiveUrl, {'LuckDrawLogID':data.LuckDrawLogID, 'ActivityItemID':data.LuckDrawActivityItemID}, function(result){
							result = JSON.parse(result);

						})


					}else{
						_prize = "thanks";
						_str = "寰堥仐鎲緙娌℃湁涓,鍐嶆帴鍐嶅帀锛�";
					}
				}else{
					clearInterval(roll);
					for (var i = 0; i < _aList.length; i++) {
						$(_aList[i]).css("background", "#E85240");
					}

					$.alert(data.ResponseStatus.Message, function(){
						window.location.reload();
					});
				}
			})

			//鐐瑰嚮寮€濮嬶紝寮€鍚窇椹伅
			reset();

		});

		var pageIndex=1;
		$("#draw .select-more").click(function(){
			$.showIndicator();
			$("#draw .select-more").text("姝ｅ湪鍔犺浇锛岃绋嶅€�..");
			pageIndex++;

			_url += "&PageIndex="+pageIndex;
			$.ajax({
				url:_url,
				data:{},
				dataType:"JSON",
				type:"POST",
				success:function(d){
					$.hideIndicator();
					d = JSON.parse(d);
					if (d.IsSuccess) {
						if (d.List != null && d.List.length > 0) {
							var str="";
							for (var i = 0; i < d.List.length; i++) {
								str += '<div class="list-item"><div class="item-value">';
								str += '<span>'+d.List[i].PrizeLevelName+' </span>';
								str += '<span>'+d.List[i].LeaguerName+' </span>';
								str += '<span>'+d.List[i].LogTime+'</span>';
								str +="</div></div>";
							}

							$(".bottom-3 .list").append(str);
							$("#draw .select-more").text("鏌ョ湅鏇村");
						}
						else {
							$("#draw .select-more").text("娌℃湁鏇村").css('color', '#9f9f9f');
							$("#draw .select-more").unbind();
						}
					}
				},
				error:function(){
					$.hideIndicator();
				}
			})
		});

	})

	//棣栭〉
	$(document).on("pageInit", "#index-page", function(e, pageId, $page){
		$('#scan').unbind('click').bind("click", function () {
			wx.scanQRCode({
				needResult: 1, // 榛樿涓�0锛屾壂鎻忕粨鏋滅敱寰俊澶勭悊锛�1鍒欑洿鎺ヨ繑鍥炴壂鎻忕粨鏋滐紝
				scanType: ["qrCode", "barCode"], // 鍙互鎸囧畾鎵簩缁寸爜杩樻槸涓€缁寸爜锛岄粯璁や簩鑰呴兘鏈�
				success: function (res) {

					var jsonObj = res.resultStr;
					var arr = new Array();
					var result;

					arr = jsonObj.split("qrcode=");
					if(arr.length > 1){
						result = arr[1];
					}else{
						result = jsonObj;
					}

					$.post("/index.php?g=Wap&m=Ychcard&a=scanQRCode&EncodeStr=" + result,
						function (data) {
							if (data.error != 0) {
								$.alert(data.info);
							}
							else {
								if (data.IsFinish === true || data.IsFinish === 1 || data.TransID === '' || data.TransID === null) {
									$.alert(data.info);
								} else {
									url += '&TransID=' + data.TransID;

									window.location.href = url;
								}
							}
						}, "json");
				}
			});
		});
	})

	$(document).on("pageInit", "#order", function(e, pageId, $page){
		$('#order .pay').unbind('click').bind('click', function(){
			var href = $(this).attr('_href');

			$.showIndicator();
			if(href){
				$.get(href, '', function(data){
					data = JSON.parse(data);
					if(data.status){
						$.toast(data.info);
						setTimeout(function(){
							$.router.load(data.url, true);
							$.hideIndicator();
						}, 2000);
					}else{
						$.hideIndicator();
						$.alert(data.info);
					}
				});
			}
		});
	});

	$(document).on("pageInit", "#remote", function(e, pageId, $page){
		$.showPreloader('姝ｅ湪鍚姩鏈哄櫒銆傘€傘€�');

		function startrequest() {
			var isFinish = $('#IsFinish').val();
			var isSuccess = $('#IsSuccess').val();
			var stateMsg = $('#StateMsg').val();
			if (!isFinish) {

				$.post(url, {'TransID':$('#TransID').val()}, function(data){

					data = JSON.parse(data);
					$('#IsFinish').val(data.IsFinish);
					$('#IsSuccess').val(data.IsSuccess);
					$('#StateMsg').val(data.StateMsg);

					startrequest();
				});

			} else {
				$.hidePreloader();
				if (isSuccess === true || isSuccess ==='true'){

					$('.success p').eq(1).text(stateMsg);
					$(".success").show();
					$(".content-block").show();

				}else{
					$('.fail p').text(stateMsg);
					$(".fail").show();
					$(".content-block").show();
				}
			}
		}

		startrequest();
	});

	$.init();
});

function checkValue(){
	var inputObj = $('input');
	for (i = 0; i < inputObj.length; i++){
		if(!$(inputObj).eq(i).val()){
			$('#submit').addClass('disabeld-btn');
			return;
		}else{
			$('#submit').removeClass('disabeld-btn');
		}
	}
}

/**
 * 浠庢墜鏈虹浉鍐�/鍗虫椂鎷嶆憚鐨勫浘鐗囦笂浼犲埌寰俊鏈嶅姟鍣�
 * @param sizeType		鎸囧畾鏄€夋嫨杩斿洖鐨勬槸鍘熷浘杩樻槸鍘嬬缉鍥�,'original' , 'compressed'
 * @param sourceType	鎸囧畾鏉ユ簮鏄浉鍐岃繕鏄浉鏈�,'album', 'camera'
 */
function uploadImg(sizeType, sourceType){
	wx.chooseImage({
		count: 1, // 榛樿9
		sizeType: [sizeType], // 鍙互鎸囧畾鏄師鍥捐繕鏄帇缂╁浘锛岄粯璁や簩鑰呴兘鏈�
		sourceType: [sourceType], // 鍙互鎸囧畾鏉ユ簮鏄浉鍐岃繕鏄浉鏈猴紝榛樿浜岃€呴兘鏈�
		success: function (chooseRes) {
			wx.uploadImage({
				localId: chooseRes.localIds[0], // 闇€瑕佷笂浼犵殑鍥剧墖鐨勬湰鍦癐D锛岀敱chooseImage鎺ュ彛鑾峰緱
				isShowProgressTips: 1, // 榛樿涓�1锛屾樉绀鸿繘搴︽彁绀�
				success: function (uploadRes) {

					var mediaId = uploadRes.serverId; // 杩斿洖鍥剧墖鐨勬湇鍔″櫒绔疘D
					$.get(dowmloadUrl,{'mediaId' : mediaId}, function(data){
						if(data){
							data = JSON.parse(data);
							$('#portrait > img').attr('src', data);
							$.toast("涓婁紶鎴愬姛!");
						}else{
							$.toast("涓婁紶澶辫触!");
						}
					})
				}
			});
		}
	});
}


function nameInput(inputObj){
	var nameValue = $(inputObj).val();
	$('#personal-data #name .item-after').text(nameValue);
}

/**
 * 鍔犺浇宸茬鍒扮殑鏃ユ湡
 * @param data	鏃ユ湡鏁扮粍
 */
function loadDaysArr(data) {
	var dateArray = data; // 宸茬粡绛惧埌鐨�
	var $dateBox = $("#js-qiandao-list");
	var myDate = new Date();
	var currentDateString = myDate.getFullYear() + '骞�' + (parseInt(myDate.getMonth())+1) + '鏈�' + myDate.getDate();
	var monthFirst = new Date(myDate.getFullYear(), parseInt(myDate.getMonth()), 1).getDay();
	var d = new Date(myDate.getFullYear(), parseInt(myDate.getMonth() + 1), 0);
	var totalDay = d.getDate(); //鑾峰彇褰撳墠鏈堢殑澶╂暟
	var $dateLi = $dateBox.find("li");
	for (var i = 0; i < totalDay; i++) {
		for (var j = 0; j < dateArray.length; j++) {
			if (i == dateArray[j]) {
				$dateLi.eq(i + monthFirst-1).addClass("qiandao");
			}
		}
	}

	$('.head').html(currentDateString);
	$(".date" + myDate.getDate()).addClass('able-qiandao');


}

/**
 * 鍔犺浇鏃ユ湡鏁版嵁
 */
function loadLogsData(){
	$.showIndicator();
	$.get(loadLogsUrl, {}, function(data){
		$.hideIndicator();
		data = JSON.parse(data);
		if(data.ResponseStatus.ErrorCode == '0'){
			var daysArr=[];
			if (data.DaysStr!="") {
				//鍒嗗壊瀛楃涓叉垚鏁扮粍
				daysArr = data.DaysStr.split(',');
				loadDaysArr(daysArr);
				if (data.IsSignInToday) {
					$('.sign-btn').addClass('sign-btn-disabled');
					$('.sign-btn').attr('disabled','disabled');
				}
			}
		}else{
			//鎻愮ず寮傚父淇℃伅,鐐瑰嚮纭鍚庡埛鏂版湰椤甸潰
			$.alert(data.ResponseStatus.Message, function(){
				location.reload();
			});
		}
	})
}
//绛惧埌
function signIn(){
	$.showIndicator();
	$.get(signUrl, {}, function(data){
		$.hideIndicator();
		data = JSON.parse(data);
		if(data.ResponseStatus.ErrorCode == '0'){
			$.toast("绛惧埌鎴愬姛");
			//閲嶆柊鍔犺浇宸茬鍒版棩鏈熸暟鎹�
			loadLogsData();
			//鎺掕姒�
			rankingList();

			//鎴愬氨
			mySignInCount();
			//涓汉绛惧埌鏃ュ織
			mySignInLogs();
			//鏀瑰彉鎸夐挳鐘舵€�
			$('.sign-btn').addClass('sign-btn-disabled');
			$('.sign-btn').attr('disabled', 'disabled');

		}else if(data.ResponseStatus.ErrorCode == '24013'){
			$.toast("浠婂ぉ宸茬鍒�");
			//鏀瑰彉鎸夐挳鐘舵€�
			$('.sign-btn').addClass('sign-btn-disabled');
		}else{
			$.toast(data.ResponseStatus.Message);
		}
	})
}

/**
 * 浼氬憳绛惧埌鎺掕姒�
 */
function rankingList(){
	$.get(rankingUrl, '', function(data){
		data = JSON.parse(data);
		if(data.ResponseStatus.ErrorCode == '0'){
			var html = '';
			if (data.List != null && data.List.length>0) {
				for (var i = 0; i < data.List.length; i++) {
					html += '<li>' + data.List[i].LeaguerName + '</li>\
							<li>' + data.List[i].TotalDays + '</li>\
							<li>' + data.List[i].TotalAmount + '</li>';
				}
			}else {
				html += robot('鏆傛棤鏁版嵁');
			}

			$('.ranklist > ul:nth-child(2)').html(html);

		}else{
			$.toast(data.ResponseStatus.Message);
		}
	})
}

function mySignInCount(){
	$.get(mySignCount, '', function(data){
		data = JSON.parse(data);
		if(data.ResponseStatus.ErrorCode == '0'){
			$('.select > ul:first-child > li:nth-last-child(1)').html(data.TotalAmount);
			$('.select > ul:first-child > li:nth-last-child(2)').html(data.SeriesDays);
			$('.select > ul:first-child > li:nth-last-child(3)').html(data.TotalDays);
			$('.select > ul:first-child > li:nth-last-child(4)').html(data.MonthDays);

		}else{
			$.toast(data.ResponseStatus.Message);
		}
	})
}

/**
 * 鏌ヨ鎴戠殑绛惧埌璁板綍
 */
function mySignInLogs(){
	$.showIndicator();
	_pageIndex++;

	$.get(mySignLogs + '&PageIndex=' + _pageIndex, '', function(data){
		$.hideIndicator();
		data = JSON.parse(data);
		if(data.ResponseStatus.ErrorCode == '0'){
			if (data.List != null && data.List.length>0) {
				var str="";
				for (var i = 0; i < data.List.length; i++) {
					str+="<li>"+data.List[i].LogTime+"</li><li>"+data.List[i].Amount+"</li><li>绛惧埌閫�"+data.List[i].GoodsTypeName+"</li>";
				}
				$(".select > ul:last-child > div").append(str);

			}
			else if(_pageIndex == 1){
				_pageIndex--;
				$.toast("杩樻病鏈夎褰曪紝蹇幓绛惧埌鍚�");
			}
			else if(_pageIndex > 1){
				_pageIndex--;
				$.toast("宸茬粡鍒板簳鍜�");
			}
		}else{
			$.toast(data.ResponseStatus.Message);
		}
	});
}

/**
 * 	鐢ㄦ埛鍙嶉椤甸潰瀛楁暟妫€鏌�
 */
function countText(){
	var textLen = $('#text').val().length;
	if(textLen != 0 && textLen != null){
		$('.button-group a').attr('href', $('.button-group a').attr('jump_href'));
		$('.button-group a').css('background-color', '#00ccff');

	}else{
		$('.button-group a').attr('href', '');
		$('.button-group a').css('background-color', '#dedede');
	}
	$('#surplus').html(400 - parseInt(textLen));
}

/**
 * 鑾峰彇url 鍙傛暟
 * @param name 鍙傛暟鍚�
 * @returns {null}
 */
function getQueryString(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	var r = window.location.search.substr(1).match(reg);
	if (r != null) return unescape(r[2]); return null;
}

/**
 * 杩斿洖鏈哄櫒浜篐TML
 * @param description	鎻忚堪鏂囧瓧
 * @returns {string}
 */
function robot(description){
	var html = '<div class="no-product">\
                    <img src="/tpl/static/weilin/img/robot.png">\
     	            <h5>' + description + '</h5>\
                </div>';

	return html;
}

/**
 * 浣跨敤post鎻愪氦鏁版嵁骞惰烦杞�
 * @param URL
 * @param PARAMS
 * @returns {*}
 */
function postForm(URL, PARAMS) {
	var temp = document.createElement("form");
	temp.action = URL;
	temp.method = "post";
	temp.style.display = "none";
	for (var x in PARAMS) {
		var opt = document.createElement("textarea");
		opt.name = x;
		opt.value = PARAMS[x];
		// alert(opt.name)
		temp.appendChild(opt);
	}
	document.body.appendChild(temp);
	temp.submit();
	return temp;
}
/**
 * 鐢╬rototype瀵筃umber杩涜鎵╁睍,鏁板瓧杞揣甯佹牸寮�
 *
 * @param places	淇濈暀灏忔暟浣�
 * @param thousand	鍗冧綅鍒嗗壊绗﹀彿
 * @param decimal	灏忔暟鍒嗗壊绗﹀彿
 * @returns {string}
 */
function formatMoney(number, places, thousand, decimal) {
	number = number || 0;
	places = !isNaN(places = Math.abs(places)) ? places : 2;
	thousand = thousand || ",";
	decimal = decimal || ".";
	var negative = number < 0 ? "-" : "",
		i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
		j = (j = i.length) > 3 ? j % 3 : 0;
	return negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
}

function valueAlias(){
	var token = getQueryString('token');
	var alias = '';
	$.ajax({
		url:'/index.php?g=Wap&m=Ychcard&a=valueNames&token=' + token,
		async: false,
		success: function(data){
			alias = JSON.parse(data);
		}
	});

	return alias;
}

