require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const app = express();
const mongoose = require("mongoose");
const indexRouter = require("./routes");
const PORT = process.env.PORT || 8002;

mongoose
  .connect(process.env.DB_URL)
  .then(console.log(`Database Connected Sucessfully`))
  .catch((e) => console.log("Database error", e.toString()));

app.use(express.json());
app.use(morgan("tiny"));
app.use("/assets", express.static("public"));
app.use("/", indexRouter);

app.use((error, req, res, next) => {
  const errMsg = error.toString() || `Something went Wrong.`;
  res.status(500).json({ data: null, error: errMsg });
});

app.listen(PORT, () =>
  console.log(`Application is running sucessfully on http://localhost:${PORT}`),
);
