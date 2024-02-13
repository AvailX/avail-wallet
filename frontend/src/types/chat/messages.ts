export type LastMessage = {
    content: string,
    created_at: Date,
    sender: string,
}

export type EncryptedMessage = {
    id: string,
    room_id: string,
    sender_id: string,
    content: encrypted_data, // ciphertext + nonce 
    metadata: any,
    last_edited: string,
    created_at: string,
}

export type Message = {
    id: string,
    room_id: string,
    sender_id: string,
    content: string,
    type: MessageType,
    metadata: any,
    last_edited: Date,
    created_at: Date,
}

type encrypted_data={
    ciphertext: string,
    nonce: string,
}

// This shall be an extra ciphertext to the message ciphertext and will only be present if type is "transaction"
export type moneyMetadata = {
    sender: string,
    amount: number,
    token: string
}

enum MessageType {
    text = "text",
    transaction = "transaction",
    image = "image",
    video = "video",
    audio = "audio",
    file = "file",
}

export const testMessages: Message[] = [
    {
        id: "1",
        room_id: "1",
        sender_id: "aleo1vrnf8erez2rr6mdezlkprqzsfqf85dc2mxsq7w0l34wwqpalcyzq42c36h",
        content: "Hello, world!",
        type: MessageType.text,
        metadata: {},
        last_edited: new Date(),
        created_at: new Date(),
    },
    {
        id: "2",
        room_id: "1",
        sender_id: "2",
        content: "Hello, world!",
        type: MessageType.text,
        metadata: {},
        last_edited: new Date(),
        created_at: new Date(),
    },
    {
        id: "3",
        room_id: "1",
        sender_id: "aleo1vrnf8erez2rr6mdezlkprqzsfqf85dc2mxsq7w0l34wwqpalcyzq42c36h",
        content: "Hello, world!",
        type: MessageType.text,
        metadata: {},
        last_edited: new Date(),
        created_at: new Date(),
    },
    {
        id: "4",
        room_id: "1",
        sender_id: "2",
        content: "Hello, world!",
        type: MessageType.text,
        metadata: {},
        last_edited: new Date(),
        created_at: new Date(),
    },
    {
        id: "5",
        room_id: "1",
        sender_id: "aleo1vrnf8erez2rr6mdezlkprqzsfqf85dc2mxsq7w0l34wwqpalcyzq42c36h",
        content: "Hello, world!",
        type: MessageType.text,
        metadata: {},
        last_edited: new Date(),
        created_at: new Date(),
    },
    {
        id: "6",
        room_id: "1",
        sender_id: "aleo1vrnf8erez2rr6mdezlkprqzsfqf85dc2mxsq7w0l34wwqpalcyzq42c36h",
        content: "Hello, world!",
        type: MessageType.text,
        metadata: {},
        last_edited: new Date(),
        created_at: new Date(),
    },
    {
        id: "7",
        room_id: "1",
        sender_id: "aleo1vrnf8erez2rr6mdezlkprqzsfqf85dc2mxsq7w0l34wwqpalcyzq42c36h",
        content: "Hello, world!",
        type: MessageType.text,
        metadata: {},
        last_edited: new Date(),
        created_at: new Date(),
    },
    {
        id: "8",
        room_id: "1",
        sender_id: "2",
        content: "Hello, world!",
        type: MessageType.text,
        metadata: {},
        last_edited: new Date(),
        created_at: new Date(),
    },
]