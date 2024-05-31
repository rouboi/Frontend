var webstore = new Vue({
  el: "#open",
  data: {
    showProduct: true,
    sortOrder: "asc",
    subjects: [],
    cart: [],
    searchInput: "",
    sortBy: "title",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    baseURL: "https://cw2-express.vercel.app/",
  },
  created() {
    this.getLessons();
  },

  methods: {
    async getLessons() {
      var res = await fetch(`${this.baseURL}collection/lessons`);
      this.subjects = await res.json();
    },

    async searchLessons() {
      var query = {
        search: this.searchInput,
        sort: this.sortBy,
        order: this.sortOrder,
      };

      var res = await fetch(`${this.baseURL}search/collection/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(query),
      });
      this.subjects = await res.json();
    },

    async placeOrder() {
      if (this.validateUserName && this.validateUserPhone) {
        var order = {
          cart: [...this.cart],
          firstName: this.firstName,
          lastName: this.lastName,
          phone: this.phoneNumber,
        };

        // Update lessons
        this.cart.forEach((item) => {
          fetch(`${this.baseURL}collection/lessons/${item._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              availableInventory:
                item.availableInventory - this.cartCount(item._id),
            }),
          });
        });

        // Save Order
        await fetch(`${this.baseURL}collection/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(order),
        });
        swal("Success!", "Order submitted successfully!", "success");
        this.cart = [];
        this.showCheckout();
        this.getLessons();
      } else {
        swal("Error!", "Fill all details!", "error");
      }
    },

    showCheckout() {
      this.showProduct = this.showProduct ? false : true;
    },
    addToCart(subject) {
      this.cart.push(subject);
    },
    checkOut() {
      let show = this.cart;
      return show;
    },
    removeCartItem(id) {
      let showcart = this.cart;
      let less = this.subjects;
      for (let i = 0; i < showcart.length; i++) {
        if (id == showcart[i]._id) {
          showcart.splice(i, 1);
        }
      }
      for (let i = 0; i < less.length; i++) {
        if (id == less[i]._id) {
          less[i].stock += 1;
        }
      }
    },

    cartCount(id) {
      let count = 0;
      for (let i = 0; i < this.cart.length; i++) {
        if (this.cart[i]._id === id) {
          count++;
        }
      }
      return count;
    },
  },
  computed: {
    cartItemCount: function () {
      return this.cart.length;
    },

    validateUserName() {
      return (
        /^[a-zA-Z]+$/.test(this.firstName) && /^[a-zA-Z]+$/.test(this.lastName)
      );
    },

    validateUserPhone() {
      return /^\d+$/.test(this.phoneNumber);
    },
  },
});
