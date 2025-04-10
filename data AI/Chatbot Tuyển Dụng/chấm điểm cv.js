// CV Filtering System with Gemini API Integration
// This system integrates with Gemini API to process CV data and score candidates

// Gemini API Configuration
const API_KEY = "AIzaSyD62h1FrHPtaaQiChDcVwe5GxpDsNx0m6Q";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

// CV Data Structure
class CVData {
  constructor() {
    this.personalInfo = {
      name: "",
      age: 0,
      gender: ""
    };
    this.education = {
      degree: "",
      major: "",
      school: "",
      gpa: "",
    };
    this.workExperience = []; // Array of {company, title, duration, description}
    this.skills = {
      technical: [],
      soft: []
    };
    this.certifications = []; // Array of {name, level, year}
    this.projects = []; // Array of {name, role, achievements}
    this.languages = []; // Array of {language, level, certification}
    this.achievements = []; // Array of {name, description, year}
    this.careerObjective = "";
    this.interests = [];
    this.specialRequirements = {
      travelWillingness: false,
      shiftWork: false,
      relocation: false,
      others: []
    };
  }
}

// Position Requirements Class
class PositionRequirements {
  constructor(positionName) {
    this.positionName = positionName;
    this.requiredDegree = "";
    this.requiredMajor = "";
    this.minExperienceYears = 0;
    this.requiredSkills = [];
    this.requiredCertifications = [];
    this.requiredLanguageLevel = {};
    this.careerTrack = "";
    this.specialRequirements = [];
    this.scoringWeights = {
      education: 0.15,
      workExperience: 0.30,
      skills: 0.20,
      certifications: 0.10,
      languages: 0.10,
      careerObjective: 0.10,
      achievements: 0.05
    };
    this.passingThreshold = 80; // Out of 100
  }
}

// Scoring System
class CVScorer {
  constructor(requirements) {
    this.requirements = requirements;
  }

  // Calculate education score (0-5)
  scoreEducation(education) {
    if (education.major === this.requirements.requiredMajor) {
      return 5;
    } else if (this.isSimilarField(education.major, this.requirements.requiredMajor)) {
      return 3;
    }
    return 0;
  }

  // Check if fields are similar (could use NLP in more advanced version)
  isSimilarField(field1, field2) {
    // Simplified implementation - could be enhanced with domain knowledge
    const relatedFields = {
      "computer science": ["information technology", "software engineering", "information systems"],
      "finance": ["accounting", "banking", "economics"],
      // Add more related fields mapping
    };

    field1 = field1.toLowerCase();
    field2 = field2.toLowerCase();

    if (field1 === field2) return true;
    if (relatedFields[field1] && relatedFields[field1].includes(field2)) return true;
    if (relatedFields[field2] && relatedFields[field2].includes(field1)) return true;
    
    return false;
  }

  // Calculate work experience score (0-5)
  scoreWorkExperience(experience) {
    // Calculate total years from experience entries
    const totalYears = experience.reduce((total, job) => {
      // Parse duration like "2 years 3 months" or "2.5 years"
      const durationText = job.duration.toLowerCase();
      let years = 0;
      
      if (durationText.includes("year")) {
        const match = durationText.match(/(\d+(\.\d+)?)(\s+|\-)?years?/);
        if (match) years += parseFloat(match[1]);
      }
      
      if (durationText.includes("month")) {
        const match = durationText.match(/(\d+)(\s+|\-)?months?/);
        if (match) years += parseFloat(match[1]) / 12;
      }
      
      return total + years;
    }, 0);

    if (totalYears >= this.requirements.minExperienceYears) {
      return 5;
    } else if (totalYears >= this.requirements.minExperienceYears - 1) {
      return 3;
    }
    return 0;
  }

  // Calculate skills score (0-5)
  scoreSkills(skills) {
    const allSkills = [...skills.technical, ...skills.soft].map(s => s.toLowerCase());
    let requiredSkillsCount = this.requirements.requiredSkills.length;
    
    if (requiredSkillsCount === 0) return 5; // No specific skills required
    
    let matchingSkills = 0;
    for (const reqSkill of this.requirements.requiredSkills) {
      if (allSkills.some(skill => skill.includes(reqSkill.toLowerCase()) || 
                          reqSkill.toLowerCase().includes(skill))) {
        matchingSkills++;
      }
    }
    
    const matchRatio = matchingSkills / requiredSkillsCount;
    
    if (matchRatio >= 0.9) return 5;
    if (matchRatio >= 0.7) return 4;
    if (matchRatio >= 0.5) return 3;
    if (matchRatio >= 0.3) return 2;
    if (matchRatio > 0) return 1;
    return 0;
  }

