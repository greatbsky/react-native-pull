# react-native-pullview

This is  the `PullView` component in React Native both for Android and iOS, pull to refresh, very useful &amp; easily

This is a JavaScript-only implementation of `PullView` in React Native. Like `ScrollView`, this can host multiple components and views.  Better than scrollview in Android, this PullView can be pull down, then show top indicator, the top indicator have three state: **pulling**, **pullok**, **pullrelease**. And more, you can use refreshControl to provide pull-to-refresh same as scrollview.

## Demo
Demo project: https://github.com/greatbsky/react-native-pullview-demo

![](https://raw.githubusercontent.com/greatbsky/react-native-pullview-demo/master/PullViewDemo/image/demo.gif)

## Usage
  1. Run `npm install react-native-pullview --save`
  2. Code like this:
  ```
  import PullView from 'react-native-pullview';

  onPullRelease(resolve) {
    //do something
    resolve();
  }

  <PullView onPullRelease={this.onPullRelease}>
  //sth...
  </PullView>
  ```
  3. Full demo code visit: https://github.com/greatbsky/react-native-pullview-demo

  ## More configuration

  **pull down props**
  * **`onPulling`**: handle function when `pulling`
  * **`onPullOk`**: handle function when `pullok`
  * **`onPullRelease`**: handle function when `pullrelease`
  * **`topIndicatorRender`**: top indicator render function, access 3 argument: ispulling, ispullok, ispullrelease
  * **`topIndicatorHeight`**: top indicator height, require if define topIndicatorRender
  * **`isPullEnd`**: whether release pull, if true, will hide top indicator, not require

  **other, refreshcontrol props**
  support onRefresh & refreshing if you want to use refreshcontrol like scrollview.
  * **`onRefresh`**: Called when the view starts refreshing
  * **`refreshing`**: Whether the view should be indicating an active refresh.

## Licensed
MIT License

# 中文说明请参见：https://github.com/greatbsky/react-native-pullview/wiki
