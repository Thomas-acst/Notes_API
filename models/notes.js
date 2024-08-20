const mongoose = require('mongoose')


const notesSchema = new mongoose.Schema({
    title: {
        type:String,
    },
    content: {
        type:String,
        required:true
    },

    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

/*
 O ObjectId define o tipo do campo como um identificador
único que o MongoDB usa para identificar documentos. 
Quando você usa ObjectId em um campo de um esquema do 
Mongoose e combina isso com a opção ref, o Mongoose entende 
que esse campo é uma referência para um documento em outra 
coleção.
*/
    created_at:{
        type:Date,
        default: Date.now
    },
    updated_at:{
        type:Date,
        default: Date.now
    },
})


module.exports = mongoose.model('Note', notesSchema)