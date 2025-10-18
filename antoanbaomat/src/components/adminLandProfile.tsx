// import { useEffect, useMemo, useState } from "react";
// import type { LandRecord } from "../data/data";
// import { landRecords as initialLandRecords, statusMap, statusColorMap, formatDate } from "../data/data";

// const PAGE_SIZE = 3;

// function badgeClasses(status: LandRecord["status"]) {
//   const color = statusColorMap[status];
//   return `inline-block px-3 py-1 rounded-full ${color === "yellow" ? "bg-yellow-100 text-yellow-700" : ""} ${color === "green" ? "bg-green-100 text-green-700" : ""} ${color === "red" ? "bg-red-100 text-red-700" : ""} ${color === "gray" ? "bg-gray-100 text-gray-700" : ""}`;
// }

// export default function AdminLandProfile() {
//   // local copy so UI reacts immediately
//   const [records, setRecords] = useState<LandRecord[]>(() => [...initialLandRecords]);
//   const [currentPage, setCurrentPage] = useState<number>(1);

//   // selected record for detail modal
//   const [selected, setSelected] = useState<LandRecord | null>(null);

//   // admin check — ensure only admin can change status
//   const [isAdmin, setIsAdmin] = useState<boolean>(false);

//   useEffect(() => {
//     try {
//       const raw = localStorage.getItem("authUser");
//       if (raw) {
//         const auth = JSON.parse(raw) as { role?: string };
//         setIsAdmin(auth.role === "admin");
//       } else {
//         setIsAdmin(false);
//       }
//     } catch {
//       setIsAdmin(false);
//     }
//   }, []);

//   // derived pagination values
//   const totalPages = useMemo(() => Math.max(1, Math.ceil(records.length / PAGE_SIZE)), [records.length]);
//   const currentRecords = useMemo(() => {
//     const start = (currentPage - 1) * PAGE_SIZE;
//     return records.slice(start, start + PAGE_SIZE);
//   }, [records, currentPage]);

//   // change status helper
//   const changeStatus = (id: string, newStatus: LandRecord["status"]) => {
//     // update local state immutably
//     setRecords((prev) => {
//       const next = prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r));
//       return next;
//     });

//     // also update the original exported array (in-memory) so other components reading it see change
//     try {
//       const idx = initialLandRecords.findIndex((r) => r.id === id);
//       if (idx !== -1) {
//         initialLandRecords[idx].status = newStatus;
//       }
//     } catch {
//       // ignore if can't mutate
//     }

//     // if modal open for this record, update selected
//     setSelected((prev) => (prev && prev.id === id ? { ...prev, status: newStatus } : prev));
//   };

//   // open detail modal
//   const openDetail = (r: LandRecord) => setSelected(r);

//   // when record deleted/changed you might want to refresh current page bounds
//   useEffect(() => {
//     if (currentPage > totalPages) setCurrentPage(totalPages);
//   }, [totalPages, currentPage]);

//   return (
//     <div className="container mx-auto px-4 py-8 w-2/3">
//       <div className="max-w-6xl mx-auto">
//         <div className="flex items-center justify-between mb-10">
//           <div>
//             <h1 className="text-2xl font-bold text-blue-600">QUẢN LÝ HỒ SƠ ĐẤT</h1>
//             {/* <p className="text-gray-600 mt-1">Admin có thể xem danh sách hồ sơ và thay đổi trạng thái.</p> */}
//           </div>
//           <div className="text-sm text-gray-700">
//             {isAdmin ? <span className="font-medium text-green-700">Đăng nhập với quyền Admin</span> : <span className="font-medium text-red-600">Không có quyền Admin</span>}
//           </div>
//         </div>

//         <div className="grid md:grid-cols-3 gap-6">
//           {currentRecords.map((r) => (
//             <article key={r.id} className="bg-white border rounded-lg p-4 shadow-sm flex flex-col">
//               <div className="flex items-start justify-between mb-3">
//                 <div>
//                   <p className="text-xs text-gray-500">Mã hồ sơ</p>
//                   <h3 className="text-lg font-semibold text-gray-900">{r.id}</h3>
//                 </div>
//                 <div className="text-right">
//                   <div className={badgeClasses(r.status)}>{statusMap[r.status]}</div>
//                 </div>
//               </div>

//               <div className="text-sm text-gray-700 mb-4 flex flex-col gap-4">

//                 <div className="flex justify-between">
//                   <span className="font-medium">Số hồ sơ:</span>
//                   <span>{r.recordNumber}</span>
//                 </div>

//                 <div className="flex justify-between">
//                   <span className="font-medium">Ngày đăng ký:</span>
//                   <span>{formatDate(r.registrationDate)}</span>
//                 </div>

