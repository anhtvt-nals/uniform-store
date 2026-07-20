const nodeExternals = require('webpack-node-externals');

module.exports = function (defaultOptions, webpack) {
  return {
    externals: [
      nodeExternals({
        allowlist: [/^@app\//],
      }),
    ],
  };
};
