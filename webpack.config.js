const path = require("path");
const fs = require("fs");

/*-------------- PLUGINS ------------------*/
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');

/*-------------- PHASER -------------------*/
const phaserModule = path.join("phaser-ce")
const phaser = path.join(phaserModule, "build/custom/phaser-split.js")
const pixi = path.join(phaserModule, "build/custom/pixi.js")
const p2 = path.join(phaserModule, "build/custom/p2.js")

module.exports = function (config)
{
    /*--------------- PATHS ------------------ */
    const appRootPath = config.appRootPath;
    const outputPath = config.outputPath;
    
    return {
        mode: "development",
        entry: {
            app: path.join(appRootPath, "index.js"),
            vendor: ["pixi", "p2", "phaser"]
        },
        output: {
            path: outputPath,
            filename: path.join("scripts", "[name].js")
        },
        plugins: [
            new HtmlWebpackPlugin(),
            new CopyPlugin([{ from: "assets", to: path.join(outputPath, "assets") }]),
            new CleanWebpackPlugin({ cleanOnceBeforeBuildPatterns: [outputPath] })
        ],
        devServer: {
            host: '0.0.0.0',
            disableHostCheck: true,
            setup(app)
            {

                var bodyParser = require('body-parser');

                app.use(bodyParser.json());

                app.get("/get/some-data", function (req, res)
                {
                    var content = fs.readFileSync(path.resolve(__dirname, "response_data", "response.json"));

                    res.send(content);
                })

                app.post("/post/some-data", bodyParser.json(), function (req, res)
                {
                    res.send("POST res sent from webpack dev server")
                })
            }
        },
        module: {
            rules: [
                {
                    test: /\.js$/, exclude: /node_modules/, use: ["babel-loader"]
                },
                {
                    test: /\.css$/,
                    use: ["style-loader", "css-loader"]
                },
                {
                    test: /pixi\.js/,
                    use: {
                        loader: "expose-loader",
                        query: "PIXI"
                    }
                },
                {
                    test: /phaser-split\.js$/,
                    use: {
                        loader: "expose-loader",
                        query: "Phaser"
                    }
                },
                {
                    test: /p2\.js/,
                    use: {
                        loader: "expose-loader",
                        query: "p2"
                    }
                },
                {
                    test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                    use: [{
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'fonts/'
                        }
                    }]
                }
            ]
        },
        resolve: {
            alias: {
                phaser: phaser,
                pixi: pixi,
                p2: p2
            }
        }
    }
}
