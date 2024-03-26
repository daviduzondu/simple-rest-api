const path = require("path");
function absolutePath(resource) {
    const splitResource = resource.split("/") || resource.split("/");
    splitResource.unshift(path.dirname(require.main.filename));
    return path.join.apply(null, splitResource);
}

module.exports = {absolutePath};