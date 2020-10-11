import React from 'react';
import App, { AppInitialProps } from 'next/app';

// import global styles
import './index.scss';

export default class OverriddenApp extends App<AppInitialProps> {
  render() {
    const { Component, pageProps } = this.props;
    return <Component {...pageProps} />;
  }
}
