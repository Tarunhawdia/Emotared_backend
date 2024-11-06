// app.js
const express = require("express");
const identifyRoutes = require("./routes/identify");

const app = express();

app.use(express.json()); // Parse JSON payloads
app.use("/identify", identifyRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
