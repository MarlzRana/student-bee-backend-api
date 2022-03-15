function validateName() {
  const nameRegex = /^[a-zA-Z]{2,20}$/;
  for (let i = 0; i < arguments.length; i++) {
    if (!nameRegex.test(arguments[i])) {
      return false;
    }
  }
  return true;
}

function validateUsername() {
  const usernameRegex = /^[a-zA-Z0-9]{2,25}$/;
  for (let i = 0; i < arguments.length; i++) {
    if (!usernameRegex.test(arguments[i])) {
      return false;
    }
  }
  return true;
}

function validatePassword() {
  const passwordRegex = /^(\w| ){8,50}$/;
  for (let i = 0; i < arguments.length; i++) {
    if (!passwordRegex.test(arguments[i])) {
      return false;
    }
  }
  return true;
}

module.exports = {
  validateName: validateName,
  validateUsername: validateUsername,
  validatePassword: validatePassword,
};
