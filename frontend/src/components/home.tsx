import { useEffect, useState } from "react";
import Login from "./login";

function Home({ onShowInstructions }: { onShowInstructions: () => void }) {
    const [openLogin, setOpenLogin] = useState(false);

    // đăng nhập --> authUser 
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
        try {
        return !!localStorage.getItem("authUser");
        } catch {
        return false;
        }
    });

    // Cập nhật khi modal Login đóng (sau khi đăng nhập thành công Login sẽ set localStorage)
    useEffect(() => {
        if (!openLogin) {
            try {
                setIsLoggedIn(!!localStorage.getItem("authUser"));
            } catch {
                setIsLoggedIn(false);
            }
        }
    }, [openLogin]);

    // Lắng nghe đăng nhập/đăng xuất từ tab khác hoặc component khác
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
        if (e.key === "authUser") {
            setIsLoggedIn(!!e.newValue);
        }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    return (
        <div className="h-fit flex flex-col">
            <div className="flex flex-col justify-center items-center my-8">
                <h1 className="text-4xl font-bold text-center text-blue-600">
                    CỔNG THÔNG TIN ĐỊA CHÍNH
                </h1>
                <h1 className="text-4xl font-bold text-center" style={{ color: "#1E40AF" }}>
                    Số hóa thông tin đất đai
                </h1>

                <div className="flex flex-col gap-3 my-10 h-full w-2/3 px-6 text-justify text-[18px]">
                    <label>
                        • Hệ thống giúp người dân và cơ quan nhà nước quản lý thông tin đất đai một cách dễ dàng,
                        thống nhất và chính xác hơn thông qua nền tảng trực tuyến hiện đại, nơi mọi dữ liệu được
                        cập nhật và đồng bộ liên tục, bảo đảm tính toàn vẹn và minh bạch trong quá trình quản lý.
                    </label>
                    <label>
                        • Người dân có thể thực hiện hầu hết các thủ tục hành chính như tra cứu thông tin,
                        đăng ký, cập nhật và theo dõi tình trạng hồ sơ ngay tại nhà, giúp tiết kiệm đáng kể thời gian,
                        chi phí và công sức so với phương thức truyền thống.
                    </label>
                    <label>
                        • Đây là bước tiến quan trọng trong việc đưa dịch vụ công đến gần hơn với người dân,
                        xây dựng môi trường phục vụ chuyên nghiệp và thuận tiện.
                    </label>
                    <label>
                        • Hệ thống còn đảm bảo mức độ bảo mật cao, khả năng chia sẻ dữ liệu liên thông giữa các cơ quan quản lý,
                        góp phần nâng cao chất lượng phối hợp, hạn chế sai sót và trùng lặp thông tin trong quá trình xử lý nghiệp vụ.
                    </label>
                    <label>
                        • Góp phần thúc đẩy quá trình chuyển đổi số trong lĩnh vực tài nguyên – môi trường,
                        hướng tới nền hành chính hiện đại và hiệu quả hơn.
                    </label>
                </div>

                <div className="flex gap-5 justify-center">
                    <button
                        className="text-blue-600 font-semibold px-4 py-2 rounded border-2 border-blue-600 hover:bg-blue-600 hover:text-white w-40 h-12"
                        onClick={onShowInstructions}
                    >
                        Xem hướng dẫn
                    </button>

                </div>
            </div>
        </div>
    );
}

export default Home;
