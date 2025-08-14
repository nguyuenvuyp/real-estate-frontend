import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "../api/axiosClient";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import type { AxiosError } from "axios";

const schema = yup.object({
    email: yup.string().email().required(),
    password: yup.string().min(6).required(),
});

type FormValues = yup.InferType<typeof schema>;

export default function Login() {
    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: yupResolver(schema)
    });
    const [serverError, setServerError] = useState<string | null>(null);
    const nav = useNavigate();

    const onSubmit = async (data: FormValues) => {
        setServerError(null);
        try {
            const res = await axios.post("/login", data);
            localStorage.setItem("token", res.data.token);
            nav("/properties", { replace: true });
        } catch (e: unknown) {
            const err = e as AxiosError<{ message?: string }>;
            setServerError(err.response?.data?.message || "Tài khoản hoặc mật khẩu không đúng");
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow">
            <h1 className="text-xl font-semibold mb-4">Đăng nhập</h1>
            {serverError && <p className="text-red-600 mb-2 text-sm">{serverError}</p>}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="text-sm">Email</label>
                    <input className="w-full border rounded p-2" {...register("email")} />
                    <p className="text-xs text-red-600">{errors.email?.message}</p>
                </div>
                <div>
                    <label className="text-sm">Mật khẩu</label>
                    <input type="password" className="w-full border rounded p-2" {...register("password")} />
                    <p className="text-xs text-red-600">{errors.password?.message}</p>
                </div>
                <button className="px-4 py-2 rounded bg-black text-white">Login</button>
            </form>
        </div>
    );
}
