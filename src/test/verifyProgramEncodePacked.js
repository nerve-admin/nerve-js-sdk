const nerve = require('../index');

var sender = "tNULSeBaMoixxbUovqmzPyJ2AwYFAX2evKbuy9";
var nulsAmount = "20000000";
var tokenAmount = "0";
var assetKey = "";
var receiver = "tNULSeBaMnrs6JKrCy6TQdzYJZkMZJDng7QAsD";
function test() {
    let args = [sender, nulsAmount, tokenAmount, assetKey, receiver];
    let result = nerve.programEncodePacked(args);
    console.log('result type', typeof result);
    console.log('result', result);
    let parseResult = nerve.parseProgramEncodePacked(result);
    console.log('parseResult', parseResult);
}
test();
console.log('receiver', receiver.substring(0, receiver.length - 1))
