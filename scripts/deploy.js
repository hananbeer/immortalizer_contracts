// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  //const lockedAmount = hre.ethers.utils.parseEther("1");

  const TweetImmortalizerFactory = await hre.ethers.getContractFactory("TweetImmortalizer");
  const immortalizer = await TweetImmortalizerFactory.deploy();
  await immortalizer.deployed();

  let tweet_id = 12345678
  let handle = 'harambefiharamb'
  let message = 'the merge is coaming-the merge is coming-the merge is coming-the merge is coming-the merge is coming-the merge is coming-the merge is coming-the merge is coming-the merge is coming-the merge is coming-the merge is coming-the merge is coming-the merge is coming-the merge is coming'
  
  if (!handle.match(/^[a-z0-9_]{1,15}$/gi)) {
    console.error('invalid handle: ', handle)
    return
  }

  if (message.length < 2 || message.length > 280) {
    console.error('illegal message length')
    return
  }

  // uncomment to send contract some ether
  // comment to simulate when unable to send fees
  let balanceTx = await immortalizer.signer.sendTransaction({to: immortalizer.address, value: '100000000000000000', gasLimit: '0x1000000'})
  let balanceRes = await balanceTx.wait()
  
  await hre.network.provider.send("hardhat_setNextBlockBaseFeePerGas", [
    "0x5f5e100", // 0.1 gwei
  ]);

  let before = await immortalizer.signer.getBalance()
  console.log(before)
  let tx = await immortalizer.immortalize(
    tweet_id,
    hre.ethers.utils.toUtf8Bytes(handle),
    hre.ethers.utils.toUtf8Bytes(message),
    Date.now()
  )
  let res = await tx.wait()

  console.log(res)
  // 284897 fee, 316425 gas used
  // leaves 316425 - 284897 = for fixed startup cost
  let after = await immortalizer.signer.getBalance()
  console.log(after)
  console.log('profit: $' + ((after - before) / 1e18 * 1578))
  // profit: $0.009114844284321792
  console.log('done')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
