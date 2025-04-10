const API_KEY = "AIzaSyD62h1FrHPtaaQiChDcVwe5GxpDsNx0m6Q";

// Tiêu chí đánh giá CV
const tieuChiCV = {
    hocVan: {
        diemSo: 0.25, // 25% tổng điểm
        yeuTo: ['bangCap', 'chuyenNganhPhuHop', 'uyTinTruong']
    },
    kinhNghiem: {
        diemSo: 0.35, // 35% tổng điểm
        yeuTo: ['soNamKinhNghiem', 'linhVucPhuHop', 'trachNhiemCongViec']
    },
    kyNang: {
        diemSo: 0.25, // 25% tổng điểm
        yeuTo: ['kyNangChuyenMon', 'kyNangMem', 'chungChi']
    },
    thanhTich: {
        diemSo: 0.15, // 15% tổng điểm
        yeuTo: ['duAn', 'giaiThuong', 'congTrinh']
    }
};

// Phân tích CV sử dụng AI
async function phanTichCVVoiAI(noiDungCV) {
    try {
        const response = await fetch(`https://language.googleapis.com/v1/documents:analyzeEntities?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                document: {
                    content: noiDungCV,
                    type: 'PLAIN_TEXT'
                }
            })
        });
        return await response.json();
    } catch (error) {
        console.error('Lỗi khi phân tích CV:', error);
        return null;
    }
}

// Tính điểm CV
function tinhDiemCV(ketQuaPhanTich) {
    let tongDiem = 0;
    
    const diem = {
        hocVan: danhGiaHocVan(ketQuaPhanTich) * tieuChiCV.hocVan.diemSo,
        kinhNghiem: danhGiaKinhNghiem(ketQuaPhanTich) * tieuChiCV.kinhNghiem.diemSo,
        kyNang: danhGiaKyNang(ketQuaPhanTich) * tieuChiCV.kyNang.diemSo,
        thanhTich: danhGiaThanhTich(ketQuaPhanTich) * tieuChiCV.thanhTich.diemSo
    };
    
    tongDiem = Object.values(diem).reduce((a, b) => a + b, 0);
    
    return {
        tongDiem,
        chiTiet: {
            hocVan: diem.hocVan / tieuChiCV.hocVan.diemSo,
            kinhNghiem: diem.kinhNghiem / tieuChiCV.kinhNghiem.diemSo,
            kyNang: diem.kyNang / tieuChiCV.kyNang.diemSo,
            thanhTich: diem.thanhTich / tieuChiCV.thanhTich.diemSo
        }
    };
}

// So sánh 2 CV
function soSanhCV(diemCV1, diemCV2) {
    return {
        deXuat: diemCV1.tongDiem > diemCV2.tongDiem ? 'CV1' : 'CV2',
        chenhLech: Math.abs(diemCV1.tongDiem - diemCV2.tongDiem),
        chiTietSoSanh: {
            hocVan: diemCV1.chiTiet.hocVan - diemCV2.chiTiet.hocVan,
            kinhNghiem: diemCV1.chiTiet.kinhNghiem - diemCV2.chiTiet.kinhNghiem,
            kyNang: diemCV1.chiTiet.kyNang - diemCV2.chiTiet.kyNang,
            thanhTich: diemCV1.chiTiet.thanhTich - diemCV2.chiTiet.thanhTich
        }
    };
}

// So sánh nhiều CV
async function soSanhNhieuCV(danhSachCV) {
    const ketQua = [];
    
    for (const cv of danhSachCV) {
        const phanTich = await phanTichCVVoiAI(cv);
        const diem = tinhDiemCV(phanTich);
        ketQua.push(diem);
    }
    
    const ketQuaSoSanh = [];
    for (let i = 0; i < ketQua.length; i++) {
        for (let j = i + 1; j < ketQua.length; j++) {
            ketQuaSoSanh.push({
                capSoSanh: `CV${i + 1} và CV${j + 1}`,
                ketQuaPhanTich: soSanhCV(ketQua[i], ketQua[j])
            });
        }
    }
    
    return ketQuaSoSanh;
}

// Các hàm đánh giá chi tiết
function danhGiaHocVan(phanTich) {
    // Logic đánh giá học vấn
    return 0.8; // Điểm tạm thời
}

function danhGiaKinhNghiem(phanTich) {
    // Logic đánh giá kinh nghiệm
    return 0.75; // Điểm tạm thời
}

function danhGiaKyNang(phanTich) {
    // Logic đánh giá kỹ năng
    return 0.85; // Điểm tạm thời
}

function danhGiaThanhTich(phanTich) {
    // Logic đánh giá thành tích
    return 0.7; // Điểm tạm thời
}

// Ví dụ sử dụng
async function viDu() {
    const danhSachCV = [
        'Nội dung CV thứ nhất...',
        'Nội dung CV thứ hai...'
    ];
    
    const ketQua = await soSanhNhieuCV(danhSachCV);
    console.log('Kết quả so sánh CV:', ketQua);
}

// Xuất các hàm để sử dụng
module.exports = {
    soSanhNhieuCV,
    phanTichCVVoiAI,
    tinhDiemCV,
    soSanhCV,
    tieuChiCV
};
