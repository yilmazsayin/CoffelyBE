const User = require("../models/User");

exports.getUserInfo = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("-password -__v");
    if (!user) {
      return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı" });
    }
    return res.status(200).json({success: true, data: user});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Sunucu hatası" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı" });
    }

    await User.findByIdAndDelete(userId);

    return res.status(200).json({ success: true, message: "Kullanıcı başarıyla silindi" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Sunucu hatası" });
  }
};
