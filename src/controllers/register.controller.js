/*
* localhost:3000/api/register
* POST:
* Body:
* email
* pwd (无需后端进行两次同样校验)
* name
* city (int)
* Return
* 200: {msg: “success”}
* */
const { User } = require('../config/database');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
    // const { email, pwd, name, city } = req.body
    // console.log(email)
    //
    // res.status(201).send({
    //     message: "fake success",
    //     body: {
    //         user : {email, pwd, name, city}
    //     }
    // })


    const { email, pwd, name, city } = req.body;
    User.create({
        email: email,
        pwd: bcrypt.hashSync(pwd, bcrypt.genSaltSync()),
        name: name,
        cityId: city,
        groupId: 2
    }).then(() => {
        res.send({ code: 200, message: 'Register success!' })
    }).catch((e) => {
        console.log(e)
        res.send({ code: 0, message: 'Register error: check passed value!' })
    })
}