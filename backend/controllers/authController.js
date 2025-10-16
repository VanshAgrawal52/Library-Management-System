const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createAccessToken, createRefreshToken } = require('../utils/token');
const transporter = require('../controllers/mailControllers');

// send cookie with refresh token
// const sendRefreshTokenCookie = (res, token) => {
//   res.cookie('jid', token, {
//     httpOnly: true,
//     // secure: process.env.NODE_ENV === 'production',
//     secure: false, // no HTTPS locally
//     // sameSite: 'lax',
//     sameSite: 'none',    // allow cross-site (5173 → 5000)
//   });
// };
const sendRefreshTokenCookie = (res, token) => {
  console.log('Setting jid cookie:', token);
  res.cookie('jid', token, {
    httpOnly: true,
    secure: false, // Explicitly false for local testing
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
};

// REGISTER
const register = async (req, res) => {
  try {
    const { name, rollNo, department, email, password, role } = req.body;
    // Validate all required fields
    if (!name || !rollNo || !department || !email || !password) {
      return res.status(400).json({ message: 'Name, roll number, department, email, and password are required' });
    }

    // Check for existing email
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) return res.status(409).json({ message: 'Email already registered' });

    // Check for existing rollNo (optional, since schema enforces uniqueness)
    const existingRollNo = await User.findOne({ rollNo });
    if (existingRollNo) return res.status(409).json({ message: 'Roll number already registered' });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      name: name.trim(),
      rollNo: rollNo.trim(),
      department: department.trim(),
      email: email.toLowerCase(),
      password: hashed,
      role: role || 'user',
    });
    await user.save();

    const payload = { id: user._id.toString(), email: user.email, role: user.role, name: user.name, rollNo: user.rollNo, department: user.department };
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);

    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    sendRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      message: 'User registered',
      accessToken,
      user: { id: user._id, name: user.name, rollNo: user.rollNo, department: user.department, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('register error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = await bcrypt.hash(otp, 10);  // store hashed OTP
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Your OTP Code",
        text: `Your OTP is ${otp}. It will expire in 5 minutes.`
      });
    } catch (mailErr) {
      user.otp = null;
      user.otpExpires = null;
      await user.save();
      return res.status(500).json({ message: "Failed to send OTP" });
    }

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error('login error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// VERIFY OTP
const verify_otp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isOtpValid = await bcrypt.compare(otp, user.otp || "");
    if (!isOtpValid || Date.now() > user.otpExpires) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP
    user.otp = null;
    user.otpExpires = null;

    const payload = { id: user._id.toString(), email: user.email, role: user.role, name: user.name, rollNo: user.rollNo, department: user.department };
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);

    user.refreshTokens.push({ token: refreshToken });
    if (user.refreshTokens.length > 10) user.refreshTokens.shift();
    await user.save();

    sendRefreshTokenCookie(res, refreshToken);

    res.json({
      message: "Login successful",
      accessToken,
      user: { id: user._id, name: user.name, rollNo: user.rollNo, department: user.department, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("verify_otp error", error);
    res.status(500).json({ message: "Server error" });
  }
};

// RESEND OTP
const resend_otp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the OTP before storing
    const hashedOtp = await bcrypt.hash(otp, 10); // Use the same salt rounds as initial OTP
    user.otp = hashedOtp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 min
    await user.save();

    // Send OTP email again
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Your OTP Code (Resent)",
      text: `Your new OTP is ${otp}. It will expire in 5 minutes.`
    });

    res.json({ message: "OTP resent to email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// REFRESH TOKEN
const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.jid;
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: 'User not found' });

    const exists = user.refreshTokens.some(rt => rt.token === token);
    if (!exists) return res.status(401).json({ message: 'Refresh token revoked' });

    const newPayload = { id: user._id.toString(), email: user.email, role: user.role, name: user.name, rollNo: user.rollNo, department: user.department };
    const accessToken = createAccessToken(newPayload);
    const newRefreshToken = createRefreshToken(newPayload);

    // Sequential atomic updates (no conflicts)
    await User.findByIdAndUpdate(user._id, { $pull: { refreshTokens: { token } } });
    await User.findByIdAndUpdate(user._id, { $push: { refreshTokens: { token: newRefreshToken } } });


    sendRefreshTokenCookie(res, newRefreshToken);

    res.json({ accessToken });
  } catch (err) {
    console.error('refresh-token error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// LOGOUT
const logout = async (req, res) => {
  try {
    const token = req.cookies.jid;
    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(payload.id);
        if (user) {
          user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== token);
          await user.save();
        }
      } catch {
        // ignore invalid token
      }
    }
    res.clearCookie('jid', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
    res.json({ message: 'Logged out' });
  } catch (err) {
    console.error('logout error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, refreshToken, verify_otp, resend_otp, logout };