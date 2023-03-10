const express = require("express");
const userController = express.Router();

const userValidator = require("../middleware/validators/user");
const userService = require("../services/userService");
const {
  sendResponse,
  createHash,
  compareHash,
  createJwtToken,
  verifyJwtToken,
  sendMail,
} = require("../utils/common");

userController.post(
  "/register",
  userValidator.register(),
  userValidator.validate,
  async (req, res) => {
    try {
      const isExist = await userService.getOne({ email: req.body.email });
      if (isExist) {
        sendResponse(res, 409, "Failed", { message: "User already exist!" });
      } else {
        req.body.password = createHash(req.body.password);
        const userCreated = await userService.create(req.body);
        delete userCreated.password;
        sendResponse(res, 200, "Success", {
          message: "User registred successfully!",
          userData: userCreated,
        });
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, 500, "Failed", {
        message: error.message || "Internal server error",
      });
    }
  }
);

userController.post(
  "/login",
  userValidator.login(),
  userValidator.validate,
  async (req, res) => {
    try {
      const isExist = await userService.getOne({ email: req.body.email });
      if (isExist) {
        const isPasswordMatch = compareHash(
          req.body.password,
          isExist.password
        );
        if (isPasswordMatch) {
          const { _id, username, email } = isExist;
          const token = createJwtToken({ _id, username, email }, "1d");
          await userService.updateOne({ _id }, { token });
          sendResponse(res, 200, "Success", {
            message: "User logged in successfully!",
            userData: { email, username, token },
          });
        } else {
          sendResponse(res, 401, "Failed", {
            message: "Incorrect password",
          });
        }
      } else {
        sendResponse(res, 404, "Failed", {
          message: "Incorrect email or User not found!",
        });
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, 500, "Failed", {
        message: error.message || "Internal server error",
      });
    }
  }
);

userController.post(
  "/forgot-password",
  userValidator.forgotPassword(),
  userValidator.validate,
  async (req, res) => {
    try {
      const isExist = await userService.getOne({ email: req.body.email });
      if (isExist) {
        const { _id, username, email } = isExist;
        const resetLink =
          process.env.FRONTEND_RESETURL +
          "/" +
          createJwtToken({ _id, username, email }, "10m");
        const info = await sendMail(resetLink);
        sendResponse(res, 200, "Success", {
          message: "Email sent successfully!",
          userData: info,
        });
      } else {
        sendResponse(res, 404, "Failed", {
          message: "Incorrect email or User not found!",
        });
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, 500, "Failed", {
        message: error.message || "Internal server error",
      });
    }
  }
);

userController.post(
  "/reset-password",
  userValidator.resetPassword(),
  userValidator.validate,
  async (req, res) => {
    try {
      const { password, resetString } = req.body;
      const decoded = verifyJwtToken(resetString);
      if (decoded) {
        await userService.updateOne(
          { _id: decoded._id },
          { password: createHash(password) }
        );
        sendResponse(res, 200, "Success", {
          message: "Password reset successfully!",
        });
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, 500, "Failed", {
        message:
          error.message === "jwt expired"
            ? "Password reset link has expired!"
            : error.message || "Internal server error",
      });
    }
  }
);

userController.post("/send-otp", async (req, res) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const verifySid = process.env.TWILIO_VERIFY_SID;

  const client = require("twilio")(accountSid, authToken);
});

module.exports = userController;
