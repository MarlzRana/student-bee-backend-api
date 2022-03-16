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

function validateEmail() {
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  for (let i = 0; i < arguments.length; i++) {
    if (!emailRegex.test(arguments[i])) {
      return false;
    }
  }
  return true;
}

function validateDOB() {
  const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
  for (let i = 0; i < arguments.length; i++) {
    if (!dobRegex.test(arguments[i])) {
      return false;
    }
  }
  return true;
}

module.exports = {
  validateName: validateName,
  validateUsername: validateUsername,
  validatePassword: validatePassword,
  validateEmail: validateEmail,
  validateDOB: validateDOB,
};
