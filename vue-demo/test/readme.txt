2.html �󶨣��л�class  v-bind:class="xx"

3.html �󶨣��л�������ʽ  v-bind:style="xx";
�� v-bind:style ʹ����Ҫ�ض�ǰ׺�� CSS ����ʱ���� transform ��Vue.js ���Զ���Ⲣ�����Ӧ��ǰ׺��

4.html v-if��v-else�� v-else-if ��

 ��1��ʹ��v-else��v-else-ifʱ��������������ָ���ǩ��

 ��2��ifָ��֧��template��ǩ��showָ�֧�֣�

 ��3��ifָ��᳢�Ը���else,else-if�е�Ԫ�أ�ͨ����Ԫ���ϰ�����key������ȡ�����ã���
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
 (1) �÷�1�� v-for="item in array"
 (2) �÷�2�� v-for="(item,index) in array"

   //object
 (3) �÷�3�� v-for="item in object"
 (4) �÷�4�� v-for="(val,key) in object"
 (5) �÷�5�� v-for="(val,key,index) in object"

  //range : ��ֵ��Χ
 (6) �÷�6�� v-for="num in 10" => 1,2,..........,10

 6.html v-for  �޸� array or object ʱ���������
 ע������

 ���� JavaScript �����ƣ� Vue ���ܼ�����±䶯�����飺
 ������������ֱ������һ����ʱ�����磺 vm.items[indexOfItem] = newValue
 �����޸�����ĳ���ʱ�����磺 vm.items.length = newLength
 Ϊ�˱����һ��������������ַ�ʽ���ﵽ�� vm.items[indexOfItem] = newValue ��Ч���� ͬʱҲ������״̬���£�
 Vue.set(example1.items, indexOfItem, newValue)

 ����ڶ��������ʹ�� splice��
 example1.items.splice(newLength)

 7.html �¼��� �¼����η� �������η� �������η�

 1. �¼���ָ��  v-on:eventName="func()"
 var vm = new Vue({
    methods : {
       func : function( event ){
          // event��ԭ���¼�����
       }
    }
 });

 Ҳ�������£�
 v-on:eventName="func(arg,$event)"  //$event Ϊԭ���¼�����event

 2. �¼����η�
  2.1 v-on:click.stop="func()"  //ֹͣð��
  2.2 v-on:click.prevent="func()"  //��ֹĬ���¼�
  2.3 v-on:click.capture="func()"  //����ģʽ
  2.4 v-on:click.self="func()"  //ֻ���¼��ڸ�Ԫ�ر�����������Ԫ�أ�����ʱ�����ص�
  2.5 v-on:click.once="func()"  //ֻ��һ��

 3. �������η��� �ڴ��������¼�ʱ��ͬʱkeyCode�������η�ʱ�������ص�
 <!-- ֻ���� keyCode �� 13 ʱ���� vm.submit() -->
 <input v-on:keyup.13="submit">

 ȫ���İ���������
 .enter
 .tab
 .delete (���� ��ɾ���� �� ���˸� ��)
 .esc
 .space
 .up
 .down
 .left
 .right

 4. �������η�: ��1��ͬʱ����������ť  ��2���������ͬʱ����һ����ť
 �ɸ��ϵİ���
.ctrl
.alt
.shift
.meta
��1��ͬʱ����������ť
<!-- Alt + C -->
<input @keyup.alt.67="func">

��2���������ͬʱ����һ����ť
<!-- Ctrl + Click -->
<div @click.ctrl="doSomething">Do something</div>

8.html ��ѡ�򣻶����ѡ�򣬰󶨵�ͬһ������

9.html  ������vue��û��v-option��Ҫ��v-for

10.html ����ؼ����η�

.lazy

��Ĭ������£� v-model �� input �¼���ͬ��������ֵ������ (���� ���� IME ����)��
����������һ�����η� lazy ���Ӷ�ת��Ϊ�� change �¼���ͬ����
<!-- �� "change" ������ "input" �¼��и��� -->
<input v-model.lazy="msg" >
.number

������Զ����û�������ֵתΪ Number ���ͣ����ԭֵ��ת�����Ϊ NaN �򷵻�ԭֵ����
�������һ�����η� number �� v-model ����������ֵ��
<input v-model.number="age" type="number">
��ͨ�������ã���Ϊ�� type="number" ʱ HTML �������ֵҲ���ǻ᷵���ַ������͡�
.trim