  // Calculate certifications score (0-5)
  scoreCertifications(certifications) {
    if (this.requirements.requiredCertifications.length === 0) return 5;
    
    for (const reqCert of this.requirements.requiredCertifications) {
      if (certifications.some(cert => 
        cert.name.toLowerCase().includes(reqCert.toLowerCase()))) {
        return 5;
      }
    }
    return 0;
  }

  // Calculate language score (0-5)
  scoreLanguages(languages) {
    const reqLangs = this.requirements.requiredLanguageLevel;
    
    // If no specific language requirements
    if (Object.keys(reqLangs).length === 0) return 5;
    
    for (const [reqLang, reqLevel] of Object.entries(reqLangs)) {
      const candidateLang = languages.find(l => l.language.toLowerCase() === reqLang.toLowerCase());
      
      if (!candidateLang) return 0;
      
      // Convert language levels to numerical values for comparison
      const levelMap = {
        "beginner": 1,
        "elementary": 2,
        "intermediate": 3,
        "upper intermediate": 4,
        "advanced": 5,
        "proficient": 6,
        "native": 7
      };
      
      // Handle certificate-based scores (like IELTS, TOEFL)
      if (candidateLang.certification) {
        const cert = candidateLang.certification.toLowerCase();
        // Example: IELTS scores
        if (cert.includes("ielts")) {
          const match = cert.match(/(\d+(\.\d+)?)/);
          if (match) {
            const score = parseFloat(match[1]);
            if (score >= 7.5) return 5;
            if (score >= 6.5) return 4;
            if (score >= 5.5) return 3;
            return 0;
          }
        }
        // Example: TOEFL scores
        else if (cert.includes("toefl")) {
          const match = cert.match(/(\d+)/);
          if (match) {
            const score = parseInt(match[1]);
            if (score >= 100) return 5;
            if (score >= 80) return 4;
            if (score >= 60) return 3;
            return 0;
          }
        }
      }
      
      // Level-based comparison
      const candidateLevel = levelMap[candidateLang.level.toLowerCase()] || 0;
      const requiredLevel = levelMap[reqLevel.toLowerCase()] || 0;
      
      if (candidateLevel >= requiredLevel) return 5;
      if (candidateLevel >= requiredLevel - 1) return 3;
      return 0;
    }
    
    return 5; // Default if we didn't return earlier
  }

  // Calculate career objective alignment score (0-5)
  scoreCareerObjective(objective) {
    // This would ideally use NLP to assess alignment with company mission
    // Simplified implementation:
    return this.analyzeCareerObjective(objective, this.requirements.careerTrack);
  }

  // Helper for career objective analysis
  analyzeCareerObjective(objective, careerTrack) {
    // This would be a good candidate for AI analysis
    // For now implementing a simplified keyword matching system
    objective = objective.toLowerCase();
    careerTrack = careerTrack.toLowerCase();
    
    const keywords = careerTrack.split(/\s+/).filter(w => w.length > 3);
    let matches = 0;
    
    for (const keyword of keywords) {
      if (objective.includes(keyword)) matches++;
    }
    
    const matchRatio = keywords.length > 0 ? matches / keywords.length : 0;
    
    if (matchRatio >= 0.7) return 5;
    if (matchRatio >= 0.4) return 3;
    return 0;
  }

  // Award bonus points for notable achievements
  calculateAchievementBonus(achievements) {
    return achievements.length > 0 ? Math.min(achievements.length, 2) : 0;
  }

  // Calculate final weighted score
  calculateTotalScore(cv) {
    const weights = this.requirements.scoringWeights;
    
    // Base scores (0-5 scale)
    const educationScore = this.scoreEducation(cv.education);
    const experienceScore = this.scoreWorkExperience(cv.workExperience);
    const skillsScore = this.scoreSkills(cv.skills);
    const certScore = this.scoreCertifications(cv.certifications);
    const languageScore = this.scoreLanguages(cv.languages);
    const objectiveScore = this.scoreCareerObjective(cv.careerObjective);
    
    // Bonus points
    const achievementBonus = this.calculateAchievementBonus(cv.achievements);
    
    // Calculate weighted score (0-100 scale)
    let totalScore = 
      (educationScore * weights.education +
       experienceScore * weights.workExperience +
       skillsScore * weights.skills +
       certScore * weights.certifications +
       languageScore * weights.languages +
       objectiveScore * weights.careerObjective) * 20; // Convert from 0-5 to 0-100
    
    // Add bonus points (up to 10)
    totalScore += achievementBonus * weights.achievements * 5;
    
    // Ensure score doesn't exceed 100
    return Math.min(Math.round(totalScore), 100);
  }

