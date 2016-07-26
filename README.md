# react-native-pullview

This is  the `PullView` component in React Native both for Android and iOS, pull to refresh, very useful &amp; easily

This is a JavaScript-only implementation of `PullView` in React Native. Like `ScrollView`, this can host multiple components and views.  Better than scrollview in Android, this PullView can be pull down, then show top indicator, the top indicator have three state: **pulling**, **pullok**, **pullrelease**. And more, you can use refreshControl to provide pull-to-refresh same as scrollview.

## Demo
Demo project: (./react-native-pullview-demo)
![](https://ss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/img/logo/logo_white_fe6da1ec.png)
![](https://ss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/img/logo/logo_white_fe6da1ec.png)

## Usage
  1.Run `npm install react-native-pullview --save`
  2.Code like this:
  ```
  topIndicatorRender(pulling, pullok, pullrelease) {
      return <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 60}}>
          <ActivityIndicator size="small" color="gray" />
          {pulling ? <Text>下拉刷新2...</Text> : null}
          {pullok ? <Text>松开刷新2......</Text> : null}
          {pullrelease ? <Text>玩命刷新中2......</Text> : null}
      </View>;
  }
  <ScrollView onPullRelease={this.props.onRefresh} topIndicatorRender={this.topIndicatorRender} topIndicatorHeight={60} ></ScrollView>
  ```
  
  ## More configuration
  
  
  
## Licensed
MIT License
  
