const path = require('path');

module.exports = {
  target: "es5",
  entry: {
    main: './src/main.ts',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.glsl$/,
        use: 'raw-loader',
        exclude: /node_modules/
      }
      // {
      //   test: /\.(js)$/,
      //   exclude: /node_modules/,
      //   use: ['babel-loader']
      // }
    ]
  },
  devtool: 'source-map',
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: './dist/[name].bundle.js',
    path: __dirname,
    chunkFormat: 'commonjs'
  }
};