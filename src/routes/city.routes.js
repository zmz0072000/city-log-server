const router = require("express").Router();

const cityRouter = require("../controllers/city.controller");

router.get('/', cityRouter.getCity);

module.exports = router;