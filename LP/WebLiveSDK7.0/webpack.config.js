var webpack = require('webpack')
var path = require('path')
var appender = require('webpack-loader-append-prepend')
const TerserPlugin = require('terser-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
var childProcess = require('child_process')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const importRetry = require('./importRetry.js')

// resolve fn.
const resolve = (dir) => path.resolve(__dirname, dir)
// const getBranch = childProcess.execSync('git name-rev --name-only HEAD', { 'encoding': 'utf8' }).replace(/\n|\s/, '')
const getBranch = childProcess
  .execSync(`git rev-parse --symbolic-full-name --abbrev-ref @{u}`, {
    encoding: 'utf8'
  })
  .replace(/\n|\s/, '')
const getComitId = childProcess.execSync('git rev-parse HEAD', { encoding: 'utf8' }).replace(/\n|\s/, '')
const createTime = Math.round(new Date().getTime() / 1000)
let gitBranchName = `${getBranch} / ${getComitId} / ${createTime}`

// baseconf
const baseConf = {
  curPackVersion: 0
}
// conf
let config = {
  mode: 'development',
  entry: './src/main.js',

  watch: false,
  devtool: 'null',
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*'] // 清空目录
    })
  ],
  resolve: {
    alias: {
      '@': resolve('src'),
      '@tools': resolve('src/utils/tools')
    }
  },
  module: {
    rules: [
      // 兼容处理
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components|vendor)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  corejs: '3',
                  useBuiltIns: 'usage' //usage 会根据配置的浏览器兼容，以及你代码中用到的 API 来进行 polyfill，实现了按需添加。
                }
              ]
            ],
            plugins: [
              ['@babel/plugin-transform-runtime'],
              ['@babel/plugin-proposal-decorators', { legacy: true }],
              ['@babel/plugin-proposal-class-properties', { loose: false }] // loose=false时，是使用Object.defineProperty定义属性，loose-ture，则使用赋值法直接定义
              // [
              // 笔者为了兼容IE8才用了这个插件，代价是不能tree shaking
              // 没有IE8兼容需求的同学可以把这个插件去掉
              // '@babel/plugin-transform-modules-commonjs'
              // ]
            ]
          }
        }
      },
      {
        test: /\.less$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader'
            // options: { url: false }
          },
          'less-loader'
        ]
      },
      {
        test: /\.(gif|jpg|png|woff|svg|eot|ttf|swf)\??.*$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192
            }
          },
          {
            loader: 'image-webpack-loader'
          }
        ]
      }
    ]
    // loaders: [
    //   // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
    //   { test: /\.tsx?$/, loader: "ts-loader" }
    // ]
  },
  // 优化
  optimization: {
    minimize: false
  },
  output: {
    // filename: 'sdk.js',
    // path: path.resolve(__dirname, 'dist'),
    // libraryTarget: 'umd',
    // libraryExport: 'default',
    // library: '',
    // chunkFilename: null,
    // publicPath: null
    path: path.resolve(__dirname, 'dist'),
    filename: 'sdk.js',
    publicPath: '',
    libraryTarget: 'umd',
    library: '',
    jsonpFunction: 'liveSdkWebpackJsonp'
  }
}
module.exports = (content, params, meta) => {
  // mode
  config.mode = params.mode

  // version
  if (params && params.sdkVersion) {
    baseConf.curPackVersion = Number(params.sdkVersion) ? params.sdkVersion.toFixed(1) : params.sdkVersion
    console.log('SDK-Version ==> ' + baseConf.curPackVersion, 'From Branch ==>', gitBranchName)
  }

  // 修改分包的路径
  const BASE_PATH = '//static-1.talk-fun.com/open/maituo_v2/dist/live/chunk-pack'
  let chunkPath = `v_${baseConf.curPackVersion}`
  config.output.publicPath = `${BASE_PATH}/`

  // 添加版本号环境变量
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.packVersion': `'${baseConf.curPackVersion}'`,
      'process.env.NODE_ENV': `"${params.mode}"`,
      'process.env.GIT_PACK': `"${gitBranchName}"`
    })
  )
  // 指定版本号输出
  const pf = 'h5'
  // h5-version
  if (params.pf === 'h5') {
    config.output.filename = `TalkFunWebSDK-${baseConf.curPackVersion}.min.js`
  }
  // pc-version
  else if (params.pf === 'pc') {
    config.output.filename = `sdk-pc.${baseConf.curPackVersion}.min.js`
  }
  // mobile-version
  else if (params.pf === 'mobile') {
    config.output.filename = `sdk-mobile.${baseConf.curPackVersion}.min.js`
  }
  // isWatch
  if (params.mode === 'development') {
    config.entry = {
      'sdk-pc.': './src/main.js',
      'sdk-mobile.': './src/main.js',
      'TalkFunWebSDK-': './src/main.js'
    }
    config.watch = true
    config.devtool = 'eval-source-map'
    config.output.filename = `[name]${baseConf.curPackVersion}.min.js`
    config.output.chunkFilename = `${chunkPath}/sdk-[name].min.js`
  }
  // 生产环境
  else {
    config.plugins.push(
      // build正式包时需要分析包拆分和大小
      new BundleAnalyzerPlugin({
        analyzerPort: '8890'
      }),
      // importRetry webpack分包处理资源重试的plugins
      new importRetry({
        cdnDosdkClass: 'static-1.talk-fun.com',
        fmtRequireUrlFuncStr: function (htmlNode, chunkId, __webpack_require__, options) {
          var nodeName = htmlNode.nodeName
          if (nodeName == 'LINK') {
            // linkKey = 'href';
            return
          }
          var modifyReloadQry = function (url, reloadTimes) {
            if (/reloadAssets=(\d+)&?/.test(url)) {
              return url.replace('reloadAssets=' + reloadTimes, 'reloadAssets=' + (1 + reloadTimes))
            }
            return url + (url.indexOf('?') != -1 ? '&' : '?') + 'reloadAssets=' + (reloadTimes + 1)
          }
          options = options || {
            // LINK: 0,
            SCRIPT: 0
          }
          var reloadTimes = options[nodeName] || 0
          var linkKey = 'src'

          if (!htmlNode[linkKey]) return
          if (reloadTimes == 0 || reloadTimes > 1) return
          var replaceUrl = modifyReloadQry(htmlNode[linkKey], reloadTimes - 1)
          replaceUrl = replaceUrl.replace('static-1.talk-fun.com', 'static-2.talk-fun.com')
          htmlNode[linkKey] = replaceUrl
        }
      })
    )
    config.entry = {
      'sdk-pc.': './src/main.js',
      'sdk-mobile.': './src/main.js',
      'TalkFunWebSDK-': './src/main.js'
    }
    config.optimization.minimize = true
    config.optimization.splitChunks = {
      chunks: 'async', // 表示从哪些chunks里面抽取代码，除了三个可选字符串值 initial、async、all 之外，还可以通过函数来过滤所需的 chunks；
      minSize: 0, // 表示抽取出来的文件在压缩前的最小大小，默认为 30000；
      maxSize: 0, // 表示抽取出来的文件在压缩前的最大大小，默认为 0，表示不限制最大大小；
      minChunks: 1, // 表示被引用次数，默认为1；
      maxAsyncRequests: 5, //最大的按需(异步)加载次数，默认为 5；
      maxInitialRequests: 3, // 最大的初始化加载次数，默认为 3；
      // automaticNameDelimiter: '~', // 抽取出来的文件的自动生成名字的分割符，默认为 ~；
      name: false, // 抽取出来文件的名字，默认为 true，表示自动生成文件名；
      cacheGroups: {
        html2canvas: {
          // name(module) {
          //   // 拆包
          //   console.log('module.context=============>', module.context)
          //   const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1]
          //   // 进一步将Ant组件拆分出来,请根据情况来
          //   // const packageName = module.context.match(/[\\/]node_modules[\\/](?:ant-design-vue[\\/]es[\\/])?(.*?)([\\/]|$)/)[1]
          //   return `${packageName.replace('@', '')}` // 部分服务器不允许URL带@
          // },
          name: 'html2canvas',
          test: /[\\/]node_modules[\\/]_html2canvas/,
          priority: 100,
          chunks: 'async'
        },
        hls: {
          name: 'hls',
          test: /[\\/]node_modules[\\/]_hls/,
          priority: 100,
          chunks: 'async'
        },
        flv: {
          name: 'flv',
          test: /[\\/]src[\\/]vendor[\\/]flv.source-v4.2/,
          priority: 100,
          chunks: 'async'
        },
        async: {
          name: 'async',
          test: /[\\/]node_modules[\\/]/,
          priority: 90,
          chunks: 'async'
        }
      }
    }
    config.output.chunkFilename = `${chunkPath}/sdk-[name]-[hash:8].min.js`
    config.output.filename = `[name]${baseConf.curPackVersion}.min.js`
    config.optimization.minimizer = [
      new TerserPlugin({
        parallel: true,
        extractComments: {
          condition: false,
          filename: () => {
            return false
          },
          banner: (licenseFile) => {
            return `@TalkFun LiveSDK v${baseConf.curPackVersion} | www.talk-fun.com license`
          }
        }
      })
    ]
  }
  console.log('#SDK云课堂 ==> 打包版本', config.output.filename)
  return config
}
