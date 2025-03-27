import express from "express";
import path from "path";
const app = express();

const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, "dist")));

// console.log("Path :- ", path.join(__dirname, "dist"));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
