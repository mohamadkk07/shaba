const express = require('express');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const bcrypt = require('bcrypt');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// 📁 مسارات الملفات
const videoDir = path.join(__dirname, 'public/videos');
const clipsDir = path.join(__dirname, 'public/clips');
const cutDir = path.join(clipsDir, 'cut');
const userClipsFile = path.join(__dirname, 'data', 'user_clips.json');
const likesFilePath = path.join(__dirname, 'data', 'likes.json');

// 🛠 إنشاء المجلدات إن لم تكن موجودة
[videoDir, clipsDir, cutDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// 🔧 إعدادات التطبيق
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload());
app.use(session({ secret: 'secret-key', resave: false, saveUninitialized: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/clips', express.static(clipsDir));

// 🖼 إعداد EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 🔒 ميدل وير التحقق من الجلسة
function checkUserAuth(req, res, next) {
    if (req.session?.loggedIn && req.session.user) return next();
    return res.redirect('/user/login');
}

function checkAdminAuth(req, res, next) {
    if (req.session?.loggedIn && req.session.user === 'admin') return next();
    return res.redirect('/login');
}

// ⏱ تحويل الوقت إلى ثواني
function timeToSeconds(time) {
    const parts = time.split(':').map(Number);
    if (parts.length !== 3) return NaN;
    const [h, m, s] = parts;
    return h * 3600 + m * 60 + s;
}

// ✂️ قص فيديو باستخدام ffmpeg
function generateClip(inputPath, start, end, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .setStartTime(start)
            .setDuration(end - start)
            .outputOptions('-c copy')
            .save(outputPath)
            .on('end', resolve)
            .on('error', reject);
    });
}

// 🔐 تسجيل الدخول كأدمن
app.get('/login', (req, res) => res.render('login'));
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'moro') {
        req.session.loggedIn = true;
        req.session.user = 'admin';
        return res.redirect('/admin');
    }
    res.send('بيانات الدخول غير صحيحة');
});

// 📋 لوحة تحكم الأدمن
app.get('/admin', checkAdminAuth, (req, res) => {
    const clipFiles = fs.readdirSync(clipsDir).filter(f => f.endsWith('.mp4'));
    const videoFiles = fs.readdirSync(videoDir).filter(f => f.endsWith('.mp4'));
    const goalVideo = fs.existsSync('goalVideo.txt') ? fs.readFileSync('goalVideo.txt', 'utf8') : '';
    res.render('admin', { clipFiles, videoFiles, goalVideo, session: req.session });
});

// ⛏️ إنشاء مقطع من فيديو
app.post('/generate-clip', checkAdminAuth, async (req, res) => {
    const { filename, startTime, endTime } = req.body;
    const start = timeToSeconds(startTime);
    const end = timeToSeconds(endTime);
    const clipId = Math.random().toString(36).substring(2, 10);
    const inputPath = path.join(videoDir, filename);
    const outputPath = path.join(clipsDir, `${clipId}.mp4`);

    try {
        await generateClip(inputPath, start, end, outputPath);
        res.redirect(`/clip/${clipId}.mp4`);
    } catch {
        res.send("فشل في إنشاء المقطع");
    }
});

// 🥅 تحديد هدف الأسبوع
app.post('/admin/set-goal', checkAdminAuth, (req, res) => {
    fs.writeFileSync('goalVideo.txt', req.body.goalVideo);
    res.redirect('/admin');
});

// 🧑‍💻 مشاركة مقطع من قبل المستخدم
app.post('/share-clip', checkUserAuth, async (req, res) => {
    const { filename, startTime, endTime } = req.body;
    const start = timeToSeconds(startTime);
    const end = timeToSeconds(endTime);
    const inputPath = path.join(clipsDir, filename);
    const clipId = Math.random().toString(36).substring(2, 10);
    const outputFilename = `${clipId}.mp4`;
    const outputPath = path.join(cutDir, outputFilename);

    try {
        await generateClip(inputPath, start, end, outputPath);
        const allClips = fs.existsSync(userClipsFile)
            ? JSON.parse(fs.readFileSync(userClipsFile))
            : [];

        allClips.push({ filename: outputFilename, user: req.session.user, createdAt: new Date().toISOString() });
        fs.writeFileSync(userClipsFile, JSON.stringify(allClips, null, 2));

        res.json({ success: true, message: 'تم مشاركة المقطع', clipUrl: `/clips/cut/${outputFilename}` });
    } catch {
        res.send("خطأ أثناء مشاركة المقطع");
    }
});

