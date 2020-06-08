const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')


isDev = process.env.NODE_ENV === 'development'
isProd = !isDev

const optimizationConfig = () => {
    let config = {}

    if (isProd) {
        config.minimizer = [
            new TerserPlugin(),
            new OptimizeCssAssetsPlugin()
        ]
    }
    return config
}

const PROJECTS_PATHS = {
    js: (isDev) ? path.resolve(__dirname, 'build') : path.resolve(__dirname, 'build/js/'),
    css: (isDev) ? 'boundle.css' : '../css/boundle.css',

}

module.exports = {
    entry: ["@babel/polyfill", path.resolve(__dirname, 'src/js/index.js')],
    output: {
        path: PROJECTS_PATHS.js,
        filename: 'boundle.js',
    },
    devServer: {
        contentBase: 'build',
        hot: isDev,
        port: 9000
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: PROJECTS_PATHS.css
        }),
        new HTMLWebpackPlugin({
            template: path.resolve(__dirname, 'src/index.html'),
        }),
    ],
    optimization: optimizationConfig(),
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use:[{
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    },
                    'eslint-loader'
                ]
            },
            {
                test: /\.css$/i,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            hmr: isDev,
                            reloadAll: true
                        }
                    }, 
                    'css-loader'
                ]
            },
        ],
    }
}

