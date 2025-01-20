const AppError = require('./appError');

class Validators {
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError('Ungültige E-Mail-Adresse', 400);
    }
    return true;
  }

  static validatePassword(password) {
    if (password.length < 8) {
      throw new AppError('Passwort muss mindestens 8 Zeichen lang sein', 400);
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);

    if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
      throw new AppError('Passwort muss Groß- und Kleinbuchstaben, Zahlen und Sonderzeichen enthalten', 400);
    }
    
    return true;
  }

  static validateUsername(username) {
    if (username.length < 3 || username.length > 20) {
      throw new AppError('Benutzername muss zwischen 3 und 20 Zeichen lang sein', 400);
    }
    
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      throw new AppError('Benutzername darf nur Buchstaben, Zahlen, Unterstriche und Bindestriche enthalten', 400);
    }
    
    return true;
  }

  static validateCode(code, language) {
    const maxLength = 10000; // 10KB
    if (code.length > maxLength) {
      throw new AppError('Code ist zu lang', 400);
    }

    // Prüfe auf potenziell gefährliche Befehle
    const dangerousPatterns = [
      'System.exit',
      'Runtime.getRuntime()',
      'ProcessBuilder',
      'eval(',
      'exec('
    ];

    if (dangerousPatterns.some(pattern => code.includes(pattern))) {
      throw new AppError('Code enthält nicht erlaubte Befehle', 400);
    }

    return true;
  }
}

module.exports = Validators; 