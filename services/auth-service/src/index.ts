
import express from "express";
import { errorHandler, notFound } from "./middleware/errorMiddleware";
import dbConnect from "./config/mongoDb";
import cookieParser from "cookie-parser"
import consumeMessages from "./utils/consumeMessages";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import mongosanitize from "express-mongo-sanitize"
import limiter from "./utils/rateLimiter";
import authRouter from "./routers/auth.routes"



process.on("uncaughtException", (err) => {
    console.log(err);
    console.log("UNCAUGHT Exception! Shutting down ...");
    process.exit(1);
});



dbConnect();
consumeMessages();

const app = express();
const port = process.env.PORT;
const apiRoot = process.env.API_ROOT;


// -------------------------  middleware-------------------------------
// util middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


// secuirity middleware
app.use(cors({
    origin: "*",
    methods: ["GET", "PATCH", "POST", "DELETE", "PUT"],
    credentials: true,
}))
app.use(helmet())
app.use(mongosanitize())
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
else app.use(limiter)


// router middleware
app.use(apiRoot+"/auth",authRouter);


// error middleware
app.use(notFound);
app.use(errorHandler);

// -------------------------END-middleware-------------------------------


app.listen(port, () => {
    console.log("🟡 message service running on " + port);
});


process.on('unhandledRejection', (error) => {
    console.error('🔴 Unhandled promise rejection:', error)
    process.exit(1)
})

