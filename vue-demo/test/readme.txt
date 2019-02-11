2.html 绑定，切换class  v-bind:class="xx"

3.html 绑定，切换内联样式  v-bind:style="xx";
当 v-bind:style 使用需要特定前缀的 CSS 属性时，如 transform ，Vue.js 会自动侦测并添加相应的前缀。

4.html v-if，v-else， v-else-if ；

 （1）使用v-else，v-else-if时，必须紧贴上面的指令标签；

 （2）if指令支持template标签，show指令不支持；

 （3）if指令会尝试复用else,else-if中的元素，通过在元素上绑定特性key，可以取消复用，例
 <template v-if="loginType === 'username'">
   <label>Username</label>
   <input placeholder="Enter your username" key="username-input">
 </template>
 <template v-else>
   <label>Email</label>
   <input placeholder="Enter your email address" key="email-input">
 </template>

 5.html v-for
    //array
 (1) 用法1： v-for="item in array"
 (2) 用法2： v-for="(item,index) in array"

   //object
 (3) 用法3： v-for="item in object"
 (4) 用法4： v-for="(val,key) in object"
 (5) 用法5： v-for="(val,key,index) in object"

  //range : 数值范围
 (6) 用法6： v-for="num in 10" => 1,2,..........,10

 6.html v-for  修改 array or object 时的情况分析
 注意事项

 由于 JavaScript 的限制， Vue 不能检测以下变动的数组：
 当你利用索引直接设置一个项时，例如： vm.items[indexOfItem] = newValue
 当你修改数组的长度时，例如： vm.items.length = newLength
 为了避免第一种情况，以下两种方式将达到像 vm.items[indexOfItem] = newValue 的效果， 同时也将触发状态更新：
 Vue.set(example1.items, indexOfItem, newValue)

 避免第二种情况，使用 splice：
 example1.items.splice(newLength)

 7.html 事件绑定 事件修饰符 按键修饰符 复合修饰符

 1. 事件绑定指令  v-on:eventName="func()"
 var vm = new Vue({
    methods : {
       func : function( event ){
          // event是原生事件对象
       }
    }
 });

 也可以如下：
 v-on:eventName="func(arg,$event)"  //$event 为原生事件对象event

 2. 事件修饰符
  2.1 v-on:click.stop="func()"  //停止冒泡
  2.2 v-on:click.prevent="func()"  //阻止默认事件
  2.3 v-on:click.capture="func()"  //捕获模式
  2.4 v-on:click.self="func()"  //只当事件在该元素本身（而不是子元素）触发时触发回调
  2.5 v-on:click.once="func()"  //只绑定一次

 3. 按键修饰符： 在触发按键事件时，同时keyCode符合修饰符时，触发回调
 <!-- 只有在 keyCode 是 13 时调用 vm.submit() -->
 <input v-on:keyup.13="submit">

 全部的按键别名：
 .enter
 .tab
 .delete (捕获 “删除” 和 “退格” 键)
 .esc
 .space
 .up
 .down
 .left
 .right

 4. 复合修饰符: （1）同时按下两个按钮  （2）鼠标点击的同时按下一个按钮
 可复合的按键
.ctrl
.alt
.shift
.meta
（1）同时按下两个按钮
<!-- Alt + C -->
<input @keyup.alt.67="func">

（2）鼠标点击的同时按下一个按钮
<!-- Ctrl + Click -->
<div @click.ctrl="doSomething">Do something</div>

8.html 复选框；多个勾选框，绑定到同一个数组

9.html  下拉框，vue中没用v-option，要用v-for

10.html 输入控件修饰符

.lazy

在默认情况下， v-model 在 input 事件中同步输入框的值与数据 (除了 上述 IME 部分)，
但你可以添加一个修饰符 lazy ，从而转变为在 change 事件中同步：
<!-- 在 "change" 而不是 "input" 事件中更新 -->
<input v-model.lazy="msg" >
.number

如果想自动将用户的输入值转为 Number 类型（如果原值的转换结果为 NaN 则返回原值），
可以添加一个修饰符 number 给 v-model 来处理输入值：
<input v-model.number="age" type="number">
这通常很有用，因为在 type="number" 时 HTML 中输入的值也总是会返回字符串类型。
.trim

如果要自动过滤用户输入的首尾空格，可以添加 trim 修饰符到 v-model 上过滤输入：
<input v-model.trim="msg">

11.html 组件通信可以基于vue事件 在子组件中使用 $emit向父组件通信， 父组件通过作用域插槽向子组件传递数据
小结：
1.界面数据在哪个组件，哪个组件就要提供对应的操作方法，并向子组件提供接口

