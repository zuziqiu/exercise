var webpack = require('webpack')
var path = require('path')
var appender = require('webpack-loader-append-prepend')
var _version = require('./src/config/version')
const TerserPlugin = require('terser-webpack-plugin')
var childProcess = require('child_process')

// resolve fn.
const resolve = dir => path.resolve(__dirname, dir)
// const getBranch = childProcess.execSync('git name-rev --name-only HEAD', { 'encoding': 'utf8' }).replace(/\n|\s/, '')
const getBranch = childProcess.execSync(`git rev-parse --symbolic-full-name --abbrev-ref @{u}`, { 'encoding': 'utf8' }).replace(/\n|\s/, '')
const getComitId = childProcess.execSync('git rev-parse HEAD', { 'encoding': 'utf8' }).replace(/\n|\s/, '')
const createTime = Math.round(new Date().getTime() / 1000)
let gitBranchName = `${getBranch} / ${getComitId} / ${createTime}`

// baseconf
const baseConf = {
  curPackVersion: 0,
  version: _version.latest, // 最新版本号
}
// conf
let config = {
  mode: 'development',
  entry: './src/main.js',

  watch: false,
  devtool: 'null',
  plugins: [],
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
              '@babel/preset-env'
            ],
            plugins: [
              [
                '@babel/plugin-transform-runtime'
              ],
              ["@babel/plugin-proposal-decorators", { "legacy": true }],
              ["@babel/plugin-proposal-class-properties", { "loose": false }]
              // [
              // 笔者为了兼容IE8才用了这个插件，代价是不能tree shaking
              // 没有IE8兼容需求的同学可以把这个插件去掉
              // '@babel/plugin-transform-modules-commonjs'
              // ]
            ]
          }
        }
      }
    ]
  },
  // 优化
  optimization: {
    minimize: false
  },
  output: {
    filename: 'sdk.js',
    path: path.resolve(__dirname, 'dist'),
    libraryExport: 'default',
    library: 'MT',
    chunkFilename: null,
    publicPath: null
  }
}
module.exports = (content, params, meta) => {

  // mode
  config.mode = params.mode

  // version
  if (params && params.sdkVersion) {
    baseConf.curPackVersion = params.sdkVersion.toFixed(1) || 'dev'
    console.log('SDK-Version ==> ' + baseConf.curPackVersion, 'From Branch ==>', gitBranchName)
  }

  // 修改分包的路径
  const BASE_PATH = '//static-1.talk-fun.com/open/maituo_v2/dist/live/chunk-pack'
  let chunkPath = `v_${baseConf.curPackVersion}`
  config.output.publicPath = `${BASE_PATH}/`

  // 添加版本号环境变量
  config.plugins.push(new webpack.DefinePlugin({
    'process.env.packVersion': `'${baseConf.curPackVersion}'`,
    'process.env.NODE_ENV': '"development"',
    'process.env.GIT_PACK': `"${gitBranchName}"`
  }))
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
    config.watch = true
    config.output.chunkFilename = `${chunkPath}/sdk-[name].min.js`
  }
  // 生产环境
  else {
    config.entry = {
      'sdk-pc.': './src/main.js',
      'sdk-mobile.': './src/main.js',
      'TalkFunWebSDK-': './src/main.js'
    }
    config.devtool = false
    config.optimization.minimize = true
    config.output.chunkFilename = `${chunkPath}/sdk-[name][hash:8].min.js`
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
  console.log(`Params ==>`, params)
  return config
}