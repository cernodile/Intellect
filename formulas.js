module.exports = {
  getEndSeeds: function (amt) {
    var extraBlock = 0
    var left = amt
    while (left > 0) {
      extraBlock += left / 12
      left = left / 12
    }
    return Math.round((amt + extraBlock) / 4)
  },
  getAvgBlocks: function (M, x = 1) {
    return Math.floor((5 * (M * 4) + 20) / 16 * x)
  },
  getAvgSeeds: function (R, x) {
    return Math.round(x * 4 / (R + 12))
  },
  getAncestralBonusBlocks: function (amt) {
    var extraBlock = 0
    var left = amt * 1.1
    while (left > 0) {
      extraBlock += (1.1 * left) / 12
      left = (left * 1.1) / 12
    }
    return Math.round((amt + extraBlock) / 4)
  }
}
