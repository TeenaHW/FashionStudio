const router = require("express").Router();
let feedback = require("../models/feedback");
const nodemailer = require("nodemailer");

router.route("/add").post(async (req, res) => {
    const { customerName, email, comment, productItem, rating } = req.body;
    const date = req.body.date ? new Date(req.body.date) : new Date();
  
    const newfeedback = new feedback({
      customerName,
      email,
      comment,
      productItem,
      rating,
      date,
    });
  
    try {
      await newfeedback.save();
  
      // Send Thank You Email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'cocohub876@gmail.com',    // 👈 Replace here
          pass: 'rkzg anvh dzds onau'                // 👈 Replace with Gmail App Password
        }
      });
  
      const mailOptions = {
        from: 'cocohub876@gmail.com',
        to: email,
        subject: 'Thank You for Your Feedback! 🌴',
        html: `
          <h2>Hi ${customerName || 'Valued Customer'},</h2>
          <p>Thank you for sharing your feedback about <b>${productItem}</b>.</p>
          <p>Your opinion helps CocoHub to grow better! 🌟</p>
          <br/>
          <p>Best wishes,<br/>CocoHub Team 🥥</p>
        `
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Failed to send Thank You email:", error);
        } else {
          console.log('Thank You email sent: ' + info.response);
        }
      });
  
      res.json("Feedback Added and Thank You Email Sent ✅");
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to add feedback" });
    }
  });
  
  // GET ALL FEEDBACKS
  router.route("/").get((req, res) => {
    feedback.find()
      .then((feedbacks) => {
        const formattedFeedbacks = feedbacks.map(fb => ({
          ...fb._doc,
          date: new Date(fb.date).toLocaleString("en-US", { timeZone: "Asia/Colombo" }),
        }));
        res.json(formattedFeedbacks);
      })
      .catch((err) => console.log(err));
  });
  
  // UPDATE FEEDBACK
  router.route("/update/:id").put(async (req, res) => {
    let userID = req.params.id;
    const { customerName, email, comment, productItem, rating } = req.body;
  
    const updateFeedback = {
      customerName,
      email,
      comment,
      productItem,
      rating,
      updatedAt: new Date()
    };
  
    await feedback.findByIdAndUpdate(userID, updateFeedback)
      .then(() => {
        res.status(200).send({ status: "User Updated" });
      })
      .catch((err) => {
        res.status(500).send({ status: "Error with Updating data", error: err.message });
      });
  });
  
  // DELETE FEEDBACK
  router.route("/delete/:id").delete(async (req, res) => {
    let userID = req.params.id;
  
    await feedback.findByIdAndDelete(userID)
      .then(() => {
        res.status(200).send({ status: "user deleted" });
      })
      .catch((err) => {
        console.log(err.message);
        res.status(500).send({ status: "Error with delete user", error: err.message });
      });
  });
  
  // GET FEEDBACK BY ID
  router.route("/get/:id").get(async (req, res) => {
    let userID = req.params.id;
  
    await feedback.findById(userID)
      .then((feedback) => {
        res.status(200).send({ status: "User Fetched", feedback });
      })
      .catch((err) => {
        console.log(err.message);
        res.status(500).send({ status: "Error with get user", error: err.message });
      });
  });
  
  module.exports = router;