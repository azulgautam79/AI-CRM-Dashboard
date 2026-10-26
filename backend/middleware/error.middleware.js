import { ApiError } from "../utils/ApiError.js";

export const notFound = (req, res, next) => {
    next(
        new ApiError(
            404,
            `Route ${req.method} ${req.originalUrl} not found`
        )
    );
};

//eslint-disable-next-line no-ununsed-vars
export const errorHandler = (err, req, res, next) => {
    let status = err.statusCode || 500;
    let message = err.message || "Internal server error";

    // Mongoose: bad ObjectId
    if (err.name === "CastError") {
        status = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    // Mongoose: duplicate key (e.g. email already registered)
    if (err.code === 11000) {
        status = 409;
        const field = Object.keys(err.keyValue || {})[0] || "field";
        message = `A record with that ${field} already exists`;
    }

    // Mongoose: schema validation
    if (err.name === "ValidationError") {
        status = 400;
        message = Object.values(err.errors)
            .map((e) => e.message)
            .join(", ");
    }

    if (process.env.NODE_ENV !== "production" && status === 500) {
        console.error("💥", err)
    }

    res.status(status).json({
        success: false,
        message,
        ...(process.env.NODE_ENV !== "production" && status === 500
            ? { stack: err.stack }
            : {}),
    });
}
