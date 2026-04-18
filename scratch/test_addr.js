const { getAddress } = require('viem');
try {
  const addr = "0x3013d50F2C2c2f7b494B4E858D64a02568e647B7";
  console.log("Original:", addr);
  console.log("Checksummed:", getAddress(addr));
} catch (e) {
  console.error(e);
}
