// import {Client} from '@elastic/elasticsearch';
// const client = new Client({node: 'http://localhost:9200'});

import DataStore from 'nedb-promises';
import crypto from 'crypto';
const ALGORITHM = 'aes-256-cbc';
const password = 'Password used to generate key';
const salt = 'salt';
const BLOCK_SIZE = 16;
const KEY_SIZE = 32;
const key = crypto.scryptSync(password, salt, KEY_SIZE);

const dbFactory = (fileName) => DataStore.create({
    // filename: `${isDev ? '.' : app.getAppPath('userData')}/data/${fileName}`,
    filename: `./${fileName}`,
    timestampData: true,
    autoload: true,
    afterSerialization(plaintext) {
        // Encryption

        // Generate random IV.
        const iv = crypto.randomBytes(BLOCK_SIZE)

        // Create cipher from key and IV.
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

        // Encrypt record and prepend with IV.
        const ciphertext = Buffer.concat([iv, cipher.update(plaintext), cipher.final()])

        // Encode encrypted record as Base64.
        return ciphertext.toString('base64')
    },

    beforeDeserialization(ciphertext) {
        // Decryption

        // Decode encrypted record from Base64.
        const ciphertextBytes = Buffer.from(ciphertext, 'base64')

        // Get IV from initial bytes.
        const iv = ciphertextBytes.slice(0, BLOCK_SIZE)

        // Get encrypted data from remaining bytes.
        const data = ciphertextBytes.slice(BLOCK_SIZE)

        // Create decipher from key and IV.
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)

        // Decrypt record.
        const plaintextBytes = Buffer.concat([decipher.update(data), decipher.final()])

        // Encode record as UTF-8.
        return plaintextBytes.toString()
    }
});

const db = {
    tags: dbFactory('tags.db'),
    posts: dbFactory('posts.db')
};

const createTag = async (label) => {
    const tag = await db.tags.insert({ label })
    return tag
}
const getTags = async () => {
    const proxies = await db.tags.find({})
    return { proxies }
}

class Schedule {

    /**
     *
     * @returns {object} reflection object
     */
    create(data) {
        console.log(data)
    }
}

export default new Schedule();
