import bcrypt from 'bcrypt'
import * as cookie from 'cookie';
import jwt from 'jsonwebtoken'
import { authenticator } from 'otplib';
import dayjs from 'dayjs'

const VITE_DOMAIN_NAME="localhost"
const VITE_JWT_SECRET="%abqb&QU9ajLq$"
const VITE_JWT_EXPIRY_SEC=300

/*
//const secret = authenticator.generateSecret();
const secret = "BNLAQS2SFBNFOSAI"
const token = authenticator.generate(secret);
const isValid = authenticator.check(token, secret);
const isValid2 = authenticator.check("994841", secret);
console.log(secret);
console.log(token);
console.log(isValid);
console.log(isValid2);
*/

/*
const password = 'sS!Pj8v#X5@wbL'
const rounds = 10

bcrypt.hash(password, rounds, (err, hash) => {
    if (err) {
      console.error(err)
      return
    }
    console.log(hash)
});

const valid_pass = await bcrypt.compare("sS!Pj8v#X5@wbL", "$2b$10$l8ZMYRiuP3TWJLqifX0mQe.qPf6qBz3xhZx3DYgqLAjPu3BvcMfz6");
console.log(valid_pass)
*/


const data = { "user_id": "walker088", "profile_img": "" }
const token = jwt.sign(data, VITE_JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: VITE_JWT_EXPIRY_SEC,
});
const jwt_cookie = cookie.serialize("jwt", token, {
    domain: VITE_DOMAIN_NAME,
    path: "/auth",
    httpOnly: true,
    maxAge: parseInt(VITE_JWT_EXPIRY_SEC),
    sameSite: "strict",
    secure: true,
});

const received_cookie = cookie.parse(jwt_cookie);
console.log(received_cookie.jwt)
try {
    let user = received_cookie.jwt && jwt.verify(received_cookie.jwt, VITE_JWT_SECRET);
    console.log(user)
    console.log(dayjs.unix(user.exp).diff(dayjs(), "second"))
    console.log(dayjs.unix(user.exp).diff(dayjs(), "second") > 30)
} catch(err) {
    console.log(err)
}

