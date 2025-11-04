function Instructions() {
    const guides = [
        {
            href: "/register.html",
            label: "Hướng dẫn đăng ký chi tiết"
        },

        {
            href: "/login.html",
            label: "Hướng dẫn đăng nhập chi tiết"
        },

        {
            href: "/profile.html",
            label: "Hướng dẫn chỉnh sửa thông tin cá nhân"
        },

        {
            href: "/landProfileInstruction.html",
            label: "Hướng dẫn tra cứu hồ sơ đất đai"
        },

        {
            href: "/contact.html",
            label: "Thông tin liên hệ"
        },
        
    ];

    return (
        <div className="justify-center items-center my-15 p-6 text-center">
            <h2
                className="text-3xl font-bold mb-4 text-blue-600"
                style={{ color: "#1E40AF" }}
            >
                Hướng dẫn sử dụng hệ thống
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto my-10">
                {guides.map((guide, idx) => (
                    <div
                        key={idx}
                        className="p-6 border rounded-lg shadow-lg bg-white flex items-center justify-center"
                    >
                        <a
                            href={guide.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline hover:text-blue-800 font-semibold"
                        >
                            {guide.label}
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Instructions;