const jsonwebtoken = require('jsonwebtoken');
const secret = process.env.SECRET;
const msg = require('./Message');
const { User } = require('../config/database')

module.exports = {

    // Use jwt to sign user email and create a token
    createToken(email) {
        return jsonwebtoken.sign({
            email
        }, secret, {
            expiresIn: "120s"
        })
    },

    // Verify jwt created token
    verifyToken(token) {
        return new Promise((resolve, reject) => {
            jsonwebtoken.verify(token, secret, (err, decoded) => {
                if (err) reject(err);
                else resolve(decoded);
            });
        });
    },
    // authorize using req/res
    auth() {
        return (request, response, next) => {
            //grab token from query
            let token = request.query.token;

            this.verifyToken(token).then(value => {
                let { email } = value;
                User.findOne({
                    where: {
                        email
                    }
                }).then(res => {
                    if (res) {
                        request['user'] = res;
                        next();
                    } else {
                        response.send(msg.failMsg('Empty findOne result: User not exist / not authorized!'))
                    }
                }).catch((e) => {
                    console.log(e)
                    response.send(msg.failMsg('findOne failed: either token expired or backend failed on running findOne'));
                })
            }).catch((e)=>{
                response.send(msg.failMsg('verifyToken failed or expired: Please login first!'));
                console.log(e)
            })
        }
    }
}