  // Get result category based on score
  getResultCategory(score) {
    if (score >= this.requirements.passingThreshold) return "Tốt";
    if (score >= this.requirements.passingThreshold * 0.8) return "Khá";
    return "Không đạt";
  }

  // Generate detailed evaluation report
  generateReport(cv) {
    const score = this.calculateTotalScore(cv);
    const category = this.getResultCategory(score);
    
    // Individual scores for detailed feedback
    const scores = {
      education: this.scoreEducation(cv.education),
      experience: this.scoreWorkExperience(cv.workExperience),
      skills: this.scoreSkills(cv.skills),
      certifications: this.scoreCertifications(cv.certifications),
      languages: this.scoreLanguages(cv.languages),
      objective: this.scoreCareerObjective(cv.careerObjective),
    };
    
    return {
      candidateName: cv.personalInfo.name,
      totalScore: score,
      category: category,
      passingThreshold: this.requirements.passingThreshold,
      detailedScores: scores,
      bonus: this.calculateAchievementBonus(cv.achievements),
      strengths: this.identifyStrengths(scores),
      weaknesses: this.identifyWeaknesses(scores)
    };
  }

  // Helper methods for the report
  identifyStrengths(scores) {
    const strengths = [];
    if (scores.education >= 4) strengths.push("Trình độ học vấn");
    if (scores.experience >= 4) strengths.push("Kinh nghiệm làm việc");
    if (scores.skills >= 4) strengths.push("Kỹ năng chuyên môn");
    if (scores.certifications >= 4) strengths.push("Chứng chỉ");
    if (scores.languages >= 4) strengths.push("Ngoại ngữ");
    if (scores.objective >= 4) strengths.push("Định hướng nghề nghiệp");
    return strengths;
  }

  identifyWeaknesses(scores) {
    const weaknesses = [];
    if (scores.education <= 2) weaknesses.push("Trình độ học vấn");
    if (scores.experience <= 2) weaknesses.push("Kinh nghiệm làm việc");
    if (scores.skills <= 2) weaknesses.push("Kỹ năng chuyên môn");
    if (scores.certifications <= 2) weaknesses.push("Chứng chỉ");
    if (scores.languages <= 2) weaknesses.push("Ngoại ngữ");
    if (scores.objective <= 2) weaknesses.push("Định hướng nghề nghiệp");
    return weaknesses;
  }
}

