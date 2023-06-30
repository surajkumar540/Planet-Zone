const bcrypt=require("bcryptjs")

const users=[
    {
        name:'admin',
        email:'jaibhandari804@gmail.com',
        password:bcrypt.hashSync('Test@1234',10),
        isAdmin:true,
        emailVerify:true
    },
    {
        name:'suraj',
        email:'suraj@gmail.com',
        password:bcrypt.hashSync('Test@1234',10),
        isAdmin:true,
        emailVerify:true
    }
]

module.exports=users;