12.html x-template的简单使用，slot ；作用域插槽作用于template

13.html 动态切换组件 有两种方式
(1)
  <component v-bind:is="currentComponent">
                 <!-- 组件在 vm.currentview 变化时改变！ -->
  </component>


    var vm = new Vue({

        el : '#app1',

        data : {
            currentComponent : 'aa'
        },

        components : {
            aa : {
                template : '<div>this is a</div>'
            },
            bb : {
                template : '<div>this is b</div>'
            },
            cc : {
                template : '<div>this is c</div>'
            },
        }

    });


(2) <component v-bind:is="currentView">
      <!-- 组件在 vm.currentview 变化时改变！ -->
    </component>



    var app2 = new Vue({

        el : '#app2',

        data : {
            currentComponent : getComponent( 'aa' ),
            current : 'aa'
        },
        watch : {
            current : function( newVal ){
                this.currentComponent = getComponent( newVal );
            }
        }



    });

    function getComponent( name ){
        var components = {
            aa : {
                template : "<div>this is aa</div>"
            },
            bb : {
                template : "<div>this is bb</div>"
            } ,
            cc : {
                template : "<div>this is cc</div>"
            }
        };

        var ret = components[ name ];

            return      ret
                        || {
                                template : "<div>没有找到对应的组件</div>"
                           };
        }


keep-alive

如果把切换出去的组件保留在内存中，可以保留它的状态或避免重新渲染。为此可以添加一个 keep-alive 指令参数：
<keep-alive>
  <component :is="currentView">
    <!-- 非活动组件将被缓存！ -->
  </component>
</keep-alive>


14.html 测试修改data里面的属性时，是否会触发更新
结论：
1. 当直接修改原有属性时，会触发更新（array除外, array需要用slice方法 or Vue.set or vm.set）
2. 添加属性和删除属性不会触发更新（可用 Vue.set( obj, key, value) or vm.$set( obj, key, value )）

15.html nextTick方法；Vue.nextTick触发于全局的dom更新之后；是生命周期钩子中最晚被触发的；
this.nextTick触发于当前vm的更新之后，也是最后被触发的

16.html 动画，基于css转换；
 v-enter, .v-leave-to写一样的样式 ;.v-leave-to指样式末尾状态
 v-enter-active ,.v-leave-active 写 transition: all xxs ease;


17.html 动画，基于css3动画
  .v-enter-active {  //显示
        animation: xxx 5s;
    }
  .v-leave-active { //隐藏
        animation: xxxxx 5s;
    }

18.html 将slidePull封装为组件

20.html 自定义指令；
 Vue.directive('say',{

        //指令第一次绑定到元素时调用，用这个钩子函数可以定义一个在绑定时执行一次的初始化动作。
        bind : function( el, binding ){
            console.log(arguments);
            console.log('bind');
        },

        //被绑定元素插入父节点时调用（父节点存在即可调用，不必存在于 document 中）。
        inserted: function ( el, binding ) {
            console.log(arguments);
            console.log('inserted');
        },

        //当指令只需要bind和update时，可以Vue.directive('dirName',function(){}); function(){}会在bind阶段执行一次，在以后的每次update阶段都执行一次
        //被绑定元素所在的模板更新时调用，而不论绑定值是否变化。通过比较更新前后的绑定值，可以忽略不必要的模板更新（详细的钩子函数参数见下）。
        update : function( el, binding ){
            console.log(arguments);
            console.log('update');
        },

        //被绑定元素所在模板完成一次更新周期时调用。
        componentUpdated : function( el, binding ){
            console.log(arguments);
            console.log('componentUpdated');
        },

        //只调用一次， 指令与元素解绑时调用。
        unbind : function( el, binding ){
            console.log('unbind');
        }
    });

21.html 指令传参
        /*
        *
        *    v-say:set.a.b="age" =>
        *
        *     1. binding.expression: "age"
        *     2. binding.modifiers : {
        *       a : true,
        *       b : true
        *     }
        *     3. binding.name : say
        *     4. binding.rawName: "v-say.a.b"
        *     5. binding.value : 当前的age值
        *     6. binding.oldValue : 上一个age值
        *     7. binding.arg : set
        * */

        /*
        *   v-hello='{color:"red",age:18}' =>
        *   1. binding.value.color : 'red'
        *   2. binding.value.age : 18
        *   3. ........
        *   4 .....
        *   ......
        *
        * */

22.html 测试vm嵌套
        结论： 如果有最外层的vm，则，里面的vm无效


23.html     //选项合并 Vue.mixin 将作用于所有的vm实例

24.html      //组件混合  通过Vue.extends 和 mixins达到组件构造参数复用
