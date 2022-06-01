(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        if (root.MT && !root.TALKFUN_SDK_NAMESPACE) {
            console.warn('变量名 `MT` 已存在, 请配置 `window.TALKFUN_SDK_NAMESPACE` 命名', root.MT)
        }
        // 配置 TF_SDK_NAMESPACE 域
        else if (typeof (root.TALKFUN_SDK_NAMESPACE) === 'string') {
            root[TALKFUN_SDK_NAMESPACE] = factory()
        }
        // 对于尚未配置 window.MT 的命名, 暴露 window.MT
        else {
            root.MT = factory();
        }
    }
}(this, function () {
//almond, and your modules will be inlined here