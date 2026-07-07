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
// Tất cả tech sections (toàn bộ map, dùng để filter)
// ──────────────────────────────────────────────
const ALL_TECH_SECTIONS = [
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
        required: true,
        min: 1,
        description:
            'Phát triển ứng dụng di động cho iOS và Android. Chọn nền tảng và framework bạn đã làm việc.',
        options: [
            'React Native', 'Flutter', 'Swift', 'Kotlin',
            'Expo', 'Ionic', 'iOS', 'Android',
        ],
    },
    {
        id: 'devops',
        label: 'DevOps / Cloud',
        required: true,
        min: 1,
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
        required: true,
        min: 1,
        description:
            'Trí tuệ nhân tạo và học máy. Chọn thư viện và framework bạn đã áp dụng trong dự án.',
        options: [
            'TensorFlow', 'PyTorch', 'scikit-learn', 'Keras', 'OpenCV',
            'Pandas', 'NumPy', 'LangChain', 'HuggingFace', 'YOLO',
            'Stable Diffusion', 'OpenAI API',
        ],
    },
    {
        id: 'testing',
        label: 'Tester / QA',
        required: true,
        min: 1,
        description:
            'Kiểm thử và đảm bảo chất lượng phần mềm. Chọn các công cụ và kỹ thuật bạn sử dụng.',
        options: [
            'Selenium', 'JUnit', 'Jest', 'Cypress', 'Postman',
            'JMeter', 'Appium', 'TestNG', 'Playwright', 'k6',
            'Manual Testing', 'Automation Testing',
        ],
    },
    {
        id: 'ba',
        label: 'Business Analysis',
        required: true,
        min: 1,
        description:
            'Phân tích yêu cầu và quản lý dự án phần mềm. Chọn các công cụ bạn thường dùng.',
        options: [
            'Jira', 'Confluence', 'Trello', 'Notion', 'Miro',
            'UML', 'BPMN', 'User Stories', 'Figma', 'Draw.io',
        ],
    },
    {
        // Section đặc biệt cho vị trí nhập thủ công — không có preset options
        id: '__other__',
        label: 'Vị trí khác',
        required: true,
        min: 1,
        description: 'Thêm công nghệ liên quan đến vị trí này.',
        options: [],
    },
]

/**
 * Map từ position value (MultiSelectDropdown) → sectionId trong TagPicker
 */
export const POSITION_TO_SECTION = {
    backend: 'backend',
    frontend: 'frontend',
    uiux: 'uiux',
    mobile: 'mobile',
    devops: 'devops',
    ai_ml: 'ai_ml',
    tester: 'testing',
    ba: 'ba',
    // 'custom:...' → '__other__' (xử lý ở runtime)
}

/**
 * Trả về danh sách tech sections tương ứng với các positions đã chọn.
 *
 * @param {string[]} positions — mảng position values từ MultiSelectDropdown
 *   (bao gồm cả 'custom:Tên vị trí' cho nhập thủ công)
 */
export function getFilteredSections(positions) {
    if (!positions || positions.length === 0) return []

    const sectionIds = new Set()
    let hasCustom = false

    for (const pos of positions) {
        if (typeof pos === 'string' && pos.startsWith('custom:')) {
            hasCustom = true
        } else {
            const id = POSITION_TO_SECTION[pos]
            if (id) sectionIds.add(id)
        }
    }

    const ordered = ALL_TECH_SECTIONS.filter(s => {
        if (s.id === '__other__') return false   // xử lý riêng bên dưới
        return sectionIds.has(s.id)
    })

    if (hasCustom) {
        ordered.push(ALL_TECH_SECTIONS.find(s => s.id === '__other__'))
    }

    return ordered
}

// ──────────────────────────────────────────────
// Lĩnh vực quan tâm  (dùng ở Step 4)
// ──────────────────────────────────────────────
export const topicOptions = [
    { value: 'fintech', label: 'FinTech' },
    { value: 'edtech', label: 'EdTech' },
    { value: 'healthtech', label: 'HealthTech' },
    { value: 'ai_ml', label: 'AI/ML' },
    { value: 'blockchain', label: 'Blockchain' },
    { value: 'ecommerce', label: 'E-Commerce' },
    { value: 'saas', label: 'SaaS' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'arvr', label: 'AR/VR' },
    { value: 'iot', label: 'IoT' },
    { value: 'opensource', label: 'Open Source' },
    { value: 'sustainability', label: 'Sustainability' },
    { value: 'web3', label: 'Web3' },
    { value: 'cybersecurity', label: 'Cybersecurity' },
]

