function Footer ()  {
  return (
    <footer className="bg-gray-100 py-6 mt-10 px-60">
        <div className="flex justify-between">
            <div>
                <div className="flex  items-center mb-2">
                    {/* logo */}
                    <div>
                        <img
                        src="/image/logo_1.png"
                        alt="Logo"
                        className="align-middle justify-center w-5 h-5"
                        />
                    </div>
                    <div
                        className="font-bold text-lg ml-2"
                        style={{ color: "#1E40AF" }}
                    >
                        <div>CỔNG THÔNG TIN ĐỊA CHÍNH</div>
                    </div>
                </div>

                <div className="">
                    Vui lòng đến UBND địa phương <br/>
                    để được hỗ trợ chi tiết
                </div>
            </div>
            

            <div>
                <div 
                    className="font-semibold"
                    style={{color: "#1E40AF"}}
                >
                    Điện thoại hỗ trợ:
                </div>
                <div
                    className="pr-30"
                >
                    Tổng đài: (028) 1234 5678 <br/>
                    Hỗ trợ kỹ thuật: (028) 1234 5679<br/>
                    Hotline: 0912 345 678
                </div>
            </div>
        </div>
    </footer>
  )
}

export default Footer;