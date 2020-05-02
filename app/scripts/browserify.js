var browserify = require("browserify");

var b = browserify();
b.add("./PrivateKey.js");
b.bundle().pipe(process.stdout);