//                 <div className="flex justify-between">
//                   <span className="font-medium">Thửa đất:</span>
//                   <span>{r.plotNumber}</span>
//                 </div>

//                 <div className="flex justify-between">
//                   <span className="font-medium">Chủ hộ:</span>
//                   <span>{r.ownerName}</span>
//                 </div>
//               </div>

//               <div className="mt-2 flex gap-2">
//                 <button
//                   onClick={() => openDetail(r)}
//                   className="flex-1 px-3 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
//                 >
//                   Xem / Chỉnh trạng thái
//                 </button>
//               </div>
//             </article>
//           ))}
//         </div>

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="mt-6 flex items-center justify-center gap-2">
//             <button
//               onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//               disabled={currentPage === 1}
//               className={`px-3 py-1 rounded ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"}`}
//             >
//               Trước
//             </button>

//             {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
//               <button
//                 key={p}
//                 onClick={() => setCurrentPage(p)}
//                 className={`px-3 py-1 rounded ${p === currentPage ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
//               >
//                 {p}
//               </button>
//             ))}

//             <button
//               onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
//               disabled={currentPage === totalPages}
//               className={`px-3 py-1 rounded ${currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"}`}
//             >
//               Sau
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Detail / Edit modal */}
//       {selected && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center">
//           <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
//           <div className="relative z-10 w-full max-w-2xl bg-white rounded-lg p-6 shadow-lg">
//             <div className="flex items-start justify-between mb-4">
//               <h3 className="text-lg font-semibold">Chi tiết hồ sơ: {selected.id}</h3>
//               <button className="text-gray-500" onClick={() => setSelected(null)}>Đóng</button>
//             </div>

//             <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
//               <div>
//                 <div className="font-medium">Số hồ sơ</div>
//                 <div>{selected.recordNumber}</div>
//               </div>
//               <div>
//                 <div className="font-medium">Ngày đăng ký</div>
//                 <div>{formatDate(selected.registrationDate)}</div>
//               </div>

//               <div>
//                 <div className="font-medium">Thửa đất</div>
//                 <div>{selected.plotNumber}</div>
//               </div>
//               <div>
//                 <div className="font-medium">Diện tích (m²)</div>
//                 <div>{selected.area}</div>
//               </div>

//               <div className="col-span-2">
//                 <div className="font-medium">Chủ hộ</div>
//                 <div>{selected.ownerName} — CCCD: {selected.ownerID}</div>
//               </div>

//               <div className="col-span-2">
//                 <div className="font-medium">Địa chỉ</div>
//                 <div>{selected.address}</div>
//               </div>

//               <div className="col-span-2">
//                 <div className="font-medium">Mục đích</div>
//                 <div>{selected.purpose}</div>
//               </div>
//             </div>

//             <div className="mt-6">
//               <div className="flex items-center gap-3">
//                 <div className="font-medium">Trạng thái hiện tại:</div>
//                 <div className={badgeClasses(selected.status)}>{statusMap[selected.status]}</div>
//               </div>

//               <div className="mt-4 flex items-center gap-2">
//                 {isAdmin ? (
//                   <>
//                     <label className="text-sm font-medium">Chuyển trạng thái sang:</label>
//                     <select
//                       value={selected.status}
//                       onChange={(e) => {
//                         const s = e.target.value as LandRecord["status"];
//                         // perform change on both in-memory and module array
//                         changeStatus(selected.id, s);
//                       }}
//                       className="border px-2 py-1 rounded"
//                     >
//                       <option value="pending">Chưa duyệt</option>
//                       <option value="approved">Đã duyệt</option>
//                       <option value="rejected">Từ chối</option>
//                       <option value="waiting">Chờ bổ sung</option>
//                     </select>

//                     <button
//                       onClick={() => {
//                         if (!isAdmin) return;
//                         alert("Đã cập nhật trạng thái.");
//                       }}
//                       className="ml-2 px-3 py-1 rounded bg-green-600 text-white"
//                     >
//                       Áp dụng
//                     </button>
//                   </>
//                 ) : (
//                   <div className="text-sm text-red-600">Bạn không có quyền thay đổi trạng thái.</div>
//                 )}
//               </div>
//             </div>

//             <div className="mt-6 flex justify-end">
//               <button onClick={() => setSelected(null)} className="px-3 py-1 rounded border">Đóng</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useEffect, useMemo, useState } from "react";
import type { LandRecord } from "../data/data";
import { landRecords as initialLandRecords, statusMap, statusColorMap, formatDate } from "../data/data";

const PAGE_SIZE = 3;

