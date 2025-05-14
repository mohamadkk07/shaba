const bcrypt = require('bcrypt');
const { updatePassword } = require('./db');

const username = 'mohamadkk7';
const newPassword = 'a159159159';

bcrypt.hash(newPassword, 10).then((hashedPassword) => {
    updatePassword(username, hashedPassword, (err, changes) => {
        if (err) {
            console.error("خطأ أثناء تحديث كلمة المرور:", err.message);
        } else if (changes > 0) {
            console.log("✅ تم تحديث كلمة المرور بنجاح.");
        } else {
            console.log("⚠️ المستخدم غير موجود.");
        }
    });
});
