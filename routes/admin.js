const express = require('express')
const router = express.Router()
const { verifyToken, verifyAdmin } = require('../middlewares/auth.js');
const User = require('../models/users.js')
const Note = require('../models/notes.js')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const secret = process.env.JWT_TOKEN


/*
USERS
*/


// LOGANDO ADMIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(422).json({ error : "Você esqueceu de colocar as credenciais corretamente" })
        }

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado" })
        }
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Erro no servidor ao desencriptar sua senha" })
            }

            if (result == false) {
                return res.status(422).json({ message: "A senha digitada está incorreta" })
            }

            if (user.role !== true){
                return res.status(403).json({message: "Usuário não tem perissão!"})
            }
            const token = jwt.sign({ userID: user._id, userRole: user.role }, secret, { expiresIn: '1h' })
            return res.cookie('cookieAuth', token, { maxAge: 30 * 60 * 1000, httpOnly: true, sameSite: 'strict' }).status(201).json({ message: 'Logado com sucesso na área Administrativa!' })
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Erro interno do servidor" })
    }
})


// VENDO TODOS OS USERS
router.get('/users', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const users = await User.find()
        return res.status(200).json(users)
    } catch (error) {
        console.log(error)
        res.status(403).json({ message: 'Permissão negada' })
        return
    }
})


// DELETANDO USERS
router.delete('/del/:id', verifyToken, verifyAdmin, async (req, res) => {
    // const cookie = req.cookies.cookieAuth
    try {
        const { id } = req.params

        if (!id) {
            return res.status(422).json({ message: "Você não forneceu o ID" })
        }

        const user = await User.find({ _id: id })
        console.log(user)
        if (!user) { // Se o usuário existir
            return res.status(404).json({ message: 'O usuário não existe' })
        }
        if (user.id == req.userID){
            await user.deleteOne()
            return res.cookie('cookieAuth', '', { expires: new Date(0), httpOnly: true, sameSite: 'strict' }).status(200).json({ message: "Seu prórpio usuário foi deletado!" });
        }
        await user.deleteOne()
        return res.status(200).json({ message: 'Usuário deletado com sucesso!' })
    } catch (error) {
        console.log(error)
        
        return res.status(403).json({ message: 'Permissão negada!' })
    }
})


// ADICIONANDO UM USER
router.post('/add', verifyToken, verifyAdmin, async (req, res) => {

    const { name, email, password, role } = req.body
    user = await User.findOne({ email })
    console.log(email)

    if (user) {
        return res.status(409).json({ message: "Este usuário já existe!" })
    }
    try {
        const userNew = new User({ name, email, password, role })
        await userNew.save()
        return res.status(200).json({ message: "Usuário adicionado com sucesso" }).json(userNew)
    } catch (error) {

        return res.status(500).json({ message: "Algum erro interno ocorreu!" })
    }
})


// ATUALIZANDO USER
router.post('/update', verifyToken, verifyAdmin, async (req, res) => {
    const { id, name, email, password, role } = req.body

    if (!id) {
        return res.status(422).json({ message: "Você não forneceu o ID" })
    }

    if (!mongoose.Types.ObjectId.isValid(id)){
        return res.status(422).json({message: "Você digitou um id não válido!"})
    }

    try {
        const user = await User.findOne({ _id: id })
        if (!user) {
            return res.status(400).json({ message: "Não existe este usuário!" })
        }

        if (name != user.name) {
            // O primeiro parâmetro é o filto (pode ter vários) e o segundo é oque deseja mudar
            await User.updateOne({ _id: id }, { $set: { name: name } })
            // user.updateOne não deve ser chamado em uma instância de um documento individual. 
            // return res.status(200).json({message: 'O nome foi alterado!'})
        }
        if (email != user.email) {
            await User.updateOne({ _id: id }, { $set: { email: email } })
            // return res.status(200).json({message: 'O email foi alterado'})
        }



        if (role != user.role) {
            await User.updateOne({ _id: id }, { $set: { role: role } })
            // return res.status(200).json({message: "Permissões de usuário alterado"})


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




/*
NOTAS
*/





// VISUALIZANDO TODAS AS NOTAS - 
router.get('/notes', verifyToken, verifyAdmin, async (req, res) => {
    try {
        notes = await Note.find()
        res.status(200).json(notes)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Aconteceu algum erro interno no servidor!' })
    }
})


// DELETANDO UMA NOTA
router.delete('/notes/del/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(422).json({ message: "Você não forneceu o ID" })
        }

        if (!mongoose.Types.ObjectId.isValid(id)){
            return res.status(403).json({message: "Este não é um id válido!"})
        }
        
        const note = await Note.findOne({ _id: id })
        if (!note) {
            return res.status(403).json({ message: "Esta nota não existe!" })
        }
        await note.deleteOne()
        console.log(note)
        res.status(200).json({ message: "Nota removido com sucesso!" })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Ocorreu um erro interno no servidor!" })
    }
})


// ADICIONANDO UMA NOTA 
router.post('/notes/add', verifyToken , verifyAdmin, async(req, res) => {
    try {
        // PEGANDO O TITLE E O CONTENT DO BODY JUNTAMENTE COM O ID DO USUÁRIO
        const { title, content, id } = req.body

        if (!title || !content || !id) {
            return res.status(422).json({ message: "Você não preencheu as credenciais corretamente" })
        }

        const note = await new Note({ title: title, content: content, author: id }) // PRIMEIRO BANCO DEPOIS VARIÁVEL
        await note.save()
        return res.status(200).json({ message: "Sua nota foi adicionada"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Ocorreu um erro interno do servidor" })
    }

})






// LOGOUT
router.delete('/logout', verifyToken, verifyAdmin, async(req, res) => {
    try {
        const cookie = req.cookies.cookieAuth
        if (!cookie) {
            return res.status(401).json({ message: "Você precisa logar." })
        }
        return res.cookie('cookieAuth', '', { expires: new Date(0), httpOnly: true, sameSite: 'strict' }).status(200).json({ message: "Usuário deslogado do Admin com sucesso!" });
    } catch (error) {
        res.status(500).json({ message: "Ocorreu algum erro inesperado!" })
        console.log(error)
        return
    }
})



module.exports = router