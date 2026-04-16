import bcrypt from "bcrypt";
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser {
    name: string;
    email: string;
    password?: string;
    picture?: string;
    newMessages: Record<string, unknown>;
    status: string;
}

export interface IUserDocument extends IUser, Document {
    toJSON(): IUser;
}

export interface IUserModel extends Model<IUserDocument> {
    findByCredentials(email: string, password: string): Promise<IUserDocument>;
}

const UserSchema = new Schema<IUserDocument, IUserModel>(
    {
        name: {
            type: String,
            required: [true, "Can't be blank"],
        },
        email: {
            type: String,
            lowercase: true,
            unique: true,
            required: [true, "Can't be blank"],
            index: true,
            validate: {
                validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
                message: "Invalid email address",
            }
        },
        password: {
            type: String,
            required: [true, "Ne sme biti prazno polje za sifru"],
        },
        picture: {
            type: String,
        },
        newMessages: {
            type: Object,
            default: {},
        },
        status: {
            type: String,
            default: "online",
        },
    },
    { minimize: false },
);

UserSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    if (!this.password) return;

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
});


UserSchema.methods.toJSON = function (): Omit<IUser, "password"> {
    const userObject = this.toObject() as IUser;
    delete userObject.password;
    return userObject;
};

UserSchema.statics.findByCredentials = async function (
    email: string,
    password: string,
): Promise<IUserDocument> {
    const user = await User.findOne({ email });
    if (!user) throw new Error("invalid email or password");
    if (!user.password) throw new Error("invalid email or password");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("invalid email or password");

    return user as IUserDocument;
};

export const User = mongoose.model<IUserDocument, IUserModel>(
    "User",
    UserSchema,
);