const mongoose = require('mongoose')

const nomeDB = 'API_Notes'

async function conexao(){
    mongoose.connect(`mongodb://localhost/${nomeDB}`)
    .then(console.log(`Conexão com o banco de dados ${nomeDB} feita com sucesso!`))
    .catch((err) => console.error('Algum erro ocorreu --> ' + err))
}

conexao()