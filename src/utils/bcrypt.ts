import * as bcrypt from 'bcrypt';

export function encodePassword(rawPassword:string) {
    const SALT = bcrypt.genSaltSync();
    return bcrypt.hashSync(rawPassword,SALT);
}

export function decodePassword(rawPassword:string, hashed: string) {
    return bcrypt.compareSync(rawPassword,hashed);
}