import { FunctionComponent, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../contex/UserContext";
import useToken from "../costome Hooks/useToken";
import { getUserById, loginIn } from "../services/userServices";
import { errorMsg, successMsg } from "../services/toastify";
import * as yup from "yup";
import { FormikValues, useFormik } from "formik";
import { UserLogin } from "../interface/User";
import { jwtDecode } from "jwt-decode";
import { ThemeContext } from "../services/darklightTeme";

interface LoginProps {}

const Login: FunctionComponent<LoginProps> = () => {
    const navigate = useNavigate();
    const theme = useContext(ThemeContext);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { isAdmin, auth, setAuth, setIsAdmin, setIsBusiness, setIsLogedIn } =
        useUserContext();
    const { decodedToken } = useToken();
    useEffect(() => {
        if (decodedToken && localStorage.token) {
            setIsLogedIn(true);
            navigate("/");
        } else {
            setIsLogedIn(false);
            return;
        }
    }, [decodedToken]);
    useEffect(() => {
        try {
            if (decodedToken && decodedToken._id)
                getUserById(decodedToken._id)
                    .then(() => {
                        setAuth({ ...decodedToken, isAdmin: isAdmin });
                        setIsAdmin(decodedToken.isAdmin);
                        setIsBusiness(auth?.isBusiness as boolean);
                        setIsLogedIn(true);
                    })
                    .catch((err) => {
                        successMsg(err);
                        return;
                    });
        } catch (err) {
            errorMsg("Failed to find user");
            console.error(err);
        }
    }, []);

    const validationSchema = yup.object({
        email: yup
            .string()
            .required("Email is required")
            .email("Invalid email format")
            .min(5, "Email must be at least 5 characters long"),
        password: yup
            .string()
            .required("Password is required")
            .min(7, "Password must be at least 7 characters long")
            .max(20, "Password must be at most 20 characters long"),
    });
    const formik: FormikValues = useFormik<UserLogin>({
        initialValues: { email: "", password: "" },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            setIsLoading(true);
            loginIn(values)
                .then((res) => {
                    setIsLoading(false);
                    localStorage.setItem("token", res.data);
                    navigate("/");
                    const deco = jwtDecode(res.data);
                    successMsg(`Welcome Back! 🦄 ${deco.nbf}`);
                })
                .catch((err) => {
                    setIsLoading(false);
                    errorMsg("Login failed, please try again.");
                });
        },
    });
    return (
        <main style={{ backgroundColor: theme.background, color: theme.color }}>
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <form
                        onSubmit={formik.handleSubmit}
                        className="login shadow-lg p-4 rounded-4 border">
                        <h2 className="text-center text-primary mb-4">Login</h2>
                        <div className="form-floating mb-3">
                            <input
                                type="email"
                                autoComplete="off"
                                className={`form-control ${
                                    formik.touched.email && formik.errors.email
                                        ? "is-invalid"
                                        : ""
                                }`}
                                id="email"
                                name="email"
                                placeholder="name@example.com"
                                value={formik.values.email}
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                disabled={isLoading}
                                aria-label="Email address"
                            />
                            {formik.touched.email && formik.errors.email && (
                                <div className="invalid-feedback">
                                    {formik.errors.email}
                                </div>
                            )}
                            <label
                                htmlFor="email"
                                className="form-label fw-bold
                                text-secondary">
                                Email address
                            </label>
                        </div>
                        <div className="form-floating mb-3">
                            <input
                                type="password"
                                autoComplete="off"
                                className={`form-control ${
                                    formik.touched.password &&
                                    formik.errors.password
                                        ? "is-invalid"
                                        : ""
                                }`}
                                id="password"
                                name="password"
                                placeholder="Password"
                                value={formik.values.password}
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                disabled={isLoading}
                                aria-label="Password"
                            />
                            {formik.touched.password &&
                                formik.errors.password && (
                                    <div className="invalid-feedback">
                                        {formik.errors.password}
                                    </div>
                                )}
                            <label
                                htmlFor="password"
                                className="form-label fw-bold text-secondary">
                                Password
                            </label>
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary w-100 py-2 mt-4 fw-bold shadow-sm"
                            disabled={
                                !formik.dirty || !formik.isValid || isLoading
                            }>
                            {isLoading ? "Logging in..." : "Login"}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
};

export default Login;
