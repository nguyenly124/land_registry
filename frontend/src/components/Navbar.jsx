import React from "react";

export default function Navbar(){
    return (
        <nav className="flex justify-between items-center px-8 py-4 bg-blue-600 text-white shadow-md" >
            <h1 className="text-xl font-bold">HỆ THỐNG QUẢN LÝ ĐẤT</h1>
            <ul className="flex gap-6">
                <li><a href="/" className="hover:underline">Trang chủ</a></li>
                <li><a href="/search" className="hover:underline">Tìm kiếm đất</a></li>
                <li><a href="/transfer" className="hover:underline">Chuyển nhượng</a></li>
                <li><a href="/login" className="hover:underline">Đăng nhập</a></li>
            </ul>
        </nav>
    );
}