/**
 * Dữ liệu thẻ tag dùng cho TagPicker
 *
 * Mỗi section gồm:
 *   id          – định danh duy nhất, cũng là key trong value object
 *   label       – tên hiển thị
 *   required    – bắt buộc chọn
 *   min         – số thẻ tối thiểu (0 = không bắt buộc)
 *   description – mô tả ngắn hiển thị bên trái khu vực pill
 *   options     – mảng chuỗi các lựa chọn mặc định
 */

// ──────────────────────────────────────────────
// Công nghệ sử dụng  (dùng ở Step 4)
// ──────────────────────────────────────────────
export const techSections = [
    {
        id: 'backend',
        label: 'Backend',
        required: true,
        min: 1,
        description:
            'Xây dựng server, API và xử lý dữ liệu cho ứng dụng. Chọn các công nghệ bạn đã dùng để phát triển backend.',
        options: [
            'Java', 'Spring Boot', 'NodeJS', 'Express', 'NestJS',
            'FastAPI', 'Django', 'Flask', 'Laravel', 'Go',
            'Python', 'Ruby on Rails', 'GraphQL', 'REST API', 'gRPC',
        ],
    },
    {
        id: 'frontend',
        label: 'Frontend',
        required: true,
        min: 1,
        description:
            'Xây dựng giao diện người dùng và trải nghiệm tương tác. Chọn các framework và thư viện bạn thành thạo.',
        options: [
            'React', 'Vue', 'Angular', 'Next.js', 'Nuxt.js',
            'Svelte', 'TypeScript', 'JavaScript', 'HTML/CSS', 'Tailwind CSS',
            'Redux', 'Zustand', 'Vite', 'Webpack',
        ],
    },
    {
        id: 'uiux',
        label: 'UI/UX',
        required: true,
        min: 1,
        description:
            'Thiết kế giao diện và luồng trải nghiệm người dùng. Chọn công cụ và phương pháp bạn sử dụng.',
        options: [
            'Figma', 'Adobe XD', 'Sketch', 'InVision', 'Framer',
            'Photoshop', 'Illustrator', 'Protopie', 'Principle', 'Zeplin',
            'User Research', 'Wireframing', 'Prototyping',
        ],
    },
    {
        id: 'mobile',
        label: 'Mobile',
        required: false,
        min: 0,
        description:
            'Phát triển ứng dụng di động cho iOS và Android. Chọn nền tảng và framework bạn đã làm việc.',
        options: [
            'React Native', 'Flutter', 'Swift', 'Kotlin',
            'Expo', 'Ionic', 'iOS', 'Android',
        ],
    },
    {
        id: 'database',
        label: 'Database',
        required: false,
        min: 0,
        description:
            'Hệ thống lưu trữ và quản lý dữ liệu. Chọn các loại database bạn đã sử dụng trong dự án.',
        options: [
            'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite',
            'Firebase', 'Supabase', 'Elasticsearch', 'Cassandra', 'DynamoDB',
        ],
    },
    {
        id: 'devops',
        label: 'DevOps / Cloud',
        required: false,
        min: 0,
        description:
            'Triển khai, vận hành và tự động hoá hệ thống. Chọn các công cụ bạn đã sử dụng.',
        options: [
            'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
            'CI/CD', 'GitHub Actions', 'Jenkins', 'Nginx', 'Linux',
            'Terraform', 'Ansible',
        ],
    },
    {
        id: 'ai_ml',
        label: 'AI / ML',
        required: false,
        min: 0,
        description:
            'Trí tuệ nhân tạo và học máy. Chọn thư viện và framework bạn đã áp dụng trong dự án.',
        options: [
            'TensorFlow', 'PyTorch', 'scikit-learn', 'Keras', 'OpenCV',
            'Pandas', 'NumPy', 'LangChain', 'HuggingFace', 'YOLO',
            'Stable Diffusion', 'OpenAI API',
        ],
    },
]

// ──────────────────────────────────────────────
// Lĩnh vực quan tâm  (dùng ở Step 4)
// ──────────────────────────────────────────────
export const topicSections = [
    {
        id: 'topics',
        label: 'Lĩnh vực quan tâm',
        required: false,
        min: 0,
        description:
            'Chọn các lĩnh vực bạn muốn khám phá hoặc có kinh nghiệm làm việc.',
        options: [
            'FinTech', 'EdTech', 'HealthTech', 'AI/ML', 'Blockchain',
            'E-Commerce', 'SaaS', 'Gaming', 'AR/VR', 'IoT',
            'Open Source', 'Sustainability', 'Web3', 'Cybersecurity',
        ],
    },
]
