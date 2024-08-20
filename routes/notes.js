const express = require('express')
const { verifyToken, verifyAdmin } = require('../middlewares/auth.js');
const router = express.Router()
const Note = require('../models/notes.js');
const { verify } = require('jsonwebtoken');
const mongoose = require('mongoose')


// PÁGINA DE CRIAÇÃO DE NOTAS
router.post('/add', verifyToken, async (req, res) => {
    const { title, content } = req.body

    if (!title || !content) {
        return req.status(422).json({ message: "As credenciais não foram colocadas corretamante!" })
    }

    try {
        const note = new Note({ title, content, author: req.userID })
        await note.save()
        res.status(200).json({ message: 'Nota salva com sucesso!', note })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Ocorreu algum erro no servidor!" })
    }
})


// PÁGINA DE REMOÇÃO DE NOTAS
router.delete('/delete/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params
        console.log({ id })


        if (!id) {
            return res.status(422).json({ message: "Você não preencheu as credenciais corretamente" })
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(422).json({ message: "O ID da URL não é um id não válido!" })
        }

        const note_exists = await Note.findOne({ _id: id })

        if (!note_exists || note_exists == null) {
            return res.status(401).json({ message: "Esta nota não existe!" })
        }
        const owner = Note.findOne({ author: req.userID })
        console.log(owner)
        if (!owner) {
            return res.status(400).json({ message: "Você não é dono dessa nota!" })
        }

        await note_exists.deleteOne()
        return res.status(200).json({ message: "Nota deletada com sucesso!" })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Ocorreu algum erro interno no servidor." })
    }
})


// PÁGINA DE VISUALIZAÇÃO DE SUAS NOTAS
router.get('/', verifyToken, async (req, res) => {
    try {
        const owner = await Note.find({ author: req.userID })
        if (!owner) {
            res.status(400).json({ message: "Não existem notas deste autor!" })
        }
        const notes = await Note.find({ author: req.userID })
        res.status(200).json(notes)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Ocorreu algum erro no servidor!" })
    }
})


// PÁGINA DE UPDATE
router.post('/update/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params // PEGANDO OS ID's DA NOTA NO PARÂMETRO
        const { title, content } = req.body // PEGANDO AS INFORMAÇÕES CONTIDAS NO BODY 
    

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(403).json({ message: "Este não é um id válido!" })
        }


        const note = await Note.findOne({ _id: id, author: req.userID }) // VERIFICANDO EXISTÊNCIA DE NOTAS E SE É O DONO DA NOTA


        if (!note) {
            return res.status(403).json({ message: "Você não tem notas!" })
        }
        if (title != note.title) {
            await Note.updateOne({ _id: id }, { $set: { title: title } })
        }
        if (content != note.content) {
            await Note.updateOne({ _id: id }, { $set: { content: content } })
        }
        return res.status(200).json({ message: 'Tudo ocorreu como esperado!' })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Falha interna no servidor!' })
    }
})







module.exports = router