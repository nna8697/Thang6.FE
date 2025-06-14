// export const checkLogin = (status) => {

//     return {
//         type: "CHECK_LOGIN",
//         status: status
//     }
// }

//debugger

export const checkLogin = (user) => {
    return {
        type: "CHECK_LOGIN",
        payload: user, // { id, fullname, role, token }
    };
};