// Gemini API Integration for CV Analysis
class GeminiCVAnalyzer {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl = API_URL;
  }

  // Extract CV data from raw text using Gemini API
  async extractCVData(rawCVText) {
    try {
      const prompt = `
        Analyze the following resume/CV text and extract structured data in JSON format:
        
        ${rawCVText}
        
        Please format the output as a valid JSON with the following structure:
        {
          "personalInfo": {"name": "", "age": 0, "gender": ""},
          "education": {"degree": "", "major": "", "school": "", "gpa": ""},
          "workExperience": [{"company": "", "title": "", "duration": "", "description": ""}],
          "skills": {"technical": [], "soft": []},
          "certifications": [{"name": "", "level": "", "year": ""}],
          "projects": [{"name": "", "role": "", "achievements": ""}],
          "languages": [{"language": "", "level": "", "certification": ""}],
          "achievements": [{"name": "", "description": "", "year": ""}],
          "careerObjective": "",
          "interests": [],
          "specialRequirements": {"travelWillingness": false, "shiftWork": false, "relocation": false}
        }
        
        Ensure all information is correctly categorized and formatted as per the structure.
      `;

      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      const data = await response.json();
      
      if (data.error) {
        console.error("Gemini API Error:", data.error);
        throw new Error(`Gemini API Error: ${data.error.message}`);
      }

      // Extract the generated text from the response
      const generatedText = data.candidates[0].content.parts[0].text;
      
      // Find and extract the JSON object from the text
      const jsonMatch = generatedText.match(/(\{[\s\S]*\})/);
      if (!jsonMatch) {
        throw new Error("Could not extract JSON from Gemini response");
      }
      
      const extractedJson = jsonMatch[0];
      const cvData = JSON.parse(extractedJson);
      
      return this.convertToCVData(cvData);
    } catch (error) {
      console.error("Error analyzing CV:", error);
      throw error;
    }
  }

  // Convert parsed JSON to CVData instance
  convertToCVData(parsedData) {
    const cvData = new CVData();
    
    // Map the parsed JSON to our CVData structure
    Object.assign(cvData.personalInfo, parsedData.personalInfo || {});
    Object.assign(cvData.education, parsedData.education || {});
    cvData.workExperience = parsedData.workExperience || [];
    
    if (parsedData.skills) {
      cvData.skills.technical = parsedData.skills.technical || [];
      cvData.skills.soft = parsedData.skills.soft || [];
    }
    
    cvData.certifications = parsedData.certifications || [];
    cvData.projects = parsedData.projects || [];
    cvData.languages = parsedData.languages || [];
    cvData.achievements = parsedData.achievements || [];
    cvData.careerObjective = parsedData.careerObjective || "";
    cvData.interests = parsedData.interests || [];
    
    if (parsedData.specialRequirements) {
      Object.assign(cvData.specialRequirements, parsedData.specialRequirements);
    }
    
    return cvData;
  }

  // Get detailed insights about a CV's strengths and weaknesses
  async getDetailedInsights(cv, position) {
    try {
      const prompt = `
        As an expert CV analyst, provide detailed insights about the following CV for a ${position} position:
        
        Candidate: ${cv.personalInfo.name}
        Education: ${cv.education.degree} in ${cv.education.major} from ${cv.education.school}
        Work Experience: ${cv.workExperience.map(exp => 
          `${exp.title} at ${exp.company} (${exp.duration})`).join(', ')}
        Skills: Technical - ${cv.skills.technical.join(', ')}, Soft - ${cv.skills.soft.join(', ')}
        Career Objective: ${cv.careerObjective}
        
        Please provide:
        1. Three key strengths of this candidate for the ${position} position
        2. Two areas for improvement
        3. Overall fit assessment (Good fit, Moderate fit, or Poor fit)
        
        Format as a JSON object with keys: strengths (array), improvements (array), fit (string)
      `;

      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      const data = await response.json();
      
      if (data.error) {
        console.error("Gemini API Error:", data.error);
        throw new Error(`Gemini API Error: ${data.error.message}`);
      }

      // Extract the generated text from the response
      const generatedText = data.candidates[0].content.parts[0].text;
      
      // Find and extract the JSON object from the text
      const jsonMatch = generatedText.match(/(\{[\s\S]*\})/);
      if (!jsonMatch) {
        throw new Error("Could not extract JSON from Gemini response");
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error("Error getting detailed insights:", error);
      throw error;
    }
  }
}

