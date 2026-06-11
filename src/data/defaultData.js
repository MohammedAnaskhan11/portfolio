// ─────────────────────────────────────────────────────────────
// All default portfolio content — edit via /admin or here
// ─────────────────────────────────────────────────────────────

const defaultData = {
  hero: {
    name: 'Mohammed Anas Khan',
    roles: [
      'AI/ML Engineer',
      'Computer Vision Engineer',
      'Deep Learning Researcher',
      'NeRF & 3D Reconstruction',
      'PyTorch Developer',
    ],
    bio: "CS undergrad at SRM IST, Trichy (CGPA 8.5) specialising in AI & ML. Building photorealistic 3D scenes with Neural Radiance Fields, dementia-detection from speech, and AI-driven systems that blur the line between research and production.",
    github: 'https://github.com/MohammedAnaskhan11',
    linkedin: 'https://linkedin.com/in/mohammed-anaskhan-928854289',
    location: 'Tiruchirappalli, India',
    available: true,
    availabilityText: 'Available for Internships · 2025',
    chips: ['Computer Vision', 'Deep Learning', 'NeRF / 3D Reconstruction', 'PyTorch', 'Linux & Systems'],
  },

  about: {
    para1: "I'm a Computer Science undergraduate at SRM IST, Trichy (expected 2027), specialising in AI & Machine Learning with a CGPA of 8.5/10. My work sits at the intersection of deep learning, computer vision, and systems engineering.",
    para2: "I've built 3D reconstruction pipelines with Neural Radiance Fields using COLMAP and Nerfstudio, designed CNN-based dementia-detection models from speech and text data, and led an AI-driven vertical farming startup that won the Chem-E-Ignite 2025 pitch at IIT Madras.",
    para3: "I've also hardened Linux systems with SELinux at CDAC Chennai and love turning research ideas into production-ready software with PyTorch, OpenCV, and Docker.",
    quickSkills: ['Python', 'PyTorch', 'OpenCV', 'Linux', 'Docker', 'Node.js'],
    stats: [
      { label: 'CGPA',           value: 8.5,  decimals: 1, suffix: '/10', from: 0 },
      { label: 'Hackathons Won', value: 2,    decimals: 0, suffix: '',    from: 0 },
      { label: 'AI/ML Projects', value: 3,    decimals: 0, suffix: '+',   from: 0 },
      { label: 'Grad Year',      value: 2027, decimals: 0, suffix: '',    from: 2020 },
    ],
  },

  skills: [
    {
      name: 'Programming', color: 'accent',
      skills: [
        { name: 'Python', pct: 95 }, { name: 'C / C++', pct: 78 },
        { name: 'JavaScript', pct: 72 }, { name: 'Java', pct: 65 },
      ],
    },
    {
      name: 'Machine Learning', color: 'violet',
      skills: [
        { name: 'PyTorch', pct: 90 }, { name: 'TensorFlow', pct: 75 },
        { name: 'Scikit-learn', pct: 80 },
      ],
    },
    {
      name: 'Computer Vision', color: 'accent',
      skills: [
        { name: 'OpenCV', pct: 88 }, { name: 'NeRF / Nerfstudio', pct: 82 },
        { name: '3D Reconstruction', pct: 78 }, { name: 'Image Processing', pct: 85 },
      ],
    },
    {
      name: 'Data Processing', color: 'violet',
      skills: [{ name: 'NumPy', pct: 92 }, { name: 'Pandas', pct: 88 }],
    },
    {
      name: 'Backend', color: 'accent',
      skills: [{ name: 'Node.js', pct: 70 }, { name: 'REST APIs', pct: 75 }],
    },
    {
      name: 'Databases', color: 'violet',
      skills: [
        { name: 'MySQL', pct: 72 }, { name: 'PostgreSQL', pct: 68 }, { name: 'JDBC', pct: 60 },
      ],
    },
    {
      name: 'Systems', color: 'accent',
      skills: [
        { name: 'Linux', pct: 88 }, { name: 'Docker', pct: 72 }, { name: 'Shell / SELinux', pct: 78 },
      ],
    },
    {
      name: 'Tools', color: 'violet',
      skills: [
        { name: 'Figma', pct: 65 }, { name: 'Android Studio', pct: 58 }, { name: 'FlutterFlow', pct: 55 },
      ],
    },
  ],

  projects: [
    {
      id: '1',
      title: '3D Heritage Reconstruction using NeRF',
      tag: 'Computer Vision',
      desc: 'Built a full 3D reconstruction pipeline generating photorealistic scenes from multi-view images of heritage structures. Camera pose estimation and sparse point-cloud generation with COLMAP; trained a Neural Radiance Field to synthesize novel viewpoints; OpenCV preprocessing for quality and accuracy.',
      tech: ['Python', 'PyTorch', 'OpenCV', 'COLMAP', 'Nerfstudio'],
      accent: '#3ef2d0',
      github: 'https://github.com/MohammedAnaskhan11',
      live: '',
    },
    {
      id: '2',
      title: 'Early Dementia Detection (Voice + Text)',
      tag: 'Research · ML',
      desc: 'ML pipeline to identify early dementia through speech and linguistic analysis. Extracted MFCC and spectral audio features; designed and trained a CNN for speech-based dementia classification; applied feature-fusion combining acoustic and linguistic cues for improved performance.',
      tech: ['Python', 'PyTorch', 'Librosa', 'Scikit-learn', 'NumPy', 'Pandas'],
      accent: '#7c5cff',
      github: 'https://github.com/MohammedAnaskhan11',
      live: '',
    },
    {
      id: '3',
      title: 'ZenithCrom — AI Vertical Farming',
      tag: '🏆 IIT Madras Winner',
      desc: "AI-driven vertical farming system for sustainable agriculture aligned with UN SDGs. Startup pitch winner at Chem-E-Ignite 2025 at IIT Madras. Integrated sensor data, ML models for crop health prediction, and automated resource management.",
      tech: ['AI/ML', 'Sensor Fusion', 'Sustainable Ag'],
      accent: '#3ef2d0',
      github: 'https://github.com/MohammedAnaskhan11',
      live: '',
    },
  ],

  achievements: [
    {
      id: '1',
      title: 'Winner — Chem-E-Ignite 2025 Startup Pitch',
      org: 'IIT Madras',
      date: '16 Mar 2025',
      desc: "Presented ZenithCrom, an AI-driven vertical farming system aligned with UN Sustainable Development Goals, winning the startup pitch competition at one of India's premier technology institutes.",
      image: '/ach1.png',
    },
    {
      id: '2',
      title: 'Winner — Prayan 2026 Hackathon',
      org: 'NIT Trichy · Sponsored by Khel.ai',
      date: 'Feb 2026',
      desc: 'Built high-performance FPS camera software dynamically adjusting ISO and imaging parameters at 60+ FPS, detecting overlapping pixels for real-time image-processing accuracy.',
      image: '/ach2.png',
    },
    {
      id: '3',
      title: 'First Prize — Genesis 2026',
      org: 'Trichy SRM Medical College Hospital and Research Centre',
      date: '2026',
      desc: 'Won First Prize for "Dextra" — an innovative assistive hand orthosis system designed to support neuromuscular rehabilitation by enabling improved hand movement through intelligent and adaptive AI/ML technology. Represented the Dept. of AI & ML, School of Computing.',
      image: '',
    },
  ],

  // Carousel images — add your own achievement photos here
  achievementImages: [
    { id: '1', url: '/ach1.png',  caption: 'Chem-E-Ignite 2025 · IIT Madras', sub: 'Winner — Startup Pitch' },
    { id: '2', url: '/ach2.png',  caption: 'Prayan 2026 Hackathon · NIT Trichy', sub: 'Winner — Sponsored by Khel.ai' },
    { id: '3', url: '',           caption: 'Genesis 2026 · SRM Medical College', sub: 'First Prize — Dextra (Hand Orthosis)' },
  ],

  experience: {
    work: [
      {
        id: '1',
        role: 'Project Intern',
        org: 'CDAC Chennai',
        date: 'Jun 2025 – Aug 2025',
        points: [
          'Linux OS hardening with emphasis on secure system configuration',
          'Implemented and analyzed SELinux security policies and secure-boot mechanisms',
          'Hands-on system-level security practices in Linux environments',
        ],
      },
    ],
    education: [
      { id: '1', role: 'B.Tech CSE (AI & ML)', org: 'SRM IST, Trichy', date: '2023 – 2027', detail: 'CGPA: 8.5/10' },
      { id: '2', role: 'Class XII (State Board, MPC)', org: 'St. Thomas Matric Hr. Sec. School, Thoothukudi', date: '2023', detail: '79%' },
      { id: '3', role: 'Class X (State Board)', org: 'St. Thomas Matric Hr. Sec. School, Thoothukudi', date: '2021', detail: '80%' },
    ],
  },

  contact: {
    email: 'smohammedanaskhan@gmail.com',
    phone: '+91 9952230116',
    location: 'Tiruchirappalli, Tamil Nadu, India',
  },
};

export default defaultData;
