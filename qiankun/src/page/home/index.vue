// micro-app-main/src/App.vue
//...
export default class App extends Vue {
  /**
   * 菜单列表
   * key: 唯一 Key 值
   * title: 菜单标题
   * path: 菜单对应的路径
   */
  menus = [
    {
      key: "Home",
      title: "主页",
      path: "/",
    },
  ];
}