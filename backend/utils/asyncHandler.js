// Wraps an async Express handler so any rejected promise (DB timeout,
// network error, etc.) is passed to next() and handled by errorMiddleware,
// instead of becoming an unhandled rejection that crashes the whole server.
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = asyncHandler;
