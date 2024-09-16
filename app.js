const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

// Express uygulaması oluştur
const app = express();
const port = 3000;

// Statik dosyalar için public dizinini kullan
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Session yapılandırması
app.use(session({
  secret: 'asd123', // Bu kısmı güçlü bir secret key ile değiştirin
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // HTTPS kullanıyorsanız 'true' yapabilirsiniz
}));

// MySQL veritabanı bağlantısı
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Veritabanı bağlantısını kontrol et
db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database.');
});

// Ana Sayfa Yönlendirmesi
app.get('/', (req, res) => {
  res.render('index')
  res.sendFile(__dirname + '/views/register');
});
app.get('/register', (req,res) => {
  res.render('registration')
})

// About Sayfası Yönlendirmesi
app.get('/about', (req, res) => {
  res.render('about');  // 'about.ejs' dosyasını render ediyoruz
});

// Kullanıcı Kaydı (Örnek İşlev)
app.post('/register', (req, res) => {
  const { email, password, fullname, age, school ,role } = req.body;

  // Kullanıcı bilgilerini veritabanına ekle
  const query = 'INSERT INTO user (email, password, fullname, age, school, role) VALUES (?, ?, ?, ?, ?, ?)';





  db.query(query, [email, password, fullname, age, school, role], (err, results) => {
    if (err) {
      console.error('Error occurred during registration:', err);
      res.status(500).send('Error occurred during registration.');
    } else {
      //res.status(200).send('Registration successful!');
      res.render('index')
    }
  });
});
/*
app.post('/register', (req, res) => {
  const { email, password, fullname, age, role } = req.body; // 'role' artık var

  // Email adresi var mı kontrol et
  const queryCheck = 'SELECT * FROM users WHERE email = ?';

  db.query(queryCheck, [email], (err, results) => {
    if (err) {
      console.error('Database error: ', err);
      return res.status(500).send('Database error occurred');
    }

    if (results.length > 0) {
      // Email adresi zaten varsa hata döndür
      return res.status(400).send('Email already exists. Please use another email.');
    } else {
      // Eğer email yoksa kullanıcıyı role ile birlikte ekle
      const queryInsert = 'INSERT INTO users (email, password, fullname, age, role) VALUES (?, ?, ?, ?, ?)';
      db.query(queryInsert, [email, password, fullname, age, role], (err, results) => {
        if (err) {
          console.error('Database error: ', err);
          return res.status(500).send('Error occurred during registration.');
        }
        res.send('Registration successful!');
      });
    }
  });
});
*/


app.get('/teacher/dashboard', (req, res) => {
  // Sadece öğretmenler bu sayfayı görebilmeli, role kontrolü ekleyin
  const role = req.session.role; // Session'da öğretmen olup olmadığı kontrol edilmeli

  if (role !== 'teacher') {
    return res.status(403).send('Access denied. Only teachers can access this page.');
  }

  // Öğrenciler ve oyunlarını veritabanından çek
  const query = `
    SELECT user.fullname, user.email
    FROM user WHERE user.role = 'student';
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Error fetching data from the database.');
    }

    // Verileri EJS template'e gönder ve dashboard'u render et
    res.render('teacher_dashboard', { students: results });
  });
});



// Login Sayfası Yönlendirmesi
app.get('/login', (req, res) => {
  res.render('login');
});

// Login İsteklerini İşleyen POST Yönlendirmesi
/*
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Veritabanı sorgusu: Kullanıcının email ve şifresini kontrol et
  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';

  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error('Database error: ', err);
      return res.status(500).send('Database error occurred');
    }

    if (results.length > 0) {
      // Kullanıcı bulundu, giriş başarılı
      res.send('Login successful!');
    } else {
      // Kullanıcı bulunamadı, giriş başarısız
      res.send('Invalid email or password.');
    }
  });
});
*/
/*
app.post('/login', (req, res) => {
  const { email, password, role } = req.body; // Role bilgisi de formdan alınır

  //const query = 'SELECT * FROM users WHERE email = ? AND password = ? AND role = ?';
  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
  
  db.query(query, [email, password, /*role*//*], (err, results) => {
    if (err) {
      console.error('Database error: ', err);
      return res.status(500).send('Database error occurred');
    }

    if (results.length > 0) {
      if (role === 'teacher') {
        res.send('Teacher login successful!');
        // Öğretmenlere özel sayfaya yönlendirme yapabilirsiniz
         res.redirect('/teacher/dashboard');
      } else {
        res.send('Student login successful!');
        // Öğrencilere özel sayfaya yönlendirme yapabilirsiniz
        // res.redirect('/student/dashboard');
      }
    } else {
      res.send('Invalid email, password, or role.');
    }
  });
});
*/

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Veritabanından kullanıcıyı bul
  const query = 'SELECT * FROM user WHERE email = ? AND password = ?';
  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error(err);
      return res.send('Error during login.');
    }

    if (results.length > 0) {
      const user = results[0];

      // Kullanıcı bilgilerini session'a kaydet
      req.session.userId = user.id;
      req.session.role = user.role; // Kullanıcının rolünü session'a kaydediyoruz
      
      // Session'ın doğru kaydedildiğini görmek için log ekleyin
      console.log('Session:', req.session);

      if (user.role === 'teacher') {
        res.redirect('/teacher/dashboard');
      } else {
        res.redirect('/student/dashboard'); // Öğrenci yönlendirmesi
      }
    } else {
      res.send('Invalid email or password.');
    }
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.error(err);
    }
    res.redirect('/');
  });
});



// Sunucuyu Başlat
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
