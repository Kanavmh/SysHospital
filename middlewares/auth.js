// This middleware ensures that the user is logged in before accessing the booking page
module.exports = function (req, res, next) {
    if (!req.user) {
        return res.redirect('/login'); // Redirect to login page if not logged in
    }
    next();
};
