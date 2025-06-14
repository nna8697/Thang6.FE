import { useNavigate } from "react-router-dom";
import { deleteAllCookies } from "../../helpers/cookies";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { checkLogin } from "../../actions/login";

function Logout() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    deleteAllCookies();

    useEffect(() => {
        dispatch(checkLogin(false));
        navigate("/login");
    }, []);

    return (
        <>
        </>
    );
}

export default Logout;