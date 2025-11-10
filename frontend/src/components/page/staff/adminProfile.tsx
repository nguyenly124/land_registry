// import { useMemo, useState } from "react";
// import type { AuthUser } from "../../../data/data";
// import { userAccounts as rawUserAccounts } from "../../../data/data";

// const PAGE_SIZE = 3;

// export default function AdminProfile() {
//   // hiển thị người dùng 
//   const users = useMemo(() => rawUserAccounts.filter((u) => u.role === "user"), []);

//   // --- Tìm kiếm theo CCCD ---
//   const [searchCccd, setSearchCccd] = useState<string>("");

//   const normalize = (s: string) => (s ?? "").toString().replace(/\s+/g, "").trim();

//   // tìm user khớp CCCD 
//   const exactMatchUser: AuthUser | undefined = useMemo(() => {
//     const q = normalize(searchCccd);
//     if (!q) return undefined;
//     return users.find((u) => normalize(String(u.CCCD)) === q);
//   }, [users, searchCccd]);

//   // Trạng thái hiển thị
//   const typing = normalize(searchCccd).length > 0;
//   const showExact = typing && !!exactMatchUser;          
//   const showNotFound = typing && !exactMatchUser;         

//   // phân trang danh sách mặc định
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));

//   const currentUsers = useMemo(() => {
//     const start = (currentPage - 1) * PAGE_SIZE;
//     return users.slice(start, start + PAGE_SIZE);
//   }, [users, currentPage]);

//   const [selected, setSelected] = useState<AuthUser | null>(null);

//   return (
//     <div className="container mx-auto px-4 py-10 w-2/3 mb-10">
//       <div className="max-w-6xl mx-auto">

//         <div className="flex items-center py-4 justify-between mb-6 ">
//             <div className="text-center mb-6">
//                 <h1 className="text-2xl font-bold text-blue-600"
//                     style={{color: "#1E40AF"}}
//                 >
//                     QUẢN LÝ NGƯỜI DÙNG
//                 </h1>
//             </div>

//             {/*  tìm kiếm CCCD */}
//             <div className="flex items-center gap-2">
//                 <input
//                     value={searchCccd}
//                     onChange={(e) => {
//                         setSearchCccd(e.target.value);
//                         setSelected(null);
//                     }}
//                     type="text"
//                     inputMode="numeric"
//                     placeholder="Nhập đúng số CCCD để tìm..."
//                     className="w-80 rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
//                     aria-label="Tìm kiếm theo số CCCD"
//                 />

//                 {searchCccd && (
//                     <button
//                         onClick={() => {
//                             setSearchCccd("");
//                             setSelected(null);
//                             setCurrentPage(1);
//                         }}
//                         className="px-3 py-2 rounded border bg-gray-100 hover:bg-gray-200"
//                     >
//                         Xóa
//                     </button>
//                 )}
//             </div>
//         </div>
        

        

//         {/* kết quả / thông báo */}
//         {showNotFound ? (
//             <div className="text-center text-gray-700 border rounded-lg p-6 bg-white">
//                 Không có thông tin người dùng hợp lệ với CCCD:{" "}
//                 <span className="font-semibold">{searchCccd}</span>
//             </div>
//         ) : (
//             <div className="grid md:grid-cols-3 gap-6">
//                 {showExact ? (
//                 <div key={exactMatchUser!.CCCD} className="bg-white border rounded-lg p-4 shadow-sm">
//                     <div className="flex items-center justify-between mb-3">
//                     <div className="flex justify-center text-center gap-4">
//                         <div className="font-medium text-gray-600">Họ và tên:</div>
//                         <div className="font-semibold text-gray-900">{exactMatchUser!.username}</div>
//                     </div>
//                     </div>

//                     <div className="flex flex-col text-sm text-gray-600 mb-3 gap-4">
//                     <div>
//                         <span className="font-medium">CCCD:</span>{" "}
//                         <span className="ml-1 text-gray-900 font-semibold">{exactMatchUser!.CCCD}</span>
//                     </div>
//                     <div>
//                         <span className="font-medium">SĐT:</span>{" "}
//                         <span className="ml-1 text-gray-900 font-semibold">-</span>
//                     </div>
//                     </div>

