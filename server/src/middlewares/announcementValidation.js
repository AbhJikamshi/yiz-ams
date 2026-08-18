const announcementValidation = (req, res, next) => {
  const { title, message } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Announcement title is required.",
    });
  }

  if (title.length > 150) {
    return res.status(400).json({
      success: false,
      message: "Announcement title cannot exceed 150 characters.",
    });
  }

  if (!message || message.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Announcement message is required.",
    });
  }

  if (message.length > 5000) {
    return res.status(400).json({
      success: false,
      message: "Announcement message cannot exceed 5000 characters.",
    });
  }

  next();
};

export default announcementValidation;