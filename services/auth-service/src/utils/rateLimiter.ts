import rateLimit from "express-rate-limit";

const limiter = rateLimit({
    max: 3000,
    windowMs: 60 * 60 * 1000, // In one hour
    message: {
        status: 429,
        message: "Too many Requests from this IP, please try again in an hour!",
      },
});

export default limiter;