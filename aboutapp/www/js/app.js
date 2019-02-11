angular.module('ionicApp',['ionic','controller_peripheral','conmunication_list_controller','personsign_info_controller','release_order_controller','person_info_controller','aboutapp_services','ngCordova'])
.run(function ($ionicPlatform, $rootScope, $location, $timeout, $ionicHistory,$cordovaToast,$state,$interval) {
    

    
    $ionicPlatform.ready(function () {
    	
    	//  ios白屏处理
			try{
				
	          navigator.splashscreen.hide();
	          console.log("999")
			}catch(err){
				
			}
		//  ************************
    	
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
//          StatusBar.styleLightContent();
            StatusBar.styleDefault();
        }
    });
    //物理返回按钮控制&双击退出应用
    $ionicPlatform.registerBackButtonAction(function (e) {
        //判断处于哪个页面时双击退出
        $rootScope.locals=$location.absUrl().split("/www/")[1];
        if ($rootScope.locals=="index.html#/tab" || $rootScope.locals=="index.html#/tab/Peripheral_ordersy" || $rootScope.locals=="index.html#/tab/Peripheral_ordersp"|| $rootScope.locals=="index.html#/tab/Peripheral_ordersk"||$rootScope.locals=="index.html#/tab/Peripheral_ordersd"||$rootScope.locals=="index.html#/tab/Comunication_list"||$rootScope.locals=="index.html#/tab/Person_info") {
            if ($rootScope.backButtonPressedOnceToExit) {
                ionic.Platform.exitApp();
            } else {
                $rootScope.backButtonPressedOnceToExit = true;
                $cordovaToast.showShortBottom('再按一次退出系统');
                setTimeout(function () {
                    $rootScope.backButtonPressedOnceToExit = false;
                }, 2000);
            }
        }else if ($ionicHistory.backView()) {
                $ionicHistory.goBack();
        }
        else {
            $rootScope.backButtonPressedOnceToExit = true;
            $cordovaToast.showShortBottom('再按一次退出系统');
            setTimeout(function () {
                $rootScope.backButtonPressedOnceToExit = false;
            }, 2000);
        }
        e.preventDefault();
        return false;
    }, 101);
    $rootScope.goback=function(){
//		history.go(-1);
		$ionicHistory.goBack();
	}
    $rootScope.nextgo=function(dataUrl){
//  	console.log(dataUrl)
    	$state.go(dataUrl);
	}
    $rootScope.locationgo=function(dataUrl){
    	window.open(dataUrl,"_blank")
	}
	//	倒计时	不要删后期看项目需求
//	$rootScope.send={
//      canClick:false,
//      second:60,
//      get01text:"获取验证码",
//      timer:null,
//      ToSend : function(){
//			$rootScope.send.canClick=true;
//		    $rootScope.send.color="color:#999";
//			$rootScope.send.get01text=$rootScope.send.second+"秒后重发";
//			$rootScope.$apply();
//			timer=$interval(function(){
//				$rootScope.send.second--;
//				$rootScope.send.get01text=$rootScope.send.second+"秒后重发";
//			    if($rootScope.send.second===0){
//			        $interval.cancel(timer);
//			        $rootScope.send.second=60;
//			        $rootScope.send.color="color:#000";
//			        $rootScope.send.get01text="获取验证码";
//			        $rootScope.send.canClick=false;
//			    }
//			},1000)
//      }
//  }
})


.directive('focusInput', ['$ionicScrollDelegate', '$window', '$timeout', '$ionicPosition', function($ionicScrollDelegate, $window, $timeout, $ionicPosition) {
	return {
		restrict: 'A',
		scope: false,
		link: function($scope, iElm, iAttrs, controller) {
//			if(ionic.Platform.isIOS()) {
				iElm.on('focus', function() {
					$timeout(function() {
						$ionicScrollDelegate.scrollBottom();
					}, 500)
				})
//			}
		}
	}
}])
.config(function($ionicConfigProvider){
//	$ionicConfigProvider.tabs.position('bottom');
//	$ionicConfigProvider.scrolling.jsScrolling(false);
	$ionicConfigProvider.platform.ios.views.transition('ios');
    $ionicConfigProvider.platform.android.views.transition('android');
//	$ionicConfigProvider.views.transition('none');
	$ionicConfigProvider.views.swipeBackEnabled(false);

})
.config(function($stateProvider,$urlRouterProvider){
	$stateProvider
	.state('tab',{
		url:'/tab',
//		abstract:true,
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/indextab.html',
				controller:'nav_tab'
			}
		}
//		cache:false
//		templateUrl:'indextab.html',
//		controller:''
	})
	.state('tab.Peripheral_ordersy',{
		url:'/Peripheral_ordersy',
		cache:false,
		views:{
			'tab_index':{
				templateUrl:'templates/Peripheral_ordersy.html',
				controller:'Main_refresh'
			}
		}
		
	})
	.state('tab.Peripheral_ordersp',{
		url:'/Peripheral_ordersp',
		cache:false,
		views:{
			'tab_index':{
				templateUrl:'templates/Peripheral_ordersp.html',
				controller:'Main_refresh'
			}
		}
		
	})
	.state('tab.Peripheral_ordersk',{
		url:'/Peripheral_ordersk',
		cache:false,
		views:{
			'tab_index':{
				templateUrl:'templates/Peripheral_ordersk.html',
				controller:'Main_refresh'
			}
		}
		
	})
	.state('tab.Peripheral_ordersd',{
		url:'/Peripheral_ordersd',
		cache:false,
		views:{
			'tab_index':{
				templateUrl:'templates/Peripheral_ordersd.html',
				controller:'Main_refresh'
			}
		}
		
	})
	.state('tab.Comunication_list',{
		url:'/Comunication_list',
		cache:false,
		views:{
			'tab_index':{
				templateUrl:'templates/Comunication_list.html',
				controller:'chatList'
			}
		}
	})
	.state('tab.Person_info',{
		url:'/Person_info',
		cache:false,
		views:{
			'tab_index':{
				templateUrl:'templates/Person_info.html',
				controller:'personInfo'
			}
		}
		
	})
	.state('tab.Person_info_express',{
		url:'/Person_info_express',
		cache:false,
		views:{
			'tab_index':{
				templateUrl:'templates/Person_info_express.html',
				controller:'personInfo'
			}
		}
		
	})
