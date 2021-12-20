/*
Based on import-data.js in shinigami-eyes
https://github.com/shinigami-eyes/shinigami-eyes
*/

var bloomfilter = require("./src/bloom.js");
var fs = require('fs');

function importFile(txt, name) {
    var b = new bloomfilter.BloomFilter(/*bits*/ 2300415, 20);

    for (var line of fs.readFileSync(txt).toString().split('\n')) {
        line = line.trim();
        if (line) b.add(line);
    }
    var bucketsAsBytes = new Uint8Array(b.buckets.buffer);
    fs.writeFileSync("data/" + name + ".dat", new Buffer(bucketsAsBytes));
}

importFile("users.txt", "nft-user");