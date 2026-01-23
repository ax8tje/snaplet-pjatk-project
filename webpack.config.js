const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const Dotenv = require("dotenv-webpack");
const appDirectory = path.resolve(__dirname);

module.exports = {
  entry: path.resolve(appDirectory, 'index.web.js'),
  output: {
    filename: 'bundle.js',
    path: path.resolve(appDirectory, 'dist'),
    publicPath: '/snaplet-pjatk-project/',
  },
  resolve: {
    extensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.web.js', '.js'],
    alias: {
      'react-native$': 'react-native-web',
      'react-native-vision-camera': 'react-native-web',
      '@react-native-firebase/app': path.resolve(__dirname, 'src/mocks/firebase.ts'),
      '@react-native-firebase/auth': path.resolve(__dirname, 'src/mocks/firebase.ts'),
      '@react-native-firebase/firestore': path.resolve(__dirname, 'src/mocks/firebase.ts'),
      '@react-native-firebase/storage': path.resolve(__dirname, 'src/mocks/firebase.ts'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(tsx?|jsx?)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
            plugins: ['react-native-web'],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(appDirectory, 'public/index.html'),
    }),new Dotenv(),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 8080,
    historyApiFallback: true,
  },
};