//	登录注册
	.state('sign',{
		url:'/sign',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Sign_in.html',
				controller:'sign_in'
			}
		}
	})
	.state('register',{
		url:'/register',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Register.html',
				controller:'register'
			}
		}
	})
	.state('registerpass',{
		url:'/registerpass',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Register_pass.html',
				controller:'registerPass'
			}
		}
	})
	.state('retrieverpassword',{
		url:'/retrieverpassword',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Retriever_password.html',
				controller:'retrieverPassword'
			}
		}
	})
	.state('retrieveryz',{
		url:'/retrieveryz',
		views:{
			'main':{
				templateUrl:'templates/Retriever_yz.html',
				controller:'retrieverYz'
			}
		}
	})
	.state('retrieverpass',{
		url:'/retrieverpass',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Retriever_pass.html',
				controller:'retrieverPass'
			}
		}
	})
//	****************************
//	周边订单子页面
	.state('releaseordermain',{
		url:'/releaseordermain',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Release_order_main.html',
				controller:'releaseOrderMain'
			}
		}
	})
	.state('release_order_selectdz',{
		url:'/release_order_selectdz',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Release_order_selectdz.html',
				controller:'releaseOrderSelectdz'
			}
		}
	})
	.state('release_order_adddz',{
		url:'/release_order_adddz',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Release_order_adddz.html',
				controller:'releaseOrderAdddz'
			}
		}
	})
	.state('release_order_modifydz',{
		url:'/release_order_modifydz',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Release_order_modifydz.html',
				controller:'releaseOrderAdddz'
			}
		}
	})
	.state('choose_express_company',{
		url:'/choose_express_company',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Choose_express_company.html',
				controller:'chooseExpressCompany'
			}
		}
	})
	.state('release_order_goodst',{
		url:'/release_order_goodst',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Release_order_goodst.html',
				controller:'releaseOrderGoodst'
			}
		}
	})
	.state('release_order_goodssize',{
		url:'/release_order_goodssize',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Release_order_goodssize.html',
				controller:'releaseOrderGoodssize'
			}
		}
	})
	.state('release_order_goodsw',{
		url:'/release_order_goodsw',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Release_order_goodsw.html',
				controller:'releaseOrderGoodsw'
			}
		}
	})
	.state('release_order_remarks',{
		url:'/release_order_remarks',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Release_order_remarks.html',
				controller:'releaseOrderRemarks'
			}
		}
	})
	.state('release_order_changepay',{
		url:'/release_order_changepay',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Release_order_changepay.html',
//				controller:'releaseOrderRemarks'
			}
		}
	})
	.state('release_order_pay',{
		url:'/release_order_pay',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Release_order_pay.html',
				controller:'releaseOrderPay'
			}
		}
	})
	.state('release_order_selectpay',{
		url:'/release_order_selectpay',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Release_order_selectpay.html',
//				controller:'releaseOrderPay'
			}
		}
	})
	.state('release_order_choosepeo',{
		url:'/release_order_choosepeo',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Release_order_choosepeo.html',
				controller:'releaseOrderChoosepeo'
			}
		}
	})
	.state('order_detail_main',{
		url:'/order_detail_main',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Order_detail_main.html',
				controller:'orderDetailMain'
			}
		}
	})
	.state('order_appointment',{
		url:'/order_appointment',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Order_appointment.html',
				controller:'orderAppointment'
			}
		}
	})
	.state('reward_order_get',{
		url:'/reward_order_get',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Reward_order_get.html',
				controller:'rewardOrderGet'
			}
		}
	})
	.state('reward_order_main',{
		url:'/reward_order_main',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Reward_order_main.html',
				controller:'rewardOrderMain'
			}
		}
	})
	.state('common_order',{
		url:'/common_order',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Common_order.html',
				controller:'commonOrder'
			}
		}
	})
	.state('release_order_province',{
		url:'/release_order_province',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Release_order_province.html',
				controller:'releaseOrderAdddz'
			}
		}
	})
	.state('release_order_city',{
		url:'/release_order_city',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Release_order_city.html',
				controller:'releaseOrderAdddz'
			}
		}
	})
	.state('release_order_area',{
		url:'/release_order_area',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Release_order_area.html',
				controller:'releaseOrderAdddz'
			}
		}
	})

