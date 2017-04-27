module.exports = {
  events: {
    didSave: function(segment) {
      console.log('Segment ' + segment.meta.linkHash + ' was saved!');
    }
  },

  init: function(seller, lot, initialPrice) {
    if (!seller) {
      return this.reject('seller is required');
    }

    if (!lot) {
      return this.reject('lot is required');
    }

    if (!initialPrice) {
      return this.reject('initial price is required');
    }

    this.state.seller = seller;
    this.state.lot = lot;
    this.state.initialPrice = initialPrice;
    this.meta.priority = 0;

    this.append();
  },

  bid: function(buyer, bidPrice) {
    if (!buyer) {
      return this.reject('buyer is required');
    }

    if (!bidPrice) {
      return this.reject('bid price is required');
    }

    this.state.buyer = buyer;
    this.state.bidPrice = bidPrice;
    this.meta.priority++;

    this.append();
  },

  finalize: function() {
    this.meta.priority++;

    this.append();
  }


};