function badgeClasses(status: LandRecord["status"]) {
    const color = statusColorMap[status];
    return `inline-block px-3 py-1 rounded-full ${
        color === "yellow" ? "bg-yellow-100 text-yellow-700" : ""
    } ${color === "green" ? "bg-green-100 text-green-700" : ""} ${
        color === "red" ? "bg-red-100 text-red-700" : ""
    } ${color === "gray" ? "bg-gray-100 text-gray-700" : ""}`;
}

// chuẩn hóa: bỏ khoảng trắng, viết hoa
const normalize = (s: string) => (s ?? "").toString().replace(/\s+/g, "").toUpperCase();

// ép giữ tiền tố QSD ở đầu chuỗi
const ensureQSDPrefix = (s: string) => {
    const up = normalize(s);
    const noPrefix = up.replace(/^QSD/, "");
    return `QSD${noPrefix}`;
};

export default function AdminLandProfile() {
    // local copy so UI reacts immediately
    const [records, setRecords] = useState<LandRecord[]>(() => [...initialLandRecords]);
    const [currentPage, setCurrentPage] = useState<number>(1);

    // --- TÌM KIẾM THEO SỐ HỒ SƠ (mặc định 'QSD') ---
    const [searchRecord, setSearchRecord] = useState<string>("QSD");

    // danh sách đã lọc theo tiền tố recordNumber bắt đầu bằng searchRecord
    const filteredRecords = useMemo(() => {
        const q = normalize(searchRecord);
        if (!q) return records;
        return records.filter((r) => normalize(r.recordNumber).startsWith(q));
    }, [records, searchRecord]);

    // selected record for detail modal
    const [selected, setSelected] = useState<LandRecord | null>(null);

    // admin check — ensure only admin can change status
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    useEffect(() => {
        try {
        const raw = localStorage.getItem("authUser");
        if (raw) {
            const auth = JSON.parse(raw) as { role?: string };
            setIsAdmin(auth.role === "admin");
        } else {
            setIsAdmin(false);
        }
        } catch {
        setIsAdmin(false);
        }
    }, []);

    // derived pagination values (dựa trên danh sách đã lọc)
    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE)),
        [filteredRecords.length]
    );

    const currentRecords = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredRecords.slice(start, start + PAGE_SIZE);
    }, [filteredRecords, currentPage]);

    // change status helper
    const changeStatus = (id: string, newStatus: LandRecord["status"]) => {
        setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
        try {
        const idx = initialLandRecords.findIndex((r) => r.id === id);
        if (idx !== -1) initialLandRecords[idx].status = newStatus;
        } catch {
            console.log("error");
        }
        setSelected((prev) => (prev && prev.id === id ? { ...prev, status: newStatus } : prev));
    };

    // open detail modal
    const openDetail = (r: LandRecord) => setSelected(r);

    // giữ currentPage hợp lệ khi số trang thay đổi
    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [totalPages, currentPage]);

    return (
        <div className="container mx-auto px-4 py-8 w-2/3">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center py-4 justify-between mb-6 ">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-blue-600"
                            style={{color: "#1E40AF"}}
                        >
                                QUẢN LÝ HỒ SƠ ĐẤT
                        </h1>
                    </div>

                    {/* Ô tìm kiếm Số hồ sơ (mặc định tiền tố QSD) */}
                    <div className=" flex items-center justify-center gap-2">
                        <input
                            value={searchRecord}
                            onChange={(e) => {
                                const forced = ensureQSDPrefix(e.target.value);
                                setSearchRecord(forced);
                                setCurrentPage(1); 
                            }}
                            type="text"
                            placeholder="Nhập Số hồ sơ (mặc định tiền tố QSD...)"
                            className="w-80 h-10 rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Tìm kiếm theo Số hồ sơ (QSD...)"
                        />

                        {searchRecord && (
                            <button
                                onClick={() => {
                                    setSearchRecord("QSD");
                                    setCurrentPage(1);
                                }}
                                className="px-3 py-2 rounded border bg-gray-100 hover:bg-gray-200"
                            >
                                Đặt lại
                            </button>
                        )}
                    </div>
                </div>

                

                {/* Danh sách hồ sơ (đã lọc) hoặc thông báo không có kết quả */}
                {filteredRecords.length === 0 ? (
                    <div className="text-center text-gray-700 border rounded-lg p-6 bg-white">
                        Không tìm thấy hồ sơ với mã bắt đầu bằng:{" "}
                        <span className="font-semibold">{searchRecord}</span>
                    </div>
                    ) : (
                    <div className="grid md:grid-cols-3 gap-6">
                        {currentRecords.map((r) => (
                        <article key={r.id} className="bg-white border rounded-lg p-4 shadow-sm flex flex-col">
                            <div className="flex items-start justify-between mb-3">
                            <div>
                                <p className="text-xs text-gray-500">Mã hồ sơ</p>
                                <h3 className="text-lg font-semibold text-gray-900">{r.id}</h3>
                            </div>
                            <div className="text-right">
                                <div className={badgeClasses(r.status)}>{statusMap[r.status]}</div>
                            </div>
                            </div>

                            <div className="text-sm text-gray-700 mb-4 flex flex-col gap-4">
                            <div className="flex justify-between">
                                <span className="font-medium">Số hồ sơ:</span>
                                <span>{r.recordNumber}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="font-medium">Ngày đăng ký:</span>
                                <span>{formatDate(r.registrationDate)}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="font-medium">Thửa đất:</span>
                                <span>{r.plotNumber}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="font-medium">Chủ hộ:</span>
                                <span>{r.ownerName}</span>
                            </div>
                            </div>

                            <div className="mt-2 flex gap-2">
                            <button
                                onClick={() => openDetail(r)}
                                className="flex-1 px-3 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                            >
                                Xem / Chỉnh trạng thái
                            </button>
                            </div>
                        </article>
                        ))}
                    </div>
                )}

                {/* Phân trang dựa trên danh sách đã lọc */}
                {filteredRecords.length > 0 && totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                        <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded ${
                            currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"
                        }`}
                        >
                        Trước
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            onClick={() => setCurrentPage(p)}
                            className={`px-3 py-1 rounded ${
                            p === currentPage ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
                            }`}
                        >
                            {p}
                        </button>
                        ))}

                        <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded ${
                            currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"
                        }`}
                        >
                        Sau
                        </button>
                    </div>
                )}
            </div>

            {/* Detail / Edit modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
                        <div className="relative z-10 w-full max-w-2xl bg-white rounded-lg p-6 shadow-lg">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-lg font-semibold">Chi tiết hồ sơ: {selected.id}</h3>
                                <button className="text-gray-500" onClick={() => setSelected(null)}>Đóng</button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                            <div>
                                <div className="font-medium">Số hồ sơ</div>
                                <div>{selected.recordNumber}</div>
                            </div>
                            <div>
                                <div className="font-medium">Ngày đăng ký</div>
                                <div>{formatDate(selected.registrationDate)}</div>
                            </div>

                            <div>
                                <div className="font-medium">Thửa đất</div>
                                <div>{selected.plotNumber}</div>
                            </div>
                            <div>
                                <div className="font-medium">Diện tích (m²)</div>
                                <div>{selected.area}</div>
                            </div>

                            <div className="col-span-2">
                                <div className="font-medium">Chủ hộ</div>
                                <div>{selected.ownerName} — CCCD: {selected.ownerID}</div>
                            </div>

                            <div className="col-span-2">
                                <div className="font-medium">Địa chỉ</div>
                                <div>{selected.address}</div>
                            </div>

                            <div className="col-span-2">
                                <div className="font-medium">Mục đích</div>
                                <div>{selected.purpose}</div>
                            </div>
                            </div>

                            <div className="mt-6">
                                <div className="flex items-center gap-3">
                                    <div className="font-medium">Trạng thái hiện tại:</div>
                                    <div className={badgeClasses(selected.status)}>{statusMap[selected.status]}</div>
                                </div>

                                <div className="mt-4 flex items-center gap-2">
                                    {isAdmin ? (
                                    <>
                                        <label className="text-sm font-medium">Chuyển trạng thái sang:</label>
                                        <select
                                        value={selected.status}
                                        onChange={(e) => {
                                            const s = e.target.value as LandRecord["status"];
                                            changeStatus(selected.id, s);
                                        }}
                                        className="border px-2 py-1 rounded"
                                        >
                                        <option value="pending">Chưa duyệt</option>
                                        <option value="approved">Đã duyệt</option>
                                        <option value="rejected">Từ chối</option>
                                        <option value="waiting">Chờ bổ sung</option>
                                        </select>

                                        <button
                                        onClick={() => {
                                            if (!isAdmin) return;
                                            alert("Đã cập nhật trạng thái.");
                                        }}
                                        className="ml-2 px-3 py-1 rounded bg-green-600 text-white"
                                        >
                                        Áp dụng
                                        </button>
                                    </>
                                    ) : (
                                    <div className="text-sm text-red-600">Bạn không có quyền thay đổi trạng thái.</div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button onClick={() => setSelected(null)} className="px-3 py-1 rounded border">Đóng</button>
                            </div>
                        </div>
                    </div>
            )}
        </div>
    );
}
