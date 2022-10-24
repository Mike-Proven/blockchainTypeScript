"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = __importStar(require("crypto"));
// TRANSACTION
class Transaction {
    constructor(amount, payer, payee) {
        this.amount = amount;
        this.payer = payer;
        this.payee = payee;
    }
    toString() {
        return JSON.stringify(this);
    }
}
// BLOCK
class Block {
    constructor(prevHash, transaction, timeStamp = Date.now()) {
        this.prevHash = prevHash;
        this.transaction = transaction;
        this.timeStamp = timeStamp;
        this.numOnlyUsedOnce = Math.round(Math.random() * 999999999);
    }
    // getter method to return hash of this block
    get hash() {
        const str = JSON.stringify(this);
        const hash = crypto.createHash('SHA256');
        hash.update(str).end();
        return hash.digest('hex');
    }
}
// CHAIN
class Chain {
    // create gen:BLOCK
    constructor() {
        this.chain = [new Block('', new Transaction(525960 /*amount minutes in a Julian year sent*/, 'genesis', 'fatherTime'))];
    }
    //return last block in chain
    get lastBlock() {
        return this.chain[this.chain.length - 1];
    }
    // mine block to confirm transaction on blockchain
    mine(numOnlyUsedOnce) {
        let solution = 1;
        console.log(':time: Mining Minutes...');
        // keep looping until solution found
        while (true) {
            const hash = crypto.createHash('MD5');
            hash.update((numOnlyUsedOnce + solution).toString()).end();
            const attempt = hash.digest('hex');
            // add more 0's to make harder, rng number looks for the number to begin with 4 0's
            if (attempt.substr(0, 4) === '0000') {
                console.log(`Solved block with solution: ${solution}, block confirmed!`);
                return solution;
            }
            solution += 1;
        }
    }
    addBlock(transaction, senderPublicKey, signature) {
        // verify transaction before adding it
        const verifier = crypto.createVerify('SHA256');
        verifier.update(transaction.toString());
        const isValid = verifier.verify(senderPublicKey, signature);
        // if it is valid, create a block, mine it and add it to the chain
        if (isValid) {
            const newBlock = new Block(this.lastBlock.hash, transaction);
            this.mine(newBlock.numOnlyUsedOnce);
            this.chain.push(newBlock);
        }
    }
}
// Singleton instance as we only want one chain
Chain.instance = new Chain();
// WALLET
class Wallet {
    // gen key pair with new wallet created
    constructor() {
        const keyPair = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
        });
        this.privateKey = keyPair.privateKey;
        this.publicKey = keyPair.publicKey;
    }
    sendMoney(amount, payeePublicKey) {
        const transaction = new Transaction(amount, this.publicKey, payeePublicKey);
        const sign = crypto.createSign('SHA256');
        sign.update(transaction.toString()).end();
        const signature = sign.sign(this.privateKey);
        Chain.instance.addBlock(transaction, this.publicKey, signature);
    }
}
const agp = new Wallet();
const jz = new Wallet();
const jb = new Wallet();
agp.sendMoney(1, jz.publicKey);
jz.sendMoney(1, jb.publicKey);
jb.sendMoney(1, agp.publicKey);
console.log(Chain.instance);
