const express = require('express')
const router = express.Router()
const User = require('../models/users.js')
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt')
const { verifyToken, verifyAdmin } = require('../middlewares/auth.js');
require('dotenv').config()
const cookieParser = require('cookie-parser');


const secret = process.env.JWT_TOKEN
router.use(cookieParser());


// PÁGINA DE CADASTRO
router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body

    if (!name || !email || !password) {
        return res.status(422).json({ message: "Você não preencheu as credenciais corretamente" })
    }

    const user = await User.findOne({ email })

    if (user) {
        return res.status(409).json({ message: "Já existe este usuário no banco de dados!" })
    }

    if (password.trim().length < 6) {
        return res.status(422).json({ message: "Sua senha não deve ser menor que 6 caracteres" })
    }

    const newUser = new User({ name, email, password, role })
    try {
        await newUser.save()
        res.status(201).json({ message: 'Usuário criado com sucesso!' })
    } catch (err) {
        res.status(500).json({ message: 'Erro ao cadastrar o usuário!' })
        console.error('Erro --> ' + err)
        return
    }
})

// PÁGINA DE LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(422).json({ error : "Você esqueceu de colocar as credenciais corretamente" })
        }


        let user = await User.findOne({ email })
        // Verificando existência do usuário
        if (!user)
            return res.status(404).json({ error: 'Usuário não encontrado!' })

        // Verificando se a senha digitada está correta
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                console.error(err)
                return res.status(500).json({ error: 'Ocorreu um erro ao desencriptar a senha!' })
            } else {
                if (result == 0)
                    return res.status(422).json({ error: "A senha digita está incorreta!" })
                else {
                    // Criando JWT e armazenando-o no cookie
                    console.log('user role --> ' + user.role)
                    const token = jwt.sign({ userID: user._id, userRole: user.role }, secret, { expiresIn: '1h' })
                    // Criando cookie
                    // Os parâmetros do cookie são o 1° que é o nome e o 2° é o token gerado
                    return res.cookie('cookieAuth', token, { maxAge: 30 * 60 * 1000, httpOnly: true, sameSite: 'strict' }).status(201).json({ message: 'Logado com sucesso!', token: token })

                }
            }
        })
    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor' })
        console.log(error)
        return
    }
})

// PÁGINA DE LOGOUT (O logout basicamente seria a exluesão do cookie, onde este contém o JWT, a autorização)
router.delete('/logout', verifyToken, async (req, res) => {
    try {
        const cookie = req.cookies.cookieAuth
        if (!cookie) {
            return res.status(401).json({ message: "Você precisa logar." })
        }
        return res.cookie('cookieAuth', '', { expires: new Date(0), httpOnly: true, sameSite: 'strict' }).status(200).json({ message: "Usuário deslogado com sucesso!" });
    } catch (error) {
        res.status(500).json({ message: "Ocorreu algum erro inesperado!" })
        console.log(error)
        return
    }
})

// PÁGINA DE DELETAR 
router.delete('/del', verifyToken, async (req, res) => {
    try {
        const user_id_DB = req.userID
        // console.log('ID contido na sessão --> ' + user_id_DB)
        const user = await User.findOne({ _id: user_id_DB })
        // console.log('ID contido no banco -->' + user._id)
        // console.log('O usuário existe? '+ user)
        if (!user) {
            return res.status(404).json({ message: "Não existe usuário com este ID!" })
        }
        await user.deleteOne()

        return res.cookie('cookieAuth', '', { expires: new Date(0), httpOnly: true, sameSite: 'strict' })
        .status(200).json({ message: "Usuário excluído com sucesso!" });
    } catch (error) {
        res.status(500).json({ message: "Ocorreu um erro interno no servidor" })
        console.log(error)
        return

    }
})

// PÁGINA DE UPDATE
router.post('/update', verifyToken, async (req, res) => {
    
    try {
        const { id } = req.userID
        const { name, email, password } = req.body

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(403).json({ message: "Este não é um id válido!" })
        }
        
        if (!name || !email || !password) {
            return res.status(422).json({ error : "Você esqueceu de colocar as credenciais corretamente" })
        }

        const user = User.findOne({ _id: id })
        if (!user) {
            return res.status(404).json({ message: 'Este usuário não encontrado!' })
        }
        if (user.name != name) {
            await User.updateOne({ _id: id }, { $set: { name: name } })
        }
        if (user.email != email) {
            await User.updateOne({ _id: id }, { $set: { email: email } })
        }
        bcrypt.compare(password, user.password, async (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Ocorreu um erro' })
            }
            if (result == 0) {
                await User.updateOne({ _id: id }, { $set: { password: user.password } })
            }

            return res.status(200).json({ message: 'Usuário alterado com sucesso!' })
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Ocorreu um erro interno no servidor!" })
    }
    

})






module.exports = router