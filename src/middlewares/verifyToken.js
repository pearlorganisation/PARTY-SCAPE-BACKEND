import jsonwebtoken from "jsonwebtoken";
import chalk from "chalk";
const jwt = jsonwebtoken;

export const verifyTokenMiddleware = async (req, res, next) => {
  try {
    const cookies = req?.cookies;

    const access_token = cookies?.ACCESS_TOKEN_PARTYSCAPE;

    if (access_token === null) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized! Please Check Your Login Credentials!!",
      });
    }

    jwt.verify(
      access_token,
      process.env.JWT_SECRET_KEY,
      async (error, user) => {
        console.log(user);
        try {
          if (error) {
            return res.status(403).json({
              success: false,
              message: `Unauthorized! Please Check Your Login Credentials-${error}`,
            });
          }

          req.userId = user?.userId;

          return next();
        } catch (error) {
          return res.status(403).json({
            success: false,
            message: error.message || "Internal server error!!",
          });
        }
      }
    );
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: error?.message || "Internal server error!!",
    });
  }
};
