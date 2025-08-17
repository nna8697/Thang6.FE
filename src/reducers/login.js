// const loginReducer = (state = false, action) => {

//     console.log(state, action);
//     switch (action.type) {
//         case "CHECK_LOGIN":
//             return action.status;
//         default:
//             return state;
//     }
// }

// export default loginReducer;

const initialState = {
    isLoggedIn: false,
    user: null,
};

const loginReducer = (state = initialState, action) => {
    //
    console.log(initialState, action);

    switch (action.type) {
        case "CHECK_LOGIN":
            return {
                isLoggedIn: true,
                user: action.payload,
            };
        case "LOGOUT":
            return {
                isLoggedIn: false,
                user: null,
            };
        default:
            return state;
    }
};

export default loginReducer;
