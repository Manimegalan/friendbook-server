require("dotenv").config()
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");

const corsOptions = require("./config/corsOptions");
const monogDb = require("./middleware/dbConnection");
const { logger } = require("./middleware/logEvents");
const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5050;

// Secure the app by setting various HTTP headers
app.use(helmet());

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json
app.use(express.json({ limit: "50mb", strict: false }));

//middleware for cookies
app.use(cookieParser());

// Connect to monogDB
app.use(monogDb.connectToDatabase);

// custom middleware logger
app.use(logger);

// routes
app.use("/api", routes);

app.all("*", (req, res) => res.status(404).json({ error: "404 Not Found" }));

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
