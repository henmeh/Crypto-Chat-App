Moralis.Cloud.beforeSave(
  "Message",
  async (request) => {
    const query = new Moralis.Query("EthBalance");
    query.equalTo("address", request.user.get("ethAddress"));
    const result = await query.first();
    const ethbalance = result.get("balance");
    const ethbalanceFloat = parseInt(ethbalance) / 1000000000000000000;
    logger.info(ethbalanceFloat.toString());
  },
  {
    fields: {
      text: {
        required: true,
        options: (ethbalanceFloat) => {
          return ethbalanceFloat > 1.0;
        },
        error: "Not enough eth",
      },
    },
  }
);
