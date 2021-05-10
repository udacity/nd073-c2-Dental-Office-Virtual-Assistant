var express = require("express");
var app = express();

app.get("/", (req, res, next) => {
    res.json({ message: "hello world" })
})

app.get("/availability", (req, res, next) => {
    res.json(["8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm"]);
});

app.post("/schedule", (req, res, next) => {
    res.json(req.body);
});

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});