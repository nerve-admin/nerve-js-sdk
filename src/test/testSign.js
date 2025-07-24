const Signature = require("elliptic/lib/elliptic/ec/signature");
require('dotenv').config();
var ethers = require('ethers');
const nerve = require("../index");

async function testEthPersonalSign() {
    let pri = process.env.acc0;
    let pub = nerve.getPubByPri(pri);
    console.log('pub', pub);
    let wallet = new ethers.Wallet(ethers.utils.hexZeroPad(ethers.utils.hexStripZeros('0x' + pri), 32));
    let data = "WARNNING: You are signing a transaction on the nerve network. Please confirm the risk before signing.\n\n注意：你正在对 Nerve Network 网络的交易签名，请确认风险后再签名。\n\nTransaction Hash:\n";
    let txHash = "d86cf03a175cdaf761d2eda25a98ce404d96ce0db2a4f25b25d46d604c7cdc5c";
    data = data + txHash;
    console.log('data');
    console.log(data);
    console.log('wallet.address', wallet.address);
    console.log('hashMessage', ethers.utils.hashMessage(Buffer.from(data, 'utf-8')));
    
    let signData = await wallet.signMessage(Buffer.from(data, 'utf-8'));
    console.log('signData', signData);
    signData = signData.slice(2) // 去掉0x
    const r = signData.slice(0, 64);
    const s = signData.slice(64, 128);
    let signature = new Signature({r, s}).toDER("hex");
    console.log("signatureDER", signature);
}

function signTest() {
    const address = "0xD1091E22947a0b241fE4B9e03471FC345e04B1a2";
    const hash = "d86cf03a175cdaf761d2eda25a98ce404d96ce0db2a4f25b25d46d604c7cdc5c"
    const pub = "02558f01679b65ca1e0cb0ae31b2f0eea3aa001cf36f3fc14a92a95e1fe187334d"
    let flat = "0x921d67caacd15bb8228d59ef5f6d458417bf536d36307eb4fcd99a9f28eb8a4e44d557f15998b68b2d3d556b01830d0c74c45cbbf94e6aa5d7fa485bfc4da70a1c"
    flat = flat.slice(2) // 去掉0x
    const r = flat.slice(0, 64);
    const s = flat.slice(64, 128);
    // const recoveryParam = flat.slice(128)
    let signature = new Signature({r, s}).toDER("hex");
    console.log(signature, "signature")
}

function personSignTest() {
    let pri = process.env.tron_test;
    let fromAddress = nerve.getAddressByPri(nerve.chainId(), pri);
    console.log(fromAddress);
}

function hashTest() {
    let hashHex = '0xd86cf03a175cdaf761d2eda25a98ce404d96ce0db2a4f25b25d46d604c7cdc5c';
    if (hashHex.startsWith('0x')) {
        hashHex = hashHex.substring(2);
    }
    console.log('hash', hashHex);
}

hashTest();
// testEthPersonalSign();

function callOnWindows() {
    // 检查 MetaMask 是否可用
    if (typeof window.ethereum !== 'undefined') {
    console.log('MetaMask is installed!');

    // 异步函数以处理 MetaMask 操作
    async function signMessage() {
        try {
            // 请求连接 MetaMask 账户
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];
            console.log('Connected account:', account);

            // 要签名的消息
            const message = nerve.getSignMessageWithPS('d86cf03a175cdaf761d2eda25a98ce404d96ce0db2a4f25b25d46d604c7cdc5c');
            // 转换为十六进制（personal_sign 要求）
            const hexMessage = `0x${Buffer.from(message, 'utf8').toString('hex')}`;

            // 调用 personal_sign
            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [hexMessage, account],
            });

            console.log('Signature:', signature);
            console.log('Message:', message);
            console.log('Account:', account);
            } catch (error) {
            console.error('Error:', error.message);
            }
        }

        // 执行签名
        signMessage();
    } else {
    console.error('MetaMask is not installed!');
    }
}
