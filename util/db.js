const mongoose = require("mongoose");

module.exports = (mongoUri) => {
  if (global.MONGO_CONNECTION) return global.MONGO_CONNECTION;

  mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });

  const connection = mongoose.connection;
  connection.on("error", () => {
    console.error(`MongoDB: ${mongoUri} connect failed!`);
  });
  connection.once("open", () => {
    console.log(`MongoDB: ${mongoUri} connect success!`);
  });

  global.MONGO_CONNECTION = connection;

  return connection;
};
