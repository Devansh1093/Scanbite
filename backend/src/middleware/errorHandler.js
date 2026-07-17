const { ZodError } = require('zod');

function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Invalid request',
      details: err.errors.map((e) => ({ path: e.path, message: e.message })),
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate resource', details: err.keyValue });
  }

  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
}

module.exports = errorHandler;
