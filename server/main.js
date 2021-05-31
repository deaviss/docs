const mongoose = require('mongoose')
const Document = require("./schema/Document")
require('dotenv').config()

mongoose.connect(process.env.DB_HOST, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: true,
	useUnifiedTopology: true
}, () => {
	console.log('connected to DB')
})

const io = require('socket.io')(1234, {
	cors: {
		origin: "http://localhost:3000",
		method: ['GET', 'POST']
	}
})

io.on('connection', socket => {
	socket.on("getDocument", async documentId => {
		const document = await findOrCreateDoc(documentId)
		socket.join(documentId)
		socket.emit('loadDocument', document.data);

		socket.on('sendChanges', delta => {
			socket.broadcast.to(documentId).emit("receiveChanges", delta);
		})
		socket.on("saveDocument", async data => {
			await Document.findByIdAndUpdate(documentId, { data })
		})
	})

})

const defaultValue = "Create something awesome!"

const findOrCreateDoc = async id => {
	if (id == null) return;

	const document = await Document.findById(id);
	if (document) return document;
	return await Document.create({ _id: id, data: defaultValue })
}