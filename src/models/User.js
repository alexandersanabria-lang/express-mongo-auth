import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    roles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role'
    }],
    name: {
        type: String
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    birthdate: {
        type: Date,
        required: true,
        validate: {
            validator: (value) => value <= new Date(),
            message: 'La fecha de nacimiento no puede ser futura'
        }
    },
    url_profile: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            delete ret.password; // nunca devolver el hash en las respuestas
            return ret;
        }
    },
    toObject: { virtuals: true }
});

// Campo calculado: edad (no se guarda en la BD, se calcula al leer)
UserSchema.virtual('age').get(function () {
    if (!this.birthdate) return null;
    const today = new Date();
    let age = today.getUTCFullYear() - this.birthdate.getUTCFullYear();
    const monthDiff = today.getUTCMonth() - this.birthdate.getUTCMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getUTCDate() < this.birthdate.getUTCDate())) {
        age--;
    }
    return age;
});

export default mongoose.model('User', UserSchema);