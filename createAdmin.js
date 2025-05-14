const bcrypt = require('bcrypt');
const { addUser } = require('./db');

const username = 'mohamadkk7';
const password = 'a159159159';

bcrypt.hash(password, 10).then((hashedPassword) => {
    addUser(username, hashedPassword, (err, userId) => {
        if (err) {
            console.error("فشل في إنشاء الأدمن:", err.message);
        } else {
            console.log(`تم إنشاء الأدمن بالمعرّف: ${userId}`);
        }
    });
});
