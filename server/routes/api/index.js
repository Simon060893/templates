const router = require("express").Router();

router.all("/", function (req, res) {
    res.json({
        status: true,
        message: "Info about api",
        user: req.user
    });
});

// router.use("/users", require("./users"));
// router.use("/projects", require("./projects"));

module.exports = router;
