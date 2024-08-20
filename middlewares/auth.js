const jwt = require('jsonwebtoken')
require('dotenv').config()

const secret = process.env.JWT_TOKEN


function verifyToken(req, res, next) {
    const token = req.cookies.cookieAuth


    // Se o token não existir
    if (!token) return res.status(401).json({ error: "Faça login para acessar!" })
    try {

        // Verificando o token pela chave secret
        const decodedToken = jwt.verify(token, secret)

        // Atribuindo o ID decodificado contido no token ao req.userID 
        req.userID = decodedToken.userID
        req.userRole = decodedToken.userRole
        // console.log('Token Decodificado:', decodedToken)
        next()
    } catch (error) {
        res.status(401).json({ error: 'Token inválido!' })
        console.log(error)
        return
    }
}


function verifyAdmin(req, res, next) {
    try {
        const role = req.userRole
        // Pega a informação do middleware verifyToken e verifica a existência de um  usuário está com a role de admin (true)
        if (role !== true) {
            return res.status(403).json({ message: "Permissão negada!" })
        }
        if (role === true) {
            // Se existir o usuário terá as permissões necessárias e será redirecionado para a função que chamou este middleware
            return next()
        }
        // Se a permissão for false, ele irá constar a permissão negada
        return res.status(403).json({ message: "O usuário não tem as permissões necessárias para entrar no página administrativa!" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Ocorreu algum problema desconhecido!" })
        return
    }
}


module.exports = { verifyToken, verifyAdmin }