export const mockAnalysis = {
  match_percentage: 78,
  missing_skills: ["docker", "ci/cd", "unit testing", "kubernetes"],
  improved_match: 90,
  alternative_jobs: [
    "Frontend Geliştirici",
    "React Geliştirici",
    "Full Stack Geliştirici"
  ],
  nearby_jobs: [
    {
      id: "mock-1",
      title: "React Frontend Developer",
      company: "SabancıDx",
      location: "Sabancı Center, 4. Levent, İstanbul",
      distance_km: 4.2,
      match_score: 86,
      work_model: "Hibrit",
      salary_range: "45K - 60K",
      matched_skills: ["react", "javascript", "css"],
      missing_skills: ["unit testing"],
      lat: 41.0853,
      lon: 29.0094,
      map_url: "https://www.openstreetmap.org/search?query=Sabanc%C4%B1%20Center%20%C4%B0stanbul"
    },
    {
      id: "mock-2",
      title: "Junior Full Stack Developer",
      company: "Türkiye Finans",
      location: "Ümraniye, İstanbul",
      distance_km: 8.7,
      match_score: 79,
      work_model: "Ofis",
      salary_range: "38K - 52K",
      matched_skills: ["javascript", "rest api", "sql"],
      missing_skills: ["docker", "ci/cd"],
      lat: 41.0259,
      lon: 29.1166,
      map_url: "https://www.openstreetmap.org/search?query=T%C3%BCrkiye%20Finans%20%C3%9Cmraniye%20%C4%B0stanbul"
    },
    {
      id: "mock-3",
      title: "Frontend Engineer",
      company: "Turkcell",
      location: "Küçükyalı Plaza, İstanbul",
      distance_km: 2.8,
      match_score: 74,
      work_model: "Uzaktan",
      salary_range: "40K - 55K",
      matched_skills: ["react", "responsive tasarım"],
      missing_skills: ["typescript"],
      lat: 40.9512,
      lon: 29.1127,
      map_url: "https://www.openstreetmap.org/search?query=Turkcell%20K%C3%BC%C3%A7%C3%BCkyal%C4%B1%20Plaza%20%C4%B0stanbul"
    }
  ],
  market_info:
    "React ve modern frontend araçlarında güçlü adaylara talep yüksek. Test süreçleri ve canlıya alma bilgisi, adayların öne çıkmasını sağlayan başlıca alanlar arasında."
};

export const sampleJobText = `React, JavaScript, TypeScript ve CSS konularında güçlü bir Frontend Geliştirici arıyoruz.
REST API deneyimi, Docker, CI/CD süreçleri, test kütüphaneleri ve responsive tasarım bilgisi tercih sebebidir.`;
