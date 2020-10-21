// this is from the material-ui next.js examples and is required to do
// server-side rendering properly
import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ServerStyleSheets } from '@material-ui/core/styles';
// you see, postcss would be a dev dependency were it not actively needed in
// rendering pretty much every single page
import cssnano from 'cssnano';
import theme from '../client/theme';

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* PWA primary color */}
          <meta name="theme-color" content={theme.palette.primary.main} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

const IS_DEV = process.env.NODE_ENV !== 'production';
const postcssOpts = {
  from: 'material-ui-base.css',
  map: IS_DEV ? { inline: true } : false
};
const cssnanoOpts = { preset: 'default' };
async function minifyCss(input: string): Promise<string> {
  let output = await cssnano.process(input, postcssOpts, cssnanoOpts);
  return output.css;
}

// `getInitialProps` belongs to `_document` (instead of `_app`),
// it's compatible with server-side generation (SSG).
MyDocument.getInitialProps = async ctx => {
  // Resolution order
  //
  // On the server:
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. document.getInitialProps
  // 4. app.render
  // 5. page.render
  // 6. document.render
  //
  // On the server with error:
  // 1. document.getInitialProps
  // 2. app.render
  // 3. page.render
  // 4. document.render
  //
  // On the client
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. app.render
  // 4. page.render

  // Render app and page and get the context of the page with collected side effects.
  const sheets = new ServerStyleSheets();
  const originalRenderPage = ctx.renderPage;

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: App => props => sheets.collect(<App {...props} />)
    });

  const initialProps = await Document.getInitialProps(ctx);

  let css = sheets.toString();
  let minifiedCss = await minifyCss(css);

  return {
    ...initialProps,
    // Styles fragment is rendered after the app and page rendering finish.
    styles: [
      <style id="jss-server-side" key="jss-server-side"
        dangerouslySetInnerHTML={{ __html: minifiedCss }} />,
      ...React.Children.toArray(initialProps.styles)
    ]
  };
};
