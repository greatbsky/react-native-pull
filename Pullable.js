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

import styles from './style/index.css.js';

// const padding = 2; //scrollview与外面容器的距离
const pullOkMargin = 100; //下拉到ok状态时topindicator距离顶部的距离
const defaultTopIndicatorHeight = 30; //顶部刷新指示器的高度
const defaultDuration = 300;
const isDownGesture = (x, y) => {
    return y > 0 && (y > Math.abs(x));
};
const isUpGesture = (x, y) => {
    return y < 0 && (Math.abs(x) < Math.abs(y));
};
const isVerticalGesture = (x, y) => {
    return (Math.abs(x) < Math.abs(y));
};

export default class extends Component {
    constructor(props) {
        super(props);
        this.pullable = this.props.refreshControl == null;
        this.defaultScrollEnabled = false; //!(this.props.onPulling || this.props.onPullOk || this.props.onPullRelease); //定义onPull***属性时scrollEnabled为false
        let topIndicatorHeight = this.props.topIndicatorHeight ? this.props.topIndicatorHeight : defaultTopIndicatorHeight;
        this.defaultXY = {x: 0, y: topIndicatorHeight * -1};
        this.pullOkMargin = this.props.pullOkMargin ? this.props.pullOkMargin : pullOkMargin;
        this.duration = this.props.duration ? this.props.duration : defaultDuration;
        this.state = Object.assign({}, props, {
            pullPan: new Animated.ValueXY(this.defaultXY),
            scrollEnabled: this.defaultScrollEnabled,
            height: 0,
            topIndicatorHeight: topIndicatorHeight,
            gesturePosition: {x: 0, y: 0}
        });
        this.onScroll = this.onScroll.bind(this);
        this.onLayout = this.onLayout.bind(this);
        this.isPullState = this.isPullState.bind(this);
        this.resetDefaultXYHandler = this.resetDefaultXYHandler.bind(this);
        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: this.onShouldSetPanResponder.bind(this),
            onMoveShouldSetPanResponder: this.onShouldSetPanResponder.bind(this),
            onPanResponderGrant: () => {},
            onPanResponderMove: this.onPanResponderMove.bind(this),
            onPanResponderRelease: this.onPanResponderRelease.bind(this),
            onPanResponderTerminate: this.onPanResponderRelease.bind(this),
        });
    }

    onShouldSetPanResponder(e, gesture) {
        if (!this.pullable || !isVerticalGesture(gesture.dx, gesture.dy)) { //不使用pullable,或非向上 或向下手势不响应
            return false;
        }
        // if (this.props.onPulling || this.props.onPullOk || this.props.onPullRelease) {
        //     return !this.state.scrollEnabled;
        // }
        if (!this.state.scrollEnabled) {
            this.lastY = this.state.pullPan.y._value;
            return true;
        } else {
            return false;
        }
    }

    onPanResponderMove(e, gesture) {
        this.state.gesturePosition = {x: this.defaultXY.x, y: gesture.dy};
        if (isUpGesture(gesture.dx, gesture.dy)) { //向上滑动
            if(this.isPullState()) {
                this.resetDefaultXYHandler()
            } else if(this.props.onPushing && this.props.onPushing(this.state.gesturePosition)) {
                // do nothing, handling by this.props.onPushing
            } else {
                this.scroll.scrollTo({x:0, y: gesture.dy * -1});
            }
            return;
        } else if (isDownGesture(gesture.dx, gesture.dy)) { //下拉
            this.state.pullPan.setValue({x: this.defaultXY.x, y: this.lastY + gesture.dy / 3});
            if (gesture.dy < this.state.topIndicatorHeight + this.pullOkMargin) { //正在下拉
                if (!this.state.pulling) {
                    this.props.onPulling && this.props.onPulling(this.resetDefaultXYHandler);
                }
                this.setState({pulling: true, pullok: false, pullrelease: false});
            } else { //下拉到位
                if (!this.state.pullok) {
                    this.props.onPullOk && this.props.onPullOk(this.resetDefaultXYHandler);
                }
                this.setState({pulling: false, pullok: true, pullrelease: false});
            }
        }
    }

    onPanResponderRelease(e, gesture) {
        if (this.state.pulling) { //没有下拉到位
            this.resetDefaultXYHandler(); //重置状态
        }
        if (this.state.pullok) {
            if (!this.state.pullrelease) {
                if (this.props.onPullRelease) {
                     this.props.onPullRelease(this.resetDefaultXYHandler);
                } else {
                    setTimeout(() => {this.resetDefaultXYHandler()}, 3000);
                }
            }
            this.setState({pulling: false, pullok: false, pullrelease: true}); //完成下拉，已松开
            Animated.timing(this.state.pullPan, {
                toValue: {x: 0, y: 0},
                easing: Easing.linear,
                duration: this.duration
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
        if (this.state.pulling || this.state.pullrelease) {
            this.setState({pulling: false, pullok: false, pullrelease: false});
            this.state.pullPan.setValue(this.defaultXY);
        }
    }

    componentWillUpdate(nextProps, nextState) {
        if (nextProps.isPullEnd && this.state.pullrelease) {
            this.resetDefaultXYHandler();
        }
    }

    onLayout(e) {
        if (this.state.width != e.nativeEvent.layout.width || this.state.height != e.nativeEvent.layout.height) {
            this.setState({width: e.nativeEvent.layout.width});
            this.setState({height: e.nativeEvent.layout.height});
        }
    }

    render() {
        let refreshControl = this.props.refreshControl;
        // if (this.props.refreshControl == null && this.props.refreshing != null && this.props.onRefresh != null) {
        //     refreshControl = <RefreshControl refreshing={this.props.refreshing} onRefresh={this.props.onRefresh} />;
        // }
        let topIndicator;
        if (this.props.topIndicatorRender == null) {
            topIndicator = (
                <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: defaultTopIndicatorHeight}}>
                    <ActivityIndicator size="small" color="gray" />
                    {this.state.pulling ? <Text>下拉刷新...</Text> : null}
                    {this.state.pullok ? <Text>松开刷新......</Text> : null}
                    {this.state.pullrelease ? <Text>玩命刷新中......</Text> : null}
                </View>
            );
        } else {
            let {pulling, pullok, pullrelease} = this.state;
            topIndicator = this.props.topIndicatorRender(pulling, pullok, pullrelease, this.state.gesturePosition);
        }

        return (
            <View style={[styles.wrap, this.props.style]} onLayout={this.onLayout}>
                <Animated.View ref={(c) => {this.ani = c;}} style={[this.state.pullPan.getLayout()]}>
                    {topIndicator}
                    <View {...this.panResponder.panHandlers} style={{width: this.state.width, height: this.state.height}}>
                        {this.getScrollable(refreshControl)}
                    </View>
                </Animated.View>
            </View>
        );
    }
}
