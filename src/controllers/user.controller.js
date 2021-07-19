// /user (User profile)
// GET:
//     Params:
//             ?token=
//             Return
//         profile
// email
// name
// city (int)
// group (int)

const { User } = require('../config/database');
const bcrypt = require('bcrypt');
const Permission = require("../utils/Permission");

exports.getUserInfo = async (req, res) => {
    if (req.user) {
        const {email,name,cityId,groupId} = req.user;
        res.send({ code: 200, message: 'Get info success', data: {
                email,name,cityId,groupId
            }})
    }
}

// PUT:
//     Params:
//             ?token=
//             Body:
//         email
//
// pwd (无需后端进行两次同样校验)
// name
// city (int)

exports.updateUserInfo = async (req, res) => {
    const user = {
        email: req.body.email,
        name: req.body.name,
        cityId: req.body.city
    }

    User.update(user,{
        where:{
            userId: req.user.userId
        }
    }).then(()=>{
        res.send({code:200,message: 'Changed successfully!',
            token: Permission.createToken(req.body.email)})
    }).catch((e) => {
        console.log(e);
        res.send({ code: 0, message: 'UserInfo get error: check passed value!' })
    })
}

exports.updateUserPwd = async (req, res) => {
    const user = {
        pwd: bcrypt.hashSync(req.body.pwd, bcrypt.genSaltSync())
    }

    User.update(user,{
        where:{
            userId: req.user.userId
        }
    }).then(()=>{
        res.send({code:200,message: 'Changed successfully!'})
    }).catch((e) => {
        console.log(e);
        res.send({ code: 0, message: 'UserInfo get error: check passed value!'})
    })

}