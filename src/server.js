const { app, connectDb } = require("./index");

connectDb().then(() => {
  app.listen(process.env.PORT, "0.0.0.0", () => {
    console.log(`Server is successfully listening on port ${process.env.PORT}`);
  });
});