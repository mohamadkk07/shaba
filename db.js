const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./users.db');

// إنشاء الجدول إذا لم يكن موجوداً
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )
    `);
});

// دالة لإدخال مستخدم جديد
function addUser(username, email, password, callback) {
    const stmt = db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
    stmt.run(username, email, password, function(err) {
        callback(err, this.lastID); // إرجاع الـ ID الجديد للمستخدم
    });
    stmt.finalize();
}


// دالة للتحقق من وجود مستخدم بناءً على اسم المستخدم
function getUserByUsername(username, callback) {
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        callback(err, row); // إرجاع الصف الخاص بالمستخدم أو null إذا لم يكن موجود
    });
}

// دالة لتحديث كلمة مرور المستخدم
function updatePassword(username, newPassword, callback) {
    const stmt = db.prepare("UPDATE users SET password = ? WHERE username = ?");
    stmt.run(newPassword, username, function(err) {
        callback(err, this.changes); // إرجاع عدد التغييرات التي تم إجراؤها
    });
    stmt.finalize();
}

// دالة لحذف المستخدم بناءً على اسم المستخدم
function deleteUser(username, callback) {
    const stmt = db.prepare("DELETE FROM users WHERE username = ?");
    stmt.run(username, function(err) {
        callback(err, this.changes); // إرجاع عدد السجلات التي تم حذفها
    });
    stmt.finalize();
}

module.exports = {
    db,
    addUser,
    getUserByUsername,
    updatePassword,
    deleteUser
};
function getAllUsers(callback) {
    db.all("SELECT id, username, email FROM users", [], (err, rows) => {
        callback(err, rows);
    });
}
module.exports = {
    db,
    addUser,
    getUserByUsername,
    updatePassword,
    deleteUser,
    getAllUsers // أضفنا هذه
};

// دالة لإحضار جميع المستخدمين
function getAllUsers(callback) {
    db.all("SELECT id, username FROM users", [], (err, rows) => {
        callback(err, rows);
    });
}
