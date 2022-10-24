import * as crypto from 'crypto';
import { appendFile } from 'fs';

// TRANSACTION
class Transaction {
    constructor(
        public amount: number,
        public payer: string,
        public payee: string
    ) {}

    toString() {
        return JSON.stringify(this);
    }
}

// BLOCK
class Block {
    public numOnlyUsedOnce = Math.round(Math.random() * 999999999);

    constructor(
        public prevHash: string,
        public transaction: Transaction,
        public timeStamp = Date.now()
    ) {}

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

    // Singleton instance as we only want one chain
    public static instance = new Chain();
    
    // series of linked blocks
    chain: Block[];

    // create gen:BLOCK
    constructor() {
        this.chain = [new Block('', new Transaction(525960/*amount minutes in a Julian year sent*/, 'genesis', 'fatherTime'))]
    }

    //return last block in chain
    get lastBlock() {
        return this.chain[this.chain.length -1]
    }

    // mine block to confirm transaction on blockchain
    mine(numOnlyUsedOnce: number) { // change in some way based on minutes???
        let solution = 1;
        console.log(':time: Mining Minutes...')

        // keep looping until solution found
        while(true) {
            const hash = crypto.createHash('MD5');
            hash.update((numOnlyUsedOnce + solution).toString()).end();

            const attempt = hash.digest('hex');

            // add more 0's to make harder
            if (attempt.substr(0, 4) === '0000') {
                console.log(`Solved block with solution: ${solution}, block confirmed!`);
                return solution;
            }

            solution += 1
        }
    }

    addBlock(transaction: Transaction, senderPublicKey: string, signature: Buffer) {
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

// WALLET
class Wallet {
    public publicKey: string;
    public privateKey: string;

    // gen key pair with new wallet created
    constructor() {
        const keyPair = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem'}
        })

        this.privateKey = keyPair.privateKey
        this.publicKey = keyPair.publicKey
    }

    sendMoney(amount: number, payeePublicKey: string) {
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