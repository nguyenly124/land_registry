import React, { useEffect, useRef, useState } from "react";
import type { AuthUser } from "../data/data";
import { updateUserCCCD, userAccounts, adminAccounts } from "../data/data";

interface UserInfo {
    fullName: string;
    birthDate: string;
    idNumber: string;
    address: string;
}

type ExtendedAuth = AuthUser & {
    birthDate?: string;
    address?: string;
    cccdFront?: string;
    cccdBack?: string;
};

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export default function Profile() {
    const [isEditing, setIsEditing] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const [userInfo, setUserInfo] = useState<UserInfo>({
        fullName: "Khách",
        birthDate: "",
        idNumber: "",
        address: "",
    });

    const [originalInfo, setOriginalInfo] = useState<UserInfo>({ ...userInfo });

    const [frontPreview, setFrontPreview] = useState<string | null>(null);
    const [backPreview, setBackPreview] = useState<string | null>(null);

    const frontInputRef = useRef<HTMLInputElement | null>(null);
    const backInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        try {
            const raw = localStorage.getItem("authUser");
            if (raw) {
                const auth = JSON.parse(raw) as Partial<ExtendedAuth>;
                const fullName = auth.username ?? userInfo.fullName;
                const idNumber = auth.CCCD ?? userInfo.idNumber;
                const address = auth.address ?? userInfo.address ?? "";

                setUserInfo({
                    fullName,
                    birthDate: auth.birthDate ?? "",
                    idNumber,
                    address,
                });
                setOriginalInfo({
                    fullName,
                    birthDate: auth.birthDate ?? "",
                    idNumber,
                    address,
                });

                if (auth.cccdFront) setFrontPreview(auth.cccdFront);
                if (auth.cccdBack) setBackPreview(auth.cccdBack);
            }
        } catch (err) {
            console.error(err);
        // ignore parse error
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setHasChanges(JSON.stringify(userInfo) !== JSON.stringify(originalInfo));
    }, [userInfo, originalInfo]);

    const handleEditToggle = () => {
        if (isEditing) {
            setUserInfo({ ...originalInfo });
            try {
                const raw = localStorage.getItem("authUser");
                if (raw) {
                const auth = JSON.parse(raw) as Partial<ExtendedAuth>;
                setFrontPreview(auth.cccdFront ?? null);
                setBackPreview(auth.cccdBack ?? null);
                }
            } catch {
                // ignore
            }
            setHasChanges(false);
        }
        setIsEditing(!isEditing);
    };

    const handleChange = (field: keyof UserInfo, value: string) => {
        setUserInfo((prev) => ({ ...prev, [field]: value }));
    };

    const fileToDataUrl = (file: File): Promise<string> =>
        new Promise((res, rej) => {
            const fr = new FileReader();
            fr.onload = () => res(String(fr.result));
            fr.onerror = rej;
            fr.readAsDataURL(file);
        });

    const onSelectFront = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            alert("Vui lòng chọn file hình ảnh.");
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            alert("Kích thước ảnh quá lớn (max 2MB).");
            return;
        }
        try {
            const dataUrl = await fileToDataUrl(file);
            setFrontPreview(dataUrl);
        } catch {
            alert("Không thể đọc file ảnh.");
        }
    };

    const onSelectBack = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            alert("Vui lòng chọn file hình ảnh.");
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            alert("Kích thước ảnh quá lớn (max 2MB).");
            return;
        }
        try {
            const dataUrl = await fileToDataUrl(file);
            setBackPreview(dataUrl);
        } catch {
            alert("Không thể đọc file ảnh.");
        }
    };

    const handleSave = () => {
        if (userInfo.idNumber && userInfo.idNumber.trim().length !== 12) {
            alert("Số CMND/CCCD phải đủ 12 số.");
            return;
        }

        try {
            updateUserCCCD(userInfo.idNumber, frontPreview ?? undefined, backPreview ?? undefined);
            } catch {
            // ignore
        }

        try {
            const raw = localStorage.getItem("authUser");
            if (raw) {
                const auth = JSON.parse(raw) as Partial<ExtendedAuth>;
                const oldCccd = auth.CCCD;
                const newCccd = userInfo.idNumber;
                if (oldCccd && newCccd && oldCccd !== newCccd) {
                    try {
                        const mapRaw = localStorage.getItem("cccd_images_map");
                        if (mapRaw) {
                        const map = JSON.parse(mapRaw) as Record<string, { front?: string; back?: string }>;
                        if (map[oldCccd]) {
                            map[newCccd] = map[oldCccd];
                            delete map[oldCccd];
                            localStorage.setItem("cccd_images_map", JSON.stringify(map));
                        }
                        }
                    } catch {
                        // ignore
                    }
                }

                const updatedAuth: Partial<ExtendedAuth> = {
                    ...(auth as Partial<ExtendedAuth>),
                    username: userInfo.fullName,
                    CCCD: userInfo.idNumber,
                    birthDate: userInfo.birthDate,
                    address: userInfo.address,
                    };
                if (frontPreview) updatedAuth.cccdFront = frontPreview;
                if (backPreview) updatedAuth.cccdBack = backPreview;

                localStorage.setItem("authUser", JSON.stringify(updatedAuth));
            }
        } catch {
        // ignore
        }

        try {
            const lists = [userAccounts as ExtendedAuth[], adminAccounts as ExtendedAuth[]];
            for (const list of lists) {
                const idx = list.findIndex((u) => u.CCCD === userInfo.idNumber || u.username === originalInfo.fullName);
                if (idx !== -1) {
                list[idx].username = userInfo.fullName;
                list[idx].CCCD = userInfo.idNumber;
                list[idx].birthDate = userInfo.birthDate;
                list[idx].address = userInfo.address;
                if (frontPreview) list[idx].cccdFront = frontPreview;
                if (backPreview) list[idx].cccdBack = backPreview;
                break;
                }
            }
        } catch {
        // ignore
        }

        // finalize UI
        setOriginalInfo({ ...userInfo });
        setHasChanges(false);
        setIsEditing(false);
        alert("Lưu thông tin thành công (demo client-side).");
    };

    const clearFront = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setFrontPreview(null);
    };
    const clearBack = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setBackPreview(null);
    };

    return (
        <div className="flex w-2/3 mx-auto my-10">
            <div className="flex gap-12 w-full">
                <div className="w-1/2">
                    <h2 className="text-4xl font-bold mb-4" style={{ color: "#1E40AF" }}>
                        THÔNG TIN CÁ NHÂN
                    </h2>

                    <h4 className="text-[16px] text-gray-400 text-justify">
                        Vui lòng kiểm tra kỹ thông tin cá nhân của bạn. Nếu phát hiện sai sót, xin hãy gửi lại thông tin
                        chính xác để hệ thống kịp thời cập nhật.
                    </h4>

                    <div className="flex flex-col gap-8 my-8">
                        <div className="flex items-center">
                            <label className="font-semibold min-w-[120px]">Họ và tên: </label>
                            {isEditing ? (
                                <input
                                type="text"
                                value={userInfo.fullName}
                                onChange={(e) => handleChange("fullName", e.target.value)}
                                className="ml-2 px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                />
                            ) : (
                                <span className="ml-2">{userInfo.fullName}</span>
                            )}
                        </div>

                        <div className="flex items-center">
                            <label className="font-semibold min-w-[120px]">Ngày sinh: </label>
                            {isEditing ? (
                                <input
                                type="text"
                                value={userInfo.birthDate}
                                onChange={(e) => handleChange("birthDate", e.target.value)}
                                className="ml-2 px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                />
                            ) : (
                                <span className="ml-2">{userInfo.birthDate}</span>
                            )}
                        </div>

                        <div className="flex items-center">
                            <label className="font-semibold min-w-[120px]">Số CMND/CCCD: </label>
                            {isEditing ? (
                                <input
                                type="text"
                                value={userInfo.idNumber}
                                onChange={(e) => handleChange("idNumber", e.target.value)}
                                className="ml-2 px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                />
                            ) : (
                                <span className="ml-2">{userInfo.idNumber}</span>
                            )}
                        </div>

                        <div className="flex items-center">
                            <label className="font-semibold min-w-[120px]">Địa chỉ: </label>
                            {isEditing ? (
                                <input
                                type="text"
                                value={userInfo.address}
                                onChange={(e) => handleChange("address", e.target.value)}
                                className="ml-2 px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                />
                            ) : (
                                <span className="ml-2">{userInfo.address}</span>
                            )}
                        </div>
                    </div>  

                    <div className="flex my-5 gap-10 justify-center">
                        <button
                            className="text-blue-600 font-semibold px-4 py-2 rounded border-2 border-blue-600 hover:bg-blue-600 hover:text-white"
                            onClick={handleEditToggle}
                        >
                            {isEditing ? "Hủy" : "Chỉnh sửa thông tin"}
                        </button>

                        <button
                            className={`font-semibold px-4 py-2 rounded border-2 ${hasChanges ? "bg-blue-600 text-white border-blue-600" : "bg-gray-400 text-white border-gray-400 cursor-not-allowed"}`}
                            onClick={handleSave}
                            disabled={!hasChanges && !frontPreview && !backPreview}
                        >
                            
                        </button>
                    </div>
                </div>

                {/* image upload */}
                <div className="flex flex-col w-1/2 gap-2 mt-15 ml-5 ">
                    <label className="font-semibold">Ảnh CCCD:</label>
                    <div className="flex flex-col gap-4">
                        <div
                            className="border-2 border-gray-400 justify-center items-center flex rounded-xl w-4/5 h-40 relative group cursor-pointer overflow-hidden"
                            onClick={() => isEditing && frontInputRef.current?.click()}
                        >
                        {frontPreview ? (
                            <>
                                <img src={frontPreview} alt="Mặt trước CCCD" className="object-contain w-full h-full" />
                                {isEditing && (
                                    <button
                                    onClick={(e) => { clearFront(e); }}
                                    className="absolute top-2 right-2 bg-white bg-opacity-80 px-2 py-1 rounded text-sm"
                                    >
                                    Xóa
                                    </button>
                                )}
                            </>
                        ) : (
                            <div className="text-center text-gray-400">
                                {isEditing ? "Click để tải ảnh Mặt trước" : <><img src="/image/imagePlus.png" alt="placeholder" className="w-20 h-20 mx-auto" /><div className="mt-2">Không có ảnh</div></>}
                            </div>
                        )}
                            <input ref={frontInputRef} type="file" accept="image/*" onChange={onSelectFront} className="hidden" />
                        </div>

                        <div
                            className="border-2 border-gray-400 justify-center items-center flex rounded-xl w-4/5 h-40 relative group cursor-pointer overflow-hidden"
                            onClick={() => isEditing && backInputRef.current?.click()}
                        >
                            {backPreview ? (
                                <>
                                <img src={backPreview} alt="Mặt sau CCCD" className="object-contain w-full h-full" />
                                {isEditing && (
                                    <button
                                        onClick={(e) => { clearBack(e); }}
                                        className="absolute top-2 right-2 bg-white bg-opacity-80 px-2 py-1 rounded text-sm"
                                    >
                                        Xóa
                                    </button>
                                )}
                                </>
                            ) : (
                                <div className="text-center text-gray-400">
                                    {isEditing ? "Click để tải ảnh Mặt sau" : <><img src="/image/imagePlus.png" alt="placeholder" className="w-20 h-20 mx-auto" /><div className="mt-2">Không có ảnh</div></>}
                                </div>
                            )}
                            <input ref={backInputRef} type="file" accept="image/*" onChange={onSelectBack} className="hidden" />
                        </div>
                    </div>
                
                </div>
            </div>
        </div>
    );
}