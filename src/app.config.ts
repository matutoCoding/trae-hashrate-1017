export default defineAppConfig({
  pages: [
    'pages/route/index',
    'pages/analysis/index',
    'pages/match/index',
    'pages/log/index',
    'pages/library/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1A1D23',
    navigationBarTitleText: '抱石分析系统',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#FF6B35',
    backgroundColor: '#242830',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/route/index',
        text: '线路录入'
      },
      {
        pagePath: 'pages/analysis/index',
        text: '动作拆解'
      },
      {
        pagePath: 'pages/match/index',
        text: '难度匹配'
      },
      {
        pagePath: 'pages/log/index',
        text: '训练日志'
      },
      {
        pagePath: 'pages/library/index',
        text: '动作库'
      }
    ]
  }
})
