const otpStore = new Map();

const setOtp = (email, otp, expiry) => {
  otpStore.set(email, { otp, expiry });
};

const getOtp = (email) => {
  return otpStore.get(email);
};

const deleteOtp = (email) => {
  otpStore.delete(email);
};
  
module.exports = { setOtp, getOtp, deleteOtp };