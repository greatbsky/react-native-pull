'use strict';

import React, { Component } from 'react';
import {
    View,
    Text,
    RefreshControl,
    PanResponder,
    Animated,
    Easing,
    Dimensions,
    ActivityIndicator,
} from 'react-native';

import styles from './style/index.css';

const padding = 2; //scrollview与外面容器的距离
const pullOkMargin = 100; //下拉到ok状态时topindicator距离顶部的距离
const defaultTopIndicatorHeight = 30; //顶部刷新指示器的高度
const isDownGesture = (x, y) => {
        if (Math.abs(x) / Math.abs(y) <= 1) { //纵向
            if (y > 0) {
                return true;
            }
        }
        return false;
    };
const isUpGesture = (x, y) => {
    if (Math.abs(x) / Math.abs(y) <= 1) { //纵向
        if (y < 0) {
            return true;
        }
    }
    return false;
}

export default class extends Component {

    constructor(props) {
        super(props);
        this.defaultScrollEnabled = !(this.props.onPulling || this.props.onPullOk || this.props.onPullRelease); //定义onPull***属性时scrollEnabled为false
        var topIndicatorHeight = this.props.topIndicatorHeight ? this.props.topIndicatorHeight : defaultTopIndicatorHeight;
        this.defaultXY = {x: 0, y: topIndicatorHeight * -1};
        this.pullOkMargin = this.props.pullOkMargin ? this.props.pullOkMargin : pullOkMargin;
        this.state = Object.assign({}, props, {
            pullPan: new Animated.ValueXY(this.defaultXY),
            scrollEnabled: this.defaultScrollEnabled,
            height: 0,
            topIndicatorHeight: topIndicatorHeight,
        });
        this.onScroll = this.onScroll.bind(this);
        this.onLayout = this.onLayout.bind(this);
        this.isPullState = this.isPullState.bind(this);
        this.resetDefaultXYHandler = this.resetDefaultXYHandler.bind(this);
        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: this.onShouldSetPanResponder.bind(this),
            onMoveShouldSetPanResponder: this.onShouldSetPanResponder.bind(this),
            onPanResponderGrant: () => {},
            // onPanResponderMove: Animated.event([null, {dy: this.state.pullPan.y}]),
            onPanResponderMove: this.onPanResponderMove.bind(this),
            onPanResponderRelease: this.onPanResponderRelease.bind(this),
            onPanResponderTerminate: this.onPanResponderRelease.bind(this),
        });
    }

    onShouldSetPanResponder(e, gesture) {
        if (!isDownGesture(gesture.dx, gesture.dy) && !isUpGesture(gesture.dx, gesture.dy)) { //非向上 或向下手势不响应
            return false;
        }
        if (this.props.onPulling || this.props.onPullOk || this.props.onPullRelease) {
            return !this.state.scrollEnabled;
        }
        return false;
    }

    onPanResponderMove(e, gesture) {
        if (isUpGesture(gesture.dx, gesture.dy)) { //向上滑动
            if(this.isPullState()) {
                this.resetDefaultXYHandler()
            } else {
                this.scroll.scrollTo({x:0, y: gesture.dy * -1});
            }
            return;
        } else if (isDownGesture(gesture.dx, gesture.dy)) { //下拉
            this.state.pullPan.setValue({x: this.defaultXY.x, y: this.defaultXY.y + gesture.dy / 3});
            if (gesture.dy < this.state.topIndicatorHeight * 2 + this.pullOkMargin) {
                if (!this.state.pulling) {
                    this.props.onPulling && this.props.onPulling(this.resetDefaultXYHandler);
                }
                this.setState({pulling: true, pullok: false, pullrelease: false}); //正在下拉
            } else {
                if (!this.state.pullok) {
                    this.props.onPullOk && this.props.onPullOk(this.resetDefaultXYHandler);
                }
                this.setState({pulling: false, pullok: true, pullrelease: false}); //下拉到位

            }
        }
    }

    onPanResponderRelease(e, gesture) {
        if (this.state.pulling || this.state.pullok) {
            if (!this.state.pullrelease) {
                this.props.onPullRelease && this.props.onPullRelease(this.resetDefaultXYHandler);
            }
            this.setState({pulling: false, pullok: false, pullrelease: true}); //完成下拉，已松开
            Animated.timing(this.state.pullPan, {
                toValue: {x: 0, y: 0},
                easing: Easing.linear,
                duration: 300
            }).start();
        }
    }

    onScroll(e) {
        if (e.nativeEvent.contentOffset.y <= 0) {
            this.setState({scrollEnabled: this.defaultScrollEnabled});
        } else if(!this.isPullState()) {
            this.setState({scrollEnabled: true});
        }
    }

    isPullState() {
        return this.state.pulling || this.state.pullok || this.state.pullrelease;
    }

    resetDefaultXYHandler() {
        this.setState({pulling: false, pullok: false, pullrelease: false});
        this.state.pullPan.setValue(this.defaultXY);
    }

    componentWillUpdate(nextProps, nextState) {
        if (nextProps.isPullEnd && this.state.pullrelease) {
            this.resetDefaultXYHandler();
        }
    }

    onLayout(e) {
        this.setState({width: e.nativeEvent.layout.width});
        this.setState({height: e.nativeEvent.layout.height - padding});
    }

    render() {
        var refreshControl = this.props.refreshControl;
        if (this.props.refreshControl == null && this.props.refreshing != null && this.props.onRefresh != null) {
            refreshControl = <RefreshControl refreshing={this.props.refreshing} onRefresh={this.props.onRefresh} />;
        }
        var topIndicator;
        if (this.props.topIndicatorRender == null) {
            topIndicator = <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: defaultTopIndicatorHeight}}>
                <ActivityIndicator size="small" color="gray" />
                {this.state.pulling ? <Text>下拉刷新...</Text> : null}
                {this.state.pullok ? <Text>松开刷新......</Text> : null}
                {this.state.pullrelease ? <Text>玩命刷新中......</Text> : null}
            </View>;
        } else {
            var {pulling, pullok, pullrelease} = this.state;
            topIndicator = this.props.topIndicatorRender(pulling, pullok, pullrelease);
        }
        var scrollable = this.getScrollable(refreshControl);
        return (
            <View style={styles.wrap} onLayout={this.onLayout}>
                <Animated.View ref={(c) => {this.ani = c;}} style={[this.state.pullPan.getLayout()]}>
                    {topIndicator}
                    <View {...this.panResponder.panHandlers} style={{width: this.state.width, height: this.state.height}}>
                        {scrollable}
                    </View>
                </Animated.View>
            </View>
        );
    }

}
