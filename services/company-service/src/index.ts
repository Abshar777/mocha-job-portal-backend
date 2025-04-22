
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
import companyRouter from "./routers/company.routes"
import subscriptionRouter from "./routers/subscription.routes"
import { seedDefaultSubscriptions } from "./models/subscription.model";


process.on("uncaughtException", (err) => {
    console.log(err);
    console.log("UNCAUGHT Exception! Shutting down ...");
    process.exit(1);
});



dbConnect().then(async () => {
    await seedDefaultSubscriptions()
})
consumeMessages();


const app = express();
const port = process.env.PORT;
const apiRoot = process.env.API_ROOT;


// -------------------------  middleware-------------------------------
// util middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// secuirity middleware
app.use(cors({
    origin: process.env.FRONTEND_LINK,
    methods: ["GET", "PATCH", "POST", "DELETE", "PUT"],
    credentials: true,

}))
app.use(cookieParser())
app.use(helmet())
app.use(mongosanitize())
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
// else app.use(limiter)



// router middleware
app.use(apiRoot + "/company", companyRouter);
app.use(apiRoot + "/subscription", subscriptionRouter);






// error middleware
app.use(notFound);
app.use(errorHandler);

// -------------------------END-middleware-------------------------------



app.listen(port, () => {
    console.log("🟡 company service running on " + port);
});


process.on('unhandledRejection', (error) => {
    console.error('🔴 Unhandled promise rejection:', error)
    process.exit(1)
})

