'use strict';

import React, { Component } from 'react';
import {
    ScrollView,
} from 'react-native';

import Pullable from './Pullable';

/**
支持android&ios可以下拉刷新的PullView组件
Demo:
import {PullView} from 'react-native-pullview';

<PullView onPulling={} onPullOk={} onPullRelease={} isPullEnd={true}
topIndicatorRender={({pulling, pullok, pullrelease}) => {}} topIndicatorHeight={60}
>

Demo2:
    topIndicatorRender(pulling, pullok, pullrelease) {
        return <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 60}}>
            <ActivityIndicator size="small" color="gray" />
            {pulling ? <Text>下拉刷新2...</Text> : null}
            {pullok ? <Text>松开刷新2......</Text> : null}
            {pullrelease ? <Text>玩命刷新中2......</Text> : null}
        </View>;
    }
    <PullView onPullRelease={this.props.onRefresh} topIndicatorRender={this.topIndicatorRender} topIndicatorHeight={60} >
        <Children />
    </PullView>

Demo3:

    onRefresh() {
        this.setState({refreshing: true});
        return new Promise((resolve) => {
            setTimeout(() => {resolve()}, 9000);
        }).then(() => {
            this.setState({refreshing: false})
        })
        // setTimeout(() => {
        //     this.setState({refreshing: false});
        // }, 3000);
    }
    <PullView refreshControl={} onRefresh={this.onRefresh} refreshing={this.state.refreshing}>
        <Children />
    </PullView>
*/

export default class extends Pullable {

    constructor(props) {
        super(props);
        this.scrollTo = this.scrollTo.bind(this);
        this.scrollToEnd = this.scrollToEnd.bind(this);
    }

    scrollTo(...args) {
        this.scroll.scrollTo(...args);
    }

    scrollToEnd(args) {
        this.scroll.scrollTo(args);
    }

    getScrollable(refreshControl) {
        return (
            <ScrollView ref={(c) => {this.scroll = c;}} refreshControl={refreshControl} scrollEnabled={this.state.scrollEnabled} onScroll={this.onScroll}>
                {this.props.children}
            </ScrollView>
        );
    }

}
