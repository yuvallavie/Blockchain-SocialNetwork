const Token = artifacts.require("SocialCoin");

module.exports = function (deployer) {
  deployer.deploy(Token);
};
