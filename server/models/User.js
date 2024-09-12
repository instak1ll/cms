const pool = require('../config/database');

class User {
    static async findByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(name, email, password, verificationCode) {
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, verification_code, is_verified) VALUES (?, ?, ?, ?, FALSE)',
            [name, email, password, verificationCode]
        );
        return { id: result.insertId, name, email };
    }

    static async verifyUser(id) {
        await pool.query('UPDATE users SET is_verified = TRUE, verification_code = NULL WHERE id = ?', [id]);
    }
}

module.exports = User;