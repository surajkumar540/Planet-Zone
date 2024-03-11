const bcrypt=require("bcryptjs")

const users=[
    {
        firstName:'admin',
        lastName:'singh',
        email:'jaibhandari804@gmail.com',
        password:bcrypt.hashSync('Test@1234',10),
        isAdmin:true,
        emailVerify:true,
        address:"",
    },
    {
        firstName:'admin',
        lastName:'singh',
        email:'surajgautam56876@gmail.com',
        password:bcrypt.hashSync('Test@1234',10),
        isAdmin:true,
        emailVerify:true,
        address:"",
        gender:"male"
    }
]

module.exports=users;