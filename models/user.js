const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },

    lastname: {
        type: String,
    },

    address: {
        type: String,
    },

    country: {
        type: String,
    },

    phone: {
        type: Number,
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    avatar: {
        url: String,
        filename: String
    },

    isverified: {
        status: {
            type: Boolean,
            default: false
        },
        hash: {
            type: String,
            default: '',
        },
        hashvalidity: {
            type: Number,
            default: 0
        }
    }
}, { timestamps: true });

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema); 