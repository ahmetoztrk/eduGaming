const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const methodOverride = require("method-override");
require("dotenv").config();

const pageRoute = require("./routes/pageRouter");

// Express uygulaması oluştur
const app = express();
const port = 3000;

// Statik dosyalar için public dizinini kullan
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  methodOverride("_method", {
    methods: ["POST", "GET"],
  })
);

global.userIN = null;

// Session yapılandırması
app.use(
  session({
    secret: "asd123", // Bu kısmı güçlü bir secret key ile değiştirin
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // HTTPS kullanıyorsanız 'true' yapabilirsiniz
  })
);
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
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to MySQL database.");
});

// Öğrenci güncelleme sayfasını gösteren route
app.get("/update-student/:id", (req, res) => {
  const studentId = req.params.id;

  // Veritabanından öğrenci verisini çek
  const query = "SELECT * FROM students WHERE id = ?";
  db.query(query, [studentId], (err, result) => {
    if (err) {
      console.error(err);
      res.send("Error retrieving student data");
    } else {
      if (result.length > 0) {
        // Öğrenci verisini render işlemi sırasında view'e (EJS'e) gönder
        res.render("update_student", { student: result[0] });
      } else {
        res.send("Student not found");
      }
    }
  });
});

// Kullanıcı Kaydı (Örnek İşlev)
app.post("/register", (req, res) => {
  const { email, password, fullname, age, school, role } = req.body;

  // Kullanıcı bilgilerini veritabanına ekle
  const query =
    "INSERT INTO teachers (email, password, fullname, age, school, role) VALUES (?, ?, ?, ?, ?, ?)";

  db.query(
    query,
    [email, password, fullname, age, school, role],
    (err, results) => {
      if (err) {
        console.error("Error occurred during registration:", err);
        res.status(500).send("Error occurred during registration.");
      } else {
        //res.status(200).send('Registration successful!');
        res.render("index");
      }
    }
  );
});

app.get("/teacher/dashboard", (req, res) => {
  // Sadece öğretmenler bu sayfayı görebilmeli, role kontrolü ekleyin
  const role = req.session.role; // Session'da öğretmen olup olmadığı kontrol edilmeli

  if (role !== "teacher") {
    return res
      .status(403)
      .send("Access denied. Only teachers can access this page.");
  }

  // Öğrenciler ve oyunlarını veritabanından çek
  const query = `
    SELECT students.fullname, students.email
    FROM students;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).send("Error fetching data from the database.");
    }

    // Verileri EJS template'e gönder ve dashboard'u render et
    res.render("teacher_dashboard", { students: results });
  });
});

app.use("/", pageRoute);

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Veritabanından kullanıcıyı bul
  const query = "SELECT * FROM teachers WHERE email = ? AND password = ?";
  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error(err);
      return res.send("Error during login.");
    }

    if (results.length > 0) {
      const user = results[0];

      // Kullanıcı bilgilerini session'a kaydet
      req.session.userId = user.id;
      req.session.role = user.role; // Kullanıcının rolünü session'a kaydediyoruz

      // Session'ın doğru kaydedildiğini görmek için log ekleyin
      console.log("Session:", req.session);

      if (user.role === "teacher") {
        res.redirect("/teacher/dashboard");
      } else {
        res.redirect("/student/dashboard"); // Öğrenci yönlendirmesi
      }
    } else {
      res.send("Invalid email or password.");
    }
  });
});

app.post("/add-student", (req, res) => {
  const { fullname, email, password, age } = req.body;
  const query =
    "INSERT INTO students (fullname, email, password, age) VALUES (?, ?, ?, ?)";
  db.query(query, [fullname, email, password, age], (err, result) => {
    if (err) {
      console.error(err);
      return res.send("Error adding student.");
    }
    res.redirect("/teacher/dashboard");
  });
});

app.get("/update-student/:id", (req, res) => {
  const studentId = req.params.id;
  const query = "SELECT * FROM students WHERE id = ?";
  db.query(query, [studentId], (err, result) => {
    if (err) {
      console.error(err);
      return res.send("Error fetching student data.");
    }
    res.render("update_student", { student: result[0] });
  });
});

app.put("/update-student/:id", (req, res) => {
  const studentId = req.params.id;
  const { fullname, email, game_name, score } = req.body;
  const query =
    "UPDATE students SET fullname = ?, email = ?, game_name = ?, score = ? WHERE id = ?";
  db.query(
    query,
    [fullname, email, game_name, score, studentId],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.send("Error updating student.");
      }
      res.redirect("/teacher/dashboard");
    }
  );
});

app.get("/delete-student/:id", (req, res) => {
  const studentId = req.params.id;
  const query = "DELETE FROM student WHERE id = ? AND role = 'student'";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.send("Error deleting student.");
    }
    res.redirect("/teacher/dashboard");
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.error(err);
    }
    res.redirect("/");
  });
});

// Sunucuyu Başlat
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
