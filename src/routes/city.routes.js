const router = require("express").Router();

const cityRouter = require("../controllers/city.controller");

router.get('/info', cityRouter.getCityInfo);

router.get('/tickets', cityRouter.getCityTickets)

module.exports = router;