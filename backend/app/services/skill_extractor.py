COMMON_SKILLS = [
    "python", "java", "javascript", "typescript", "react", "angular", "vue",
    "node", "fastapi", "django", "flask", "sql", "mysql", "postgresql",
    "mongodb", "docker", "kubernetes", "aws", "azure", "git", "linux",
    "machine learning", "deep learning", "tensorflow", "pytorch", "pandas",
    "numpy", "scikit-learn", "excel", "power bi", "tableau",
    "autocad", "matlab", "solidworks", "catia",
    "iletisim", "takim calismasi", "proje yonetimi", "ingilizce",
    "surucu belgesi", "ms office", "raporlama"
]

JOB_SUGGESTIONS = {
    "python": ["Backend Developer", "Data Scientist", "ML Engineer"],
    "react": ["Frontend Developer", "Full Stack Developer"],
    "sql": ["Data Analyst", "Database Administrator"],
    "docker": ["DevOps Engineer", "Backend Developer"],
    "machine learning": ["ML Engineer", "Data Scientist"],
    "excel": ["Data Analyst", "Business Analyst"],
    "ms office": ["Business Analyst", "Project Manager"],
    "ingilizce": ["Business Analyst", "Project Manager"],
}

MARKET_INFO = {
    "python": "Python geliştiricilerine talep 2024'te %35 arttı.",
    "react": "React geliştiricileri için yüksek talep devam ediyor.",
    "sql": "Veri analizi alanında SQL bilgisi kritik öneme sahip.",
    "docker": "DevOps alanında Docker bilgisi çok aranıyor.",
    "machine learning": "ML mühendislerine talep hızla artıyor.",
    "ms office": "MS Office her sektörde temel gereksinim olmaya devam ediyor.",
    "ingilizce": "İngilizce bilen adaylara talebin yüksek olduğu görülüyor.",
}

def extract_skills(text: str) -> list:
    text = text.lower()
    found = []
    for skill in COMMON_SKILLS:
        if skill in text:
            found.append(skill)
    return found

def find_missing_skills(cv_text: str, job_text: str) -> list:
    cv_skills = extract_skills(cv_text)
    job_skills = extract_skills(job_text)
    missing = [s for s in job_skills if s not in cv_skills]
    return missing

def get_alternative_jobs(cv_text: str) -> list:
    skills = extract_skills(cv_text)
    jobs = set()
    for skill in skills:
        if skill in JOB_SUGGESTIONS:
            for job in JOB_SUGGESTIONS[skill]:
                jobs.add(job)
    return list(jobs)[:3]

def get_market_info(job_text: str) -> str:
    skills = extract_skills(job_text)
    for skill in skills:
        if skill in MARKET_INFO:
            return MARKET_INFO[skill]
    return "Bu alan için piyasa verisi bulunamadi."