// Example usage
async function demoSystem() {
  // Initialize Gemini analyzer
  const analyzer = new GeminiCVAnalyzer(API_KEY);
  
  // Sample raw CV text (this would come from file upload or copy-paste)
  const rawCVText = `
    NGUYỄN VĂN A
    Nam, 28 tuổi
    
    HỌC VẤN
    - Đại học Bách Khoa Hà Nội
    - Kỹ sư Công nghệ Thông tin
    - GPA: 3.5/4.0
    
    KINH NGHIỆM LÀM VIỆC
    - Công ty Tech Solutions (2021 - hiện tại)
      Chức danh: Senior Developer
      Mô tả: Phát triển ứng dụng web sử dụng React, Node.js
      
    - Công ty ABC Software (2018 - 2021)
      Chức danh: Developer
      Mô tả: Phát triển backend với Java SpringBoot
    
    KỸ NĂNG
    - Kỹ thuật: JavaScript, React, Node.js, Java, SQL, Git
    - Kỹ năng mềm: Làm việc nhóm, thuyết trình, quản lý thời gian
    
    CHỨNG CHỈ
    - AWS Certified Developer (2022)
    - IELTS 7.5 (2020)
    
    DỰ ÁN TIÊU BIỂU
    - Hệ thống quản lý khách hàng toàn quốc
      Vai trò: Team lead
      Kết quả: Tăng 30% hiệu suất xử lý
    
    NGOẠI NGỮ
    - Tiếng Anh (IELTS 7.5)
    - Tiếng Nhật (N4)
    
    MỤC TIÊU NGHỀ NGHIỆP
    Tôi mong muốn trở thành một Technical Lead trong lĩnh vực phát triển web, đóng góp vào các dự án lớn và đổi mới công nghệ.
    
    SỞ THÍCH
    - Đọc sách về công nghệ
    - Chơi cờ vua
  `;
  
  // Job position definition
  const developerPosition = new PositionRequirements("Senior Frontend Developer");
  developerPosition.requiredDegree = "Bachelor";
  developerPosition.requiredMajor = "Computer Science";
  developerPosition.minExperienceYears = 3;
  developerPosition.requiredSkills = ["JavaScript", "React", "CSS", "HTML", "Git"];
  developerPosition.requiredCertifications = [];
  developerPosition.requiredLanguageLevel = {"English": "upper intermediate"};
  developerPosition.careerTrack = "Technical leadership in web development";
  developerPosition.passingThreshold = 80;
  
  try {
    // Extract CV data
    console.log("Analyzing CV...");
    const cvData = await analyzer.extractCVData(rawCVText);
    
    // Score the CV
    console.log("Scoring CV...");
    const scorer = new CVScorer(developerPosition);
    const report = scorer.generateReport(cvData);
    
    // Get AI insights
    console.log("Getting detailed insights...");
    const insights = await analyzer.getDetailedInsights(cvData, developerPosition.positionName);
    
    // Final output
    console.log("\n=== CV EVALUATION REPORT ===");
    console.log(`Candidate: ${report.candidateName}`);
    console.log(`Position: ${developerPosition.positionName}`);
    console.log(`Total Score: ${report.totalScore}/100 (${report.category})`);
    console.log(`Passing Threshold: ${report.passingThreshold}`);
    console.log("\nDetailed Scores:");
    console.log(`- Trình độ học vấn: ${report.detailedScores.education}/5`);
    console.log(`- Kinh nghiệm làm việc: ${report.detailedScores.experience}/5`);
    console.log(`- Kỹ năng chuyên môn: ${report.detailedScores.skills}/5`);
    console.log(`- Chứng chỉ: ${report.detailedScores.certifications}/5`);
    console.log(`- Ngoại ngữ: ${report.detailedScores.languages}/5`);
    console.log(`- Mục tiêu nghề nghiệp: ${report.detailedScores.objective}/5`);
    console.log(`- Điểm thưởng thành tích: +${report.bonus}`);
    
    console.log("\nAI Insights:");
    console.log("Strengths:", insights.strengths);
    console.log("Areas for improvement:", insights.improvements);
    console.log("Overall fit:", insights.fit);
    
    if (report.category === "Tốt") {
      console.log("\nRecommendation: Proceed to interview stage");
    } else if (report.category === "Khá") {
      console.log("\nRecommendation: Consider for interview if there are insufficient stronger candidates");
    } else {
      console.log("\nRecommendation: Not recommended for this position");
    }
    
  } catch (error) {
    console.error("Demo error:", error);
  }
}

