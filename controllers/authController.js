const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const VerificationCode = require("../models/VerificationCode");

exports.register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      address,
      phone,
      verificationCode,
    } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        code: 400,
        message: "Bu e-posta adresi ile daha önce kayıt olunmuş.",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      address,
      phone,
    });
    await user.save();
    await VerificationCode.deleteOne({
      code: verificationCode,
      type: "register",
    });
    res.status(201).json({
      success: true,
      message: "Kayıt işlemi başarılı. Giriş yapabilirsiniz.",
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        code: 400,
        success: false,
        message: "Lütfen formdaki hataları düzeltin.",
        errors,
      });
    }

    res.status(500).json({
      code: 500,
      success: false,
      message: "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
      error: err.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "E-posta ya da şifre hatalı.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "E-posta ya da şifre hatalı.",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
    });

    const userData = user.toObject();
    delete userData.password;
    delete userData.__v;

    res.status(200).json({
      message: "Giriş başarılı.",
      success: true,
      user: userData,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.",
      error: err.message,
    });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "PROD",
      sameSite: "lax",
    });
    return res.status(200).json({ success: true, message: "Çıkış yapıldı." });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Çıkış yapılırken bir hata oluştu.",
      error: err.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword, verificationCode } = req.body;

    const codeRecord = await VerificationCode.findOne({
      email,
      code: verificationCode,
      type: "resetPassword",
      expiresAt: { $gt: new Date() },
    });

    if (!codeRecord) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz veya süresi dolmuş doğrulama kodu.",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Bu e-posta adresine kayıtlı kullanıcı bulunamadı.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    await VerificationCode.deleteOne({
      code: verificationCode,
      type: "resetPassword",
    });

    return res.status(200).json({
      success: true,
      message: "Şifreniz başarıyla güncellendi.",
    });
  } catch (error) {
    console.error("RESET_PASSWORD_ERROR", error);
    return res.status(500).json({
      success: false,
      message: "Sunucu hatası. Lütfen tekrar deneyin.",
    });
  }
};

exports.sendEmailVerification = async (req, res) => {
  try {
    const { email, type } = req.body;

    const validTypes = ["register", "resetPassword"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "Geçersiz doğrulama türü.",
      });
    }

    const existingCode = await VerificationCode.findOne({
      email,
      type,
      expiresAt: { $gt: new Date() },
    });

    if (existingCode) {
      return res.status(429).json({
        code: 429,
        success: false,
        message:
          "Lütfen daha önce gönderilen kodun süresi dolmadan tekrar istemeyin.",
      });
    }

    let verificationCode = "";
    for (let i = 0; i < 6; i++) {
      verificationCode += Math.floor(Math.random() * 10);
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.yandex.com",
      port: 465,
      secure: true,
      auth: {
        user: "bilgi.coffely@yandex.com",
        pass: process.env.MAIL_PASS,
      },
    });

    const subjects = {
      register: "Coffeely - Kayıt Doğrulama Kodunuz",
      resetPassword: "Coffeely - Şifre Sıfırlama Kodunuz",
    };

    const messages = {
      register: `
        <p style="font-size: 16px; color: #333;">
          Kayıt işleminizi tamamlamak için aşağıdaki doğrulama kodunu kullanabilirsiniz:
        </p>`,
      resetPassword: `
        <p style="font-size: 16px; color: #333;">
          Şifre sıfırlama işlemini tamamlamak için aşağıdaki doğrulama kodunu kullanabilirsiniz:
        </p>`,
    };

    // Önce mail gönderimi dene
    await transporter.sendMail({
      from: '"Coffeely Destek" <bilgi.coffely@yandex.com>',
      to: email,
      subject: subjects[type],
      text: `Doğrulama kodunuz: ${verificationCode}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f7f5f2; padding: 30px;">
          <div style="max-width: 500px; margin: auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            <h2 style="color: #6b4f29; text-align: center;">☕ Coffeely</h2>
            <p style="font-size: 16px; color: #333;">Merhaba,</p>
            ${messages[type]}
            <div style="font-size: 24px; font-weight: bold; color: #6b4f29; text-align: center; margin: 20px 0;">
              ${verificationCode}
            </div>
            <p style="font-size: 14px; color: #666;">Bu kod 2 dakika boyunca geçerlidir. Bu işlemi siz yapmadıysanız, lütfen bu e-postayı dikkate almayın.</p>
            <hr style="margin: 30px 0;">
            <p style="font-size: 12px; color: #aaa; text-align: center;">
              Bu e-posta Coffeely tarafından otomatik olarak gönderilmiştir. Yanıtlamayınız.
            </p>
          </div>
        </div>
      `,
    });

    await VerificationCode.create({
      email,
      code: verificationCode,
      type,
      expiresAt: new Date(Date.now() + 2 * 60 * 1000),
    });

    res.status(200).json({
      success: true,
      message: "Doğrulama kodu e-posta adresinize gönderildi.",
    });
  } catch (error) {
    console.error("Email gönderim hatası:", error);
    res.status(500).json({
      success: false,
      message: "Doğrulama kodu gönderilirken bir hata oluştu.",
    });
  }
};

exports.verifyVerificationCode = async (req, res) => {
  const { code, email } = req.body;

  try {
    const record = await VerificationCode.findOne({
      email,
      code,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "Kod geçersiz ya da süresi dolmuş.",
      });
    }

    res.status(200).json({
      success: true,
      code: 200,
      message: "Kod doğrulandı.",
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      success: false,
      message: "Doğrulama sırasında bir hata oluştu.",
      error: err.message,
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ success: false, message: "Yetkisiz." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Kullanıcı bulunamadı." });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    return res.status(401).json({ success: false, message: "Token geçersiz." });
  }
};
