const { GoogleGenerativeAI } = require("@google/generative-ai");

const CV_CRITERIA = {
    IT: {
        technical: [
            "Programming languages",
            "Frameworks",
            "Database skills",
            "System design",
            "Problem-solving abilities"
        ],
        soft_skills: [
            "Communication",
            "Teamwork",
            "Adaptability"
        ],
        education: [
            "Computer Science degree",
            "Relevant certifications"
        ]
    },
    Marketing: {
        technical: [
            "Digital marketing tools",
            "Analytics skills",
            "Social media management",
            "Content creation"
        ],
        soft_skills: [
            "Creativity",
            "Communication",
            "Project management"
        ],
        experience: [
            "Campaign management",
            "Market research"
        ]
    },
    Finance: {
        technical: [
            "Financial analysis",
            "Risk assessment",
            "Financial modeling",
            "Excel expertise"
        ],
        soft_skills: [
            "Analytical thinking",
            "Attention to detail",
            "Decision making"
        ],
        certifications: [
            "CFA",
            "Financial certifications"
        ]
    },
    "Công nghệ thông tin": {
        "Kỹ năng chuyên môn": [
            "Ngôn ngữ lập trình",
            "Framework",
            "Kỹ năng database",
            "Thiết kế hệ thống",
            "Khả năng giải quyết vấn đề"
        ],
        "Kỹ năng mềm": [
            "Giao tiếp",
            "Làm việc nhóm",
            "Khả năng thích nghi"
        ],
        "Học vấn": [
            "Bằng CNTT/Khoa học máy tính",
            "Các chứng chỉ liên quan"
        ]
    },
    "Marketing": {
        "Kỹ năng chuyên môn": [
            "Công cụ marketing số",
            "Phân tích dữ liệu",
            "Quản lý mạng xã hội",
            "Sáng tạo nội dung"
        ],
        "Kỹ năng mềm": [
            "Sáng tạo",
            "Giao tiếp",
            "Quản lý dự án"
        ],
        "Kinh nghiệm": [
            "Quản lý chiến dịch",
            "Nghiên cứu thị trường"
        ]
    },
    "Tài chính": {
        "Kỹ năng chuyên môn": [
            "Phân tích tài chính",
            "Đánh giá rủi ro",
            "Mô hình hóa tài chính",
            "Thành thạo Excel"
        ],
        "Kỹ năng mềm": [
            "Tư duy phân tích",
            "Tỉ mỉ, chi tiết",
            "Ra quyết định"
        ],
        "Chứng chỉ": [
            "CFA",
            "Các chứng chỉ tài chính"
        ]
    },
    "Kế toán": {
        "Kỹ năng chuyên môn": [
            "Phần mềm kế toán",
            "Lập báo cáo tài chính",
            "Kiểm toán",
            "Tuân thủ chuẩn mực kế toán",
            "Phân tích số liệu"
        ],
        "Kỹ năng mềm": [
            "Tỉ mỉ, chính xác",
            "Quản lý thời gian",
            "Đạo đức nghề nghiệp"
        ],
        "Chứng chỉ": [
            "CPA",
            "ACCA",
            "Chứng chỉ kế toán trưởng"
        ]
    },
    "Nhân sự": {
        "Kỹ năng chuyên môn": [
            "Tuyển dụng và đào tạo",
            "Quản lý nhân tài",
            "Luật lao động",
            "Phát triển tổ chức",
            "Đánh giá hiệu suất"
        ],
        "Kỹ năng mềm": [
            "Giao tiếp tốt",
            "Giải quyết xung đột",
            "Đàm phán",
            "Empathy"
        ],
        "Kinh nghiệm": [
            "Quản lý nhân sự",
            "Phát triển chính sách"
        ]
    }
};

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(API_KEY);

async function analyzeCV(cvText, field) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const prompt = `
        Analyze this CV for ${field} position based on these criteria:
        ${JSON.stringify(CV_CRITERIA[field], null, 2)}
        
        CV Content:
        ${cvText}
        
        Provide a detailed analysis of how well the CV matches these criteria.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error analyzing CV:", error);
        return "Error in CV analysis";
    }
}

module.exports = {
    CV_CRITERIA,
    analyzeCV
};
