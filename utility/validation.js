// Advanced validation utility
const Validation = {
  // Email validation
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  //   // Password strength validation
  //   isStrongPassword: (password) => {
  //     // At least 8 characters, one uppercase, one lowercase, one number
  //     const strongPasswordRegex =
  //       /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  //     return strongPasswordRegex.test(password);
  //   },

  //   // Phone number validation (basic)
  //   isValidPhone: (phone) => {
  //     const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  //     return phoneRegex.test(phone);
  //   },

  //   // Validate form with multiple fields
  //   validateForm: (fields) => {
  //     const errors = {};

  //     Object.keys(fields).forEach((key) => {
  //       const value = fields[key];

  //       switch (key) {
  //         case "email":
  //           if (!value) errors[key] = "Email is required";
  //           else if (!Validation.isValidEmail(value))
  //             errors[key] = "Invalid email format";
  //           break;

  //         case "password":
  //           if (!value) errors[key] = "Password is required";
  //           else if (!Validation.isStrongPassword(value))
  //             errors[key] =
  //               "Password must be at least 8 characters with uppercase, lowercase, and number";
  //           break;

  //         case "phone":
  //           if (value && !Validation.isValidPhone(value))
  //             errors[key] = "Invalid phone number";
  //           break;

  //         default:
  //           if (!value) errors[key] = `${key} is required`;
  //       }
  //     });

  //     return {
  //       isValid: Object.keys(errors).length === 0,
  //       errors,
  //     };
  //   },
};

export default Validation;
