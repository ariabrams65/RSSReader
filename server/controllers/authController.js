function getLoginView(req, res) {
    res.render('login.ejs');
}

function logout(req, res) {
    req.logout(err => {
        if (err) return next(err);
    })
    res.redirect('/login');
}

module.exports = { getLoginView, logout };