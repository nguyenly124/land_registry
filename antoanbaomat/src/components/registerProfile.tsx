import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function RegisterProfileModal({ open, onClose }: Props) {
    const dialogRef = useRef<HTMLDivElement>(null);

    // hiện/ẩn mk
    // const [showPassword, setShowPassword] = useState(false);
    // const [showConfirm, setShowConfirm] = useState(false);

    // check mk
    const [name, setName] = useState("");
    const [birthday, setBirthday] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [error, setError] = useState("");

    // birthday display
    // const birthdayDisplay = birthday
    //     ? birthday.split("-").reverse().join("/")
    //     : "";

    // success
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (success) {
        const timer = setTimeout(() => {
            window.location.href = "/";
        }, 500);
        return () => clearTimeout(timer);
        }
    }, [success]);

    useEffect(() => {
        if (!open) return;

        // Khóa scroll nền
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        // Đóng bằng ESC
        const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);

        return () => {
        document.body.style.overflow = prev;
        window.removeEventListener("keydown", onKey);
        };
    }, [open, onClose]);

    if (!open) return null;

    // const handleSubmit = (e: React.FormEvent) => {
    //     e.preventDefault();
    //     if(phone.length !== 10){
    //     setError("Số điện thoại phải đủ 10 số!");
    //     return;
    //     }

    //     setError("");
    //     setSuccess("Đăng ký thành công!");
    //     // Xử lý đăng ký ở đây
    // };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Họ tên: chỉ chữ, tối thiểu 2 từ, không ký tự đặc biệt/số
        const namePattern = /^([A-Za-zÀ-ỹà-ỹ]+(?:\s[A-Za-zÀ-ỹà-ỹ]+)+)$/u;
        if (!namePattern.test(name.trim())) {
            setError("Họ tên phải gồm ít nhất 2 từ, không chứa số hoặc ký tự đặc biệt.");
            return;
        }

        // console.log(birthday);

        // const [month, day, year] = birthday.split("/").map(Number);
        // const now = new Date();
        // // const birthDate = new Date(year, month - 1, day);
        // if (
        //     year < 1900 || year > now.getFullYear() ||
        //     month < 1 || month > 12 ||
        //     day < 1 || day > 31 ||
        //     (month === 2 && day > 29) ||
        //     ([4, 6, 9, 11].includes(month) && day > 30)
        // ) {
        //     setError("Ngày sinh không hợp lệ.");
        //     return;
        // }
        // // Kiểm tra đủ 18 tuổi
        // const age = now.getFullYear() - year - (now < new Date(year, month - 1, day) ? 1 : 0);
        // if (age < 18 || (age === 18 && (now.getMonth() < month - 1 || (now.getMonth() === month - 1 && now.getDate() < day)))) {
        //     setError("Bạn phải đủ 18 tuổi trở lên.");
        //     return;
        // }

        // Số điện thoại: 10 số, bắt đầu bằng 03, 05, 07, 08, 09
        const phonePattern = /^(03|05|07|08|09)\d{8}$/;
        if (!phonePattern.test(phone)) {
            setError("Số điện thoại phải đủ 10 số và bắt đầu bằng 03, 05, 07, 08 hoặc 09.");
            return;
        }

        // Nơi trú: không để trống, tối thiểu 5 ký tự
        if (address.trim().length < 5) {
            setError("Nơi trú không được để trống và phải tối thiểu 5 ký tự.");
            return;
        }

        setError("");
        setSuccess("Đăng ký thành công!");
        // Xử lý đăng ký ở đây
    };

    const modalUI = (
        <div
        aria-modal="true"
        role="dialog"
        aria-labelledby="regester-title"
        className="fixed inset-0 z-[1000] flex items-center justify-center"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div
                ref={dialogRef}
                className="relative z-[1001] w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-center gap-4">
                <h2 className="text-xl font-bold ">
                    ĐIỀN THÔNG TIN
                </h2>
                </div>

                {/* Form mẫu */}
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* full name */}
                    <div className="">
                        <label className="mb-1 block font-semibold">Họ Tên</label>
                        <div >
                            <input
                                autoFocus
                                type="text"
                                className="w-full rounded-xl border px-3 py-2 outline-none"
                                placeholder="Nhập họ tên"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* birthday */}
                    <div className="">
                        <label className="mb-1 block font-semibold">Ngày sinh</label>
                        <div >
                            <input
                                autoFocus
                                type="date"
                                className="w-full rounded-xl border px-3 py-2 outline-none"
                                // placeholder="Nhập họ tên"
                                value={birthday}
                                onChange={(e) => setBirthday(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* phone */}
                    <div className="">
                        <label className="mb-1 block font-semibold">Số điện thoại</label>
                        <div >
                            <input
                                autoFocus
                                type="text"
                                className="w-full rounded-xl border px-3 py-2 outline-none"
                                placeholder="Nhập số điện thoại"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    {/* address */}
                    <div className="">
                        <label className="mb-1 block font-semibold">Quê quán</label>
                        <div >
                            <input
                                autoFocus
                                type="text"
                                className="w-full rounded-xl border px-3 py-2 outline-none"
                                placeholder="Nhập quê quán"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm">{error}</div>
                    )}

                    <button
                        type="submit"
                        className="w-full rounded-xl border-2 border-blue-600 bg-blue-600 mt-2 px-4 py-2 font-semibold text-white transition-colors hover:bg-white hover:text-blue-600"
                    >
                        Đăng ký
                    </button>
                </form>
            </div>
        </div>
    );

    // Dùng Portal để modal nằm trên mọi layer
    return createPortal(modalUI, document.body);
}
