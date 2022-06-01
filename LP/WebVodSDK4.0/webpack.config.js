/**
 * vod => 点播配置文件
 */
var webpack = require('webpack')
var path = require('path')
var childProcess = require('child_process')
const TerserPlugin = require('terser-webpack-plugin')
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

// resolve fn.
const resolve = dir => path.resolve(__dirname, dir)
const getBranch = childProcess.execSync('git name-rev --name-only HEAD', { 'encoding': 'utf8' }).replace(/\n|\s/, '')
const getComitId = childProcess.execSync('git rev-parse HEAD', { 'encoding': 'utf8' }).replace(/\n|\s/, '')
let gitBranchName = getBranch + ' / ' + getComitId

// var appender = require('webpack-loader-append-prepend')
// const SDK_VERSION = '4.0
var vcode = {
  version: 'test', // 版本号
};

var getFileName = function () {
  return `sdk-vod.${vcode.version}.min.js`
}
// 配置
var baseConf = {
  mode: 'production',
  entry: './src/main.js',
  watch: false,
  target: 'web',
  resolve: {
    alias: {
      '@common': path.resolve(__dirname, './src/common/'), //common
      '@tools': path.resolve(__dirname, './src/common/utils/tools'), // tools
      '@map': path.resolve(__dirname, './src/common/utils/map'), // map
      '@Request': path.resolve(__dirname, './src/common/utils/request'), // request
      '@Store': path.resolve(__dirname, './src/core/store'), // store
      '@Static': path.resolve(__dirname, './src/core/mt.static'),
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*'], // 清空目录
      // cleanAfterEveryBuildPatterns: ['!index.html'], // 保留不删除html
    })
  ],
  output: {
    filename: null,
    path: path.resolve(__dirname, 'dist'),
    libraryExport: 'default',
    library: 'MT'
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: {
            safari10: true,
          },
        }
      }),
    ],
    splitChunks: {
      chunks: 'async',
      minSize: 0,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  },
}
// ## 暴露 ##
module.exports = function (content, params, meta) {

  baseConf.mode = params.mode
  if (params.sdkVersion) {
    vcode.version = params.sdkVersion
  }
  // console.log(`meta ==> ${meta}`)
  console.log('#SDK云课堂[点播] ==> 打包版本', vcode.version)
  let watch = true
  if (params.sdkVersion === 'test') {
    watch = true
    baseConf.devtool = 'eval'
  } else {
    watch = false
  }

  // watch
  baseConf.watch = watch
  vcode.version = params.sdkVersion || vcode.version
  // 环境变量
  let o = new webpack.DefinePlugin({
    // 'process.evn.SDK_COPYRIGHT': `/* 欢拓直播 - v${_version}.1 */`,
    'process.env.SDK_VERSION': `"${params.sdkVersion}"`,
    'process.env.APP_BASE_API': "'https://open.talk-fun.com/'",
    'process.env.GIT_PACK': `"${gitBranchName}"`
  })
  baseConf.plugins.push(o)

  // 压缩
  // if (params.sdkVersion !== 'test') {
  //   let wp_ug = new UglifyJsPlugin({
  //     uglifyOptions: {
  //       compress: false,
  //     }
  //   })
  //   baseConf.plugins.push(wp_ug)
  // }

  // output => file
  let chunkPath = `v_${params.sdkVersion}`
  baseConf.output.publicPath = '//static-1.talk-fun.com/open/maituo_v2/dist/vod/chunk-pack/'
  baseConf.output.chunkFilename = `${chunkPath}/sdk-[name][hash:8].min.js`
  baseConf.output.filename = `sdk-vod.${vcode.version}.min.js`
  return baseConf
}