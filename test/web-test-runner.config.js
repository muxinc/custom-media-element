export default {
  nodeResolve: true,
  groups: [
    {
      name: 'eager-upgrade',
      files: 'test/**/*test.js',
      testRunnerHtml: testFramework =>
        `<html>
          <head>
            <script src="./dist/custom-media-element.js"></script>
            <script type="module" src="${testFramework}"></script>
          </head>
          <body>
            <custom-video
              id="customVideo"
              muted
              autoplay
              src="http://stream.mux.com/DS00Spx1CV902MCtPj5WknGlR102V5HFkDe/low.mp4"
            ></custom-video>
          </body>
        </html>`,
    },
    {
      name: 'lazy-upgrade',
      files: 'test/**/*test.js',
      testRunnerHtml: testFramework =>
        `<html>
          <head>
            <script type="module" src="./custom-media-element.js"></script>
            <script type="module" src="${testFramework}"></script>
          </head>
          <body>
            <custom-video
              id="customVideo"
              muted
              autoplay
              src="http://stream.mux.com/DS00Spx1CV902MCtPj5WknGlR102V5HFkDe/low.mp4"
            ></custom-video>
          </body>
        </html>`,
    },
  ],
};