// Form data interface for CV submission
class CVSubmissionForm {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) {
      throw new Error(`Container ${containerSelector} not found`);
    }
  }
  
  render() {
    this.container.innerHTML = `
      <div class="cv-form">
        <h2>Ứng tuyển vị trí</h2>
        <select id="position-select">
          <option value="dev">Senior Frontend Developer</option>
          <option value="pm">Project Manager</option>
          <option value="marketing">Marketing Specialist</option>
        </select>
        
        <h2>Thông tin cá nhân</h2>
        <div class="form-group">
          <label for="name">Họ và tên</label>
          <input type="text" id="name" placeholder="Nguyễn Văn A">
        </div>`;

    // Add the rest of the form HTML
    this.appendFormSections();
    this.attachEventListeners();
  }

  appendFormSections() {
    // Break down the large template into smaller sections for better maintenance
    this.container.querySelector('.cv-form').innerHTML += `
      ${this.getPersonalInfoSection()}
      ${this.getEducationSection()}
      ${this.getExperienceSection()}
      ${this.getSkillsSection()}
      ${this.getCertificationsSection()}
      ${this.getProjectsSection()}
      ${this.getLanguagesSection()}
      ${this.getCareerSection()}
      ${this.getSpecialRequirementsSection()}
      ${this.getFormActions()}
    `;
  }

  // Helper methods to generate form sections
  getPersonalInfoSection() {
    return `
      <div class="form-section personal-info">
        <div class="form-group">
          <label for="age">Tuổi</label>
          <input type="number" id="age" placeholder="28">
        </div>
        <div class="form-group">
          <label for="gender">Giới tính</label>
          <select id="gender">
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </div>
      </div>
    `;
  }

  getEducationSection() {
    return `
      <h2>Học vấn</h2>
      <div class="form-group">
        <label for="degree">Bằng cấp</label>
        <select id="degree">
          <option value="bachelor">Cử nhân/Kỹ sư</option>
          <option value="master">Thạc sĩ</option>
          <option value="phd">Tiến sĩ</option>
          <option value="other">Khác</option>
        </select>
      </div>
      <div class="form-group">
        <label for="major">Chuyên ngành</label>
        <input type="text" id="major" placeholder="Công nghệ thông tin">
      </div>
      <div class="form-group">
        <label for="school">Trường</label>
        <input type="text" id="school" placeholder="Đại học Bách Khoa Hà Nội">
      </div>
      <div class="form-group">
        <label for="gpa">GPA</label>
        <input type="text" id="gpa" placeholder="3.5/4.0">
      </div>
    `;
  }

  getExperienceSection() {
    return `
      <h2>Kinh nghiệm làm việc</h2>
      <div id="experience-container">
        <div class="experience-entry">
          <div class="form-group">
            <label>Công ty</label>
            <input type="text" class="company" placeholder="Công ty ABC">
          </div>
          <div class="form-group">
            <label>Chức danh</label>
            <input type="text" class="title" placeholder="Senior Developer">
          </div>
          <div class="form-group">
            <label>Thời gian</label>
            <input type="text" class="duration" placeholder="2021 - hiện tại">
          </div>
          <div class="form-group">
            <label>Mô tả công việc</label>
            <textarea class="description" placeholder="Mô tả chi tiết công việc và trách nhiệm"></textarea>
          </div>
        </div>
      </div>
      <button id="add-experience" type="button">+ Thêm kinh nghiệm</button>
    `;
  }

  getSkillsSection() {
    return `
      <h2>Kỹ năng</h2>
      <div class="form-group">
        <label for="technical-skills">Kỹ năng chuyên môn</label>
        <textarea id="technical-skills" placeholder="JavaScript, React, Node.js, Java, SQL, Git"></textarea>
      </div>
      <div class="form-group">
        <label for="soft-skills">Kỹ năng mềm</label>
        <textarea id="soft-skills" placeholder="Làm việc nhóm, thuyết trình, quản lý thời gian"></textarea>
      </div>
    `;
  }

  getCertificationsSection() {
    return `
      <h2>Chứng chỉ</h2>
      <div id="certification-container">
        <div class="certification-entry">
          <div class="form-group">
            <label>Tên chứng chỉ</label>
            <input type="text" class="cert-name" placeholder="IELTS">
          </div>
          <div class="form-group">
            <label>Điểm/Cấp độ</label>
            <input type="text" class="cert-level" placeholder="7.5">
          </div>
          <div class="form-group">
            <label>Năm</label>
            <input type="text" class="cert-year" placeholder="2020">
          </div>
        </div>
      </div>
      <button id="add-certification" type="button">+ Thêm chứng chỉ</button>
    `;
  }

  getProjectsSection() {
    return `
      <h2>Dự án tiêu biểu</h2>
      <div id="project-container">
        <div class="project-entry">
          <div class="form-group">
            <label>Tên dự án</label>
            <input type="text" class="project-name" placeholder="Hệ thống quản lý khách hàng">
          </div>
          <div class="form-group">
            <label>Vai trò</label>
            <input type="text" class="project-role" placeholder="Team Lead">
          </div>
          <div class="form-group">
            <label>Thành tựu</label>
            <textarea class="project-achievements" placeholder="Mô tả thành tựu đạt được trong dự án"></textarea>
          </div>
        </div>
      </div>
      <button id="add-project" type="button">+ Thêm dự án</button>
    `;
  }

  getLanguagesSection() {
    return `
      <h2>Ngoại ngữ</h2>
      <div id="language-container">
        <div class="language-entry">
          <div class="form-group">
            <label>Ngôn ngữ</label>
            <input type="text" class="language-name" placeholder="Tiếng Anh">
          </div>
          <div class="form-group">
            <label>Trình độ</label>
            <select class="language-level">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="proficient">Proficient</option>
            </select>
          </div>
          <div class="form-group">
            <label>Chứng chỉ</label>
            <input type="text" class="language-cert" placeholder="IELTS 7.5">
          </div>
        </div>
      </div>
      <button id="add-language" type="button">+ Thêm ngoại ngữ</button>
    `;
  }

  getCareerSection() {
    return `
      <h2>Mục tiêu nghề nghiệp</h2>
      <div class="form-group">
        <textarea id="career-objective" placeholder="Mô tả mục tiêu nghề nghiệp của bạn"></textarea>
      </div>
    `;
  }

  getSpecialRequirementsSection() {
    return `
      <h2>Yêu cầu đặc biệt</h2>
      <div class="form-group">
        <label>
          <input type="checkbox" id="travel-willingness"> Sẵn sàng đi công tác
        </label>
      </div>
      <div class="form-group">
        <label>
          <input type="checkbox" id="shift-work"> Có thể làm việc theo ca
        </label>
      </div>
      <div class="form-group">
        <label>
          <input type="checkbox" id="relocation"> Có thể relocate
        </label>
      </div>
      <div class="form-group">
        <label>Yêu cầu khác</label>
        <textarea id="other-requirements" placeholder="Các yêu cầu đặc biệt khác"></textarea>
      </div>
    `;
  }

  getFormActions() {
    return `
      <div class="form-actions">
        <button type="submit" id="submit-cv">Gửi hồ sơ</button>
        <button type="reset" id="reset-form">Làm mới</button>
      </div>
    `;
  }

  attachEventListeners() {
    const addExperience = document.getElementById('add-experience');
    const addCertification = document.getElementById('add-certification');
    const addProject = document.getElementById('add-project');
    const addLanguage = document.getElementById('add-language');
    const submitForm = document.getElementById('submit-cv');
    const resetForm = document.getElementById('reset-form');

    addExperience?.addEventListener('click', () => this.addExperienceEntry());
    addCertification?.addEventListener('click', () => this.addCertificationEntry());
    addProject?.addEventListener('click', () => this.addProjectEntry());
    addLanguage?.addEventListener('click', () => this.addLanguageEntry());
    submitForm?.addEventListener('click', (e) => this.handleSubmit(e));
    resetForm?.addEventListener('click', () => this.resetForm());
  }

  // Helper methods to add new entries
  addExperienceEntry() {
    const container = document.getElementById('experience-container');
    const template = document.querySelector('.experience-entry').cloneNode(true);
    this.clearInputs(template);
    container?.appendChild(template);
  }

  addCertificationEntry() {
    const container = document.getElementById('certification-container');
    const template = document.querySelector('.certification-entry').cloneNode(true);
    this.clearInputs(template);
    container?.appendChild(template);
  }

  addProjectEntry() {
    const container = document.getElementById('project-container');
    const template = document.querySelector('.project-entry').cloneNode(true);
    this.clearInputs(template);
    container?.appendChild(template);
  }

  addLanguageEntry() {
    const container = document.getElementById('language-container');
    const template = document.querySelector('.language-entry').cloneNode(true);
    this.clearInputs(template);
    container?.appendChild(template);
  }

  clearInputs(element) {
    element.querySelectorAll('input, textarea').forEach(input => input.value = '');
    element.querySelectorAll('select').forEach(select => select.selectedIndex = 0);
  }

  handleSubmit(e) {
    e.preventDefault();
    // Collect form data and create CVData object
    const cvData = this.collectFormData();
    // Initialize scorer with position requirements
    const position = this.getPositionRequirements();
    const scorer = new CVScorer(position);
    // Generate and display report
    const report = scorer.generateReport(cvData);
    this.displayReport(report);
  }

  resetForm() {
    this.container.querySelector('.cv-form').reset();
  }

  // Add missing methods
  collectFormData() {
    const cvData = new CVData();
    
    // Personal Info
    cvData.personalInfo.name = document.getElementById('name').value;
    cvData.personalInfo.age = parseInt(document.getElementById('age').value) || 0;
    cvData.personalInfo.gender = document.getElementById('gender').value;
    
    // Education
    cvData.education.degree = document.getElementById('degree').value;
    cvData.education.major = document.getElementById('major').value;
    cvData.education.school = document.getElementById('school').value;
    cvData.education.gpa = document.getElementById('gpa').value;
    
    // Work Experience
    cvData.workExperience = Array.from(document.querySelectorAll('.experience-entry')).map(entry => ({
      company: entry.querySelector('.company').value,
      title: entry.querySelector('.title').value,
      duration: entry.querySelector('.duration').value,
      description: entry.querySelector('.description').value
    }));
    
    // Skills
    cvData.skills.technical = document.getElementById('technical-skills').value
      .split(',').map(skill => skill.trim()).filter(Boolean);
    cvData.skills.soft = document.getElementById('soft-skills').value
      .split(',').map(skill => skill.trim()).filter(Boolean);
    
    // Certifications
    cvData.certifications = Array.from(document.querySelectorAll('.certification-entry')).map(entry => ({
      name: entry.querySelector('.cert-name').value,
      level: entry.querySelector('.cert-level').value,
      year: entry.querySelector('.cert-year').value
    }));
    
    // Languages
    cvData.languages = Array.from(document.querySelectorAll('.language-entry')).map(entry => ({
      language: entry.querySelector('.language-name').value,
      level: entry.querySelector('.language-level').value,
      certification: entry.querySelector('.language-cert').value
    }));
    
    // Career Objective
    cvData.careerObjective = document.getElementById('career-objective').value;
    
    // Interests
    cvData.interests = document.getElementById('interests').value
      .split(',').map(interest => interest.trim()).filter(Boolean);
    
    // Special Requirements
    cvData.specialRequirements.travelWillingness = document.getElementById('travel-willingness').checked;
    cvData.specialRequirements.shiftWork = document.getElementById('shift-work').checked;
    cvData.specialRequirements.relocation = document.getElementById('relocation').checked;
    cvData.specialRequirements.others = document.getElementById('other-requirements').value
      .split(',').map(req => req.trim()).filter(Boolean);
    
    return cvData;
  }

  getPositionRequirements() {
    const positionType = document.getElementById('position-select').value;
    const requirements = new PositionRequirements(
      document.getElementById('position-select').options[
        document.getElementById('position-select').selectedIndex
      ].text
    );
    
    switch(positionType) {
      case 'dev':
        requirements.requiredDegree = "Bachelor";
        requirements.requiredMajor = "Computer Science";
        requirements.minExperienceYears = 3;
        requirements.requiredSkills = ["JavaScript", "React", "CSS", "HTML", "Git"];
        requirements.requiredLanguageLevel = {"English": "upper intermediate"};
        requirements.careerTrack = "Technical leadership in web development";
        break;
        
      case 'pm':
        requirements.requiredDegree = "Bachelor";
        requirements.requiredMajor = "Computer Science";
        requirements.minExperienceYears = 5;
        requirements.requiredSkills = ["Project Management", "Agile", "Scrum", "Leadership"];
        requirements.requiredLanguageLevel = {"English": "advanced"};
        requirements.careerTrack = "Project Management leadership";
        break;
        
      case 'marketing':
        requirements.requiredDegree = "Bachelor";
        requirements.requiredMajor = "Marketing";
        requirements.minExperienceYears = 2;
        requirements.requiredSkills = ["Digital Marketing", "Social Media", "Content Creation"];
        requirements.requiredLanguageLevel = {"English": "intermediate"};
        requirements.careerTrack = "Marketing strategy and execution";
        break;
    }
    
    return requirements;
  }

  displayReport(report) {
    const reportHTML = `
      <div class="report-container">
        <h2>Kết quả đánh giá CV</h2>
        <div class="report-section">
          <h3>Thông tin chung</h3>
          <p>Ứng viên: ${report.candidateName}</p>
          <p>Điểm tổng: ${report.totalScore}/100</p>
          <p>Xếp loại: ${report.category}</p>
        </div>
        
        <div class="report-section">
          <h3>Điểm chi tiết</h3>
          <ul>
            <li>Trình độ học vấn: ${report.detailedScores.education}/5</li>
            <li>Kinh nghiệm làm việc: ${report.detailedScores.experience}/5</li>
            <li>Kỹ năng chuyên môn: ${report.detailedScores.skills}/5</li>
            <li>Chứng chỉ: ${report.detailedScores.certifications}/5</li>
            <li>Ngoại ngữ: ${report.detailedScores.languages}/5</li>
            <li>Mục tiêu nghề nghiệp: ${report.detailedScores.objective}/5</li>
            <li>Điểm thưởng thành tích: +${report.bonus}</li>
          </ul>
        </div>
        
        <div class="report-section">
          <h3>Điểm mạnh</h3>
          <ul>
            ${report.strengths.map(strength => `<li>${strength}</li>`).join('')}
          </ul>
        </div>
        
        <div class="report-section">
          <h3>Điểm cần cải thiện</h3>
          <ul>
            ${report.weaknesses.map(weakness => `<li>${weakness}</li>`).join('')}
          </ul>
        </div>
        
        <div class="report-section">
          <h3>Kết luận</h3>
          <p>${this.getRecommendation(report.category)}</p>
        </div>
      </div>
    `;
    
    // Create modal or new section to display report
    const reportDiv = document.createElement('div');
    reportDiv.innerHTML = reportHTML;
    this.container.appendChild(reportDiv);
  }

  getRecommendation(category) {
    switch(category) {
      case "Tốt":
        return "Khuyến nghị: Tiến hành phỏng vấn";
      case "Khá":
        return "Khuyến nghị: Xem xét phỏng vấn nếu không có ứng viên tốt hơn";
      default:
        return "Khuyến nghị: Không phù hợp với vị trí này";
    }
  }
}

// ...rest of existing code...