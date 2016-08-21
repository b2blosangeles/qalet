var path = require('path');

var Mocha = require(path.join(__dirname, '../../', 'package/mocha/node_modules/mocha'));

var mocha = new Mocha;
mocha.addFile('tt.js');
mocha.reporter('json');

var write = process.stdout.write;
var output = '';
process.stdout.write = function(str) {
  output += str;
};

mocha.run(function(failures) {
  process.stdout.write = write;
  console.log(JSON.parse(output))
});
