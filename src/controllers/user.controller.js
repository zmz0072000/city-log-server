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
        ...req.body,
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
        res.send({ code: 0, message: 'UserInfo get error: check passed value!' })
    })
}