//                     <div>
//                     <button
//                         onClick={() => setSelected(exactMatchUser!)}
//                         className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 justify-center w-full flex"
//                     >
//                         Xem chi tiết
//                     </button>
//                     </div>
//                 </div>
//                 ) : (
//                 currentUsers.map((u) => (
//                     <div key={u.CCCD} className="bg-white border rounded-lg p-4 shadow-sm">
//                     <div className="flex items-center justify-between mb-3">
//                         <div className="flex justify-center text-center gap-4">
//                         <div className="font-medium text-gray-600">Họ và tên:</div>
//                         <div className="font-semibold text-gray-900">{u.username}</div>
//                         </div>
//                     </div>

//                     <div className="flex flex-col text-sm text-gray-600 mb-3 gap-4">
//                         <div>
//                         <span className="font-medium">CCCD:</span>{" "}
//                         <span className="ml-1 text-gray-900 font-semibold">{u.CCCD}</span>
//                         </div>
//                         <div>
//                         <span className="font-medium">SĐT:</span>{" "}
//                         <span className="ml-1 text-gray-900 font-semibold">-</span>
//                         </div>
//                     </div>

//                     <div>
//                         <button
//                         onClick={() => setSelected(u)}
//                         className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 justify-center w-full flex"
//                         >
//                         Xem chi tiết
//                         </button>
//                     </div>
//                     </div>
//                 ))
//                 )}
//             </div>
//         )}

//         {/* phân trang*/}
//         {!typing && totalPages > 1 && (
//             <div className="mt-6 flex items-center justify-center gap-2">
//                 <button
//                 onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//                 disabled={currentPage === 1}
//                 className={`px-3 py-1 rounded ${
//                     currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"
//                 }`}
//                 >
//                 Trước
//                 </button>

//                 {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
//                 <button
//                     key={p}
//                     onClick={() => setCurrentPage(p)}
//                     className={`px-3 py-1 rounded ${p === currentPage ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
//                 >
//                     {p}
//                 </button>
//                 ))}

//                 <button
//                 onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
//                 disabled={currentPage === totalPages}
//                 className={`px-3 py-1 rounded ${
//                     currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"
//                 }`}
//                 >
//                 Sau
//                 </button>
//             </div>
//         )}

//         {/* chi tiết */}
//         {selected && (
//             <div className="fixed inset-0 z-50 flex items-center justify-center">
//                 <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
//                 <div className="relative z-10 w-full max-w-lg bg-white rounded-lg p-6 shadow-lg">
//                 <div className="flex justify-between items-start mb-4">
//                     <h3 className="text-lg font-semibold">Thông tin người dùng</h3>
//                     <button className="text-gray-500" onClick={() => setSelected(null)}>
//                     Đóng
//                     </button>
//                 </div>

//                 <div className="space-y-3 flex">
//                     <div className="flex flex-col w-1/2 gap-5">
//                     <div>
//                         <div className="text-sm text-gray-500">Họ và tên</div>
//                         <div className="font-medium text-gray-900">{selected.username}</div>
//                     </div>

//                     <div>
//                         <div className="text-sm text-gray-500">Số CMND/CCCD</div>
//                         <div className="font-medium text-gray-900">{selected.CCCD}</div>
//                     </div>

//                     <div>
//                         <div className="text-sm text-gray-500">Ngày sinh:</div>
//                         <div className="font-medium text-gray-900">-</div>
//                     </div>

//                     <div>
//                         <div className="text-sm text-gray-500">Nơi trú:</div>
//                         <div className="font-medium text-gray-900">-</div>
//                     </div>

//                     <div>
//                         <div className="text-sm text-gray-500">SĐT:</div>
//                         <div className="font-medium text-gray-900">-</div>
//                     </div>
//                     </div>

//                     <div className="w-1/2 space-y-4">
//                     {selected.cccdFront && (
//                         <div>
//                         <div className="text-sm text-gray-500">Ảnh CCCD - Mặt trước</div>
//                         <img src={selected.cccdFront} alt="cccd-front" className="w-full max-h-40 object-contain rounded border mt-2" />
//                         </div>
//                     )}

//                     {selected.cccdBack && (
//                         <div>
//                         <div className="text-sm text-gray-500">Ảnh CCCD - Mặt sau</div>
//                         <img src={selected.cccdBack} alt="cccd-back" className="w-full max-h-40 object-contain rounded border mt-2" />
//                         </div>
//                     )}
//                     </div>
//                 </div>

//                 <div className="mt-4 flex justify-end gap-2">
//                     <button onClick={() => setSelected(null)} className="px-3 py-1 rounded border">
//                     Đóng
//                     </button>
//                 </div>
//                 </div>
//             </div>
//         )}
//       </div>
//     </div>
//   );
// }
