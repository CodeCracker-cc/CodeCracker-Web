const AppError = require('../../../utils/appError');

/**
 * Globaler Error-Handler für den Challenge-Service
 */
const errorHandler = (err, req, res, next) => {
  // Standardwerte für den Fehler
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Entwicklungsumgebung: Sende detaillierte Fehlerinformationen
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } 
  // Produktionsumgebung: Sende nur die notwendigen Informationen
  else {
    // Operationelle, vertrauenswürdige Fehler: Sende Nachricht an Client
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } 
    // Programmier- oder unbekannte Fehler: Sende generische Nachricht
    else {
      console.error('ERROR 💥', err);
      
      res.status(500).json({
        status: 'error',
        message: 'Etwas ist schiefgelaufen!'
      });
    }
  }
};

// Spezifische Fehlerbehandlung für MongoDB-Fehler
const handleCastErrorDB = err => {
  const message = `Ungültiger ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Doppelter Feldwert: ${value}. Bitte verwende einen anderen Wert!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Ungültige Eingabedaten. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Middleware-Funktion zur Fehlerbehandlung
module.exports = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // MongoDB-Fehler behandeln
  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

  // Fehler an den globalen Error-Handler übergeben
  errorHandler(error, req, res, next);
};
