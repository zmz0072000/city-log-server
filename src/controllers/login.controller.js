// /login
// POST:
//     Body:
//         email
// pwd
// Return:
//     msg: “success”
// 	token: (一大串字符)
const { User } = require('../config/database');
const bcrypt = require('bcrypt');
const Permission = require('../utils/Permission');

exports.login = async (req, res) => {
    User.findOne({
        where: {
            email: req.body.email
        }
    }).then(({ dataValues }) => {
        const { pwd } = dataValues
        if (bcrypt.compareSync(req.body.pwd, pwd)) {
            res.send({ code: 200, message: "Login Success", token: Permission.createToken(req.body.email) })
        } else {
            res.send({ code: 0, message: 'Username/Password doesn\'t match the record!' })
        }
    }).catch((e) => {
        console.log('login findOne failed:'+e);
        res.send({ code: 0, message: 'login findOne failed: check passed value!' })
    })
}