// 💜 تسجيل إعجاب بالمقطع
app.post('/like-video', (req, res) => {
    // التأكد من أن المستخدم مسجل دخوله
    if (!req.session.loggedIn) {
        return res.json({ success: false, message: "لم يتم تسجيل الإعجاب. تأكد من تسجيل الدخول." });
    }

    const videoId = req.body.videoId;
    const username = req.session.user;

    if (!videoId || !username) {
        return res.json({ success: false, message: "معرف الفيديو أو المستخدم غير موجود." });
    }

    // قراءة ملف الإعجابات
    const likes = fs.existsSync(likesFilePath)
        ? JSON.parse(fs.readFileSync(likesFilePath))
        : {};

    if (!likes[videoId]) {
        likes[videoId] = [];
    }

    const index = likes[videoId].indexOf(username);
    let liked;

    if (index === -1) {
        likes[videoId].push(username);
        liked = true;
    } else {
        likes[videoId].splice(index, 1);
        liked = false;
    }

    // حفظ الإعجابات في الملف
    fs.writeFileSync(likesFilePath, JSON.stringify(likes, null, 2));

    const likeCount = likes[videoId].length;
    res.json({ success: true, liked, likeCount });
});

// 🏠 الصفحة الرئيسية
app.get('/', (req, res) => {
    const files = fs.readdirSync(cutDir).filter(f => f.endsWith('.mp4'));
    const goalVideo = fs.existsSync('goalVideo.txt') ? fs.readFileSync('goalVideo.txt', 'utf8') : '';
    const likes = fs.existsSync(likesFilePath) ? JSON.parse(fs.readFileSync(likesFilePath)) : {};
    const userClips = fs.existsSync(userClipsFile) ? JSON.parse(fs.readFileSync(userClipsFile)) : [];

    const videoFiles = files.map(filename => {
        const clip = userClips.find(c => c.filename === filename);
        return { filename, username: clip ? clip.user : 'مجهول' };
    });

    res.render('index', { videoFiles, goalVideo, session: req.session, likes });
});

// 📺 عرض مقطع فردي
app.get('/clip/:clipName', (req, res) => {
    res.render('clip', { clipName: req.params.clipName });
});

// ✅ تسجيل مستخدم جديد
app.get('/user/signup', (req, res) => res.render('user-signup'));
app.post('/user/signup', async (req, res) => {
    const { username, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    db.addUser(username, email, hashed, (err) => {
        if (err) return res.send("اسم المستخدم موجود مسبقًا");
        req.session.user = username;
        req.session.loggedIn = true;
        res.redirect('/user/home');
    });
});

// 🔓 تسجيل دخول مستخدم
app.get('/user/login', (req, res) => res.render('user-login'));
app.post('/user/login', (req, res) => {
    const { username, password } = req.body;
    db.getUserByUsername(username, async (err, user) => {
        if (err || !user) return res.send("المستخدم غير موجود");
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.send("كلمة المرور خاطئة");
        req.session.user = username;
        req.session.loggedIn = true;
        res.redirect('/user/home');
    });
});

// 🚪 تسجيل الخروج
app.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/user/login'));
});

// 🧑‍💼 صفحة المستخدم الرئيسية
app.get('/user/home', checkUserAuth, (req, res) => {
    res.render('user-home', { user: req.session.user, session: req.session });
});

// 📜 صفحة الملف الشخصي للمستخدم
app.get('/user/profile', checkUserAuth, (req, res) => {
    const username = req.session.user;
    
    // جلب المقاطع التي رفعها المستخدم
    const clips = fs.existsSync(userClipsFile)
        ? JSON.parse(fs.readFileSync(userClipsFile)).filter(c => c.user === username)
        : [];

    // تمرير بيانات المستخدم والمقاطع للقالب
    res.render('user-profile', { user: req.session.user, clips: clips, session: req.session });
});

// بدء السيرفر
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
// عرض مقاطع المستخدم
app.get('/user/:username/clips', checkUserAuth, (req, res) => {
    const username = req.params.username;

    // جلب المقاطع الخاصة بالمستخدم
    const clips = fs.existsSync(userClipsFile)
        ? JSON.parse(fs.readFileSync(userClipsFile)).filter(c => c.user === username)
        : [];

    // تمرير بيانات المقاطع واسم المستخدم للقالب
    res.render('user-clips', { username: username, clips: clips, session: req.session });
});
