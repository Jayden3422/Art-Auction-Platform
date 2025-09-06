export default {
    setUser(state, form){
      state.userForm = form;
    },
    setUserFormLogin(state, form){
      state.userForm = form[0];
      state.uid = form[1];
    },
    setGoodInfo(state, form){
      state.goodInfo = form;
    },
    addGood(state){
      state.isAddGood = true;
    },
    editGood(state){
      state.isAddGood = false;
    },
    isAddAdmin(state){
      state.isAddAdmin = true
    },
    clear(state){
      state.adminForm = {
        ADMIN_ID: "",
        ADMIN_NAME: "",
        AVATAR_URL: "",
        PHONE: "",
        ADMIN_PASS: "",
        PASS_SALT: "",
        ADMIN_STATUS: "",
        EMAIL: ""
      }
    },
    isUpdateAdmin(state){
      state.isAddAdmin = false
    },
    setAdminForm(state, form){
      state.adminForm = form
    },
    isAddUser(state){
      state.isAddUser = true
    },
    clearUser(state){
      state.userInfo = {
        USER_ID: '',
        USER_NAME: "",
        EMAIL: "",
        USER_PASS: "",
        POSITION: "",
        USER_INTRO: "",
        AVATAR_URL: "",
        AVATAR_PATH: "",
        PHONE: "",
        PASS_SALT: "",
        USER_STATUS: 0,
        USER_SCORE: 10,
        TOTAL_COST_AMT: 0
      }
    },
    isUpdateUser(state){
      state.isAddUser = false
    },
    setUserForm(state, form){
      state.userInfo = form
    },
    isAddSeller(state){
      state.isAddSeller = true
    },
    clearSeller(state){
      state.sellerForm = {
        SELLER_ID: "",
        SELLER_NAME: "",
        EMAIL: "",
        SELLER_PASS: "",
        POSITION: "",
        SELLER_INTRO: "",
        AVATAR_URL: "",
        AVATAR_PATH: "",
        PHONE: "",
        PASS_SALT: "",
        SELLER_STATUS: 0,
        SELLER_SCORE: 10,
        TOTAL_SELL_AMT: 0
      }
    },
    isUpdateSeller(state){
      state.isAddSeller = false
    },
    setSellerForm(state, form){
      state.sellerForm = form
    },
    setClassList(state, form){
      state.classList = form
    },
}