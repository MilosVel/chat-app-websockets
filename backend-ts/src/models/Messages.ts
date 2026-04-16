import mongoose, { Document, Schema } from "mongoose";

export interface IMessage {
    content: string;
    from: Record<string, unknown>;
    socketid?: string;
    time: string;
    date: string;
    to: string;
}

export interface IMessageDocument extends IMessage, Document { }

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
const MessageSchema = new Schema<IMessageDocument>({
    content: { type: String },
    from: { type: Object },
    socketid: { type: String },
    time: { type: String },
    date: { type: String },
    to: { type: String },
});

export const Message = mongoose.model<IMessageDocument>(
    "Message",
    MessageSchema,
);
