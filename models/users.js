const mongoose = require('mongoose')
const bcrypt = require('bcrypt')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: Boolean,
        required: true,
        default: false,
    },

    created_at: {
        type: Date,
        default: Date.now
    }
})



userSchema.pre('save', function (next) {
    if (this.isNew) {
        bcrypt.genSalt(10, (err, salt) => {
            if (err) {
                console.error('Ocorreu um erro na hora de encriptar a senha: \n' + err)
                return next(err)
            }
            bcrypt.hash(this.password, salt, (err, hashedPassword) => {
                if (err) {
                    console.error('Ocorreu um erro no hash: \n' + err)
                    return next(err)
                }
                this.password = hashedPassword
                next()
            })
        })
    } else{
        next() // se não for novo, não faça nada    
    }
    // Quando um erro é passado para next, ele interrompe a execução normal e salta para qualquer middleware de tratamento de erros definido no aplicativo.
})


module.exports = mongoose.model('User', userSchema);