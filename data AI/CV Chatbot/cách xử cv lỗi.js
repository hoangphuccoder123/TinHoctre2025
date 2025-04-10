const cvErrorSolutions = {
    formatErrors: {
        inconsistentFormatting: {
            problem: "CV có định dạng không nhất quán",
            solutions: [
                "Sử dụng font chữ nhất quán (khuyến nghị: Arial, Times New Roman)",
                "Duy trì kích thước font chữ thống nhất cho từng phần",
                "Căn lề đều và nhất quán throughout CV"
            ]
        },
        lengthIssues: {
            problem: "CV quá dài hoặc quá ngắn",
            solutions: [
                "Giữ CV trong khoảng 1-2 trang",
                "Tập trung vào thông tin quan trọng và liên quan",
                "Loại bỏ thông tin không cần thiết"
            ]
        }
    },
    contentErrors: {
        missingInfo: {
            problem: "Thiếu thông tin quan trọng",
            solutions: [
                "Bổ sung thông tin liên hệ đầy đủ",
                "Thêm mục tiêu nghề nghiệp",
                "Liệt kê kinh nghiệm làm việc chi tiết"
            ]
        },
        grammarSpelling: {
            problem: "Lỗi ngữ pháp và chính tả",
            solutions: [
                "Kiểm tra kỹ lỗi chính tả",
                "Nhờ người khác đọc và góp ý",
                "Sử dụng công cụ kiểm tra chính tả"
            ]
        }
    },
    experienceErrors: {
        poorDescriptions: {
            problem: "Mô tả kinh nghiệm không hiệu quả",
            solutions: [
                "Sử dụng động từ mạnh để bắt đầu mỗi bullet point",
                "Định lượng thành tích bằng số liệu cụ thể",
                "Tập trung vào kết quả đạt được thay vì nhiệm vụ"
            ]
        },
        chronologicalIssues: {
            problem: "Sắp xếp kinh nghiệm không hợp lý",
            solutions: [
                "Sắp xếp kinh nghiệm theo thứ tự thời gian mới nhất",
                "Đảm bảo các mốc thời gian rõ ràng",
                "Giải thích các khoảng trống trong CV nếu có"
            ]
        }
    },
    skillsErrors: {
        irrelevantSkills: {
            problem: "Kỹ năng không phù hợp với vị trí",
            solutions: [
                "Điều chỉnh kỹ năng theo yêu cầu công việc",
                "Loại bỏ các kỹ năng không liên quan",
                "Phân loại kỹ năng theo nhóm rõ ràng"
            ]
        },
        skillLevels: {
            problem: "Không thể hiện mức độ thành thạo",
            solutions: [
                "Thêm thang đánh giá cho mỗi kỹ năng",
                "Chứng minh kỹ năng qua dự án cụ thể",
                "Nêu rõ chứng chỉ hoặc công nhận liên quan"
            ]
        }
    },
    visualErrors: {
        poorReadability: {
            problem: "CV khó đọc và thiếu tổ chức",
            solutions: [
                "Tạo khoảng trắng hợp lý giữa các phần",
                "Sử dụng bullet points và đánh dấu phân cấp",
                "Chọn font chữ và kích thước dễ đọc"
            ]
        },
        overDesigned: {
            problem: "Thiết kế quá phức tạp",
            solutions: [
                "Giữ thiết kế đơn giản và chuyên nghiệp",
                "Hạn chế sử dụng màu sắc và đồ họa",
                "Đảm bảo CV có thể đọc được khi in đen trắng"
            ]
        }
    }
};

const API_KEY = "AIzaSyD62h1FrHPtaaQiChDcVwe5GxpDsNx0m6Q";

const analyzeCVWithAPI = async (cvText) => {
    try {
        const response = await fetch('https://api.googleapis.com/v1/analyze-cv', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({ content: cvText })
        });
        return await response.json();
    } catch (error) {
        console.error('Error analyzing CV:', error);
        return null;
    }
};

const matchErrorsWithSolutions = (apiResults) => {
    const matchedSolutions = [];
    if (!apiResults) return matchedSolutions;

    // Match API results with our solution database
    Object.entries(cvErrorSolutions).forEach(([category, errors]) => {
        Object.entries(errors).forEach(([errorType, data]) => {
            if (apiResults.includes(errorType)) {
                matchedSolutions.push({
                    category,
                    problem: data.problem,
                    solutions: data.solutions
                });
            }
        });
    });
    return matchedSolutions;
};

module.exports = {
    cvErrorSolutions,
    analyzeCVWithAPI,
    matchErrorsWithSolutions
};