���Ҫ�Զ������û��������β�ո񣬿������ trim ���η��� v-model �Ϲ������룺
<input v-model.trim="msg">

11.html ���ͨ�ſ��Ի���vue�¼� ���������ʹ�� $emit�����ͨ�ţ� �����ͨ�������������������������
С�᣺
1.�����������ĸ�������ĸ������Ҫ�ṩ��Ӧ�Ĳ�������������������ṩ�ӿ�

12.html x-template�ļ�ʹ�ã�slot ����������������template

13.html ��̬�л���� �����ַ�ʽ
(1)
  <component v-bind:is="currentComponent">
                 <!-- ����� vm.currentview �仯ʱ�ı䣡 -->
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
      <!-- ����� vm.currentview �仯ʱ�ı䣡 -->
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
                                template : "<div>û���ҵ���Ӧ�����</div>"
                           };
        }


keep-alive

������л���ȥ������������ڴ��У����Ա�������״̬�����������Ⱦ��Ϊ�˿������һ�� keep-alive ָ�������
<keep-alive>
  <component :is="currentView">
    <!-- �ǻ����������棡 -->
  </component>
</keep-alive>


14.html �����޸�data���������ʱ���Ƿ�ᴥ������
���ۣ�
1. ��ֱ���޸�ԭ������ʱ���ᴥ�����£�array����, array��Ҫ��slice���� or Vue.set or vm.set��
2. ������Ժ�ɾ�����Բ��ᴥ�����£����� Vue.set( obj, key, value) or vm.$set( obj, key, value )��

15.html nextTick������Vue.nextTick������ȫ�ֵ�dom����֮�����������ڹ��������������ģ�
this.nextTick�����ڵ�ǰvm�ĸ���֮��Ҳ����󱻴�����

16.html ����������cssת����
 v-enter, .v-leave-toдһ������ʽ ;.v-leave-toָ��ʽĩβ״̬
 v-enter-active ,.v-leave-active д transition: all xxs ease;


17.html ����������css3����
  .v-enter-active {  //��ʾ
        animation: xxx 5s;
    }
  .v-leave-active { //����
        animation: xxxxx 5s;
    }

18.html ��slidePull��װΪ���

20.html �Զ���ָ�
 Vue.directive('say',{

        //ָ���һ�ΰ󶨵�Ԫ��ʱ���ã���������Ӻ������Զ���һ���ڰ�ʱִ��һ�εĳ�ʼ��������
        bind : function( el, binding ){
            console.log(arguments);
            console.log('bind');
        },

        //����Ԫ�ز��븸�ڵ�ʱ���ã����ڵ���ڼ��ɵ��ã����ش����� document �У���
        inserted: function ( el, binding ) {
            console.log(arguments);
            console.log('inserted');
        },

        //��ָ��ֻ��Ҫbind��updateʱ������Vue.directive('dirName',function(){}); function(){}����bind�׶�ִ��һ�Σ����Ժ��ÿ��update�׶ζ�ִ��һ��
        //����Ԫ�����ڵ�ģ�����ʱ���ã������۰�ֵ�Ƿ�仯��ͨ���Ƚϸ���ǰ��İ�ֵ�����Ժ��Բ���Ҫ��ģ����£���ϸ�Ĺ��Ӻ����������£���
        update : function( el, binding ){
            console.log(arguments);
            console.log('update');
        },

        //����Ԫ������ģ�����һ�θ�������ʱ���á�
        componentUpdated : function( el, binding ){
            console.log(arguments);
            console.log('componentUpdated');
        },

        //ֻ����һ�Σ� ָ����Ԫ�ؽ��ʱ���á�
        unbind : function( el, binding ){
            console.log('unbind');
        }
    });

21.html ָ���
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
        *     5. binding.value : ��ǰ��ageֵ
        *     6. binding.oldValue : ��һ��ageֵ
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

22.html ����vmǶ��
        ���ۣ� �����������vm���������vm��Ч


23.html     //ѡ��ϲ� Vue.mixin �����������е�vmʵ��

24.html      //������  ͨ��Vue.extends �� mixins�ﵽ��������������
