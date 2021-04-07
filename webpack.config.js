module.exports = {
  entry: {
      main: "./src/frontend/index.tsx",
  },
  mode: "development",
  module: {
      rules: [
          {
              test: /\.tsx$/,
              use: "ts-loader",
              exclude: /node_modules/,
          }
      ],
  },
  plugins: [
  ],
  resolve: {
        extensions: [ '.ts', '.tsx', '.js' ],
    },
  output: {
      path: __dirname + "/public",
      filename: "[name].bundle.js",
  },
};
