- project
    - d bin         可执行文件目录
    - d config      配置
    - d public      入口文件
    - d src         应用
    - d templates   模板
    - d var         缓存、数据、日志
    - d vendor      组件
    - .env          shell脚本，保存着一些配置(APP_ENV、doctrine、secret等)
    - .env.dist
    - composer.json
    - composer.lock
    - symfony.lock

<!-- - bin目录 -->
- console
  - bin目录下是可执行文件存放位置
  - console是命令行入口文件
  - 用于执行很多命令，如数据库操作、缓存操作、查看路由、服务等.

<!-- config目录 -->
- d packages                    遵循每个环境都有单独的配置文件
    - d dev
        - routing.yaml
    - d prod
        - doctrine.yaml
    - d test
        - framework.yaml
    - doctrine.yaml             
    - doctrine_migrations.yaml
    - framework.yaml            
    - routing.yaml
    - twig.yaml
- d routes                      文件配置路由
    - d dev
        - twig.yaml
    - annotations.yaml          注释配置路由
- bundles.php                   类似4版本之前的bundle注册，需要使用的bundle都要在这里进行注册才能使用
- routes.yaml                   路由配置文件
- services.yaml                 服务配置文件
<!-- 
dev环境，symfony加载顺序
config/packages/*
config/packages/dev/*
config/services.yaml
config/services_dev.yaml -->

<!-- 加载项目之外的文件 -->

<!-- imports: -->
  - { resource: '/var/data/setup.yaml', ignore_errors: true }

<!-- public目录 -->
  - index.php 项目入口

<!-- src目录 -->
- d Controller  控制器文件目录
- d Entity      数据库实体文件目录
- d Migrations  数据库迁移目录
- d Repository  数据实体操作类
- Kernel.php    symfony核心，request\response都是这里处理的，包括路由、服务容器、依赖等.
<!-- src是应用目录(应用不一定非得src目录，可以在composer.json的autoload处修改) -->

- templates目录是在安装twig组件后自动创建的，是存放twig模板位置

<!-- var目录 -->
- d cache   缓存
    - d dev
- d data    数据(symfony demo 数据库就是放在这)
- d log     日志
<!-- var目录放缓存文件和日志 -->

- vendor目录是放第三方组件的目录，一般这个目录下的文件是通过composer来管理的。
<!-- 开发过程中不会动到这里面的代码(不排除调试) -->