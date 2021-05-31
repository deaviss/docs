import React, { useCallback, useEffect, useState } from 'react'
import Quill from "quill"
import "quill/dist/quill.snow.css"
import { io } from 'socket.io-client'
import { useParams } from 'react-router-dom'

const SAVE_TIME = 2000
const OPTIONS = [
	[{ header: [1, 2, 3, 4, 5, 6, false] }],
	[{ font: [] }],
	[{ list: "ordered" }, { list: "bullet" }],
	["bold", "italic", "underline"],
	[{ color: [] }, { background: [] }],
	[{ script: 'sub' }, { script: 'super' }],
	[{ align: [] }],
	["image", `blockquote`, `code-block`],
	[`clean`]
]


export default function TextEditor() {
	const { id: documentId } = useParams();
	const [socket, setSocket] = useState();
	const [quill, setQuill] = useState();

	useEffect(() => {
		const sct = io("http://localhost:1234")
		setSocket(sct)

		return () => {
			sct.disconnect();
		}
	}, [])

	useEffect(() => {
		if (socket == null || quill == null) return;
		const handler = (delta, oldDelta, source) => {
			if (source !== 'user') return;
			socket.emit("sendChanges", delta);

		}
		quill.on('text-change', handler)
		return () => {
			quill.off('text-change', handler)
		}
	}, [socket, quill])


	useEffect(() => {
		if (socket == null || quill == null) return;
		const handler = (delta) => {
			quill.updateContents(delta)
		}
		socket.on('receiveChanges', handler)
		return () => {
			socket.off('receiveChanges', handler)
		}
	}, [socket, quill])


	useEffect(() => {
		if (socket == null || quill == null) return;

		socket.once('loadDocument', doc => {
			quill.setContents(doc)
			quill.enable();
		})

		socket.emit('getDocument', documentId)

	}, [socket, quill, documentId])

	useEffect(() => {
		if (socket == null || quill == null) return;

		const interval = setInterval(() => {
			socket.emit("saveDocument", quill.getContents())
		}, SAVE_TIME)

		return () => {
			clearInterval(interval)
		}

	}, [socket, quill])

	const container = useCallback((cnt) => {
		if (cnt === null) return;
		cnt.innerHTML = ''
		const editor = document.createElement("div");
		cnt.append(editor);
		const q = new Quill(editor, { theme: "snow", modules: { toolbar: OPTIONS } });
		q.disable();
		q.setText('Loading . . .')
		setQuill(q)
	}, [])
	return (
		<div id="container" ref={container}>

		</div>
	)
}