//***********************************
//	个人信息子页面
	.state('person_infosz',{
		url:'/person_infosz',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Person_infosz.html',
				controller:'personInfosz'
			}
		}
	})
	.state('person_infozl',{
		url:'/person_infozl',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Person_infozl.html',
				controller:'personInfozl'
			}
		}
	})
	.state('person_infozlc',{
		url:'/person_infozlc',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Person_infozlc.html',
				controller:'personInfozlc'
			}
		},
//		params: {'data': null}
		
	})
	.state('person_infoxm',{
		url:'/person_infoxm',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Person_infoxm.html',
				controller:'personInfoxm'
			}
		}
	})
	.state('Person_infoxm_pass',{
		url:'/Person_infoxm_pass',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Person_infoxm_pass.html',
				controller:'PersonInfoxmPass'
			}
		}
	})
	.state('person_infoxbp',{
		url:'/person_infoxbp',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Person_infoxbp.html',
				controller:'personInfoxbp'
			}
		}
	})
	
	
//***********************************
//	通信列表子页面
	.state('tab.Friends_list',{
		url:'/Friends_list',
		cache:false,
		views:{
			'tab_index':{
				templateUrl:'templates/Friends_list.html',
				controller:'friendsList'
			}
		}
	})
	.state('comunication_list_addfriends',{
		url:'/comunication_list_addfriends',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Comunication_list_addfriends.html',
				controller:'chatList'
			}
		}
	})
	.state('personal_newt',{
		url:'/personal_newt',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Personal_newt.html',
				controller:'personalNewt'
			}
		}
	})
	.state('personal_newf',{
		url:'/personal_newf',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Personal_newf.html',
				controller:'personalNewf'
			}
		}
	})
	.state('Express_order_list',{
		url:'/Express_order_list',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Express_order_list.html',
				controller:'express_order_list'
			}
		}
	})
	.state('Management_address',{
		url:'/Management_address',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Management_address.html',
				controller:'releaseOrderSelectdz'
			}
		}
	})
	.state('My_order_management',{
		url:'/My_order_management',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/My_order_management.html',
				controller:'my_order_management'
			}
		}
	})
	.state('Order_comment',{
		url:'/Order_comment',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Order_comment.html',
				controller:'order_comment'
			}
		}
	})
	.state('Person_drafts',{
		url:'/Person_drafts',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Person_drafts.html',
				controller:'order_comment'
			}
		}
	})
	.state('My_change',{
		url:'/My_change',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/My_change.html',
				controller:'my_change'
			}
		}
	})
	.state('My_bill',{
		url:'/My_bill',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/My_bill.html',
				controller:'my_change'
			}
		}
	})
	//账单快递公司选择
	.state('Choose_express_company_bill',{
		url:'/Choose_express_company_bill',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Choose_express_company_bill.html',
				controller:'chooseExpressCompany'
			}
		}
	})
	
	//提现
	.state('Withdrawals',{
		url:'/Withdrawals',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Withdrawals.html',
				controller:'withdrawals'
			}
		}
	})
	//充值
	.state('Recharge',{
		url:'/Recharge',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Recharge.html',
				controller:'withdrawals'
			}
		}
	})
	//银行卡
	.state('Bank_card',{
		url:'/Bank_card',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Bank_card.html',
				controller:'withdrawals'
			}
		}
	})
	//添加银行卡
	.state('Add_bank_card',{
		url:'/Add_bank_card',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Add_bank_card.html',
				controller:'add_bank_card'
			}
		}
	})
	//银行卡信息填写
	.state('Bank_card_information',{
		url:'/Bank_card_information',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Bank_card_information.html',
				controller:'bank_card_information'
			}
		}
	})
	//银行卡短信验证码
	.state('Bank_card_SMS',{
		url:'/Bank_card_SMS',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Bank_card_SMS.html',
				controller:'bank_card_SMS'
			}
		}
	})
	//个人详细信息
	.state('My_details',{
		url:'/My_details',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/My_details.html',
				controller:'personInfo'
			}
		}
		
	})
	//对方详细信息
	.state('Other_details',{
		url:'/Other_details',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Other_details.html',
				controller:'personInfo'
			}
		}
		
	})
	//聊天界面
	.state('Chats',{
		url:'/Chats',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Chats.html',
				controller:'chats'
			}
		}
	})
	
	.state('Geolocation',{
		url:'/Geolocation',
		cache:false,
		views:{
			'main':{
				templateUrl:'templates/Geolocation.html',
				controller:'geolocation'
			}
		}
	})
	
//***********************************
	$urlRouterProvider.otherwise('/tab');
//	$urlRouterProvider.otherwise('/sign');
})
