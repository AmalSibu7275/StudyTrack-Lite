export function getFirebaseErrorMessage(error: any): string {
  const code = error?.code;

  switch (code) {
    // Login errors
    case "auth/user-not-found":
      return "No account found with this email.";

    case "auth/wrong-password":
      return "Incorrect password. Please try again.";

    case "auth/invalid-credential":
      return "Invalid email or password.";

    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/user-disabled":
      return "This account has been disabled.";

    case "auth/too-many-requests":
      return "Too many attempts. Try again later.";

    // Signup errors
    case "auth/email-already-in-use":
      return "An account already exists with this email.";

    case "auth/weak-password":
      return "Password should be at least 6 characters.";

    // Password reset
    case "auth/missing-email":
      return "Please enter your email address.";

    case "auth/invalid-recipient-email":
      return "This email address is invalid.";

    // Default fallback
    default:
      return "Something went wrong. Please try again.";
  }
}