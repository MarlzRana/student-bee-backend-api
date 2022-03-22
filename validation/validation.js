function validateName() {
  const nameRegex = /^([a-zA-Z]|-){2,25}$/;
  for (let i = 0; i < arguments.length; i++) {
    if (!nameRegex.test(arguments[i])) {
      return false;
    }
  }
  return true;
}

function validateMediumName() {
  const nameRegex = /([a-zA-Z]|-){2,51}/;
  for (let i = 0; i < arguments.length; i++) {
    if (!nameRegex.test(arguments[i])) {
      return false;
    }
  }
  return true;
}

function validateLongName() {
  const nameRegex = /([a-zA-Z]|-){2,60}/;
  for (let i = 0; i < arguments.length; i++) {
    if (!nameRegex.test(arguments[i])) {
      return false;
    }
  }
  return true;
}

function validateDate() {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  for (let i = 0; i < arguments.length; i++) {
    if (!dateRegex.test(arguments[i])) {
      return false;
    }
  }
  return true;
}

function validateDateTime() {
  return true;
}

function validateUsername() {
  const usernameRegex = /^[a-zA-Z0-9]{4,25}$/;
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
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  for (let i = 0; i < arguments.length; i++) {
    if (!emailRegex.test(arguments[i])) {
      return false;
    }
  }
  return true;
}

function validateInternationalPhoneNumber() {
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  for (let i = 0; i < arguments.length; i++) {
    if (!phoneRegex.test(arguments[i])) {
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

function validateShortDescription() {
  const descriptionRegex = /^\w{0,300}$/;
  for (let i = 0; i < arguments.length; i++) {
    if (!descriptionRegex.test(arguments[i])) {
      return false;
    }
  }
  return true;
}

function validateBio() {
  const descriptionRegex = /^(\w|\s){0,150}$/;
  for (let i = 0; i < arguments.length; i++) {
    if (!descriptionRegex.test(arguments[i])) {
      return false;
    }
  }
  return true;
}

function validateStudentYear() {
  const descriptionRegex = /^\w{1,10}$/;
  for (let i = 0; i < arguments.length; i++) {
    if (!descriptionRegex.test(arguments[i])) {
      return false;
    }
  }
  return true;
}

module.exports = {
  validateName: validateName,
  validateMediumName: validateMediumName,
  validateLongName: validateLongName,
  validateUsername: validateUsername,
  validateDate: validateDate,
  validateDateTime: validateDateTime,
  validatePassword: validatePassword,
  validateEmail: validateEmail,
  validateInternationalPhoneNumber: validateInternationalPhoneNumber,
  validateDOB: validateDOB,
  validateShortDescription: validateShortDescription,
  validateBio: validateBio,
  validateStudentYear: validateStudentYear,
};

// /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
