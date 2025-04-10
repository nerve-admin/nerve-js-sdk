const Signature = require("elliptic/lib/elliptic/ec/signature");

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
 