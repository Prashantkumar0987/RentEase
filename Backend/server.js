const express = require("express");

const app = express();

const PORT = 5000;

app.get("/", function (req, res) {
    res.send("RentEase Backend is Running!");
});

app.listen(PORT, function () {
    console.log(`Server running on http://localhost:${PORT}`);
});